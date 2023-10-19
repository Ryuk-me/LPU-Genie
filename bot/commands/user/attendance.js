const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetUserAttendance } = require("../../network/user")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userAttendance({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching your attendance please wait._",
		reply_to
	})
	try {
		res = await postGetUserAttendance({
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
		if (user?.summary && user?.summary.length > 0) {
			let temp_msg = ""
			let counter = 1
			for (const class_ of user?.summary) {
				temp_msg += `
${counter}. ${class_["subject_name"]} [${class_["subject_code"]}]
  └── *Agg. Attendance*: ${class_["agg_attendance"]}%
  └── *Attended/Delivered*: ${class_["total_attended"]}/${class_["total_delivered"]}
  └── *Duty Leaves*: ${class_["duty_leaves"]}
  └── *Last Attended*: ${class_["last_attended"]}
`
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
			temp_msg += `
*Total Duty Leaves*: ${user["attendance_details"]["total_duty_leaves"]}
*Total Attended/Delivered*: ${user["attendance_details"]["total_lectures_attended"]}/${user["attendance_details"]["total_lectures_delivered"]}
*Aggregate Attendance*: ${user["attendance_details"]["total_agg_attendance"]}%`
			await editMessage({
				sock,
				senderJID,
				sent_msg,
				textMessage: temp_msg,
				reply_to
			})
		}
	} else {
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: "*Attendance Not Found.*",
			reply_to
		})
	}
}

module.exports = {
	userAttendance
}
