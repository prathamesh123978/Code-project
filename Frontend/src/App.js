import React, { useState, useEffect } from 'react';
import { Search, MapPin, Eye, Droplets, Wind, Thermometer, Sun, Sunset, Clock } from 'lucide-react';
import './App.css';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_BASE = 'http://localhost:5000/api';

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user's location weather on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        () => {
          fetchWeather('London'); // Default city
        }
      );
    } else {
      fetchWeather('London');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${API_BASE}/weather/${encodeURIComponent(cityName)}`),
        fetch(`${API_BASE}/forecast/${encodeURIComponent(cityName)}`)
      ]);

      if (!weatherRes.ok) {
        const errorData = await weatherRes.json();
        throw new Error(errorData.error || 'Failed to fetch weather');
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData.forecast?.slice(0, 5) || []);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/weather/coords/${lat}/${lon}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }

      const weatherData = await response.json();
      setWeather(weatherData);
      setCity(weatherData.city);
    } catch (err) {
      setError(err.message);
      fetchWeather('London');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchWeather(city);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBackgroundGradient = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) {
      return 'from-blue-400 via-cyan-300 to-yellow-200'; // Morning
    } else if (hour >= 12 && hour < 18) {
      return 'from-blue-500 via-blue-400 to-cyan-300'; // Afternoon
    } else if (hour >= 18 && hour < 21) {
      return 'from-orange-400 via-pink-400 to-purple-500'; // Evening
    } else {
      return 'from-indigo-900 via-purple-800 to-blue-900'; // Night
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Weather App
          </h1>
          <p className="text-white/80 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTime(currentTime)} - {currentTime.toLocaleDateString()}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Enter city name..."
              className="w-full px-4 py-3 pl-12 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/25 transition-all"
            />
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-lg text-red-100 text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
            <p className="text-white/80 mt-2">Loading weather data...</p>
          </div>
        )}

        {/* Current Weather */}
        {weather && !loading && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/30 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {weather.city}, {weather.country}
                </h2>
                <div className="flex items-center justify-center mb-4">
                  <img
                    src={getWeatherIcon(weather.icon)}
                    alt={weather.description}
                    className="w-20 h-20"
                  />
                  <div className="text-6xl font-bold text-white ml-4">
                    {weather.temperature}°C
                  </div>
                </div>
                <p className="text-xl text-white/90 capitalize mb-2">
                  {weather.description}
                </p>
                <p className="text-white/70 flex items-center justify-center gap-1">
                  <Thermometer className="w-4 h-4" />
                  Feels like {weather.feelsLike}°C
                </p>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                  <Droplets className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{weather.humidity}%</div>
                  <div className="text-white/70 text-sm">Humidity</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                  <Wind className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{weather.windSpeed} m/s</div>
                  <div className="text-white/70 text-sm">Wind Speed</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                  <Eye className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{weather.visibility} km</div>
                  <div className="text-white/70 text-sm">Visibility</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                  <Sun className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{weather.pressure} hPa</div>
                  <div className="text-white/70 text-sm">Pressure</div>
                </div>
              </div>

              {/* Sunrise & Sunset */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                  <Sun className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
                  <div className="text-white/70 text-sm">Sunrise</div>
                  <div className="text-lg font-semibold text-white">
                    {formatTime(new Date(weather.sunrise))}
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                  <Sunset className="w-6 h-6 text-orange-300 mx-auto mb-2" />
                  <div className="text-white/70 text-sm">Sunset</div>
                  <div className="text-lg font-semibold text-white">
                    {formatTime(new Date(weather.sunset))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">5-Day Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {forecast.map((item, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 hover:bg-white/20 transition-colors">
                      <div className="text-white/80 text-sm mb-2">
                        {new Date(item.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <img
                        src={getWeatherIcon(item.icon)}
                        alt={item.description}
                        className="w-12 h-12 mx-auto mb-2"
                      />
                      <div className="text-xl font-bold text-white mb-1">
                        {item.temperature}°C
                      </div>
                      <div className="text-white/70 text-xs capitalize">
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;