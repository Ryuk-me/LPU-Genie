const cron = require("node-cron")
const {
	getAllPlacemetDetails,
	getUserByWhatsappNumber,
	updatePlacementCookie,
	updateEligibleDrives
} = require("./service")
const { postGetPlacementHomePage } = require("./network/placement")
const { decryptString } = require("./utils/string_enc_denc")
const { Config } = require("./Config")

//! Define the cron schedule
const cronSchedule = "*/10 9-23 * * *" // Runs every 10 minutes from 9:00 AM to 11:30 PM

async function cronJobDriveCheck({ sock }) {
	let placementDetails = await getAllPlacemetDetails()
	if (placementDetails.length > 0) {
		for (const placement of placementDetails) {
			let res = undefined
			let statusCode = undefined
			let timeDifference = await getTimeDifferenceInSeconds(
				placement.last_check_time,
				new Date()
			)
			//? Invidual User Drive Request Timeout
			if (
				timeDifference >=
				Config.PLACEMENT_DRIVE_NOTIFY_SPAN_INDIVIDUAL * 60
			) {
				try {
					let user = await getUserByWhatsappNumber({
						whatsapp_number: placement.user_whatsapp_number
					})
					res = await postGetPlacementHomePage({
						reg_no: user.registration_number,
						password: decryptString(user.password),
						cookie: decryptString(placement.placement_cookie)
					})
					statusCode = res.status
				} catch (error) {
					statusCode = error?.response?.status || 500
					res = error?.response
				}
				if (statusCode >= 200 && statusCode <= 299) {
					let drivesData = res.data
					let upcomingDrives = res.data?.upcoming_drives || []
					if (
						drivesData?.cookie !== decryptString(placement.placement_cookie)
					) {
						await updatePlacementCookie({
							placement_cookie: drivesData.cookie,
							whatsapp_number: placement.user_whatsapp_number
						})
					}
					//! Now check if there is data difference between current drives and Saved Drives
					if (upcomingDrives.length > 0 && placement.drives.length > 0) {
						let temp_msg = ""
						const notMatchedObjects = upcomingDrives.filter(
							(item1) =>
								!placement.drives.some(
									(item2) => item2.company === item1.company
								)
						)
						if (notMatchedObjects.length > 0) {
							for (const drive of notMatchedObjects) {
								let cmpName = drive?.company
								let jdurl = drive?.job_profile
								let status = drive?.status
								let register_by = drive?.register_by
								let registered = drive?.registered
								temp_msg += `
*New Drive Listed*

🏢 *Company*: ${cmpName}
📅 *Register By*: ${register_by}
📊 *Status*: ${status}
${registered === "No" ? "❌" : "✅"} *Registered*: ${registered}
🔗 *Job Profile* : ${jdurl}
⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺\n`
							}
							await sock.sendMessage(placement.user_whatsapp_number, {
								text: temp_msg
							})
							await updateEligibleDrives({
								whatsapp_number: placement.user_whatsapp_number,
								drives: upcomingDrives
							})
						}
					} else if (
						upcomingDrives.drive.length > 0 &&
						placement.drives.length == 0
					) {
						await updateEligibleDrives({
							whatsapp_number: placement.user_whatsapp_number,
							drives: upcomingDrives
						})
					}
				}
			}
		}
	}
}

// Schedule the cron job
async function cronStartDrives({ sock }) {
	const taskCronJob = cron.schedule(cronSchedule, () => {
		cronJobDriveCheck({ sock })
	})
}

async function getTimeDifferenceInSeconds(date1, date2) {
	const time1 = date1.getTime()
	const time2 = date2.getTime()
	const timeDifference = Math.abs(time1 - time2)

	const totalSeconds = Math.floor(timeDifference / 1000)
	return totalSeconds
}

module.exports = {
	cronStartDrives
}
