<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    private $table = 'users';

    public $id;
    public $username;
    public $password;
    public $created_at;

    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    public function register($username, $password) {
        $query = "INSERT INTO " . $this->table . " (username, password) VALUES (:username, :password)";
        $stmt = $this->conn->prepare($query);

        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password_hash);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function login($username, $password) {
        $query = "SELECT id, username, password FROM " . $this->table . " WHERE username = :username";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if(password_verify($password, $row['password'])) {
                $this->id = $row['id'];
                $this->username = $row['username'];
                return true;
            }
        }
        return false;
    }
}
