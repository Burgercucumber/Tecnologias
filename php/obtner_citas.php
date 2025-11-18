<?php
// php/obtener_citas.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
session_start();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Sin conexión a la base de datos']);
    exit;
}

$usuarioId = $_SESSION['user_id'] ?? ($_SESSION['usuario']['id'] ?? null);
if (!$usuarioId) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Sesión no válida']);
    exit;
}

$clinicasIndex = [];
$jsonPath = __DIR__ . '/../json/clinicas.json';
if (is_file($jsonPath)) {
    $json = json_decode(file_get_contents($jsonPath), true);
    if (!empty($json['clinicas']) && is_array($json['clinicas'])) {
        foreach ($json['clinicas'] as $clinica) {
            if (empty($clinica['id'])) {
                continue;
            }
            $cid = (int) $clinica['id'];
            $clinicasIndex[$cid] = [
                'nombre'    => $clinica['nombre'] ?? ('Clínica #' . $cid),
                'ubicacion' => trim(($clinica['ciudad'] ?? '') . (isset($clinica['barrio']) ? ', ' . $clinica['barrio'] : ''))
            ];
        }
    }
}

$sql = "SELECT
            id,
            clinica_id,
            procedimiento,
            monto_total,
            fecha_cita,
            hora_cita,
            creado_en
        FROM pagos
        WHERE usuario_id = ?
        ORDER BY fecha_cita ASC, hora_cita ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

$citas = [];
while ($row = $result->fetch_assoc()) {
    $cid = (int) ($row['clinica_id'] ?? 0);
    $clinicaInfo = $clinicasIndex[$cid] ?? null;

    $citas[] = [
        'id'          => (int) $row['id'],
        'procedimiento' => $row['procedimiento'] ?: 'Procedimiento',
        'clinica'     => $clinicaInfo['nombre'] ?? ('Clínica #' . ($row['clinica_id'] ?? '?')),
        'ubicacion'   => $clinicaInfo['ubicacion'] ?? '',
        'fecha_cita'  => $row['fecha_cita'],
        'hora_cita'   => $row['hora_cita'],
        'total'       => (float) $row['monto_total'],
        'estado'      => 'PAGADO',
        'creado_en'   => $row['creado_en']
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    'ok'    => true,
    'citas' => $citas
], JSON_UNESCAPED_UNICODE);
?>
