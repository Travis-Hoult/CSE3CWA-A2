// models/Output.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ModelAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db";

export default class Output extends Model<
  InferAttributes<Output>,
  InferCreationAttributes<Output>
> {
  declare id: CreationOptional<number>;
  declare html: string;
  declare summary: object | null;

  // timestamps added by Sequelize
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Output.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    html: { type: DataTypes.TEXT, allowNull: false },
    summary: { type: DataTypes.JSON, allowNull: true },

    // include timestamps in the attributes to satisfy TS when timestamps: true
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true },
  } as ModelAttributes<Output, InferCreationAttributes<Output>>,
  {
    sequelize,
    modelName: "Output",
    tableName: "outputs",
    timestamps: true, // Sequelize will maintain these automatically
  }
);