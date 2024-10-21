import express from "express";
import {
  deleteWeatherDetails,
  getWeatherAPI,
  WeatherAPI,
} from "../controllers/weatherController.js";

const router = express.Router();
router.post("/", WeatherAPI);
router.get("/:pincode", getWeatherAPI);
router.delete("/remove/:pincode", deleteWeatherDetails);

export default router;
