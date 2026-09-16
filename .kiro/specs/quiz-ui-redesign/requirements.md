# Quiz UI Redesign — Requirements

## Goal
Redesign the quiz creation modal, quiz list, and quiz management UI to be more professional, intuitive, and visually polished. The current modal is cramped, the form layout is confusing, and the quiz list table is basic.

## Current State
- `QuizManagement.tsx` (683 lines): Quiz list table + modal that opens QuizBuilder
- `QuizBuilder.tsx` (1332 lines): Full quiz creation form with question builder
- Question types: MCQ Single, MCQ Multiple, Yes/No
- Features: batch assignment, duration, scheduling, randomization, scoring, auto-submit

## Requirements

### R1: Quiz List Page Redesign
- Clean header with title, subtitle, and "Create Quiz" button
- Stats row: Total Quizzes, Published, Draft, Avg Score
- Filter bar: search by title, filter by status (All/Draft/Published), filter by batch
- Card-based or clean table layout for quiz list
- Each quiz shows: title, batch(es), question count, total marks, status tag, created date
- Quick actions: Edit, Delete, Publish, View Results
- Status tags: Draft (gray), Published (green), Ended (red)

### R2: Quiz Creation Modal/Page Redesign
- Step-based or section-based layout (not one long scrolling form)
- Section 1: Quiz Details (title, description, instructions) — clean card
- Section 2: Settings (batches, duration, schedule, randomization) — clean card
- Section 3: Questions — list of added questions with add/edit/delete/reorder
- Section 4: Scoring (total marks, equalize) — clean card
- Live quiz summary sidebar showing: question count, total points, question types breakdown
- Better question type selector (visual cards instead of dropdown)
- Cleaner question editor modal with preview

### R3: Question Builder Modal Redesign
- Clean modal with clear sections
- Question type shown as visual selector (3 cards: MCQ Single, MCQ Multiple, Yes/No)
- For MCQ: clean option list with add/remove, radio/checkbox for correct answer
- For Yes/No: simple toggle
- Marks input with clear label
- Preview of how the question will look to students

### R4: Visual Polish
- Consistent card-based layout with rounded corners and subtle shadows
- Better spacing and typography
- Color-coded status indicators
- Smooth transitions
- Professional empty states
- Loading skeletons

## Files to Modify
- `frontend/src/components/Teacher/QuizManagement.tsx` — Quiz list page
- `frontend/src/components/Quiz/QuizBuilder.tsx` — Quiz creation/edit form

## No Backend Changes Needed
All quiz CRUD endpoints already exist and work correctly.
