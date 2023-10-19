const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetUserMakeup } = require("../../network/timetable")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userMakeupClass({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching make up class details please wait._",
		reply_to
	})
	try {
		res = await postGetUserMakeup({
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
		if (user?.makeup && user?.makeup.length > 0) {
			let counter = 1
			let temp_msg = ""

			for (const makeup of user.makeup) {
				temp_msg += `
*Course Code*: ${makeup["course_code"]}
*Date*: ${makeup["scheduled_date"]}
*Time*: ${makeup["lecture_time"]}
*Room no.*: ${makeup["room_no"]}
*Group*: ${makeup["group_no"]}
*Section*: ${makeup["section"]}
*Type*: ${makeup["attendance_type"]}
*Teacher*: ${makeup["taken_by"]}
⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺
`
			}

			await editMessage({
				sock,
				senderJID,
				sent_msg,
				textMessage: temp_msg,
				reply_to
			})
			await sleep(200)
			counter++
		}
	} else {
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: "*Makeup Not Found.*",
			reply_to
		})
	}
}

module.exports = {
	userMakeupClass
}
