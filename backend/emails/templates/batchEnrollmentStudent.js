const { baseHtml, detailCard, escapeHtml } = require('./base');

const DAY_NAMES_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function safeFormatDate(input) {
    if (!input) return null;
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatScheduleValue(s) {
    const start = s.start_time ? String(s.start_time) : '';
    const end = s.end_time ? String(s.end_time) : '';
    const range = start && end ? `${start} – ${end}` : (start || end || '');
    let where = '';
    if (s.location_mode === 'online') {
        where = 'Online';
    } else if (s.location) {
        where = String(s.location);
    } else if (s.location_mode) {
        where = String(s.location_mode);
    }
    const parts = [range, where].filter(Boolean);
    return escapeHtml(parts.join(' · '));
}

function buildScheduleRows(schedules) {
    if (!Array.isArray(schedules) || schedules.length === 0) return [];
    const sorted = schedules
        .slice()
        .sort((a, b) => {
            const da = Number(a.day_of_week);
            const db = Number(b.day_of_week);
            if (da !== db) return da - db;
            return String(a.start_time || '').localeCompare(String(b.start_time || ''));
        });
    return sorted.map(s => {
        const dayIdx = Number(s.day_of_week);
        const dayLabel = (dayIdx >= 0 && dayIdx <= 6 && Number.isFinite(dayIdx))
            ? DAY_NAMES_LONG[dayIdx]
            : `Day ${escapeHtml(s.day_of_week)}`;
        const value = formatScheduleValue(s);
        return { label: dayLabel, value: value || null };
    });
}

/**
 * Batch enrollment notification sent to a student.
 *
 * @param {{
 *   studentName?: string,
 *   batchName?: string,
 *   teacherName?: string,
 *   frenchLevel?: string,
 *   startDate?: string|Date,
 *   endDate?: string|Date,
 *   schedules?: Array<{ day_of_week:number, start_time:string, end_time:string, location_mode?:string, location?:string }>,
 *   studentCount?: number,
 * }} args
 */
function buildBatchEnrollmentStudentTemplate({
    studentName,
    batchName,
    teacherName,
    frenchLevel,
    startDate,
    endDate,
    schedules,
    studentCount,
}) {
    const safeStudent = studentName || 'there';
    const safeBatch = batchName || 'New batch';

    const subject = `You're enrolled in: ${safeBatch}`;
    const preheader = `You've been enrolled in ${safeBatch}. Full details inside.`;

    const startStr = safeFormatDate(startDate);
    const endStr = safeFormatDate(endDate);

    const detailRows = [
        { label: 'Batch', value: escapeHtml(safeBatch) },
        { label: 'Level', value: frenchLevel ? escapeHtml(frenchLevel) : null },
        { label: 'Teacher', value: teacherName ? escapeHtml(teacherName) : null },
        { label: 'Students', value: typeof studentCount === 'number' ? String(studentCount) : null },
        { label: 'Start date', value: startStr ? escapeHtml(startStr) : null },
        { label: 'End date', value: endStr ? escapeHtml(endStr) : null },
    ];

    const scheduleRows = buildScheduleRows(schedules);
    const scheduleCard = scheduleRows.length > 0
        ? detailCard({ title: 'Weekly schedule', rows: scheduleRows })
        : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        You've been enrolled in a new batch. Add these times to your calendar so you don't miss your first class.
      </p>

      ${detailCard({ title: 'Batch details', rows: detailRows })}
      ${scheduleCard}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        If anything looks off, reply to this email or contact support.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'ENROLLMENT',
        title: "You've been enrolled in a new batch",
        bodyHtml,
    });

    const textLines = [
        `Hi ${safeStudent},`,
        '',
        "You've been enrolled in a new batch. Add these times to your calendar so you don't miss your first class.",
        '',
        'BATCH DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
    ];
    if (scheduleRows.length > 0) {
        textLines.push('', 'WEEKLY SCHEDULE');
        scheduleRows.forEach(r => {
            if (r.value) textLines.push(`${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`);
        });
    }
    const text = textLines.filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildBatchEnrollmentStudentTemplate };
