const { Config } = require("../../Config")
const { sendMessage, editMessage } = require("../../utils/messages")
const { getAllUsers } = require("../../service")
const { sleep } = require("../../utils/sleep")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { writeFile, unlink } = require("node:fs/promises")

async function sendMessageToEveryUser({ sock, senderJID, textMessage }) {
	/*TODO
        - Add Ban check before forwarding the  message to the user.
    */

	let quotedMsg =
		textMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage
	let msgType = Object.keys(quotedMsg)
	let stream = undefined
	let caption_ = undefined
	let mimeType = undefined
	let isVideo = false
	let isImage = false
	let isGIF = false
	let isDocument = false
	let fileName = undefined

	let users = await getAllUsers()
	if (users.length === 0) {
		await sendMessage({
			sock,
			senderJID,
			textMessage: "*Users not found*.",
			reply_to: textMessage
		})
	} else {
		if (msgType[0] === "conversation") {
			for (const user of users) {
				await sendMessage({
					sock,
					senderJID: user.whatsapp_number,
					textMessage: quotedMsg?.conversation
				})
			}
		} else if (msgType[0] === "imageMessage") {
			stream = await downloadContentFromMessage(
				quotedMsg["imageMessage"],
				"image"
			)
			mimeType = quotedMsg?.imageMessage?.mimetype
			caption_ = quotedMsg?.imageMessage?.caption
			isImage = true
		} else if (msgType[0] === "videoMessage") {
			let keys = Object.keys(quotedMsg?.videoMessage)
			for (let key of keys) {
				if (key === "gifAttribution") {
					isGIF = true
					break
				}
			}
			stream = await downloadContentFromMessage(
				quotedMsg["videoMessage"],
				isGIF ? "gif" : "video"
			)
			mimeType = quotedMsg?.videoMessage?.mimetype
			caption_ = quotedMsg?.videoMessage?.caption
			isVideo = true
		} else if (
			msgType[0] === "documentWithCaptionMessage" ||
			msgType[0] === "documentMessage"
		) {
			caption_ =
				quotedMsg?.documentWithCaptionMessage?.message?.documentMessage
					?.caption || ""
			fileName =
				quotedMsg?.documentWithCaptionMessage?.message?.documentMessage
					?.fileName || quotedMsg?.documentMessage?.fileName
			mimeType =
				quotedMsg?.documentWithCaptionMessage?.message?.documentMessage
					?.mimetype || quotedMsg?.documentMessage?.mimetype
			let dlMsg =
				quotedMsg?.documentWithCaptionMessage?.message?.documentMessage ||
				quotedMsg?.documentMessage
			isDocument = true
			stream = await downloadContentFromMessage(dlMsg, "document")
		}
		if (stream) {
			let buffer = Buffer.from([])
			for await (const chunk of stream) {
				buffer = Buffer.concat([buffer, chunk])
			}
			let randomName = (Math.random() + 1).toString(36).substring(7)
			fileName = isDocument ? fileName : `${randomName}`
			await writeFile(fileName, buffer)

			if (isImage) {
				for (const user of users) {
					await sock.sendMessage(user.whatsapp_number, {
						image: {
							url: fileName
						},
						caption: caption_,
						mimetype: mimeType
					})
				}
			} else if (isVideo) {
				for (const user of users) {
					await sock.sendMessage(user.whatsapp_number, {
						video: {
							url: fileName
						},
						caption: caption_,
						gifPlayback: isGIF,
						mimetype: mimeType
					})
				}
			} else if (isDocument) {
				for (const user of users) {
					await sock.sendMessage(user.whatsapp_number, {
						document: {
							url: fileName
						},
						fileName,
						caption: caption_,
						mimetype: mimeType
					})
				}
			}
			await unlink(fileName)
		}
		await sendMessage({
			sock,
			senderJID,
			textMessage: `*Message Sent* to ${users.length}`,
			reply_to: textMessage
		})
	}
}
module.exports = {
	sendMessageToEveryUser
}
