import { DataTypes } from "sequelize";
import sequelize from "../Database/database.js";

const WeatherInfo = sequelize.define("WeatherInfo", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

(async () => {
  await sequelize.sync();
  console.log("WeatherInfo table has been created.");
})();

export default WeatherInfo;
