<?php
// php/db.php
$host = "127.0.0.1";
$user = "root";
$pass = "";
$db   = "odontogo";

// Crear conexión SIN @ para ver errores
$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    // NO usar die() aquí, solo setear conn a null
    $conn = null;
    error_log("Error de conexión MySQL: " . $conn->connect_error);
} else {
    // Configurar charset UTF-8
    $conn->set_charset("utf8mb4");
}

// NO cerrar la conexión aquí
?>