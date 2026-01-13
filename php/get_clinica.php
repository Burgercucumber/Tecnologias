
<?php
/**
 * get_clinica.php
 * API endpoint para obtener datos de una clínica
 * Ubicación: /php/get_clinica.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Obtener ID de la clínica
$id = isset($_GET['id']) ? intval($_GET['id']) : 1;

// Leer el JSON
$jsonPath = '../json/clinicas.json';

if (!file_exists($jsonPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Archivo clinicas.json no encontrado']);
    exit;
}

$jsonContent = file_get_contents($jsonPath);
$data = json_decode($jsonContent, true);

if (!$data || !isset($data['clinicas'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al leer datos']);
    exit;
}

// Buscar la clínica por ID
$clinica = null;
foreach ($data['clinicas'] as $c) {
    if ($c['id'] === $id) {
        $clinica = $c;
        break;
    }
}

if (!$clinica) {
    http_response_code(404);
    echo json_encode(['error' => 'Clínica no encontrada', 'id' => $id]);
    exit;
}

// Devolver la clínica
echo json_encode($clinica);
?>