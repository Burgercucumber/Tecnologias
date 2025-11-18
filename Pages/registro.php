<?php
session_start();
require_once '../php/usuarios.php';

$mensajeError = '';
$mensajeOk    = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre    = trim($_POST['nombre'] ?? '');
    $email     = trim($_POST['email'] ?? '');
    $password  = $_POST['password'] ?? '';
    $password2 = $_POST['password2'] ?? '';

    if ($nombre === '' || $email === '' || $password === '' || $password2 === '') {
        $mensajeError = 'Todos los campos son obligatorios.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mensajeError = 'El correo no tiene un formato válido.';
    } elseif ($password !== $password2) {
        $mensajeError = 'Las contraseñas no coinciden.';
    } else {
        $stmt = $conn->prepare('SELECT id FROM usuarios WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $mensajeError = 'Ya existe una cuenta registrada con ese correo.';
        } else {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare(
                'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)'
            );
            $stmt->bind_param('sss', $nombre, $email, $passwordHash);

            if ($stmt->execute()) {
                $mensajeOk = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';
                // Redirige directo al login si prefieres:
                // header('Location: login.php?registro=ok'); exit;
            } else {
                $mensajeError = 'Error al registrar el usuario. Intenta de nuevo.';
            }
        }

        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crear cuenta | OdontoGo</title>
  <link rel="stylesheet" href="../css/style.css">
  <style>
    body{background:#f6fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Helvetica,Arial;}
    main{max-width:480px;margin:60px auto;background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.08);padding:32px;}
    h1{text-align:center;margin:0 0 12px;}
    .campo{margin-bottom:16px;}
    label{display:block;font-size:.9rem;color:#334;margin-bottom:6px;}
    input{width:100%;border:1px solid #dde7ee;border-radius:10px;padding:12px 14px;font-size:.95rem;}
    input:focus{border-color:#00c389;box-shadow:0 0 0 3px rgba(0,195,137,.2);outline:none;}
    .btn{width:100%;padding:12px;border:none;border-radius:999px;background:#00c389;color:#fff;font-weight:600;cursor:pointer;}
    .msg{padding:12px 14px;border-radius:10px;margin-bottom:18px;font-size:.95rem;}
    .msg.error{background:#ffeaea;color:#b42318;border:1px solid #f3b5b5;}
    .msg.ok{background:#e6fbf3;color:#0f7c54;border:1px solid #afe5cf;}
    .texto-sec{margin-top:16px;text-align:center;font-size:.9rem;color:#54606d;}
  </style>
</head>
<body>
  <div id="header-placeholder"></div>
  <script src="../js/header_loader.js"></script>

  <main>
    <h1>Crear cuenta</h1>
    <p style="text-align:center;color:#5c6b77;margin-bottom:24px;">
      Regístrate para acceder a todas las funciones de OdontoGo.
    </p>

    <?php if ($mensajeError): ?>
      <div class="msg error"><?= htmlspecialchars($mensajeError) ?></div>
    <?php endif; ?>

    <?php if ($mensajeOk): ?>
      <div class="msg ok"><?= htmlspecialchars($mensajeOk) ?></div>
    <?php endif; ?>

    <form method="POST" action="">
      <div class="campo">
        <label for="nombre">Nombre completo</label>
        <input type="text" id="nombre" name="nombre" required
               value="<?= htmlspecialchars($nombre ?? '') ?>">
      </div>

      <div class="campo">
        <label for="email">Correo electrónico</label>
        <input type="email" id="email" name="email" required
               value="<?= htmlspecialchars($email ?? '') ?>">
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required minlength="6">
      </div>

      <div class="campo">
        <label for="password2">Confirmar contraseña</label>
        <input type="password" id="password2" name="password2" required minlength="6">
      </div>

      <button class="btn" type="submit">Crear cuenta</button>
    </form>

    <p class="texto-sec">
      ¿Ya tienes cuenta?
      <a href="login.php">Inicia sesión</a>
    </p>
  </main>
</body>
</html>
