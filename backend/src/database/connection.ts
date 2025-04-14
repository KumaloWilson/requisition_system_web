import { Sequelize } from "sequelize-typescript"
import dotenv from "dotenv"
import AppLogger from "../utils/logger"

// Load environment variables
dotenv.config()

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "requisition_system",
  dialect: "postgres" as const,
  logging: (msg: string) => AppLogger.debug(msg),
  models: [__dirname + "/../models"],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

// Create Sequelize instance
export const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  models: dbConfig.models,
  pool: dbConfig.pool,
})

export default sequelize
