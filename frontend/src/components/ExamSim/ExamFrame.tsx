import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { clock } from './examModel';
import './ExamSim.css';

export interface FrameStep { key: string | number; label: string; state: 'done' | 'current' | 'todo' }
interface Props {
  skill: 'eo' | 'ee';
  title: string;
  subtitle?: string;
  steps?: FrameStep[];
  /** Seconds left; `total` drives the thin progress line under the bar. */
  timer?: { seconds: number; total: number; label?: string } | null;
  right?: React.ReactNode;
  onExit: () => void;
  exitLabel?: string;
  children: React.ReactNode;
}

/** Full-screen exam room: a quiet top bar and one scrolling stage. */
export default function ExamFrame({ skill, title, subtitle, steps, timer, right, onExit, exitLabel = 'Quitter', children }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const urgency = timer ? (timer.seconds <= 10 ? ' is-critical' : timer.seconds <= Math.min(60, timer.total * 0.15) ? ' is-warn' : '') : '';
  return createPortal(
    <div className={`xs-root xs-${skill}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="xs-bar">
        <div className="xs-bar-id">
          <span className="xs-mark-logo" aria-hidden>{skill === 'eo' ? 'EO' : 'EE'}</span>
          <div>
            <strong>{title}</strong>
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>
        {steps && steps.length > 0 && (
          <ol className="xs-steps" aria-label="Progression">
            {steps.map((s, i) => (
              <li key={s.key} className={`is-${s.state}`} aria-current={s.state === 'current' ? 'step' : undefined}>
                <span className="xs-step-dot">{s.state === 'done' ? '✓' : i + 1}</span>
                <span className="xs-step-label">{s.label}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="xs-bar-end">
          {timer && (
            <div className={`xs-timer${urgency}`} role="timer" aria-live="off">
              <span>{timer.label || 'Temps restant'}</span>
              <strong>{clock(timer.seconds)}</strong>
            </div>
          )}
          {right}
          <Tooltip title={exitLabel}>
            <Button type="text" className="xs-exit" icon={<CloseOutlined />} onClick={onExit} aria-label={exitLabel} />
          </Tooltip>
        </div>
        {timer && <span className={`xs-bar-progress${urgency}`} style={{ width: `${Math.max(0, Math.min(100, (timer.seconds / Math.max(1, timer.total)) * 100))}%` }} aria-hidden />}
      </header>
      <main className="xs-stage">{children}</main>
    </div>,
    document.body,
  );
}
