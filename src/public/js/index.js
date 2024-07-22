$(document).ready(function () {
  const searchInput = $('#js-search');

  const btnCurrentLocation = $('#js-btn-current-location');
  const btnforecastsMore = $('#js-btn-forecasts');
  const btnSubcribe = $('#js-btn-subscribe');
  const btnSearch = $('#js-btn-search');

  const suggestions = $('#sidebar .drop-down');
  const dayForecast = $('.js-day-forecast');
  const forecasts = $('.js-forecasts');
  const histories = $('.js-histories');

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/weather/generate-token', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }

      console.log('Token fetched and set in cookie');
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  async function fetchSuggestions(query) {
    try {
      const response = await $.ajax({
        url: `/api/weather/locations?location=${query}`,
        method: 'GET',
        dataType: 'json'
      });
      showSuggestions(response);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      suggestions.hide();
    }
  }

  async function fetchCurrentWeather(query) {
    let url = '/api/weather/current-weather';
    try {
      if (query) url += `?location=${query}`;

      const response = await $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
      });
      renderCurrentWeather(response);
    } catch (error) {
      console.error('Error fetching current weather:', error);
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
        method: 'GET',
        dataType: 'json'
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
          <span>Wind: <span class="wind-future">${(forecast.day.maxwind_kph/3.6).toFixed(2)}<span> M/S</span></span>
        </div>
        <div>
          <span>Humidity: <span class="humidity-future">${forecast.day.avghumidity}<span>%</span></span>
        </div>
      </div>
    </div>
  `;

  const renderForecastContent = (forecasts) => forecasts.slice(1).map(renderForecast).join('');

  const updateForecastContent = async (location, days = 5) => {
    let query = { location: location, days: days };
    const forecastData = await fetchForecastsWeather(query);
    if (forecastData) {
      forecasts.html('');
      forecasts.html(renderForecastContent(forecastData.forecastday));
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

  btnSearch.on('click', function () {
    const location = searchInput.data('url');
    dayForecast.text(4);
    fetchCurrentWeather(location);
    updateForecastContent(location);
    fetchHistory();
  });

  btnCurrentLocation.on('click', function () {
    fetchCurrentWeather();
    dayForecast.text(4);
    updateForecastContent();
    searchInput.val('').data('url', '');
    fetchHistory();
  });

  suggestions.on('click', 'p', function () {
    const url = $(this).data('url');
    const val = $(this).text();
    searchInput.val(val).data('url', url);
    suggestions.hide();
  });

  btnforecastsMore.on('click', function () {
    dayForecast.text(8);
    let location = searchInput.data('url');
    if (location) {
      updateForecastContent(location, 9);
    } else {
      updateForecastContent(null, 9);
    }
  });

  btnSubcribe.click(function () {
    var email = $('#js-email').val();

    if (email) {
      $.ajax({
        url: '/api/member/subscribe',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email: email }),
        success: function (response) {
          alert('Verification email sent');
        },
        error: function (xhr, status, error) {
          alert('Error: ' + xhr.responseText);
        }
      });
    } else {
      alert('Please enter a valid email address');
    }
  });

  const fetchHistory = async () => {
    try {
      const response = await $.ajax({
        url: '/api/weather/history',
        method: 'GET',
        dataType: 'json',
        xhrFields: { withCredentials: true },
      })

      renderHistory(response);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const renderHistory = (history) => {

    histories.empty();

    history.forEach(entry => {
      const historyItem = `
        <div>
          <div>
            <p><span class="future-date">${entry.data.location.name}/${entry.data.location.country} </br>${entry.data.current.last_updated}</span></p>
          </div>
          <div>
            <img src="${entry.data.current.condition.icon}" alt="" width="40px" height="40px">
          </div>
          <div>
            <div>
              <span>Temp: <span class="temp-future">${entry.data.current.temp_c}<span>°C</span></span>
            </div>
            <div>
              <span>Wind: <span class="wind-future">${(entry.data.current.wind_kph/3.6).toFixed(2)}<span> M/S</span></span>
            </div>
            <div>
              <span>Humidity: <span class="humidity-future">${entry.data.current.humidity}<span>%</span></span>
            </div>
          </div>
        </div>
      `;
      histories.append(historyItem);
    });
  };

  fetchToken();
  dayForecast.text(4);
  fetchCurrentWeather();
  updateForecastContent();
  fetchHistory();

});
