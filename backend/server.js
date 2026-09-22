const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Initialize database
const db = require('./config/database');

const salaryRoutes = require('./routes/salaryRoutes');
const taxRoutes = require('./routes/taxRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'EmployEase backend is running'
    });
});

// API Routes
app.use('/api/salary', salaryRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/documents', documentRoutes);

// Root route fallback
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'EmployEase API Root. Use /api/health to check server status.'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 EmployEase backend server is running on port ${PORT}`);
    console.log(`🩺 Health endpoint available at http://localhost:${PORT}/api/health`);
});
