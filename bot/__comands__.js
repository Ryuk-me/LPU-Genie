const { ping } = require("./commands/ping")
const { sendUptime } = require("./commands/uptime")
const { help } = require("./commands/help")
const { Config } = require("./Config")
const { sendMessageToEveryUser } = require("./commands/admin/admin_commands")
const { userAttendance } = require("./commands/user/attendance")
const { userExams } = require("./commands/user/exams")
const { loginUser } = require("./commands/user/login")
const { userMakeupClass } = require("./commands/user/makeup.class")
const { userMessage } = require("./commands/user/message")
const { userEligibleDrives } = require("./commands/user/placement")
const { userProfile } = require("./commands/user/profile")
const { userSubjects } = require("./commands/user/subjects")
const { userTodayClasses } = require("./commands/user/today.class")
const { userPendingAssigments } = require("./commands/user/pending.assignments")
const { userAssigmentMarks } = require("./commands/user/assignments.marks")
const { userSearchUserOnLPULive } = require("./commands/user/search.user")
const { aboutGenie } = require("./commands/about")
const { sendCommandAfterAuth } = require("./service")
const { sendMessage } = require("./utils/messages")

async function commands({
	textMessage,
	userFromDB,
	sock,
	senderJID,
	msg,
	caption
}) {
	if (textMessage) {
		if (textMessage === Config.SUFFIX + "ping") {
			await ping({ sock, senderJID, reply_to: msg })
		} else if (textMessage === Config.SUFFIX + "help") {
			await help({ sock, senderJID, reply_to: msg })
		} else if (textMessage === Config.SUFFIX + "uptime") {
			await sendUptime({ sock, senderJID, reply_to: msg })
		} else if (textMessage.startsWith(Config.SUFFIX + "login")) {
			await loginUser({ sock, senderJID, reply_to: msg, textMessage })
		} else if (textMessage === Config.SUFFIX + "me") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userProfile
			})
		} else if (textMessage === Config.SUFFIX + "msg") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userMessage
			})
		} else if (textMessage === Config.SUFFIX + "exam") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userExams
			})
		} else if (textMessage === Config.SUFFIX + "sub") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userSubjects
			})
		} else if (textMessage === Config.SUFFIX + "today") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userTodayClasses
			})
		} else if (textMessage === Config.SUFFIX + "atten") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userAttendance
			})
		} else if (textMessage === Config.SUFFIX + "makeup") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userMakeupClass
			})
		} else if (textMessage === Config.SUFFIX + "drives") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userEligibleDrives
			})
		} else if (textMessage === Config.SUFFIX + "passign") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userPendingAssigments
			})
		} else if (textMessage === Config.SUFFIX + "amarks") {
			await sendCommandAfterAuth({
				sock,
				senderJID,
				reply_to: msg,
				userFromDB,
				funcion_name: userAssigmentMarks
			})
		} else if (textMessage === Config.SUFFIX + "about") {
			await aboutGenie({ sock, senderJID, reply_to: msg })
		} else if (textMessage.startsWith(Config.SUFFIX + "search")) {
			await userSearchUserOnLPULive({
				sock,
				senderJID,
				textMessage,
				reply_to: msg
			})
		} else if (
			textMessage === Config.SUFFIX + "fwd" &&
			senderJID === Config.ADMIN + "@s.whatsapp.net"
		) {
			await sendMessageToEveryUser({
				sock,
				senderJID,
				textMessage: msg,
				caption
			})
		} else {
			await sendMessage({
				sock,
				senderJID,
				textMessage:
					"Use Command *" + Config.SUFFIX + "help* to list available commands",
				reply_to: msg
			})
		}
	}
}

module.exports = {
	commands
}
