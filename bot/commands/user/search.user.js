const { sendMessage, editMessage } = require("../../utils/messages")
const { getSearchUserOnLpuLive } = require("../../network/user")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { Config } = require("../../Config")

async function userSearchUserOnLPULive({
	sock,
	senderJID,
	textMessage,
	reply_to
}) {
	let user = textMessage
		.replace(Config.SUFFIX + "search", "")
		.trim()
		.split(" ")
		.join(" ")
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching user's details please wait._",
		reply_to
	})
	try {
		res = await getSearchUserOnLpuLive({ user_id: user })
		statusCode = res.status
	} catch (error) {
		statusCode = error?.response?.status || 500
		res = error?.response
	}
	let response = await validateStatusCode({
		sock,
		senderJID,
		statusCode,
		res,
		reply_to,
		sent_msg
	})
	if (response.status) {
		let user = response.data
		if (user?.users && user?.users.length > 0) {
			let u = user.users[0]
			let caption_ = `*${u.full_name}*\n${u.department}\n`
			await sock.sendMessage(
				senderJID,
				{
					image: {
						url: u.user_image
					},
					caption: caption_,
					mimetype: "image/jpeg"
				},
				{ quoted: reply_to }
			)
		}
	} else {
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: "*User with " + user + " registration number not found.*",
			reply_to
		})
	}
}

module.exports = {
	userSearchUserOnLPULive
}
