<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $user;

    public function __construct() {
        $this->user = new User();
        session_start();
    }

    public function register() {
        header('Content-Type: application/json');
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if(!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        if($this->user->register($data['username'], $data['password'], $data['email'])) {
            http_response_code(201);
            echo json_encode(['message' => 'User registered successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed']);
        }
    }

    public function login() {
        header('Content-Type: application/json');
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if(!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing username or password']);
            return;
        }

        $user = $this->user->login($data['username'], $data['password']);
        
        if($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            echo json_encode([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }

    public function logout() {
        session_destroy();
        echo json_encode(['message' => 'Logged out successfully']);
    }

    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }
}
