# Database Seeding

This directory contains database initialization and seeding scripts for the French Teaching Platform.

## Files

- `schema.sql` - Database schema definition
- `init.js` - Database initialization script
- `seed-users.js` - User seeding script for default accounts
- `french_teaching.db` - SQLite database file

## Default Users

The system comes with three default user accounts:

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** Administrator
- **Access:** Full system access, user management, system configuration

### Teacher Account
- **Email:** teacher@example.com
- **Password:** teacher123
- **Role:** Teacher
- **Access:** Create/manage quizzes, view student progress, manage batches

### Student Account
- **Email:** student@example.com
- **Password:** student123
- **Role:** Student
- **Access:** Take quizzes, view results, access learning resources

## Usage

### Seed Default Users

To create the default user accounts, run:

```bash
npm run seed:users
```

This script will:
- Check if users already exist (to avoid duplicates)
- Hash passwords securely using bcrypt
- Insert users into the database
- Display success messages with login credentials

### Re-running the Script

The seeding script is safe to run multiple times. It will skip creating users that already exist in the database.

## Security Notes

- Default passwords should be changed in production
- Passwords are hashed using bcrypt with 12 salt rounds
- The script checks for existing users to prevent duplicates

## Development

For development purposes, you can modify the `defaultUsers` array in `seed-users.js` to add more test accounts or change default credentials.