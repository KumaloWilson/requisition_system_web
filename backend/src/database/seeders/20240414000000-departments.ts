import type { QueryInterface } from "sequelize"
import { v4 as uuidv4 } from "uuid"

export default {
  up: async (queryInterface: QueryInterface) => {
    const departments = [
      {
        id: uuidv4(),
        name: "Information Technology",
        description: "IT department responsible for technology infrastructure",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Human Resources",
        description: "HR department responsible for personnel management",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Finance",
        description: "Finance department responsible for financial operations",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Operations",
        description: "Operations department responsible for day-to-day activities",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Marketing",
        description: "Marketing department responsible for promotion and advertising",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert("departments", departments)
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("departments", {})
  },
}
