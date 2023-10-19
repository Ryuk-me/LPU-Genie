async function sendMessage({ sock, senderJID, textMessage, reply_to }) {
	let msg = await sock.sendMessage(
		senderJID,
		{ text: textMessage },
		{ quoted: reply_to }
		// { quoted: reply_to, ephemeralExpiration: 86400 },
	)
	return msg
}

async function editMessage({
	sock,
	senderJID,
	sent_msg,
	textMessage,
	reply_to
}) {
	await sock.sendMessage(
		senderJID,
		{ edit: sent_msg.key, text: textMessage },
		{ quoted: reply_to }
	)
}

module.exports = {
	sendMessage,
	editMessage
}
