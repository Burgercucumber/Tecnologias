<?php
// php/session-user.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

$user = $_SESSION['usuario'] ?? null;

echo json_encode([
    'authenticated' => (bool) $user,
    'nombre'        => $user['nombre'] ?? 'Invitado',
    // ⬇️ IMPORTANTE: ruta neutra (sin ../) para que el JS la normalice
    'avatar'        => $user['avatar'] ?? 'icons/user.png',
    'email'         => $user['email']  ?? ''
]);
