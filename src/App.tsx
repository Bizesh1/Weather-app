import axios from "axios";
import React, { useEffect, useState } from "react";

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}
interface Weather {
  temperature: number;
  windspeed: number;
  weathercode: number;
}
interface GeocodingResponse {
  results?: Location[];
}
interface WeatherResponse {
  current_weather: Weather;
}

function App() {
  const [search, setSearch] = useState("Kathmandu");
  const [city, setCity] = useState("Kathmandu");

  const [weather, setWeather] = useState<Weather | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchWeather = async (cityName: string) => {
    try {
      setLoading(true);
      setError("");
      //1. Find City Coordinates
      const locationResponse = await axios.get<GeocodingResponse>(
        "https://geocoding-api.open-meteo.com/v1/search",
        {
          params: {
            name: cityName,
            count: 1,
            language: "en",
            format: "json",
          },
        },
      );
      const result = locationResponse.data.results?.[0];

      if (!result) {
        setError("City Not Found");
        setWeather(null);
        return;
      }
      setLocation(result);

      //2. Fetch Weather  using coordinate
      const weatherResponse = await axios.get<WeatherResponse>(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: result?.latitude,
            longitude: result?.longitude,
            current_weather: true,
          },
        },
      );
      setWeather(weatherResponse.data.current_weather);
      setCity(result.name);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Kathmandu");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    fetchWeather(search);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">Weather App</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search City"
            className="flex-1 rounded border px-3 py-2"
          />
          <button type="submit" className="rounded bg-black text-white px-3 py-2">
            Search
          </button>
        </form>
        {loading && (
          <div>
            <p className="mt-6 text-gray-600">Loading...</p>
          </div>
        )}
        {error && <p className="text-red-500 mt-6">{error}</p>}
        {!loading && weather && location && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">{city}</h2>
            <div className="mt-4 space-y-3">
              <p>
                Temperature:{" "}<strong>{weather.temperature}°C</strong>
              </p>
              <p>
                Wind Speed:{" "}<strong>{weather.windspeed}Km/hrs</strong>
              </p>
              <p>
                Weather Code:{" "}<strong>{weather.weathercode}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;