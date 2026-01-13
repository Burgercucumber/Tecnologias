<?php
session_start();
require_once '../php/usuarios.php';

$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare('SELECT id,nombre,email,password_hash FROM usuarios WHERE email=?');
    if (!$stmt) {
        $loginError = 'No se pudo preparar la consulta: ' . $conn->error;
    } else {
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['usuario'] = [
            'id'     => $user['id'],
            'nombre' => $user['nombre'],
            'email'  => $user['email'],
            'avatar' => '../img/default-avatar.png',
        ];
        // Mantener un ID plano para los endpoints PHP que consultan $_SESSION['user_id'].
        $_SESSION['user_id'] = $user['id'];
        header('Location: PerfilC.html');
        exit;
        }

        $loginError = 'Correo o contraseña inválidos';
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Iniciar sesión | OdontoGo</title>
  <link rel="stylesheet" href="../css/style.css"/>
  <style>
    body{background:#f6fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Helvetica,Arial;}
    .auth-wrap{min-height:100vh;display:grid;place-items:center;padding:24px;}
    .auth-card{width:100%;max-width:430px;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.08);padding:28px;}
    .tabs{display:flex;gap:8px;margin-bottom:18px;}
    .tabs button{flex:1;padding:10px 12px;border-radius:10px;border:1px solid #e6eef2;background:#f7fbfd;cursor:pointer;}
    .tabs button.active{background:#e9fbf5;border-color:#c7f1de;color:#148a66;font-weight:600;}
    .form-group{margin:12px 0;}
    label{display:block;font-size:.9rem;color:#334;margin-bottom:6px;}
    input{width:100%;border:1px solid #dde7ee;border-radius:10px;padding:12px 14px;outline:none;}
    input:focus{border-color:#76e7c1;box-shadow:0 0 0 3px rgba(118,231,193,.25);}
    .btn{width:100%;padding:12px;border:0;border-radius:999px;cursor:pointer;font-weight:600;}
    .btn-primary{background:#00c389;color:#fff;}
    .muted{color:#667;font-size:.9rem;text-align:center;margin-top:12px;}
    .err{color:#b00020;font-size:.9rem;margin-top:8px;}
  </style>
</head>
<body>
  <div class="auth-wrap">
    <div class="auth-card">
      <h2 style="margin:0 0 8px">Bienvenido a <span style="color:#0b6fa4">OdontoGo</span></h2>
      <p class="muted" style="margin-top:0">Inicia sesión o crea tu cuenta para explorar la plataforma.</p>

      <div class="tabs">
        <button id="tab-login" class="active">Iniciar sesión</button>
        <button id="tab-register">Crear cuenta</button>
      </div>

      <form id="form-login" method="POST" action="">
        <div class="form-group">
          <label for="login-email">Correo</label>
          <input type="email" id="login-email" name="email" required placeholder="correo@ejemplo.com">
        </div>
        <div class="form-group">
          <label for="login-pass">Contraseña</label>
          <input type="password" id="login-pass" name="password" required placeholder="******">
        </div>
        <button class="btn btn-primary" type="submit">Entrar</button>

        <?php if ($loginError): ?>
          <div class="err"><?= htmlspecialchars($loginError) ?></div>
        <?php endif; ?>
      </form>

      <form id="form-register" action="registro.php" method="get" style="display:none">
        <button class="btn btn-primary" type="submit">Ir al registro</button>
      </form>

      <p class="muted"><a href="../index.html">Volver al inicio</a></p>
    </div>
  </div>

  <script>
    const tabLogin = document.getElementById('tab-login');
    const tabReg   = document.getElementById('tab-register');
    const fLogin   = document.getElementById('form-login');
    const fReg     = document.getElementById('form-register');

    tabLogin.onclick = () => {
      tabLogin.classList.add('active'); tabReg.classList.remove('active');
      fLogin.style.display = '';        fReg.style.display = 'none';
    };
    tabReg.onclick = () => {
      tabReg.classList.add('active');   tabLogin.classList.remove('active');
      fReg.style.display = '';          fLogin.style.display = 'none';
    };
  </script>
</body>
</html>
