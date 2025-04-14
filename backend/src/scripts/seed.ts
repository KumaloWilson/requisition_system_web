import { runSeeders } from "../database/seeders/20240414000006-run-seeders"
import logger from "../utils/logger"

// Run seeders
const seed = async () => {
  try {
    logger.info("Running seeders...")
    await runSeeders()
    logger.info("Seeders completed successfully")
    process.exit(0)
  } catch (error) {
    logger.error("Seeder failed:", error)
    process.exit(1)
  }
}

seed()
