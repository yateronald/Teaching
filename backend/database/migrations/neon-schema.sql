-- Generated schema (sequences)
CREATE SEQUENCE IF NOT EXISTS public."users_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."batches_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."batch_students_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."batch_timetables_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."class_schedules_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."quizzes_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."questions_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."question_options_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."quiz_batches_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."quiz_submissions_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."student_answers_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."quiz_reminders_sent_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."resources_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."schedules_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."email_change_requests_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."password_reset_requests_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."migrations_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."class_sessions_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."attendance_records_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."teacher_attendance_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."attendance_audit_log_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."attendance_settings_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."user_batches_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;
CREATE SEQUENCE IF NOT EXISTS public."attendance_id_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647;

-- Generated schema (tables)
CREATE TABLE IF NOT EXISTS public."attendance" (
  "id" integer DEFAULT nextval('attendance_id_seq'::regclass) NOT NULL,
  "session_id" integer  NOT NULL,
  "student_id" integer  NOT NULL,
  "status" text DEFAULT 'absent'::text NOT NULL,
  "check_in_time" timestamp without time zone,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_attendance_session_student" UNIQUE ("session_id", "student_id")
);
CREATE TABLE IF NOT EXISTS public."attendance_audit_log" (
  "id" integer DEFAULT nextval('attendance_audit_log_id_seq'::regclass) NOT NULL,
  "session_id" integer,
  "user_id" integer  NOT NULL,
  "action_type" text  NOT NULL,
  "target_user_id" integer,
  "old_status" text,
  "new_status" text,
  "access_code" character varying(8),
  "ip_address" inet,
  "user_agent" text,
  "details" jsonb,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."attendance_records" (
  "id" integer DEFAULT nextval('attendance_records_id_seq'::regclass) NOT NULL,
  "session_id" integer  NOT NULL,
  "student_id" integer  NOT NULL,
  "batch_id" integer  NOT NULL,
  "status" text DEFAULT 'absent'::text NOT NULL,
  "marked_at" timestamp without time zone,
  "code_entered_at" timestamp without time zone,
  "entered_code" character varying(8),
  "ip_address" inet,
  "user_agent" text,
  "notes" text,
  "marked_by" integer,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_attendance_records_session_student" UNIQUE ("session_id", "student_id")
);
CREATE TABLE IF NOT EXISTS public."attendance_settings" (
  "id" integer DEFAULT nextval('attendance_settings_id_seq'::regclass) NOT NULL,
  "setting_key" character varying(100)  NOT NULL,
  "setting_value" text  NOT NULL,
  "description" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "attendance_settings_setting_key_key" UNIQUE ("setting_key")
);
CREATE TABLE IF NOT EXISTS public."batch_students" (
  "id" integer DEFAULT nextval('batch_students_id_seq'::regclass) NOT NULL,
  "batch_id" integer  NOT NULL,
  "student_id" integer  NOT NULL,
  "enrolled_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_batch_students_1" UNIQUE ("batch_id", "student_id")
);
CREATE TABLE IF NOT EXISTS public."batch_timetables" (
  "id" integer DEFAULT nextval('batch_timetables_id_seq'::regclass) NOT NULL,
  "batch_id" integer  NOT NULL,
  "day_of_week" integer  NOT NULL,
  "start_time" text  NOT NULL,
  "end_time" text  NOT NULL,
  "timezone" text DEFAULT 'UTC'::text NOT NULL,
  "location_mode" text DEFAULT 'online'::text NOT NULL,
  "location" text,
  "link" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."batches" (
  "id" integer DEFAULT nextval('batches_id_seq'::regclass) NOT NULL,
  "name" character varying(100)  NOT NULL,
  "teacher_id" integer  NOT NULL,
  "french_level" character varying(20)  NOT NULL,
  "start_date" timestamp without time zone  NOT NULL,
  "end_date" timestamp without time zone  NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "default_location_mode" text DEFAULT 'online'::text,
  "timezone" text DEFAULT 'UTC'::text,
  "default_location" text,
  "default_link" text,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."class_schedules" (
  "id" integer DEFAULT nextval('class_schedules_id_seq'::regclass) NOT NULL,
  "batch_id" integer  NOT NULL,
  "title" character varying(200)  NOT NULL,
  "description" text,
  "start_time" timestamp without time zone  NOT NULL,
  "end_time" timestamp without time zone  NOT NULL,
  "location" character varying(200),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."class_sessions" (
  "id" integer DEFAULT nextval('class_sessions_id_seq'::regclass) NOT NULL,
  "schedule_id" integer  NOT NULL,
  "batch_id" integer  NOT NULL,
  "teacher_id" integer  NOT NULL,
  "session_date" date  NOT NULL,
  "start_time" timestamp without time zone  NOT NULL,
  "end_time" timestamp without time zone  NOT NULL,
  "access_code" character varying(8),
  "code_generated_at" timestamp without time zone,
  "code_expires_at" timestamp without time zone,
  "session_started_at" timestamp without time zone,
  "session_ended_at" timestamp without time zone,
  "status" text DEFAULT 'scheduled'::text NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_class_sessions_schedule_date" UNIQUE ("schedule_id", "session_date")
);
CREATE TABLE IF NOT EXISTS public."email_change_requests" (
  "id" integer DEFAULT nextval('email_change_requests_id_seq'::regclass) NOT NULL,
  "user_id" integer  NOT NULL,
  "old_email" text  NOT NULL,
  "new_email" text  NOT NULL,
  "code" text  NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 3 NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "expires_at" timestamp without time zone  NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."migrations" (
  "id" integer DEFAULT nextval('migrations_id_seq'::regclass) NOT NULL,
  "filename" text  NOT NULL,
  "applied_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_migrations_1" UNIQUE ("filename")
);
CREATE TABLE IF NOT EXISTS public."password_reset_requests" (
  "id" integer DEFAULT nextval('password_reset_requests_id_seq'::regclass) NOT NULL,
  "user_id" integer  NOT NULL,
  "email" text  NOT NULL,
  "code" text  NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 3 NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "expires_at" timestamp without time zone  NOT NULL,
  "reset_token_hash" text,
  "reset_expires_at" timestamp without time zone,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."question_options" (
  "id" integer DEFAULT nextval('question_options_id_seq'::regclass) NOT NULL,
  "question_id" integer  NOT NULL,
  "option_text" text  NOT NULL,
  "option_order" integer  NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "is_correct" boolean DEFAULT false,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."questions" (
  "id" integer DEFAULT nextval('questions_id_seq'::regclass) NOT NULL,
  "quiz_id" integer  NOT NULL,
  "question_text" text  NOT NULL,
  "question_type" text  NOT NULL,
  "question_order" integer  NOT NULL,
  "marks" numeric DEFAULT 1,
  "correct_answer" text,
  "explanation" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."quiz_batches" (
  "id" integer DEFAULT nextval('quiz_batches_id_seq'::regclass) NOT NULL,
  "quiz_id" integer  NOT NULL,
  "batch_id" integer  NOT NULL,
  "assigned_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_quiz_batches_1" UNIQUE ("quiz_id", "batch_id")
);
CREATE TABLE IF NOT EXISTS public."quiz_reminders_sent" (
  "id" integer DEFAULT nextval('quiz_reminders_sent_id_seq'::regclass) NOT NULL,
  "quiz_id" integer  NOT NULL,
  "sent_at" timestamp without time zone  NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."quiz_submissions" (
  "id" integer DEFAULT nextval('quiz_submissions_id_seq'::regclass) NOT NULL,
  "quiz_id" integer  NOT NULL,
  "student_id" integer  NOT NULL,
  "status" text DEFAULT 'not_started'::text,
  "started_at" timestamp without time zone,
  "submitted_at" timestamp without time zone,
  "time_taken_minutes" integer,
  "total_score" numeric DEFAULT 0,
  "max_score" numeric DEFAULT 0,
  "percentage" numeric(5,2) DEFAULT 0,
  "auto_saved_data" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "started_at_utc" timestamp without time zone,
  "submitted_at_utc" timestamp without time zone,
  "auto_submit_at_utc" timestamp without time zone,
  "server_time_offset_minutes" integer DEFAULT 0,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_quiz_submissions_1" UNIQUE ("quiz_id", "student_id")
);
CREATE TABLE IF NOT EXISTS public."quizzes" (
  "id" integer DEFAULT nextval('quizzes_id_seq'::regclass) NOT NULL,
  "title" character varying(200)  NOT NULL,
  "description" text,
  "teacher_id" integer  NOT NULL,
  "status" text DEFAULT 'draft'::text,
  "start_date" timestamp without time zone,
  "end_date" timestamp without time zone,
  "duration_minutes" integer,
  "total_marks" numeric DEFAULT 0,
  "instructions" text,
  "randomize_questions" boolean DEFAULT false,
  "randomize_options" boolean DEFAULT false,
  "auto_submit" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."resources" (
  "id" integer DEFAULT nextval('resources_id_seq'::regclass) NOT NULL,
  "title" text  NOT NULL,
  "description" text,
  "file_name" text  NOT NULL,
  "file_path" text  NOT NULL,
  "file_type" text  NOT NULL,
  "file_size" integer  NOT NULL,
  "teacher_id" integer  NOT NULL,
  "batch_id" integer,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."schedules" (
  "id" integer DEFAULT nextval('schedules_id_seq'::regclass) NOT NULL,
  "title" text  NOT NULL,
  "description" text,
  "start_time" timestamp without time zone  NOT NULL,
  "end_time" timestamp without time zone  NOT NULL,
  "type" text  NOT NULL,
  "batch_id" integer  NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "location_mode" text DEFAULT 'online'::text NOT NULL,
  "location" text,
  "link" text,
  "status" text DEFAULT 'scheduled'::text NOT NULL,
  "teacher_id" integer,
  "subject" text,
  "topic" text,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS public."student_answers" (
  "id" integer DEFAULT nextval('student_answers_id_seq'::regclass) NOT NULL,
  "submission_id" integer  NOT NULL,
  "question_id" integer  NOT NULL,
  "answer_text" text,
  "selected_options" text,
  "marks_awarded" numeric DEFAULT 0,
  "is_correct" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_student_answers_1" UNIQUE ("submission_id", "question_id")
);
CREATE TABLE IF NOT EXISTS public."teacher_attendance" (
  "id" integer DEFAULT nextval('teacher_attendance_id_seq'::regclass) NOT NULL,
  "session_id" integer  NOT NULL,
  "teacher_id" integer  NOT NULL,
  "batch_id" integer  NOT NULL,
  "status" text DEFAULT 'absent'::text NOT NULL,
  "code_generated" boolean DEFAULT false,
  "session_started" boolean DEFAULT false,
  "marked_at" timestamp without time zone,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_teacher_attendance_session_teacher" UNIQUE ("session_id", "teacher_id")
);
CREATE TABLE IF NOT EXISTS public."user_batches" (
  "id" integer DEFAULT nextval('user_batches_id_seq'::regclass) NOT NULL,
  "user_id" integer  NOT NULL,
  "batch_id" integer  NOT NULL,
  "enrolled_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_user_batches_1" UNIQUE ("user_id", "batch_id")
);
CREATE TABLE IF NOT EXISTS public."users" (
  "id" integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  "username" character varying(50)  NOT NULL,
  "email" character varying(100)  NOT NULL,
  "password_hash" character varying(255)  NOT NULL,
  "role" text  NOT NULL,
  "first_name" character varying(50)  NOT NULL,
  "last_name" character varying(50)  NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "must_change_password" integer DEFAULT 0 NOT NULL,
  "password_changed_at" timestamp without time zone,
  "password_expires_at" timestamp without time zone,
  "is_active" boolean DEFAULT true,
  "failed_login_attempts" integer DEFAULT 0,
  "last_failed_login" timestamp without time zone,
  "account_locked_until" timestamp without time zone,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_users_1" UNIQUE ("username"),
  CONSTRAINT "uk_users_2" UNIQUE ("email")
);

-- Foreign keys
ALTER TABLE public."attendance" ADD CONSTRAINT "fk_attendance_session_id" FOREIGN KEY ("session_id") REFERENCES public."class_sessions" ("id") ON DELETE CASCADE;
ALTER TABLE public."attendance" ADD CONSTRAINT "fk_attendance_student_id" FOREIGN KEY ("student_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."attendance_audit_log" ADD CONSTRAINT "fk_attendance_audit_session_id" FOREIGN KEY ("session_id") REFERENCES public."class_sessions" ("id") ON DELETE SET NULL;
ALTER TABLE public."attendance_audit_log" ADD CONSTRAINT "fk_attendance_audit_target_user_id" FOREIGN KEY ("target_user_id") REFERENCES public."users" ("id") ON DELETE SET NULL;
ALTER TABLE public."attendance_audit_log" ADD CONSTRAINT "fk_attendance_audit_user_id" FOREIGN KEY ("user_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."attendance_records" ADD CONSTRAINT "fk_attendance_records_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."attendance_records" ADD CONSTRAINT "fk_attendance_records_marked_by" FOREIGN KEY ("marked_by") REFERENCES public."users" ("id") ON DELETE SET NULL;
ALTER TABLE public."attendance_records" ADD CONSTRAINT "fk_attendance_records_session_id" FOREIGN KEY ("session_id") REFERENCES public."class_sessions" ("id") ON DELETE CASCADE;
ALTER TABLE public."attendance_records" ADD CONSTRAINT "fk_attendance_records_student_id" FOREIGN KEY ("student_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."batch_students" ADD CONSTRAINT "fk_batch_students_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."batch_students" ADD CONSTRAINT "fk_batch_students_student_id" FOREIGN KEY ("student_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."batch_timetables" ADD CONSTRAINT "fk_batch_timetables_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."batches" ADD CONSTRAINT "fk_batches_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."class_schedules" ADD CONSTRAINT "fk_class_schedules_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."class_sessions" ADD CONSTRAINT "fk_class_sessions_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."class_sessions" ADD CONSTRAINT "fk_class_sessions_schedule_id" FOREIGN KEY ("schedule_id") REFERENCES public."schedules" ("id") ON DELETE CASCADE;
ALTER TABLE public."class_sessions" ADD CONSTRAINT "fk_class_sessions_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."email_change_requests" ADD CONSTRAINT "fk_email_change_requests_user_id" FOREIGN KEY ("user_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."password_reset_requests" ADD CONSTRAINT "fk_password_reset_requests_user_id" FOREIGN KEY ("user_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."question_options" ADD CONSTRAINT "fk_question_options_question_id" FOREIGN KEY ("question_id") REFERENCES public."questions" ("id") ON DELETE CASCADE;
ALTER TABLE public."questions" ADD CONSTRAINT "fk_questions_quiz_id" FOREIGN KEY ("quiz_id") REFERENCES public."quizzes" ("id") ON DELETE CASCADE;
ALTER TABLE public."quiz_batches" ADD CONSTRAINT "fk_quiz_batches_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."quiz_batches" ADD CONSTRAINT "fk_quiz_batches_quiz_id" FOREIGN KEY ("quiz_id") REFERENCES public."quizzes" ("id") ON DELETE CASCADE;
ALTER TABLE public."quiz_reminders_sent" ADD CONSTRAINT "fk_quiz_reminders_sent_quiz_id" FOREIGN KEY ("quiz_id") REFERENCES public."quizzes" ("id") ON DELETE CASCADE;
ALTER TABLE public."quiz_submissions" ADD CONSTRAINT "fk_quiz_submissions_quiz_id" FOREIGN KEY ("quiz_id") REFERENCES public."quizzes" ("id") ON DELETE CASCADE;
ALTER TABLE public."quiz_submissions" ADD CONSTRAINT "fk_quiz_submissions_student_id" FOREIGN KEY ("student_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."quizzes" ADD CONSTRAINT "fk_quizzes_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."resources" ADD CONSTRAINT "fk_resources_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."resources" ADD CONSTRAINT "fk_resources_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."schedules" ADD CONSTRAINT "fk_schedules_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."schedules" ADD CONSTRAINT "fk_schedules_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES public."users" ("id") ON DELETE SET NULL;
ALTER TABLE public."student_answers" ADD CONSTRAINT "fk_student_answers_question_id" FOREIGN KEY ("question_id") REFERENCES public."questions" ("id") ON DELETE CASCADE;
ALTER TABLE public."student_answers" ADD CONSTRAINT "fk_student_answers_submission_id" FOREIGN KEY ("submission_id") REFERENCES public."quiz_submissions" ("id") ON DELETE CASCADE;
ALTER TABLE public."teacher_attendance" ADD CONSTRAINT "fk_teacher_attendance_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."teacher_attendance" ADD CONSTRAINT "fk_teacher_attendance_session_id" FOREIGN KEY ("session_id") REFERENCES public."class_sessions" ("id") ON DELETE CASCADE;
ALTER TABLE public."teacher_attendance" ADD CONSTRAINT "fk_teacher_attendance_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES public."users" ("id") ON DELETE CASCADE;
ALTER TABLE public."user_batches" ADD CONSTRAINT "fk_user_batches_batch_id" FOREIGN KEY ("batch_id") REFERENCES public."batches" ("id") ON DELETE CASCADE;
ALTER TABLE public."user_batches" ADD CONSTRAINT "fk_user_batches_user_id" FOREIGN KEY ("user_id") REFERENCES public."users" ("id") ON DELETE CASCADE;

-- Indexes
CREATE UNIQUE INDEX attendance_pkey ON public.attendance USING btree (id);
CREATE UNIQUE INDEX uk_attendance_session_student ON public.attendance USING btree (session_id, student_id);
CREATE INDEX idx_attendance_session_id ON public.attendance USING btree (session_id);
CREATE INDEX idx_attendance_student_id ON public.attendance USING btree (student_id);
CREATE UNIQUE INDEX attendance_audit_log_pkey ON public.attendance_audit_log USING btree (id);
CREATE INDEX idx_attendance_audit_session ON public.attendance_audit_log USING btree (session_id);
CREATE INDEX idx_attendance_audit_user ON public.attendance_audit_log USING btree (user_id);
CREATE INDEX idx_attendance_audit_action ON public.attendance_audit_log USING btree (action_type);
CREATE INDEX idx_attendance_audit_date ON public.attendance_audit_log USING btree (created_at);
CREATE UNIQUE INDEX attendance_records_pkey ON public.attendance_records USING btree (id);
CREATE UNIQUE INDEX uk_attendance_records_session_student ON public.attendance_records USING btree (session_id, student_id);
CREATE INDEX idx_attendance_records_session ON public.attendance_records USING btree (session_id);
CREATE INDEX idx_attendance_records_student ON public.attendance_records USING btree (student_id);
CREATE INDEX idx_attendance_records_batch ON public.attendance_records USING btree (batch_id);
CREATE INDEX idx_attendance_records_status ON public.attendance_records USING btree (status);
CREATE INDEX idx_attendance_records_date ON public.attendance_records USING btree (created_at);
CREATE UNIQUE INDEX attendance_settings_pkey ON public.attendance_settings USING btree (id);
CREATE UNIQUE INDEX attendance_settings_setting_key_key ON public.attendance_settings USING btree (setting_key);
CREATE UNIQUE INDEX batch_students_pkey ON public.batch_students USING btree (id);
CREATE UNIQUE INDEX uk_batch_students_1 ON public.batch_students USING btree (batch_id, student_id);
CREATE INDEX idx_batch_students_batch ON public.batch_students USING btree (batch_id);
CREATE INDEX idx_batch_students_student ON public.batch_students USING btree (student_id);
CREATE UNIQUE INDEX batch_timetables_pkey ON public.batch_timetables USING btree (id);
CREATE INDEX idx_batch_timetables_active ON public.batch_timetables USING btree (is_active);
CREATE INDEX idx_batch_timetables_batch_day ON public.batch_timetables USING btree (batch_id, day_of_week);
CREATE INDEX idx_batch_timetables_day ON public.batch_timetables USING btree (day_of_week);
CREATE INDEX idx_batch_timetables_batch ON public.batch_timetables USING btree (batch_id);
CREATE UNIQUE INDEX batches_pkey ON public.batches USING btree (id);
CREATE INDEX idx_batches_teacher ON public.batches USING btree (teacher_id);
CREATE UNIQUE INDEX class_schedules_pkey ON public.class_schedules USING btree (id);
CREATE INDEX idx_class_schedules_batch ON public.class_schedules USING btree (batch_id);
CREATE UNIQUE INDEX class_sessions_pkey ON public.class_sessions USING btree (id);
CREATE UNIQUE INDEX uk_class_sessions_schedule_date ON public.class_sessions USING btree (schedule_id, session_date);
CREATE INDEX idx_class_sessions_schedule_date ON public.class_sessions USING btree (schedule_id, session_date);
CREATE INDEX idx_class_sessions_batch_teacher ON public.class_sessions USING btree (batch_id, teacher_id);
CREATE INDEX idx_class_sessions_status ON public.class_sessions USING btree (status);
CREATE INDEX idx_class_sessions_date_range ON public.class_sessions USING btree (session_date, start_time);
CREATE INDEX idx_class_sessions_schedule_id ON public.class_sessions USING btree (schedule_id);
CREATE INDEX idx_class_sessions_batch_id ON public.class_sessions USING btree (batch_id);
CREATE INDEX idx_class_sessions_teacher_id ON public.class_sessions USING btree (teacher_id);
CREATE UNIQUE INDEX email_change_requests_pkey ON public.email_change_requests USING btree (id);
CREATE INDEX idx_ecr_user_code ON public.email_change_requests USING btree (user_id, code);
CREATE INDEX idx_ecr_expires ON public.email_change_requests USING btree (expires_at);
CREATE INDEX idx_ecr_user_status ON public.email_change_requests USING btree (user_id, status);
CREATE UNIQUE INDEX migrations_pkey ON public.migrations USING btree (id);
CREATE UNIQUE INDEX uk_migrations_1 ON public.migrations USING btree (filename);
CREATE UNIQUE INDEX password_reset_requests_pkey ON public.password_reset_requests USING btree (id);
CREATE INDEX idx_prr_user_code ON public.password_reset_requests USING btree (user_id, code);
CREATE INDEX idx_prr_expires ON public.password_reset_requests USING btree (expires_at);
CREATE INDEX idx_prr_user_status ON public.password_reset_requests USING btree (user_id, status);
CREATE UNIQUE INDEX question_options_pkey ON public.question_options USING btree (id);
CREATE INDEX idx_question_options_question_order ON public.question_options USING btree (question_id, option_order);
CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);
CREATE INDEX idx_questions_quiz_order ON public.questions USING btree (quiz_id, question_order);
CREATE INDEX idx_questions_quiz ON public.questions USING btree (quiz_id);
CREATE UNIQUE INDEX quiz_batches_pkey ON public.quiz_batches USING btree (id);
CREATE UNIQUE INDEX uk_quiz_batches_1 ON public.quiz_batches USING btree (quiz_id, batch_id);
CREATE INDEX idx_quiz_batches_batch ON public.quiz_batches USING btree (batch_id);
CREATE UNIQUE INDEX quiz_reminders_sent_pkey ON public.quiz_reminders_sent USING btree (id);
CREATE UNIQUE INDEX idx_quiz_reminders_unique ON public.quiz_reminders_sent USING btree (quiz_id);
CREATE INDEX idx_quiz_reminders_sent_at ON public.quiz_reminders_sent USING btree (sent_at);
CREATE INDEX idx_quiz_reminders_quiz ON public.quiz_reminders_sent USING btree (quiz_id);
CREATE UNIQUE INDEX quiz_submissions_pkey ON public.quiz_submissions USING btree (id);
CREATE UNIQUE INDEX uk_quiz_submissions_1 ON public.quiz_submissions USING btree (quiz_id, student_id);
CREATE INDEX idx_submissions_quiz_submitted ON public.quiz_submissions USING btree (quiz_id, submitted_at);
CREATE INDEX idx_submissions_student_submitted ON public.quiz_submissions USING btree (student_id, submitted_at);
CREATE INDEX idx_submissions_quiz_status ON public.quiz_submissions USING btree (quiz_id, status);
CREATE INDEX idx_submissions_status ON public.quiz_submissions USING btree (status);
CREATE INDEX idx_quiz_submissions_started_utc ON public.quiz_submissions USING btree (started_at_utc);
CREATE INDEX idx_quiz_submissions_auto_submit_utc ON public.quiz_submissions USING btree (auto_submit_at_utc);
CREATE INDEX idx_submissions_student ON public.quiz_submissions USING btree (student_id);
CREATE INDEX idx_submissions_quiz ON public.quiz_submissions USING btree (quiz_id);
CREATE UNIQUE INDEX quizzes_pkey ON public.quizzes USING btree (id);
CREATE INDEX idx_quizzes_status_created ON public.quizzes USING btree (status, created_at);
CREATE INDEX idx_quizzes_teacher_created ON public.quizzes USING btree (teacher_id, created_at);
CREATE INDEX idx_quizzes_teacher_status ON public.quizzes USING btree (teacher_id, status);
CREATE INDEX idx_quizzes_status ON public.quizzes USING btree (status);
CREATE INDEX idx_quizzes_teacher ON public.quizzes USING btree (teacher_id);
CREATE UNIQUE INDEX resources_pkey ON public.resources USING btree (id);
CREATE INDEX idx_resources_teacher_created ON public.resources USING btree (teacher_id, created_at);
CREATE INDEX idx_resources_teacher ON public.resources USING btree (teacher_id);
CREATE INDEX idx_resources_batch ON public.resources USING btree (batch_id);
CREATE UNIQUE INDEX schedules_pkey ON public.schedules USING btree (id);
CREATE INDEX idx_schedules_batch_start ON public.schedules USING btree (batch_id, start_time);
CREATE INDEX idx_schedules_teacher_id ON public.schedules USING btree (teacher_id);
CREATE UNIQUE INDEX student_answers_pkey ON public.student_answers USING btree (id);
CREATE UNIQUE INDEX uk_student_answers_1 ON public.student_answers USING btree (submission_id, question_id);
CREATE INDEX idx_answers_question ON public.student_answers USING btree (question_id);
CREATE INDEX idx_answers_submission ON public.student_answers USING btree (submission_id);
CREATE UNIQUE INDEX teacher_attendance_pkey ON public.teacher_attendance USING btree (id);
CREATE UNIQUE INDEX uk_teacher_attendance_session_teacher ON public.teacher_attendance USING btree (session_id, teacher_id);
CREATE INDEX idx_teacher_attendance_session ON public.teacher_attendance USING btree (session_id);
CREATE INDEX idx_teacher_attendance_teacher ON public.teacher_attendance USING btree (teacher_id);
CREATE INDEX idx_teacher_attendance_status ON public.teacher_attendance USING btree (status);
CREATE UNIQUE INDEX user_batches_pkey ON public.user_batches USING btree (id);
CREATE UNIQUE INDEX uk_user_batches_1 ON public.user_batches USING btree (user_id, batch_id);
CREATE INDEX idx_user_batches_user_id ON public.user_batches USING btree (user_id);
CREATE INDEX idx_user_batches_batch_id ON public.user_batches USING btree (batch_id);
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);
CREATE UNIQUE INDEX uk_users_2 ON public.users USING btree (email);
CREATE UNIQUE INDEX uk_users_1 ON public.users USING btree (username);
CREATE INDEX idx_users_failed_attempts ON public.users USING btree (failed_login_attempts);
CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);
CREATE INDEX idx_users_role_name ON public.users USING btree (role, first_name, last_name);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE INDEX idx_users_email ON public.users USING btree (email);
