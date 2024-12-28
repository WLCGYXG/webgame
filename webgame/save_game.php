<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config/database.php';

try {
    $database = Database::getInstance();
    $conn = $database->getConnection();

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('No data received');
    }

    if (!isset($data['user_id']) || !isset($data['seeds']) || !isset($data['crops'])) {
        throw new Exception('Missing required fields');
    }

    $conn->beginTransaction();

    $stmt = $conn->prepare("UPDATE users SET seeds = :seeds WHERE id = :user_id");
    $stmt->execute([
        ':seeds' => $data['seeds'],
        ':user_id' => $data['user_id']
    ]);

    $stmt = $conn->prepare("DELETE FROM crops WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $data['user_id']]);

    $stmt = $conn->prepare("INSERT INTO crops (user_id, crop_type, position_x, position_y, plant_time) VALUES (:user_id, :crop_type, :position_x, :position_y, :plant_time)");
    
    foreach ($data['crops'] as $crop) {
        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':crop_type' => $crop['type'],
            ':position_x' => $crop['x'],
            ':position_y' => $crop['y'],
            ':plant_time' => date('Y-m-d H:i:s', $crop['plantTime'])
        ]);
    }

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Game saved successfully']);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
