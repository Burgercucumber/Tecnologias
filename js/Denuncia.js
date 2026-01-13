// Selección de elementos
const form = document.getElementById('formDenuncia');
const modal = document.getElementById('modalConfirmacion');
const cerrar = document.getElementById('cerrarModal');

// Al enviar el formulario
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Evita recargar la página

  // Simula el envío (puedes agregar aquí lógica real de backend)
  setTimeout(() => {
    modal.style.display = 'flex'; // Muestra la ventana flotante
    form.reset(); // Limpia el formulario
  }, 500);
});

// Cerrar la ventana
cerrar.addEventListener('click', () => {
  modal.style.display = 'none';
});
