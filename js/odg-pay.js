// js/odg-pay.js
(function () {
  const $  = (s, r=document) => r.querySelector(s);

  const modal   = $('#pay-modal');
  const form    = $('#pay-form');
  const btnPay  = $('#pay-submit');
  const payProc = $('#pay-proc');
  const payClin = $('#pay-clinica');
  const payUbic = $('#pay-ubicacion');
  const pProc   = $('#pay-precio-proc');
  const pRev    = $('#pay-precio-rev');
  const pTotal  = $('#pay-total');
  const fDate   = $('#pay-date');
  const fTime   = $('#pay-time');

  if (!modal || !form) return;

  let currentCtx  = null;   // datos de la clínica/oferta seleccionada
  let currentUser = null;

  /* ==== Usuario de sesión ==== */
  if (window.OdgUser) currentUser = window.OdgUser;

  document.addEventListener('odg:user-ready', e => {
    currentUser = e.detail;
    const email = $('#pemail');
    const tel   = $('#pphone');
    if (email && !email.value && currentUser.email)    email.value = currentUser.email;
    if (tel   && !tel.value   && currentUser.telefono) tel.value   = currentUser.telefono;
  });

  /* ==== Años de expiración ==== */
  (function fillYears() {
    const sel = $('#expyear');
    if (!sel) return;
    const now  = new Date();
    const base = now.getFullYear();
    for (let i = 0; i < 10; i++) {
      const y = base + i;
      const op = document.createElement('option');
      op.value = String(y).slice(-2); // "25"
      op.textContent = y;             // "2025"
      sel.appendChild(op);
    }
  })();

  /* ==== Helpers ==== */
  const fmtCOP = n =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(n || 0);

  function openModal(ctx) {
    currentCtx = ctx;

    payProc.textContent = ctx.procedimiento || 'Procedimiento';
    payClin.textContent = ctx.clinica || 'Clínica';
    payUbic.textContent = ctx.ubicacion || '';

    pProc.textContent  = fmtCOP(ctx.precioProc);
    pRev.textContent   = fmtCOP(ctx.precioRev);
    pTotal.textContent = fmtCOP(ctx.precioTotal);

    btnPay.textContent = 'Pagar ' + fmtCOP(ctx.precioTotal);

    modal.hidden = false;
    $('#cardname')?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    form.reset();
    currentCtx = null;
  }

  /* ==== Abrir / cerrar modal ==== */
  modal.addEventListener('click', e => {
    if (e.target.matches('.backdrop,[data-pay-close]')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* ==== Vincular botón .js-open-pay del hero ==== */
  function getCtxFromDOM(btn) {
    // lee de data-* si existen, si no de los <span id="det-...">
    const detNombre   = $('#det-nombre');
    const detTitulo   = $('#det-titulo');
    const detUbic     = $('#det-ubicacion');
    const detPrecioP  = $('#det-precio-proc');
    const detPrecioR  = $('#det-precio-rev');

    const precioProc = Number(btn.dataset.precioProc || detPrecioP?.dataset.raw || 0);
    const precioRev  = Number(btn.dataset.precioRev  || detPrecioR?.dataset.raw || 0);

    return {
      procedimiento : btn.dataset.proc      || detTitulo?.textContent?.trim()   || 'Procedimiento',
      clinica       : btn.dataset.clinica   || detNombre?.textContent?.trim()   || 'Clínica',
      ubicacion     : btn.dataset.ubicacion || detUbic?.textContent?.trim()     || '',
      precioProc,
      precioRev,
      precioTotal   : precioProc + precioRev,
      clinicaId     : btn.dataset.clinicaId || detNombre?.dataset.clinicaId || null,
      ofertaId      : btn.dataset.ofertaId  || detNombre?.dataset.ofertaId  || null
    };
  }

  const payBtn = $('.js-open-pay');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      const ctx = getCtxFromDOM(payBtn);
      openModal(ctx);
    });
  }

  // Si clinicas.js notifica cuando cambias de clínica, actualizamos data-* del botón
  document.addEventListener('odg:clinic-updated', e => {
    const info = e.detail || {};
    const btn  = $('.js-open-pay');
    if (!btn) return;

    btn.dataset.clinicaId   = info.clinica_id        || '';
    btn.dataset.ofertaId    = info.oferta_id         || '';
    btn.dataset.proc        = info.tratamiento_nombre || info.tratamiento || '';
    btn.dataset.precioProc  = info.precio_procedimiento || info.precio_proc || 0;
    btn.dataset.precioRev   = info.precio_revision      || info.precio_rev  || 0;
    btn.dataset.clinica     = info.clinica_nombre    || info.clinica || '';
    btn.dataset.ubicacion   = info.ubicacion_texto   || info.ubicacion || '';
  });

  /* ==== Submit del pago ==== */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentCtx) {
      alert('Primero selecciona una clínica/oferta.');
      return;
    }
    if (!currentUser || !currentUser.id) {
      alert('Debes iniciar sesión para registrar el pago.');
      return;
    }

    const fallbackClinic = window.OdgCurrentClinic || {};
    const ctxClinicId    = currentCtx.clinicaId || fallbackClinic.id || null;
    const ctxOfertaId    = currentCtx.ofertaId  || fallbackClinic.tratamiento_id || null;
    const ctxProcName    = currentCtx.procedimiento || fallbackClinic.tratamiento_nombre || '';
    const ctxMontoProc   = Number.isFinite(currentCtx.precioProc)
      ? currentCtx.precioProc
      : Number(fallbackClinic.precio_proc || 0);
    const ctxMontoRev    = Number.isFinite(currentCtx.precioRev)
      ? currentCtx.precioRev
      : Number(fallbackClinic.precio_rev || 0);
    const ctxMontoTotal  = ctxMontoProc + ctxMontoRev;

    if (!ctxClinicId) {
      alert('No se pudo determinar la clínica seleccionada. Vuelve a elegir una clínica.');
      return;
    }

    const payload = {
      usuario_id         : currentUser.id,
      clinica_id         : ctxClinicId,
      oferta_id          : ctxOfertaId,
      procedimiento      : ctxProcName,
      monto_procedimiento: ctxMontoProc,
      monto_revision     : ctxMontoRev,
      monto_total        : ctxMontoTotal,
      fecha_cita         : fDate.value,
      hora_cita          : fTime.value,
      cardname           : $('#cardname').value.trim(),
      cardlast4          : $('#cardnumber').value.replace(/\s+/g, '').slice(-4),
      email_contacto     : $('#pemail').value.trim(),
      telefono_contacto  : $('#pphone').value.trim()
    };

    const prevTxt = btnPay.textContent;
    btnPay.disabled  = true;
    btnPay.textContent = 'Procesando...';

    try {
      const res  = await fetch('../php/registrar_pago.php', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload)
      });

      const raw = await res.text();   // <-- PRIMERO TEXTO
      let data;
      try {
        data = JSON.parse(raw);      // <-- LUEGO JSON
      } catch (parseErr) {
        console.error('Respuesta NO JSON de registrar_pago.php:', raw);
        throw new Error('El servidor devolvió una respuesta no válida:\n\n' + raw.slice(0, 300));
      }

      if (!data.ok) {
        throw new Error(data.error || 'No se pudo registrar el pago');
      }

      alert('Pago registrado correctamente (ID: ' + (data.pago_id || '—') + ').');
      closeModal();
      // si quieres, redirige al perfil:
      // location.href = '../Pages/PerfilC.html?tab=pagos';
    } catch (err) {
      alert(err.message || err);
    } finally {
      btnPay.disabled  = false;
      btnPay.textContent = prevTxt;
    }
  });
})();
