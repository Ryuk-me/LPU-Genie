const { makePostReq, makeGetReq } = require("../utils/api.client")

async function postLogin_UMS_HOME({ reg_no, password }) {
	return makePostReq("/api/v1/user/login", { reg_no, password })
}

async function postGetMe({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/me", { reg_no, password, cookie })
}

async function postGetUserMessages({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/messages", { reg_no, password, cookie })
}
async function postGetUserExams({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/exams", { reg_no, password, cookie })
}

async function postGetUserCGPA({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/cgpa", { reg_no, password, cookie })
}

async function postGetUserSyllabus({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/syllabus", { reg_no, password, cookie })
}

async function postGetUserAttendance({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/attendance", { reg_no, password, cookie })
}

async function postGetUserPendingAssignments({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/pending_assignments", {
		reg_no,
		password,
		cookie
	})
}

async function postGetUserAssignmentMarks({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/user/assignments", {
		reg_no,
		password,
		cookie
	})
}

async function getSearchUserOnLpuLive({ user_id }) {
	return makeGetReq("/api/v1/misc/search_user?id=" + user_id)
}

module.exports = {
	postLogin_UMS_HOME,
	postGetMe,
	postGetUserMessages,
	postGetUserExams,
	postGetUserCGPA,
	postGetUserSyllabus,
	postGetUserAttendance,
	postGetUserPendingAssignments,
	getSearchUserOnLpuLive,
	postGetUserAssignmentMarks
}
