<?php
// test_perfil.php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

$email = 'demo@odontogo.com'; // Usa el mismo email que en tus pruebas

// Test citas
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM pagos WHERE email = ? AND estado = 'PAGADO'");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

echo json_encode([
    'email' => $email,
    'total_citas' => $row['total'],
    'status' => 'OK'
]);

$stmt->close();
$conn->close();
?>