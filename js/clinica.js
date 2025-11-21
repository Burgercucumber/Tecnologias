/**
 * clinica.js
 * Carga dinámica de datos de la clínica
 * Ubicación: /js/clinica.js
 */

console.log('🏥 clinica.js cargado!');

// ========== VARIABLES GLOBALES ==========
let CLINICA_ID = null;
let CLINICA_NOMBRE = '';
let CLINICA_DATA = null; // Guardar datos completos

// Obtener ID de la URL
const urlParams = new URLSearchParams(window.location.search);
CLINICA_ID = parseInt(urlParams.get('id')) || 1;

console.log('🔍 Cargando clínica ID:', CLINICA_ID);

// ========== HELPERS ==========
function formatearCOP(valor) {
  return Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

// ========== CARGA DE DATOS ==========
async function loadClinica() {
  try {
    // Intentar cargar desde PHP primero
    let response = await fetch(`../php/get_clinica.php?id=${CLINICA_ID}`);

    // Si PHP no funciona, cargar directamente desde JSON
    if (!response.ok) {
      console.warn('⚠️ PHP no disponible, cargando desde JSON...');
      response = await fetch('../json/clinicas.json');
      const data = await response.json();
      const clinicaData = data.clinicas.find(c => c.id === CLINICA_ID);

      if (!clinicaData) throw new Error('Clínica no encontrada');

      CLINICA_DATA = clinicaData;
      renderClinica(clinicaData);
      return;
    }

    // Respuesta exitosa desde PHP
    const clinicaData = await response.json();

    if (clinicaData.error) {
      throw new Error(clinicaData.error);
    }

    console.log('✅ Datos cargados:', clinicaData);
    CLINICA_DATA = clinicaData;
    renderClinica(clinicaData);

  } catch (error) {
    console.error('❌ Error cargando clínica:', error);
    alert('Error al cargar la clínica. Verifica que los archivos estén configurados correctamente.');
    window.location.href = '../index.html';
  }
}

// ========== RENDER PRINCIPAL ==========
function renderClinica(clinica) {
  CLINICA_NOMBRE = clinica.nombre;

  // Título
  document.title = `${clinica.nombre} | OdontoGo`;

  // Logo lateral
  const logo = document.getElementById('clinica-logo');
  if (logo) {
    logo.src = clinica.logo || '';
    logo.alt = clinica.nombre || '';
  }

  // Contacto
  const contactoList = document.getElementById('contacto-list');
  if (contactoList) {
    contactoList.innerHTML = `
      <li><span class="lbl">Odontología</span></li>
      <li><span class="lbl">Nombre</span><span class="val">${clinica.nombre}</span></li>
      ${clinica.email ? `<li><span class="lbl">Email</span><span class="val">${clinica.email}</span></li>` : ''}
      ${clinica.numero ? `<li><span class="lbl">Número</span><span class="val">${clinica.numero}</span></li>` : ''}
    `;
  }

  // Acerca de
  if (clinica.acerca) {
    const panelAcerca = document.getElementById('panel-acerca');
    const acercaText  = document.getElementById('acerca-text');
    if (panelAcerca) panelAcerca.style.display = 'block';
    if (acercaText)  acercaText.textContent = clinica.acerca;
  }

  // Tratamientos (chips que abren modal)
  if (clinica.tratamientos && clinica.tratamientos.length > 0) {
    const panelTrat = document.getElementById('panel-tratamientos');
    const chipsContainer = document.getElementById('tratamientos-chips');

    if (panelTrat) panelTrat.style.display = 'block';

    if (chipsContainer) {
      chipsContainer.innerHTML = clinica.tratamientos
        .map((t, idx) => `
          <button type="button"
                  class="chip js-trat-chip"
                  data-trat-index="${idx}">
            ${t.nombre}
          </button>
        `)
        .join('');
    }
  }

  // Experiencia
  if (clinica.experinencia) {
    const panelExp = document.getElementById('panel-experiencia');
    if (panelExp) panelExp.style.display = 'block';
    const expVal = document.getElementById('experiencia-value');
    if (expVal) expVal.textContent = clinica.experinencia;
  }

  // Ratings
  const ratingValue = document.getElementById('rating-value');
  const reviewsCount = document.getElementById('reviews-count');
  if (ratingValue)  ratingValue.textContent  = `${clinica.rating} Estrellas`;
  if (reviewsCount) reviewsCount.textContent = `De ${clinica.reviews} pacientes`;

  renderStars(clinica.rating);
  renderReviews(clinica);

  // Interacciones generales (favoritos, compartir, reseñas, certificado)
  initInteractions();

  // Interacciones específicas del modal de tratamientos + pago
  initTratamientosOverlay(clinica);
}

// ========== ESTRELLAS ==========
function renderStars(rating) {
  const starsPreview = document.getElementById('stars-preview');
  if (!starsPreview) return;

  starsPreview.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('i');
    star.textContent = '★';
    if (i > Math.floor(rating)) {
      star.style.color = '#c5cbd3';
    }
    starsPreview.appendChild(star);
  }
  starsPreview.setAttribute('aria-label', `${rating} de 5`);
}

// ========== RESEÑAS ==========
function renderReviews(clinica) {
  if (!clinica.reseñas || clinica.reseñas.length === 0) {
    console.log('No hay reseñas disponibles');
    return;
  }

  // Preview (primera reseña)
  const previewCard = document.querySelector('.reviews .review-card');
  if (previewCard && clinica.reseñas.length > 0) {
    const firstReview = clinica.reseñas[0];
    previewCard.innerHTML = `
      <div class="row">
        <p class="user">${firstReview.usuario}</p>
        <div class="stars" aria-label="${firstReview.calificacion} de 5">
          ${generateStarsHTML(firstReview.calificacion)}
        </div>
      </div>
      <p class="txt">${firstReview.comentario}</p>
    `;
  }

  // Resto en el modal
  const reviewsGrid = document.querySelector('#overlay-reviews .reviews-grid');
  if (reviewsGrid) {
    reviewsGrid.innerHTML = clinica.reseñas.map(review => `
      <div class="review-card">
        <div class="row">
          <p class="user">${review.usuario}</p>
          <div class="stars" aria-label="${review.calificacion} de 5">
            ${generateStarsHTML(review.calificacion)}
          </div>
        </div>
        <p class="txt">${review.comentario}</p>
      </div>
    `).join('');
  }
}

function generateStarsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      html += '<i>★</i>';
    } else {
      html += '<i style="color:#c5cbd3;">★</i>';
    }
  }
  return html;
}

// ========== INTERACCIONES GENERALES ==========
function initInteractions() {
  // ------- Favoritos -------
  const favKey = 'fav-clinica-' + CLINICA_ID;
  const btnFav = document.getElementById('btn-fav');

  if (btnFav) {
    const applyFav = (on) => {
      btnFav.classList.toggle('active', on);
      btnFav.setAttribute('aria-pressed', on);
    };

    try {
      applyFav(localStorage.getItem(favKey) === '1');
    } catch (e) {
      console.warn('localStorage no disponible');
    }

    btnFav.addEventListener('click', () => {
      const on = !btnFav.classList.contains('active');
      applyFav(on);
      try {
        localStorage.setItem(favKey, on ? '1' : '0');
      } catch (e) {}
    });
  }

  // ------- Compartir -------
  const btnShare  = document.getElementById('btn-share');
  const shareMenu = document.getElementById('share-menu');

  if (btnShare && shareMenu) {
    const url  = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Mira ' + CLINICA_NOMBRE + ' en OdontoGo: ');

    const wa = document.getElementById('share-wa');
    const fb = document.getElementById('share-fb');
    const x  = document.getElementById('share-x');
    const copyBtn = document.getElementById('share-copy');

    if (wa) wa.href = `https://wa.me/?text=${text}${url}`;
    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (x)  x.href  = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

    btnShare.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = shareMenu.getAttribute('aria-hidden') !== 'false';
      shareMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      btnShare.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          const old = shareMenu.innerHTML;
          shareMenu.innerHTML = '<div class="copied">¡Enlace copiado!</div>';
          setTimeout(() => (shareMenu.innerHTML = old), 1200);
        } catch (_) {
          alert('No se pudo copiar el enlace');
        }
      });
    }

    document.addEventListener('click', () => {
      shareMenu.setAttribute('aria-hidden', 'true');
      btnShare.setAttribute('aria-expanded', 'false');
    });
  }

  // ------- Modal certificado -------
  const overlayCert = document.getElementById('overlay-cert');
  const btnCert     = document.getElementById('btn-cert');
  const closeCert   = document.getElementById('cert-close');

  const openCert = () => {
    if (!overlayCert) return;
    overlayCert.classList.add('open');
    overlayCert.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCertModal = () => {
    if (!overlayCert) return;
    overlayCert.classList.remove('open');
    overlayCert.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (btnCert && overlayCert && closeCert) {
    btnCert.addEventListener('click', openCert);
    closeCert.addEventListener('click', closeCertModal);
    overlayCert.addEventListener('click', e => {
      if (e.target === overlayCert) closeCertModal();
    });
  }

  // ------- Modal reseñas -------
  const overlayReviews = document.getElementById('overlay-reviews');
  const btnReviews     = document.getElementById('open-reviews');
  const closeReviews   = document.getElementById('reviews-close');

  const openReviews = (e) => {
    if (e) e.preventDefault();
    if (!overlayReviews) return;
    overlayReviews.classList.add('open');
    overlayReviews.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeReviewsModal = () => {
    if (!overlayReviews) return;
    overlayReviews.classList.remove('open');
    overlayReviews.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (overlayReviews && btnReviews && closeReviews) {
    btnReviews.addEventListener('click', openReviews);
    closeReviews.addEventListener('click', closeReviewsModal);
    overlayReviews.addEventListener('click', e => {
      if (e.target === overlayReviews) closeReviewsModal();
    });
  }

  // ESC para estos dos
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCertModal();
      closeReviewsModal();
    }
  });
}

// ========== MODAL DE TRATAMIENTOS + PAGO ==========
function initTratamientosOverlay(clinica) {
  const chipsContainer = document.getElementById('tratamientos-chips');
  const overlayTrat    = document.getElementById('overlay-trat');
  if (!chipsContainer || !overlayTrat) return;

  const closeBtn     = overlayTrat.querySelector('.overlay-close, #trat-close');
  const btnContactar = document.getElementById('btn-contactar');

  // 👉 FUNCIÓN CENTRAL: llena overlay Y prepara modal de pago
  const applyTratamiento = (tratamiento) => {
    if (!tratamiento) return;

    // ===== 1. Rellenar texto dentro del overlay de tratamiento =====
    const mapaValores = {
      'det-nombre'      : clinica.nombre,
      'det-rating'      : clinica.rating,
      'det-reviews'     : clinica.reviews,
      'det-ubicacion'   : `${clinica.ciudad}, ${clinica.barrio}`,
      'det-duracion'    : tratamiento.duracion || '—',
      'det-precio-total': formatearCOP(tratamiento.precio_total || 0),
      'det-precio-proc' : formatearCOP(tratamiento.precio_proc  || 0),
      'det-precio-rev'  : formatearCOP(tratamiento.precio_rev   || 0),
      'det-modalidad'   : tratamiento.modalidad || '—'
    };

    Object.keys(mapaValores).forEach(id => {
      const el = overlayTrat.querySelector(`#${id}`);
      if (el && mapaValores[id] != null) el.textContent = mapaValores[id];
    });

    const tituloEl = overlayTrat.querySelector('#det-titulo');
    const descEl   = overlayTrat.querySelector('#det-descripcion');
    const beneUl   = overlayTrat.querySelector('#det-beneficios');
    const logoEl   = overlayTrat.querySelector('#det-logo');

    if (tituloEl) tituloEl.textContent = tratamiento.detalle?.titulo || tratamiento.nombre || '—';
    if (descEl)   descEl.textContent   = tratamiento.detalle?.descripcion || 'Selecciona un tratamiento para ver más información.';

    if (beneUl) {
      beneUl.innerHTML = '';
      const beneficios = tratamiento.detalle?.beneficios || [];
      beneficios.forEach(txt => {
        const li = document.createElement('li');
        li.textContent = txt;
        beneUl.appendChild(li);
      });
    }

    if (logoEl) {
      if (clinica.logo) {
        logoEl.src = clinica.logo;
        logoEl.style.display = 'block';
      } else {
        logoEl.style.display = 'none';
      }
    }

    // ===== 2. Construir el objeto que usaremos para PAGO =====
    const modalInfo = {
      id                : clinica.id,
      nombre            : clinica.nombre,
      ciudad            : clinica.ciudad,
      barrio            : clinica.barrio,
      tratamiento_id    : tratamiento.id || null,
      tratamiento_nombre: tratamiento.nombre || 'Procedimiento',
      precio_total      : Number(tratamiento.precio_total) || 0,
      precio_proc       : Number(tratamiento.precio_proc)  || 0,
      precio_rev        : Number(tratamiento.precio_rev)   || 0
    };

    // Guardar en global (por si odg-pay.js lo usa)
    window.OdgCurrentClinic = modalInfo;

    // ===== 3. Actualizar resumen del modal de pago (igual que Search.html) =====
    const payProc       = document.getElementById('pay-proc');
    const payClin       = document.getElementById('pay-clinica');
    const payUbic       = document.getElementById('pay-ubicacion');
    const payPrecioProc = document.getElementById('pay-precio-proc');
    const payPrecioRev  = document.getElementById('pay-precio-rev');
    const payTotal      = document.getElementById('pay-total');
    const paySubmit     = document.getElementById('pay-submit');

    if (payProc)       payProc.textContent       = modalInfo.tratamiento_nombre;
    if (payClin)       payClin.textContent       = modalInfo.nombre;
    if (payUbic)       payUbic.textContent       = `${modalInfo.ciudad}, ${modalInfo.barrio}`;
    if (payPrecioProc) payPrecioProc.textContent = formatearCOP(modalInfo.precio_proc);
    if (payPrecioRev)  payPrecioRev.textContent  = formatearCOP(modalInfo.precio_rev);
    if (payTotal)      payTotal.textContent      = formatearCOP(modalInfo.precio_total);
    if (paySubmit)     paySubmit.textContent     = `Pagar ${formatearCOP(modalInfo.precio_total)}`;

    // ===== 4. Preparar el botón "Contactar" como disparador js-open-pay =====
    if (btnContactar) {
      btnContactar.classList.add('js-open-pay');
      btnContactar.dataset.proc       = modalInfo.tratamiento_nombre;
      btnContactar.dataset.precioProc = modalInfo.precio_proc;
      btnContactar.dataset.precioRev  = modalInfo.precio_rev;
      btnContactar.dataset.clinica    = modalInfo.nombre;
      btnContactar.dataset.ubicacion  = `${modalInfo.ciudad}, ${modalInfo.barrio}`;
      btnContactar.dataset.clinicaId  = modalInfo.id || '';
      btnContactar.dataset.ofertaId   = modalInfo.tratamiento_id || '';
    }

    // ===== 5. Avisar a odg-pay.js (mismo evento que en Search) =====
    document.dispatchEvent(new CustomEvent('odg:clinic-updated', {
      detail: {
        clinica_id          : modalInfo.id,
        oferta_id           : modalInfo.tratamiento_id,
        tratamiento_nombre  : modalInfo.tratamiento_nombre,
        precio_procedimiento: modalInfo.precio_proc,
        precio_revision     : modalInfo.precio_rev,
        clinica_nombre      : modalInfo.nombre,
        ubicacion_texto     : `${modalInfo.ciudad}, ${modalInfo.barrio}`
      }
    }));
  };

  const openOverlay = (tratamiento) => {
    applyTratamiento(tratamiento);
    overlayTrat.classList.add('open');
    overlayTrat.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeOverlay = () => {
    overlayTrat.classList.remove('open');
    overlayTrat.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Click en chips de tratamiento
  chipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.js-trat-chip');
    if (!chip) return;
    const idx = parseInt(chip.dataset.tratIndex, 10);
    const tratamiento = clinica.tratamientos?.[idx];
    if (tratamiento) {
      openOverlay(tratamiento);
      // 👉 si quieres que solo abra overlay y luego tú pulses Contactar, deja solo openOverlay(tratamiento)
      // si quieres que ADICIONALMENTE abra pago directo, descomenta:
      // if (btnContactar) btnContactar.click();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay);
  }
  overlayTrat.addEventListener('click', e => {
    if (e.target === overlayTrat) closeOverlay();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeOverlay();
  });

  // Opcional: precargar primer tratamiento cuando se abre por primera vez
  if (clinica.tratamientos && clinica.tratamientos.length) {
    applyTratamiento(clinica.tratamientos[0]);
  }
}

// ========== INICIO ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadClinica);
} else {
  loadClinica();
}
