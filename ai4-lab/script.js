const API_KEY = "cb33506a018965ad6445c80957a43e6a";

const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const messageBox = document.getElementById("message");
const currentWeatherBox = document.getElementById("current-weather");
const forecastBox = document.getElementById("forecast");

// Funkcja wysyłająca żądanie do API current weather z użyciem XMLHttpRequest
function getCurrentWeather(cityName) {
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    cityName
  )}&appid=${API_KEY}&units=metric&lang=pl`;

  const xhr = new XMLHttpRequest();
  xhr.open("GET", endpoint, true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        const data = JSON.parse(xhr.responseText);
        console.log("Current weather response:", data);
        renderCurrentWeather(data);
        showMessage("");
      } catch (error) {
        showMessage(
          "Nie udało się przetworzyć odpowiedzi o bieżącej pogodzie."
        );
        clearCurrentWeather();
      }
    } else {
      handleApiError(xhr);
      clearCurrentWeather();
    }
  };

  xhr.onerror = function () {
    showMessage("Błąd sieci podczas pobierania aktualnej pogody.");
    clearCurrentWeather();
  };

  xhr.send();
}

// Funkcja wysyłająca żądanie do API forecast z użyciem Fetch API
function getWeatherForecast(cityName) {
  const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    cityName
  )}&appid=${API_KEY}&units=metric&lang=pl`;

  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Status API: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Forecast response:", data);
      renderForecastList(data);
      showMessage("");
    })
    .catch((error) => {
      console.error(error);
      showMessage(
        "Nie udało się pobrać prognozy. Sprawdź nazwę miasta lub spróbuj ponownie."
      );
      clearForecast();
    });
}

// Nasłuchiwanie kliknięcia przycisku
searchButton.addEventListener("click", () => {
  const cityName = cityInput.value.trim();

  if (!cityName) {
    showMessage("Wpisz nazwę miasta, aby wyszukać pogodę.");
    return;
  }

  showMessage("Ładowanie danych...");
  getCurrentWeather(cityName);
  getWeatherForecast(cityName);
});

// Renderuje sekcję bieżącej pogody
function renderCurrentWeather(data) {
  if (!data || !data.name || !data.main || !data.weather) {
    showMessage("Brakuje danych o bieżącej pogodzie.");
    clearCurrentWeather();
    return;
  }

  const { name } = data;
  const { temp, feels_like } = data.main;
  const description = data.weather[0]?.description || "Brak opisu";
  const iconCode = data.weather[0]?.icon;

  const iconUrl = iconCode
    ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    : "";

  currentWeatherBox.innerHTML = `
    ${iconUrl ? `<img class="weather-icon" src="${iconUrl}" alt="${description}">` : ""}
    <div class="weather-meta">
      <strong>${name}</strong>
      <span>Temperatura: ${Math.round(temp)}°C</span>
      <span>Odczuwalna: ${Math.round(feels_like)}°C</span>
      <span>Opis: ${description}</span>
    </div>
  `;
}

// Renderuje listę prognoz – tylko wpisy z godziny 12:00 (fallback: pierwszy z dnia)
function renderForecastList(data) {
  if (!data || !Array.isArray(data.list) || data.list.length === 0) {
    showMessage("Brak danych prognozy dla podanego miasta.");
    clearForecast();
    return;
  }

  // Grupowanie po dacie YYYY-MM-DD
  const groups = {};
  for (const item of data.list) {
    const [dateOnly] = item.dt_txt.split(" ");
    if (!groups[dateOnly]) groups[dateOnly] = [];
    groups[dateOnly].push(item);
  }

  const days = Object.keys(groups).slice(0, 5); // max 5 dni
  forecastBox.innerHTML = "";

  days.forEach((day) => {
    const items = groups[day];
    const entryAtNoon =
      items.find((it) => it.dt_txt.endsWith("12:00:00")) || items[0];

    const temp = Math.round(entryAtNoon.main?.temp ?? 0);
    const description = entryAtNoon.weather?.[0]?.description || "Brak opisu";
    const iconCode = entryAtNoon.weather?.[0]?.icon;
    const iconUrl = iconCode
      ? `https://openweathermap.org/img/wn/${iconCode}.png`
      : "";

    const card = document.createElement("div");
    card.className = "forecast-item";
    card.innerHTML = `
      ${iconUrl ? `<img class="weather-icon" src="${iconUrl}" alt="${description}" width="50" height="50">` : ""}
      <div class="meta">
        <strong>${day} 12:00</strong>
        <span>Temperatura: ${temp}°C</span>
        <span>${description}</span>
      </div>
    `;
    forecastBox.appendChild(card);
  });
}

// Pokazuje komunikat użytkownikowi
function showMessage(text) {
  messageBox.textContent = text;
}

// Czyści sekcję bieżącej pogody
function clearCurrentWeather() {
  currentWeatherBox.innerHTML =
    '<p class="placeholder">Brak danych o aktualnej pogodzie.</p>';
}

// Czyści sekcję prognozy
function clearForecast() {
  forecastBox.innerHTML =
    '<p class="placeholder">Brak danych prognozy.</p>';
}

// Obsługa błędów API dla XMLHttpRequest
function handleApiError(xhr) {
  if (xhr.status === 404) {
    showMessage("Nie znaleziono takiego miasta. Spróbuj ponownie.");
  } else if (xhr.status === 401) {
    showMessage("Błędny klucz API. Sprawdź konfigurację.");
  } else {
    showMessage("Wystąpił błąd podczas pobierania pogody.");
  }
}