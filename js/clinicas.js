// ========== VARIABLES GLOBALES PARA FILTROS ==========
const API_URL = '../php/clinicas.php';
let CLINICAS = {};
let currentClinicId = null;
let currentTratamiento = null; // 👈 NUEVO: Guardar tratamiento actual
let currentBarrio = null;      // 👈 NUEVO: Guardar barrio actual

// ========== FUNCIONES AUXILIARES ==========
function formatearCOP(valor) {
  return Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== CARGAR DATOS CON FILTROS COMBINADOS ==========
async function cargarClinicas() {
  console.log('🔍 Intentando cargar desde:', API_URL);
  
  try {
    // Construir URL con filtros activos
    let url = API_URL;
    const params = new URLSearchParams();
    
    if (currentTratamiento) {
      params.append('tratamiento', currentTratamiento);
    }
    
    if (currentBarrio) {
      params.append('barrio', currentBarrio);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    console.log('📡 URL completa:', url);
    
    const response = await fetch(url);
    console.log('📡 Respuesta recibida:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Datos recibidos:', data);

    if (data.error) {
      throw new Error(data.mensaje || 'Error del servidor');
    }

    // Convertir array a objeto indexado por ID
    CLINICAS = {};
    data.clinicas.forEach(c => {
      CLINICAS[c.id] = c;
    });

    console.log('✅ Clínicas cargadas:', Object.keys(CLINICAS).length);

    // Actualizar contador
    const countEl = document.getElementById('clinic-count');
    if (countEl) {
      countEl.textContent = data.total;
    }

    // Renderizar lista
    if (data.clinicas.length > 0) {
      renderizarLista(data.clinicas);
      renderizarDetalle(data.clinicas[0].id);
    } else {
      // Mostrar mensaje si no hay resultados
      const listEl = document.getElementById('clinics-list');
      if (listEl) {
        listEl.innerHTML = `
          <li class="loading" style="color: #6b7b86;">
            No se encontraron clínicas con los filtros seleccionados
          </li>
        `;
      }
    }

  } catch (error) {
    console.error('❌ Error completo:', error);
    const listEl = document.getElementById('clinics-list');
    if (listEl) {
      listEl.innerHTML = `
        <li class="loading" style="color: #c44;">
          ❌ Error: ${escapeHtml(error.message)}
          <br><small>Revisa la consola (F12) para más detalles</small>
          <br><small>Ruta intentada: ${API_URL}</small>
        </li>
      `;
    }
  }
}

// ========== FILTRAR POR TRATAMIENTO ==========
async function filtrarPorTratamiento(tratamientoId) {
  console.log('🔵 Filtrando por tratamiento:', tratamientoId);
  currentTratamiento = tratamientoId; // 👈 Guardar filtro activo
  await cargarClinicas(); // Recargar con filtros combinados
}

// ========== FILTRAR POR BARRIO ==========
async function filtrarPorBarrio(barrio) {
  console.log('📍 Filtrando por barrio:', barrio);
  currentBarrio = barrio || null; // 👈 Guardar filtro activo (null si es "Todos")
  await cargarClinicas(); // Recargar con filtros combinados
}

// ========== RENDERIZAR LISTA ==========
function renderizarLista(clinicas) {
  const list = document.getElementById('clinics-list');
  if (!list) return;
  
  list.innerHTML = '';

  clinicas.forEach(c => {
    const li = document.createElement('li');
    li.className = 'result-card';
    li.dataset.id = c.id;

    li.innerHTML = `
      <a class="result-link" href="Clinica.html?id=${encodeURIComponent(c.id)}" aria-labelledby="r${c.id}-tit">
        <div class="result-top">
          <h3 id="r${c.id}-tit">${escapeHtml(c.nombre)}</h3>
          <span class="badge-verificado" title="Verificado">
            <svg class="icon icon-verified" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#3ae78b" fill-rule="evenodd"
                d="M15.418 5.643a1.25 1.25 0 0 0-1.34-.555l-1.798.413a1.25 1.25 0 0 1-.56 0l-1.798-.413a1.25 1.25 0 0 0-1.34.555l-.98 1.564c-.1.16-.235.295-.395.396l-1.564.98a1.25 1.25 0 0 0-.555 1.338l.413 1.8a1.25 1.25 0 0 1 0 .559l-.413 1.799a1.25 1.25 0 0 0 .555 1.339l1.564.98c.16.1.295.235.396.395l.98 1.564c.282.451.82.674 1.339.555l1.798-.413a1.25 1.25 0 0 1 .56 0l1.799.413a1.25 1.25 0 0 0 1.339-.555l.98-1.564c.1-.16.235-.295.395-.395l1.565-.98a1.25 1.25 0 0 0 .554-1.34L18.5 12.28a1.25 1.25 0 0 1 0-.56l.413-1.799a1.25 1.25 0 0 0-.554-1.339l-1.565-.98a1.25 1.25 0 0 1-.395-.395zm-.503 4.127a.5.5 0 0 0-.86-.509l-2.615 4.426l-1.579-1.512a.5.5 0 1 0-.691.722l2.034 1.949a.5.5 0 0 0 .776-.107z"
                clip-rule="evenodd"/>
            </svg>
          </span>
        </div>
        <div class="result-rating">
          <strong>${c.rating}</strong>
          <svg class="icon icon-badge" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M9.153 5.408C10.42 3.136 11.053 2 12 2s1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182s.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776c.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18c-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506s-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452s-.674.15-1.328.452l-.596.274c-2.303 1.06-3.455 1.59-4.22 1.01c-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46c-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882S3.58 8.328 6.04 7.772l.636-.144c.699-.158 1.048-.237 1.329-.45s.46-.536.82-1.182z"/>
          </svg>
        </div>
        <p class="result-loc">${escapeHtml(c.ciudad)}, ${escapeHtml(c.barrio)}</p>
        <p class="result-precio">${formatearCOP(c.precio_total)}</p>
      </a>
    `;

    li.addEventListener('click', (e) => {
      const link = e.target.closest('.result-link');
      if (!link) return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
        return;
      }

      e.preventDefault();
      renderizarDetalle(c.id);
    });

    list.appendChild(li);
  });
}

// ========== RENDERIZAR DETALLE ==========
function renderizarDetalle(id) {
  const c = CLINICAS[id];
  if (!c) return;

  currentClinicId = id;

  // Marcar tarjeta activa
  document.querySelectorAll('.result-card').forEach(card => {
    card.classList.toggle('activa', card.dataset.id == id);
  });

  // Actualizar panel central (ahora los datos vienen directamente del registro)
  const elementos = {
    'det-nombre': c.nombre,
    'det-rating': c.rating,
    'det-reviews': c.reviews,
    'det-ubicacion': `${c.ciudad}, ${c.barrio}`,
    'det-duracion': c.duracion || '—',
    'det-precio-total': formatearCOP(c.precio_total),
    'det-precio-proc': formatearCOP(c.precio_proc),
    'det-precio-rev': formatearCOP(c.precio_rev),
    'det-modalidad': c.modalidad || '—'
  };

  Object.keys(elementos).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = elementos[id];
  });

  // Panel derecho
  const detalle = c.detalle || {};
  
  const tituloEl = document.getElementById('det-titulo');
  if (tituloEl) tituloEl.textContent = detalle.titulo || '—';
  
  const descripcionEl = document.getElementById('det-descripcion');
  if (descripcionEl) descripcionEl.textContent = detalle.descripcion || 'Selecciona una clínica para ver más información.';

  // Logo
  const logoEl = document.getElementById('det-logo');
  if (logoEl) {
    if (c.logo) {
      logoEl.src = c.logo;
      logoEl.style.display = 'block';
    } else {
      logoEl.style.display = 'none';
    }
  }

  // Beneficios
  const ul = document.getElementById('det-beneficios');
  if (ul) {
    ul.innerHTML = '';
    if (Array.isArray(detalle.beneficios)) {
      detalle.beneficios.forEach(txt => {
        const li = document.createElement('li');
        li.textContent = txt;
        ul.appendChild(li);
      });
    }
  }

  // Actualizar datos del modal de pago (si existe)
  actualizarModalPago(c);
}

// ========== ACTUALIZAR MODAL DE PAGO ==========
function actualizarModalPago(clinica) {
  if (!clinica) return;

  const info = {
    id                : clinica.id,
    nombre            : clinica.nombre,
    ciudad            : clinica.ciudad,
    barrio            : clinica.barrio,
    tratamiento_id    : clinica.tratamiento_id || null,
    tratamiento_nombre: clinica.tratamiento_nombre || clinica.tratamiento || 'Procedimiento',
    precio_total      : Number(clinica.precio_total) || 0,
    precio_proc       : Number(clinica.precio_proc)  || 0,
    precio_rev        : Number(clinica.precio_rev)   || 0
  };

  const payProc = document.getElementById('pay-proc');
  const payClin = document.getElementById('pay-clinica');
  const payUbic = document.getElementById('pay-ubicacion');
  const payPrecioProc = document.getElementById('pay-precio-proc');
  const payPrecioRev  = document.getElementById('pay-precio-rev');
  const payTotal      = document.getElementById('pay-total');
  const paySubmit     = document.getElementById('pay-submit');

  if (payProc)       payProc.textContent       = info.tratamiento_nombre;
  if (payClin)       payClin.textContent       = info.nombre;
  if (payUbic)       payUbic.textContent       = `${info.ciudad}, ${info.barrio}`;
  if (payPrecioProc) payPrecioProc.textContent = formatearCOP(info.precio_proc);
  if (payPrecioRev)  payPrecioRev.textContent  = formatearCOP(info.precio_rev);
  if (payTotal)      payTotal.textContent      = formatearCOP(info.precio_total);
  if (paySubmit)     paySubmit.textContent     = `Pagar ${formatearCOP(info.precio_total)}`;

  const payButton = document.querySelector('.js-open-pay');
  if (payButton) {
    payButton.dataset.proc       = info.tratamiento_nombre;
    payButton.dataset.precioProc = info.precio_proc;
    payButton.dataset.precioRev  = info.precio_rev;
    payButton.dataset.clinica    = info.nombre;
    payButton.dataset.ubicacion  = `${info.ciudad}, ${info.barrio}`;
    payButton.dataset.clinicaId  = info.id || '';
    payButton.dataset.ofertaId   = info.tratamiento_id || '';
  }

  window.OdgCurrentClinic = info;

  document.dispatchEvent(new CustomEvent('odg:clinic-updated', {
    detail: {
      clinica_id          : info.id,
      oferta_id           : info.tratamiento_id,
      tratamiento_nombre  : info.tratamiento_nombre,
      precio_procedimiento: info.precio_proc,
      precio_revision     : info.precio_rev,
      clinica_nombre      : info.nombre,
      ubicacion_texto     : `${info.ciudad}, ${info.barrio}`
    }
  }));
}

// ========== EXPONER FUNCIONES GLOBALES ==========
window.filtrarPorTratamiento = filtrarPorTratamiento;
window.filtrarPorBarrio = filtrarPorBarrio;

// ========== INICIAR AL CARGAR PÁGINA ==========
window.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay parámetros en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const tratamiento = urlParams.get('tratamiento');
  
  // Establecer filtro de tratamiento inicial
  if (tratamiento) {
    currentTratamiento = tratamiento;
  }
  
  // Cargar clínicas con filtros
  cargarClinicas();
});
