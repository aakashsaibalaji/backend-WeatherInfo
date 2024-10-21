import { Sequelize } from "sequelize";

const sequelize = new Sequelize("weather", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

try {
  sequelize.authenticate();
} catch (error) {
  console.error("Error connecting to database:", error);
}

export default sequelize;
