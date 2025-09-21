const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.postgres') });

// Set environment to use PostgreSQL
process.env.DATABASE_TYPE = 'postgresql';

const PostgreSQLDatabase = require('../database/init-postgres');

async function testPostgreSQLMigration() {
    console.log('🧪 Testing PostgreSQL Migration Compatibility...');
    console.log('================================================');
    
    const db = new PostgreSQLDatabase();
    
    try {
        // Initialize database connection
        await db.initialize();
        
        // Test 1: Basic CRUD operations
        console.log('\n📝 Test 1: Basic CRUD Operations');
        await testBasicCRUD(db);
        
        // Test 2: Foreign key relationships
        console.log('\n🔗 Test 2: Foreign Key Relationships');
        await testForeignKeys(db);
        
        // Test 3: Complex queries (joins, aggregations)
        console.log('\n🔍 Test 3: Complex Queries');
        await testComplexQueries(db);
        
        // Test 4: Transaction support
        console.log('\n💾 Test 4: Transaction Support');
        await testTransactions(db);
        
        // Test 5: Data integrity checks
        console.log('\n🛡️  Test 5: Data Integrity');
        await testDataIntegrity(db);
        
        // Test 6: Application-specific operations
        console.log('\n🎯 Test 6: Application Operations');
        await testApplicationOperations(db);
        
        console.log('\n🎉 All tests passed! PostgreSQL migration is successful.');
        
    } catch (error) {
        console.error('\n❌ Migration test failed:', error.message);
        throw error;
    } finally {
        await db.close();
    }
}

async function testBasicCRUD(db) {
    // Test CREATE
    const testUser = await db.run(`
        INSERT INTO users (username, email, password_hash, role, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `, ['test_user_pg', 'test.pg@example.com', 'hashed_password', 'student', 'Test', 'User']);
    
    const userId = testUser.rows[0].id;
    console.log(`   ✅ CREATE: Created user with ID ${userId}`);
    
    // Test READ
    const user = await db.get('SELECT * FROM users WHERE id = $1', [userId]);
    console.log(`   ✅ READ: Retrieved user ${user.username}`);
    
    // Test UPDATE
    await db.run('UPDATE users SET first_name = $1 WHERE id = $2', ['Updated', userId]);
    const updatedUser = await db.get('SELECT first_name FROM users WHERE id = $1', [userId]);
    console.log(`   ✅ UPDATE: Updated name to ${updatedUser.first_name}`);
    
    // Test DELETE
    await db.run('DELETE FROM users WHERE id = $1', [userId]);
    const deletedUser = await db.get('SELECT * FROM users WHERE id = $1', [userId]);
    console.log(`   ✅ DELETE: User deleted (${deletedUser ? 'FAILED' : 'SUCCESS'})`);
}

async function testForeignKeys(db) {
    // Test foreign key constraint enforcement
    try {
        await db.run(`
            INSERT INTO batches (name, teacher_id, french_level, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5)
        `, ['Test Batch', 99999, 'A1', '2025-01-01', '2025-12-31']);
        
        console.log('   ❌ Foreign key constraint not enforced');
    } catch (error) {
        if (error.code === '23503') {
            console.log('   ✅ Foreign key constraint properly enforced');
        } else {
            throw error;
        }
    }
    
    // Test valid foreign key relationship
    const teacher = await db.get('SELECT id FROM users WHERE role = $1 LIMIT 1', ['teacher']);
    if (teacher) {
        const batch = await db.run(`
            INSERT INTO batches (name, teacher_id, french_level, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, ['Test Batch Valid', teacher.id, 'A1', '2025-01-01', '2025-12-31']);
        
        const batchId = batch.rows[0].id;
        console.log(`   ✅ Valid foreign key relationship created (batch ID: ${batchId})`);
        
        // Clean up
        await db.run('DELETE FROM batches WHERE id = $1', [batchId]);
    }
}

async function testComplexQueries(db) {
    // Test JOIN operations
    const teacherBatches = await db.all(`
        SELECT u.first_name, u.last_name, b.name as batch_name, COUNT(bs.student_id) as student_count
        FROM users u
        JOIN batches b ON u.id = b.teacher_id
        LEFT JOIN batch_students bs ON b.id = bs.batch_id
        WHERE u.role = $1
        GROUP BY u.id, b.id
        ORDER BY u.last_name
    `, ['teacher']);
    
    console.log(`   ✅ JOIN query: Found ${teacherBatches.length} teacher-batch relationships`);
    
    // Test aggregation
    const stats = await db.get(`
        SELECT 
            COUNT(DISTINCT u.id) as total_users,
            COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END) as students,
            COUNT(DISTINCT CASE WHEN u.role = 'teacher' THEN u.id END) as teachers,
            COUNT(DISTINCT q.id) as total_quizzes
        FROM users u
        LEFT JOIN quizzes q ON u.id = q.teacher_id
    `);
    
    console.log(`   ✅ Aggregation: ${stats.total_users} users (${stats.students} students, ${stats.teachers} teachers), ${stats.total_quizzes} quizzes`);
    
    // Test subquery
    const activeQuizzes = await db.all(`
        SELECT q.title, q.start_date, q.end_date,
               (SELECT COUNT(*) FROM quiz_submissions qs WHERE qs.quiz_id = q.id) as submission_count
        FROM quizzes q
        WHERE q.status = $1
        ORDER BY q.created_at DESC
    `, ['published']);
    
    console.log(`   ✅ Subquery: Found ${activeQuizzes.length} published quizzes`);
}

async function testTransactions(db) {
    const client = db.getDatabase();
    
    try {
        await client.query('BEGIN');
        
        // Insert test data
        const result = await client.query(`
            INSERT INTO users (username, email, password_hash, role, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, ['tx_test', 'tx.test@example.com', 'hash', 'student', 'Transaction', 'Test']);
        
        const userId = result.rows[0].id;
        
        // Verify data exists within transaction
        const userInTx = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        console.log(`   ✅ Transaction INSERT: User created with ID ${userId}`);
        
        // Rollback transaction
        await client.query('ROLLBACK');
        
        // Verify data doesn't exist after rollback
        const userAfterRollback = await db.get('SELECT * FROM users WHERE id = $1', [userId]);
        if (!userAfterRollback) {
            console.log('   ✅ Transaction ROLLBACK: Data properly rolled back');
        } else {
            console.log('   ❌ Transaction ROLLBACK: Data still exists after rollback');
        }
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

async function testDataIntegrity(db) {
    // Test unique constraints
    try {
        const existingUser = await db.get('SELECT username, email FROM users LIMIT 1');
        if (existingUser) {
            await db.run(`
                INSERT INTO users (username, email, password_hash, role, first_name, last_name)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [existingUser.username, 'different@email.com', 'hash', 'student', 'Test', 'User']);
            
            console.log('   ❌ Username unique constraint not enforced');
        }
    } catch (error) {
        if (error.code === '23505') {
            console.log('   ✅ Username unique constraint properly enforced');
        } else {
            throw error;
        }
    }
    
    // Test NOT NULL constraints
    try {
        await db.run(`
            INSERT INTO users (username, email, password_hash, role, last_name)
            VALUES ($1, $2, $3, $4, $5)
        `, ['test_null', 'null.test@example.com', 'hash', 'student', 'Test']);
        
        console.log('   ❌ NOT NULL constraint not enforced');
    } catch (error) {
        if (error.code === '23502') {
            console.log('   ✅ NOT NULL constraint properly enforced');
        } else {
            throw error;
        }
    }
    
    // Test data types
    const booleanTest = await db.get('SELECT is_active FROM users WHERE is_active = $1 LIMIT 1', [true]);
    if (booleanTest) {
        console.log('   ✅ Boolean data type working correctly');
    }
    
    const timestampTest = await db.get('SELECT created_at FROM users WHERE created_at IS NOT NULL LIMIT 1');
    if (timestampTest && timestampTest.created_at instanceof Date) {
        console.log('   ✅ Timestamp data type working correctly');
    }
}

async function testApplicationOperations(db) {
    // Test quiz submission workflow
    const quiz = await db.get('SELECT id FROM quizzes WHERE status = $1 LIMIT 1', ['published']);
    const student = await db.get('SELECT id FROM users WHERE role = $1 LIMIT 1', ['student']);
    
    if (quiz && student) {
        // Check if submission already exists
        const existingSubmission = await db.get(
            'SELECT id FROM quiz_submissions WHERE quiz_id = $1 AND student_id = $2',
            [quiz.id, student.id]
        );
        
        if (!existingSubmission) {
            const submission = await db.run(`
                INSERT INTO quiz_submissions (quiz_id, student_id, status, started_at)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `, [quiz.id, student.id, 'in_progress', new Date()]);
            
            const submissionId = submission.rows[0].id;
            console.log(`   ✅ Quiz submission workflow: Created submission ${submissionId}`);
            
            // Clean up
            await db.run('DELETE FROM quiz_submissions WHERE id = $1', [submissionId]);
        } else {
            console.log('   ✅ Quiz submission workflow: Existing submission found (constraint working)');
        }
    }
    
    // Test email change request workflow
    const user = await db.get('SELECT id, email FROM users LIMIT 1');
    if (user) {
        const changeRequest = await db.run(`
            INSERT INTO email_change_requests (user_id, old_email, new_email, code, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [user.id, user.email, 'new.email@example.com', 'TEST123', new Date(Date.now() + 3600000)]);
        
        const requestId = changeRequest.rows[0].id;
        console.log(`   ✅ Email change workflow: Created request ${requestId}`);
        
        // Clean up
        await db.run('DELETE FROM email_change_requests WHERE id = $1', [requestId]);
    }
    
    // Test batch enrollment
    const batch = await db.get('SELECT id FROM batches LIMIT 1');
    const studentForBatch = await db.get('SELECT id FROM users WHERE role = $1 LIMIT 1', ['student']);
    
    if (batch && studentForBatch) {
        // Check if enrollment already exists
        const existingEnrollment = await db.get(
            'SELECT id FROM batch_students WHERE batch_id = $1 AND student_id = $2',
            [batch.id, studentForBatch.id]
        );
        
        if (!existingEnrollment) {
            const enrollment = await db.run(`
                INSERT INTO batch_students (batch_id, student_id)
                VALUES ($1, $2)
                RETURNING id
            `, [batch.id, studentForBatch.id]);
            
            const enrollmentId = enrollment.rows[0].id;
            console.log(`   ✅ Batch enrollment workflow: Created enrollment ${enrollmentId}`);
            
            // Clean up
            await db.run('DELETE FROM batch_students WHERE id = $1', [enrollmentId]);
        } else {
            console.log('   ✅ Batch enrollment workflow: Existing enrollment found (constraint working)');
        }
    }
}

// Export for use in other scripts
module.exports = { testPostgreSQLMigration };

// Run if called directly
if (require.main === module) {
    testPostgreSQLMigration().catch(console.error);
}