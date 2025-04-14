import express from "express"
import dotenv from "dotenv"
import helmet from "helmet"
import compression from "compression"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { rateLimit } from "express-rate-limit"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import path from "path"

import { sequelize } from "./database/connection"
import logger from "./utils/logger"
import apiRoutes from "./routes"
import errorHandler from "./middleware/errorHandler"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// // Redis client for rate limiting
// const redisClient = createClient({
//   host: process.env.REDIS_HOST || "localhost",
//   port: Number(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD,
// })

// Middleware
app.use(helmet())
app.use(compression())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    // store: new RedisStore({
    //   sendCommand: (...args: string[]) => redisClient.call(...args),
    // }),
  }),
)

// Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// API routes
app.use("/api", apiRoutes)

// Error handling middleware
app.use(errorHandler)

// Database connection and server startup
const startServer = async () => {
  try {
    await sequelize.authenticate()
    logger.info("Database connection has been established successfully.")

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    logger.error("Unable to connect to the database:", error)
    process.exit(1)
  }
}

startServer()

export default app
