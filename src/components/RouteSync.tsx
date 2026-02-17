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

  // 1. Initial Load: Parse URL -> Set State
  useEffect(() => {
      // Only run on mount to hydrate state from URL
      const { codes } = RouteStateManager.parseUrl(window.location.pathname);
      if (codes.length > 0) {
          const state = RouteStateManager.getStateFromUrl(window.location.pathname);
          setFullState(state);
      }
      // Mark as not first run immediately after mount check
      isFirstRun.current = false;
  }, [setFullState]); // Only on mount

  // 2. Sync State -> URL
  useEffect(() => {
    // Skip the very first run to avoid overwriting URL with empty state before hydration
    if (isFirstRun.current) return;

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
    const currentPath = window.location.pathname;
    const currentStage = currentPath.split('/')[1] || 'qualifiers';
    
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
      if (currentPath !== '/qualifiers' && currentPath !== '/') {
         // Don't redirect if just empty, unless we want to enforce structure
      }
      return;
    }

    const newCodes = codePath.substring(1).split('&'); // remove leading /
    const targetUrl = `/${currentStage}/${newCodes.join('&')}`;
    
    if (currentPath !== targetUrl) {
       navigate(targetUrl, { replace: true });
    }
    
  }, [qualifiers, groups, knockout, navigate]);

  return null;
};
