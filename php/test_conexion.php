<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Test de Conexión MySQL</h2>";

echo "<p><strong>Intentando conectar...</strong></p>";

$host = "127.0.0.1";
$user = "root";
$pass = "";
$db   = "odontogo";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo "<p style='color:red;'>❌ ERROR: " . $conn->connect_error . "</p>";
    echo "<p>Código de error: " . $conn->connect_errno . "</p>";
    
    // Mostrar posibles causas
    echo "<h3>Posibles causas:</h3>";
    echo "<ul>";
    echo "<li>MySQL no está corriendo en XAMPP</li>";
    echo "<li>El puerto no es 3306</li>";
    echo "<li>La base de datos 'odontogo' no existe</li>";
    echo "</ul>";
} else {
    echo "<p style='color:green;'>✅ CONEXIÓN EXITOSA</p>";
    echo "<p>Host: " . $conn->host_info . "</p>";
    echo "<p>Versión MySQL: " . $conn->server_info . "</p>";
    
    // Verificar base de datos
    $result = $conn->query("SELECT DATABASE()");
    $row = $result->fetch_row();
    echo "<p>Base de datos actual: <strong>" . $row[0] . "</strong></p>";
    
    // Verificar tabla pagos
    $result = $conn->query("SHOW TABLES LIKE 'pagos'");
    if ($result->num_rows > 0) {
        echo "<p>✅ Tabla 'pagos' existe</p>";
        
        // Contar registros
        $result = $conn->query("SELECT COUNT(*) as total FROM pagos");
        $row = $result->fetch_assoc();
        echo "<p>Registros en 'pagos': <strong>" . $row['total'] . "</strong></p>";
    } else {
        echo "<p style='color:red;'>❌ Tabla 'pagos' NO existe</p>";
    }
}
?>