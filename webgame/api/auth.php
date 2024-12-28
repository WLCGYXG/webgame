<?php
require_once __DIR__ . '/../controllers/AuthController.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$auth = new AuthController();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch($action) {
    case 'register':
        $auth->register();
        break;
    
    case 'login':
        $auth->login();
        break;
    
    case 'logout':
        $auth->logout();
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid endpoint']);
        break;
}
