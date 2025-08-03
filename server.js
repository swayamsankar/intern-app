const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'intern_app'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes for serving HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Routes

// Get all applicants
app.get('/api/applicants', (req, res) => {
    const { search, position_type, department } = req.query;
    
    let query = 'SELECT * FROM applicants WHERE 1=1';
    const params = [];
    
    if (search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (position_type && position_type !== 'all') {
        query += ' AND position_type = ?';
        params.push(position_type);
    }
    
    if (department && department !== 'all') {
        query += ' AND department = ?';
        params.push(department);
    }
    
    query += ' ORDER BY submitted_at DESC';
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching applicants:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

// Get applicant statistics
app.get('/api/stats', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM applicants',
        interns: 'SELECT COUNT(*) as count FROM applicants WHERE position_type = "intern"',
        volunteers: 'SELECT COUNT(*) as count FROM applicants WHERE position_type = "volunteer"'
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, result) => {
            if (err) {
                console.error(`Error fetching ${key} stats:`, err);
                results[key] = 0;
            } else {
                results[key] = result[0].count;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// Get unique departments
app.get('/api/departments', (req, res) => {
    const query = 'SELECT DISTINCT department FROM applicants ORDER BY department';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results.map(row => row.department));
    });
});

// Create new applicant
app.post('/api/applicants', (req, res) => {
    const { name, email, phone, position_type, department, experience, motivation, availability } = req.body;
    
    // Validation
    if (!name || !email || !position_type || !department) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['intern', 'volunteer'].includes(position_type)) {
        return res.status(400).json({ error: 'Invalid position type' });
    }
    
    const query = `
        INSERT INTO applicants (name, email, phone, position_type, department, experience, motivation, availability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [name, email, phone || null, position_type, department, experience || null, motivation || null, availability || null];
    
    db.query(query, params, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            console.error('Error creating applicant:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.status(201).json({ 
            message: 'Application submitted successfully',
            id: result.insertId 
        });
    });
});

// Get single applicant
app.get('/api/applicants/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'SELECT * FROM applicants WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching applicant:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }
        
        res.json(results[0]);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});