const { sendMessage, editMessage } = require("../../utils/messages")
const { updateCookie } = require("../../service")
const { postGetUserAssignmentMarks } = require("../../network/user")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userAssigmentMarks({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching your assignment/s marks please wait._",
		reply_to
	})
	try {
		res = await postGetUserAssignmentMarks({
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
		if (user?.theory || user?.practical) {
			let temp_msg = "*Theory Marks*\n"
			if (user?.theory && user?.theory.length > 0) {
				for (const theory of user.theory) {
					let type_ = theory.type
					if (type_ === "Lecture Notes") continue
					let cc = theory.course_code
					let facultyName = theory.faculty_name
					let uploadDate = theory.upload_date
					let submissionDate = theory.submission_date
					let submissionType = theory.submission_type
					let topic = theory.topic
					let teacherComments = theory.teacher_comments
					let guidelinesByTeacher = theory.assignment_download_url
					let assignmentUploadedByStudent =
						theory.assignment_uploaded_by_student
					let marksObtained = theory.marks_obtained
					let totalMarks = theory.total_marks

					//! Dont send if type === "Lecture Notes"
					temp_msg += `
*${cc}* - ${facultyName}
*Topic*: ${topic}
*Marks*: ${marksObtained} / ${totalMarks}
*Submission Date*: ${submissionDate}
*Submission Type*: ${submissionType}
*Comments*: ${teacherComments !== "" ? teacherComments : "_NA_"}  
*Guidelines*: ${guidelinesByTeacher !== "" ? guidelinesByTeacher : "_NA_"} 
*Student Uploaded File*: ${
						assignmentUploadedByStudent !== ""
							? assignmentUploadedByStudent
							: "_NA_"
					}
⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺                        
`
					await editMessage({
						sock,
						senderJID,
						sent_msg,
						textMessage: temp_msg,
						reply_to
					})
				}
			}
			if (user?.practical && user?.practical.length > 0) {
				temp_msg += "\n*Practical marks*\n"
				for (const practical of user.practical) {
					let cc = practical.course_code
					let facultyName = practical.faculty_name
					let title = practical.title
					let marks_obtained = practical.marks_obtained
					let total_marks = practical.total_marks
					let assignment_uploaded_by_student =
						practical.assignment_uploaded_by_student
					temp_msg += `
*${cc}* - ${facultyName}
*Title*: ${title}
*Marks*: ${marks_obtained} / ${total_marks}
*Assignment Uploaded*: ${
						assignment_uploaded_by_student !== ""
							? assignment_uploaded_by_student
							: "_NA_"
					}
⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺ 
`
					await editMessage({
						sock,
						senderJID,
						sent_msg,
						textMessage: temp_msg,
						reply_to
					})
				}
			}
		}
	} else {
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: "*Assignment/s Marks Not Found.*",
			reply_to
		})
	}
}

module.exports = {
	userAssigmentMarks
}
