import type { QueryInterface } from "sequelize"
import { Umzug, SequelizeStorage } from "umzug"
import { sequelize } from "../connection"
import path from "path"
import AppLogger from "../../utils/logger"

// Create seeder runner
const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, "../seeders/*.ts"),
    resolve: ({ name, path, context }) => {
      const seeder = require(path!)
      return {
        name,
        up: async () => seeder.default.up(context, sequelize),
        down: async () => seeder.default.down(context, sequelize),
      }
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    modelName: "seeder_meta",
  }),
  logger: {
    info: (message: any) => { AppLogger.info(message); return undefined; },
    warn: (message: any) => { AppLogger.warn(message); return undefined; },
    error: (message: any) => { AppLogger.error(message); return undefined; },
    debug: (message: any) => { AppLogger.debug(message); return undefined; },
  },
})

// Run seeders
export const runSeeders = async () => {
  try {
    await umzug.up()
    AppLogger.info("Seeders completed successfully")
  } catch (error) {
    AppLogger.error("Seeder failed:", error)
    throw error
  }
}

// Revert seeders
export const revertSeeders = async () => {
  try {
    await umzug.down({ to: 0 })
    AppLogger.info("Seeders reverted successfully")
  } catch (error) {
    AppLogger.error("Seeder reversion failed:", error)
    throw error
  }
}

export default {
  up: async (queryInterface: QueryInterface) => {
    // This seeder is just a placeholder to set up the seeder runner
    return Promise.resolve()
  },

  down: async (queryInterface: QueryInterface) => {
    return Promise.resolve()
  },
}
