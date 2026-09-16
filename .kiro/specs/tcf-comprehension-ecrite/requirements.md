# Requirements Document

## Introduction

This feature adds admin-side management for the TCF Canada exam preparation module. The "Exam Preparation" sidebar entry leads to a categories landing page where the admin can manage exam categories (e.g., Compréhension Écrite, Compréhension Orale, Expression Écrite, Expression Orale). "Compréhension Écrite" is created by default. Clicking into a category shows the content management specific to that category. Each category has its own unique quiz structure — for this phase, only Compréhension Écrite is fully implemented with series and questions management. Other categories will have different structures defined in future phases. Each CE series is a comprehensive exam containing questions from ALL CEFR levels (A1 through C2). When a student finishes a series quiz, their achieved CEFR level is determined by their total score compared against configurable point thresholds. The admin can assign a specific series or an entire category to students or batches. This phase covers: categories CRUD, and the full Compréhension Écrite series/questions/assignments flow.

## Glossary

- **Admin**: A user with the `admin` role who manages the platform
- **Category**: A top-level exam type within the TCF module (e.g., Compréhension Écrite, Compréhension Orale, Expression Écrite, Expression Orale). Has a name, description, icon, and display order. Each category has its own unique quiz structure. "Compréhension Écrite" is seeded by default
- **Series**: A named collection of questions specific to the Compréhension Écrite category; contains questions spanning ALL CEFR levels (A1 through C2). Has a name, description, duration in minutes, total question count, total points value, and CEFR level thresholds. Other categories will have their own content structures defined in future phases
- **Question**: An individual question belonging to a Series; has an order index, optional image, question text, four answer options (A, B, C, D), a correct answer indicator, a CEFR level, and a points value
- **CEFR_Level**: The Common European Framework of Reference level assigned to a Question, one of A1, A2, B1, B2, C1, or C2
- **CEFR_Thresholds**: A configuration on a Series that defines the minimum point thresholds required to achieve each CEFR level. The highest threshold met determines the achieved level
- **CEFR_Distribution**: A summary showing how many questions exist at each CEFR level within a Series
- **Series_Assignment**: A record linking a Series to a student or batch for exam preparation
- **Category_Assignment**: A record linking an entire Category to a student or batch, granting access to all Series within it
- **Category_Card**: A UI card displaying the category name, description, series count, and icon
- **Series_Card**: A UI card displaying the series name, total question count, total points, duration, and CEFR distribution

## Requirements

### Requirement 1: Category Management

**User Story:** As an admin, I want to manage exam categories so that I can organize different TCF exam types and add new ones in the future.

#### Acceptance Criteria

1. WHEN the admin navigates to the Exam Preparation page, THE System SHALL display all categories as Category_Cards in a responsive grid layout
2. THE System SHALL seed "Compréhension Écrite" and "Expression Écrite" as default categories on first migration
3. WHEN the admin clicks "Create Category", THE System SHALL display a form requesting name (required, unique), description (optional), and icon (optional)
4. WHEN the admin submits a valid category creation form, THE System SHALL persist the new Category and display it in the grid
5. WHEN the admin clicks edit on a Category, THE System SHALL populate the form with current data
6. WHEN the admin clicks delete on a Category, THE System SHALL display a confirmation dialog; on confirm, delete the Category and all associated Series, Questions, and Assignments
7. THE Category_Card SHALL display the category name, description, series count, and icon
8. WHEN the admin clicks a Category_Card, THE System SHALL navigate to the series list view for that category

### Requirement 2: Series CRUD Operations

**User Story:** As an admin, I want to create, view, edit, and delete series within a category, so that I can organize questions into structured exam sets.

#### Acceptance Criteria

1. WHEN the admin navigates to a category's series page, THE Series_List SHALL display all Series as Series_Cards in a responsive grid with a breadcrumb "Exam Preparation > [Category Name]"
2. WHEN the admin clicks "Create Series", THE System SHALL display a form requesting name, description, duration in minutes, and CEFR_Thresholds (minimum points for A1, A2, B1, B2, C1, C2)
3. WHEN the admin submits a valid series creation form, THE System SHALL persist the Series and display it in the list
4. WHEN the admin submits with a missing name, THE System SHALL display a validation error
5. WHEN the admin submits with invalid CEFR_Thresholds (non-numeric or not ascending A1≤A2≤B1≤B2≤C1≤C2), THE System SHALL display a validation error
6. WHEN the admin clicks edit on a Series, THE System SHALL populate the form with current data including thresholds
7. WHEN the admin submits a valid edit, THE System SHALL update the Series
8. WHEN the admin confirms deletion of a Series, THE System SHALL delete the Series and all associated Questions
9. THE Series_Card SHALL display name, question count, total points, duration, and CEFR_Distribution

### Requirement 3: Question Management Within a Series

**User Story:** As an admin, I want to add, edit, reorder, and delete questions within a series spanning all CEFR levels from A1 to C2.

#### Acceptance Criteria

1. WHEN the admin opens a Series detail view, THE Question_List SHALL display all Questions ordered by their order index with breadcrumb "Exam Preparation > [Category] > [Series]"
2. WHEN the admin clicks "Add Question", THE System SHALL display a form for question text, optional image, four options (A–D), correct answer, CEFR level, and points
3. WHEN the admin submits a valid question, THE System SHALL persist it with the next sequential order and update Series totals
4. WHEN the admin submits with fewer than four options or no correct answer, THE System SHALL show validation errors
5. WHEN the admin edits a Question, THE System SHALL populate the form with current data
6. WHEN the admin saves an edit, THE System SHALL update the Question and recalculate Series totals
7. WHEN the admin deletes a Question, THE System SHALL reindex remaining Questions and update Series totals
8. WHEN the admin reorders via drag-and-drop, THE System SHALL update order indices
9. THE System SHALL restrict CEFR_Level to: A1, A2, B1, B2, C1, C2

### Requirement 4: Series and Category Assignment

**User Story:** As an admin, I want to assign a specific series or an entire category to students or batches.

#### Acceptance Criteria

1. WHEN the admin opens the assignment interface, THE System SHALL display students and batches available for assignment
2. WHEN the admin assigns a Series to a student or batch, THE System SHALL create a Series_Assignment record
3. WHEN the admin assigns a Category to a student or batch, THE System SHALL create a Category_Assignment record granting access to all Series
4. IF a duplicate assignment is attempted, THE System SHALL show an informational message and prevent it
5. WHEN the admin views assignments, THE System SHALL display all current assignments
6. WHEN the admin removes an assignment, THE System SHALL delete the record

### Requirement 5: Database Schema

**User Story:** As a developer, I want a well-structured schema for categories, series, questions, and assignments.

#### Acceptance Criteria

1. THE Database SHALL contain a `tcf_categories` table: id, name (UNIQUE NOT NULL), description, icon, display_order, created_at, updated_at
2. THE Database SHALL contain a `tcf_ce_series` table: id, category_id (FK to tcf_categories ON DELETE CASCADE), name, description, duration_minutes, total_questions, total_points, cefr_thresholds (JSONB), created_by (FK to users), created_at, updated_at
3. THE Database SHALL contain a `tcf_ce_questions` table: id, series_id (FK to tcf_ce_series ON DELETE CASCADE), question_order, image_url, question_text, option_a/b/c/d, correct_answer (CHECK A/B/C/D), cefr_level (CHECK A1–C2), points, created_at, updated_at
4. THE Database SHALL contain `tcf_ce_series_assignments` and `tcf_category_assignments` tables with CHECK constraints ensuring exactly one of student_id or batch_id is non-null
5. THE Database SHALL enforce unique constraints to prevent duplicate assignments
6. THE Database SHALL include appropriate indexes for query performance
7. Other categories will have their own content tables (e.g., `tcf_co_*`, `tcf_ee_*`, `tcf_eo_*`) defined in future phases — only `tcf_ce_*` tables are created now

### Requirement 6: Backend API

**User Story:** As a developer, I want RESTful endpoints for managing categories, series, questions, and assignments.

#### Acceptance Criteria

1. THE API SHALL expose CRUD endpoints for categories at `/api/tcf/categories`
2. THE API SHALL expose series endpoints scoped to a category at `/api/tcf/categories/:categoryId/series`
3. THE API SHALL expose series detail at `/api/tcf/series/:id`
4. THE API SHALL expose question endpoints at `/api/tcf/series/:id/questions` and `/api/tcf/questions/:id`
5. THE API SHALL expose assignment endpoints for both series and category levels
6. ALL endpoints SHALL be accessible only to authenticated admins
7. THE API SHALL return 400 for validation failures, 404 for not found, 409 for duplicates

### Requirement 7: Admin Sidebar Navigation

**User Story:** As an admin, I want an "Exam Preparation" entry in the sidebar.

#### Acceptance Criteria

1. THE Sidebar SHALL display an "Exam Preparation" entry with a ReadOutlined icon for admin users
2. Clicking it SHALL navigate to `/app/exam-preparation`
3. THE route SHALL be registered as a protected admin-only route

### Requirement 8: Series Search

**User Story:** As an admin, I want to search series by name within a category.

#### Acceptance Criteria

1. THE Series_List SHALL display all series by default
2. A search input SHALL filter series by name in real time (case-insensitive)
3. THE list SHALL display the count of matching series
