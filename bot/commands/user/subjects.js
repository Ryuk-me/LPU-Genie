const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetUserSyllabus } = require("../../network/user")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userSubjects({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching your subjects please wait._",
		reply_to
	})
	try {
		res = await postGetUserSyllabus({
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
		if (user?.course) {
			let temp_msg = "📚 *Subjects*\n\n"
			let data = user
			let t_subjects = 1
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					const value = data[key]
					if (typeof value === "object") {
						for (const subKey in value) {
							if (value.hasOwnProperty(subKey)) {
								const subValue = value[subKey]
								temp_msg += `
${t_subjects}. *${subValue.course_name}* [${subValue.course_code}]
\t└── *Attendance*:\t${subValue.agg_attendance}\n`
								await editMessage({
									sock,
									senderJID,
									sent_msg,
									textMessage: temp_msg,
									reply_to
								})
								await sleep(200)
							}
							t_subjects++
						}
					}
				}
			}
		} else {
			await editMessage({
				sock,
				senderJID,
				sent_msg,
				textMessage: "*Subjects Not Found.*",
				reply_to
			})
		}
	}
}

module.exports = {
	userSubjects
}
