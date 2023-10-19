const { PrismaClient } = require("@prisma/client")

const db = new PrismaClient()

const isConnected = async () => {
	try {
		await db.$queryRaw`SELECT 1;`
		return true
	} catch (PrismaClientInitializationError) {
		console.log(
			"Database not found or connected check env or\nUse command `pnpm prisma migrate dev --name init` to create database and tables"
		)
		return false
	}
}

module.exports = { db, isConnected }
