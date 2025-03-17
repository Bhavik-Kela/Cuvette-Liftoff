const express = require("express");
const pg = require("pg");
const cors = require("cors");
const dotenv = require("dotenv");

const { Client } = pg;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static('./'));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './' });
});

const db = new Client({
    user: "postgres",
    host: "localhost",
    database: "schema",
    password: PASSWORD,
    port: 5432,
});

db.connect();

// Debug endpoint to check if connection works
app.get("/api/test", async (req, res) => {
    try {
        const result = await db.query("SELECT 1 as test");
        res.json({ success: true, message: "Database connection successful" });
    } catch (err) {
        console.error("Database test error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint for fulltime jobs with additional filtering
app.get("/jobs/fulltime", async (req, res) => {
    try {
        // Get query parameters for additional filtering
        const { minSalary, location, remote } = req.query;
        
        // Start building the query with the base condition for job types
        let queryText = "SELECT * FROM jobs WHERE type = 'Full-time' OR type = 'Part-time' ";
        const queryParams = [];
        
        // Add additional conditions if provided
        if (minSalary) {
            queryParams.push(minSalary);
            // Extract number from salary_range (assuming format like "9 LPA")
            queryText += ` AND CAST(SUBSTRING(salary_range, 1, POSITION(' ' IN salary_range)) AS INTEGER) >= $${queryParams.length}`;
        }
        
        if (location) {
            queryParams.push(`%${location}%`);
            queryText += ` AND location ILIKE $${queryParams.length}`;
        }
        
        if (remote === 'true') {
            queryText += ` AND location = 'Remote'`;
        }
        
        // Order by ID
        queryText += " ORDER BY id DESC LIMIT 10";
        
        // Execute the query
        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/jobs/othertime", async (req, res) => {
    try {
        // Get query parameters for additional filtering
        const { minSalary, location, remote } = req.query;
        
        // Start building the query with the base condition
        let queryText = "SELECT * FROM jobs WHERE type = 'Contract' OR type = 'Intern' ";
        const queryParams = [];
        
        // Add additional conditions if provided
        if (minSalary) {
            queryParams.push(minSalary);
            queryText += ` AND CAST(SUBSTRING(salary_range, 1, POSITION(' ' IN salary_range)) AS INTEGER) >= $${queryParams.length}`;
        }
        
        if (location) {
            queryParams.push(`%${location}%`);
            queryText += ` AND location ILIKE $${queryParams.length}`;
        }
        
        if (remote === 'true') {
            queryText += ` AND location = 'Remote'`;
        }
        
        // Order by ID
        queryText += " ORDER BY id DESC LIMIT 10";
        
        // Execute the query
        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ error: err.message });
    }
});

// Updated filter endpoint with correct column names
app.get("/jobs/filter", async (req, res) => {
    try {
        // Get all query parameters
        const { type, minSalary, maxSalary, location, remote, keyword } = req.query;
        
        // Start building the query
        let queryText = "SELECT * FROM jobs WHERE 1=1";
        const queryParams = [];
        
        // Add conditions based on provided parameters
        if (type) {
            queryParams.push(type);
            queryText += ` AND type = $${queryParams.length}`;
        }
        
        if (minSalary) {
            queryParams.push(minSalary);
            queryText += ` AND CAST(SUBSTRING(salary_range, 1, POSITION(' ' IN salary_range)) AS INTEGER) >= $${queryParams.length}`;
        }
        
        if (maxSalary) {
            queryParams.push(maxSalary);
            queryText += ` AND CAST(SUBSTRING(salary_range, 1, POSITION(' ' IN salary_range)) AS INTEGER) <= $${queryParams.length}`;
        }
        
        if (location) {
            queryParams.push(`%${location}%`);
            queryText += ` AND location ILIKE $${queryParams.length}`;
        }
        
        if (remote === 'true') {
            queryText += ` AND location = 'Remote'`;
        }
        
        if (keyword) {
            queryParams.push(`%${keyword}%`);
            const keywordIndex = queryParams.length;
            queryText += ` AND (title ILIKE $${keywordIndex} OR description ILIKE $${keywordIndex})`;
        }
        
        // Add order and limit
        queryText += " ORDER BY id DESC LIMIT 20";
        
        // Execute the query
        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching filtered jobs:", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} 🚀`);
});