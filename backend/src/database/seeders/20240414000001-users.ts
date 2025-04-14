import { QueryTypes, type QueryInterface } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"
import { Department } from "../../models/department.model"

export default {
  up: async (queryInterface: QueryInterface) => {
    // Get department IDs
    const departments: Department[]= await queryInterface.sequelize.query("SELECT id FROM departments", {
      type: QueryTypes.SELECT,
    })

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("Password123!", salt)

    // Create users with different roles and authority levels
    const users = [
      // Admin user
      {
        id: uuidv4(),
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        authorityLevel: 100,
        departmentId: departments[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // High-level approver
      {
        id: uuidv4(),
        firstName: "Senior",
        lastName: "Approver",
        email: "senior.approver@example.com",
        password: hashedPassword,
        role: "approver",
        authorityLevel: 3,
        departmentId: departments[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Mid-level approver
      {
        id: uuidv4(),
        firstName: "Mid",
        lastName: "Approver",
        email: "mid.approver@example.com",
        password: hashedPassword,
        role: "approver",
        authorityLevel: 2,
        departmentId: departments[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Low-level approver
      {
        id: uuidv4(),
        firstName: "Junior",
        lastName: "Approver",
        email: "junior.approver@example.com",
        password: hashedPassword,
        role: "approver",
        authorityLevel: 1,
        departmentId: departments[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Regular user
      {
        id: uuidv4(),
        firstName: "Regular",
        lastName: "User",
        email: "user@example.com",
        password: hashedPassword,
        role: "regular_user",
        authorityLevel: 0,
        departmentId: departments[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert("users", users)
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("users", {})
  },
}
