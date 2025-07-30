// server.js - Node.js Backend
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenWeatherMap API configuration
const API_KEY = process.env.OPENWEATHER_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather by city name
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    const weatherData = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      windSpeed: response.data.wind.speed,
      feelsLike: Math.round(response.data.main.feels_like),
      visibility: response.data.visibility / 1000, // Convert to km
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000)
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error.message);
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
});

// Get 5-day weather forecast
app.get('/api/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    const forecastData = response.data.list.map(item => ({
      date: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity
    }));
    
    res.json({
      city: response.data.city.name,
      country: response.data.city.country,
      forecast: forecastData
    });
  } catch (error) {
    console.error('Forecast API Error:', error.message);
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
  }
});

// Get weather by coordinates (for geolocation)
app.get('/api/weather/coords/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const response = await axios.get(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    const weatherData = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      windSpeed: response.data.wind.speed,
      feelsLike: Math.round(response.data.main.feels_like),
      visibility: response.data.visibility / 1000,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000)
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather Coords API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Weather API server running on port ${PORT}`);
  console.log(`Make sure to set your OPENWEATHER_API_KEY in .env file`);
});

module.exports = app;