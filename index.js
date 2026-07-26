const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// إعداد الواتساب ليعمل بسلاسة على خوادم Render عبر Docker
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // مهم جداً لتقليل استهلاك الرام في الخطة المجانية
            '--disable-gpu'
        ]
    }
});

// عرض كود QR في موجه الأوامر (Logs)
client.on('qr', (qr) => {
    console.log('====== قم بمسح كود QR التالي ======');
    qrcode.generate(qr, { small: true });
});

// رسالة تأكيد عند نجاح الاتصال
client.on('ready', () => {
    console.log('✅ تم الاتصال بحساب الواتساب بنجاح! الـ API جاهز.');
});

// المسار الخاص بفحص الأرقام
app.post('/api/check', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'الرجاء توفير رقم الهاتف (phone)' });
    }

    try {
        // إضافة اللاحقة الخاصة بواتساب للرقم
        const chatId = `${phone}@c.us`; 
        
        // فحص ما إذا كان الرقم موجوداً في واتساب
        const isRegistered = await client.isRegisteredUser(chatId);
        
        res.json({ 
            success: true, 
            registered: isRegistered 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'حدث خطأ أثناء الفحص'
        });
    }
});

// بدء تشغيل الواتساب
client.initialize();

// استخدام المنفذ الذي يحدده Render، مع السماح بالاتصال الخارجي عبر '0.0.0.0'
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 الخادم يعمل الآن على المنفذ ${PORT}`);
});
