// Conversión fecha dd/mm/yyyy <-> yyyy-mm-dd
function ddmmyyyyToInput(v){ if(!v||!v.includes('/')) return ''; const [d,m,y]=v.split('/'); return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`; }
function inputToDdMmYyyy(v){ if(!v||!v.includes('-')) return ''; const [y,m,d]=v.split('-'); return `${d}/${m}/${y}`; }

function getProfile(){
  const def = { nombre:'demo', email:'demo@odontogo.com', telefono:'312 555 0101', nacimiento:'30/10/2000', ubicacion:'Debajo de un puente' };
  try { return { ...def, ...(JSON.parse(localStorage.getItem('odg_profile')||'{}')) }; }
  catch { return def; }
}
function setProfile(p){ localStorage.setItem('odg_profile', JSON.stringify(p)); }

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-perfil');
  const msg  = document.getElementById('msg');
  const params = new URLSearchParams(location.search);
  const backUrl = params.get('return') || './PerfilC.html?tab=info';

  // Prefill
  const p = getProfile();
  form.nombre.value    = p.nombre || '';
  form.email.value     = p.email || '';
  form.telefono.value  = p.telefono || '';
  form.nacimiento.value= ddmmyyyyToInput(p.nacimiento);
  form.ubicacion.value = p.ubicacion || '';
  form.nombre.focus();

  // Guardar
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevo = {
      nombre: form.nombre.value.trim(),
      email:  form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      nacimiento: inputToDdMmYyyy(form.nacimiento.value),
      ubicacion: form.ubicacion.value.trim()
    };
    if(!nuevo.nombre || !/\S+@\S+\.\S+/.test(nuevo.email)){
      msg.textContent = 'Revisa nombre y correo válidos.'; return;
    }
    setProfile(nuevo);
    msg.textContent = 'Guardado. Redirigiendo…';
    location.replace(backUrl);
  });

  try {
  localStorage.setItem('odg_name',  nuevo.nombre);
  localStorage.setItem('odg_email', nuevo.email);
 } catch {}


  // Cancelar (botón o ESC)
  document.getElementById('btn-cancelar').addEventListener('click', () => location.replace(backUrl));
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') location.replace(backUrl); });
});
// Lee la URL a donde volver (puesta por PerfilC.js)
const params  = new URLSearchParams(location.search);
const backUrl = params.get('return') || './PerfilC.html?tab=info';

// Función reutilizable para regresar al perfil
function goBackToProfile() {
  if (backUrl)        location.href = backUrl;             // preferido
  else if (history.length > 1) history.back();             // fallback
  else                 location.href = './PerfilC.html?tab=info';
}

// Botón Cancelar
document.getElementById('btn-cancelar')
        .addEventListener('click', goBackToProfile);

// Tecla ESC = cancelar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') goBackToProfile();
});
