# Budget Management Application

This project is a budget management application that allows users to input and manage budget data for various expense categories across different months. It features a React frontend for the user interface and an Express.js backend with PostgreSQL for data storage.

## Features

- Input budget and actual expense data for each category and month.
- Save data to a PostgreSQL database via API.
- View and manage budget data through a dynamic table interface.

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js and npm
- PostgreSQL

## Setup Instructions

### Setting up the Backend (Express.js)

1. Navigate to the `server` directory:

    ```bash
    cd server
    ```

2. Initialize the project and install dependencies:

    ```bash
    npm init -y
    npm install express pg cors body-parser
    ```

3. Set up PostgreSQL:
    - Create a database named `budget_management`.
    - Create tables with the following schema:

    ```sql
    CREATE TABLE projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      budget NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE expenses (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      month VARCHAR(20) NOT NULL,
      category VARCHAR(50) NOT NULL,
      budget NUMERIC(10, 2),
      actual NUMERIC(10, 2),
      CONSTRAINT unique_expense UNIQUE (project_id, month, category)
    );
    ```

4. Configure the database connection in `server.js`:
    - Replace `your_db_user`, `your_db_password`, and `your_db_name` with your PostgreSQL credentials.

5. Start the server:

    ```bash
    node server.js
    ```

    The server will run on `http://localhost:5000`.

### Setting up the Frontend (React)

1. Navigate to the `client` directory:

    ```bash
    cd client
    ```

2. Install dependencies:

    ```bash
    npm install axios
    ```

3. Start the React application:

    ```bash
    npm start
    ```

    The React app will run on `http://localhost:3000`.

## API Endpoints

### Projects

- **GET /projects**: Fetch all projects.
- **GET /projects/:id**: Fetch a single project by ID.
- **POST /projects**: Create a new project.
- **PUT /projects/:id**: Update a project.
- **DELETE /projects/:id**: Delete a project.

### Expenses

- **GET /projects/:id/expenses**: Fetch expenses for a specific project.
- **POST /projects/:id/expenses**: Save expenses for a project.

### Financial Data

- **GET /projects/financial-year/:startYear**: Get projects and expenses for a specific financial year.
- **GET /financial-years**: Fetch distinct financial years based on project dates.
- **GET /fiscal-year-months**: Fetch months for fiscal years with expenses.

### User Authentication

- **POST /register**: Register a new user.
- **POST /login**: User login.

## Example Code

Here is a sample code snippet from `server.js`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'budget_management',
  password: 'your_db_password',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
