"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { clearSessionData, purgeLegacyStorage } from "@/lib/session-data";

type SignOut = (options?: { redirectUrl?: string; sessionId?: string }) => Promise<void>;
const SignOutContext = createContext<SignOut | null>(null);
const CHANNEL = "monny-session-ended";

export function SessionBoundary({ children }: { children: ReactNode }) {
  const { isLoaded, userId, sessionId } = useAuth();
  const clerk = useClerk();
  const identity = `${userId ?? "anonymous"}:${sessionId ?? "none"}`;
  const previous = useRef<string | undefined>(undefined);
  const channelSource = useRef<string | null>(null);
  const [readyFor, setReadyFor] = useState<string>();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    purgeLegacyStorage();
    if (previous.current !== undefined && previous.current !== identity) clearSessionData();
    previous.current = identity;
    setReadyFor(identity);
    setBlocked(false);
  }, [isLoaded, identity]);

  useEffect(() => {
    let channel: BroadcastChannel | undefined;
    try {
      channelSource.current ??= crypto.randomUUID();
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = event => {
        if (event.data?.source === channelSource.current) return;
        clearSessionData(); setBlocked(true);
      };
    } catch { /* Clerk's session listener still handles auth changes. */ }
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) { clearSessionData(); window.location.reload(); }
    };
    window.addEventListener("pageshow", restore);
    return () => { channel?.close(); window.removeEventListener("pageshow", restore); };
  }, []);

  const signOut: SignOut = useCallback(async (options?: { redirectUrl?: string; sessionId?: string }) => {
    clearSessionData();
    setBlocked(true); // Unmount forms, cached queries and private component state.
    try {
      const channel = new BroadcastChannel(CHANNEL);
      channel.postMessage({ type: "logout", source: channelSource.current });
      channel.close();
    } catch { /* Sign-out must work even without browser storage or channels. */ }
    try { return await clerk.signOut(options); }
    finally { setBlocked(false); }
  }, [clerk]);

  if (!isLoaded || readyFor !== identity) return null;
  if (blocked) return <p role="status">Session ended. <button type="button" onClick={() => window.location.assign("/")}>Continue to sign in</button></p>;
  return <SignOutContext.Provider value={signOut}><SessionScope key={identity}>{children}</SessionScope></SignOutContext.Provider>;
}

function SessionScope({ children }: { children: ReactNode }) { return <>{children}</>; }

export function useAppSignOut(): SignOut {
  const signOut = useContext(SignOutContext);
  if (!signOut) throw new Error("useAppSignOut requires SessionBoundary");
  return signOut;
}
