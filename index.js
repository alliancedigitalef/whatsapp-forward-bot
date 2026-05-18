const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ================= CONFIGURATION =================
const SOURCE_GROUP = 'ID_GROUPE_AMI@g.us';      // À remplacer plus tard
const TARGET_GROUP = 'ID_VOTRE_GROUPE@g.us';   // À remplacer plus tard
// ================================================

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote'
        ],
        executablePath: '/usr/bin/chromium-browser'
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 Scannez ce QR Code avec votre WhatsApp :\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot connecté avec succès !');
    console.log('🔄 Transfert automatique activé');
});

client.on('message', async (message) => {
    if (message.from === SOURCE_GROUP) {
        try {
            const contact = await message.getContact();
            const header = `📢 *Nouvelle annonce*\nDe : ${contact.pushname || contact.number}\n──────────────────\n`;

            if (message.hasMedia) {
                const media = await message.downloadMedia();
                await client.sendMessage(TARGET_GROUP, media, { caption: header + (message.body || '') });
            } else if (message.body && message.body.trim() !== '') {
                await client.sendMessage(TARGET_GROUP, header + message.body);
            }
            console.log('✅ Message transféré avec succès');
        } catch (err) {
            console.error('❌ Erreur lors du transfert:', err.message);
        }
    }
});

client.initialize();
