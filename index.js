const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// إعداد الواتساب ليعمل بسلاسة على خوادم Render
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
            '--single-process', // يقلل استهلاك الرام
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('====== قم بمسح كود QR التالي ======');
    qrcode.generate(qr, { small: true });
});

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
        const chatId = `${phone}@c.us`; 
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

client.initialize();

// استخدام المنفذ الذي يحدده Render أو 3000 محلياً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل الآن على المنفذ ${PORT}`);
});
