# Database Configuration Guide

This application supports both local PostgreSQL and Neon (cloud PostgreSQL). You can easily switch between them by modifying the `.env` file.

## Current Setup

The application is configured to use **local PostgreSQL** by default.

## Switching Between Databases

### Option 1: Local PostgreSQL (Default)

Keep these lines **uncommented** in your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Teaching
DB_USER=postgres
DB_PASSWORD=10108924
```

And keep this line **commented**:
```env
# DATABASE_URL=postgresql://Teaching_owner:...
```

### Option 2: Neon PostgreSQL (Cloud)

To switch to Neon, **comment out** the local PostgreSQL settings and **uncomment** the DATABASE_URL:

```env
# Option 1: Local PostgreSQL (default)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=Teaching
# DB_USER=postgres
# DB_PASSWORD=10108924

# Option 2: Neon PostgreSQL (cloud) - Uncomment to use Neon
DATABASE_URL=postgresql://Teaching_owner:Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8@ep-little-bonus-adxfopwl-pooler.c-2.us-east-1.aws.neon.tech/Teaching?sslmode=require&channel_binding=require
```

## Migration Scripts

### Available Scripts

1. **Extract Schema**: `npm run db:extract-schema`
   - Extracts the current PostgreSQL schema to `neon-schema.sql`

2. **Apply Schema to Neon**: `npm run db:apply-neon`
   - Applies the extracted schema to Neon database

3. **Migrate Users Only**: `npm run db:migrate-users`
   - Migrates only user data to Neon

4. **Migrate All Data**: `npm run db:migrate-all-to-neon`
   - Migrates all data from SQLite to Neon (comprehensive migration)

### Complete Migration Process

To migrate from local PostgreSQL to Neon:

1. Extract the schema:
   ```bash
   npm run db:extract-schema
   ```

2. Apply schema to Neon:
   ```bash
   npm run db:apply-neon
   ```

3. Migrate all data:
   ```bash
   npm run db:migrate-all-to-neon
   ```

4. Switch to Neon in `.env` file (uncomment DATABASE_URL, comment local settings)

5. Restart the application

## Environment Variables

- `DATABASE_URL`: Used for Neon or other cloud PostgreSQL services
- `NEON_DATABASE_URL`: Always available for migration scripts
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Used for local PostgreSQL

## Notes

- The application automatically detects whether you're using local PostgreSQL or Neon based on the presence of `DATABASE_URL`
- Migration scripts always use `NEON_DATABASE_URL` regardless of your current database setting
- SSL is automatically configured for Neon connections
- Foreign key constraints are properly handled during migration