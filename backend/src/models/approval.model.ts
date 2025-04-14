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
import { User } from "./user.model"
import { Requisition } from "./requisition.model"
import e from "express"

@Table({
  tableName: "approvals",
  timestamps: true,
})
export class Approval extends Model {
  @Default(uuidv4)
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  id!: string

  @ForeignKey(() => Requisition)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  requisitionId!: string

  @BelongsTo(() => Requisition)
  requisition!: Requisition

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  approverId!: string

  @BelongsTo(() => User)
  approver!: User

  @Column({
    type: DataType.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  })
  status!: "pending" | "approved" | "rejected"

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comment!: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  approverLevel!: number

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date
}
export default Approval   