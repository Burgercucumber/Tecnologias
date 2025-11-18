<?php
// backend/api/clinicas.php
// API que devuelve datos de clínicas en formato JSON

// Permitir peticiones desde cualquier origen (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Si es una petición OPTIONS (preflight), terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ruta al archivo JSON (ajusta según tu estructura de carpetas)
$rutaJson = __DIR__ . '/../json/clinicas.json';

// Verificar que el archivo existe
if (!file_exists($rutaJson)) {
    http_response_code(404);
    echo json_encode([
        'error' => true,
        'mensaje' => 'Archivo de datos no encontrado',
        'ruta_buscada' => $rutaJson
    ]);
    exit();
}

// Leer el contenido del archivo
$contenido = file_get_contents($rutaJson);

// Verificar que se pudo leer
if ($contenido === false) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'mensaje' => 'Error al leer el archivo de datos'
    ]);
    exit();
}

// Decodificar JSON para validar
$data = json_decode($contenido, true);

// Verificar que el JSON es válido
if ($data === null) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'mensaje' => 'Error al decodificar JSON: ' . json_last_error_msg()
    ]);
    exit();
}

// Verificar que existe el array de clínicas
if (!isset($data['clinicas']) || !is_array($data['clinicas'])) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'mensaje' => 'Estructura de datos inválida: falta el array "clinicas"'
    ]);
    exit();
}

// ===== TRANSFORMAR DATOS =====
// Aplanar la estructura: cada clínica-tratamiento como un registro independiente
$clinicasTransformadas = [];

foreach ($data['clinicas'] as $clinica) {
    if (!isset($clinica['tratamientos']) || !is_array($clinica['tratamientos'])) {
        continue;
    }
    
    foreach ($clinica['tratamientos'] as $tratamiento) {
        // Crear un registro combinando datos de clínica + tratamiento
        $registro = [
            'id' => $clinica['id'],
            'nombre' => $clinica['nombre'],
            'ciudad' => $clinica['ciudad'],
            'barrio' => $clinica['barrio'],
            'rating' => $clinica['rating'],
            'reviews' => $clinica['reviews'],
            'logo' => $clinica['logo'],
            'tratamiento_id' => $tratamiento['id'],
            'tratamiento_nombre' => $tratamiento['nombre'],
            'duracion' => $tratamiento['duracion'],
            'modalidad' => $tratamiento['modalidad'],
            'precio_total' => $tratamiento['precio_total'],
            'precio_proc' => $tratamiento['precio_proc'],
            'precio_rev' => $tratamiento['precio_rev'],
            'detalle' => $tratamiento['detalle']
        ];
        
        $clinicasTransformadas[] = $registro;
    }
}

// ===== FILTROS =====
$clinicas = $clinicasTransformadas;

// Filtro por tratamiento (ID del tratamiento)
if (isset($_GET['tratamiento'])) {
    $tratamientoId = $_GET['tratamiento'];
    $clinicas = array_filter($clinicas, function($c) use ($tratamientoId) {
        return isset($c['tratamiento_id']) && $c['tratamiento_id'] === $tratamientoId;
    });
}

// Filtro por barrio
if (isset($_GET['barrio']) && !empty($_GET['barrio'])) {
    $barrio = $_GET['barrio'];
    $clinicas = array_filter($clinicas, function($c) use ($barrio) {
        if (!isset($c['barrio'])) return false;
        
        // Normalizar ambos strings: quitar acentos y convertir a minúsculas
        $barrioNormalizado = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $barrio));
        $cBarrioNormalizado = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $c['barrio']));
        
        return $barrioNormalizado === $cBarrioNormalizado;
    });
}

// Reindexar array
$clinicas = array_values($clinicas);

// ===== RESPUESTA EXITOSA =====
http_response_code(200);
echo json_encode([
    'error' => false,
    'total' => count($clinicas),
    'clinicas' => $clinicas
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);