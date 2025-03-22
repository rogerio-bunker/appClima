const API_KEYS = {
    weather: 'b8223de9539d8288beb3bc4a73ced647',
    unsplash: 'ykqgAYvowygHI5mZzgH1wGA1kigu1qKKV22tFYYv_0E'
};

let carouselInterval;

document.getElementById('weather-form').addEventListener('submit', function (e) {
    e.preventDefault();
    getWeather();
});

async function getWeather() {
    const location = document.getElementById('location').value.trim();
    const weatherInfo = document.getElementById('weather-info');
    const forecastInfo = document.getElementById('forecast-info');
    const carouselContainer = document.getElementById('image-carousel');
    const loading = document.getElementById('loading');

    if (!location) {
        weatherInfo.innerHTML = "<p class='error-message'>Por favor, digite uma cidade!</p>";
        forecastInfo.innerHTML = "";
        carouselContainer.innerHTML = "";
        return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEYS.weather}&units=metric&lang=pt`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${API_KEYS.weather}&units=metric&lang=pt`;
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(location)}&client_id=${API_KEYS.unsplash}&per_page=5`;

    try {
        loading.style.display = 'block';
        weatherInfo.innerHTML = "";
        forecastInfo.innerHTML = "";
        carouselContainer.innerHTML = "";

        // Clima atual
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error('Cidade não encontrada!');
        const data = await response.json();

        const weatherDescription = data.weather[0].description;
        const capitalizedWeather = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
        const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

        weatherInfo.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="${weatherIcon}" alt="Ícone do clima">
            <p>Temperatura: <strong>${data.main.temp}°C</strong></p>
            <p>Clima: <strong>${capitalizedWeather}</strong></p>
            <p>Umidade: <strong>${data.main.humidity}%</strong></p>
            <p>Vento: <strong>${data.wind.speed} m/s</strong></p>
        `;

        // Previsão
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        let forecastHTML = `<h3>Previsão para os próximos dias:</h3>`;
        const displayedDates = new Set();

        forecastData.list.forEach(forecast => {
            const [date, hour] = forecast.dt_txt.split(' ');
            const today = new Date().toISOString().split('T')[0];

            if (date !== today && hour === '12:00:00' && displayedDates.size < 3) {
                const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
                const description = forecast.weather[0].description;
                forecastHTML += `
                    <div>
                        <strong>${new Date(date).toLocaleDateString()}</strong><br>
                        <img src="${icon}" alt="Ícone">
                        <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
                        <p>Temp: ${forecast.main.temp}°C</p>
                    </div>
                `;
                displayedDates.add(date);
            }
        });

        forecastInfo.innerHTML = forecastHTML;

        // Carrossel de imagens
        const unsplashResponse = await fetch(unsplashUrl);
        const unsplashData = await unsplashResponse.json();

        if (unsplashData.results && unsplashData.results.length > 0) {
            let carouselHTML = '';
            unsplashData.results.forEach((photo, index) => {
                carouselHTML += `<img src="${photo.urls.regular}" alt="${location}" class="carousel-image${index === 0 ? ' active' : ''}">`;

                if (index === 0) {
                    document.body.style.backgroundImage = `url('${photo.urls.regular}')`;
                }
            });
            carouselContainer.innerHTML = carouselHTML;

            initCarousel();
        }

    } catch (error) {
        weatherInfo.innerHTML = `<p class='error-message'>${error.message}</p>`;
        forecastInfo.innerHTML = "";
        carouselContainer.innerHTML = "";
    } finally {
        loading.style.display = 'none';
    }
}

function initCarousel() {
    const images = document.querySelectorAll('.carousel-image');
    let current = 0;

    images.forEach((img, i) => {
        img.classList.remove('active');
    });
    images[0].classList.add('active');

    if (carouselInterval) clearInterval(carouselInterval);

    carouselInterval = setInterval(() => {
        images[current].classList.remove('active');
        current = (current + 1) % images.length;
        images[current].classList.add('active');
    }, 3000);
}

async function setRandomBackground() {
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=nature&client_id=${API_KEYS.unsplash}`;

    try {
        const response = await fetch(unsplashUrl);
        const data = await response.json();

        if (data.urls && data.urls.regular) {
            document.body.style.backgroundImage = `url('${data.urls.regular}')`;
        }
    } catch (error) {
        console.error("Erro ao carregar imagem de fundo:", error);
    }
}

window.onload = setRandomBackground;
