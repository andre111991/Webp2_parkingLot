import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect:process.env.DB_DIALECT
    }
);

try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
} catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
}

import DefineUser  from "./user.model.js";
const User = DefineUser(sequelize, DataTypes);

try {
    await sequelize.sync({ alter: true }); // use { force: true } to drop and recreate tables on every sync (use with caution in production)
    console.log("All models were synchronized successfully.");
} catch (error) {
    console.error("Error synchronizing models:", error);
    process.exit(1);
}

export { sequelize, User };
