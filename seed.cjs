const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const db = new sqlite3.Database('./main.db');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Do you want to 'add' or 'remove' mock data? (Type 'add' or 'remove'): ", (action) => {
  const choice = action.trim().toLowerCase();

  if (choice === 'add') {
    db.serialize(() => {
      console.log("Injecting mock records...");

      // 1. Insert Test Members
      const insertMember = db.prepare(`INSERT OR IGNORE INTO members (id, name, username, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)`);
      insertMember.run('m_test_1', 'Zöhre', 'zohre', 'password123', 'Member', 'Z');
      insertMember.run('m_test_2', 'Abdylla', 'abdy', 'password123', 'Committee', 'A');
      insertMember.run('m_test_3', 'Dunya', 'dunya', 'password123', 'Member', 'D');
      insertMember.finalize();

      // 2. Fetch Categories (Filtering out picture-required ones)
      db.all("SELECT * FROM categories", [], (err, categories) => {
        if (err) return console.error("Error fetching categories:", err.message);

        const targetCategories = categories.filter(c => !c.picture_required);
        if (targetCategories.length === 0) return console.log("⚠️ No valid categories found.");

        // 3. Insert Tasks (Using exact known schema)
        const insertTask = db.prepare(`
          INSERT OR IGNORE INTO tasks 
          (id, title, description, category_id, points, member_id, submitted_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const templates = [
          { title: 'Cleaned Common Kitchen', desc: 'Wiped counters and washed dishes.', points: 3 },
          { title: 'Organized Storage', desc: 'Sorted spare cables and tools.', points: 4 },
          { title: 'Repaired Hallway Door', desc: 'Fixed the loose handle.', points: 3 },
          { title: 'Tested Server Backup', desc: 'Verified automated database dumps.', points: 5 },
          { title: 'Watered Corridor Plants', desc: 'Hydrated shared indoor greenery.', points: 1 }
        ];

        const members = ['m_test_1', 'm_test_2', 'm_test_3'];
        let count = 0;
        const now = new Date();

        templates.forEach((t, i) => {
          const cat = targetCategories[i % targetCategories.length];
          const memberId = members[i % members.length];
          const taskId = `t_mock_${i + 1}`;
          
          // Subtract exactly 'i' hours from right now to guarantee it stays in the current month
          const taskDate = new Date(now.getTime() - (i * 3600000)).toISOString();

          insertTask.run(taskId, t.title, t.desc, cat.id, t.points, memberId, taskDate, (err) => {
            if (!err) count++;
          });
        });

        insertTask.finalize(() => {
          console.log(`✅ Successfully added ${count} mock tasks guaranteed for the current month.`);
          db.close(); rl.close();
        });
      });
    });

  } else if (choice === 'remove') {
    db.serialize(() => {
      console.log("Cleaning up mock records...");
      db.run(`DELETE FROM tasks WHERE id LIKE 't_mock_%'`, () => {
        db.run(`DELETE FROM members WHERE id IN ('m_test_1', 'm_test_2', 'm_test_3')`, () => {
          console.log("🗑️ Mock tasks and members cleared.");
          db.close(); rl.close();
        });
      });
    });

  } else {
    console.log("❌ Invalid choice.");
    db.close(); rl.close();
  }
});
