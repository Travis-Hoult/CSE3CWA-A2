// models/Progress.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/db";

export interface ProgressAttributes {
  id: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  verdictCategory: string | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProgressCreationAttributes = Optional<
  ProgressAttributes,
  "id" | "startedAt" | "finishedAt" | "verdictCategory" | "notes" | "createdAt" | "updatedAt"
>;

class Progress
  extends Model<ProgressAttributes, ProgressCreationAttributes>
  implements ProgressAttributes
{
  public id!: number;
  public startedAt!: Date | null;
  public finishedAt!: Date | null;
  public verdictCategory!: string | null;
  public notes!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Progress.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    finishedAt: { type: DataTypes.DATE, allowNull: true },
    verdictCategory: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "Progress",
    // tableName optional; Sequelize will pluralize by default.
    // timestamps true by default in Next/Sequelize setups.
  }
);

export default Progress;
