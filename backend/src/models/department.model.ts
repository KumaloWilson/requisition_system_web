import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, HasMany, Default } from "sequelize-typescript"
import { v4 as uuidv4 } from "uuid"
import { User } from "./user.model"
import { Requisition } from "./requisition.model"
import { ApprovalWorkflow } from "./approval-workflow.model"

@Table({
  tableName: "departments",
  timestamps: true,
})
export class Department extends Model {
  @Default(uuidv4)
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  id!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string

  @HasMany(() => User)
  users!: User[]

  @HasMany(() => Requisition)
  requisitions!: Requisition[]

  @HasMany(() => ApprovalWorkflow)
  approvalWorkflows!: ApprovalWorkflow[]

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date
}
export default Department