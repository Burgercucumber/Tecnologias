// js/perfil.js

// Lista de secciones válidas
const VALID_SECTIONS = [
  'info',
  'favoritos',
  'historial',
  'agenda',
  'pagos',
  'configuracion',
  'recomendaciones'
];

// Alias -> sección real (por si llega otra palabra desde ?tab=)
const TAB_TO_SECTION = {
  info: 'info',
  informacion: 'info',
  favoritos: 'favoritos',
  historial: 'historial',
  agenda: 'agenda',
  alertas: 'agenda',      // alias
  pagos: 'pagos',
  configuracion: 'configuracion',
  ajustes: 'configuracion', // alias
  recomendaciones: 'recomendaciones',
  reco: 'recomendaciones'   // alias
};

function showSection(sectionId, updateUrl = true) {
  const sections = document.querySelectorAll('.perfil-info');
  const tabs     = document.querySelectorAll('.opciones [data-section], .recomendaciones[data-section]');

  // Validación
  if (!VALID_SECTIONS.includes(sectionId)) sectionId = 'info';

  // Mostrar/ocultar secciones
  sections.forEach(s => {
    s.classList.toggle('active', s.id === sectionId);
    s.hidden = (s.id !== sectionId);
  });

  // Estado visual del menú
  tabs.forEach(t => {
    const isActive = t.dataset.section === sectionId;
    t.classList.toggle('activo', isActive);
    if (t.hasAttribute('aria-selected')) {
      t.setAttribute('aria-selected', String(isActive));
    }
  });

  // Actualiza URL (sin recargar) para conservar pestaña
  if (updateUrl && 'URLSearchParams' in window) {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', sectionId);
    history.replaceState({}, '', url);
  }
}

function handleMenuClicks() {
  const container = document.querySelector('.menu-lateral');
  if (!container) return;

  // Click en items de la UL
  container.addEventListener('click', (e) => {
    const target = e.target.closest('[data-section]');
    if (!target) return;
    e.preventDefault();
    const section = target.dataset.section;
    showSection(section, true);
  });

  // Navegación con teclado (Enter/Espacio)
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const target = e.target.closest('[data-section]');
    if (!target) return;
    e.preventDefault();
    showSection(target.dataset.section, true);
  });
}

function openSectionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const raw    = (params.get('tab') || '').toLowerCase();
  const mapped = TAB_TO_SECTION[raw] || 'info';
  showSection(mapped, false);
}

document.addEventListener('DOMContentLoaded', () => {
  // Oculta secciones no activas inicialmente (por accesibilidad)
  document.querySelectorAll('.perfil-info').forEach(s => {
    if (!s.classList.contains('active')) s.hidden = true;
  });

  handleMenuClicks();
  openSectionFromQuery();   // abre la pestaña indicada por ?tab=
});
