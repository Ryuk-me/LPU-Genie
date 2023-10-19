function maskPhoneNumber({ phoneNumber, leave }) {
	phoneNumber = String(phoneNumber).replace("@s.whatsapp.net", "")

	const phoneNumberArray = phoneNumber.split("")

	for (let i = leave + 2; i < phoneNumberArray.length; i++) {
		phoneNumberArray[i] = "x"
	}
	phoneNumber = phoneNumberArray.join("")

	return phoneNumber
}

module.exports = {
	maskPhoneNumber
}
