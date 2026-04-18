const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// @route   POST /addSchool
// @desc    Add a new school to the database
app.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validation: Ensure no fields are empty
    if (!name || !address || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'All fields (name, address, latitude, longitude) are required.' });
    }

    // Validation: Correct data types
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ error: 'Latitude and longitude must be numbers.' });
    }

    // Validation: Latitude and longitude ranges
    if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ error: 'Latitude must be between -90 and 90.' });
    }
    if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: 'Longitude must be between -180 and 180.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );
        res.status(201).json({ 
            message: 'School added successfully.', 
            schoolId: result.insertId 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to add school to the database.' });
    }
});

// @route   GET /listSchools
// @desc    Get all schools sorted by proximity to a user-specified location
app.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;

    // Validation: Check if latitude and longitude are provided
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'User coordinates (latitude, longitude) are required.' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // Validation: Numbers and ranges
    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({ error: 'Invalid coordinates provided.' });
    }

    try {
        // Fetch all schools from the database
        const [schools] = await pool.execute('SELECT * FROM schools');

        // Calculate distance for each school and attach it to the object
        const schoolsWithDistance = schools.map(school => ({
            ...school,
            distance: calculateDistance(userLat, userLon, parseFloat(school.latitude), parseFloat(school.longitude))
        }));

        // Sort by distance (ascending - closest first)
        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(schoolsWithDistance);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch schools.' });
    }
});

// Basic Error Handling for invalid routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
