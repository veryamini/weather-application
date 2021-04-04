let temperatureColor;
let pageSize;
let unit;
let weatherType;
let weatherData;
let metadata;
let cities = [];
let filteredCities = [];
let currPage = 0;
let selectedTypes = [];

async function getWeatherDetails() {
    let response = await fetch("https://raw.githubusercontent.com/Lokenath/JSON_DATA/master/data.json");
    let data = await response.json();
    return data; 
};

function init() {
    getWeatherDetails().then((data) => {
        weatherData = data;
        renderPage(weatherData)
    });
    console.log("weatherData: ", weatherData);
}

function renderPage(weatherData) {
    console.log("fetched weatherData: ", weatherData);
    cities = weatherData.cities;
    temperatureColor = weatherData.metadata.temperatureColor;
    pageSize = weatherData.metadata.pageSize;
    unit = weatherData.metadata.unit;
    weatherType = weatherData.metadata.weatherType;
    let banner = document.getElementById("banner");
    let weatherTypeDiv = document.createElement("div");
    let weatherTypeInnerHTML = '';
    weatherType.map((type) => {
        selectedTypes.push(type.toLowerCase());
        weatherTypeInnerHTML = weatherTypeInnerHTML + `<input type="checkbox" class="weather-type-checkbox" id=${type.toLowerCase()} checked onclick=onSelectWeatherType(this)>${type}</input>`
    });
    weatherTypeDiv.innerHTML = weatherTypeInnerHTML;
    banner.appendChild(weatherTypeDiv);
    renderWeatherCards();
}

function onSelectWeatherType(cb) {
    console.log("came in sunny event handler")
    console.log(cb);
    console.log("id: ", cb.id);
    console.log("selectedTypes: ", selectedTypes);
    if (weatherType.find(type => type.toLowerCase() === cb.id)) {
        if (cb.checked) {
            selectedTypes.push(cb.id);
        } else {
            selectedTypes = selectedTypes.filter(type => type.toLowerCase() !== cb.id);
        }
        renderWeatherCards();
    }
}

function renderWeatherCards() {
    const weatherCardsDiv = document.querySelector(".weather-container");
    console.log("weatherCardsDiv: ", weatherCardsDiv);
    if (weatherCardsDiv) {
        weatherCardsDiv.remove();
    }
    console.log("came in render weather cards");
    console.log("render selectedTypes: ", selectedTypes);
    filteredCities = cities.filter(city => selectedTypes.includes(city.type.toLowerCase())).slice(currPage*pageSize, (currPage+1)*pageSize);
    console.log("filteredCities: ", filteredCities);
    const outerContainer = document.getElementById("outer-container");
    let weatherContainer = document.createElement("div");
    weatherContainer.classList.add("weather-container");
    let weatherCards = filteredCities.map(city => renderWeatherCard(city));
    weatherContainer.append(...weatherCards);
    outerContainer.appendChild(weatherContainer);
}



function renderWeatherCard(city) {
    let card = document.createElement('div');
    card.classList.add("city-card");
    let color = temperatureColor.find(temp => city.temperature >= temp.range[0] && city.temperature <= temp.range[1])
    card.innerHTML = `<div class="city-name">${city.name}</div><div class="temperature-div"><div class="temp-div" style="color: ${color.color}">${city.temperature}</div><div class="degree-div">C</div></div><div class="weather-type">${city.type}</div>`;
    return card;
}

init();