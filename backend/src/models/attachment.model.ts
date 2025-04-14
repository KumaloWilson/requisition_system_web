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
import { Requisition } from "./requisition.model"
import e from "express"

@Table({
  tableName: "attachments",
  timestamps: true,
})
export class Attachment extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileName!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileType!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileUrl!: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  fileSize!: number

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date
}
export default Attachment