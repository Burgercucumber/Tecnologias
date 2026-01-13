<?php
// php/get_user.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

$user = $_SESSION['usuario'] ?? null;

if (!$user) {
    echo json_encode([
        'ok'      => false,
        'usuario' => null
    ]);
    exit;
}

echo json_encode([
    'ok'      => true,
    'usuario' => [
        'id'         => $user['id']         ?? null,
        'nombre'     => $user['nombre']     ?? '',
        'email'      => $user['email']      ?? '',
        'avatar'     => $user['avatar']     ?? '../img/default-avatar.png',
        'telefono'   => $user['telefono']   ?? '',
        'nacimiento' => $user['nacimiento'] ?? '',
        'ubicacion'  => $user['ubicacion']  ?? ''
    ]
]);
