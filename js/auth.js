// js/auth.js
// Simula login en Pages/login.html y deja la sesión lista

document.addEventListener('DOMContentLoaded', () => {
  const form  = document.querySelector('form');
  const email = document.querySelector('input[type="email"], input[name="email"]');
  const pass  = document.querySelector('input[type="password"], input[name="password"]');

  // helpers de sesion-ui.js si están cargados
  const helpers = window.__odgAuth || {};
  const setSession = helpers.setSession || function(name='Usuario Demo', mail='demo@odonto.go', avatar='../img/doge-profile.jpg'){
    try {
      localStorage.setItem('odg_auth','1');
      localStorage.setItem('odg_name', name);
      localStorage.setItem('odg_email', mail);
      localStorage.setItem('odg_avatar', avatar);
    } catch {}
  };

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const mail = (email?.value || '').trim() || 'demo@odonto.go';
    const name = mail ? mail.split('@')[0] : 'Usuario Demo';

    // guarda sesión
    setSession(name, mail, '../img/doge-profile.jpg');

    // Redirige a la versión con cuenta
    location.replace('./PerfilC.html?tab=info');
  });
});
