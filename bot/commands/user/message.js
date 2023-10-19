const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetUserMessages } = require("../../network/user")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userMessage({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching your messages please wait._",
		reply_to
	})
	try {
		res = await postGetUserMessages({
			reg_no: userFromDB.registration_number,
			password: decryptString(userFromDB.password),
			cookie: decryptString(userFromDB.ums_cookie)
		})
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
		if (user?.cookie !== decryptString(userFromDB.ums_cookie)) {
			await updateCookie({
				coookie: user.cookie,
				reg_no: userFromDB.registration_number
			})
		}
		if (user?.messages && user?.messages.length > 0) {
			let temp_msg = ""
			for (let i = 0; i < user.messages.length / 3; i++) {
				const msg = user.messages[i]
				temp_msg += `💬 *${msg.title}*\n\n${msg.message}\n⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺\n\n`
				await editMessage({
					sock,
					senderJID,
					sent_msg,
					textMessage: temp_msg,
					reply_to
				})
				await sleep(200)
			}
		} else {
			await editMessage({
				sock,
				senderJID,
				sent_msg,
				textMessage: "*Message/s Not Found.*",
				reply_to
			})
		}
	}
}

module.exports = {
	userMessage
}
