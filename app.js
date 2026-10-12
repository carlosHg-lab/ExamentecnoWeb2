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
    const { title, poster_path } = serie; 
    const image = poster_path ? `${IMAGE_URL}${poster_path}` : '';
    
    return `
        <article class="serie-card">
            <div class="serie-card__poster">
                <img class="serie-card__image" src="${image}" alt="${title}">
            </div>
        </article>
    `;
}

const iniciar = async () => {
    console.log('Mostrar serie');
    mostrarLoading();
    try {
        const series = await obtenerSeries();
        console.log(`${series.length} películas obtenidas`);
        ocultarLoading();
        seriesGrid.innerHTML = series.map(crearTarjeta).join('');
        console.log('Series renderizadas con éxito');
    } catch (error) {
        console.error('Error al cargar:', error);
        mostrarError(mensaje);
    }
}

iniciar();

// ############################################################################
// #                                                                          #
// #                          TU CÓDIGO AQUÍ                    #
// #                                                                          #
// ############################################################################
 
