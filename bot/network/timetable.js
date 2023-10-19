const { makePostReq } = require("../utils/api.client")

async function postGetTodaysClass({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/timetable/today", { reg_no, password, cookie })
}
async function postGetUserMakeup({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/timetable/makeup", { reg_no, password, cookie })
}

module.exports = {
	postGetTodaysClass,
	postGetUserMakeup
}
