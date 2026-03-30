const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const leadRoutes = require('./routes/leadRoutes');
const fs = require('fs');
const path = require('path')

require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
app.use('/api/leads', leadRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
