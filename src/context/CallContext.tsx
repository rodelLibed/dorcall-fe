import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Invitation } from 'sip.js';
import * as sipService from '../helpers/sipService';
import type {
  SipConfig,
  RegistrationState,
  CallState,
} from '../helpers/sipService';
import axiosInstance from '../helpers/axios';
import { getToken } from '../helpers/token';

interface CallContextType {
  registrationState: RegistrationState;
  callState: CallState;
  callerNumber: string;
  callDuration: string;
  incomingInvitation: Invitation | null;
  initializeSip: () => Promise<void>;
  makeCall: (target: string) => void;
  answerIncoming: () => void;
  rejectIncoming: () => void;
  hangUp: () => void;
  toggleMute: () => boolean;
  toggleHold: () => void;
  sendDtmf: (tone: string) => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = (): CallContextType => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [registrationState, setRegistrationState] =
    useState<RegistrationState>('unregistered');
  const [callState, setCallState] = useState<CallState>('idle');
  const [callerNumber, setCallerNumber] = useState('');
  const [callDuration, setCallDuration] = useState('00:00');
  const [incomingInvitation, setIncomingInvitation] =
    useState<Invitation | null>(null);

  const sipConfigRef = useRef<SipConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const initCalledRef = useRef(false);

  // Timer for call duration
  useEffect(() => {
    if (callState === 'active') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        setCallDuration(`${mins}:${secs}`);
      }, 1000);
    } else if (callState === 'idle') {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration('00:00');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const initializeSip = useCallback(async () => {
    // Prevent duplicate calls (React StrictMode / re-renders)
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    try {
      const token = getToken();
      console.log(
        'SIP init — token present:',
        !!token,
        'length:',
        token.length
      );
      if (!token) {
        console.error('No auth token found — cannot initialize SIP');
        setRegistrationState('error');
        initCalledRef.current = false;
        return;
      }

      const { data } = await axiosInstance(token).get('/api/agents/sip-config');
      if (!data.success) {
        console.error('Failed to fetch SIP config');
        setRegistrationState('error');
        return;
      }

      sipConfigRef.current = data.sipConfig;

      sipService.initialize(data.sipConfig, {
        onRegistrationChange: (state) => setRegistrationState(state),
        onIncomingCall: (number, invitation) => {
          setCallerNumber(number);
          setIncomingInvitation(invitation);
        },
        onCallStateChange: (state) => setCallState(state),
        onCallEnded: () => {
          setCallerNumber('');
          setIncomingInvitation(null);
        },
      });
    } catch (err) {
      console.error('SIP init error:', err);
      setRegistrationState('error');
      initCalledRef.current = false;
    }
  }, []);

  const makeCall = useCallback((target: string) => {
    if (!sipConfigRef.current) return;
    setCallerNumber(target);
    sipService.makeCall(target, sipConfigRef.current.sipDomain);
  }, []);

  const answerIncoming = useCallback(() => {
    if (incomingInvitation) {
      sipService.answerCall(incomingInvitation);
      setIncomingInvitation(null);
    }
  }, [incomingInvitation]);

  const rejectIncoming = useCallback(() => {
    if (incomingInvitation) {
      sipService.rejectCall(incomingInvitation);
      setIncomingInvitation(null);
      setCallerNumber('');
    }
  }, [incomingInvitation]);

  const hangUp = useCallback(() => {
    sipService.hangUp();
  }, []);

  const toggleMute = useCallback((): boolean => {
    return sipService.toggleMute();
  }, []);

  const toggleHold = useCallback(() => {
    sipService.toggleHold();
  }, []);

  const sendDtmf = useCallback((tone: string) => {
    sipService.sendDtmf(tone);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => sipService.cleanup();
  }, []);

  return (
    <CallContext.Provider
      value={{
        registrationState,
        callState,
        callerNumber,
        callDuration,
        incomingInvitation,
        initializeSip,
        makeCall,
        answerIncoming,
        rejectIncoming,
        hangUp,
        toggleMute,
        toggleHold,
        sendDtmf,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
