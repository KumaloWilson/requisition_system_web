import { runMigrations } from "../database/migrations/20240414000006-create-migration-runner"
import logger from "../utils/logger"

// Run migrations
const migrate = async () => {
  try {
    logger.info("Running migrations...")
    await runMigrations()
    logger.info("Migrations completed successfully")
    process.exit(0)
  } catch (error) {
    logger.error("Migration failed:", error)
    process.exit(1)
  }
}

migrate()
