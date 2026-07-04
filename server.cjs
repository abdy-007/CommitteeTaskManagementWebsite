const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3'); //database
const { open } = require('sqlite'); //database requirements
const bcrypt = require('bcrypt'); //security for login
const jwt = require('jsonwebtoken'); // NEW
const crypto = require('crypto');    // NEW (Built into Node.js)
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Generate a random secret key on every server restart!
const SECRET_KEY = crypto.randomBytes(64).toString('hex');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));


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

//-----------------------------------------------------------------------------

// --- NEW UPLOAD CONFIGURATION ---
// 1. Ensure the pictures directory exists
const picturesDir = path.join(__dirname, 'pictures');
if (!fs.existsSync(picturesDir)) {
  fs.mkdirSync(picturesDir);
}

// 2. Configure Multer to save files to the pictures folder with unique names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'pictures/');
  },
  filename: function (req, file, cb) {
    // Generates a unique filename: timestamp-random.extension (e.g., 1689382-1234.jpg)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 3. Serve the pictures folder statically so the frontend can load them via URL
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

// 4. Create the Upload API Endpoint
app.post('/api/upload', upload.single('picture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Construct the full URL to the saved image
  const pictureUrl = `http://localhost:5000/pictures/${req.file.filename}`;
  res.json({ pictureUrl });
});

//------------------------------------------------------------------------------

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

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await db.all('SELECT * FROM tasks ORDER BY submitted_at ASC');
    const formattedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      memberId: t.member_id,
      categoryId: t.category_id,
      // type: t.type, <-- DELETE THIS LINE
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


app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, color, allowPictures, pictureRequired } = req.body;
    const { id } = req.params;
    
    // Update all fields, translating React booleans back into SQLite 1s and 0s
    const updatedCat = await db.get(
      'UPDATE categories SET name = ?, color = ?, allow_pictures = ?, picture_required = ? WHERE id = ? RETURNING *',
      [name, color, allowPictures ? 1 : 0, pictureRequired ? 1 : 0, id]
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
    // Remove 'type' from destructuring
    const { id, title, memberId, categoryId, submittedAt, points, description, pictureUrl } = req.body;
    
    // Remove 'type' from the SQL string (now 8 columns and 8 placeholders)
    const insertedTask = await db.get(
      'INSERT INTO tasks (id, title, member_id, category_id, submitted_at, points, description, picture_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [id, title, memberId, categoryId, submittedAt || null, points, description, pictureUrl || null]
    );
    
    res.json({
      id: insertedTask.id,
      title: insertedTask.title,
      memberId: insertedTask.member_id,
      categoryId: insertedTask.category_id,
      submittedAt: insertedTask.submitted_at,
      points: insertedTask.points,
      description: insertedTask.description,
      pictureUrl: insertedTask.picture_url
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Edit an existing task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, categoryId, points, description, pictureUrl } = req.body;
    const { id } = req.params;
    
    const updatedTask = await db.get(
      'UPDATE tasks SET title = ?, category_id = ?, points = ?, description = ?, picture_url = ? WHERE id = ? RETURNING *',
      [title, categoryId, points, description, pictureUrl, id]
    );
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      id: updatedTask.id,
      title: updatedTask.title,
      memberId: updatedTask.member_id,
      categoryId: updatedTask.category_id,
      submittedAt: updatedTask.submitted_at,
      points: updatedTask.points,
      description: updatedTask.description,
      pictureUrl: updatedTask.picture_url
    });
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

// DELETE old tasks (Semester Cleanup)
app.delete('/api/tasks/cleanup', async (req, res) => {
  try {
    const { cutoffDate } = req.body; 
    
    if (!cutoffDate) {
      return res.status(400).json({ error: "Missing cutoff date" });
    }

    // Using '<=' and SQLite's date() function to match "before and including"
    const result = await db.run('DELETE FROM tasks WHERE date(submitted_at) <= date(?)', [cutoffDate]);
    
    res.json({ 
      message: `Successfully deleted old tasks`, 
      deletedCount: result.changes
    });
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

// DELETE a category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
