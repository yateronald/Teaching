import React, { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ExamGoalEditor from './ExamGoalEditor';
import { useTr } from '../../utils/useTr';
import { EXAM_LABEL, daysUntil, longDate, type Goal } from './candidateModel';

/** Profile section for exam candidates: the exam, the target level and the exam date. */
const ExamGoalSection: React.FC = () => {
    const { apiCall } = useAuth();
    const { tr, locale } = useTr();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        apiCall('/exam-space/goal')
            .then(r => (r.ok ? r.json() : null))
            .then(g => { if (!cancelled) setGoal(g); })
            .catch(() => { /* the form still works with defaults */ })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [apiCall]);

    const days = daysUntil(goal?.exam_date);
    return (
        <section className="tc-card pf-section" id="pf-exam-goal">
            <header className="pf-section-head">
                <span className="pf-section-ic is-teal"><AimOutlined /></span>
                <div>
                    <h3>{tr('Exam goal', 'Objectif d’examen')}</h3>
                    <p>
                        {goal?.exam_date && days != null && days >= 0
                            ? tr(`${EXAM_LABEL[goal.target_exam]} on ${longDate(goal.exam_date, locale)} — ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}.`,
                                `${EXAM_LABEL[goal.target_exam]} le ${longDate(goal.exam_date, locale)} — ${days === 0 ? 'aujourd’hui' : `dans ${days} jour${days === 1 ? '' : 's'}`}.`)
                            : tr('Your dashboard measures your progress against this goal.', 'Votre tableau de bord mesure vos progrès par rapport à cet objectif.')}
                    </p>
                </div>
            </header>
            <div className="pf-goal">
                {loading ? <Skeleton active paragraph={{ rows: 2 }} />
                    : <ExamGoalEditor key={JSON.stringify(goal)} goal={goal} onSaved={setGoal} submitLabel={tr('Save goal', 'Enregistrer')} />}
            </div>
        </section>
    );
};

export default ExamGoalSection;
