import React from 'react';
import { ClockCircleOutlined, LockOutlined } from '@ant-design/icons';
import type { OrgBrand } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import './Org.css';

/**
 * The company's state, at the top of every page of a company account:
 * ends soon (warning), expired or not started (read-only, contact the
 * administrator). Nothing while the company is simply open.
 */
const OrgStateBanner: React.FC<{ org: OrgBrand; manager: boolean }> = ({ org, manager }) => {
  const { tr, locale } = useTr();
  const end = new Date(org.access_ends_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const start = new Date(org.access_starts_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  if (org.state === 'expired') {
    return (
      <div className="og-banner tone-off" role="status">
        <LockOutlined />
        <div className="og-banner-body">
          <strong>{tr(`Access ended on ${end}`, `Accès terminé le ${end}`)}</strong>
          <span>{manager
            ? tr('You can still see your learners and their results. To assign exams or hand out credits again, contact the administrator to extend your access.',
              'Vous voyez toujours vos apprenants et leurs résultats. Pour attribuer des examens ou distribuer des crédits à nouveau, contactez l’administrateur pour prolonger l’accès.')
            : tr('Your results stay available. Practice exams are closed: contact your administrator.',
              'Vos résultats restent disponibles. Les entraînements sont fermés : contactez votre administrateur.')}</span>
        </div>
      </div>
    );
  }
  if (org.state === 'not_started') {
    return (
      <div className="og-banner tone-soon" role="status">
        <ClockCircleOutlined />
        <div className="og-banner-body">
          <strong>{tr(`Access opens on ${start}`, `L’accès ouvre le ${start}`)}</strong>
          <span>{tr('Everything becomes available on that day.', 'Tout sera disponible à cette date.')}</span>
        </div>
      </div>
    );
  }
  if (org.state === 'active' && org.expiring_soon) {
    return (
      <div className="og-banner tone-warn" role="status">
        <ClockCircleOutlined />
        <div className="og-banner-body">
          <strong>{tr(`Access ends in ${org.days_left} day${org.days_left > 1 ? 's' : ''} (${end})`, `L’accès se termine dans ${org.days_left} jour${org.days_left > 1 ? 's' : ''} (${end})`)}</strong>
          <span>{manager
            ? tr('To keep going after that date, contact the administrator to extend your access.', 'Pour continuer après cette date, contactez l’administrateur pour prolonger l’accès.')
            : tr('Practise while it is open; your results stay available afterwards.', 'Profitez-en pour vous entraîner ; vos résultats resteront disponibles ensuite.')}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default OrgStateBanner;
