<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config/database.php';

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $database = Database::getInstance();
    $conn = $database->getConnection();

    $stmt = $conn->prepare("SELECT seeds FROM users WHERE id = :user_id");
    $stmt->execute([':user_id' => $_GET['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found');
    }

    $stmt = $conn->prepare("SELECT crop_type, position_x, position_y, plant_time FROM crops WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $_GET['user_id']]);
    $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted_crops = array_map(function($crop) {
        return [
            'type' => $crop['crop_type'],
            'x' => (int)$crop['position_x'],
            'y' => (int)$crop['position_y'],
            'plantTime' => strtotime($crop['plant_time'])
        ];
    }, $crops);

    echo json_encode([
        'success' => true,
        'data' => [
            'seeds' => (int)$user['seeds'],
            'crops' => $formatted_crops
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
