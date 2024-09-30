const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "afb428778878b02f5e428ebfa2bca6d9";

const createWeatherCard = (weatherItem) => {
    const date = new Date(weatherItem.dt_txt).toLocaleDateString();
    return `
        <li class="card">
            <h3>(${date})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
            <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
            <h4>Humidity: ${weatherItem.main.humidity} %</h4>
        </li>`;
};

const displayCurrentWeather = (cityName, weatherItem) => {
    const date = new Date(weatherItem.dt_txt).toLocaleDateString();
    currentWeatherDiv.innerHTML = `
        <h2>${cityName} (${date})</h2>
        <h4>Temp:  ${(weatherItem.main.temp- 273.15).toFixed(2)}°C</h4>
        <h4>Wind:  ${weatherItem.wind.speed}m/s</h4>
        <h4>Humidity:  ${weatherItem.main.humidity}%</h4>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h4>${weatherItem.weather[0].description} </h4>
    `;
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            console.log("Weather Data:", data);

            const currentWeather = data.list[0]; // Current weather
            displayCurrentWeather(cityName, currentWeather);

            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";

            if (fiveDaysForecast.length === 0) {
                alert("No forecast data available.");
                return;
            }

            fiveDaysForecast.forEach(weatherItem => {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(weatherItem));
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            console.log("Geocoding Data:", data);

            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    console.log("Reverse Geocoding Data:", data);

                    if (!data.length) return alert("Could not find city name for your location.");
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
