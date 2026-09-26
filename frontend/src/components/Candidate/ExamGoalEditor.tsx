import React, { useState } from 'react';
import { Button, DatePicker, Form, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { EXAM_LABEL, NCLC_OPTIONS, nclcNote, type ExamTarget, type Goal } from './candidateModel';
import './Candidate.css';

interface Props {
    goal: Goal | null;
    onSaved: (goal: Goal) => void;
    onCancel?: () => void;
    submitLabel?: string;
}

interface Values { target_exam: ExamTarget; target_nclc: number | null; exam_date: Dayjs | null }

/** Target exam, target NCLC level and exam date — what the whole exam space measures against. */
const ExamGoalEditor: React.FC<Props> = ({ goal, onSaved, onCancel, submitLabel }) => {
    const { apiCall } = useAuth();
    const { tr, lang } = useTr();
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
            if (!res.ok) throw new Error(data.error || tr('Your goal could not be saved.', 'Votre objectif n’a pas pu être enregistré.'));
            message.success(tr('Your exam goal is saved.', 'Votre objectif d’examen est enregistré.'));
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
            <Form.Item name="target_exam" label={tr('Exam', 'Examen')}>
                <Select options={Object.entries(EXAM_LABEL).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
            <div className="cx-goal-grid">
                <Form.Item name="target_nclc" label={tr('Target level', 'Niveau visé')} extra={target ? nclcNote(target, lang) : tr('The level your project requires.', 'Le niveau exigé par votre projet.')}>
                    <Select allowClear placeholder={tr('Choose a level', 'Choisissez un niveau')} options={NCLC_OPTIONS.map(n => ({ value: n, label: `NCLC ${n}` }))} />
                </Form.Item>
                <Form.Item name="exam_date" label={tr('Exam date', 'Date de l’examen')} extra={tr('Leave empty if it is not booked yet.', 'Laissez vide si elle n’est pas encore réservée.')}>
                    <DatePicker
                        className="cx-full"
                        format="D MMM YYYY"
                        placeholder={tr('Choose a date', 'Choisissez une date')}
                        disabledDate={d => d.isBefore(dayjs().startOf('day'))}
                        inputReadOnly
                    />
                </Form.Item>
            </div>
            <div className="cx-goal-actions">
                {onCancel && <Button onClick={onCancel} disabled={saving}>{tr('Cancel', 'Annuler')}</Button>}
                <Button type="primary" htmlType="submit" loading={saving}>{submitLabel || tr('Save my goal', 'Enregistrer mon objectif')}</Button>
            </div>
        </Form>
    );
};

export default ExamGoalEditor;
