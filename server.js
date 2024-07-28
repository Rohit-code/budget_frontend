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
// app.get('/projects/completed', async (req, res) => {
//   const { start_date, end_date } = req.query;
//   try {
//     const result = await pool.query(
//       `SELECT * FROM projects 
//        WHERE end_date BETWEEN $1 AND $2`,
//       [start_date, end_date]
//     );
//     const projects = result.rows.map(project => ({
//       ...project,
//       start_date: formatDateFromDB(project.start_date),
//       end_date: formatDateFromDB(project.end_date)
//     }));
//     res.send(projects);
//   } catch (error) {
//     console.error('Error fetching completed projects:', error);
//     res.status(500).send({ error: 'Server error' });
//   }
// });

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

// Endpoint to get financial years based on start and end dates

// app.get('/financial-years', async (req, res) => {
//   let { start_date, end_date } = req.query;
  
//   // If no dates are provided, use a default wide range
//   if (!start_date || !end_date) {
//     start_date = '1900-01-01'; // a very early date
//     end_date = '2200-12-31'; // a very future date
//   }

//   console.log('Received start_date:', start_date, 'end_date:', end_date); // Debug log

//   try {
//     const result = await pool.query(`
//       SELECT DISTINCT
//         CASE
//           WHEN EXTRACT(MONTH FROM start_date) >= 4 THEN EXTRACT(YEAR FROM start_date) || '/' || (EXTRACT(YEAR FROM start_date) + 1)
//           ELSE (EXTRACT(YEAR FROM start_date) - 1) || '/' || EXTRACT(YEAR FROM start_date)
//         END AS fiscal_year
//       FROM projects
//       WHERE start_date BETWEEN $1 AND $2 OR end_date BETWEEN $1 AND $2
//       ORDER BY fiscal_year;
//     `, [start_date, end_date]);

//     console.log('Query result:', result.rows); // Debug log
//     const years = result.rows.map(row => row.fiscal_year);
//     res.json(years);
//   } catch (error) {
//     console.error('Error fetching financial years:', error);
//     res.status(500).send('Server error');
//   }
// });

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


// app.get('/financial-years', async (req, res) => {
//   const query = `
//       WITH fiscal_years AS (
//           SELECT DISTINCT
//               CASE
//                   WHEN EXTRACT(MONTH FROM start_date) >= 4 THEN EXTRACT(YEAR FROM start_date)
//                   ELSE EXTRACT(YEAR FROM start_date) - 1
//               END AS financial_year
//           FROM projects
//           UNION
//           SELECT DISTINCT
//               CASE
//                   WHEN EXTRACT(MONTH FROM end_date) >= 4 THEN EXTRACT(YEAR FROM end_date)
//                   ELSE EXTRACT(YEAR FROM end_date) - 1
//               END AS financial_year
//           FROM projects
//       )
//       SELECT 
//           fy.financial_year,
//           p.id AS project_id,
//           p.name AS project_name,
//           p.start_date,
//           p.end_date,
//           p.budget
//       FROM 
//           fiscal_years fy
//       JOIN 
//           projects p ON fy.financial_year BETWEEN 
//               CASE
//                   WHEN EXTRACT(MONTH FROM p.start_date) >= 4 THEN EXTRACT(YEAR FROM p.start_date)
//                   ELSE EXTRACT(YEAR FROM p.start_date) - 1
//               END AND 
//               CASE
//                   WHEN EXTRACT(MONTH FROM p.end_date) >= 4 THEN EXTRACT(YEAR FROM p.end_date)
//                   ELSE EXTRACT(YEAR FROM p.end_date) - 1
//               END
//       ORDER BY 
//           fy.financial_year, p.id;
//   `;

//   try {
//       const result = await pool.query(query);
//       res.json(result.rows);
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Server error');
//   }
// });

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


// Endpoint to fetch projects and expenses for a specific financial year
// app.get('/financial-year-summary/:year', async (req, res) => {
//   const { year } = req.params;
//   const [startYear, endYear] = year.split('/');

//   const startOfYear1 = `${startYear}-04-01`;
//   const endOfYear1 = `${startYear}-12-31`;
//   const startOfYear2 = `${endYear}-01-01`;
//   const endOfYear2 = `${endYear}-03-31`;

//   try {
//     // Fetch expenses for the first part of the financial year
//     const result1 = await pool.query(`
//       SELECT
//         EXTRACT(MONTH FROM e.date) AS month,
//         COALESCE(SUM(e.actual), 0) AS total_actual_expenses
//       FROM expenses e
//       JOIN projects p ON p.id = e.project_id
//       WHERE e.date BETWEEN $1 AND $2
//       AND p.start_date <= $2 AND p.end_date >= $1
//       GROUP BY EXTRACT(MONTH FROM e.date)
//       ORDER BY EXTRACT(MONTH FROM e.date);
//     `, [startOfYear1, endOfYear1]);

//     // Fetch expenses for the second part of the financial year
//     const result2 = await pool.query(`
//       SELECT
//         EXTRACT(MONTH FROM e.date) AS month,
//         COALESCE(SUM(e.actual), 0) AS total_actual_expenses
//       FROM expenses e
//       JOIN projects p ON p.id = e.project_id
//       WHERE e.date BETWEEN $1 AND $2
//       AND p.start_date <= $2 AND p.end_date >= $1
//       GROUP BY EXTRACT(MONTH FROM e.date)
//       ORDER BY EXTRACT(MONTH FROM e.date);
//     `, [startOfYear2, endOfYear2]);

//     // Combine results from both financial years
//     const expenses = {};
//     result1.rows.forEach(row => {
//       const monthName = new Date(Date.UTC(0, row.month - 1)).toLocaleString('en-US', { month: 'short' }) + ` ${startYear}`;
//       expenses[monthName] = (expenses[monthName] || 0) + parseFloat(row.total_actual_expenses);
//     });
//     result2.rows.forEach(row => {
//       const monthName = new Date(Date.UTC(0, row.month - 1)).toLocaleString('en-US', { month: 'short' }) + ` ${endYear}`;
//       expenses[monthName] = (expenses[monthName] || 0) + parseFloat(row.total_actual_expenses);
//     });

//     res.json(expenses);
//   } catch (error) {
//     console.error('Error fetching financial year summary:', error);
//     res.status(500).send('Server error');
//   }

// const getFinancialYearDates = (year) => {
//   const startDate = new Date(`${year}-04-01`);
//   const endDate = new Date(`${parseInt(year, 10) + 1}-03-31`);
//   return { startDate, endDate };
// };

// app.get('/projects/financial-year/:startYear', async (req, res) => {
//   const { startYear } = req.params;

//   // Validate year format
//   if (!/^\d{4}$/.test(startYear)) {
//     return res.status(400).send('Invalid year format. Please provide a year in YYYY format.');
//   }

//   const { startDate, endDate } = getFinancialYearDates(startYear);

//   try {
//     const client = await pool.connect();

//     const query = `
//       WITH date_range AS (
//         SELECT
//           $1::date AS start_date,
//           $2::date AS end_date
//       ),
//       projects_in_range AS (
//         SELECT
//           p.id,
//           p.name,
//           p.start_date,
//           p.end_date,
//           p.budget
//         FROM projects p
//         WHERE p.start_date <= (SELECT end_date FROM date_range)
//           AND p.end_date >= (SELECT start_date FROM date_range)
//       ),
//       expenses_aggregated AS (
//         SELECT
//           p.id,
//           p.name,
//           e.month,
//           SUM(e.actual) AS total_expense
//         FROM projects_in_range p
//         LEFT JOIN expenses e ON p.id = e.project_id
//         WHERE TO_DATE(e.month, 'Mon YYYY') BETWEEN (SELECT start_date FROM date_range) AND (SELECT end_date FROM date_range)
//         GROUP BY p.id, p.name, e.month
//       ),
//       budget_spent_and_carryover AS (
//         SELECT
//           p.id,
//           p.name,
//           p.start_date,
//           p.end_date,
//           p.budget,
//           COALESCE(SUM(e.total_expense), 0) AS budget_spent,
//           p.budget - COALESCE(SUM(e.total_expense), 0) AS carry_over_budget,
//           CASE
//             WHEN p.end_date > (SELECT end_date FROM date_range) THEN
//               -COALESCE(SUM(e.total_expense), 0) + p.budget
//             ELSE
//               NULL
//           END AS overspend_to_carryover
//         FROM projects_in_range p
//         LEFT JOIN expenses_aggregated e ON p.id = e.id
//         GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget
//       )
//       SELECT
//         p.id,
//         p.name,
//         p.start_date,
//         p.end_date,
//         p.budget_spent,
//         CASE
//           WHEN p.overspend_to_carryover IS NOT NULL THEN
//             -p.overspend_to_carryover
//           ELSE
//             p.carry_over_budget
//         END AS carry_over_budget,
//         COALESCE(jsonb_object_agg(e.month, e.total_expense) FILTER (WHERE e.total_expense IS NOT NULL), '{}'::jsonb) AS expenses
//       FROM budget_spent_and_carryover p
//       LEFT JOIN expenses_aggregated e ON p.id = e.id
//       GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget_spent, p.carry_over_budget, p.overspend_to_carryover;
//     `;

//     const values = [startDate, endDate];
//     const result = await client.query(query, values);

//     client.release();

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error('Error fetching projects data for financial year:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });



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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});