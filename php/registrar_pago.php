<?php
// php/registrar_pago.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion.php'; // ajusta el nombre de tu archivo de conexión
session_start();

try {
    // ---------- Leer JSON ----------
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data) {
        throw new Exception('JSON inválido en la petición.');
    }

    // ---------- Usuario en sesión ----------
    $usuarioId = $_SESSION['user_id'] ?? ($_SESSION['usuario']['id'] ?? null);
    if (!$usuarioId) {
        throw new Exception('No hay usuario autenticado en la sesión.');
    }
    $usuarioId = (int) $usuarioId;

    // ---------- Datos principales ----------
    $clinicaId   = isset($data['clinica_id']) ? (int)$data['clinica_id'] : 0;
    $ofertaId    = isset($data['oferta_id'])  ? (int)$data['oferta_id']  : null;
    $procNombre  = $data['procedimiento']     ?? '';
    $mProc       = isset($data['monto_procedimiento']) ? (float)$data['monto_procedimiento'] : 0;
    $mRev        = isset($data['monto_revision'])      ? (float)$data['monto_revision']      : 0;
    $mTotal      = isset($data['monto_total'])         ? (float)$data['monto_total']         : 0;
    $fechaCita   = $data['fecha_cita'] ?? null;
    $horaCita    = $data['hora_cita']  ?? null;

    $missing = [];
    if (!$clinicaId) $missing[] = 'clinica_id';
    if (!$mTotal) $missing[] = 'monto_total';
    if (!$fechaCita) $missing[] = 'fecha_cita';
    if (!$horaCita) $missing[] = 'hora_cita';
    if ($missing) {
        throw new Exception('Faltan datos obligatorios para registrar el pago: ' . implode(', ', $missing));
    }

    // ---------- INSERT en tu tabla de pagos ----------
    // CAMBIA nombres de tabla/columnas según tu esquema
    $sql = "INSERT INTO pagos (
                usuario_id,
                clinica_id,
                oferta_id,
                procedimiento,
                monto_procedimiento,
                monto_revision,
                monto_total,
                fecha_cita,
                hora_cita,
                creado_en
            ) VALUES (
                :usuario_id,
                :clinica_id,
                :oferta_id,
                :procedimiento,
                :monto_proc,
                :monto_rev,
                :monto_total,
                :fecha_cita,
                :hora_cita,
                NOW()
            )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':usuario_id'   => $usuarioId,
        ':clinica_id'   => $clinicaId,
        ':oferta_id'    => $ofertaId,
        ':procedimiento'=> $procNombre,
        ':monto_proc'   => $mProc,
        ':monto_rev'    => $mRev,
        ':monto_total'  => $mTotal,
        ':fecha_cita'   => $fechaCita,
        ':hora_cita'    => $horaCita,
    ]);

    $pagoId = $pdo->lastInsertId();

    echo json_encode([
        'ok'      => true,
        'pago_id' => $pagoId,
        'mensaje' => 'Pago registrado correctamente'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'ok'    => false,
        'error' => $e->getMessage()
    ]);
}
