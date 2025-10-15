// models/Progress.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "@/lib/db";

class Progress extends Model<
  InferAttributes<Progress>,
  InferCreationAttributes<Progress>
> {
  declare id: CreationOptional<number>;
  declare startedAt: Date;
  declare finishedAt: Date | null;
  declare verdictCategory: string | null;
  declare notes: string | null;

  // timestamps (sequelize adds them; we declare for TS)
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Progress.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    startedAt: { type: DataTypes.DATE, allowNull: false },
    finishedAt: { type: DataTypes.DATE, allowNull: true },

    verdictCategory: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },

    // Add these so TS is happy (sequelize will still manage them)
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Progress",
    tableName: "progresses",
    // timestamps: true // (default) – shown for clarity
  }
);

export default Progress;