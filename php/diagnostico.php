<?php
// php/diagnostico.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Diagnóstico OdontoGo</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .test { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ccc; }
        .test.success { border-color: #10b981; }
        .test.error { border-color: #ef4444; }
        .test h3 { margin: 0 0 10px; }
        .test pre { background: #f9f9f9; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge.ok { background: #10b981; color: white; }
        .badge.fail { background: #ef4444; color: white; }
    </style>
</head>
<body>
    <h1>🔍 Diagnóstico OdontoGo</h1>
    
    <?php
    $tests = [];
    
    // Test 1: Conexión a la base de datos
    $tests[] = [
        'name' => 'Conexión a la base de datos',
        'test' => function() {
            try {
                require_once 'db.php';
                global $conn;
                if ($conn && !$conn->connect_error) {
                    return ['ok' => true, 'msg' => 'Conexión exitosa a MySQL'];
                }
                return ['ok' => false, 'msg' => 'Error: ' . ($conn->connect_error ?? 'No se pudo conectar')];
            } catch (Exception $e) {
                return ['ok' => false, 'msg' => 'Error: ' . $e->getMessage()];
            }
        }
    ];
    
    // Test 2: Tabla pagos existe
    $tests[] = [
        'name' => 'Tabla "pagos" existe',
        'test' => function() {
            global $conn;
            if (!$conn) return ['ok' => false, 'msg' => 'No hay conexión'];
            
            $result = $conn->query("SHOW TABLES LIKE 'pagos'");
            if ($result && $result->num_rows > 0) {
                return ['ok' => true, 'msg' => 'Tabla "pagos" encontrada'];
            }
            return ['ok' => false, 'msg' => 'Tabla "pagos" NO existe. Debes crearla primero.'];
        }
    ];
    
    // Test 3: Contar registros en pagos
    $tests[] = [
        'name' => 'Registros en la tabla pagos',
        'test' => function() {
            global $conn;
            if (!$conn) return ['ok' => false, 'msg' => 'No hay conexión'];
            
            $result = $conn->query("SELECT COUNT(*) as total FROM pagos");
            if ($result) {
                $row = $result->fetch_assoc();
                $total = $row['total'];
                if ($total > 0) {
                    return ['ok' => true, 'msg' => "Se encontraron {$total} registro(s)"];
                }
                return ['ok' => false, 'msg' => 'La tabla está vacía. Realiza un pago primero.'];
            }
            return ['ok' => false, 'msg' => 'Error al consultar la tabla'];
        }
    ];
    
    // Test 4: Mostrar últimos 3 registros
    $tests[] = [
        'name' => 'Últimos 3 pagos registrados',
        'test' => function() {
            global $conn;
            if (!$conn) return ['ok' => false, 'msg' => 'No hay conexión'];
            
            $result = $conn->query("SELECT id, procedimiento, email, fecha_cita, hora_cita, total, estado FROM pagos ORDER BY id DESC LIMIT 3");
            if ($result && $result->num_rows > 0) {
                $registros = [];
                while ($row = $result->fetch_assoc()) {
                    $registros[] = $row;
                }
                return ['ok' => true, 'msg' => 'Registros encontrados', 'data' => $registros];
            }
            return ['ok' => false, 'msg' => 'No hay registros para mostrar'];
        }
    ];
    
    // Test 5: Archivo obtener_citas.php existe
    $tests[] = [
        'name' => 'Archivo obtener_citas.php',
        'test' => function() {
            if (file_exists(__DIR__ . '/obtener_citas.php')) {
                return ['ok' => true, 'msg' => 'Archivo encontrado'];
            }
            return ['ok' => false, 'msg' => 'Archivo NO encontrado en php/obtener_citas.php'];
        }
    ];
    
    // Test 6: Archivo obtener_pagos.php existe
    $tests[] = [
        'name' => 'Archivo obtener_pagos.php',
        'test' => function() {
            if (file_exists(__DIR__ . '/obtener_pagos.php')) {
                return ['ok' => true, 'msg' => 'Archivo encontrado'];
            }
            return ['ok' => false, 'msg' => 'Archivo NO encontrado en php/obtener_pagos.php'];
        }
    ];
    
    // Test 7: Probar obtener_citas.php
    $tests[] = [
        'name' => 'Prueba obtener_citas.php',
        'test' => function() {
            global $conn;
            if (!$conn) return ['ok' => false, 'msg' => 'No hay conexión'];
            
            $email = 'demo@odontogo.com';
            $stmt = $conn->prepare("
                SELECT id, procedimiento, clinica, fecha_cita, hora_cita, total, estado
                FROM pagos 
                WHERE email = ? AND estado = 'PAGADO'
                ORDER BY fecha_cita ASC
            ");
            
            if (!$stmt) {
                return ['ok' => false, 'msg' => 'Error preparando consulta: ' . $conn->error];
            }
            
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $citas = [];
            while ($row = $result->fetch_assoc()) {
                $citas[] = $row;
            }
            $stmt->close();
            
            if (count($citas) > 0) {
                return ['ok' => true, 'msg' => count($citas) . ' cita(s) encontrada(s) para ' . $email, 'data' => $citas];
            }
            return ['ok' => false, 'msg' => 'No hay citas para el email: ' . $email];
        }
    ];
    
    // Ejecutar todos los tests
    foreach ($tests as $test) {
        $result = $test['test']();
        $class = $result['ok'] ? 'success' : 'error';
        $badge = $result['ok'] ? 'ok' : 'fail';
        
        echo "<div class='test {$class}'>";
        echo "<h3><span class='badge {$badge}'>" . ($result['ok'] ? '✓' : '✗') . "</span> {$test['name']}</h3>";
        echo "<p>{$result['msg']}</p>";
        
        if (isset($result['data'])) {
            echo "<pre>" . print_r($result['data'], true) . "</pre>";
        }
        
        echo "</div>";
    }
    
    if (isset($conn)) {
        $conn->close();
    }
    ?>
    
    <div class="test">
        <h3>📋 Información del sistema</h3>
        <pre>PHP Version: <?php echo phpversion(); ?>
MySQL Version: <?php echo mysqli_get_client_info(); ?>
Directorio actual: <?php echo __DIR__; ?>
Fecha/Hora servidor: <?php echo date('Y-m-d H:i:s'); ?></pre>
    </div>
    
    <div class="test">
        <h3>💡 Próximos pasos</h3>
        <ul>
            <li>Si todos los tests son ✓, el problema está en el JavaScript</li>
            <li>Si algún test es ✗, lee el mensaje de error y corrígelo</li>
            <li>Copia los resultados y envíalos para más ayuda</li>
        </ul>
    </div>
</body>
</html>