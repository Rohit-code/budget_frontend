const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',       // replace with your PostgreSQL username
  host: 'localhost',
  database: 'budget_management',
  password: '123',  // replace with your PostgreSQL password
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

app.post('/save-budget', async (req, res) => {
  const budgetData = req.body;

  for (const month in budgetData) {
    for (const category in budgetData[month]) {
      const { budget, actual } = budgetData[month][category];
      await pool.query(
        'INSERT INTO budget (month, category, budget, actual) VALUES ($1, $2, $3, $4) ON CONFLICT (month, category) DO UPDATE SET budget = $3, actual = $4',
        [month, category, budget, actual]
      );
    }
  }

  res.send({ message: 'Budget data saved' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
