/**
 * header-loader.js
 * Carga el header de forma dinámica en cualquier página
 * header.html está ubicado en la carpeta Pages/
 */

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
    const basePath = getBasePath();
    const headerContainer = document.getElementById('header-placeholder');
    
    if (!headerContainer) {
      console.error('No se encontró el contenedor #header-placeholder');
      return;
    }

    try {
      // header.html está en Pages/
      const headerPath = currentPath.includes('/Pages/') 
        ? 'header.html'  // Si estamos en Pages/, está en la misma carpeta
        : 'Pages/header.html';  // Si estamos en raíz, acceder a Pages/
      
      const response = await fetch(headerPath);
      
      if (!response.ok) {
        throw new Error(`Error al cargar header: ${response.status}`);
      }
      
      const headerHTML = await response.text();
      headerContainer.innerHTML = headerHTML;
      
      // Ajustar rutas de imágenes según la ubicación
      adjustImagePaths(headerContainer, basePath);
      
      // Inicializar funcionalidad del header después de cargarlo
      initHeaderFunctionality();
      
    } catch (error) {
      console.error('Error cargando el header:', error);
      // Fallback: mostrar un header básico
      headerContainer.innerHTML = '<header class="navbar"><div class="navbar-left"><h1>OdontoGo</h1></div></header>';
    }
  }

  // Ajustar rutas de imágenes y enlaces según la ubicación
  function adjustPaths(container, basePath) {
    // Ajustar imágenes
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // Si estamos en raíz, agregar Pages/ a las rutas
        if (!currentPath.includes('/Pages/')) {
          img.setAttribute('src', 'Pages/' + src);
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
          link.setAttribute('href', 'Pages/' + href);
        }
      }
    });
  }

  // Inicializar la funcionalidad del header (dropdowns, perfil, etc.)
  function initHeaderFunctionality() {
    // Cargar los scripts necesarios
    const basePath = getBasePath();
    
    // Script de sesión
    loadScript(basePath + 'js/sesion-ui.js');
    
    // Script de dropdowns
    loadScript(basePath + 'js/nav-dd.js');
  }

  // Función auxiliar para cargar scripts
  function loadScript(src) {
    return new Promise((resolve, reject) => {
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
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();