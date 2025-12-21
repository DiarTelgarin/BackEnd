const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 

// Temporary database 
let calculations = [];
let nextId = 1;

// GET 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// POST 
app.post('/api/bmi/calculate', (req, res) => {
    const { weight, height } = req.body;
    
    // Validation
    if (!weight || !height) {
        return res.status(400).json({
            success: false,
            error: 'Weight and height are required'
        });
    }
    
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    if (weightNum <= 0 || heightNum <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Weight and height must be positive numbers'
        });
    }
    
    if (heightNum > 3) {
        return res.status(400).json({
            success: false,
            error: 'Height must be in meters (e.g., 1.75)'
        });
    }
    
    // BMI calculation
    const bmi = weightNum / (heightNum * heightNum);
    const bmiRounded = parseFloat(bmi.toFixed(1));
    
    // Category and advice
    let category = '';
    let advice = '';
    
    if (bmi < 18.5) {
        category = 'Underweight';
        advice = 'You may need to gain weight. Consult with a healthcare provider.';
    } else if (bmi >= 18.5 && bmi < 24.9) {
        category = 'Normal weight';
        advice = 'Great! You have a healthy weight. Keep it up!';
    } else if (bmi >= 25 && bmi < 29.9) {
        category = 'Overweight';
        advice = 'Consider a balanced diet and regular exercise.';
    } else {
        category = 'Obese';
        advice = 'Consult with a healthcare provider for a personalized plan.';
    }
    
    // Data storage
    const calculation = {
        id: nextId++,
        weight: weightNum,
        height: heightNum,
        bmi: bmiRounded,
        category,
        advice,
        timestamp: new Date().toISOString()
    };
    
    calculations.push(calculation);
    
    // Output
    res.status(201).json({
        success: true,
        data: calculation
    });
});

// All history
app.get('/api/bmi/history', (req, res) => {
    res.json({
        success: true,
        count: calculations.length,
        data: calculations
    });
});

// By ID
app.get('/api/bmi/history/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const calculation = calculations.find(c => c.id === id);
    
    if (!calculation) {
        return res.status(404).json({
            success: false,
            error: 'Calculation not found'
        });
    }
    
    res.json({
        success: true,
        data: calculation
    });
});

// Statustics
app.get('/api/bmi/statistics', (req, res) => {
    if (calculations.length === 0) {
        return res.json({
            success: true,
            data: {
                totalCalculations: 0,
                averageBMI: 0,
                categories: {}
            }
        });
    }
    
    const totalBMI = calculations.reduce((sum, calc) => sum + calc.bmi, 0);
    const averageBMI = (totalBMI / calculations.length).toFixed(1);
    
    // By category counts
    const categories = calculations.reduce((acc, calc) => {
        acc[calc.category] = (acc[calc.category] || 0) + 1;
        return acc;
    }, {});
    
    res.json({
        success: true,
        data: {
            totalCalculations: calculations.length,
            averageBMI: parseFloat(averageBMI),
            categories
        }
    });
});

// Delete by ID
app.delete('/api/bmi/history/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = calculations.findIndex(c => c.id === id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Calculation not found'
        });
    }
    
    const deleted = calculations.splice(index, 1)[0];
    
    res.json({
        success: true,
        message: 'Calculation deleted successfully',
        data: deleted
    });
});

// Delete all history
app.delete('/api/bmi/history', (req, res) => {
    const count = calculations.length;
    calculations = [];
    nextId = 1;
    
    res.json({
        success: true,
        message: `Deleted ${count} calculations`
    });
});

// Custom error classes
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

class NotFoundError extends Error {
    constructor(resource) {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    res.status(statusCode).json({
        success: false,
        error: message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.url} not found`
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        calculations: calculations.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`BMI Calculator API running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  POST   /api/bmi/calculate');
    console.log('  GET    /api/bmi/history');
    console.log('  GET    /api/bmi/history/:id');
    console.log('  GET    /api/bmi/statistics');
    console.log('  DELETE /api/bmi/history/:id');
    console.log('  DELETE /api/bmi/history');
    console.log('  GET    /health');
});