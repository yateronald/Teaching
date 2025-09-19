# Deployment Guide for Render

This guide provides multiple solutions for deploying the backend to Render and resolving SQLite3 compatibility issues.

## Problem
The "invalid ELF header" error occurs because SQLite3 binaries compiled on Windows are incompatible with Render's Linux environment.

## Solution 1: Current Implementation (Recommended to try first)

### What's been implemented:
1. **Postinstall script**: Automatically rebuilds SQLite3 after npm install
2. **Build script**: Manual rebuild option
3. **Node.js version specification**: Ensures consistent environment
4. **Proper .gitignore**: Excludes node_modules and other unnecessary files

### Render Configuration:
1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Environment Variables**: Set your environment variables in Render dashboard

### Files modified:
- `package.json`: Added postinstall script and engines specification
- `.gitignore`: Created to exclude unnecessary files

## Solution 2: Better-SQLite3 Alternative (If Solution 1 fails)

If the current approach continues to fail, switch to better-sqlite3 which has better cross-platform support.

### Steps to switch:
1. Replace `package.json` with `package-better-sqlite3.json`:
   ```bash
   cp package-better-sqlite3.json package.json
   ```

2. Update `server.js` to use the new database initialization:
   ```javascript
   // Replace this line:
   const Database = require('./database/init');
   
   // With this:
   const Database = require('./database/init-better-sqlite3');
   ```

3. Update `database/seed-users.js` to use better-sqlite3:
   ```javascript
   // Replace:
   const sqlite3 = require('sqlite3').verbose();
   const db = new sqlite3.Database(dbPath);
   
   // With:
   const Database = require('better-sqlite3');
   const db = new Database(dbPath);
   ```

### Advantages of better-sqlite3:
- No native compilation required
- Better performance
- Synchronous API (simpler code)
- More reliable cross-platform deployment

## Solution 3: Environment-specific Build

If both solutions fail, try this approach:

1. Add to package.json:
   ```json
   {
     "scripts": {
       "build": "npm rebuild --build-from-source",
       "postinstall": "npm rebuild sqlite3 --build-from-source"
     }
   }
   ```

2. Set environment variable in Render:
   - `PYTHON`: `/usr/bin/python3`
   - `npm_config_build_from_source`: `true`

## Troubleshooting

### If deployment still fails:
1. Check Render build logs for specific error messages
2. Ensure Node.js version matches between local and Render (18.x recommended)
3. Clear Render's build cache and redeploy
4. Consider using PostgreSQL instead of SQLite for production

### Common issues:
- **Build timeout**: Increase build timeout in Render settings
- **Memory issues**: Use smaller instance or optimize build process
- **Permission errors**: Ensure proper file permissions in deployment

## Testing Locally

Before deploying, test the build process locally:

```bash
# Test current approach
npm install
npm run build
npm start

# Test better-sqlite3 approach (if switching)
npm install better-sqlite3
npm uninstall sqlite3
npm start
```

## Deployment Checklist

- [ ] Environment variables configured in Render
- [ ] Build command set to `npm install`
- [ ] Start command set to `npm start`
- [ ] Node.js version specified in package.json
- [ ] .gitignore excludes node_modules
- [ ] Database files are gitignored but schema is included
- [ ] Test deployment with a simple health check

## Support

If issues persist, consider:
1. Using PostgreSQL with Render's managed database
2. Switching to a different deployment platform
3. Using Docker for consistent environments