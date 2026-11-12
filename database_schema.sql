-- MySQL Database and Table Creation Script
-- Project: User Details Management System

CREATE DATABASE IF NOT EXISTS `user_details_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `user_details_db`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(30) NULL,
    `role` VARCHAR(100) NOT NULL DEFAULT 'Member',
    `department` VARCHAR(100) NOT NULL DEFAULT 'General',
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL DEFAULT 'USA',
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `is_admin` BOOLEAN NOT NULL DEFAULT FALSE,
    `avatar_url` VARCHAR(500) NULL,
    `bio` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_department` (`department`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample User Inserts
INSERT INTO `users` (`first_name`, `last_name`, `email`, `phone`, `role`, `department`, `address`, `city`, `country`, `status`, `avatar_url`, `bio`) 
VALUES
('Elena', 'Rostova', 'elena.rostova@example.com', '+1 (555) 234-5678', 'Lead Frontend Architect', 'Engineering', '742 Evergreen Terrace', 'San Francisco', 'USA', 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces', 'Specializes in high-performance React applications, WebGL, and micro-frontend architecture.'),
('Marcus', 'Chen', 'marcus.chen@example.com', '+1 (555) 345-6789', 'Principal Backend Engineer', 'Engineering', '120 Market Street', 'Seattle', 'USA', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', 'FastAPI and distributed systems enthusiast. Loves optimizing high-throughput SQL and Redis caching layers.'),
('Sophia', 'Alvarez', 'sophia.alvarez@example.com', '+1 (555) 456-7890', 'Product Design Director', 'Design', '88 King Street', 'Austin', 'USA', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces', 'Passionate about creating accessible, inclusive, and visually delightful design systems.'),
('David', 'Kim', 'david.kim@example.com', '+1 (555) 567-8901', 'Senior Product Manager', 'Product', '450 Broadway Ave', 'New York', 'USA', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', 'Leading enterprise analytics product roadmaps and customer growth telemetry.'),
('Amira', 'Patel', 'amira.patel@example.com', '+1 (555) 678-9012', 'DevOps & Cloud Engineer', 'Engineering', '310 Michigan Ave', 'Chicago', 'USA', 'Pending', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces', 'Kubernetes, Docker, CI/CD pipelines, and infrastructure as code automation specialist.');
