<?php
session_start();
require_once '../config/database.php';
require_once '../models/User.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('default_charset', 'utf-8');
mb_internal_encoding('UTF-8');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit;
}

$username = $data['username'];
$password = $data['password'];

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }
} catch(PDOException $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Login failed, please try again later']);
}
