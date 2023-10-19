const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetMe } = require("../../network/user")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")

async function userProfile({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching your profile please wait._",
		reply_to
	})

	try {
		res = await postGetMe({
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
		let txtMsg = `
👤 *Name*:  _${user.name}_
📋 *Reg. Number*:  _${user.registration_number}_
🎓 *Program*:  _${user.program}_
📚 *Section*:  _${user.section}_
🎂 *Date of Birth*:  _${user.dob.split(" ")[0]}_
📊 *Attendance*:  _${user.agg_attendance}%_
🔢 *Roll No.*:  _${user.roll_number}_
📈 *CGPA*:  _${user.cgpa}_
📞 *Phone*:  _${user.phone.split(":")[0]}_
`
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: txtMsg,
			reply_to
		})
	}
}

module.exports = {
	userProfile
}
