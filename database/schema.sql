-- Create database
CREATE DATABASE IF NOT EXISTS intern_app;
USE intern_app;

-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    position_type ENUM('intern', 'volunteer') NOT NULL,
    department VARCHAR(100) NOT NULL,
    experience TEXT,
    motivation TEXT,
    availability TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_email ON applicants(email);

-- Create index on position_type for filtering
CREATE INDEX idx_position_type ON applicants(position_type);

-- Create index on department for filtering
CREATE INDEX idx_department ON applicants(department);

-- Insert sample data (optional)
INSERT INTO applicants (name, email, phone, position_type, department, experience, motivation, availability) VALUES
('Swayam Sankar', 'Swayam.sankar@gmail.com', '555-0123', 'intern', 'engineering', 'Computer Science student with knowledge of JavaScript and Python', 'Passionate about technology and eager to learn from industry professionals', 'Available full-time starting June 2024'),
('Romii samal', 'Romi.samal@gmail.com', '555-0124', 'volunteer', 'community', 'Previous volunteer experience at local food bank', 'Want to give back to the community and help those in need', 'Weekends and evenings'),
('rohit Rao', 'Rohit.Rao@gmail.com', '555-0125', 'intern', 'marketing', 'Marketing major with social media management experience', 'Interested in digital marketing and brand development', 'Part-time during school year, full-time in summer');