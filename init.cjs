const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

(async () => {
  try {
    // 1. Open the database connection
    const db = await open({
      filename: './main.db',
      driver: sqlite3.Database
    });

    console.log("Constructing database schema...");
    
    // 2. Create tables with the complete, correct schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY, 
        name TEXT, 
        color TEXT, 
        allow_pictures BOOLEAN, 
        picture_required BOOLEAN
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, 
        title TEXT, 
        member_id TEXT, 
        category_id TEXT, 
        submitted_at TEXT, 
        points INTEGER, 
        description TEXT, 
        picture_url TEXT
      );
      
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY, 
        name TEXT, 
        role TEXT, 
        avatar TEXT, 
        username TEXT, 
        password TEXT
      );
    `);

    console.log("Injecting essential categories...");
    const categories = [
      { id: 'c_bath', name: 'Bathroom', color: '#1B2A3B', ap: 1, pr: 0 },
      { id: 'c_doc', name: 'Documents', color: '#C9581A', ap: 0, pr: 0 },
      { id: 'c_rep', name: 'Repairs', color: '#6B4E8A', ap: 1, pr: 1 },
      { id: 'c_kit', name: 'Kitchen', color: '#8B5A2B', ap: 1, pr: 1 },
      { id: 'c_qa', name: 'Q&A', color: '#4A7C59', ap: 0, pr: 0 }
    ];

    for (const cat of categories) {
      // INSERT OR IGNORE prevents duplicates if you run the script twice
      await db.run(
        'INSERT OR IGNORE INTO categories (id, name, color, allow_pictures, picture_required) VALUES (?, ?, ?, ?, ?)', 
        [cat.id, cat.name, cat.color, cat.ap, cat.pr]
      );
    }

    console.log("Securing default Admin account...");
    const hashedPw = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT OR IGNORE INTO members (id, name, role, avatar, username, password) VALUES (?, ?, ?, ?, ?, ?)', 
      ['m_admin_01', 'System Admin', 'Admin', 'SA', 'admin', hashedPw]
    );

    console.log("✅ Database initialized successfully. Ready for deployment.");
    await db.close();
    
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
})();
