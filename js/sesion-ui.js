// js/session-ui.js
// ===============================================
//   UI del menú de perfil + estado "sesión" demo
// ===============================================

const AUTH_KEY  = 'odg_auth';
const AUTH_NAME = 'odg_name';

// ---- Helpers de "sesión" (demo con localStorage)
const isLogged = () => {
  try { return localStorage.getItem(AUTH_KEY) === '1'; }
  catch { return false; }
};

const setSession = (name = '') => {
  try {
    localStorage.setItem(AUTH_KEY, '1');
    if (name) localStorage.setItem(AUTH_NAME, name);
  } catch {}
};

const clearSession = () => {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_NAME);
  } catch {}
};

// ---- Corrige rutas del menú si estás en /Pages
function fixProfileLinks() {
  const inPages = location.pathname.toLowerCase().includes('/pages/');
  document.querySelectorAll('.profile-dropdown a[href]').forEach(a => {
    let href = a.getAttribute('href') || '';
    if (!href) return;

    // Evita tocar http(s) y #anclas
    if (/^https?:\/\//i.test(href) || href.startsWith('#')) return;

    if (inPages) {
      // Estás en /Pages -> quita prefijo Pages/
      href = href.replace(/^Pages\//i, '');
    } else {
      // Estás en raíz -> asegúrate de tener prefijo Pages/
      if (!/^Pages\//i.test(href)) href = 'Pages/' + href;
    }
    a.setAttribute('href', href);
  });
}

// ---- Actualiza el texto del botón final (Iniciar/Cerrar)
function updateAuthUI() {
  const authBtn = document.getElementById('pm-auth');
  if (!authBtn) return;

  if (isLogged()) {
    authBtn.dataset.action = 'logout';
    authBtn.innerHTML = `<span class="pm-ico">⏻</span> Cerrar sesión`;
  } else {
    authBtn.dataset.action = 'login';
    authBtn.innerHTML = `<span class="pm-ico">⏻</span> Iniciar sesión`;
  }
}

// ---- Cableado del menú desplegable (siempre abre)
function wireProfileMenu() {
  const menuWrap = document.getElementById('profileMenu');
  const trigger  = document.getElementById('profileTrigger');
  const drop     = menuWrap ? menuWrap.querySelector('.profile-dropdown') : null;
  if (!menuWrap || !trigger || !drop) return;

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const opened = menuWrap.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(opened));
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', (ev) => {
    if (!menuWrap.classList.contains('open')) return;
    if (!menuWrap.contains(ev.target)) {
      menuWrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && menuWrap.classList.contains('open')) {
      menuWrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });
}

// ---- Acción del botón final (login/logout)
function wireAuthButton() {
  const authBtn = document.getElementById('pm-auth');
  if (!authBtn) return;

  authBtn.addEventListener('click', () => {
    const inPages = location.pathname.toLowerCase().includes('/pages/');
    const action  = authBtn.dataset.action;

    if (action === 'logout') {
      clearSession();
      updateAuthUI();
      // Regresa al inicio
      location.href = inPages ? '../index.html' : 'index.html';
    } else {
      // A Login
      location.href = inPages ? './login.html' : 'Pages/login.html';
    }
  });
}

// ---- INIT
document.addEventListener('DOMContentLoaded', () => {
  fixProfileLinks();
  updateAuthUI();
  wireProfileMenu();
  wireAuthButton();
});

// Export para usar desde otros scripts (login)
window.__odgAuth = { setSession, clearSession, isLogged, updateAuthUI };
