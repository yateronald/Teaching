# Attendance Dashboard Redesign — Requirements

## Goal
Replace the current tab-based Attendance Management page with a single, unified dashboard that shows all attendance insights on one scrollable page — no tabs, no switching views. Everything is visible at once with powerful global filters at the top.

## Current Problems
1. Data split across 5 separate tabs — hard to get a full picture
2. Attendance rates of 0% are ambiguous (absent? or no session happened?)
3. Progress bars don't clearly show present/absent/late breakdown
4. No charts or visual analytics
5. Expandable rows are clunky and slow
6. No quick way to answer "who was absent today?" or "which batch has the worst attendance?"

## Requirements

### R1: Global Filter Bar (sticky at top)
- Date range picker with quick presets: Today, This Week, This Month, Last 30 Days, All Time
- Batch filter dropdown (multi-select)
- Teacher filter dropdown (admin only)
- Student search input
- Refresh button
- All sections below react to these filters simultaneously

### R2: Summary Stats Row
- 6 stat cards in a row: Total Sessions, Total Students, Avg Attendance Rate, Present Count, Late Count, Absent Count
- Color-coded values: green (≥80%), orange (50-79%), red (<50%)
- Each card shows the actual number prominently

### R3: Charts Section (side by side)
- Left: Donut/Pie chart showing Present vs Late vs Absent breakdown (with counts and percentages)
- Right: Horizontal bar chart showing attendance rate per batch (sorted worst to best)
- Charts update when filters change
- Use @ant-design/plots (Pie and Bar components)

### R4: Sessions Table
- All sessions in one clean table (no tabs needed)
- Columns: Date, Batch, Teacher, Time, Present, Late, Absent, Total, Rate %, Status
- Present/Late/Absent shown as colored numbers (green/orange/red)
- Attendance rate as a colored progress bar
- Status as colored tags (Completed, In Progress, Scheduled)
- Expandable rows: click to see individual student attendance (✓ Present, ✗ Absent, ⏰ Late)
- Sortable columns, pagination (20 per page)

### R5: Student Attendance Table (below sessions)
- Per-student attendance summary
- Columns: Student Name, Email, Batch, Sessions Attended, Sessions Missed, Attendance Rate, Last Attended
- Color-coded rows: red background for at-risk students (<50%), yellow for warning (50-69%)
- Searchable by name/email
- Sortable by attendance rate

### R6: Batch Summary Table (below students)
- Per-batch attendance overview
- Columns: Batch Name, Teacher, Students, Total Sessions, Completed, Avg Attendance Rate
- Progress bar for attendance rate
- Compact, no expandable rows needed

### R7: Export
- Single "Export CSV" button in the filter bar
- Exports the sessions data with current filters applied

### R8: Professional UI
- Clean card-based layout with subtle shadows and rounded corners
- Section headers with icons (📊 Overview, 📅 Sessions, 👥 Students, 📚 Batches)
- Loading skeletons for initial load
- Empty states with helpful messages
- Responsive for tablet/desktop

## Existing Backend Endpoints (no backend changes needed)
- `GET /api/attendance/reports/overview` — Summary stats (total_sessions, total_students, overall_attendance_rate, total_present, total_late, total_absent)
- `GET /api/attendance/reports/sessions` — Session list with present_count, late_count, absent_count, attendance_percentage
- `GET /api/attendance/reports/students` — Student stats with attendance_rate, present_count, total_sessions
- `GET /api/attendance/reports/batches` — Batch stats with avg_attendance_rate, total_students, total_sessions
- All endpoints accept: `batch_id`, `teacher_id`, `date_from`, `date_to` query params

## Tech
- Single file: `frontend/src/components/Admin/AttendanceManagement.tsx`
- React + TypeScript + Ant Design
- @ant-design/plots for Pie and Bar charts
- dayjs for dates
- No separate CSS file needed (Ant Design inline styles)
