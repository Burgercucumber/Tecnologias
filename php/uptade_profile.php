<?php
// php/update_profile.php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['ok' => false, 'error' => 'No hay sesión activa']);
    exit;
}

$id       = (int)$_SESSION['user_id'];
$nombre   = trim($_POST['nombre']   ?? '');
$email    = trim($_POST['email']    ?? '');
$telefono = trim($_POST['telefono'] ?? '');

if ($nombre === '' || $email === '') {
  echo json_encode(['ok' => false, 'error' => 'Nombre y correo son obligatorios']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['ok' => false, 'error' => 'Correo inválido']);
  exit;
}

// Verificar que el nuevo correo no esté en uso por otro usuario
$stmt = $mysqli->prepare('SELECT id FROM usuarios WHERE email = ? AND id <> ?');
$stmt->bind_param('si', $email, $id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
  echo json_encode(['ok' => false, 'error' => 'Ese correo ya está en uso']);
  $stmt->close();
  exit;
}
$stmt->close();

// Actualizar datos
$stmt = $mysqli->prepare('UPDATE usuarios SET nombre = ?, email = ?, telefono = ? WHERE id = ?');
$stmt->bind_param('sssi', $nombre, $email, $telefono, $id);

if ($stmt->execute()) {
  $_SESSION['nombre'] = $nombre;
  $_SESSION['email']  = $email;
  echo json_encode(['ok' => true]);
} else {
  echo json_encode(['ok' => false, 'error' => 'No se pudo actualizar']);
}

$stmt->close();
