import type { QueryInterface } from "sequelize"
import { QueryTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { Department } from "../../models/department.model"

export default {
  up: async (queryInterface: QueryInterface) => {
    const departments: Department[] = await queryInterface.sequelize.query("SELECT id FROM departments", {
      type: QueryTypes.SELECT,
    })

    // Create approval workflows for different departments and categories
    const approvalWorkflows = [
      // IT Equipment workflow (requires all 3 levels)
      {
        id: uuidv4(),
        departmentId: departments[0].id,
        categoryId: "equipment",
        amountThreshold: 1000.0,
        approverSequence: JSON.stringify([1, 2, 3]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // IT Service workflow (requires level 2 and 3)
      {
        id: uuidv4(),
        departmentId: departments[0].id,
        categoryId: "service",
        amountThreshold: 5000.0,
        approverSequence: JSON.stringify([2, 3]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // IT Travel workflow (requires only level 3)
      {
        id: uuidv4(),
        departmentId: departments[0].id,
        categoryId: "travel",
        amountThreshold: 2000.0,
        approverSequence: JSON.stringify([3]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert("approval_workflows", approvalWorkflows)
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("approval_workflows", {})
  },
}
