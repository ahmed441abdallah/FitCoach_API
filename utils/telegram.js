// مسار الملف: utils/telegram.js

export const sendTelegramAlert = async (message) => {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            console.log("⚠️ Telegram credentials are missing in .env");
            return;
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML' // يتيح لك استخدام الـ Bold والروابط
            })
        });

        if (!response.ok) {
            console.error("❌ Failed to send Telegram message", await response.text());
        }
    } catch (error) {
        console.error("❌ Telegram Alert Error:", error.message);
    }
};