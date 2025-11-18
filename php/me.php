<?php
// php/me.php
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['ok' => false, 'error' => 'Sin sesión']);
    exit;
}

$id = (int)$_SESSION['user_id'];

$stmt = $mysqli->prepare('SELECT id, nombre, email, telefono FROM usuarios WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado']);
    exit;
}

echo json_encode(['ok' => true, 'user' => $user]);
