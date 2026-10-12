const API_KEY = 'a51df9b01c944c22d31e89e81d80a907'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('search');
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');


// ============================================================================
// UTILIDADES DE UI (DADO - no modificar)
// ============================================================================
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};


// ============================================================================
// DARK MODE (DADO - no modificar)
// ============================================================================
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();

const obtenerSeries = async () => {
    const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    
    const datos = await respuesta.json();
    return datos.results;
}
const crearTarjeta = (serie) => {
    const { title, first_air_date, vote_average, poster_path } = serie;
    const titulo = serie.name || 'Título desconocido';
    const año = first_air_date ? first_air_date.split('-')[0] : 'N/A';
    const image = poster_path ? `${IMAGE_URL}${poster_path}` : '';
    const rating = (vote_average || vote_average === 0) ? vote_average.toFixed(1) : 'N/A';
    
    return `
        <article class="serie-card">
            <div class="serie-card__poster">
                <img class="serie-card__image" src="${image}" alt="${title}">
                <span class="serie-card__rating">${rating}</span>
            </div>
            <div>
                <h3 class="serie-card__title">${titulo}</h3>
                <p class="serie-card__year">${año}</p>
            </div>
        </article>
    `;
}

const buscarSeries = async (texto) => {
    if (!texto || texto.trim() === '') {
        return obtenerSeries();
    }

    const query = encodeURIComponent(texto.trim());
    const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${query}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    return datos.results;
}

let timeoutBusqueda = null;

searchInput.addEventListener('input', (evento) => {
    const texto = evento.target.value;
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(async () => {
        console.log(`Buscando series: ${texto}`);
        mostrarLoading();
        try {
            const series = await buscarSeries(texto);
            ocultarLoading();
            if (!series || series.length === 0) {
                seriesGrid.innerHTML = `<p>No hay series: ${texto}</p>`;
                return;
            }
            seriesGrid.innerHTML = series.map(crearTarjeta).join('');
            console.log(`${series.length} resultados: ${texto}`);
        } catch (error) {
            console.error('Error al buscar:', error);
            mostrarError('Error al buscar series. Intenta de nuevo');
        }
    }, 500);
});

clearBtn.addEventListener('click', async () => {

    searchInput.value = '';

    mostrarLoading();
    try {
        const series = await obtenerSeries();
        ocultarLoading();
        seriesGrid.innerHTML = series.map(crearTarjeta).join('');
        resultsTitle.textContent = 'Series Populares';
        resultsCount.textContent = `${series.length} resultados`;
        console.log('Búsqueda limpiada y series populares recargadas');
    } catch (error) {
        console.error('Error cargar series:', error);
        mostrarError('No se pudo cargar series');
    }
});

const obtenerDetalleSerie = async (id) => {
    const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    return datos;
};

const mostrarModal = (serie) => {
    const generos = serie.genres.map(g => g.name).join(', ') || 'N/A';

    modalBody.innerHTML = `
        <h2>${serie.name}</h2>
            <p><strong>Sinopsis:</strong> ${serie.overview || 'No disponible'}</p>
            <p><strong>Temporadas:</strong> ${serie.number_of_seasons}</p>
            <p><strong>Episodios:</strong> ${serie.number_of_episodes}</p>
            <p><strong>Géneros:</strong> ${generos}</p>
            <p><strong>Estado:</strong> ${serie.status}</p>
    `;

    modal.style.display = 'block';
};

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});
modalOverlay.addEventListener('click', () => {
    modal.style.display = 'none';
});

seriesGrid.addEventListener('click', async (evento) => {
    const card = evento.target.closest('.serie-card');
    if (!card) return;

    const index = Array.from(seriesGrid.children).indexOf(card);
    const textoBusqueda = searchInput.value.trim();
    try {
        const series = textoBusqueda ? await buscarSeries(textoBusqueda) : await obtenerSeries();
        const serieSeleccionada = series[index];

        const detalles = await obtenerDetalleSerie(serieSeleccionada.id);
        mostrarModal(detalles);
    } catch (error) {
        console.error('Error al obtener detalles de la serie:', error);
        mostrarError('No se pudieron cargar los detalles de la serie');
    }
});

const iniciar = async () => {
    console.log('Mostrar serie');
    mostrarLoading();
    try {
        const series = await obtenerSeries();
        console.log(`${series.length} series obtenidas`);
        ocultarLoading();
        seriesGrid.innerHTML = series.map(crearTarjeta).join('');
        console.log('Series renderizadas con éxito');
    } catch (error) {
        console.error('Error al cargar:', error);
        let mensaje = 'No se pudo cargar Series';
        
        if (error.message.includes('401')) {
            mensaje = 'API key inválida, verifica tu clave';
        } else if (error.message.includes('Failed to fetch')) {
            mensaje = 'Error de conexión. Revisa tu internet';
        }
        mostrarError(mensaje);
    }
}

iniciar();

