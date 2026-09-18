import EOExam from '../ExamSim/EOExam';

interface Props { open: boolean; onClose: () => void; partieId?: number | null; onCreditConsumed?: () => void; onOutOfCredits?: () => void }

/** Expression orale simulation — mounted fresh on every opening so no state leaks between attempts. */
export default function EOSimulation(props: Props) {
  return props.open ? <EOExam key={props.partieId ?? 'free'} {...props} /> : null;
}
