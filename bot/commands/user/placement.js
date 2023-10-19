const { sendMessage, editMessage } = require("../../utils/messages")
const {
	getPlacemnetDetailsByNumber,
	addPlacementPortalProfile,
	updatePlacementCookie,
	updateEligibleDrives
} = require("../../service")
const { postGetPlacementHomePage } = require("../../network/placement")
const { decryptString } = require("../../utils/string_enc_denc")
const { validateStatusCode } = require("../../utils/validateStatusCode")
const { sleep } = require("../../utils/sleep")

async function userEligibleDrives({ sock, senderJID, reply_to, userFromDB }) {
	let res = undefined
	let statusCode = undefined
	let sent_msg = await sendMessage({
		sock,
		senderJID,
		textMessage: "_Fetching eligible drive details please wait._",
		reply_to
	})
	let placementProfile = await getPlacemnetDetailsByNumber({
		whatsapp_number: userFromDB.whatsapp_number
	})
	if (!placementProfile) {
		placementProfile = await addPlacementPortalProfile({
			user_whatsapp_number: userFromDB.whatsapp_number,
			placement_cookie: "default"
		})
	}
	try {
		res = await postGetPlacementHomePage({
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
		if (user?.cookie !== decryptString(placementProfile.placement_cookie)) {
			await updatePlacementCookie({
				placement_cookie: user.cookie,
				whatsapp_number: placementProfile.user_whatsapp_number
			})
		}
		let reg_no = user.registration_number
		let placement_id = user?.placement_id
		let placement_services_status = user?.placement_services_status
		let email = user?.email
		let program = user?.program
		let cgpa = user?.cgpa
		let reappear_or_backlog = user?.reappear_or_backlog
		let x_marks = user?.x_marks
		let xii_marks = user?.xii_marks
		let graduation_marks = user?.graduation_marks
		let diploma_marks = user?.diploma_marks
		let upcomingDrives = user?.upcoming_drives || undefined
		if (
			placementProfile.drives.length === 0 &&
			upcomingDrives &&
			upcomingDrives.length > 0
		) {
			await updateEligibleDrives({
				whatsapp_number: placementProfile.user_whatsapp_number,
				drives: upcomingDrives
			})
		}
		// TODO Implement Check if there is a new drive and add a new Tag emoji and send it first
		let fines = user?.fines || undefined
		let temp_msg = `📋 *Placement Profile* 📋\n
🔍 *Registration No.*: ${reg_no}
🆔 *Placement ID*: ${placement_id}
📊 *Status*: ${placement_services_status}
📧 *Email*: ${email}
📚 *Program*: ${program}
🎓 *CGPA*: ${cgpa}
📚 *Reappear/Backglog*: ${reappear_or_backlog}
📜 *X Marks*: ${x_marks}
📜 *XII Marks*: ${xii_marks}
🎓 *Graduation Marks*: ${graduation_marks}
🎓 *Diploma Marks*: ${diploma_marks}

⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺\n
`
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: temp_msg,
			reply_to
		})
		if (upcomingDrives && upcomingDrives.length > 0) {
			temp_msg += "🟢 *Eligible Drives* 🟢\n"
			for (const drive of upcomingDrives) {
				let cmpName = drive?.company
				let jdurl = drive?.job_profile
				let status = drive?.status
				let register_by = drive?.register_by
				let registered = drive?.registered

				temp_msg += `
🏢 *Company*: ${cmpName}
📅 *Register By*: ${register_by}
📊 *Status*: ${status}
${registered === "No" ? "❌" : "✅"} *Registered*: ${registered}
🔗 *Job Profile* : ${jdurl}
\n`
				await editMessage({
					sock,
					senderJID,
					sent_msg,
					textMessage: temp_msg,
					reply_to
				})
				await sleep(200)
			}
			temp_msg += "⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺\n\n"
			await editMessage({
				sock,
				senderJID,
				sent_msg,
				textMessage: temp_msg,
				reply_to
			})
		}
		if (fines && fines.length > 0) {
			temp_msg += "🚦 *Fines* 🚦\n"
			for (const fine of fines) {
				let cName = fine?.company_name
				let driveRound = fine?.drive_round
				let fine_instance = fine?.fine_instance
				let fine_amount = fine?.fine_amount
				let drive_date = fine?.drive_date
				temp_msg += `
🏢 *Company*: ${cName}
🔄 *Drive Round*: ${driveRound}
💡 *Fine Instance*: ${fine_instance}
💰 *Fine Amount*: ${fine_amount}
📅 *Drive Date*: ${drive_date}
\n`
				await editMessage({
					sock,
					senderJID,
					sent_msg,
					textMessage: temp_msg,
					reply_to
				})
				await sleep(200)
			}
		}
	} else {
		await editMessage({
			sock,
			senderJID,
			sent_msg,
			textMessage: "*Drives Not Found.*",
			reply_to
		})
	}
}

module.exports = {
	userEligibleDrives
}
