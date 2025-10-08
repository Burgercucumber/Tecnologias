// Selecciona todos los botones del menú (li + botón recomendaciones)
const botones = document.querySelectorAll('.opciones li, .recomendaciones');
const secciones = document.querySelectorAll('.perfil-info');

// Escucha clics en cada botón
botones.forEach(boton => {
  boton.addEventListener('click', () => {
    const target = boton.getAttribute('data-section');
    if (!target) return;

    // Oculta todas las secciones
    secciones.forEach(sec => sec.classList.remove('active'));

    // Muestra la correspondiente
    const seccion = document.getElementById(target);
    if (seccion) {
      seccion.classList.add('active');
    }
  });
});
