const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'french_teaching.db');

// Default users to create
const defaultUsers = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        first_name: 'System',
        last_name: 'Administrator'
    },
    {
        username: 'teacher',
        email: 'teacher@example.com',
        password: 'teacher123',
        role: 'teacher',
        first_name: 'John',
        last_name: 'Teacher'
    },
    {
        username: 'student',
        email: 'student@example.com',
        password: 'student123',
        role: 'student',
        first_name: 'Jane',
        last_name: 'Student'
    }
];

// Hash password function
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Create users function
const createUsers = async () => {
    const db = new sqlite3.Database(dbPath);
    

    
    try {
        for (const user of defaultUsers) {
            // Check if user already exists
            const existingUser = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM users WHERE email = ? OR username = ?',
                    [user.email, user.username],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });
            
            if (existingUser) {
                continue;
            }
            
            // Hash the password
            const hashedPassword = await hashPassword(user.password);
            
            // Insert user into database
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO users (username, email, password_hash, role, first_name, last_name, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                    [user.username, user.email, hashedPassword, user.role, user.first_name, user.last_name],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.lastID);
                        }
                    }
                );
            });
        }
        

        
    } catch (error) {
        console.error('❌ Error creating users:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
        });
    }
};

// Run the script
if (require.main === module) {
    createUsers();
}

module.exports = { createUsers, defaultUsers };