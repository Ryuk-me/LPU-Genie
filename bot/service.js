const { db } = require("./database")
const { encryptString } = require("./utils/string_enc_denc")
const { sendMessage } = require("./utils/messages")

async function addNewUser({ reg_no, password, cookie, whatsapp_number }) {
	let nUser = await db.user.create({
		data: {
			registration_number: reg_no,
			password: encryptString(password),
			ums_cookie: encryptString(cookie),
			whatsapp_number: whatsapp_number
		}
	})
	return nUser ? true : false
}

async function getUserByRegNumber({ reg_no }) {
	let user = await db.user.findUnique({
		where: {
			registration_number: reg_no
		}
	})
	return user
}

async function getUserByRegNumberAndPhoneNumber({ reg_no, phone_number }) {
	let user = await db.user.findUnique({
		where: {
			registration_number: reg_no,
			whatsapp_number: phone_number
		}
	})
	return user
}

async function isUserBanned({ reg_no }) {
	let user = await getUserByRegNumber({ reg_no })
	return user.is_permanent_ban
}

async function getUserByWhatsappNumber({ whatsapp_number }) {
	let user = await db.user.findUnique({
		where: {
			whatsapp_number: whatsapp_number
		}
	})
	return user
}

async function updateCookie({ coookie, reg_no }) {
	const updatedCookie = await db.user.update({
		where: {
			registration_number: reg_no
		},
		data: {
			ums_cookie: encryptString(coookie)
		}
	})
}

async function getPlacemnetDetailsByNumber({ whatsapp_number }) {
	const p = await db.placement.findUnique({
		where: {
			user_whatsapp_number: whatsapp_number
		}
	})
	return p
}

async function addPlacementPortalProfile({
	user_whatsapp_number,
	placement_cookie
}) {
	let p = await db.placement.create({
		data: {
			placement_cookie: encryptString(placement_cookie),
			user_whatsapp_number
		}
	})
	return p
}

async function updatePlacementCookie({ whatsapp_number, placement_cookie }) {
	await db.placement.update({
		where: {
			user_whatsapp_number: whatsapp_number
		},
		data: {
			placement_cookie: encryptString(placement_cookie)
		}
	})
}

async function updateEligibleDrives({ whatsapp_number, drives }) {
	await db.placement.update({
		where: {
			user_whatsapp_number: whatsapp_number
		},
		data: {
			drives,
			last_check_time: new Date()
		}
	})
}

async function updateLastDriveCheckTime({ whatsapp_number }) {
	await db.placement.update({
		where: {
			user_whatsapp_number: whatsapp_number
		},
		data: {
			last_check_time: new Date()
		}
	})
}

async function sendCommandAfterAuth({
	sock,
	senderJID,
	reply_to,
	userFromDB,
	funcion_name
}) {
	if (!userFromDB) {
		await sendMessage({
			sock,
			senderJID,
			textMessage: "Please login first to use this command.",
			reply_to
		})
	} else {
		await funcion_name({ sock, senderJID, reply_to, userFromDB })
	}
}

async function getAllUsers() {
	let users = await db.user.findMany({
		where: {
			OR: [
				{
					user_type: "STUDENT"
				},
				{
					user_type: "NORMAL_USER"
				}
			]
		},
		select: {
			whatsapp_number: true,
			block: true,
			is_permanent_ban: true,
			user_type: true
		}
	})
	return users
}

async function getAllPlacemetDetails() {
	let p = await db.placement.findMany({})
	return p
}

module.exports = {
	addNewUser,
	getUserByRegNumber,
	isUserBanned,
	getUserByWhatsappNumber,
	getUserByRegNumberAndPhoneNumber,
	updateCookie,
	sendCommandAfterAuth,
	getAllUsers,
	getPlacemnetDetailsByNumber,
	addPlacementPortalProfile,
	updatePlacementCookie,
	updateEligibleDrives,
	getAllPlacemetDetails,
	updateLastDriveCheckTime
}
