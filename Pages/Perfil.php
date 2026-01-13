<?php
session_start();
if (!isset($_SESSION['usuario'])) {
    header('Location: login.php?redirect=Perfil.php');
    exit;
}
$usuario = $_SESSION['usuario'];
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perfil | OdontoGo</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/Perfil.css">
</head>
<body>
  <div id="header-placeholder"></div>

  <main class="container" style="padding:18px 16px 36px;">
    <div class="wrap">
      <aside class="panel">
        <div class="aside-head">
          <div class="user-mini">
            <img src="<?= htmlspecialchars($usuario['avatar'] ?? '../img/default-avatar.png') ?>" alt="Foto de perfil" style="object-fit:cover;">
            <div>
              <div><?= htmlspecialchars($usuario['nombre']) ?></div>
              <div class="muted" style="font-weight:500;"><?= htmlspecialchars($usuario['email']) ?></div>
            </div>
          </div>
        </div>
        <ul class="menu">
          <li class="active"><a href="#info">Información</a></li>
          <li><a href="#favoritos">Favoritos</a></li>
          <li><a href="#historial">Historial</a></li>
          <li><a href="#agenda">Agenda</a></li>
          <li><a href="#pagos">Pagos</a></li>
          <li><a href="#configuracion">Configuración</a></li>
          <li><a href="#recomendaciones">¡Recomendaciones!</a></li>
        </ul>
      </aside>

      <section class="panel padded" id="info">
        <h2 class="section-title">Información personal</h2>
        <div class="grid2">
          <div class="card">
            <p class="muted">Nombre completo</p>
            <p><?= htmlspecialchars($usuario['nombre']) ?></p>
          </div>
          <div class="card">
            <p class="muted">Correo electrónico</p>
            <p><?= htmlspecialchars($usuario['email']) ?></p>
          </div>
        </div>
        <p class="muted" style="margin-top:14px;">
          Puedes ampliar esta ficha añadiendo teléfonos, ciudad o información clínica en tu base de datos
          y consultándolos aquí usando el ID <?= (int) $usuario['id'] ?>.
        </p>
      </section>

      <section class="panel padded" id="favoritos">
        <h2 class="section-title">Favoritos</h2>
        <p class="muted">Aún no guardas clínicas ni tratamientos favoritos. Cuando lo hagas, podrás mostrarlos aquí.</p>
      </section>

      <section class="panel padded" id="historial">
        <h2 class="section-title">Historial clínico</h2>
        <p class="muted">Conecta tus tablas de tratamientos/citas para listar la información asociada al usuario.</p>
      </section>

      <section class="panel padded" id="agenda">
        <h2 class="section-title">Agenda</h2>
        <p class="muted">Integra este módulo con tu tabla de citas para mostrar próximas reservas.</p>
      </section>

      <section class="panel padded" id="pagos">
        <h2 class="section-title">Pagos</h2>
        <p class="muted">Cuando implementes facturación podrás listar montos y estados de pago en esta sección.</p>
      </section>

      <section class="panel padded" id="configuracion">
        <h2 class="section-title">Configuración</h2>
        <p class="muted">Aquí podrás ofrecer cambios de contraseña, idioma y notificaciones para <?= htmlspecialchars($usuario['nombre']) ?>.</p>
      </section>

      <section class="panel padded" id="recomendaciones">
        <h2 class="section-title">¡Recomendaciones!</h2>
        <p class="muted">Personaliza este apartado con lugares o clínicas sugeridas según los datos del usuario.</p>
      </section>
    </div>
  </main>

  <script src="../js/header_loader.js"></script>
</body>
</html>
