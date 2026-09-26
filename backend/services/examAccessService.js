/**
 * Exam Access Service — manages and verifies student access to exam content.
 *
 * learnerAssignments() is the one place that says what is open to a learner:
 * every screen and every "start" goes through it, so a company rule (its dates,
 * its suspension, the content it may use) cannot be missed on one path.
 */
const { hasColumn } = require('./schemaFeatures');
const orgs = require('./organizationService');

const PAST = new Date(0);

/**
 * Every assignment that reaches the learner — direct, through a class batch or
 * through a company group — with its effective end date:
 *  - a company learner's access never outlasts the company's own end date, and
 *    is closed while the company is not open (expired, not started, suspended);
 *  - an assignment the company made counts only while the company may still use
 *    that content.
 * Rows: { content_type, content_id, expires_at, assigned_at, group_name, organization_id }.
 */
async function learnerAssignments(db, userId) {
  const withOrgs = await hasColumn(db, 'tcf_exam_assignments', 'org_group_id');
  const rows = await db.all(`
    SELECT a.content_type, a.content_id, a.expires_at, a.assigned_at, a.group_name
           ${withOrgs ? ', a.organization_id' : ', NULL::int AS organization_id'}
      FROM tcf_exam_assignments a
     WHERE a.student_id = $1
        OR a.batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $1)
        ${withOrgs ? 'OR a.org_group_id IN (SELECT group_id FROM organization_group_members WHERE user_id = $1)' : ''}
  `, [userId]);
  if (!withOrgs) return rows;

  const org = await orgs.orgOfUser(db, userId);
  if (!org) return rows.filter(r => r.organization_id == null);

  const open = orgs.stateOf(org) === 'active';
  const orgEnd = new Date(org.access_ends_at);
  const made = rows.filter(r => r.organization_id != null);
  let allowed = null;
  let keysOf = null;
  if (made.length) {
    allowed = await orgs.entitlementKeys(db, org.id);
    keysOf = await orgs.ancestorKeys(db, made);
  }
  return rows
    .filter(r => r.organization_id == null
      || (Number(r.organization_id) === Number(org.id) && orgs.covered(keysOf.get(`${r.content_type}:${r.content_id}`), allowed)))
    .map(r => {
      if (!open) return { ...r, expires_at: PAST };
      const own = r.expires_at ? new Date(r.expires_at) : null;
      return { ...r, expires_at: own && own < orgEnd ? own : orgEnd };
    });
}

const isLive = (row, now = Date.now()) => !row.expires_at || new Date(row.expires_at).getTime() > now;

/** Can the learner open this content? True when it, or something above it, is assigned and still open. */
async function checkExamAccess(db, studentId, contentType, contentId) {
  if (!studentId || !contentType || !contentId) return false;
  const keys = (await orgs.ancestorKeys(db, [{ content_type: contentType, content_id: contentId }]))
    .get(`${contentType}:${Number(contentId)}`);
  if (!keys) return false;
  const wanted = new Set(keys);
  const rows = await learnerAssignments(db, studentId);
  return rows.some(r => isLive(r) && wanted.has(`${r.content_type}:${r.content_id}`));
}

/** Is anything of this category (by name) open to the learner? */
async function hasAnyActiveAssignmentForCategory(db, studentId, categoryName) {
  if (!studentId || !categoryName) return false;
  const category = await db.get(`SELECT id FROM tcf_categories WHERE name = $1`, [categoryName]);
  if (!category) return false;
  const live = (await learnerAssignments(db, studentId)).filter(r => isLive(r));
  if (!live.length) return false;
  const keysOf = await orgs.ancestorKeys(db, live);
  return live.some(r => (keysOf.get(`${r.content_type}:${r.content_id}`) || []).includes(`category:${category.id}`));
}

module.exports = {
  learnerAssignments,
  checkExamAccess,
  hasAnyActiveAssignmentForCategory,
};
