const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const { Pool } = require('pg');

const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'budget_management',
  password: '123',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

function formatDateFromDB(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Endpoint to create a new project
app.post('/projects', async (req, res) => {
  const { name, start_date, end_date, budget, order_value } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, start_date, end_date, order_value ,budget ) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, start_date, end_date, budget, order_value || null] // Set default if order_value is not provided
    );
    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to save budget data
app.post('/save-budget', async (req, res) => {
  const { projectId, budgetData } = req.body;

  try {
    for (const month in budgetData) {
      for (const category in budgetData[month]) {
        const { budget, actual } = budgetData[month][category];
        await pool.query(
          'INSERT INTO expenses (project_id, month, category, budget, actual) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (project_id, month, category) DO UPDATE SET budget = $4, actual = $5',
          [projectId, month, category, budget, actual]
        );
      }
    }
    res.send({ message: 'Budget data saved' });
  } catch (error) {
    console.error('Error saving budget data:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to delete a project
app.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM expenses WHERE project_id = $1', [id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.send({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to get a single project
app.get('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Project not found' });
    }
    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to save expenses for a project
app.post('/projects/:id/expenses', async (req, res) => {
  const { id } = req.params;
  const { newBudget, newActual } = req.body;

  try {
    for (const month in newBudget) {
      // Validate month format
      if (!/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/.test(month)) {
        return res.status(400).send({ error: `Invalid month format: ${month}` });
      }

      for (const category in newBudget[month]) {
        await pool.query(
          'INSERT INTO expenses (project_id, month, category, budget, actual) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (project_id, month, category) DO UPDATE SET budget = $4, actual = $5',
          [id, month, category, newBudget[month][category], newActual[month][category]]
        );
      }
    }
    res.send({ success: true });
  } catch (error) {
    console.error('Error saving expenses:', error);
    res.status(500).send({ error: 'Server error' });
  }
});


// Endpoint to get expenses for a project
app.get('/projects/:id/expenses', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM expenses WHERE project_id = $1', [id]);
    res.send(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to get the project summary for a specific project
app.get('/projects/:id/summary', async (req, res) => {
  const { id } = req.params;

  try {
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).send({ error: 'Project not found' });
    }

    const expensesResult = await pool.query('SELECT * FROM expenses WHERE project_id = $1', [id]);
    const expenses = expensesResult.rows;

    const totalBudget = parseFloat(project.budget);
    let consumedBudget = 0;
    let consumedActual = 0;

    expenses.forEach(expense => {
      if (expense.category !== 'Cash Outflow') {
        consumedBudget += parseFloat(expense.budget || 0);
        consumedActual += parseFloat(expense.actual || 0);
      }
    });

    const remainingBudget = totalBudget - consumedBudget;
    const remainingActual = totalBudget - consumedActual;

    res.send({
      totalBudget,
      consumedBudget,
      remainingBudget,
      consumedActual,
      remainingActual
    });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to get the project summary for all projects
app.get('/project-summary', async (req, res) => {
  try {
    const projectResult = await pool.query('SELECT * FROM projects');
    const projects = projectResult.rows;

    const summary = await Promise.all(projects.map(async (project) => {
      try {
        const expensesResult = await pool.query('SELECT * FROM expenses WHERE project_id = $1', [project.id]);
        const expenses = expensesResult.rows;

        const totalBudget = parseFloat(project.budget);
        let consumedBudget = 0;
        let consumedActual = 0;

        expenses.forEach(expense => {
          if (expense.category !== 'Cash Outflow') {
            consumedBudget += parseFloat(expense.budget || 0);
            consumedActual += parseFloat(expense.actual || 0);
          }
        });

        const remainingBudget = totalBudget - consumedBudget;
        const remainingActual = totalBudget - consumedActual;

        return {
          id: project.id,
          name: project.name,
          start_date: project.start_date,
          end_date: project.end_date,
          totalBudget,
          consumedBudget,
          remainingBudget,
          consumedActual,
          remainingActual
        };
      } catch (error) {
        console.error(`Error fetching expenses for project ${project.id}:`, error);
        throw new Error(`Error fetching expenses for project ${project.id}`);
      }
    }));

    res.send(summary);
  } catch (error) {
    console.error('Error fetching project summaries:', error);
    res.status(500).send({ error: 'Server error' });
  }
});


// Endpoint to get all projects
app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    const projects = result.rows.map(project => ({
      ...project,
      start_date: formatDateFromDB(project.start_date),
      end_date: formatDateFromDB(project.end_date)
    }));
    res.send(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to get a single project
app.get('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Project not found' });
    }
    const project = result.rows[0];
    project.start_date = formatDateFromDB(project.start_date);
    project.end_date = formatDateFromDB(project.end_date);
    res.send(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to update a project
app.put('/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, start_date, end_date, budget } = req.body;

  try {
    const result = await pool.query(
      'UPDATE projects SET name = $1, start_date = $2, end_date = $3, budget = $4 WHERE id = $5 RETURNING *',
      [name, formatDateToDB(start_date), formatDateToDB(end_date), budget, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Project not found' });
    }

    const project = result.rows[0];
    project.start_date = formatDateFromDB(project.start_date);
    project.end_date = formatDateFromDB(project.end_date);
    res.send(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

app.get('/financial-years', async (req, res) => {
  const query = `
      WITH fiscal_years AS (
          SELECT DISTINCT
              CASE
                  WHEN EXTRACT(MONTH FROM start_date) >= 4 THEN EXTRACT(YEAR FROM start_date)
                  ELSE EXTRACT(YEAR FROM start_date) - 1
              END AS financial_year
          FROM projects
          UNION
          SELECT DISTINCT
              CASE
                  WHEN EXTRACT(MONTH FROM end_date) >= 4 THEN EXTRACT(YEAR FROM end_date)
                  ELSE EXTRACT(YEAR FROM end_date) - 1
              END AS financial_year
          FROM projects
      )
      SELECT 
          financial_year
      FROM 
          fiscal_years
      ORDER BY 
          financial_year;
  `;

  try {
      const result = await pool.query(query);
      res.json(result.rows);
  } catch (err) {
      console.error('Error fetching financial years:', err);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/fiscal-year-months', async (req, res) => {
  const query = `
      WITH fiscal_year_months AS (
          SELECT DATE '2022-04-01' + INTERVAL '1 month' * (generate_series(0, 11)) AS month_date
          UNION ALL
          SELECT DATE '2023-04-01' + INTERVAL '1 month' * (generate_series(0, 11))
      )
      SELECT 
          fy.month_date AS fiscal_month,
          p.id AS project_id,
          p.name AS project_name,
          e.category,
          e.budget,
          e.actual
      FROM 
          fiscal_year_months fy
      JOIN 
          projects p ON fy.month_date BETWEEN p.start_date AND p.end_date
      JOIN 
          expenses e ON p.id = e.project_id AND TO_CHAR(fy.month_date, 'Mon YYYY') = e.month
      ORDER BY 
          fy.month_date, p.id, e.category;
  `;

  try {
      const result = await pool.query(query);
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

const getFinancialYearDates = (year) => {
  const startDate = new Date(`${year}-04-01`);
  const endDate = new Date(`${parseInt(year, 10) + 1}-03-31`);
  return { startDate, endDate };
};

app.get('/projects/financial-year/:startYear', async (req, res) => {
  const { startYear } = req.params;

  // Validate year format
  if (!/^\d{4}$/.test(startYear)) {
    return res.status(400).send('Invalid year format. Please provide a year in YYYY format.');
  }

  const { startDate, endDate } = getFinancialYearDates(startYear);

  try {
    const client = await pool.connect();

    const query = `
      WITH date_range AS (
        SELECT
          $1::date AS start_date,
          $2::date AS end_date
      ),
      projects_in_range AS (
        SELECT
          p.id,
          p.name,
          p.start_date,
          p.end_date,
          p.budget
        FROM projects p
        WHERE p.start_date <= (SELECT end_date FROM date_range)
          AND p.end_date >= (SELECT start_date FROM date_range)
      ),
      expenses_aggregated AS (
        SELECT
          p.id,
          p.name,
          e.month,
          SUM(e.actual) AS total_expense
        FROM projects_in_range p
        LEFT JOIN expenses e ON p.id = e.project_id
        WHERE TO_DATE(e.month, 'Mon YYYY') BETWEEN (SELECT start_date FROM date_range) AND (SELECT end_date FROM date_range)
        GROUP BY p.id, p.name, e.month
      ),
      budget_spent_and_carryover AS (
        SELECT
          p.id,
          p.name,
          p.start_date,
          p.end_date,
          p.budget,
          COALESCE(SUM(e.total_expense), 0) AS budget_spent,
          p.budget - COALESCE(SUM(e.total_expense), 0) AS carry_over_budget
        FROM projects_in_range p
        LEFT JOIN expenses_aggregated e ON p.id = e.id
        GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget
      )
      SELECT
        p.id,
        p.name,
        p.start_date,
        p.end_date,
        p.budget_spent,
        p.carry_over_budget,
        COALESCE(jsonb_object_agg(e.month, e.total_expense) FILTER (WHERE e.total_expense IS NOT NULL), '{}'::jsonb) AS expenses
      FROM budget_spent_and_carryover p
      LEFT JOIN expenses_aggregated e ON p.id = e.id
      GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget_spent, p.carry_over_budget;
    `;

    const values = [startDate, endDate];
    const result = await client.query(query, values);

    client.release();

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching projects data for financial year:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Helper function to generate month-year combinations between start and end dates
// Function to generate an array of months between two dates
function generateMonths(startDate, endDate) {
  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = start;
  
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    months.push(new Date(`${year}-${month}-01`));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// API endpoint to get invoices
app.get('/invoices', async (req, res) => {
  try {
    const results = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.start_date,
        p.end_date,
        p.order_value,
        i.month,
        i.budget,
        i.actual
      FROM projects p
      LEFT JOIN invoices i ON p.id = i.project_id
      ORDER BY p.id, i.month;
    `);

    const projects = {};

    results.rows.forEach(row => {
      if (!projects[row.id]) {
        const months = generateMonths(row.start_date, row.end_date);
        projects[row.id] = {
          name: row.name,
          start_date: row.start_date,
          end_date: row.end_date,
          order_value: row.order_value,
          expenses: months.reduce((acc, month) => {
            const monthYear = month.toISOString().slice(0, 7);
            acc[monthYear] = { budget: null, actual: null };
            return acc;
          }, {})
        };
      }
      if (row.month) {
        const monthYear = new Date(row.month).toISOString().slice(0, 7);
        if (projects[row.id].expenses[monthYear]) {
          projects[row.id].expenses[monthYear] = {
            budget: row.budget,
            actual: row.actual
          };
        }
      }
    });

    res.json(projects);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// API endpoint to update invoices
app.put('/invoices/:projectId/:month', async (req, res) => {
  const { projectId, month } = req.params;
  const { budget, actual } = req.body;

  try {
    const parsedMonth = new Date(month).toISOString().split('T')[0];

    // Attempt to update the existing invoice
    const result = await pool.query(`
      UPDATE invoices
      SET budget = $1, actual = $2
      WHERE project_id = $3 AND month = $4
    `, [budget, actual, projectId, parsedMonth]);

    if (result.rowCount === 0) {
      // If no rows were updated, insert the new invoice
      await pool.query(`
        INSERT INTO invoices (project_id, month, budget, actual)
        VALUES ($1, $2, $3, $4)
      `, [projectId, parsedMonth, budget, actual]);

      return res.status(201).json({ message: 'Invoice created successfully' });
    }

    res.status(200).json({ message: 'Invoice updated successfully' });
  } catch (err) {
    console.error('Error updating or creating invoice:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});