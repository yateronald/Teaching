import React, { useState } from 'react';
import { Button, DatePicker, Form, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { EXAM_LABEL, NCLC_NOTE, NCLC_OPTIONS, type ExamTarget, type Goal } from './candidateModel';
import './Candidate.css';

interface Props {
    goal: Goal | null;
    onSaved: (goal: Goal) => void;
    onCancel?: () => void;
    submitLabel?: string;
}

interface Values { target_exam: ExamTarget; target_nclc: number | null; exam_date: Dayjs | null }

/** Target exam, target NCLC level and exam date — what the whole exam space measures against. */
const ExamGoalEditor: React.FC<Props> = ({ goal, onSaved, onCancel, submitLabel = 'Save my goal' }) => {
    const { apiCall } = useAuth();
    const [form] = Form.useForm<Values>();
    const [saving, setSaving] = useState(false);
    const target = Form.useWatch('target_nclc', form);

    const save = async (v: Values) => {
        setSaving(true);
        try {
            const res = await apiCall('/exam-space/goal', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_exam: v.target_exam,
                    target_nclc: v.target_nclc ?? null,
                    exam_date: v.exam_date ? v.exam_date.format('YYYY-MM-DD') : null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Your goal could not be saved.');
            message.success('Your exam goal is saved.');
            onSaved(data as Goal);
        } catch (e) {
            message.error((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Form<Values>
            form={form}
            layout="vertical"
            requiredMark={false}
            className="cx-goal-form"
            initialValues={{
                target_exam: goal?.target_exam || 'tcf_canada',
                target_nclc: goal?.target_nclc ?? null,
                exam_date: goal?.exam_date ? dayjs(goal.exam_date) : null,
            }}
            onFinish={save}
        >
            <Form.Item name="target_exam" label="Exam">
                <Select options={Object.entries(EXAM_LABEL).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
            <div className="cx-goal-grid">
                <Form.Item name="target_nclc" label="Target level" extra={target ? NCLC_NOTE[target] : 'The level your project requires.'}>
                    <Select allowClear placeholder="Choose a level" options={NCLC_OPTIONS.map(n => ({ value: n, label: `NCLC ${n}` }))} />
                </Form.Item>
                <Form.Item name="exam_date" label="Exam date" extra="Leave empty if it is not booked yet.">
                    <DatePicker
                        className="cx-full"
                        format="D MMM YYYY"
                        placeholder="Choose a date"
                        disabledDate={d => d.isBefore(dayjs().startOf('day'))}
                        inputReadOnly
                    />
                </Form.Item>
            </div>
            <div className="cx-goal-actions">
                {onCancel && <Button onClick={onCancel} disabled={saving}>Cancel</Button>}
                <Button type="primary" htmlType="submit" loading={saving}>{submitLabel}</Button>
            </div>
        </Form>
    );
};

export default ExamGoalEditor;
