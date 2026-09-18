import EEExam from '../ExamSim/EEExam';

interface Props { combinaisonId: number; open: boolean; onClose: () => void; onCreditConsumed?: () => void; onOutOfCredits?: () => void }

/** Expression écrite simulation — mounted fresh on every opening so no state leaks between attempts. */
export default function EESimulation(props: Props) {
  return props.open ? <EEExam key={props.combinaisonId} {...props} /> : null;
}
