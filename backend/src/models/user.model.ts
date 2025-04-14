import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  BeforeSave,
  HasMany,
  BelongsTo,
  ForeignKey,
  Default,
  Unique,
  IsEmail,
} from "sequelize-typescript"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { Department } from "./department.model"
import { Requisition } from "./requisition.model"
import { Approval } from "./approval.model"
import e from "express"

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
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
  firstName!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return `${(this as User).firstName} ${(this as User).lastName}`
    },
  })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  @IsEmail
  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string

  @Column({
    type: DataType.ENUM("regular_user", "approver", "admin"),
    defaultValue: "regular_user",
  })
  role!: "regular_user" | "approver" | "admin"

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  authorityLevel!: number

  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  departmentId!: string

  @BelongsTo(() => Department)
  department!: Department

  @HasMany(() => Requisition)
  requisitions!: Requisition[]

  @HasMany(() => Approval)
  approvals!: Approval[]

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date

  @BeforeSave
  static async hashPassword(instance: User) {
    if (instance.changed("password")) {
      const salt = await bcrypt.genSalt(10)
      instance.password = await bcrypt.hash(instance.password, salt)
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
  }
}
export default User