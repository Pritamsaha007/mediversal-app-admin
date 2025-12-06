import axios from "axios";
const OPENWEATHER_API_KEY = "25ff35e585895a4d358f19a21928e380";
const OPENWEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5";
const AQICN_API_TOKEN = "89f4092ad4bac99c8fb26554d705bc6852fddc2a";
const AQICN_BASE_URL = "https://api.waqi.info";

export interface AQIData {
  aqi: number;
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
  timestamp: number;
  city: string;
  isDefaultLocation: boolean;
  weather?: {
    temp: number;
    humidity: number;
    windSpeed: number;
  };
}

export interface AQIResponse {
  coord: {
    lon: number;
    lat: number;
  };
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

export const aqiService = {
  async getAQI(): Promise<AQIData> {
    try {
      const location = await this.getUserLocation();
      const { lat, lon, city, isDefault } = location;

      const [aqiResponse, weatherResponse] = await Promise.all([
        axios.get(`${AQICN_BASE_URL}/feed/geo:${lat};${lon}/`, {
          params: { token: AQICN_API_TOKEN },
          timeout: 10000,
        }),
        axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
          params: { lat, lon, appid: OPENWEATHER_API_KEY, units: "metric" },
          timeout: 10000,
        }),
      ]);

      if (aqiResponse.data.status !== "ok" || !aqiResponse.data.data) {
        throw new Error("No AQI data available");
      }

      const data = aqiResponse.data.data;
      const iaqi = data.iaqi || {};
      const weatherData = weatherResponse.data;
      console.log("First", data);
      console.log("Second", iaqi);
      console.log("Third", weatherData);

      return {
        aqi: data.aqi,
        components: {
          co: iaqi.co?.v || 0,
          no: iaqi.no?.v || 0,
          no2: iaqi.no2?.v || 0,
          o3: iaqi.o3?.v || 0,
          so2: iaqi.so2?.v || 0,
          pm2_5: iaqi.pm25?.v || 0,
          pm10: iaqi.pm10?.v || 0,
          nh3: iaqi.nh3?.v || 0,
        },
        timestamp: data.time.v,
        city: data.city.name || city,
        isDefaultLocation: isDefault,
        weather: {
          temp: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
        },
      };
    } catch (error) {
      console.error("Error fetching AQI data:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error("Request timed out. Please try again.");
        }
        throw new Error(`Failed to fetch AQI data: ${error.message}`);
      }

      throw new Error("Unable to fetch air quality data");
    }
  },

  getAQILabel(aqi: number): { label: string; color: string; message: string } {
    if (aqi <= 50) {
      return {
        label: "Good",
        color: "#22C55E",
        message: "Air quality is satisfactory for outdoor activities",
      };
    } else if (aqi <= 100) {
      return {
        label: "Moderate",
        color: "#F59E0B",
        message: "Air quality is acceptable for most people",
      };
    } else if (aqi <= 150) {
      return {
        label: "Unhealthy for Sensitive Groups",
        color: "#FF9800",
        message: "Sensitive groups should limit prolonged outdoor exposure",
      };
    } else if (aqi <= 200) {
      return {
        label: "Unhealthy",
        color: "#F44336",
        message: "Everyone should reduce prolonged outdoor activities",
      };
    } else if (aqi <= 300) {
      return {
        label: "Very Unhealthy",
        color: "#9C27B0",
        message: "Health alert: everyone may experience health effects",
      };
    } else {
      return {
        label: "Hazardous",
        color: "#7E0023",
        message:
          "Health warning: emergency conditions, avoid outdoor activities",
      };
    }
  },

  async getUserLocation(): Promise<{
    lat: number;
    lon: number;
    city: string;
    isDefault: boolean;
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          lat: 25.5941,
          lon: 85.1376,
          city: "Patna",
          isDefault: true,
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            city: "Current Location",
            isDefault: false,
          });
        },
        (error) => {
          console.warn(
            "Location access denied, using Patna as default:",
            error.message
          );
          resolve({
            lat: 25.5941,
            lon: 85.1376,
            city: "Patna",
            isDefault: true,
          });
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000,
        }
      );
    });
  },
};

export default aqiService;
