/**
 * header-loader.js
 * Carga el header de forma dinámica en cualquier página
 * header.html está ubicado en la carpeta Pages/
 */

console.log('🔍 header-loader.js cargado!');
console.log('📍 Ruta actual:', window.location.pathname);

(function() {
  // Obtener la ruta actual
  const currentPath = window.location.pathname;
  
  // Detectar la ruta base según la ubicación del archivo
  function getBasePath() {
    // Si estamos en una subcarpeta (Pages/), usar ../ 
    // Si estamos en la raíz, usar ./
    return currentPath.includes('/Pages/') ? '../' : './';
  }

  // Función para cargar el header
  async function loadHeader() {
    console.log('⚙️ Iniciando carga del header...');
    
    const basePath = getBasePath();
    const headerContainer = document.getElementById('header-placeholder');
    
    if (!headerContainer) {
      console.error('❌ No se encontró el contenedor #header-placeholder');
      return;
    }
    
    console.log('✅ Contenedor encontrado');

    try {
      // header.html está en Pages/
      const headerPath = currentPath.includes('/Pages/') 
        ? 'header.html'  // Si estamos en Pages/, está en la misma carpeta
        : 'Pages/header.html';  // Si estamos en raíz, acceder a Pages/
      
      console.log('📂 Intentando cargar:', headerPath);
      
      const response = await fetch(headerPath);
      
      if (!response.ok) {
        throw new Error(`Error al cargar header: ${response.status}`);
      }
      
      console.log('✅ Header cargado exitosamente');
      
      const headerHTML = await response.text();
      headerContainer.innerHTML = headerHTML;
      
      // Ajustar rutas según la ubicación
      adjustPaths(headerContainer, basePath);
      
      // Inicializar funcionalidad del header después de cargarlo
      initHeaderFunctionality();
      
      console.log('🎉 Header renderizado completamente');
      
    } catch (error) {
      console.error('❌ Error cargando el header:', error);
      // Fallback: mostrar un header básico
      headerContainer.innerHTML = '<header class="navbar"><div class="navbar-left"><h1>OdontoGo</h1></div></header>';
    }
  }

  // Ajustar rutas de imágenes y enlaces según la ubicación
  function adjustPaths(container, basePath) {
    console.log('🔧 Ajustando rutas...');
    
    // Ajustar el enlace del logo
    const logoLink = container.querySelector('.logo-link');
    if (logoLink) {
      const href = logoLink.getAttribute('href');
      if (!currentPath.includes('/Pages/')) {
        // Si estamos en la raíz, el link queda como está
        logoLink.setAttribute('href', href);
        console.log(`  🏠 Logo link (raíz): ${href}`);
      } else {
        // Si estamos en Pages/, agregar ../
        logoLink.setAttribute('href', '../' + href);
        console.log(`  🏠 Logo link (Pages/): ../${href}`);
      }
    }
    
    // Ajustar imágenes
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // Si estamos en raíz, agregar Pages/ a las rutas
        if (!currentPath.includes('/Pages/')) {
          const newSrc = 'Pages/' + src;
          img.setAttribute('src', newSrc);
          console.log(`  📷 Imagen: ${src} → ${newSrc}`);
        }
      }
    });
    
    // Ajustar enlaces del menú de perfil
    const menuLinks = container.querySelectorAll('.profile-dropdown a');
    menuLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http')) {
        // Si estamos en raíz, agregar Pages/ a las rutas
        if (!currentPath.includes('/Pages/') && !href.startsWith('Pages/')) {
          const newHref = 'Pages/' + href;
          link.setAttribute('href', newHref);
          console.log(`  🔗 Link: ${href} → ${newHref}`);
        }
      }
    });
  }

  // Inicializar la funcionalidad del header (dropdowns, perfil, etc.)
  async function initHeaderFunctionality() {
    console.log('🎮 Inicializando funcionalidad del header...');
    
    // Cargar los scripts necesarios
    const basePath = getBasePath();
    
    try {
      // Cargar scripts en orden
      await loadScript(basePath + 'js/sesion-ui.js');
      console.log('✅ sesion-ui.js cargado');
      
      await loadScript(basePath + 'js/nav-dd.js');
      console.log('✅ nav-dd.js cargado');
      
      // Esperar un momento para que los scripts se inicialicen
      setTimeout(() => {
        initProfileMenu();
        console.log('✅ Menú de perfil inicializado');
      }, 100);
      
    } catch(err) {
      console.error('❌ Error cargando scripts:', err);
      // Si fallan los scripts, inicializar manualmente
      initProfileMenu();
    }
  }
  
  // Inicializar el menú de perfil manualmente si es necesario
  function initProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    const profileTrigger = document.getElementById('profileTrigger');
    
    if (!profileMenu || !profileTrigger) {
      console.warn('⚠️ No se encontró el menú de perfil');
      return;
    }
    
    // Toggle del menú al hacer clic
    profileTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      profileMenu.classList.toggle('open');
      
      const isOpen = profileMenu.classList.contains('open');
      profileTrigger.setAttribute('aria-expanded', isOpen);
      
      console.log('👤 Menú de perfil:', isOpen ? 'abierto' : 'cerrado');
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
      if (!profileMenu.contains(e.target)) {
        profileMenu.classList.remove('open');
        profileTrigger.setAttribute('aria-expanded', 'false');
      }
    });
    
    console.log('✅ Event listeners del menú agregados');
  }

  // Función auxiliar para cargar scripts
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Verificar si el script ya existe
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`⚠️ Script ya existe: ${src}`);
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    console.log('⏳ Esperando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    console.log('✅ DOM ya está listo, cargando header...');
    loadHeader();
  }
})();