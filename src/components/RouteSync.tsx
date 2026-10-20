import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../store/useTournamentStore';
import { defaultQualifiers } from '../data/qualifiers';
import {
  buildStatePath,
  getCodesFromPathname,
  getStageFromPathname,
  getStateFromPathname,
  hasTournamentData,
  isValidStage,
  safeDecode,
} from '../utils/urlState';

const samePath = (a: string, b: string) => safeDecode(a).replace(/\/$/, '') === safeDecode(b).replace(/\/$/, '');

/**
 * Keeps the URL and the tournament store in sync in both directions.
 * - URL -> store: on mount and on history navigation (back/forward, pasted link).
 * - store -> URL: on every state change, written with `replace` so it never piles up history.
 */
export const RouteSync: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { qualifiers, groups, knockout, setFullState } = useTournamentStore();
  const lastWrittenPath = useRef<string | null>(null);

  // 1. URL -> store
  useEffect(() => {
    if (lastWrittenPath.current !== null && samePath(lastWrittenPath.current, pathname)) return; // our own write

    const fromUrl = getStateFromPathname(pathname);
    if (!fromUrl) return;

    // A URL is a full snapshot: parts it does not carry are empty, not "keep whatever was there".
    setFullState({
      qualifiers: fromUrl.qualifiers ?? defaultQualifiers,
      groups: fromUrl.groups ?? { matches: {} },
      knockout: fromUrl.knockout ?? { matches: {} },
    });
  }, [pathname, setFullState]);

  // 2. store -> URL
  useEffect(() => {
    // Read both sources directly: in the same commit as a hydration above the subscribed
    // values are stale, and right after a handler calls navigate() the router's pathname
    // still lags behind window.location (e.g. "randomize" sets state and jumps to /knockout).
    const currentPath = window.location.pathname;
    const stage = getStageFromPathname(currentPath);
    if (!isValidStage(stage)) return; // "/" redirects on its own; anything else is the 404 page

    const state = useTournamentStore.getState();
    const urlHasCodes = getCodesFromPathname(currentPath).length > 0;
    if (!hasTournamentData(state) && !urlHasCodes) return;

    const target = buildStatePath(stage, state);
    if (samePath(target, currentPath)) return;

    lastWrittenPath.current = target;
    navigate(target, { replace: true });
  }, [qualifiers, groups, knockout, pathname, navigate]);

  return null;
};
