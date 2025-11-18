// js/perfil-edit.js

// Conversión fecha dd/mm/yyyy <-> yyyy-mm-dd
function ddmmyyyyToInput(v) {
  if (!v || !v.includes('/')) return '';
  const [d, m, y] = v.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function inputToDdMmYyyy(v) {
  if (!v || !v.includes('-')) return '';
  const [y, m, d] = v.split('-');
  return `${d}/${m}/${y}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const form    = document.getElementById('form-perfil');
  const msg     = document.getElementById('msg');
  const params  = new URLSearchParams(location.search);
  const backUrl = params.get('return') || './PerfilC.html?tab=info';

  if (!form) return;

  // 1) Cargar datos base desde el backend
  try {
    const resp = await fetch('../php/me.php');
    const data = await resp.json();

    if (!data.ok || !data.user) {
      // No hay sesión en backend → manda a login real
      location.href = './login.php';
      return;
    }

    const u = data.user;

    form.nombre.value   = u.nombre   || '';
    form.email.value    = u.email    || '';
    form.telefono.value = u.telefono || '';

    // Si el backend ya guarda nacimiento/ubicacion, también los usamos
    if (u.nacimiento) {
      // suponiendo que viene como dd/mm/yyyy
      form.nacimiento.value = ddmmyyyyToInput(u.nacimiento);
    }
    if (u.ubicacion) {
      form.ubicacion.value = u.ubicacion;
    }
  } catch (err) {
    console.error(err);
    if (msg) msg.textContent = 'No se pudo cargar tu perfil. Vuelve a iniciar sesión.';
    return;
  }

  // 2) Guardar cambios
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = '';

    const nombre = form.nombre.value.trim();
    const email  = form.email.value.trim();

    if (!nombre || !/\S+@\S+\.\S+/.test(email)) {
      if (msg) msg.textContent = 'Revisa nombre y correo válidos.';
      return;
    }

    const fd = new FormData(form);

    // Normalizar fecha a dd/mm/yyyy antes de enviar
    if (form.nacimiento.value) {
      fd.set('nacimiento', inputToDdMmYyyy(form.nacimiento.value));
    }

    try {
      const resp = await fetch('../php/update_profile.php', {
        method: 'POST',
        body: fd
      });
      const data = await resp.json();

      if (!data.ok) {
        if (msg) msg.textContent = data.error || 'No se pudo guardar el perfil.';
        return;
      }

      if (msg) msg.textContent = 'Perfil actualizado. Redirigiendo…';
      setTimeout(() => { location.href = backUrl; }, 700);
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = 'Error de conexión al guardar.';
    }
  });

  // 3) Cancelar (botón + ESC)
  const btnCancel = document.getElementById('btn-cancelar');

  function goBackToProfile() {
    if (backUrl) {
      location.href = backUrl;
    } else if (history.length > 1) {
      history.back();
    } else {
      location.href = './PerfilC.html?tab=info';
    }
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', goBackToProfile);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') goBackToProfile();
  });
});
