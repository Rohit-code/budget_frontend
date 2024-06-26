# Budget Management Application

This project is a budget management application that allows users to input and manage budget data for various expense categories across different months. It consists of a React frontend for the user interface and an Express.js backend with PostgreSQL for data storage.

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


2. Install dependencies:
```npm init -y```
```npm install express pg cors body-parser```
- create a server.js file


3. Set up PostgreSQL:
- Create a database named `budget_management`.
- Create a table named `budget` with the following schema:
  ```sql
  CREATE TABLE budget (
    id SERIAL PRIMARY KEY,
    month VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    budget NUMERIC,
    actual NUMERIC,
    UNIQUE (month, category)
  );
  ```

4. Configure database connection in `server.js`:
- Replace `your_db_user`, `your_db_password`, and `your_db_name` with your PostgreSQL credentials.

5. Start the server: ```node server.js```

Server will run on `http://localhost:5000`.

### Setting up the Frontend (React)

1. Navigate to the `client` directory:


2. Install dependencies:
```npm install axios```


3. Start the React application:

```npm start ```

React app will run on `http://localhost:3000`.


