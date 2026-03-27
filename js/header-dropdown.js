/**
 * header-dropdown.js
 * Maneja los dropdowns del header (Tratamientos y Localidad)
 * Ahora actualiza la página Search.html cuando se selecciona un tratamiento
 */

console.log('🎮 header-dropdown.js cargado');

(function () {
  const chipBtns = document.querySelectorAll('.chip-btn[data-dd]');
  let currentOpenDD = null;

  // Mapa de tratamientos (mismo del Search.html)
  const tratamientos = {
    'implante-dental': 'Implante dental',
    'diseno-sonrisa': 'Diseño de sonrisa',
    'blanqueamiento': 'Blanqueamiento dental',
    'ortodoncia': 'Tratamiento de Ortodoncia',
    'rehabilitacion-oral': 'Rehabilitación oral',
    'cirugia-maxilofacial': 'Cirugía Maxilofacial',
    'periodoncia': 'Periodoncia',
    'endodoncia': 'Endodoncia'
  };

  chipBtns.forEach((btn) => {
    const ddId = btn.dataset.dd;
    const panel = document.getElementById(ddId);
    if (!panel) return;

    // Abrir/cerrar dropdown
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = panel.classList.contains('open');

      // Cerrar cualquier dropdown abierto
      if (currentOpenDD && currentOpenDD !== panel) {
        currentOpenDD.classList.remove('open');
      }

      // Toggle del dropdown actual
      panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', !isOpen);

      // Posicionar el panel
      const rect = btn.getBoundingClientRect();
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.bottom + 4 + 'px';

      currentOpenDD = panel.classList.contains('open') ? panel : null;
    });

    // Click en opciones del dropdown
    const options = panel.querySelectorAll('.dd-option');
    options.forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = opt.dataset.value;

        console.log('📍 Opción seleccionada:', value);

        // Cerrar dropdown
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        currentOpenDD = null;

        // 🔥 NUEVO: Si estamos en Search.html, actualizar filtros
        if (window.location.pathname.includes('Search.html')) {
          handleSearchPageSelection(ddId, value);
        } else {
          // Si NO estamos en Search.html, navegar a Search.html con el parámetro
          if (ddId === 'dd-tratamientos') {
            const basePath = window.location.pathname.includes('/Pages/') ? '' : 'Pages/';
            window.location.href = `${basePath}Search.html?tratamiento=${value}`;
          }
        }
      });
    });
  });

  // 🆕 FUNCIÓN PARA MANEJAR SELECCIÓN EN SEARCH.HTML
  function handleSearchPageSelection(ddId, value) {
    if (ddId === 'dd-tratamientos') {
      console.log('🔄 Actualizando tratamiento en Search.html:', value);
      
      // Actualizar el nombre visible del tratamiento
      const nameEl = document.getElementById('filter-treatment-name');
      if (nameEl) {
        nameEl.textContent = tratamientos[value] || 'Tratamiento seleccionado';
      }

      // Actualizar la URL sin recargar la página
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('tratamiento', value);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.pushState({ tratamiento: value }, '', newUrl);

      // Aplicar el filtro si la función existe
      if (window.filtrarPorTratamiento) {
        window.filtrarPorTratamiento(value);
      } else {
        console.warn('⚠️ window.filtrarPorTratamiento no está disponible');
      }
    } else if (ddId === 'dd-localidad') {
      console.log('🔄 Actualizando localidad en Search.html:', value);
      
      // Aplicar filtro de barrio
      if (window.filtrarPorBarrio) {
        window.filtrarPorBarrio(value);
        
        // Actualizar label del botón de localidad
        const locationLabel = document.getElementById('location-label');
        if (locationLabel) {
          locationLabel.textContent = value || 'Todas las localidades';
        }
      }
    }
  }

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.chip-btn') && !e.target.closest('.dd-panel')) {
      document.querySelectorAll('.dd-panel.open').forEach((panel) => {
        panel.classList.remove('open');
      });
      chipBtns.forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
      });
      currentOpenDD = null;
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentOpenDD) {
      currentOpenDD.classList.remove('open');
      chipBtns.forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
      });
      currentOpenDD = null;
    }
  });

  console.log('✅ Dropdowns del header inicializados');
})();