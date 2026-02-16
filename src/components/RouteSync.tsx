import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../store/useTournamentStore';
import { StateSerializer, RouteStateManager } from '../utils/serializer';

export const RouteSync: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { qualifiers, groups, knockout, setFullState } = useTournamentStore();
  const isFirstRun = useRef(true);
  const lastPathname = useRef(pathname);

  // 1. Sync URL -> State (On Mount and on PopState/Navigation)
  useEffect(() => {
    // Check if pathname actually changed significantly (codes changed)
    const { codes } = RouteStateManager.parseUrl(pathname);
    
    // If we have codes, we try to sync state
    if (codes.length > 0) {
      // To avoid loops, we could check if the current state serializes to the same codes
      // But serialization is what we do in the other effect.
      
      // Let's just trust that if the URL changes, we should update the state.
      // But we need to make sure we don't overwrite user changes if the URL update was triggered by the user changes.
      
      // The other effect updates the URL. If that happens, this effect runs.
      // If the URL matches what we just set, we shouldn't need to do anything, 
      // but setFullState with same data might trigger re-renders.
      
      const stateFromUrl = RouteStateManager.getStateFromUrl(pathname);
      setFullState(stateFromUrl);
    }
  }, [pathname, setFullState]);

  // 2. Sync State -> URL
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const qualifierCode = Object.keys(qualifiers.uefaPaths).length > 0 || Object.keys(qualifiers.intercontinentalKeys).length > 0
      ? StateSerializer.serializeQualifiers(qualifiers) 
      : '';
      
    const groupCode = Object.keys(groups.matches).length > 0 
      ? StateSerializer.serializeGroups(groups) 
      : '';
      
    const knockoutCode = Object.keys(knockout.matches).length > 0 
      ? StateSerializer.serializeKnockout(knockout) 
      : '';
    
    // Determine base path based on current stage or what's completed
    const currentStage = pathname.split('/')[1] || 'qualifiers';
    
    // Construct the full code path using & separator
    let codePath = '';
    if (qualifierCode) {
      codePath = `/${qualifierCode}`;
      if (groupCode) {
        codePath += `&${groupCode}`;
        if (knockoutCode) {
          codePath += `&${knockoutCode}`;
        }
      }
    }
    
    // If we have no codes, we are at root/qualifiers empty
    if (!codePath) {
      if (pathname !== '/qualifiers' && pathname !== '/') {
         navigate('/qualifiers', { replace: true });
      }
      return;
    }

    // We need to keep the user on the same "page" (stage) but update the codes.
    
    // Parse current URL to compare codes
    // We don't really need to compare codes here, we just build the target URL and navigate if different.
    
    const newCodes = codePath.substring(1).split('&'); // remove leading /
    
    // Reconstruct URL with current stage but new codes
    const targetUrl = `/${currentStage}/${newCodes.join('&')}`;
    
    if (pathname !== targetUrl) {
       navigate(targetUrl, { replace: true });
    }
    
  }, [qualifiers, groups, knockout, navigate, pathname]);

  return null;
};
