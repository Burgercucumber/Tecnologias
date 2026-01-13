/**
 * header-loader.js
 * Carga el header de forma dinámica en cualquier página.
 * Híbrido: HTML estático + sesión real vía PHP (php/session-user.php)
 * Sin localStorage ni sesión demo.
 */

console.log('🔍 header-loader.js cargado!');
console.log('📍 Ruta actual:', window.location.pathname);

(function () {
  // Usamos pathname en minúsculas para detectar /pages/
  const currentPath = window.location.pathname.toLowerCase();
  const inPages = currentPath.includes('/pages/');

  // Prefijos comunes según el contexto (root vs /Pages/)
  const scriptBase = inPages ? '../' : './';
  const headerPath = inPages ? 'header.html' : 'Pages/header.html';
  const apiPath    = inPages ? '../php/session-user.php' : 'php/session-user.php';
  const pagesBase  = inPages ? '' : 'Pages/';   // para páginas PHP (PerfilC.html, login.php, etc.)
  const assetsBase = inPages ? '../' : '';      // para recursos estáticos (icons, img, etc.)
  const iconsBase  = assetsBase + 'icons/';     // carpeta de iconos

  async function loadHeader() {
    console.log('⚙️ Iniciando carga del header...');
    const headerContainer = document.getElementById('header-placeholder');

    if (!headerContainer) {
      console.error('❌ No se encontró el contenedor #header-placeholder');
      return;
    }

    try {
      console.log('📂 Intentando cargar:', headerPath);

      const response = await fetch(headerPath, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Error al cargar header: ${response.status}`);

      const headerHTML = await response.text();
      headerContainer.innerHTML = headerHTML;

      // Ajustar rutas del HTML estático
      adjustPaths(headerContainer);

      // Inicializar comportamiento del header (dropdowns, menú perfil)
      await initHeaderFunctionality();

      // Hidratar con datos de sesión (avatar, nombre, enlaces)
      await hydrateHeader();

      console.log('🎉 Header renderizado completamente');
    } catch (error) {
      console.error('❌ Error cargando el header:', error);
      headerContainer.innerHTML =
        '<header class="navbar"><div class="navbar-left"><h1>OdontoGo</h1></div></header>';
    }
  }

  function adjustPaths(container) {
    console.log('🔧 Ajustando rutas...');

    // Logo → que siempre apunte a index en la raíz
    const logoLink = container.querySelector('.logo-link');
    if (logoLink) {
      logoLink.setAttribute('href', inPages ? '../index.html' : 'index.html');
    }

    // Imágenes: normalizar rutas de icons/ y otros assets relativos
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      let src = img.getAttribute('src');
      if (!src) return;
      if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//') || src.startsWith('/')) return;

      // Iconos
      if (src.includes('icons/')) {
        const file = src.replace(/^.*icons\//, '');
        img.setAttribute('src', iconsBase + file);
        return;
      }

      // Otros recursos con ../
      if (src.startsWith('../')) {
        const stripped = src.replace(/^(\.\.\/)+/, '');
        img.setAttribute('src', assetsBase + stripped);
      }
    });

    // Links de Search.html → desde raíz que apunten a Pages/Search.html
    const dropdownLinks = container.querySelectorAll('.dd-panel a[href*="Search.html"]');
    dropdownLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      if (!inPages) {
        if (!href.toLowerCase().startsWith('pages/')) {
          link.setAttribute('href', pagesBase + href);
        }
      }
    });

    // Links del menú de perfil (login.php, registro.php, PerfilC.html...) en el HTML estático
    const menuLinks = container.querySelectorAll('.profile-dropdown a');
    menuLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

      if (href.endsWith('.php')) {
        if (!inPages && !href.toLowerCase().startsWith('pages/')) {
          link.setAttribute('href', pagesBase + href);
        }
      }
    });
  }

  async function initHeaderFunctionality() {
    console.log('🎮 Inicializando funcionalidad del header...');

    try {
      // Cargamos el script de dropdowns del header
      try {
        await loadScript(scriptBase + 'js/header-dropdown.js');
        console.log('✅ header-dropdown.js cargado');
      } catch (e1) {
        console.warn('⚠️ header-dropdown.js no encontrado, intentando nav-dd.js...');
        await loadScript(scriptBase + 'js/nav-dd.js');
        console.log('✅ nav-dd.js cargado');
      }

      // Inicializar menú de perfil
      initProfileMenu();
    } catch (err) {
      console.error('❌ Error cargando scripts del header:', err);
      initProfileMenu();
    }
  }

  // Solo maneja abrir/cerrar el menú de perfil
  function initProfileMenu() {
    const profileMenu    = document.getElementById('profileMenu');
    const profileTrigger = document.getElementById('profileTrigger');
    if (!profileMenu || !profileTrigger) return;

    profileTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const opened = profileMenu.classList.toggle('open');
      profileTrigger.setAttribute('aria-expanded', opened);
    });

    document.addEventListener('click', function (e) {
      if (!profileMenu.contains(e.target) && !profileTrigger.contains(e.target)) {
        profileMenu.classList.remove('open');
        profileTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Hidratar el header con datos reales de sesión usando php/session-user.php
  async function hydrateHeader() {
    try {
      const res = await fetch(apiPath, { credentials: 'same-origin' });
      if (!res.ok) {
        console.warn('⚠️ No se pudo obtener la sesión (HTTP)', res.status);
        return;
      }

      const data = await res.json();
      console.log('👤 Datos de sesión recibidos:', data);

      const avatarEl = document.getElementById('headerAvatar');
      const nameEl   = document.getElementById('headerName');
      const emailEl  = document.getElementById('headerEmail');
      const linksEl  = document.getElementById('headerAuthLinks');
      const trigger  = document.getElementById('profileTrigger');

      // Si no están esos elementos, no hacemos nada (header antiguo)
      if (!avatarEl || !nameEl || !linksEl || !trigger) return;

      // Normalizar ruta del avatar
      const resolvedAvatar = resolveAssetPath(data.avatar);
      if (resolvedAvatar) avatarEl.src = resolvedAvatar;

      if (data.nombre) nameEl.textContent = data.nombre;
      if (emailEl) emailEl.textContent = data.email || '';

      if (data.authenticated) {
        // Usuario logueado: menú completo de cuenta
        trigger.href = pagesBase + 'PerfilC.html?tab=info';

        linksEl.innerHTML = `
          <a role="menuitem" href="${pagesBase}PerfilC.html?tab=info">
            <span class="pm-ico">
              <img src="${iconsBase}home.png" alt="home" style="width: 20px; height: 20px; vertical-align:-0.1em; pointer-events:none;" />
            </span> Mi área
          </a>
          <a role="menuitem" href="${pagesBase}PerfilC.html?tab=historial">
            <span class="pm-ico">
              <img src="${iconsBase}health.png" alt="Health history" style="width: 20px; height: 20px; vertical-align:-0.1em; pointer-events:none;" />
            </span> Historial clínico
          </a>
          <a role="menuitem" href="${pagesBase}PerfilC.html?tab=favoritos">
            <span class="pm-ico">
              <img src="${iconsBase}heart.png" alt="heart" style="width: 20px; height: 20px; vertical-align:-0.1em; pointer-events:none;" />
            </span> Mis favoritos
          </a>
          <a role="menuitem" href="${pagesBase}PerfilC.html?tab=agenda">
            <span class="pm-ico">
              <img src="${iconsBase}notification.png" alt="Notifications" style="width: 20px; height: 20px; vertical-align:-0.1em; pointer-events:none;" />
            </span> Mis alertas
          </a>
          <a role="menuitem" href="${pagesBase}PerfilC.html?tab=configuracion">
            <span class="pm-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#213A57" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z" />
              </svg>
            </span> Configuración
          </a>
          <a role="menuitem" class="pm-logout" href="${pagesBase}logout.php">
            <span class="pm-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="#213A57" stroke-linecap="round" stroke-width="3" d="M6.343 6.343a8 8 0 1 0 11.314 0M12 8V4" />
              </svg>
            </span> Cerrar sesión
          </a>
        `;
      } else {
        // No autenticado: login / registro
        trigger.href = pagesBase + 'login.php';

        linksEl.innerHTML = `
          <a role="menuitem" href="${pagesBase}login.php" class="pm-logout">
            <span class="pm-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="#213A57" stroke-linecap="round" stroke-width="3" d="M6.343 6.343a8 8 0 1 0 11.314 0M12 8V4" />
              </svg>
            </span> Iniciar sesión
          </a>
          <a role="menuitem" href="${pagesBase}registro.php">
            <span class="pm-ico">
              <img src="${iconsBase}register.png" alt="registro" style="width: 20px; height: 20px; vertical-align:-0.1em; pointer-events:none;" />
            </span> Crear cuenta
          </a>
        `;
      }
    } catch (err) {
      console.error('⚠️ No se pudo cargar la sesión', err);
    }
  }

  // Normaliza rutas de assets que vienen del backend (avatar, etc.)
  function resolveAssetPath(path) {
    if (!path) return '';
    // URLs absolutas o data URIs
    if (/^(?:https?:|data:|\/\/)/i.test(path) || path.startsWith('/')) return path;

    // Si viene con ../, ajustamos según el contexto
    if (path.startsWith('../')) {
      return inPages ? path : path.replace(/^(\.\.\/)+/, '');
    }

    // Si viene con ./ lo limpiamos
    if (path.startsWith('./')) {
      path = path.slice(2);
    }

    // Ruta relativa simple → la colgamos de assetsBase
    return assetsBase + path;
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

// Refuerza que el disparador del perfil capture el click (por si algún hijo tiene pointer-events)
const trig = document.getElementById('profileTrigger');
if (trig) {
  [...trig.querySelectorAll('*')].forEach(n => n.style.pointerEvents = 'none');
  trig.style.pointerEvents = 'auto';
}
