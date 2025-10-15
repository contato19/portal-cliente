/**
 * Renderiza módulo de clima com visual amigável.
 */
export function renderWeather(weather) {
  const summary = document.getElementById("weather-summary");
  summary.innerHTML = `
        <div class="weather__card">
            <strong>Local</strong>
            <span>${weather.location}</span>
        </div>
        <div class="weather__card">
            <strong>Umidade</strong>
            <span>${weather.summary.humidity}%</span>
        </div>
        <div class="weather__card">
            <strong>Vento</strong>
            <span>${weather.summary.wind}</span>
        </div>
        <div class="weather__card">
            <strong>Lua</strong>
            <span>${weather.summary.moon}</span>
        </div>
        <div class="weather__card">
            <strong>Chuva</strong>
            <span>${weather.summary.rainChance}</span>
        </div>
    `;

  const chart = document.getElementById("weather-chart");
  chart.innerHTML = "";
  weather.forecast.forEach((day) => {
    const bar = document.createElement("div");
    bar.className = "weather__bar";
    bar.style.height = `${day.max * 8}px`;
    bar.innerHTML = `<span>${day.day}</span>`;
    bar.title = `Min ${day.min}°C · Max ${day.max}°C · Chuva ${day.rain}%`;
    chart.appendChild(bar);
  });

  const insight = document.getElementById("weather-insight");
  insight.textContent = `Guia experiente: ${weather.summary.commentary}`;
}
