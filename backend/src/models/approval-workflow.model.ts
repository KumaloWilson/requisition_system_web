import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  ForeignKey,
  Default,
} from "sequelize-typescript"
import { v4 as uuidv4 } from "uuid"
import { Department } from "./department.model"

@Table({
  tableName: "approval_workflows",
  timestamps: true,
})
export class ApprovalWorkflow extends Model {
  @Default(uuidv4)
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  id!: string

  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  departmentId!: string

  @BelongsTo(() => Department)
  department!: Department

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  categoryId!: string

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  amountThreshold!: number

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  approverSequence!: number[]

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date
}
export default ApprovalWorkflow
