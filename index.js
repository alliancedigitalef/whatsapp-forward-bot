const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ================= CONFIGURATION =================
const SOURCE_GROUP = 'ID_GROUPE_AMI@g.us';
const TARGET_GROUP = 'ID_VOTRE_GROUPE@g.us';
// ================================================

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),

    puppeteer: {
        headless: true,

        executablePath:
            process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',

        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote'
        ]
    }
});

// QR CODE
client.on('qr', (qr) => {
    console.log('\n📱 Scan ce QR Code avec WhatsApp :\n');
    qrcode.generate(qr, { small: true });
});

// BOT CONNECTÉ
client.on('ready', () => {
    console.log('✅ Bot connecté avec succès');
    console.log('🔄 Transfert automatique activé');
});

// TRANSFERT DES MESSAGES
client.on('message', async (message) => {
    if (message.from === SOURCE_GROUP) {

        try {
            const contact = await message.getContact();

            const header =
                `📢 *Nouvelle annonce*\n` +
                `De : ${contact.pushname || contact.number}\n` +
                `──────────────────\n`;

            // MESSAGE AVEC IMAGE / VIDÉO
            if (message.hasMedia) {

                const media = await message.downloadMedia();

                await client.sendMessage(
                    TARGET_GROUP,
                    media,
                    {
                        caption: header + (message.body || '')
                    }
                );

            }

            // MESSAGE TEXTE
            else if (message.body && message.body.trim() !== '') {

                await client.sendMessage(
                    TARGET_GROUP,
                    header + message.body
                );

            }

            console.log('✅ Message transféré');

        } catch (err) {

            console.error('❌ Erreur :', err);

        }
    }
});

// DÉMARRAGE
client.initialize();
