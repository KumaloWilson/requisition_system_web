import type { QueryInterface } from "sequelize"
import { Umzug, SequelizeStorage } from "umzug"
import { sequelize } from "../connection"
import path from "path"
import AppLogger from "../../utils/logger"

// Create migration runner
const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, "../migrations/*.ts"),
    resolve: ({ name, path, context }) => {
      const migration = require(path!)
      return {
        name,
        up: async () => migration.default.up(context, sequelize),
        down: async () => migration.default.down(context, sequelize),
      }
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    info: (message: any): void => { AppLogger.info(message) },
    warn: (message: any): void => { AppLogger.warn(message) },
    error: (message: any): void => { AppLogger.error(message) },
    debug: (message: any): void => { AppLogger.debug(message) },
  },
})

// Run migrations
export const runMigrations = async () => {
  try {
    await umzug.up()
    AppLogger.info("Migrations completed successfully")
  } catch (error) {
    AppLogger.error("Migration failed:", error)
    throw error
  }
}

// Revert migrations
export const revertMigrations = async () => {
  try {
    await umzug.down({ to: 0 })
    AppLogger.info("Migrations reverted successfully")
  } catch (error) {
    AppLogger.error("Migration reversion failed:", error)
    throw error
  }
}

export default {
  up: async (queryInterface: QueryInterface) => {
    // This migration is just a placeholder to set up the migration runner
    return Promise.resolve()
  },

  down: async (queryInterface: QueryInterface) => {
    return Promise.resolve()
  },
}
