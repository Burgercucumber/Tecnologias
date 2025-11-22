<?php
// php/favoritos.php
// API para gestionar favoritos de clínicas por usuario de sesión.

header('Content-Type: application/json; charset=utf-8');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/conexion.php';

// Obtener user id desde la sesión (acepta user_id o usuario[id])
$usuarioId = null;
if (isset($_SESSION['user_id'])) {
    $usuarioId = (int) $_SESSION['user_id'];
} elseif (isset($_SESSION['usuario']['id'])) {
    $usuarioId = (int) $_SESSION['usuario']['id'];
}

if (!$usuarioId) {
    echo json_encode(['ok' => false, 'error' => 'No hay usuario autenticado.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    // ================= GET =================
    if ($method === 'GET') {
        // Si se envía ?clinica_id, responder solo si es favorito o no
        if (isset($_GET['clinica_id'])) {
            $clinicaId = (int) $_GET['clinica_id'];
            $stmt = $pdo->prepare('SELECT 1 FROM favoritos WHERE usuario_id = :u AND clinica_id = :c LIMIT 1');
            $stmt->execute([':u' => $usuarioId, ':c' => $clinicaId]);
            $esFav = (bool) $stmt->fetchColumn();

            echo json_encode([
                'ok'         => true,
                'clinica_id' => $clinicaId,
                'favorito'   => $esFav
            ]);
            exit;
        }

        // Si no se envía clinica_id, listar todos los favoritos del usuario
        $stmt = $pdo->prepare('SELECT clinica_id FROM favoritos WHERE usuario_id = :u');
        $stmt->execute([':u' => $usuarioId]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Enriquecer con nombre/logo desde JSON de clínicas
        $favoritos = [];
        $jsonPath = __DIR__ . '/../json/clinicas.json';
        $clinicasData = [];
        if (is_readable($jsonPath)) {
            $raw = file_get_contents($jsonPath);
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && isset($decoded['clinicas'])) {
                foreach ($decoded['clinicas'] as $c) {
                    if (isset($c['id'])) {
                        $clinicasData[(int)$c['id']] = $c;
                    }
                }
            }
        }

        foreach ($rows as $cid) {
            $cid = (int) $cid;
            if (isset($clinicasData[$cid])) {
                $c = $clinicasData[$cid];
                $favoritos[] = [
                    'clinica_id' => $cid,
                    'nombre'     => $c['nombre'] ?? 'Clinica',
                    'logo'       => $c['logo']   ?? '',
                    'liked'      => true
                ];
            } else {
                $favoritos[] = [
                    'clinica_id' => $cid,
                    'nombre'     => 'Clinica #' . $cid,
                    'logo'       => '',
                    'liked'      => true
                ];
            }
        }

        echo json_encode(['ok' => true, 'favoritos' => $favoritos]);
        exit;
    }

    // ================= POST =================
    if ($method === 'POST') {
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if (!$data || !isset($data['clinica_id'])) {
            echo json_encode(['ok' => false, 'error' => 'JSON invalido o clinica_id faltante.']);
            exit;
        }

        $clinicaId = (int) $data['clinica_id'];
        $favorito  = isset($data['favorito']) ? (bool)$data['favorito'] : true;

        if ($favorito) {
            // Agregar favorito (evitar duplicados)
            $stmt = $pdo->prepare('INSERT IGNORE INTO favoritos (usuario_id, clinica_id, creado_en) VALUES (:u, :c, NOW())');
            $stmt->execute([':u' => $usuarioId, ':c' => $clinicaId]);
        } else {
            // Eliminar favorito
            $stmt = $pdo->prepare('DELETE FROM favoritos WHERE usuario_id = :u AND clinica_id = :c');
            $stmt->execute([':u' => $usuarioId, ':c' => $clinicaId]);
        }

        echo json_encode([
            'ok'         => true,
            'clinica_id' => $clinicaId,
            'favorito'   => $favorito
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metodo no permitido.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error en favoritos.php: ' . $e->getMessage()]);
}
