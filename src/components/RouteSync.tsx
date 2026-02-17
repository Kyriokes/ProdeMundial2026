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
      const path = window.location.pathname;
      // Format: /stage/codes
      // codes can be code1&code2&code3
      
      const parts = path.split('/').filter(Boolean); // ["stats", "code1&code2"]
      
      if (parts.length >= 2) {
          const codesStr = parts[1]; // "code1&code2"
          
          // We need to parse this manually because our RouteStateManager.parseUrl 
          // assumes /stage/codes format but splits by / again inside which might be confusing
          
          const codes = codesStr.split('&');
          const state: Partial<any> = {};

          // Helper to try new format then old
          const tryDeserialize = (code: string, type: 'qualifiers' | 'groups' | 'knockout') => {
              if (!code) return null;
              
              if (type === 'qualifiers') {
                  const res = StateSerializer.deserializeQualifiers(code);
                  if (res) return res;
                  // Try legacy full state json if it was monolithic? No, it was per-section usually.
                  // Or maybe user pasted old link format.
                  return StateSerializer.deserialize(code);
              }
              if (type === 'groups') {
                  const res = StateSerializer.deserializeGroups(code);
                  if (res) return res;
                  return StateSerializer.deserialize(code);
              }
              if (type === 'knockout') {
                  const res = StateSerializer.deserializeKnockout(code);
                  if (res) return res;
                  return StateSerializer.deserialize(code);
              }
              return null;
          };

          if (codes[0]) state.qualifiers = tryDeserialize(codes[0], 'qualifiers');
          if (codes[1]) state.groups = tryDeserialize(codes[1], 'groups');
          if (codes[2]) state.knockout = tryDeserialize(codes[2], 'knockout');

          // Only update if we actually got something valid
          if (state.qualifiers || state.groups || state.knockout) {
             setFullState(state);
          }
      } else if (parts.length === 1 && parts[0] === 'stats') {
          // If we are in /stats but without codes, try to load from localStorage or just wait?
          // The issue is: if URL is just /stats, we don't have state in URL.
          // But if we navigated there from inside the app, the state is in the store.
          // The problem is if we Refresh on /stats.
          // If we refresh on /stats, we have no codes. So state remains initial (empty).
          // And then Sync State sees empty state and generates empty codes.
          // This component assumes State is source of truth, and URL reflects it.
          // But on initial load, URL is source of truth.
          
          // If URL has no codes, we should probably NOT overwrite the store if it's already populated?
          // But on refresh, store is empty.
          
          // So: /stats without codes = Empty State.
          // This is expected behavior for a stateless app.
          // Unless we persist to localStorage?
          // For now, let's assume if URL is empty, we start fresh.
      }
      
      // Mark as not first run immediately
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
    
    // If we are in /stats, DO NOT redirect/sync URL automatically to avoid overwriting state or loops.
    // The user might be viewing a specific snapshot or just navigating.
    if (currentStage === 'stats') return;

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
      // If we are at /stats and have no codes, we might want to redirect to /qualifiers or stay?
      // If we stay, we show empty table.
      // If we redirect, we force user to start over.
      // Let's allow empty /stats for now, or better yet, if we have state in store (which we do if codePath is generated from it),
      // but codePath is empty?
      // Wait, codePath is generated FROM state.
      // If codePath is empty, it means state is empty.
      
      if (currentPath !== '/qualifiers' && currentPath !== '/' && currentPath !== '/stats') {
         // Don't redirect if just empty, unless we want to enforce structure
      }
      return;
    }

    const newCodes = codePath.substring(1).split('&'); // remove leading /
    const targetUrl = `/${currentStage}/${newCodes.join('&')}`;
    
    // Check if URL is actually different to avoid infinite loops
    // Decode both to compare actual values if needed, but string comparison is usually fine
    // Also handle trailing slashes or minor differences
    const normalize = (p: string) => decodeURIComponent(p).replace(/\/$/, '');
    
    if (normalize(currentPath) !== normalize(targetUrl)) {
       // Only navigate if the codes part is different OR if we are forcing a structure
       // But wait, if we are in /stats, we might want to KEEP /stats
       if (currentStage === 'stats') {
           const statsUrl = `/stats/${newCodes.join('&')}`;
           if (normalize(currentPath) !== normalize(statsUrl)) {
                navigate(statsUrl, { replace: true });
           }
       } else {
           navigate(targetUrl, { replace: true });
       }
    }
    
  }, [qualifiers, groups, knockout, navigate]);

  return null;
};
