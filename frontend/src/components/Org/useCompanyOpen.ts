import { useAuth } from '../../contexts/AuthContext';

/** Is the signed-in manager's company open for changes? */
export function useCompanyOpen() {
  const { user } = useAuth();
  const state = user?.organization?.state;
  return { open: state === 'active', state };
}

