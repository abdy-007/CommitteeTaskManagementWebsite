const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3'); //database
const { open } = require('sqlite'); //database requirements
const bcrypt = require('bcrypt'); //security for login
const jwt = require('jsonwebtoken'); // NEW
const crypto = require('crypto');    // NEW (Built into Node.js)

// Generate a random secret key on every server restart!
const SECRET_KEY = crypto.randomBytes(64).toString('hex');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Initialize the SQLite Database Connection
(async () => {
  db = await open({
    filename: './main.db',
    driver: sqlite3.Database
  });
  
  // SQLite requires explicitly enabling foreign keys per connection
  await db.exec('PRAGMA foreign_keys = ON;');
  console.log('Connected to SQLite main.db');
})();

// GET all members
app.get('/api/members', async (req, res) => {
  try {
    const members = await db.all('SELECT * FROM members');
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET all tasks (Updated to map snake_case DB to camelCase React)
app.get('/api/tasks', async (req, res) => {
  try {
    // Changed 'ORDER BY SubmittedAt' to 'ORDER BY submitted_at'
    const tasks = await db.all('SELECT * FROM tasks ORDER BY submitted_at ASC');
    const formattedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      memberId: t.member_id,
      categoryId: t.category_id,
      type: t.type,
      submittedAt: t.submitted_at,
      points: t.points,
      description: t.description,
      pictureUrl: t.picture_url
    }));
    res.json(formattedTasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET all categories (NEW!)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories');
    const formattedCategories = categories.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      // SQLite stores booleans as 0 or 1, React needs true or false
      allowPictures: c.allow_pictures === 1,
      pictureRequired: c.picture_required === 1
    }));
    res.json(formattedCategories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ADD a new member
app.post('/api/members', async (req, res) => {
  try {
    const { id, name, role, avatar, username, password } = req.body;
    
    // Hash the password for security before saving it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newMember = await db.get(
      'INSERT INTO members (id, name, role, avatar, username, password) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, name, role, avatar, username',
      [id, name, role, avatar, username, hashedPassword]
    );
    
    res.json(newMember);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ADD a new category
app.post('/api/categories', async (req, res) => {
  try {
    const { id, name, color, allowPictures, pictureRequired } = req.body;
    
    // SQLite uses 1 and 0 for true/false
    const newCat = await db.get(
      'INSERT INTO categories (id, name, color, allow_pictures, picture_required) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [id, name, color, allowPictures ? 1 : 0, pictureRequired ? 1 : 0]
    );
    
    res.json(newCat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// UPDATE a category's name
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    
    const updatedCat = await db.get(
      'UPDATE categories SET name = ? WHERE id = ? RETURNING *',
      [name, id]
    );
    
    res.json(updatedCat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ADD a new task
app.post('/api/tasks', async (req, res) => {
  try {
    // Removed 'status' from destructuring
    const { id, title, memberId, categoryId, type, submitted_at, points, description, pictureUrl } = req.body;
    
    const newTask = await db.get(
      // Removed 'status' column and ensured exactly 9 placeholders (?)
      'INSERT INTO tasks (id, title, member_id, category_id, type, submitted_at, points, description, picture_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      // Removed 'status' from the values array
      [id, title, memberId, categoryId, type, submittedAt || null, points, description, pictureUrl || null]
    );
    res.json(newTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: User Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 1. Find the user by username
    const user = await db.get('SELECT * FROM members WHERE username = ?', [username]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // 2. Compare the typed password with the hashed password in the DB
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

// 3. Success! Generate a JWT and send it back
    const { password: _, ...safeUser } = user;
    
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { 
      expiresIn: '24h' // Token expires naturally in 24 hours
    });
    
    res.json({ token, user: safeUser });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET: Verify Session Token
app.get('/api/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  
  const token = authHeader.split(' ')[1]; // Extract token after "Bearer "
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Will fail if server restarted!
    res.json({ valid: true, userId: decoded.id });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// DELETE a member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM members WHERE id = ?', [id]);
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
