const { sendMessage } = require("../utils/messages")
const { Config } = require("../Config")

async function aboutGenie({ sock, senderJID, reply_to }) {
	let txtMsg = `
*${Config.BOT_NAME}* is a WhatsApp BOT created to help students at Lovely Professional University (LPU) to manage their academic life more efficiently.

*Developed By*: Neeraj Kumar

*GitHub Repository*: https://github.com/Ryuk-me/LPU-Genie

Thank you for using this BOT 💖.
`
	await sendMessage({ sock, senderJID, textMessage: txtMsg, reply_to })
}

module.exports = {
	aboutGenie
}
