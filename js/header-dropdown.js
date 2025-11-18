/**
 * header-dropdown.js
 * Maneja los dropdowns del header (Tratamientos y Localidad)
 * + coordina el cierre con el menú de perfil.
 * Actualiza Search.html cuando se selecciona un tratamiento.
 */

console.log('🎮 header-dropdown.js cargado');

(function () {
  'use strict';

  // Todos los chips que abren dropdowns
  const chipBtns = document.querySelectorAll('.chip-btn[data-dd]');
  let currentOpenDD = null;

  // Referencias al menú de perfil (para coordinar cierres)
  const profileMenu    = document.getElementById('profileMenu');
  const profileTrigger = document.getElementById('profileTrigger');

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

  /* =========================
   * Helpers de apertura/cierre
   * ========================= */

  function closeAllChips() {
    document.querySelectorAll('.dd-panel.open').forEach(panel => {
      panel.classList.remove('open');
    });
    chipBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    currentOpenDD = null;
  }

  function closeProfile() {
    if (!profileMenu || !profileTrigger) return;
    profileMenu.classList.remove('open');
    profileTrigger.setAttribute('aria-expanded', 'false');
  }

  function positionPanel(panel, btn) {
    const rect = btn.getBoundingClientRect();
    const top  = rect.bottom + window.scrollY + 8;
    const left = rect.left   + window.scrollX;

    panel.style.position = 'absolute';
    panel.style.top      = top + 'px';
    panel.style.left     = left + 'px';
    panel.style.minWidth = rect.width + 'px';
  }

  /* =========================
   * Lógica de chips + opciones
   * ========================= */

  chipBtns.forEach((btn) => {
    const ddId  = btn.dataset.dd;
    const panel = document.getElementById(ddId);
    if (!panel) return;

    // Abrir/cerrar dropdown al click en el chip
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = panel.classList.contains('open');

      // Cerrar otros chips y el perfil
      closeAllChips();
      closeProfile();

      if (!isOpen) {
        panel.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        positionPanel(panel, btn);
        currentOpenDD = panel;
      } else {
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        currentOpenDD = null;
      }
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

        // 🔥 Si estamos en Search.html, actualizar filtros
        if (window.location.pathname.includes('Search.html')) {
          handleSearchPageSelection(ddId, value);
        } else {
          // Si NO estamos en Search.html, navegar a Search.html con el parámetro
          if (ddId === 'dd-tratamientos') {
            const basePath = window.location.pathname.includes('/Pages/') ? '' : 'Pages/';
            window.location.href = `${basePath}Search.html?tratamiento=${value}`;
          }
          // Para dd-localidad fuera de Search.html no hacemos nada especial (podrías añadir navegación si quieres)
        }
      });
    });
  });

  /* =========================
   * Lógica específica de Search.html
   * ========================= */

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

      if (window.filtrarPorBarrio) {
        window.filtrarPorBarrio(value);

        const locationLabel = document.getElementById('location-label');
        if (locationLabel) {
          locationLabel.textContent = value || 'Todas las localidades';
        }
      } else {
        console.warn('⚠️ window.filtrarPorBarrio no está disponible');
      }
    }
  }

  /* =========================
   * Cierre global (click fuera / Escape)
   * ========================= */

  // Si se hace click en el perfil, cerramos chips (pero NO tocamos el toggle del perfil,
  // eso ya lo maneja header-loader/initProfileMenu).
  if (profileTrigger) {
    profileTrigger.addEventListener('click', () => {
      closeAllChips();
    });
  }

  // Cerrar dropdowns y perfil al hacer clic fuera
  document.addEventListener('click', (e) => {
    const clickInChip      = e.target.closest('.chip-btn');
    const clickInPanel     = e.target.closest('.dd-panel');
    const clickInProfile   = e.target.closest('#profileMenu') || e.target.closest('.profile-dropdown');
    const clickInProfileTr = e.target.closest('#profileTrigger');

    if (!clickInChip && !clickInPanel && !clickInProfile && !clickInProfileTr) {
      closeAllChips();
      closeProfile();
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllChips();
      closeProfile();
    }
  });

  // API global opcional (por si necesitas cerrar desde otros scripts)
  window.__odgDropdowns = {
    closeAll: function () {
      closeAllChips();
      closeProfile();
    }
  };

  console.log('✅ Dropdowns del header inicializados');
})();
