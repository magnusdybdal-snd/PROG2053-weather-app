//#######################################################
//          JAVASCRIPT FOR DYNAMIC POST LOADING            
//#######################################################

let postsLoaded = 0;
let isFetchingPosts = false;
const limit = 9;

function fetchPosts() {
    if (isFetchingPosts) return;
    isFetchingPosts = true;

    // _start offsets the request so each call fetches the next page instead of repeating the first 9
    fetch(`https://jsonplaceholder.typicode.com/posts?_start=${postsLoaded}&_limit=${limit}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Error with the status: " + response.status);
        }
        return response.json();
    })
    .then((posts) => {
        // Most of code inspired/learned from the example in lecture:
        let container = document.getElementById("post-container");

        for (post of posts) {
                const article = document.createElement("article");
                const title = document.createElement("h1");
                title.textContent = post.title;
                const body = document.createElement("p");
                body.textContent = post.body;
                article.appendChild(title);
                article.appendChild(body);
                container.appendChild(article);
        }

        postsLoaded += posts.length;
        isFetchingPosts = false;

        // On tall viewports the page may still have no scrollbar after this batch,
        // meaning the user could never trigger a scroll event to load more. Keep
        // fetching until content overflows the viewport (or the API runs dry).
        if (posts.length > 0 && document.body.scrollHeight <= window.innerHeight) {
            fetchPosts();
        }
    })
}

// Scroll event listener
window.addEventListener("scroll", handleScroll);

// Detects and fetches more posts when the user hits the bottom of page
function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        fetchPosts(); 
    }
}

// Fetches initial posts when page loads
window.onload = function () {
    fetchPosts(); 
};

//####################################################
//          JAVASCRIPT FOR WEATHER UPDATES            
//####################################################

// Array with locations to display and their coordinates for use in API calls
const locations = [
    { id: 1, name: "Tokyo, Japan", latitude: 35.7, longitude: 139.6875 },
    { id: 2, name: "London, UK", latitude: 51.5074, longitude: -0.1278 },
    { id: 3, name: "New York, USA", latitude: 40.7128, longitude: -74.0060 },
    { id: 4, name: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093 },
    { id: 5, name: "Berlin, Germany", latitude: 52.52, longitude: 13.4050 },
    { id: 6, name: "Oslo, Norway", latitude: 59.9127, longitude: 10.7461},
    { id: 7, name: "Rome, Italy", latitude: 41.8919, longitude: 12.5113},
    { id: 8, name: "Dublin, Ireland", latitude: 53.3331, longitude: -6.2489},
    { id: 9, name: "Rio de Janeiro, Brazil", latitude: -22.9064, longitude: -43.1822},
    { id: 10, name: "Paris, France", latitude: 48.8534, longitude: 2.3488},

];

// Weathericons used based on weathercode provided by the API
// WMO code 4677: Present weather reported from a manned station.  
// https://artefacts.ceda.ac.uk/badc_datadocs/surface/code.html
function getWeatherIcon(weathercode) {
    if (weathercode == 0) {
        return "☀️";
    }
    else if (weathercode == 1) {
        return "🌤️"
    }
    else if (weathercode == 2) {
        return "⛅";
    }
    else if (weathercode >= 3 && weathercode <=39) {
        return "☁️";
    }
    else if (weathercode >= 40 && weathercode <= 49) {
        return "🌫️"
    }
    else if ((weathercode >= 50 && weathercode <=69) || (weathercode >= 80 && weathercode <= 84)) {
        return "🌧️"
    }
    else if ((weathercode >= 70 && weathercode <=79) || (weathercode >= 85 && weathercode <= 90)) {
        return "❄️";
    }
    else if (weathercode >= 91 && weathercode <= 99) {
        return "🌩️";
    }
    else return "❓"; // Default icon if unknown / error
}

// Fetch and update weather data for a single location
async function fetchWeather(location) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`);
        const data = await response.json();

        // Get the weather code and corresponding icon
        const weathercode = data.current_weather.weathercode;
        const weatherIcon = getWeatherIcon(weathercode);

        // Fetching and displaying chosen data
        document.getElementById(`temp-${location.id}`).textContent = data.current_weather.temperature;          // Temperature
        document.getElementById(`wind-${location.id}`).textContent = data.current_weather.windspeed;            // Wind Speed
        document.getElementById(`time-${location.id}`).textContent = data.current_weather.time.split('T')[1];   // Time (HH:MM)
        document.getElementById(`icon-${location.id}`).textContent = weatherIcon;                               // Weather icon
    } catch (error) {
        console.error("Error fetching weather data for", location.name, error);
    }
}

// Fetch and update weather for all locations
function updateWeatherData() {
    locations.forEach(location => {
        // createWeatherElement(location); // ONLY USED WITH DYNAMICALLY CREATING ELEMENTS (SEE LINE 122 -->)
        // Fetch the weather data and update the content
        fetchWeather(location);
    });
}

// Initial fetch
updateWeatherData();

// Update weather data every 30 seconds
setInterval(updateWeatherData, 30000);


/* 
*  ########################################################################################################################
*  # Below code could be used to dynamically create html elements instead of having them hard coded in the html document, #
*  # However, hardcoding is chosen as the locations is static and will not change (for performance)                       #
*  # Aditionally everything inside HTML container weatherdisplay would need to be removed from oblig1weather.html         #
*  ########################################################################################################################
*
* // Function to dynamically create weather elements for each location
* function createWeatherElement(location) {
*    const weatherSection = document.getElementById('weatherdisplay');
*
*   // Create the container div
*   const container = document.createElement('div');
*   container.classList.add('weather-container');
*   container.id = `location-${location.id}`;
*
*   // Create and append the location name
*   const locationName = document.createElement('h3');
*   locationName.textContent = `${location.name}`;
*   container.appendChild(locationName);
*
*   // Create and append the weather icon
*   const iconPara = document.createElement('p');
*   iconPara.id = "weathericon"
*   iconPara.innerHTML = `<span id="icon-${location.id}"></span>`;
*   container.appendChild(iconPara);
*
*   // Create and append the temperature paragraph
*   const tempPara = document.createElement('p');
*   tempPara.innerHTML = `Temperature: <span id="temp-${location.id}"></span>°C`;
*   container.appendChild(tempPara);
*
*   // Create and append the wind speed paragraph
*   const windPara = document.createElement('p');
*   windPara.innerHTML = `Wind Speed: <span id="wind-${location.id}"></span> km/h`;
*   container.appendChild(windPara);
*
*   // Create and append the time paragraph
*   const timePara = document.createElement('p');
*   timePara.innerHTML = `Time: <span id="time-${location.id}"></span>`;
*   container.appendChild(timePara);
*
*
*   // Append the container to the weather section
*   weatherSection.appendChild(container);
*}
*/
