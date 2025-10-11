// js/nav-dd.js
(() => {
  const panels = {
    localidad: document.getElementById('dd-localidad'),
    tratamientos: document.getElementById('dd-tratamientos')
  };
  const chips = {
    localidad: document.getElementById('chipLocalidad'),
    tratamientos: document.getElementById('chipTratamientos')
  };

  let opened = null; // id del panel abierto

  function placePanel(panel, anchor){
    const r = anchor.getBoundingClientRect();
    const top = window.scrollY + r.bottom + 8; // 8px debajo del chip
    // centrado horizontal respecto al chip
    const panelWidth = panel.offsetWidth || 230;
    const left = window.scrollX + (r.left + (r.width/2) - (panelWidth/2));
    panel.style.top  = `${top}px`;
    panel.style.left = `${Math.max(12, left)}px`;

    // posiciona la flechita
    const arrow = panel.querySelector('.dd-arrow');
    if (arrow){
      const relX = Math.min(panelWidth-26, Math.max(26, (panelWidth/2)));
      arrow.style.right = `${panelWidth - relX}px`;
    }
  }

  function openPanel(id){
    const panel  = panels[id];
    const anchor = chips[id];
    if (!panel || !anchor) return;

    // cierra si hay otro abierto
    if (opened && opened !== id) closePanel(opened);

    placePanel(panel, anchor);
    panel.classList.add('open');
    anchor.setAttribute('aria-expanded','true');
    opened = id;
  }

  function closePanel(id){
    const panel  = panels[id];
    const anchor = chips[id];
    if (!panel || !anchor) return;
    panel.classList.remove('open');
    anchor.setAttribute('aria-expanded','false');
    opened = null;
  }

  // toggles
  Object.entries(chips).forEach(([id,btn])=>{
    btn?.addEventListener('click', (e)=>{
      e.preventDefault();
      (opened === id) ? closePanel(id) : openPanel(id);
    });
  });

  // click fuera
  document.addEventListener('click', (e)=>{
    if (!opened) return;
    const p = panels[opened];
    const b = chips[opened];
    if (!p.contains(e.target) && !b.contains(e.target)){
      closePanel(opened);
    }
  });

  // ESC
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && opened){
      closePanel(opened);
      chips[opened].focus();
    }
  });

  // seleccionar item -> opcional: setea texto del chip y cierra
  function wireMenu(panelId, chipId){
    panels[panelId]?.querySelectorAll('a[role="menuitem"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const txt = a.textContent.trim();
        const label = chips[chipId].querySelector('span:nth-child(2)');
        if (label) label.textContent = txt;
        closePanel(panelId);

        // si quieres redirigir, descomenta y ajusta:
        // location.href = `Pages/Clinica.html?${panelId}=${encodeURIComponent(txt)}`;
      });
    });
  }
  wireMenu('localidad','localidad');
  wireMenu('tratamientos','tratamientos');

  // si el chip de “Odontologías” debe navegar:
  document.querySelector('.chip-btn[data-link]')?.addEventListener('click', (e)=>{
    const href = e.currentTarget.getAttribute('data-link');
    if (href && href !== '#') location.href = href;
  });

  // al redimensionar, si está abierto, re-posiciona
  window.addEventListener('resize', ()=>{
    if (!opened) return;
    placePanel(panels[opened], chips[opened]);
  });
})();
