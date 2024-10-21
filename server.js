import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import WeatherRoutes from "./routes/weatherRoutes.js";
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/weather", WeatherRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("server running on http://localhost:5500");
});
