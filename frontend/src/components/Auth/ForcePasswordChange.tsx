import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined, CheckOutlined, LogoutOutlined, WarningOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ASSET_PATHS } from '../../utils/assets';
import { apiAsset } from '../../utils/apiAsset';
import { homeFor } from '../../utils/roles';
import { useTr } from '../../utils/useTr';
import './ForcePasswordChange.css';

interface Values { currentPassword: string; newPassword: string; confirmPassword: string }
type From = { pathname?: string; search?: string; hash?: string } | undefined;

/* ══════════════════════════════════════════
   A new password before going further: the first sign-in (the temporary
   password received by email) or an expired password. A company account sees
   its company's logo and name, like on its sign-in page.
══════════════════════════════════════════ */
const ForcePasswordChange: React.FC = () => {
  const [form] = Form.useForm<Values>();
  const navigate = useNavigate();
  const location = useLocation();
  const { changePassword, logout, user, isAuthenticated, loading } = useAuth();
  const { tr } = useTr();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typed: string = Form.useWatch('newPassword', form) || '';
  const current: string = Form.useWatch('currentPassword', form) || '';

  const from = (location.state as { from?: From } | null)?.from;
  const next = from?.pathname && from.pathname !== '/force-change-password'
    ? `${from.pathname}${from.search || ''}${from.hash || ''}`
    : homeFor(user?.role);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }
    if (!user?.force_password_change) navigate(homeFor(user?.role), { replace: true });
  }, [loading, isAuthenticated, user, navigate, location]);

  const company = user?.organization || null;
  // First sign-in: the password to type is the temporary one sent by email.
  const firstTime = !!user?.must_change_password && user.must_change_password !== 0;

  // Live checks: what is required, and what makes the password stronger.
  const checks = useMemo(() => [
    { ok: typed.length >= 6, required: true, label: tr('At least 6 characters', 'Au moins 6 caractères') },
    { ok: typed.length > 0 && current.length > 0 && typed !== current, required: true, label: firstTime ? tr('Different from the temporary password', 'Différent du mot de passe provisoire') : tr('Different from the current password', 'Différent du mot de passe actuel') },
    { ok: /[a-zA-Z]/.test(typed) && /\d/.test(typed), required: false, label: tr('Letters and numbers', 'Des lettres et des chiffres') },
    { ok: typed.length >= 10 || /[^a-zA-Z0-9]/.test(typed), required: false, label: tr('10 characters or a symbol', '10 caractères ou un symbole') },
  ], [typed, current, firstTime, tr]);
  const strength = checks.filter(c => c.ok).length;
  const strengthLabel = !typed ? '' : strength <= 2 ? tr('Weak', 'Faible') : strength === 3 ? tr('Good', 'Bon') : tr('Strong', 'Solide');

  const onFinish = async (values: Values) => {
    setSubmitting(true);
    setError(null);
    const result = await changePassword(values.currentPassword, values.newPassword);
    setSubmitting(false);
    if (result.success) navigate(next, { replace: true });
    else if (/current password is incorrect/i.test(result.error || '')) {
      setError(firstTime
        ? tr('This is not the temporary password from the email. Copy it exactly (it is case-sensitive), or ask for a new invitation.',
          'Ce n’est pas le mot de passe provisoire de l’email. Recopiez-le exactement (majuscules comprises), ou demandez une nouvelle invitation.')
        : tr('The current password is incorrect.', 'Le mot de passe actuel est incorrect.'));
    } else setError(result.error || tr('The password could not be changed.', 'Le mot de passe n’a pas pu être changé.'));
  };

  const signOut = async () => { await logout(); navigate(company ? `/o/${company.slug}` : '/login', { replace: true }); };

  const firstName = user?.first_name || '';
  const title = firstTime
    ? (company
      ? tr(`Welcome to ${company.name}`, `Bienvenue chez ${company.name}`)
      : tr(`Welcome${firstName ? `, ${firstName}` : ''}`, `Bienvenue${firstName ? `, ${firstName}` : ''}`))
    : tr('Time for a new password', 'Place à un nouveau mot de passe');
  const sub = firstTime
    ? tr('Choose your own password to replace the temporary one you received by email. You will use it every time you sign in.',
      'Choisissez votre propre mot de passe pour remplacer le mot de passe provisoire reçu par email. Vous l’utiliserez à chaque connexion.')
    : tr('Your password has expired. Choose a new one to continue.', 'Votre mot de passe a expiré. Choisissez-en un nouveau pour continuer.');
  const eyebrow = company
    ? `${company.name} · ${user?.role === 'org_admin' ? tr('Company space', 'Espace entreprise') : tr('Exam preparation', 'Préparation aux examens')}`
    : 'Learn French with Natives';

  return (
    <div className={`fpc-page${company ? ' fpc-page--company' : ''}`}>
      <header className="fpc-top">
        <span className="fpc-brand">
          {company ? (
            <span className="fpc-brand-mark is-company">
              {company.logo_url ? <img src={apiAsset(company.logo_url)} alt="" /> : <b>{company.name.slice(0, 1).toUpperCase()}</b>}
            </span>
          ) : (
            <span className="fpc-brand-mark"><img src={ASSET_PATHS.LOGOS.MAIN} alt="" /></span>
          )}
          <strong>{company ? company.name : 'Learn French with Natives'}</strong>
        </span>
        <button type="button" className="fpc-signout" onClick={signOut}>
          <LogoutOutlined /> <span>{tr('Not you? Sign out', 'Pas vous ? Se déconnecter')}</span>
        </button>
      </header>

      <main className="fpc-main">
        <section className="fpc-card">
          <div className="fpc-card-head">
            {company ? (
              <span className="fpc-mark is-company">
                {company.logo_url ? <img src={apiAsset(company.logo_url)} alt={company.name} /> : <b aria-hidden="true">{company.name.slice(0, 1).toUpperCase()}</b>}
              </span>
            ) : (
              <span className="fpc-mark"><img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" /></span>
            )}
            <span className="fpc-step"><KeyOutlined /> {tr('Last step', 'Dernière étape')}</span>
          </div>

          <p className="fpc-eyebrow"><span aria-hidden="true" />{eyebrow}</p>
          <h1 className="fpc-title">{title}</h1>
          <p className="fpc-sub">{sub}</p>
          {user?.email && <p className="fpc-account">{tr('Account', 'Compte')} · <b>{user.email}</b></p>}

          <Form form={form} layout="vertical" onFinish={onFinish} className="fpc-form" requiredMark={false} onValuesChange={() => error && setError(null)}>
            <Form.Item
              name="currentPassword"
              label={firstTime ? tr('Temporary password (from the email)', 'Mot de passe provisoire (reçu par email)') : tr('Current password', 'Mot de passe actuel')}
              rules={[{ required: true, message: firstTime ? tr('Enter the temporary password from your email', 'Saisissez le mot de passe provisoire reçu par email') : tr('Enter your current password', 'Saisissez votre mot de passe actuel') }]}
            >
              <Input.Password prefix={<LockOutlined className="fpc-input-icon" />} autoComplete="current-password" autoFocus
                placeholder={firstTime ? tr('As written in the email', 'Tel qu’indiqué dans l’email') : tr('Your current password', 'Votre mot de passe actuel')} />
            </Form.Item>

            <div className="fpc-divider" aria-hidden="true" />

            <Form.Item
              name="newPassword"
              label={tr('New password', 'Nouveau mot de passe')}
              dependencies={['currentPassword']}
              rules={[
                { required: true, message: tr('Choose a new password', 'Choisissez un nouveau mot de passe') },
                { min: 6, message: tr('At least 6 characters', 'Au moins 6 caractères') },
                ({ getFieldValue }) => ({
                  validator: (_, v) => (!v || v !== getFieldValue('currentPassword')
                    ? Promise.resolve()
                    : Promise.reject(new Error(tr('Choose a password different from the current one', 'Choisissez un mot de passe différent de l’actuel')))),
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined className="fpc-input-icon" />} autoComplete="new-password" placeholder={tr('Your new password', 'Votre nouveau mot de passe')} />
            </Form.Item>

            <div className="fpc-strength" aria-live="polite">
              <div className={`fpc-meter is-${strength}`} aria-hidden="true"><i /><i /><i /><i /></div>
              <span className="fpc-strength-label">{strengthLabel}</span>
            </div>
            <ul className="fpc-checks">
              {checks.map(c => (
                <li key={c.label} className={c.ok ? 'is-ok' : ''}>
                  <span className="fpc-check-dot" aria-hidden="true">{c.ok && <CheckOutlined />}</span>
                  {c.label}{!c.required && <em>{tr('recommended', 'conseillé')}</em>}
                </li>
              ))}
            </ul>

            <Form.Item
              name="confirmPassword"
              label={tr('Confirm the new password', 'Confirmez le nouveau mot de passe')}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: tr('Type the new password again', 'Saisissez à nouveau le nouveau mot de passe') },
                ({ getFieldValue }) => ({
                  validator: (_, v) => (!v || getFieldValue('newPassword') === v
                    ? Promise.resolve()
                    : Promise.reject(new Error(tr('The two passwords are different', 'Les deux mots de passe sont différents')))),
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined className="fpc-input-icon" />} autoComplete="new-password" placeholder={tr('Same password', 'Le même mot de passe')} />
            </Form.Item>

            {error && <div className="fpc-error" role="alert"><WarningOutlined /><span>{error}</span></div>}

            <Button type="primary" htmlType="submit" loading={submitting} block className="fpc-submit">
              {tr('Save and continue', 'Enregistrer et continuer')}
            </Button>
          </Form>
        </section>

        <p className="fpc-foot">
          {company
            ? <>{tr('Powered by', 'Propulsé par')} <strong>Learn French with Natives</strong></>
            : <>© {new Date().getFullYear()} Learn French with Natives</>}
        </p>
      </main>
    </div>
  );
};

export default ForcePasswordChange;
