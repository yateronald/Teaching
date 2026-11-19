// Small pieces of the dialogue pages: the icon of each situation and the
// initials shown for a speaker.
import {
  AlertOutlined, AuditOutlined, CarOutlined, CoffeeOutlined, CreditCardOutlined, HomeOutlined,
  LaptopOutlined, MedicineBoxOutlined, ReadOutlined, ShoppingOutlined,
} from '@ant-design/icons';
import { imageUrl } from '../../categories';
import { dialogueCoverKey } from './meta';
import type { ThemeId } from './types';

const ICONS: Record<ThemeId, typeof HomeOutlined> = {
  sante: MedicineBoxOutlined,
  logement: HomeOutlined,
  travail: LaptopOutlined,
  demarches: AuditOutlined,
  banque: CreditCardOutlined,
  transports: CarOutlined,
  achats: ShoppingOutlined,
  ecole: ReadOutlined,
  loisirs: CoffeeOutlined,
  urgences: AlertOutlined,
};

export function ThemeIcon({ theme }: { theme: ThemeId }) {
  const Icon = ICONS[theme];
  return <Icon aria-hidden />;
}

/** The scene of a dialogue: decorative, the title names the link. `eager` at the top of its page. */
export function DialogueCover({ id, sizes, eager = false }: { id: string; sizes: string; eager?: boolean }) {
  const key = dialogueCoverKey({ id });
  return <img src={imageUrl(key, 640)} srcSet={`${imageUrl(key, 640)} 640w, ${imageUrl(key, 1200)} 1200w`}
    sizes={sizes} alt="" width="640" height="360" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" />;
}

/** « L’agente » → « A », « Emma » → « E », « Le médecin régulateur » → « M ». */
export function Initial({ name }: { name: string }) {
  const word = name.replace(/^(l[ae]s?\s|l’|l')/i, '').trim();
  return <span className="dlg-initial" aria-hidden>{word.charAt(0).toUpperCase()}</span>;
}
