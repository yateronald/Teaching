# Implementation Plan: TCF Exam Preparation

## Overview

This plan implements the admin-side management for the TCF Canada exam preparation module. The "Exam Preparation" sidebar entry leads to a categories page where the admin can manage exam categories (e.g., Compréhension Écrite, Compréhension Orale, Expression Écrite, Expression Orale). "Compréhension Écrite" is seeded by default. Clicking into a category shows the series and questions management. The implementation follows a bottom-up approach: database first, backend API, frontend, routing/sidebar.

## Tasks

- [x] 1. Create database migration for TCF exam prep tables
  - [x] 1.1 Create migration file `backend/database/migrations/004_tcf_exam_prep.sql`
    - Create `tcf_categories` table: id (SERIAL PRIMARY KEY), name (VARCHAR(200) NOT NULL UNIQUE), description (TEXT), icon (VARCHAR(50)), display_order (INTEGER DEFAULT 0), created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    - Seed default categories: INSERT INTO tcf_categories (name, description, icon, display_order) VALUES ('Compréhension Écrite', 'Reading comprehension — TCF Canada', 'ReadOutlined', 1), ('Expression Écrite', 'Written expression — TCF Canada', 'EditOutlined', 2)
    - Create `tcf_ce_series` table: id (SERIAL PRIMARY KEY), category_id (INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE), name (VARCHAR(200) NOT NULL), description (TEXT), duration_minutes (INTEGER NOT NULL), total_questions (INTEGER DEFAULT 0), total_points (NUMERIC DEFAULT 0), cefr_thresholds (JSONB NOT NULL DEFAULT '{"A1":0,"A2":0,"B1":0,"B2":0,"C1":0,"C2":0}'), created_by (INTEGER REFERENCES users(id) ON DELETE SET NULL), created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    - Create `tcf_ce_questions` table: id (SERIAL PRIMARY KEY), series_id (INTEGER NOT NULL REFERENCES tcf_ce_series(id) ON DELETE CASCADE), question_order (INTEGER NOT NULL), image_url (TEXT), question_text (TEXT NOT NULL), option_a (TEXT NOT NULL), option_b (TEXT NOT NULL), option_c (TEXT NOT NULL), option_d (TEXT NOT NULL), correct_answer (VARCHAR(1) NOT NULL CHECK IN A/B/C/D), cefr_level (VARCHAR(2) NOT NULL CHECK IN A1/A2/B1/B2/C1/C2), points (NUMERIC NOT NULL DEFAULT 1), created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    - Create `tcf_ce_series_assignments` table: id (SERIAL PRIMARY KEY), series_id (INTEGER NOT NULL REFERENCES tcf_ce_series(id) ON DELETE CASCADE), student_id (INTEGER REFERENCES users(id) ON DELETE CASCADE), batch_id (INTEGER REFERENCES batches(id) ON DELETE CASCADE), assigned_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), CHECK exactly one of student_id or batch_id is non-null
    - Create `tcf_category_assignments` table: id (SERIAL PRIMARY KEY), category_id (INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE), student_id (INTEGER REFERENCES users(id) ON DELETE CASCADE), batch_id (INTEGER REFERENCES batches(id) ON DELETE CASCADE), assigned_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), CHECK exactly one of student_id or batch_id is non-null
    - Add all indexes: on tcf_ce_series(category_id), tcf_ce_questions(series_id), tcf_ce_questions(series_id, question_order), partial unique indexes on assignment tables, lookup indexes on student_id and batch_id
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 1.2 Run the migration against the database
    - Execute the SQL migration file against the PostgreSQL database to create all tables and seed the default category

- [x] 2. Implement backend API for categories
  - [x] 2.1 Create route file `backend/routes/tcfExamPrep.js` with category endpoints
    - Create Express router with `authenticateToken` and `adminOnly` middleware
    - Implement GET `/categories` — list all categories ordered by display_order, include series count per category
    - Implement POST `/categories` — create a new category (name required, unique; description optional; icon optional)
    - Implement PUT `/categories/:id` — update category name, description, icon
    - Implement DELETE `/categories/:id` — delete category (cascades to series, questions, assignments)
    - Return 400 for validation, 404 for not found, 409 for duplicate name

- [x] 3. Implement backend API for series CRUD
  - [x] 3.1 Add series endpoints to `backend/routes/tcfExamPrep.js`
    - Implement GET `/categories/:categoryId/series` — list all series for a category with question counts, total points, CEFR distribution
    - Implement POST `/categories/:categoryId/series` — create series within a category; validate name, duration_minutes, cefr_thresholds (ascending order A1≤A2≤B1≤B2≤C1≤C2)
    - Implement GET `/series/:id` — fetch single series with all questions ordered by question_order, include thresholds and CEFR distribution
    - Implement PUT `/series/:id` — update series metadata and thresholds
    - Implement DELETE `/series/:id` — delete series (questions cascade)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.10, 5.11_

  - [ ]* 3.2 Write property test for series CRUD round-trip
    - **Property 1: Series CRUD round-trip**
    - **Validates: Requirements 1.3, 1.7**

  - [ ]* 3.3 Write property test for CEFR thresholds validation
    - **Property 9: CEFR thresholds validation — ascending order enforcement**
    - **Validates: Requirements 1.5**

- [x] 4. Implement backend API for question management
  - [x] 4.1 Add question endpoints to `backend/routes/tcfExamPrep.js`
    - Implement POST `/series/:id/questions` — validate question_text, option_a/b/c/d, correct_answer (A/B/C/D), cefr_level (A1–C2), points (≥0); assign next sequential question_order; update series total_questions and total_points
    - Implement PUT `/questions/:id` — validate same fields, update question, recalculate series totals
    - Implement DELETE `/questions/:id` — delete question, reindex remaining (contiguous 1..N), update series totals
    - Implement PUT `/series/:id/questions/reorder` — accept array of { id, question_order }, validate IDs belong to series, bulk update
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.10_

  - [ ]* 4.2 Write property test for series counter invariant
    - **Property 3: Series counter invariant**
    - **Validates: Requirements 2.3, 2.7, 2.8**

  - [ ]* 4.3 Write property test for question ordering invariant
    - **Property 4: Question ordering invariant**
    - **Validates: Requirements 2.1, 2.8**

  - [ ]* 4.4 Write property test for question reorder preserves complete set
    - **Property 5: Question reorder preserves the complete set**
    - **Validates: Requirements 2.9**

  - [ ]* 4.5 Write property test for CEFR distribution accuracy
    - **Property 10: CEFR distribution accuracy**
    - **Validates: Requirements 1.10**

- [x] 5. Implement backend API for assignments
  - [x] 5.1 Add assignment endpoints to `backend/routes/tcfExamPrep.js`
    - Implement POST `/series/:id/assign` — assign series to student or batch, return 409 on duplicate
    - Implement GET `/series/:id/assignments` — list assignments with student/batch details
    - Implement DELETE `/assignments/:id` — remove series assignment
    - Implement POST `/categories/:id/assign` — assign entire category to student or batch, return 409 on duplicate
    - Implement GET `/categories/:id/assignments` — list category assignments with student/batch details
    - Implement DELETE `/category-assignments/:id` — remove category assignment
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 5.2 Write property test for duplicate assignment prevention
    - **Property 7: Duplicate assignment prevention**
    - **Validates: Requirements 3.6**

  - [ ]* 5.3 Write property test for assignment round-trip
    - **Property 6: Assignment round-trip**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.8**

- [x] 6. Mount routes in server.js
  - Register the route file: `const tcfExamPrepRoutes = require('./routes/tcfExamPrep'); app.use('/api/tcf', tcfExamPrepRoutes);`
  - _Requirements: 5.1, 5.11_

- [ ] 7. Checkpoint — Verify backend
  - Ensure all backend endpoints work, ask the user if questions arise.

- [x] 8. Implement frontend — Categories landing page
  - [x] 8.1 Create `frontend/src/components/Admin/ExamPreparation.tsx` with categories view
    - Main component with state: `view` ('categories' | 'series-list' | 'series-detail'), `selectedCategoryId`, `selectedSeriesId`
    - Fetch categories from GET `/api/tcf/categories` via `apiCall()`
    - Render categories as large cards in a responsive grid, each showing: category name, description, series count, icon
    - Add "Create Category" button that opens a CategoryFormModal (name, description, icon)
    - Each category card has edit/delete actions and an "Assign" button for category-level assignment
    - Clicking a category card navigates to the series list view for that category
    - "Compréhension Écrite" appears by default (seeded in DB)

- [x] 9. Implement frontend — Series list and management within a category
  - [x] 9.1 Implement series list view inside ExamPreparation.tsx
    - When a category is selected, fetch series from GET `/api/tcf/categories/:categoryId/series`
    - Show breadcrumb: "Exam Preparation > [Category Name]"
    - Render series as cards in a responsive grid showing: name, question count, total points, duration, CEFR distribution tags
    - Search input for filtering series by name
    - "Create Series" button opens SeriesFormModal
    - Each card has edit/delete/assign actions dropdown
    - "Back" button returns to categories view

  - [x] 9.2 Implement SeriesFormModal for create/edit series
    - Ant Design Modal with Form: name (Input), description (TextArea), duration_minutes (InputNumber), CEFR Thresholds section (6 InputNumber fields for A1–C2, must be ascending)
    - Frontend validation: name required, duration ≥ 1, thresholds ascending
    - POST to create, PUT to update; refresh list on success
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 9.3 Implement series delete with confirmation
    - Modal.confirm() on delete click, DELETE API call, refresh list
    - _Requirements: 1.8, 1.9_

- [x] 10. Implement frontend — Series detail with question management
  - [x] 10.1 Implement series detail view
    - When a series card is clicked, switch to detail view
    - Show breadcrumb: "Exam Preparation > [Category] > [Series Name]"
    - Display series metadata (name, description, duration, thresholds, CEFR distribution)
    - Render questions in a table ordered by question_order: order #, question text (truncated), CEFR level tag, points, correct answer
    - "Add Question" button, edit/delete actions per row
    - Drag-and-drop reorder calling PUT reorder endpoint
    - _Requirements: 2.1, 2.9_

  - [x] 10.2 Implement QuestionFormModal for create/edit questions
    - Modal with Form: question_text (TextArea), image upload (Upload), option_a/b/c/d (Input), correct_answer (Radio A/B/C/D), cefr_level (Select A1–C2), points (InputNumber)
    - Validation: all 4 options required, correct_answer required, cefr_level required
    - POST to create, PUT to update; refresh detail on success
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.10_

  - [x] 10.3 Implement question delete
    - Modal.confirm(), DELETE API call, refresh detail
    - _Requirements: 2.8_

- [x] 11. Implement frontend — Assignment modal
  - [x] 11.1 Implement AssignmentModal for series and category assignments
    - Modal with two Tabs: "Students" and "Batches"
    - Fetch students (GET /api/users?role=student) and batches (GET /api/batches)
    - Searchable lists for selecting students/batches
    - POST to assign, show existing assignments with remove buttons
    - Handle 409 duplicates with message.info()
    - Works for both series-level (POST /api/tcf/series/:id/assign) and category-level (POST /api/tcf/categories/:id/assign) assignments
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 11.2 Write property test for search filter correctness
    - **Property 8: Search filter correctness**
    - **Validates: Requirements 8.2, 8.3, 8.4**

- [ ] 12. Checkpoint — Verify frontend component
  - Ensure frontend renders correctly, ask the user if questions arise.

- [x] 13. Integrate routing and sidebar navigation
  - [x] 13.1 Add admin route in `frontend/src/App.tsx`
    - Import ExamPreparation from `./components/Admin/ExamPreparation`
    - Add Route: `<Route path="exam-preparation" element={<ProtectedRoute requiredRole="admin"><ExamPreparation /></ProtectedRoute>} />`

  - [x] 13.2 Add sidebar entry in `frontend/src/components/Layout/Layout.tsx`
    - Import `ReadOutlined` from `@ant-design/icons`
    - Add nav item: `{ key: '/app/exam-preparation', icon: <ReadOutlined />, label: 'Exam Preparation' }`
    - Add page title: `'/exam-preparation': 'Exam Preparation'`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 14. Final checkpoint — Build and verify
  - Run frontend build to ensure no TypeScript errors
  - Verify sidebar navigation works
  - Verify categories page loads with default "Compréhension Écrite"
  - Verify series and question CRUD within a category

## Notes

- Tasks marked with `*` are optional property-based tests
- The route is now `/app/exam-preparation` (not `/app/tcf-comprehension-ecrite`)
- The sidebar label is "Exam Preparation"
- The backend route file is `tcfExamPrep.js` mounted at `/api/tcf`
- Tables are now named: `tcf_categories` (generic, shared), `tcf_ce_series`, `tcf_ce_questions`, `tcf_ce_series_assignments` (CE-specific), `tcf_category_assignments` (generic, shared)
- Each category will have its own content tables in future phases (e.g., `tcf_co_*` for Compréhension Orale) — only CE tables are created now
- The series/questions structure with CEFR thresholds is specific to Compréhension Écrite — other categories will have different structures
- "Compréhension Écrite" is seeded as the default category in the migration
- The frontend navigation flow: Categories → Series List → Series Detail (questions)
- Series have no draft/published status — they are just saved
- Each series contains questions from ALL CEFR levels (A1–C2) with configurable point thresholds
