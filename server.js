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

// Endpoint to get completed projects within a date range
app.get('/projects/completed', async (req, res) => {
  const { start_date, end_date } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM projects 
       WHERE end_date BETWEEN $1 AND $2`,
      [start_date, end_date]
    );
    const projects = result.rows.map(project => ({
      ...project,
      start_date: formatDateFromDB(project.start_date),
      end_date: formatDateFromDB(project.end_date)
    }));
    res.send(projects);
  } catch (error) {
    console.error('Error fetching completed projects:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Endpoint to create a new project
app.post('/projects', async (req, res) => {
  const { name, start_date, end_date, budget } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, start_date, end_date, budget) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, start_date, end_date, budget]
    );
    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to get all projects
app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.send(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
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

// New Endpoint to handle user registration
app.post('/register', async (req, res) => {
  const { name, dept, emailid, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO employee (name, dept, emailid, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, dept, emailid, password]
    );
    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error registering user:', error);
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
      [name, start_date, end_date, budget, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Project not found' });
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// New Endpoint to handle user login
app.post('/login', async (req, res) => {
  const { emailid, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM employee WHERE emailid = $1 AND password = $2',
      [emailid, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }
    res.send({ success: true });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Endpoint to create a new project
app.post('/projects', async (req, res) => {
  const { name, start_date, end_date, budget } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, start_date, end_date, budget) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, formatDateToDB(start_date), formatDateToDB(end_date), budget]
    );
    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error adding project:', error);
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


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});