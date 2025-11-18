<?php
// php/conexion.php

$host    = 'localhost';
$dbname  = 'odontogo';   // o el nombre exacto de tu BD
$user    = 'root';
$pass    = '';           // en XAMPP normalmente vacío
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$pdo = new PDO($dsn, $user, $pass, $options);
