FROM node:18

# تثبيت ملفات النظام الأساسية لتشغيل متصفح Chromium في الخلفية
RUN apt-get update && apt-get install -y \
    libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 \
    libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 \
    libatk1.0-0 libatk-bridge2.0-0 libpangocairo-1.0-0 libgtk-3-0 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# نسخ ملفات المشروع وتثبيت المكتبات
COPY package*.json ./
RUN npm install

# نسخ باقي الأكواد
COPY . .

# فتح المنفذ وتشغيل المشروع
EXPOSE 3000
CMD ["node", "index.js"]
