$(document).ready(function () {
  const searchInput = $('#js-search');
  const suggestions = $('#sidebar .drop-down');
  let dayForecast = $('.js-day-forecast').text();
  console.log(dayForecast)


  async function fetchSuggestions(query) {
    try {
      const response = await $.ajax({
        url: `/api/weather/search?location=${query}`,
        method: 'GET'
      });
      showSuggestions(response);
    } catch (error) {
      suggestions.hide();
    }
  }

  async function fetchCurrentWheather(query) {
    let url = '/api/weather/current';
    try {

      if (query)
        url += `?location=${query}`;

      const response = await $.ajax({
        url: url,
        method: 'GET'
      });
      renderCurrentWeather(response);
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchForecastsWeather(query) {
    let url = '/api/weather/forecasts';
    try {
      if (query && query.location && query.days) {
        url += `?location=${query.location}&days=${query.days}`;
      } else if (query && query.days) {
        url += `?days=${query.days}`;
      }

      const response = await $.ajax({
        url: url,
        method: 'GET'
      });

      return response.forecast;
    } catch (error) {
      console.error('Error fetching weather forecasts:', error);
    }
  }

  function showSuggestions(data) {
    suggestions.show().empty();
    data.forEach(item => {
      suggestions.append(`
        <p class="dropdown-item" data-url="${item.url}">${item.name}, ${item.country}</p>
      `);
    });
  }

  function renderCurrentWeather(data) {
    const city = data.location.name;
    const localtime = new Date(data.location.localtime).toISOString().split('T')[0];
    const tempC = data.current.temp_c;
    const windKph = data.current.wind_kph;
    const windMs = (windKph / 3.6).toFixed(2);
    const humidity = data.current.humidity;
    const weatherType = data.current.condition.text;
    const weatherImg = data.current.condition.icon;

    const weatherContainer = $('#js-weather-container');
    weatherContainer.empty();

    const currentInfo = `
      <div class="current-info">
        <div>
          <p id="city">${city}</p>
          <div>(<span id="date">${localtime}</span>)</div>
        </div>
        <div>
          <p>Temperature:</p>
          <div id="temperature">${tempC}<span>°C</span></div>
        </div>
        <div>
          <p>Wind:</p>
          <div id="wind">${windMs} <span>M/S</span></div>
        </div>
        <div>
          <p>Humidity:</p>
          <div id="humidity">${humidity}<span>%</span></div>
        </div>
      </div>
    `;

    const currentWeather = `
      <div class="current-weather">
        <img id="weather-img" src="${weatherImg}" alt="" width="70px" height="70px">
        <p id="weather-type">${weatherType}</p>
      </div>
    `;

    weatherContainer.append(currentInfo);
    weatherContainer.append(currentWeather);
  }

  const renderForecast = (forecast) => `
    <div>
      <div>
        <p>(<span class="future-date">${forecast.date}</span>)</p>
      </div>
      <div>
        <img src="${forecast.day.condition.icon}" alt="" width="40px" height="40px">
      </div>
      <div>
        <div>
          <span>Temp: <span class="temp-future">${forecast.day.avgtemp_c}<span>°C</span></span>
        </div>
        <div>
          <span>Wind: <span class="wind-future">${forecast.day.maxwind_kph}<span>KPH</span></span>
        </div>
        <div>
          <span>Humidity: <span class="humidity-future">${forecast.day.avghumidity}<span>%</span></span>
        </div>
      </div>
    </div>
  `;

  const renderForecastContent = (forecasts) => forecasts.slice(1).map(renderForecast).join('');

  const updateForecastContent = async (location = '', days = 5) => {
    let query = { location: location, days: days };
    const forecastData = await fetchForecastsWeather(query);
    if (forecastData) {
      $('.js-forecasts').html(renderForecastContent(forecastData.forecastday));
    }
  };

  searchInput.on('input', function () {
    const query = $(this).val();
    if (query.length > 0) {
      fetchSuggestions(query);
    } else {
      suggestions.hide();
    }
  });

  $('#js-btn-search').on('click', function () {
    const location = searchInput.data('url');
    fetchCurrentWheather(location);
    updateForecastContent(location);
  });

  $('#js-btn-current-location').on('click', function () {
    fetchCurrentWheather();
    updateForecastContent();
    searchInput.val('').data('url', '');
  });

  suggestions.on('click', 'p', function () {
    const url = $(this).data('url');
    const val = $(this).text();
    searchInput.val(val).data('url', url);
    suggestions.hide();
  });

  fetchCurrentWheather();
  updateForecastContent();

});
