/**
 * header-dropdowns.js
 * Maneja los dropdowns del header (Tratamientos, Localidad, Perfil)
 * Este archivo se carga DESPUÉS de que el header esté insertado en el DOM
 */

(function initHeaderDropdowns() {
  'use strict';
  
  console.log('🎯 [DROPDOWNS] Inicializando sistema de dropdowns...');

  // Verificar que los elementos existen
  const requiredElements = [
    '#dd-tratamientos',
    '#dd-localidad',
    '#chipTratamientos',
    '#chipLocalidad',
    '#profileMenu',
    '#profileTrigger'
  ];

  let allElementsFound = true;
  requiredElements.forEach(selector => {
    if (!document.querySelector(selector)) {
      console.error(`❌ Elemento no encontrado: ${selector}`);
      allElementsFound = false;
    }
  });

  if (!allElementsFound) {
    console.error('❌ [DROPDOWNS] Faltan elementos críticos. Abortando.');
    return;
  }

  console.log('✅ [DROPDOWNS] Todos los elementos encontrados');

  // Funciones auxiliares
  function closeAllChips() {
    const panels = document.querySelectorAll('.dd-panel.open');
    panels.forEach(p => {
      p.classList.remove('open');
      console.log('🔴 Panel cerrado:', p.id);
    });
    
    document.querySelectorAll('.chip-btn[aria-expanded="true"]').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function closeProfile() {
    const profile = document.getElementById('profileMenu');
    const trigger = document.getElementById('profileTrigger');
    if (profile && trigger) {
      profile.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      console.log('👤 Perfil cerrado');
    }
  }

  function positionPanel(panel, btn) {
    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const left = rect.left + window.scrollX;
    
    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
    panel.style.minWidth = rect.width + 'px';
    
    console.log('📍 Panel posicionado:', { 
      id: panel.id, 
      top, 
      left,
      rect: {
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width
      }
    });
  }

  // Manejador principal de clicks
  function handleDocumentClick(e) {
    console.log('🖱️ Click detectado:', e.target.tagName, e.target.className);

    // 1. CHIPS con dropdown (Tratamientos/Localidad)
    const chipBtn = e.target.closest('.chip-btn[data-dd]');
    if (chipBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const panelId = chipBtn.dataset.dd;
      const panel = document.getElementById(panelId);
      
      console.log('🔵 Click en chip:', chipBtn.id, '→ Panel:', panelId);
      
      if (!panel) {
        console.error('❌ Panel no encontrado:', panelId);
        return;
      }
      
      const wasOpen = panel.classList.contains('open');
      console.log('📊 Estado del panel:', wasOpen ? 'abierto' : 'cerrado');
      
      // Cerrar todo primero
      closeAllChips();
      closeProfile();
      
      // Si estaba cerrado, abrirlo
      if (!wasOpen) {
        console.log('✅ Abriendo panel:', panelId);
        panel.classList.add('open');
        chipBtn.setAttribute('aria-expanded', 'true');
        positionPanel(panel, chipBtn);
        
        // Verificar después de 100ms
        setTimeout(() => {
          const styles = window.getComputedStyle(panel);
          console.log('🎨 Estilos del panel:', {
            display: styles.display,
            opacity: styles.opacity,
            visibility: styles.visibility,
            zIndex: styles.zIndex,
            position: styles.position
          });
        }, 100);
      }
      return;
    }

    // 2. PERFIL
    const profileBtn = e.target.closest('#profileTrigger');
    if (profileBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const profile = document.getElementById('profileMenu');
      if (profile) {
        const wasOpen = profile.classList.contains('open');
        console.log('👤 Click en perfil. Estado actual:', wasOpen ? 'abierto' : 'cerrado');
        
        closeAllChips();
        
        if (wasOpen) {
          profile.classList.remove('open');
          profileBtn.setAttribute('aria-expanded', 'false');
          console.log('🔴 Perfil cerrado');
        } else {
          profile.classList.add('open');
          profileBtn.setAttribute('aria-expanded', 'true');
          console.log('✅ Perfil abierto');
        }
      }
      return;
    }

    // 3. Click dentro de dropdowns: no hacer nada
    if (e.target.closest('.dd-panel') || e.target.closest('.profile-dropdown')) {
      console.log('📍 Click dentro de dropdown, no cerrar');
      return;
    }

    // 4. Click fuera: cerrar todo
    const hasOpenPanels = document.querySelector('.dd-panel.open') || 
                          document.querySelector('.profile-menu.open');
    if (hasOpenPanels) {
      console.log('🌐 Click fuera, cerrando todo');
      closeAllChips();
      closeProfile();
    }
  }

  // Registrar listener con capture para asegurar que se ejecute primero
  document.addEventListener('click', handleDocumentClick, true);

  // Escape para cerrar
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      console.log('⎋ Escape presionado');
      closeAllChips();
      closeProfile();
    }
  });

  console.log('✅ [DROPDOWNS] Sistema inicializado correctamente');
  
  // Exponer función de limpieza por si se necesita
  window.__odgDropdowns = {
    closeAll: function() {
      closeAllChips();
      closeProfile();
    }
  };
})();