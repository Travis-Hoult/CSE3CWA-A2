import { DataTypes, Model } from "sequelize";
import { sequelize } from "../lib/db";

export class Output extends Model {
  declare id: number;
  declare content: string;
  declare summary: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Output.init(
  {
    content: { type: DataTypes.TEXT, allowNull: false },
    summary: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: "Output" }
);

export async function ensureSynced() {
  await sequelize.sync();
}
