import { useEffect, useRef } from 'react';
import { subscribeToData } from '../services/storage';
export function useDataRefresh(load: () => void, refreshKey = '') {
  const current = useRef(load);
  current.current = load;
  useEffect(() => { current.current(); return subscribeToData(() => current.current()); }, [refreshKey]);
}
