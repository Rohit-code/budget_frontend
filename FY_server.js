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

// const getFinancialYearDates = (year) => {
//     const startDate = new Date(`${year}-04-01`);
//     const endDate = new Date(`${parseInt(year, 10) + 1}-03-31`);
//     return { startDate, endDate };
//   };
  
// //   app.get('/projects/financial-year/:startYear', async (req, res) => {
// //     const { startYear } = req.params;
  
// //     // Validate year format
// //     if (!/^\d{4}$/.test(startYear)) {
// //       return res.status(400).send('Invalid year format. Please provide a year in YYYY format.');
// //     }
  
// //     const { startDate, endDate } = getFinancialYearDates(startYear);
  
// //     try {
// //       const client = await pool.connect();
  
// //       const query = `
// //         WITH date_range AS (
// //             SELECT
// //                 $1::date AS start_date,
// //                 $2::date AS end_date
// //         ),
// //         projects_in_range AS (
// //             SELECT
// //                 p.id,
// //                 p.name,
// //                 p.start_date,
// //                 p.end_date,
// //                 p.budget
// //             FROM projects p
// //             WHERE p.start_date <= (SELECT end_date FROM date_range)
// //               AND p.end_date >= (SELECT start_date FROM date_range)
// //         ),
// //         expenses_aggregated AS (
// //             SELECT
// //                 p.id,
// //                 p.name,
// //                 e.month,
// //                 SUM(e.actual) AS total_expense
// //             FROM projects_in_range p
// //             LEFT JOIN expenses e ON p.id = e.project_id
// //             WHERE TO_DATE(e.month, 'Mon YYYY') BETWEEN (SELECT start_date FROM date_range) AND (SELECT end_date FROM date_range)
// //             GROUP BY p.id, p.name, e.month
// //         ),
// //         current_year_budget_calculation AS (
// //             SELECT
// //                 p.id,
// //                 p.name,
// //                 p.start_date,
// //                 p.end_date,
// //                 p.budget,
// //                 COALESCE(SUM(e.total_expense), 0) AS budget_spent,
// //                 p.budget - COALESCE(SUM(e.total_expense), 0) AS carry_over_budget
// //             FROM projects_in_range p
// //             LEFT JOIN expenses_aggregated e ON p.id = e.id
// //             GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget
// //         ),
// //         next_year_expenses AS (
// //             SELECT
// //                 e.project_id,
// //                 SUM(e.actual) AS total_expense
// //             FROM expenses e
// //             WHERE TO_DATE(e.month, 'Mon YYYY') > (SELECT end_date FROM date_range)
// //             GROUP BY e.project_id
// //         ),
// //         final_calculation AS (
// //             SELECT
// //                 p.id,
// //                 p.name,
// //                 p.start_date,
// //                 p.end_date,
// //                 p.budget_spent,
// //                 COALESCE(p.carry_over_budget - COALESCE(n.total_expense, 0), p.carry_over_budget) AS carry_over_budget,
// //                 COALESCE(jsonb_object_agg(e.month, e.total_expense) FILTER (WHERE e.total_expense IS NOT NULL), '{}'::jsonb) AS expenses
// //             FROM current_year_budget_calculation p
// //             LEFT JOIN expenses_aggregated e ON p.id = e.id
// //             LEFT JOIN next_year_expenses n ON p.id = n.project_id
// //             GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget_spent, p.carry_over_budget, n.total_expense
// //         )
// //         SELECT
// //             id,
// //             name,
// //             start_date,
// //             end_date,
// //             budget_spent,
// //             carry_over_budget,
// //             expenses
// //         FROM final_calculation;
// //       `;
  
// //       const values = [startDate, endDate];
// //       const result = await client.query(query, values);
  
// //       client.release();
  
// //       res.status(200).json(result.rows);
// //     } catch (err) {
// //       console.error('Error fetching projects data for financial year:', err);
// //       res.status(500).send('Internal Server Error');
// //     }
// //   });

// const getFinancialYearDates = (year) => {
//     const startDate = new Date(`${year}-04-01`);
//     const endDate = new Date(`${parseInt(year, 10) + 1}-03-31`);
//     return { startDate, endDate };
//   };
  
//   app.get('/projects/financial-year/:startYear', async (req, res) => {
//     const { startYear } = req.params;
  
//     // Validate year format
//     if (!/^\d{4}$/.test(startYear)) {
//       return res.status(400).send('Invalid year format. Please provide a year in YYYY format.');
//     }
  
//     const { startDate, endDate } = getFinancialYearDates(startYear);
  
//     try {
//       const client = await pool.connect();
  
//       const query = `
//         WITH date_range AS (
//             SELECT
//                 $1::date AS start_date,
//                 $2::date AS end_date
//         ),
//         projects_in_range AS (
//             SELECT
//                 p.id,
//                 p.name,
//                 p.start_date,
//                 p.end_date,
//                 p.budget
//             FROM projects p
//             WHERE p.start_date <= (SELECT end_date FROM date_range)
//               AND p.end_date >= (SELECT start_date FROM date_range)
//         ),
//         expenses_aggregated AS (
//             SELECT
//                 p.id,
//                 p.name,
//                 e.month,
//                 SUM(e.actual) AS total_expense
//             FROM projects_in_range p
//             LEFT JOIN expenses e ON p.id = e.project_id
//             WHERE TO_DATE(e.month, 'Mon YYYY') BETWEEN (SELECT start_date FROM date_range) AND (SELECT end_date FROM date_range)
//             GROUP BY p.id, p.name, e.month
//         ),
//         budget_spent_and_carryover AS (
//             SELECT
//                 p.id,
//                 p.name,
//                 p.start_date,
//                 p.end_date,
//                 p.budget,
//                 COALESCE(SUM(e.total_expense), 0) AS budget_spent,
//                 CASE
//                     WHEN p.end_date <= (SELECT end_date FROM date_range) THEN
//                         p.budget - COALESCE(SUM(e.total_expense), 0)
//                     ELSE
//                         p.budget - COALESCE(SUM(e.total_expense), 0)
//                 END AS carry_over_budget
//             FROM projects_in_range p
//             LEFT JOIN expenses_aggregated e ON p.id = e.id
//             GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget
//         ),
//         next_year_expenses AS (
//             SELECT
//                 e.project_id,
//                 SUM(e.actual) AS total_expense
//             FROM expenses e
//             WHERE TO_DATE(e.month, 'Mon YYYY') > (SELECT end_date FROM date_range)
//             GROUP BY e.project_id
//         ),
//         final_calculation AS (
//             SELECT
//                 p.id,
//                 p.name,
//                 p.start_date,
//                 p.end_date,
//                 p.budget_spent,
//                 CASE
//                     WHEN p.end_date <= (SELECT end_date FROM date_range) THEN
//                         p.carry_over_budget
//                     ELSE
//                         p.carry_over_budget - COALESCE(n.total_expense, 0)
//                 END AS carry_over_budget,
//                 COALESCE(jsonb_object_agg(e.month, e.total_expense) FILTER (WHERE e.total_expense IS NOT NULL), '{}'::jsonb) AS expenses
//             FROM budget_spent_and_carryover p
//             LEFT JOIN expenses_aggregated e ON p.id = e.id
//             LEFT JOIN next_year_expenses n ON p.id = n.project_id
//             GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget_spent, p.carry_over_budget, n.total_expense
//         )
//         SELECT
//             id,
//             name,
//             start_date,
//             end_date,
//             budget_spent,
//             carry_over_budget,
//             expenses
//         FROM final_calculation;
//       `;
  
//       const values = [startDate, endDate];
//       const result = await client.query(query, values);
  
//       client.release();
  
//       res.status(200).json(result.rows);
//     } catch (err) {
//       console.error('Error fetching projects data for financial year:', err);
//       res.status(500).send('Internal Server Error');
//     }
//   });

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
                CASE
                    WHEN p.end_date <= (SELECT end_date FROM date_range) THEN
                        p.budget - COALESCE(SUM(e.total_expense), 0)
                    ELSE
                        p.budget - COALESCE(SUM(e.total_expense), 0)
                END AS carry_over_budget
            FROM projects_in_range p
            LEFT JOIN expenses_aggregated e ON p.id = e.id
            GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget
        ),
        next_year_expenses AS (
            SELECT
                e.project_id,
                SUM(e.actual) AS total_expense
            FROM expenses e
            WHERE TO_DATE(e.month, 'Mon YYYY') > (SELECT end_date FROM date_range)
            GROUP BY e.project_id
        ),
        final_calculation AS (
            SELECT
                p.id,
                p.name,
                p.start_date,
                p.end_date,
                p.budget_spent,
                CASE
                    WHEN p.end_date <= (SELECT end_date FROM date_range) THEN
                        p.carry_over_budget
                    ELSE
                        p.carry_over_budget - COALESCE(n.total_expense, 0)
                END AS carry_over_budget,
                COALESCE(jsonb_object_agg(e.month, e.total_expense) FILTER (WHERE e.total_expense IS NOT NULL), '{}'::jsonb) AS expenses
            FROM budget_spent_and_carryover p
            LEFT JOIN expenses_aggregated e ON p.id = e.id
            LEFT JOIN next_year_expenses n ON p.id = n.project_id
            GROUP BY p.id, p.name, p.start_date, p.end_date, p.budget_spent, p.carry_over_budget, n.total_expense
        )
        SELECT
            id,
            name,
            start_date,
            end_date,
            budget_spent,
            carry_over_budget,
            expenses
        FROM final_calculation;
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