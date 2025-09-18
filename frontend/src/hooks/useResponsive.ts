import { useEffect, useState } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  width: number;
}

const MOBILE_BREAKPOINT = 768; // px

export default function useResponsive(): ResponsiveState {
  const getState = (): ResponsiveState => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  });

  const [state, setState] = useState<ResponsiveState>(getState());

  useEffect(() => {
    const onResize = () => setState(getState());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return state;
}