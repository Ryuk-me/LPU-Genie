const axios = require("axios")
const { Config } = require("../Config")

const axiosClient = axios.create({
	baseURL: Config.BASE_API,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json"
	}
})

function makePostReq(url, data) {
	return axiosClient.post(url, JSON.stringify(data))
}

function makeGetReq(url) {
	return axiosClient.get(url)
}

module.exports = {
	axiosClient,
	makePostReq,
	makeGetReq
}
