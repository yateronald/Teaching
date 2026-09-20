import React from 'react';
import { Modal, Button, Alert } from 'antd';
import { DesktopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deviceText, sinceText, type DeviceSession } from '../../utils/devices';
import './DeviceLimitModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Sign the other devices out and finish signing in here. */
  onSignOutOthers: () => void;
  busy?: boolean;
  /** How many devices the account may use at once. */
  limit: number;
  devices: DeviceSession[];
  /** False once the account has used up today's takeovers. */
  canSignOutOthers: boolean;
}

/**
 * Shown when an exam account is already signed in on all the devices it is
 * allowed. It names the devices so the real owner recognises them — and sees
 * at once when someone else is using their password.
 */
const DeviceLimitModal: React.FC<Props> = ({ open, onClose, onSignOutOthers, busy, limit, devices, canSignOutOthers }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      className="dlm"
      maskClosable={!busy}
      title={null}
    >
      <div className="dlm-head">
        <span className="dlm-ic" aria-hidden="true"><SafetyCertificateOutlined /></span>
        <h3>{t('login.devices.title')}</h3>
        <p>{t('login.devices.body', { limit })}</p>
      </div>

      <ul className="dlm-list">
        {devices.map((d) => (
          <li key={d.id}>
            <span className="dlm-list-ic" aria-hidden="true"><DesktopOutlined /></span>
            <span className="dlm-list-text">
              <strong>{deviceText(d.device, lang)}</strong>
              <em>{t('login.devices.last_used', { when: sinceText(d.idle_seconds, lang) })}</em>
            </span>
          </li>
        ))}
      </ul>

      {canSignOutOthers ? (
        <p className="dlm-note">{t('login.devices.hint')}</p>
      ) : (
        <Alert type="warning" showIcon className="dlm-alert" message={t('login.devices.blocked')} />
      )}

      <div className="dlm-actions">
        {canSignOutOthers && (
          <Button type="primary" size="large" block loading={busy} onClick={onSignOutOthers}>
            {t('login.devices.sign_out_others')}
          </Button>
        )}
        <Button size="large" block onClick={onClose} disabled={busy}>
          {t('login.devices.cancel')}
        </Button>
      </div>
    </Modal>
  );
};

export default DeviceLimitModal;
