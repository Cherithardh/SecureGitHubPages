const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Load users from JSON file
const usersFile = './users.json';
let users = [];
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
}

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).send({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.send({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).send({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Invalid credentials' });

    res.send({ message: 'Login successful' });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
