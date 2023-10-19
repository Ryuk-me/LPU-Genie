const { sendMessage, editMessage } = require("../../utils/messages")
const {
	addNewUser,
	updateCookie,
	getUserByRegNumber
} = require("../../service")
const { postLogin_UMS_HOME } = require("../../network/user")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { maskPhoneNumber } = require("../../utils/mask_phone_number")
const { Config } = require("../../Config")

async function loginUser({ sock, senderJID, textMessage, reply_to }) {
	let split_msg = textMessage.replace(Config.SUFFIX + "login", "").split("|")
	if (split_msg.length == 2) {
		let reg_no = split_msg[0].trim()
		let password = split_msg[1].trim()
		let sent_msg = await sendMessage({
			sock,
			senderJID,
			textMessage: "_Logging you in please wait._",
			reply_to
		})
		let userByReg = await getUserByRegNumber({
			reg_no: reg_no
		})
		if (userByReg === null) {
			let res = undefined
			let statusCode = undefined
			try {
				res = await postLogin_UMS_HOME({ reg_no, password })
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
				let cookie = response.data?.cookie
				await addNewUser({
					reg_no: reg_no,
					password: password,
					cookie: cookie,
					whatsapp_number: senderJID
				})
				let txtMsg = `*Login Successful.*\nYour account has been *created*.\nUse command *${Config.SUFFIX}me* to check profile.`
				await editMessage({
					sock,
					senderJID,
					sent_msg,
					textMessage: txtMsg,
					reply_to
				})
			}
		} else if (
			userByReg.whatsapp_number === senderJID &&
			userByReg.registration_number === reg_no
		) {
			let res = undefined
			let statusCode = undefined
			try {
				res = await postLogin_UMS_HOME({ reg_no, password })
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
				let cookie = response.data?.cookie
				if (decryptString(userByReg.ums_cookie) !== cookie) {
					await updateCookie({ coookie: cookie, reg_no: reg_no })
				}
				let txtMsg = `*Login Successful*\nUse command *${Config.SUFFIX}me* to check profile.`
				await editMessage({
					sock,
					senderJID,
					sent_msg,
					textMessage: txtMsg,
					reply_to
				})
			}
		} else {
			let txtMsg = `*This registration number is already registered with phone number :* ${maskPhoneNumber(
				{ phoneNumber: userByReg.whatsapp_number, leave: 2 }
			)}`
			await editMessage({
				sock,
				senderJID,
				sent_msg,
				textMessage: txtMsg,
				reply_to
			})
		}
	} else {
		let txtMsg =
			"*Wrong format* please follow below format\n\n*" +
			Config.SUFFIX +
			"login reg_no|password*"
		await sendMessage({ sock, senderJID, textMessage: txtMsg, reply_to })
	}
}

module.exports = {
	loginUser
}
