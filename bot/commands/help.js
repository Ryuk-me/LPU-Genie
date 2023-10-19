const { Config } = require("../Config")
const { sendMessage } = require("../utils/messages")

async function help({ sock, senderJID, reply_to }) {
	let txtMsg = `
\t⚡ *LPU-Genie Command Center* ⚡

*${Config.SUFFIX}help ⤑* List available commands.
*${Config.SUFFIX}ping ⤑* Check BOT status.
*${Config.SUFFIX}login ⤑* Log in to your UMS account.
   └── *Hint*\t ${Config.SUFFIX}login reg_no|pswd
*${Config.SUFFIX}me ⤑* Get your profile details.
*${Config.SUFFIX}msg ⤑* Retrieve your messages.
*${Config.SUFFIX}exam ⤑* View upcoming exams.
*${Config.SUFFIX}sub ⤑* Explore all subjects.
*${Config.SUFFIX}today ⤑* Discover today's class details.
*${Config.SUFFIX}atten ⤑* Get your attendance details.
*${Config.SUFFIX}makeup ⤑* Retrieve information about makeup classes.
*${Config.SUFFIX}drives ⤑* Find details about upcoming placement drives.
*${Config.SUFFIX}passign ⤑* Check for pending assignments.
*${Config.SUFFIX}amarks ⤑* View Assignments marks theory/practical.
*${Config.SUFFIX}search ⤑* Search user by Registration Number.
   └── *Hint*\t ${Config.SUFFIX}search 1234
*${Config.SUFFIX}about ⤑* Know Me.
`
	await sendMessage({ sock, senderJID, textMessage: txtMsg, reply_to })
}
module.exports = {
	help
}
