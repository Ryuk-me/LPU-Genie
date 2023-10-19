const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetTodaysClass } = require("../../network/timetable")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userTodayClasses({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching your today's class/es please wait._",
		reply_to
	})
	try {
		res = await postGetTodaysClass({
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
		if (user?.today_time_table && user?.today_time_table.length > 0) {
			let total_classes = 1
			let misc_details = user?.misc_details
			let temp_msg = "\n"
			for (const class_ of user.today_time_table) {
				let cc = class_["course_code"]
				let courseName = misc_details[cc]["subject_name"]
				let agg_attendance = misc_details[cc]["agg_attendance"]
				let roll_number = misc_details[cc]["roll_no"]
				let section = misc_details[cc]["section"]
				let room_number = class_["room_number"]
				let classTiming = class_["timing"]
				let attendance_status = class_["attendance_status"]

				temp_msg += `${total_classes}. *${courseName}* [${cc}]
  └── *Room*:  ${room_number}
  └── *Timing*:  ${classTiming}
  └── *Attendance*:  ${agg_attendance}
  └── *Roll*:  ${roll_number}
  └── *Section*:  ${section}
  └── *Attendance Status*:  ${
		attendance_status != "" ? attendance_status : "NA"
	}\n
`
				total_classes++
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
				textMessage: "*Class Not Found.*",
				reply_to
			})
		}
	}
}

module.exports = {
	userTodayClasses
}
