const {
	DisconnectReason,
	useMultiFileAuthState,
	isJidUser
} = require("@whiskeysockets/baileys")
const makeWASocket = require("@whiskeysockets/baileys").default
const { getUserByWhatsappNumber } = require("./service")
const { commands } = require("./__comands__")
const { cronStartDrives } = require("./worker")

async function connectToWhatsApp() {
	const { state, saveCreds } = await useMultiFileAuthState("account")
	const sock = makeWASocket({
		printQRInTerminal: true,
		auth: state,
		shouldIgnoreJid: (jid) => !isJidUser(jid)
	})

	sock.ev.on("connection.update", async (update) => {
		const { connection, lastDisconnect, qr } = update || {}
		if (qr) {
			console.log(qr)
		}
		if (connection === "close") {
			const shouldReconnect =
				lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
			console.log(
				"connection closed due to ",
				lastDisconnect.error,
				", reconnecting ",
				shouldReconnect
			)
			// reconnect if not logged out
			if (shouldReconnect) {
				connectToWhatsApp()
			}
		} else if (connection === "open") {
			console.log("opened connection")
			cronStartDrives({ sock })
		}
	})

	sock.ev.on("creds.update", async () => {
		await saveCreds()
	})

	sock.ev.on("messages.upsert", async ({ messages, type }) => {
		if (type === "notify" && !messages[0]?.key?.fromMe) {
			for (const msg of messages) {
				const senderJID = msg?.key?.remoteJid
				let userFromDB = await getUserByWhatsappNumber({
					whatsapp_number: senderJID
				})
				const body =
					msg?.message?.ephemeralMessage?.message ||
					msg?.message?.viewOnceMessageV2?.message ||
					msg?.message?.editedMessage?.message?.protocolMessage
						?.editedMessage ||
					msg?.message?.viewOnceMessage?.message ||
					msg?.message
				const textMessage =
					body?.extendedTextMessage?.text ||
					body?.imageMessage?.caption ||
					body?.conversation ||
					body?.videoMessage?.caption ||
					body?.reactionMessage?.text

				await commands({
					textMessage,
					userFromDB,
					sock,
					senderJID,
					msg
				})
			}
		}
	})
}
connectToWhatsApp()
