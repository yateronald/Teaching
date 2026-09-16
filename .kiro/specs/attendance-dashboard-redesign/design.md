# Attendance Dashboard Redesign — Design

## Single Page Layout (top to bottom, no tabs)

```
┌─────────────────────────────────────────────────────────┐
│  📊 Attendance Dashboard                                │
│  [Date Range ▼] [Batch ▼] [Teacher ▼] [Search] [Export] │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │ 45   │ │ 120  │ │ 78%  │ │ 340  │ │ 25   │ │ 72   ││
│  │Sessns│ │Studts│ │ Avg  │ │Presnt│ │ Late │ │Absnt ││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   🍩 Donut      │  │   📊 Batch Attendance Bars  │  │
│  │  Present: 78%   │  │   Batch A  ████████░░ 80%   │  │
│  │  Late: 6%       │  │   Batch B  ██████░░░░ 60%   │  │
│  │  Absent: 16%    │  │   Batch C  ████░░░░░░ 40%   │  │
│  └─────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  📅 Sessions                                            │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Date    │ Batch │ Teacher │ ✓  │ ⏰ │ ✗  │ Rate   ││
│  │ Mar 28  │ A1    │ Maxime  │ 8  │ 1  │ 2  │ ██ 82% ││
│  │ Mar 27  │ B2    │ Konan   │ 5  │ 0  │ 3  │ ██ 63% ││
│  │  └─ Student details when expanded                   ││
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  👥 Student Attendance                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Student  │ Batch │ Attended │ Missed │ Rate │ Last  ││
│  │ Aarav    │ A1    │ 12       │ 2      │ 86%  │ Mar28 ││
│  │ ⚠ Priya │ B2    │ 3        │ 7      │ 30%  │ Mar15 ││ ← red row
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  📚 Batch Summary                                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Batch │ Teacher │ Students │ Sessions │ Avg Rate    ││
│  │ A1    │ Maxime  │ 11       │ 15       │ ████ 82%   ││
│  │ B2    │ Konan   │ 8        │ 10       │ ██░░ 45%   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Data Flow

1. On mount → fetch overview + sessions + students + batches in parallel (Promise.all)
2. Filter change → re-fetch all 4 endpoints with new params
3. Session expand → show student details from the session's attendance_details (already in response)
4. No lazy loading needed — all data loads at once for instant switching

## State

```typescript
// Filters (global, affect all sections)
dateRange: [Dayjs, Dayjs] | null
batchFilter: number | null
teacherFilter: number | null
searchText: string

// Data
overview: { total_sessions, total_students, overall_attendance_rate, total_present, total_late, total_absent }
sessions: Array<{ session_id, batch_name, teacher_name, session_date, present_count, late_count, absent_count, total_students, attendance_percentage, status }>
students: Array<{ id, first_name, last_name, email, batch_name, total_sessions, present_count, attendance_rate, last_attendance_date }>
batches: Array<{ id, name, teacher_name, total_students, total_sessions, completed_sessions, avg_attendance_rate }>

// UI
loading: boolean
expandedSessionKeys: number[]
```

## Color Logic
```typescript
function getAttendanceColor(rate: number): string {
    if (rate >= 80) return '#52c41a'; // green
    if (rate >= 50) return '#faad14'; // orange
    return '#ff4d4f'; // red
}
```

## Chart Config
- Pie: `{ data: [{type:'Present',value:340},{type:'Late',value:25},{type:'Absent',value:72}], colorField:'type', color:['#52c41a','#faad14','#ff4d4f'] }`
- Bar: `{ data: batches.map(b=>({batch:b.name, rate:b.avg_attendance_rate})), xField:'rate', yField:'batch', color: (d) => getAttendanceColor(d.rate) }`
