const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetUserExams } = require("../../network/user")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userExams({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching your exams please wait._",
		reply_to
	})
	try {
		res = await postGetUserExams({
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
		if (user?.exams && user?.exams.length > 0) {
			let temp_msg = ""
			for (const exam of user.exams) {
				temp_msg += `
📚 *${exam.course_name}* _[${exam.course_code}]_
📅 *Date*:  ${exam.date}
📝 *Type*:  ${exam.exam_type}
🏫 *Room*:  ${exam.room_no}
🕒 *Time*:  ${exam.time}
📢 *Report*:  ${exam.reporting_time}
`
				let detainee_status = exam.detainee_status
				let defaulter_detail = exam.defaulter_detail
				if (detainee_status !== "") {
					temp_msg += `*Detainee status*:  ${detainee_status}\n`
				}
				if (defaulter_detail !== "") {
					temp_msg += `*Defaulter detail*:  ${defaulter_detail}\n`
				}
				temp_msg += "⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺\n"
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
				textMessage: "*Exam/s Not Found.*",
				reply_to
			})
		}
	}
}

module.exports = {
	userExams
}
