# Attendance Dashboard Redesign — Tasks

All tasks modify a single file: `frontend/src/components/Admin/AttendanceManagement.tsx`

## Task 1: Foundation — Types, state, data fetching, filter bar
- [x] 1.1 Define TypeScript interfaces: OverviewData, SessionData, StudentData, BatchData, plus filter/dropdown types
- [x] 1.2 Set up component state: filters (dateRange, batchFilter, teacherFilter, searchText), data (overview, sessions, students, batches), UI (loading, expandedKeys)
- [x] 1.3 Create fetchAll() function that calls all 4 endpoints in parallel (Promise.all) with current filter params
- [x] 1.4 Fetch batches list and teachers list for filter dropdowns on mount
- [x] 1.5 Build the filter bar: DateRangePicker with presets (Today/This Week/This Month/Last 30 Days/All Time), Batch Select, Teacher Select, Search Input, Refresh button, Export CSV button
- [x] 1.6 Wire filters to re-fetch data on change (useEffect dependency on filter state)
- [x] 1.7 Render page header: "Attendance Dashboard" title + subtitle + filter bar

Implements: R1 (Global Filter Bar)

## Task 2: Summary Stats Row
- [x] 2.1 Parse overview data into 6 stat objects: Total Sessions, Total Students, Avg Attendance Rate, Present Count, Late Count, Absent Count
- [x] 2.2 Render 6 Ant Design Statistic cards in a Row/Col grid (xs=12, sm=8, md=4)
- [x] 2.3 Add color coding: green icon for present, orange for late, red for absent, blue for totals
- [x] 2.4 Add getAttendanceColor() helper that returns green/orange/red based on rate thresholds
- [x] 2.5 Handle loading state with Skeleton cards

Implements: R2 (Summary Stats Row)

## Task 3: Charts Section
- [x] 3.1 Import Pie and Bar from @ant-design/plots
- [x] 3.2 Build attendance breakdown Pie chart: Present vs Late vs Absent with counts from overview data
- [x] 3.3 Build batch attendance Bar chart: horizontal bars showing avg_attendance_rate per batch, sorted ascending
- [x] 3.4 Wrap charts in a Row with two Col (lg=12 each), inside Card components with titles
- [x] 3.5 Add color mapping: Present=#52c41a, Late=#faad14, Absent=#ff4d4f for pie; dynamic color per bar based on rate
- [x] 3.6 Handle empty data (no sessions yet) with Empty component inside chart cards

Implements: R3 (Charts Section)

## Task 4: Sessions Table
- [x] 4.1 Define columns: Date, Batch, Teacher, Time, Present (green number), Late (orange), Absent (red), Total, Rate %, Status
- [x] 4.2 Render attendance rate as a colored Progress bar + percentage text
- [x] 4.3 Render status as colored Tags (Completed=green, In Progress=blue, Scheduled=default)
- [x] 4.4 Add expandable rows: on expand, show a mini-table of students with status icons (✓ Present, ✗ Absent, ⏰ Late)
- [x] 4.5 Add sorting on Date, Batch, Rate columns
- [x] 4.6 Add pagination (20 per page)
- [x] 4.7 Wrap in a Card with "📅 Sessions" header and session count badge

Implements: R4 (Sessions Table)

## Task 5: Student Attendance Table
- [x] 5.1 Define columns: Student Name, Email, Batch, Sessions Attended, Sessions Missed (calculated), Attendance Rate, Last Attended
- [x] 5.2 Color-code rows: red background tint for <50% rate, yellow tint for 50-69%
- [x] 5.3 Render attendance rate as colored text + small progress bar
- [x] 5.4 Filter students by searchText from the global filter bar
- [x] 5.5 Add sorting on Name, Rate, Last Attended columns
- [x] 5.6 Add pagination (20 per page)
- [x] 5.7 Wrap in a Card with "👥 Student Attendance" header and student count badge

Implements: R5 (Student Attendance Table)

## Task 6: Batch Summary Table
- [x] 6.1 Define columns: Batch Name, Teacher, Students, Total Sessions, Completed Sessions, Avg Attendance Rate
- [x] 6.2 Render attendance rate as a colored Progress bar
- [x] 6.3 Add sorting on Batch Name, Students, Rate columns
- [x] 6.4 Wrap in a Card with "📚 Batch Summary" header and batch count badge

Implements: R6 (Batch Summary Table)

## Task 7: Export, polish, and final verification
- [x] 7.1 Implement CSV export: convert current sessions data to CSV and trigger download
- [x] 7.2 Add loading Skeleton for all sections during initial fetch
- [x] 7.3 Add Empty states with helpful messages for each section when no data
- [x] 7.4 Verify all filter combinations work (date range + batch + teacher + search)
- [x] 7.5 Remove unused imports, run getDiagnostics, verify build passes
- [ ] 7.6 Test responsive layout on different screen widths

Implements: R7 (Export), R8 (Professional UI)
