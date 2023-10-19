const { Config } = require("../Config")
const { sendMessage } = require("../utils/messages")

async function ping({ sock, senderJID, reply_to }) {
	let txtMsg = "pong" + Config.SUFFIX
	await sendMessage({ sock, senderJID, textMessage: txtMsg, reply_to })
}
module.exports = {
	ping
}
