import React from 'react';
import { Modal } from 'antd';
import { ThunderboltFilled, MailOutlined, FormOutlined, AudioOutlined } from '@ant-design/icons';

interface OutOfCreditsModalProps {
  open: boolean;
  type: 'ee' | 'eo' | null;
  onClose: () => void;
}

const SUPPORT_EMAIL = 'support@learnfrenchwithnatives.com';

const OutOfCreditsModal: React.FC<OutOfCreditsModalProps> = ({ open, type, onClose }) => {
  const isEE = type === 'ee';
  const accent = isEE ? '#f43f5e' : '#10b981';
  const accentLight = isEE ? '#fb7185' : '#34d399';
  const accentBg = isEE ? 'rgba(244,63,94,0.10)' : 'rgba(16,185,129,0.10)';
  const skillName = isEE ? 'Expression Écrite' : 'Expression Orale';
  const skillIcon = isEE ? <FormOutlined /> : <AudioOutlined />;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      closable={false}
      maskClosable={true}
      className="exam-modal"
      styles={{
        body: { padding: 0 },
        content: {
          padding: 0, borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 30px 60px -20px rgba(15,23,42,0.35), 0 12px 24px -8px rgba(15,23,42,0.18)',
        },
      }}
    >
      <div style={{ position: 'relative', background: '#fff', borderRadius: 20 }}>
        {/* Decorative header band with accent gradient */}
        <div style={{
          position: 'relative',
          height: 160,
          background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
          overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
          }} />
          <div style={{
            position: 'absolute', bottom: -50, left: -30,
            width: 140, height: 140, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />

          {/* Glassy circular icon centered */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 88, height: 88, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 28px -6px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <ThunderboltFilled style={{ fontSize: 38, color: '#fff' }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '36px 40px 32px', textAlign: 'center' }}>
          {/* Skill pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px',
            background: accentBg,
            border: `1px solid ${accent}30`,
            borderRadius: 100,
            color: accent,
            fontSize: 11.5, fontWeight: 700,
            letterSpacing: 0.6, textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            {skillIcon}
            {skillName}
          </div>

          {/* Title */}
          <h2 style={{
            margin: 0, marginBottom: 10,
            fontSize: 22, fontWeight: 800,
            color: '#0f172a', letterSpacing: -0.4,
            fontFamily: '"Manrope", "Inter", sans-serif',
          }}>
            You're out of credits
          </h2>

          {/* Subtitle */}
          <p style={{
            margin: 0, marginBottom: 24,
            fontSize: 14.5, lineHeight: 1.6,
            color: '#64748b', fontWeight: 500,
            maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
          }}>
            You've used all your <strong style={{ color: '#0f172a' }}>{skillName}</strong> AI credits.
            Each attempt uses one credit — please contact your administrator to add more.
          </p>

          {/* Info bullet list */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 22,
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: '#475569',
              letterSpacing: 0.8, textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              How credits work
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '✓', text: 'Each AI-graded attempt consumes 1 credit' },
                { icon: '✓', text: 'Credits never expire — they stay until used' },
                { icon: '✓', text: 'Your administrator can add credits anytime' },
              ].map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155' }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: accent,
                    color: '#fff', fontSize: 10, fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Request more ${skillName} credits`)}&body=${encodeURIComponent(`Hello,\n\nI'd like to request more ${skillName} credits to continue practicing on the platform.\n\nThank you.`)}`}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px 28px',
                background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
                color: '#fff', textDecoration: 'none',
                borderRadius: 100,
                fontSize: 14, fontWeight: 700,
                letterSpacing: -0.1,
                boxShadow: `0 10px 22px -8px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.2)`,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                fontFamily: '"Manrope", "Inter", sans-serif',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 14px 28px -8px ${accent}80, inset 0 1px 0 rgba(255,255,255,0.25)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 10px 22px -8px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.2)`;
              }}
            >
              <MailOutlined /> Email administrator
            </a>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: '#64748b',
                border: 'none',
                borderRadius: 100,
                fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer',
                fontFamily: '"Manrope", "Inter", sans-serif',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              Maybe later
            </button>
          </div>

          {/* Support email line */}
          <div style={{
            marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9',
            fontSize: 11.5, color: '#94a3b8', fontWeight: 500,
          }}>
            Need help? <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>{SUPPORT_EMAIL}</a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OutOfCreditsModal;
