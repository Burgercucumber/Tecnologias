// js/auth.js
// Lógica simple para simular el inicio de sesión en login.html

document.addEventListener('DOMContentLoaded', () => {
  const form  = document.querySelector('form');
  const email = document.querySelector('input[type="email"], input[name="email"]');
  const pass  = document.querySelector('input[type="password"], input[name="password"]');

  // Carga helpers desde session-ui.js
  const { setSession, updateAuthUI } = window.__odgAuth || {};

  if (!form || !setSession) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const mail = (email && email.value || '').trim();
    const name = mail ? mail.split('@')[0] : 'Usuario';

    // Guarda "sesión"
    setSession(name);
    if (typeof updateAuthUI === 'function') updateAuthUI();

    // Redirige a Home
    location.href = '../index.html';
  });
});
