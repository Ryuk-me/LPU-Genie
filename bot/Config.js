require("dotenv").config()

const BOT_NAME = process.env?.BOT_NAME || "LPU-Genie"
const SUFFIX = process.env?.SUFFIX || undefined
const ADMIN = process.env?.ADMIN || undefined
const ARROW_SYMBOL = process.env?.ARROW_SYMBOL || undefined // for !help ↠ to see how to use
const BOT_NUMBER = process.env?.BOT_NUMBER || undefined
const STICKER_NAME = process.env?.STICKER_NAME || "Bot-wa"
const STICKER_AUTHOR = process.env?.STICKER_AUTHOR || "Ryuk's Bot"
const DATABASE_URL = process.env?.DATABASE_URL || undefined

const MAX_CONSECUTIVE_REQUESTS =
	parseInt(process.env?.MAX_CONSECUTIVE_REQUESTS) || 10
const MAX_CONSECUTIVE_REQUESTS_TIME_WINDOW_IN_SECONDS =
	parseInt(process.env?.MAX_CONSECUTIVE_REQUESTS_TIME_WINDOW_IN_SECONDS) || 60 // seconds
const TEMPORARY_BAN_TIMEOUT_IN_SECONDS =
	parseInt(process.env?.TEMPORARY_BAN_TIMEOUT_IN_SECONDS) || 1800 // 30 Minutes
const MAX_BAN_WARNING = parseInt(process.env?.MAX_BAN_WARNING) || 3 // integer
const BASE_API = process.env?.BASE_API || undefined
const MAX_SPAM_CALL_TOLERATE =
	parseInt(process.env?.MAX_SPAM_CALL_TOLERATE) || 10
const STRING_SECRET_KEY =
	process.env?.STRING_SECRET_KEY ||
	"84291a446131670fc372eaeee7dbb618caa9b164a10b9baa4b45f8c1394c1b24"

const PLACEMENT_DRIVE_NOTIFY_SPAN_INDIVIDUAL =
	parseInt(process.env?.PLACEMENT_DRIVE_NOTIFY_SPAN_INDIVIDUAL) || 30

const Config = {
	BOT_NAME,
	BASE_API,
	SUFFIX,
	ADMIN,
	ARROW_SYMBOL,
	BOT_NUMBER,
	STICKER_NAME,
	STICKER_AUTHOR,
	DATABASE_URL,
	MAX_CONSECUTIVE_REQUESTS,
	MAX_CONSECUTIVE_REQUESTS_TIME_WINDOW_IN_SECONDS,
	TEMPORARY_BAN_TIMEOUT_IN_SECONDS,
	MAX_BAN_WARNING,
	MAX_SPAM_CALL_TOLERATE,
	STRING_SECRET_KEY,
	PLACEMENT_DRIVE_NOTIFY_SPAN_INDIVIDUAL
}

function validateENV() {
	let listOfMissingKeys = []
	Object.keys(Config).map((key) => {
		if (Config[key] === undefined) {
			listOfMissingKeys.push(key)
		}
	})
	if (listOfMissingKeys.length > 0) {
		console.log("Value is missing for the following key/s -> ")
		listOfMissingKeys.map((key) => {
			console.log(key)
		})
		process.exit(1)
	}
}
validateENV()

module.exports = {
	Config
}
