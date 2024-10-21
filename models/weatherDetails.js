import { DataTypes } from "sequelize";
import sequelize from "../Database/database.js";

const WeatherDetails = sequelize.define("WeatherDetails", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  latitude: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  longitude: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  Weather: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
});
(async () => {
  await sequelize.sync();
  console.log("Weather Details Table has be Created.");
})();

export default WeatherDetails;
