import { Sequelize } from "sequelize";

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

import defineUser  from "./user.model.js";

const User = defineUser(sequelize, Sequelize.DataTypes);

//await sequelize.sync({ alter: true });

export { sequelize, User };
