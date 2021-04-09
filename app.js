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
let totalPages = 0;
let searchCityString = "";
let pagedFilteredCities = [];
let orderBy = 0; // -1 means descending, 1 means ascending, 0 means no sorting


async function getWeatherDetails() {
    let response = await fetch("https://raw.githubusercontent.com/Lokenath/JSON_DATA/master/data.json");
    let data = await response.json();
    return data; 
};

function init() {
    getWeatherDetails().then((data) => {
        weatherData = data;
        cities = weatherData.cities;
        filteredCities = cities;
        temperatureColor = weatherData.metadata.temperatureColor;
        pageSize = weatherData.metadata.pageSize;
        unit = weatherData.metadata.unit;
        weatherType = weatherData.metadata.weatherType;
        totalPages = Math.ceil(filteredCities.length / pageSize);
        renderPage();
    });
}

function renderPage() {
    let banner = document.querySelector("#banner");
    let weatherTypeDiv = document.createElement("div");
    weatherTypeDiv.classList.add("checkbox-div");
    let weatherTypeInnerHTML = '';
    weatherType.map((type) => {
        selectedTypes.push(type.toLowerCase());
        weatherTypeInnerHTML = weatherTypeInnerHTML + `<input type="checkbox" class="weather-type-checkbox" id=${type.toLowerCase()} checked onclick=onSelectWeatherType(this)>${type}</input>`
    });
    weatherTypeDiv.innerHTML = weatherTypeInnerHTML;
    banner.appendChild(weatherTypeDiv);
    filterCities();
    setPagination();
}

function setPagination() {
    totalPages = Math.ceil(filteredCities.length / pageSize);
    const nextPageBtn = document.querySelector("#next");
    const prevPageBtn = document.querySelector("#prev");
    if (totalPages === 0) {
        nextPageBtn.disabled = true;
        prevPageBtn.disabled = true;
    } else {
        if (currPage === totalPages - 1) {
            nextPageBtn.disabled = true;
        } else {
            nextPageBtn.disabled = false;
        }
        if (currPage === 0) {
            prevPageBtn.disabled = true;
        } else {
            prevPageBtn.disabled = false;
        }
    }
    pagedFilteredCities = filteredCities.slice(currPage*pageSize, (currPage+1)*pageSize);
    renderWeatherCards();
}

function onSelectWeatherType(cb) {
    if (weatherType.find(type => type.toLowerCase() === cb.id)) {
        if (cb.checked) {
            selectedTypes.push(cb.id);
        } else {
            selectedTypes = selectedTypes.filter(type => type.toLowerCase() !== cb.id);
        }
        filterCities();
    }
}

function renderWeatherCards() {
    const weatherCardsDiv = document.querySelector(".weather-container");
    if (weatherCardsDiv) {
        weatherCardsDiv.remove();
    }
    const paginationDiv = document.querySelector("#pagination-div");
    const outerContainer = document.querySelector("#outer-container");
    let weatherContainer = document.createElement("div");
    weatherContainer.classList.add("weather-container");
    let weatherCards = pagedFilteredCities.map(city => renderWeatherCard(city));
    weatherContainer.append(...weatherCards);
    outerContainer.insertBefore(weatherContainer, paginationDiv);
}

function renderWeatherCard(city) {
    let card = document.createElement('div');
    card.classList.add("city-card");
    card.id = `weather-card-${city.id}`;
    let color = temperatureColor.find(temp => city.temperature >= temp.range[0] && city.temperature <= temp.range[1])
    card.innerHTML = `<div class="city-name">${city.name}</div><div class="temperature-div"><div class="temp-div" style="color: ${color.color}">${city.temperature}</div><div class="degree-div">C</div></div><div class="weather-type">${city.type}</div>`;
    card.addEventListener("click", (event) => {
        event.stopPropagation();
        renderPopup(city);
    });
    return card;
}

function filterCities() {
    currPage = 0;
    let filteredCitiesByName = cities;
    if (orderBy !== 0) {
        filteredCitiesByName = filteredCitiesByName.sort(function(a, b){return orderBy * (a.temperature - b.temperature)})
    }
    if (searchCityString !== "") {
        filteredCitiesByName = cities.filter(city => (city.name.toLowerCase()).includes(searchCityString));
    }
    filteredCities = filteredCitiesByName.filter(city => selectedTypes.includes(city.type.toLowerCase()));
    pagedFilteredCities = filteredCities.slice(currPage*pageSize, (currPage+1)*pageSize);
    setPagination();
    renderWeatherCards();
}

function onSortTemperature(button) {
    if (button.id === "asc") {
        orderBy = 1;
        button.disabled = true;
        document.querySelector("#dec").disabled = false;
    } else {
        orderBy = -1;
        button.disabled = true;
        document.querySelector("#asc").disabled = false;
    }
    filterCities();
}

function renderPopup(city) {
    let modal = document.getElementById("myModal");
    modal.style.display = "block";
    let modalContent = document.querySelector(".modal-content");
    let color = temperatureColor.find(temp => city.temperature >= temp.range[0] && city.temperature <= temp.range[1])
    modalContent.innerHTML = `<div class="city-name">${city.name}</div><div class="temperature-div"><div class="temp-div" style="color: ${color.color}">${city.temperature}</div><div class="degree-div">C</div></div><div class="weather-type">${city.type}</div><div class="weather-description">${city.description}</div>`;
}

document.querySelector("#search-cities").addEventListener("keyup", (event) => {
    searchCityString = event.target.value;
    filterCities();
});

document.querySelector("#next").addEventListener("click", () => {
    currPage += 1;
    setPagination();
});

document.querySelector("#prev").addEventListener("click", () => {
    currPage -= 1;
    setPagination();
});

window.onclick = function(event) {
    if (event.target == document.getElementById("myModal")) {
        document.getElementById("myModal").style.display = "none";
    }
  }

init();