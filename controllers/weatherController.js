import axios from "axios";
import WeatherInfo from "../models/weatherInfo.js";
import WeatherDetails from "../models/weatherDetails.js";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 900 });

//This will be getting the Values of lantitudes and longtitudes based on the Pincode given.
const getlanLong = async (pincode) => {
  try {
    if (!pincode) {
      return "Provide Pincode";
    }
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${pincode}&key=${process.env.GCODE_API_KEY}`
    );
    const { lat, lng } = response.data.results[0].geometry;
    return { lat, lng };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    throw new Error("Failed to fetch coordinates");
  }
};

//This will be call the API of Weather and get the Weather Data.
const fetechingWeatherData = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return;
  }
};

//This function will be parsing Json and will get values.
const parsingWeatherData = (weatherdata) => {
  const result = {};
  const keys = Object.keys(weatherdata);
  keys.forEach((key) => {
    if (key === "main") {
      result[key] = weatherdata[key];
    }
    if (key === "weather") {
      result[key] = weatherdata[key][0];
    }
  });
  return result;
};

//-> This the POST API which will be Providing the Weather Details based on Pincode and
//-> It can update if there is already existing Pincode in the DB
export const WeatherAPI = async (req, res) => {
  try {
    const { pincode, for_date } = req.body;
    if (!pincode) {
      return res.status(400).json({ message: "Pincode is required" });
    }
    const validatePincode = (pincode) => {
      const regex = /^[0-9]{6}$/;
      return regex.test(pincode);
    };
    if (!validatePincode) {
      return res.status(400).json({ message: "Invalid Pincode" });
    }
    const { lat, lng } = await getlanLong(pincode);
    if (!lat || !lng) {
      return res.status(400).json({ message: "Failed to get coordinates" });
    }
    const cacheKey = `${lat}-${lng}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("Returning cached data");
      return res.json(cachedData);
    }

    let result = {};
    const existingWeatherInfo = await WeatherDetails.findAll({
      where: { latitude: lat, longitude: lng },
    });
    console.log(existingWeatherInfo);
    if (existingWeatherInfo && existingWeatherInfo.length > 0) {
      await WeatherInfo.update(
        {
          date: for_date,
        },
        { where: { pincode } }
      );
      const Weatherdata = await fetechingWeatherData(lat, lng);
      result = parsingWeatherData(Weatherdata);
      await WeatherDetails.update(
        { Weather: result },
        {
          where: {
            latitude: lat.toString(),
            longitude: lng.toString(),
          },
        }
      );
      result["latitude"] = lat;
      result["longitude"] = lng;
      cache.set(cacheKey, result);
      return res.status(200).send(result);
    }
    const Weatherdata = await fetechingWeatherData(lat, lng);
    result = parsingWeatherData(Weatherdata);
    if (!result || Object.keys(result).length === 0) {
      return res
        .status(400)
        .json({ message: "Failed to fetch or parse weather data" });
    }
    await WeatherInfo.create({
      pincode: pincode,
      date: for_date,
    });
    await WeatherDetails.create({
      latitude: lat.toString(),
      longitude: lng.toString(),
      Weather: result,
    });

    result["latitude"] = lat;
    result["longitude"] = lng;
    cache.set(cacheKey, result);
    return res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server failed to get the details" });
  }
};

//IT will be getting the Pinned if it exist in the DB.
export const getWeatherAPI = async (req, res) => {
  try {
    const { pincode } = req.params;
    const validatePincode = (pincode) => {
      const regex = /^[0-9]{6}$/;
      return regex.test(pincode);
    };
    if (!validatePincode) {
      return res.status(400).json({ message: "Invalid Pincode" });
    }
    const { lat, lng } = await getlanLong(pincode);
    const cacheKey = `${lat}-${lng}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({ data: cachedData });
    }
    const WeatherInformation = await WeatherDetails.findAll({
      where: {
        latitude: lat.toString(),
        longitude: lng.toString(),
      },
    });
    const result = [];
    if (WeatherInformation.length > 0) {
      result.push(JSON.parse(WeatherInformation[0].Weather));
      result.push({ lat, lng });
      cache.set(cacheKey, result);
      res.json({ result });
    } else {
      return res.status(404).json({
        message: "NO pinned code details are Found in DB.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      message: "server Failed to get the Data",
    });
  }
};

//It will be Removing that Pincode from the DB.
export const deleteWeatherDetails = async (req, res) => {
  try {
    const { pincode } = req.params;
    const validatePincode = (pincode) => {
      const regex = /^[0-9]{6}$/;
      return regex.test(pincode);
    };
    if (!validatePincode) {
      return res.status(400).json({ message: "Invalid Pincode" });
    }
    const { lat, lng } = await getlanLong(pincode);
    const checkPincode = await WeatherDetails.findAll({
      where: {
        latitude: lat.toString(),
        longitude: lng.toString(),
      },
    });

    if (checkPincode.length === 0) {
      return res
        .status(404)
        .json({ message: "No pinned code details found in DB." });
    }

    await WeatherDetails.destroy({
      where: {
        latitude: lat.toString(),
        longitude: lng.toString(),
      },
    });

    return res.status(200).json({
      message: "Pinned code details are deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server failed to delete the weather details",
    });
  }
};
