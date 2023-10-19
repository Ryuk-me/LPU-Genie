const { uptime } = require("../utils/uptime")
const { sendMessage } = require("../utils/messages")

async function sendUptime({ sock, senderJID, reply_to }) {
	let time = await uptime()
	let txtMsg = "```BOT is up for : " + time + "```"
	await sendMessage({ sock, senderJID, textMessage: txtMsg, reply_to })
}

module.exports = {
	sendUptime
}
