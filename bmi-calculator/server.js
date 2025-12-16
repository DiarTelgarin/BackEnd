const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('.'));

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
          
          <form id="bmiForm">
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
          
          <!-- Блок для отображения результата -->
          <div id="result" style="display: none;">
            <div class="result-section">
              <div class="bmi-value">
                <span class="bmi-number" id="bmiValue"></span>
              </div>
              
              <div class="category-badge" id="categoryBadge"></div>
              
              <div class="details">
                <p><strong>Weight:</strong> <span id="weightDisplay"></span> kg</p>
                <p><strong>Height:</strong> <span id="heightDisplay"></span> m</p>
              </div>
              
              <div class="advice" id="adviceBox"></div>
            </div>
            
            <button class="btn-back" onclick="resetCalculator()">Calculate Again</button>
          </div>
          
          <div class="info-section" id="infoSection">
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
          e.preventDefault(); // Останавливаем отправку формы
          
          const weight = parseFloat(document.getElementById('weight').value);
          const height = parseFloat(document.getElementById('height').value);
          
          if (weight <= 0 || height <= 0) {
            alert('Please enter positive numbers for weight and height!');
            return false;
          }
          
          if (height > 3) {
            alert('Height seems too large. Please enter height in meters (e.g., 1.75)');
            return false;
          }
          
          const bmi = weight / (height * height);
          const bmiRounded = bmi.toFixed(1);
          
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
          
          document.getElementById('bmiValue').textContent = bmiRounded;
          document.getElementById('weightDisplay').textContent = weight;
          document.getElementById('heightDisplay').textContent = height;
          document.getElementById('adviceBox').innerHTML = '<p>' + advice + '</p>';
          
          const badge = document.getElementById('categoryBadge');
          badge.textContent = category;
          badge.className = 'category-badge ' + categoryClass;
          
          form.style.display = 'none';
          document.getElementById('infoSection').style.display = 'none';
          document.getElementById('result').style.display = 'block';
        });
        
        function resetCalculator() {
          form.style.display = 'block';
          document.getElementById('infoSection').style.display = 'block';
          document.getElementById('result').style.display = 'none';
          form.reset(); // Очищаем поля формы
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`BMI Calculator server http://localhost:${PORT}`);
});

