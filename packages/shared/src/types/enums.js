"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleStatus = exports.SessionStatus = exports.AttendanceStatus = exports.SubmissionStatus = exports.QuizStatus = exports.LocationMode = exports.QuestionType = exports.FrenchLevel = exports.SubscriptionInterval = exports.DemoRequestStatus = exports.Locale = exports.UserRole = exports.TenantStatus = exports.PlanType = void 0;
var PlanType;
(function (PlanType) {
    PlanType["FULL"] = "FULL";
    PlanType["LITE"] = "LITE";
})(PlanType || (exports.PlanType = PlanType = {}));
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "ACTIVE";
    TenantStatus["GRACE_PERIOD"] = "GRACE_PERIOD";
    TenantStatus["SUSPENDED"] = "SUSPENDED";
    TenantStatus["ARCHIVED"] = "ARCHIVED";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["TEACHER"] = "TEACHER";
    UserRole["STUDENT"] = "STUDENT";
})(UserRole || (exports.UserRole = UserRole = {}));
var Locale;
(function (Locale) {
    Locale["FR"] = "FR";
    Locale["EN"] = "EN";
})(Locale || (exports.Locale = Locale = {}));
var DemoRequestStatus;
(function (DemoRequestStatus) {
    DemoRequestStatus["PENDING"] = "PENDING";
    DemoRequestStatus["CONTACTED"] = "CONTACTED";
    DemoRequestStatus["SCHEDULED"] = "SCHEDULED";
    DemoRequestStatus["COMPLETED"] = "COMPLETED";
    DemoRequestStatus["CANCELLED"] = "CANCELLED";
})(DemoRequestStatus || (exports.DemoRequestStatus = DemoRequestStatus = {}));
var SubscriptionInterval;
(function (SubscriptionInterval) {
    SubscriptionInterval["MONTHLY"] = "MONTHLY";
    SubscriptionInterval["YEARLY"] = "YEARLY";
})(SubscriptionInterval || (exports.SubscriptionInterval = SubscriptionInterval = {}));
var FrenchLevel;
(function (FrenchLevel) {
    FrenchLevel["A1"] = "A1";
    FrenchLevel["A2"] = "A2";
    FrenchLevel["B1"] = "B1";
    FrenchLevel["B2"] = "B2";
    FrenchLevel["C1"] = "C1";
    FrenchLevel["C2"] = "C2";
})(FrenchLevel || (exports.FrenchLevel = FrenchLevel = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["TRUE_FALSE"] = "true_false";
    QuestionType["FREE_TEXT"] = "free_text";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var LocationMode;
(function (LocationMode) {
    LocationMode["ONLINE"] = "online";
    LocationMode["IN_PERSON"] = "in_person";
})(LocationMode || (exports.LocationMode = LocationMode = {}));
var QuizStatus;
(function (QuizStatus) {
    QuizStatus["DRAFT"] = "draft";
    QuizStatus["PUBLISHED"] = "published";
    QuizStatus["CLOSED"] = "closed";
})(QuizStatus || (exports.QuizStatus = QuizStatus = {}));
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["NOT_STARTED"] = "not_started";
    SubmissionStatus["IN_PROGRESS"] = "in_progress";
    SubmissionStatus["SUBMITTED"] = "submitted";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "present";
    AttendanceStatus["ABSENT"] = "absent";
    AttendanceStatus["LATE"] = "late";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["SCHEDULED"] = "scheduled";
    SessionStatus["IN_PROGRESS"] = "in_progress";
    SessionStatus["COMPLETED"] = "completed";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["SCHEDULED"] = "scheduled";
    ScheduleStatus["CANCELLED"] = "cancelled";
})(ScheduleStatus || (exports.ScheduleStatus = ScheduleStatus = {}));
//# sourceMappingURL=enums.js.map