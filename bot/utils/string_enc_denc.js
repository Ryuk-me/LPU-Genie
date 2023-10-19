const { Config } = require("../Config")

const CryptoJS = require("crypto-js")

function encryptString(message) {
	const encrypted = CryptoJS.AES.encrypt(message, Config.STRING_SECRET_KEY)
	return encrypted.toString()
}

function decryptString(encryptedMessage) {
	const decrypted = CryptoJS.AES.decrypt(
		encryptedMessage,
		Config.STRING_SECRET_KEY
	)
	return decrypted.toString(CryptoJS.enc.Utf8)
}

module.exports = {
	encryptString,
	decryptString
}
