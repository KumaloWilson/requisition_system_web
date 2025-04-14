import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  ForeignKey,
  HasMany,
  Default,
} from "sequelize-typescript"
import { v4 as uuidv4 } from "uuid"
import { User } from "./user.model"
import { Department } from "./department.model"
import { Approval } from "./approval.model"
import { Attachment } from "./attachment.model"

@Table({
  tableName: "requisitions",
  timestamps: true,
})
export class Requisition extends Model {
  @Default(uuidv4)
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  id!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  requestorId!: string

  @BelongsTo(() => User)
  requestor!: User

  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  departmentId!: string

  @BelongsTo(() => Department)
  department!: Department

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  amount!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  category!: string

  @Column({
    type: DataType.ENUM("low", "medium", "high"),
    defaultValue: "medium",
  })
  priority!: "low" | "medium" | "high"

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  dueDate!: Date

  @Column({
    type: DataType.ENUM("draft", "pending", "partially_approved", "approved", "rejected", "revised"),
    defaultValue: "draft",
  })
  status!: "draft" | "pending" | "partially_approved" | "approved" | "rejected" | "revised"

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  currentApproverLevel!: number

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  revisionNumber!: number

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  originalRequisitionId!: string

  @HasMany(() => Approval)
  approvals!: Approval[]

  @HasMany(() => Attachment)
  attachments!: Attachment[]

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date
}
export default Requisition