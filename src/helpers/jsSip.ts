import { useEffect, useRef, useState } from 'react';
import JsSIP from 'jssip';

// ── Types ──────────────────────────────────────────────────────────────────
export type SipStatus = 'unregistered' | 'registering' | 'registered' | 'error';
export type CallState = 'idle' | 'ringing' | 'active' | 'held';

// JsSIP does not export RTCSession as a standalone type — use any
type JsSIPSession = any;

interface UseSipOptions {
  uri: string; // sip:09066269967@192.168.1.15
  wsServer: string; // wss://192.168.1.15:8089/ws
  username: string; // 09066269967
  password: string; // testpass
  domain: string; // 192.168.1.15
}

interface UseSipReturn {
  sipStatus: SipStatus;
  callStatus: string;
  callState: CallState;
  call: (number: string) => void;
  hangUp: () => void;
  toggleMute: () => boolean;
  toggleHold: () => boolean;
}

// ── Hook ───────────────────────────────────────────────────────────────────
export const useSip = ({
  uri,
  wsServer,
  username,
  password,
  domain,
}: UseSipOptions): UseSipReturn => {
  const [sipStatus, setSipStatus] = useState<SipStatus>('unregistered');
  const [callStatus, setCallStatus] = useState<string>('');
  const [callState, setCallState] = useState<CallState>('idle');

  const uaRef = useRef<JsSIP.UA | null>(null);
  const sessionRef = useRef<JsSIPSession | null>(null);
  const isMutedRef = useRef(false);
  const isHeldRef = useRef(false);

  useEffect(() => {
    // ── Silence JsSIP debug logs in production ───────────────────────────
    JsSIP.debug.disable('JsSIP:*');

    const socket = new JsSIP.WebSocketInterface(wsServer);

    const ua = new JsSIP.UA({
      sockets: [socket],
      uri,
      authorization_user: username,
      password,
      realm: domain,
      register: true,
      session_timers: false,
    });

    uaRef.current = ua;

    // ── Registration events ──────────────────────────────────────────────
    ua.on('connecting', () => setSipStatus('registering'));
    ua.on('connected', () => setSipStatus('registering'));

    ua.on('registered', () => {
      setSipStatus('registered');
      console.log('[JsSIP] Registered as', username);
    });

    ua.on('unregistered', () => {
      setSipStatus('unregistered');
      console.log('[JsSIP] Unregistered');
    });

    ua.on('registrationFailed', (e: any) => {
      setSipStatus('error');
      console.error('[JsSIP] Registration failed:', e.cause);
    });

    // ── Incoming call — from Asterisk AMI Originate ──────────────────────
    // When Node.js triggers a call, Asterisk rings this browser first.
    // We auto-answer so the agent's audio leg is established, then
    // Asterisk bridges the customer GSM call to it.
    ua.on('newRTCSession', ({ session }: { session: JsSIPSession }) => {
      sessionRef.current = session;

      if (session.direction === 'incoming') {
        console.log('[JsSIP] Incoming call from Asterisk — auto-answering');
        setCallState('ringing');
        setCallStatus('ringing');

        session.answer({
          mediaConstraints: { audio: true, video: false },
          pcConfig: {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          },
        });
      }

      // ── Session events ─────────────────────────────────────────────────
      session.on('confirmed', () => {
        setCallState('active');
        setCallStatus('active');
        console.log('[JsSIP] Call confirmed — audio active');

        // Pipe remote audio to the <audio> element in the DOM
        const remoteAudio = document.getElementById(
          'remoteAudio'
        ) as HTMLAudioElement;
        if (remoteAudio) {
          const remoteStream = new MediaStream();
          session.connection.getReceivers().forEach((receiver: any) => {
            if (receiver.track) remoteStream.addTrack(receiver.track);
          });
          remoteAudio.srcObject = remoteStream;
          remoteAudio
            .play()
            .catch((err) => console.warn('[Audio] Play failed:', err));
        }
      });

      session.on('ended', () => {
        sessionRef.current = null;
        isMutedRef.current = false;
        isHeldRef.current = false;
        setCallState('idle');
        setCallStatus('ended');
        console.log('[JsSIP] Call ended');
      });

      session.on('failed', (e: any) => {
        sessionRef.current = null;
        setCallState('idle');
        setCallStatus('failed');
        console.warn('[JsSIP] Call failed:', e.cause);
      });

      session.on('hold', () => {
        setCallState('held');
        console.log('[JsSIP] Call on hold');
      });

      session.on('unhold', () => {
        setCallState('active');
        console.log('[JsSIP] Call resumed');
      });
    });

    ua.start();

    return () => {
      ua.stop();
      uaRef.current = null;
    };
  }, [uri, wsServer, username, password, domain]);

  // ── Manually place an outbound SIP call (not used in AMI flow) ───────────
  // In the AMI flow, Node.js triggers the call — the browser just auto-answers.
  // This is here in case you need direct SIP dialing in the future.
  const call = (number: string) => {
    if (!uaRef.current || sipStatus !== 'registered') return;

    const session = uaRef.current.call(`sip:${number}@${domain}`, {
      mediaConstraints: { audio: true, video: false },
      pcConfig: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      },
    });

    sessionRef.current = session;
    setCallState('ringing');
  };

  // ── Hang up current session ──────────────────────────────────────────────
  const hangUp = () => {
    if (!sessionRef.current) return;
    try {
      sessionRef.current.terminate();
    } catch (e) {
      console.warn('[JsSIP] Hangup error:', e);
    }
    sessionRef.current = null;
    isMutedRef.current = false;
    isHeldRef.current = false;
    setCallState('idle');
  };

  // ── Toggle mute — returns new mute state ────────────────────────────────
  const toggleMute = (): boolean => {
    const session = sessionRef.current;
    if (!session) return false;

    if (isMutedRef.current) {
      session.unmute({ audio: true });
      isMutedRef.current = false;
    } else {
      session.mute({ audio: true });
      isMutedRef.current = true;
    }
    return isMutedRef.current;
  };

  // ── Toggle hold — returns new hold state ────────────────────────────────
  const toggleHold = (): boolean => {
    const session = sessionRef.current;
    if (!session) return false;

    if (isHeldRef.current) {
      session.unhold();
      isHeldRef.current = false;
    } else {
      session.hold();
      isHeldRef.current = true;
    }
    return isHeldRef.current;
  };

  return {
    sipStatus,
    callStatus,
    callState,
    call,
    hangUp,
    toggleMute,
    toggleHold,
  };
};
