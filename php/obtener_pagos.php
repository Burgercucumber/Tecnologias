<?php
// php/obtener_pagos.php
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

// Mapear datos de clínicas/tratamientos desde el JSON usado en Search
$clinicasIndex = [];
$tratamientosIndex = [];
$jsonPath = __DIR__ . '/../json/clinicas.json';
if (is_file($jsonPath)) {
    $json = json_decode(file_get_contents($jsonPath), true);
    if (!empty($json['clinicas']) && is_array($json['clinicas'])) {
        foreach ($json['clinicas'] as $clinica) {
            if (empty($clinica['id'])) {
                continue;
            }
            $cid = (int) $clinica['id'];
            $nombre = $clinica['nombre'] ?? ('Clínica #' . $cid);
            $ubic = trim(($clinica['ciudad'] ?? '') . (isset($clinica['barrio']) ? ', ' . $clinica['barrio'] : ''));
            $clinicasIndex[$cid] = [
                'nombre'    => $nombre,
                'ubicacion' => $ubic
            ];

            if (!empty($clinica['tratamientos']) && is_array($clinica['tratamientos'])) {
                foreach ($clinica['tratamientos'] as $trat) {
                    if (empty($trat['id'])) {
                        continue;
                    }
                    $key = $cid . '|' . $trat['id'];
                    $tratamientosIndex[$key] = $trat['nombre'] ?? '';
                }
            }
        }
    }
}

$sql = "SELECT
            id,
            clinica_id,
            oferta_id,
            procedimiento,
            monto_procedimiento,
            monto_revision,
            monto_total,
            fecha_cita,
            hora_cita,
            creado_en
        FROM pagos
        WHERE usuario_id = ?
        ORDER BY creado_en DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

$pagos = [];
while ($row = $result->fetch_assoc()) {
    $cid = (int) ($row['clinica_id'] ?? 0);
    $clinicaInfo = $clinicasIndex[$cid] ?? null;
    $tratKey = $cid . '|' . ($row['oferta_id'] ?? '');
    $tratNombre = $tratamientosIndex[$tratKey] ?? '';

    $pagos[] = [
        'id'                   => (int) $row['id'],
        'procedimiento'        => $row['procedimiento'] ?: ($tratNombre ?: 'Procedimiento'),
        'precio_procedimiento' => (float) $row['monto_procedimiento'],
        'precio_revision'      => (float) $row['monto_revision'],
        'total'                => (float) $row['monto_total'],
        'clinica'              => $clinicaInfo['nombre'] ?? ('Clínica #' . ($row['clinica_id'] ?? '?')),
        'ubicacion'            => $clinicaInfo['ubicacion'] ?? '',
        'fecha_cita'           => $row['fecha_cita'],
        'hora_cita'            => $row['hora_cita'],
        'fecha_pago'           => $row['creado_en'],
        'estado'               => 'PAGADO'
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    'ok'    => true,
    'pagos' => $pagos
], JSON_UNESCAPED_UNICODE);
?>
