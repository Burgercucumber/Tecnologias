/**
 * header-loader.js (CORREGIDO - maneja SVGs correctamente)
 * Carga el header de forma dinámica en cualquier página
 * Pages/header.html es el partial del header
 */

console.log('🔍 header-loader.js cargado!');
console.log('📍 Ruta actual:', window.location.pathname);

(function () {
  const currentPath = window.location.pathname;

  function getBasePath() {
    return currentPath.includes('/Pages/') ? '../' : './';
  }

  async function loadHeader() {
    console.log('⚙️ Iniciando carga del header...');
    const basePath = getBasePath();
    const headerContainer = document.getElementById('header-placeholder');

    if (!headerContainer) {
      console.error('❌ No se encontró el contenedor #header-placeholder');
      return;
    }

    try {
      const headerPath = currentPath.includes('/Pages/') ? 'header.html' : 'Pages/header.html';
      console.log('📂 Intentando cargar:', headerPath);

      const response = await fetch(headerPath);
      if (!response.ok) throw new Error(`Error al cargar header: ${response.status}`);

      const headerHTML = await response.text();
      headerContainer.innerHTML = headerHTML;

      adjustPaths(headerContainer, basePath);

      // Refrescar botón login/logout inmediatamente
      refreshAuthButton();

      // Cargar scripts dependientes
      await initHeaderFunctionality();

      // Asegúrate de actualizar otra vez tras init
      refreshAuthButton();

      console.log('🎉 Header renderizado completamente');
    } catch (error) {
      console.error('❌ Error cargando el header:', error);
      headerContainer.innerHTML =
        '<header class="navbar"><div class="navbar-left"><h1>OdontoGo</h1></div></header>';
    }
  }

  function adjustPaths(container, basePath) {
    console.log('🔧 Ajustando rutas...');
    const isInRoot = !currentPath.includes('/Pages/');

    const logoLink = container.querySelector('.logo-link');
    if (logoLink) {
      const href = logoLink.getAttribute('href');
      logoLink.setAttribute('href', isInRoot ? href : '../' + href);
    }

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http')) {
        if (isInRoot) img.setAttribute('src', 'Pages/' + src);
      }
    });

    const dropdownLinks = container.querySelectorAll('.dd-panel a[href*="Search.html"]');
    dropdownLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && isInRoot && !href.startsWith('Pages/')) {
        link.setAttribute('href', href.replace('Search.html', 'Pages/Search.html'));
      }
    });

    const menuLinks = container.querySelectorAll('.profile-dropdown a');
    menuLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http')) {
        if (isInRoot && !href.startsWith('Pages/')) link.setAttribute('href', 'Pages/' + href);
      }
    });
  }

  async function initHeaderFunctionality() {
    console.log('🎮 Inicializando funcionalidad del header...');
    const basePath = getBasePath();

    try {
      await loadScript(basePath + 'js/sesion-ui.js');
      console.log('✅ sesion-ui.js cargado');

      await loadScript(basePath + 'js/header-dropdown.js');
      console.log('✅ nav-dd.js cargado');

      // Toggle del menú
      initProfileMenu();
      // Cableamos el botón auth
      wireAuthButton();

    } catch (err) {
      console.error('❌ Error cargando scripts:', err);
      initProfileMenu();
      wireAuthButton();
    }
  }

  // Setea label/acción del botón según sesión
  function refreshAuthButton() {
    const btn = document.getElementById('pm-auth');
    if (!btn) return;

    const logged = (() => {
      try { return localStorage.getItem('odg_auth') === '1'; } catch { return false; }
    })();

    if (logged) {
      btn.dataset.action = 'logout';
      btn.innerHTML = `<span class="pm-ico">⏻</span> Cerrar sesión`;
    } else {
      btn.dataset.action = 'login';
      btn.innerHTML = `<span class="pm-ico">⏻</span> Iniciar sesión`;
    }

    // Si sesion-ui expone updateAuthUI, úsalo también
    if (window.__odgAuth?.updateAuthUI) {
      try { window.__odgAuth.updateAuthUI(); } catch {}
    }
  }

  // Comportamiento del botón login/logout
  function wireAuthButton() {
    const btn = document.getElementById('pm-auth');
    if (!btn) return;

    // Refrescar cada vez que se abra el menú
    const profileTrigger = document.getElementById('profileTrigger');
    if (profileTrigger) {
      profileTrigger.addEventListener('click', () => setTimeout(refreshAuthButton, 0));
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const inPages = location.pathname.toLowerCase().includes('/pages/');
      const action = btn.dataset.action;

      if (action === 'logout') {
        if (window.__odgAuth?.clearSession) window.__odgAuth.clearSession();
        else {
          try {
            localStorage.removeItem('odg_auth');
            localStorage.removeItem('odg_name');
            localStorage.removeItem('odg_email');
            localStorage.removeItem('odg_avatar');
          } catch {}
        }
        refreshAuthButton();
        // Redirige al perfil público
        location.href = inPages ? './Perfil.html' : 'Pages/Perfil.html';
      } else {
        // Ir al login
        location.href = inPages ? './login.html' : 'Pages/login.html';
      }
    });
  }

  function initProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    const profileTrigger = document.getElementById('profileTrigger');
    if (!profileMenu || !profileTrigger) return;

    // CORREGIDO: usar event delegation para manejar clicks en el trigger y sus hijos (img)
    profileTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const opened = profileMenu.classList.toggle('open');
      profileTrigger.setAttribute('aria-expanded', opened);
    });

    document.addEventListener('click', function (e) {
      // CORREGIDO: verificar si el click fue dentro del menú completo (trigger + dropdown)
      if (!profileMenu.contains(e.target) && !profileTrigger.contains(e.target)) {
        profileMenu.classList.remove('open');
        profileTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();

// Refuerza que el disparador del perfil capture el click
const trig = document.getElementById('profileTrigger');
if (trig) {
  // Si por algún motivo un hijo tiene pointer-events activo, lo anulamos a nivel runtime
  [...trig.querySelectorAll('*')].forEach(n => n.style.pointerEvents = 'none');
  trig.style.pointerEvents = 'auto';
}
