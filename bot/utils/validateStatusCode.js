const { editMessage } = require("./messages")

async function validateStatusCode({
	sock,
	senderJID,
	statusCode,
	res,
	reply_to,
	sent_msg
}) {
	if (statusCode >= 200 && statusCode <= 299) {
		return { status: true, data: res?.data }
	} else if (statusCode >= 400 && statusCode <= 499) {
		let txtMsg = `*${res.data?.detail}*`
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: txtMsg,
			reply_to
		})
		return { status: false, data: null }
	} else if (statusCode >= 500 && statusCode <= 599) {
		let txtMsg = "*Server error occured*\n*Please try after some time.*"
		await editMessage({
			sock,
			sent_msg,
			senderJID,
			textMessage: txtMsg,
			reply_to
		})
		return { status: false, data: null }
	} else {
		let txtMsg = "*Unknow error occured*\n*Please try after some time.*"
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: txtMsg,
			reply_to
		})
		return { status: false, data: null }
	}
}

module.exports = {
	validateStatusCode
}
