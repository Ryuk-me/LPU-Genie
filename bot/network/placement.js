const { makePostReq } = require("../utils/api.client")

async function postGetUserEligibleDrives({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/placement/drives", { reg_no, password, cookie })
}

async function postGetPlacementHomePage({ reg_no, password, cookie }) {
	return makePostReq("/api/v1/placement", { reg_no, password, cookie })
}

module.exports = {
	postGetPlacementHomePage,
	postGetUserEligibleDrives
}
