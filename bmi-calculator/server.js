const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware для обработки данных форм
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware для статических файлов (CSS)
app.use(express.static('public'));

// GET / - Главная страница с формой
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BMI Calculator</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <div class="calculator-card">
          <h1>BMI Calculator</h1>
          <p class="subtitle">Calculate your Body Mass Index</p>
          
          <form action="/calculate-bmi" method="POST" id="bmiForm">
            <div class="form-group">
              <label for="weight">Weight (kg)</label>
              <input 
                type="number" 
                id="weight" 
                name="weight" 
                step="0.1" 
                placeholder="Enter your weight in kg"
                required>
            </div>
            
            <div class="form-group">
              <label for="height">Height (m)</label>
              <input 
                type="number" 
                id="height" 
                name="height" 
                step="0.01" 
                placeholder="Enter your height in meters"
                required>
            </div>
            
            <button type="submit" class="btn-calculate">Calculate BMI</button>
          </form>
          
          <div class="info-section">
            <h3>BMI Categories:</h3>
            <ul>
              <li><span class="underweight"></span> Underweight: BMI < 18.5</li>
              <li><span class="normal"></span> Normal weight: 18.5 ≤ BMI < 24.9</li>
              <li><span class="overweight"></span> Overweight: 25 ≤ BMI < 29.9</li>
              <li><span class="obese"></span> Obese: BMI ≥ 30</li>
            </ul>
          </div>
        </div>
      </div>
      
      <script>
        const form = document.getElementById('bmiForm');
        
        form.addEventListener('submit', function(e) {
          const weight = parseFloat(document.getElementById('weight').value);
          const height = parseFloat(document.getElementById('height').value);
          
          if (weight <= 0 || height <= 0) {
            e.preventDefault();
            alert('Please enter positive numbers for weight and height!');
            return false;
          }
          
          if (height > 3) {
            e.preventDefault();
            alert('Height seems too large. Please enter height in meters (e.g., 1.75)');
            return false;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// POST /calculate-bmi - Расчет BMI
app.post('/calculate-bmi', (req, res) => {
  const { weight, height } = req.body;
  
  // Валидация входных данных
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);
  
  if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BMI Calculator - Error</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container">
          <div class="calculator-card">
            <h1>❌ Invalid Input</h1>
            <p class="error-message">Please enter valid positive numbers for weight and height.</p>
            <a href="/" class="btn-back">Go Back</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
  
  // Расчет BMI
  const bmi = weightNum / (heightNum * heightNum);
  const bmiRounded = bmi.toFixed(1);
  
  // Определение категории
  let category = '';
  let categoryClass = '';
  let advice = '';
  
  if (bmi < 18.5) {
    category = 'Underweight';
    categoryClass = 'underweight';
    advice = 'You may need to gain weight. Consult with a healthcare provider.';
  } else if (bmi >= 18.5 && bmi < 24.9) {
    category = 'Normal weight';
    categoryClass = 'normal';
    advice = 'Great! You have a healthy weight. Keep it up!';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    categoryClass = 'overweight';
    advice = 'Consider a balanced diet and regular exercise.';
  } else {
    category = 'Obese';
    categoryClass = 'obese';
    advice = 'Consult with a healthcare provider for a personalized plan.';
  }
  
  // Отправка результата
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BMI Calculator - Result</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <div class="calculator-card">
          <h1>Your BMI Result</h1>
          
          <div class="result-section">
            <div class="bmi-value">
              <span class="bmi-number">${bmiRounded}</span>
            </div>
            
            <div class="category-badge ${categoryClass}">
              ${category}
            </div>
            
            <div class="details">
              <p><strong>Weight:</strong> ${weightNum} kg</p>
              <p><strong>Height:</strong> ${heightNum} m</p>
            </div>
            
            <div class="advice">
              <p>${advice}</p>
            </div>
          </div>
          
          <a href="/" class="btn-back">Calculate Again</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 BMI Calculator server is running on http://localhost:${PORT}`);
  console.log(`📊 Open your browser and visit: http://localhost:${PORT}`);
});