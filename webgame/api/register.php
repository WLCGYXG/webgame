<?php
session_start();
require_once '../config/database.php';
require_once '../models/User.php';

header('Content-Type: application/json; charset=utf-8');

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
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 检查用户名是否已存在
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Username already exists']);
        exit;
    }
    
    // 创建新用户
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $hashed_password]);
    
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Registration failed, please try again later']);
}
