import React, { useEffect, useState, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Volume2,
  Mic,
  MicOff,
  Pause,
  Play,
} from 'lucide-react';
import { useSip } from '../helpers/jsSip';
import axiosInstance from '../helpers/axios';
import socket from '../helpers/socket';

// ── Change these per agent login ───────────────────────────────────────────
const AGENT_EXT = '09066269967';

const Dialer: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customerAnswered, setCustomerAnswered] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── JsSIP — registers browser as PJSIP endpoint to Linux Asterisk ────────
  // When Asterisk originates a call to PJSIP/09066269967,
  // JsSIP receives it and answers automatically so audio flows
  const { sipStatus, toggleMute, toggleHold, callState, hangUp } = useSip({
    uri: `sip:09066269967@127.0.0.1`,
    wsServer: 'wss://127.0.0.1:8089/ws',
    username: '09066269967',
    password: 'testpass',
    domain: '127.0.0.1',
  });

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = () => {
    if (timerRef.current) return;
    setCallSeconds(0);
    timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallSeconds(0);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const resetCallState = () => {
    setIsCallActive(false);
    setCustomerAnswered(false);
    setIsMuted(false);
    setCallStatus('');
    setPhoneNumber('');
    stopTimer();
  };

  // ── Socket — receives AMI events from Node.js ─────────────────────────────
  // Events: ringing → answered → ended
  useEffect(() => {
    socket.emit('join_Room', AGENT_EXT);

    socket.on(
      'receiveCallStats',
      (data: { status: string; channel?: string }) => {
        console.log('[Socket] Call status:', data);
        setCallStatus(data.status);

        if (data.status === 'ringing') {
          setIsCallActive(true);
          setCustomerAnswered(false);
        }

        if (data.status === 'answered') {
          setCustomerAnswered(true);
          startTimer();
        }

        if (data.status === 'ended' || data.status === 'failed') {
          resetCallState();
        }
      }
    );

    return () => {
      socket.off('receiveCallStats');
      stopTimer();
    };
  }, []);

  // ── Dialpad ───────────────────────────────────────────────────────────────
  const handleNumberClick = (num: string) => {
    if (!isCallActive) setPhoneNumber((prev) => prev + num);
  };

  // ── Initiate call via Node.js → AMI → Asterisk ───────────────────────────
  const handleCall = async () => {
    if (!phoneNumber) return;
    setIsCallActive(true);
    setCustomerAnswered(false);
    setCallStatus('ringing');

    try {
      await axiosInstance().post('/api/calls/outbound', {
        agentExt: AGENT_EXT,
        target: phoneNumber,
      });
      // Asterisk will now:
      // 1. Ring this browser via JsSIP (PJSIP/09066269967)
      // 2. Once browser answers, dial customer via WSL GSM
      // 3. Socket events update the UI as call progresses
    } catch (error) {
      console.error('[Call] Failed to initiate:', error);
      resetCallState();
    }
  };

  // ── Hang up via Node.js → AMI → Asterisk ─────────────────────────────────
  const handleEndCall = async () => {
    try {
      const res: any = await axiosInstance().post('/api/calls/agent_hangup', {
        agent: AGENT_EXT,
      });

      // Also hang up the JsSIP session (agent browser audio leg)
      hangUp();

      if (res?.data?.data?.success) {
        resetCallState();
      }
    } catch (error) {
      console.error('[Hangup] Failed:', error);
      // Reset UI anyway so agent isn't stuck
      hangUp();
      resetCallState();
    }
  };

  const handleMuteToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusBadge = () => {
    if (!isCallActive) return null;
    if (callState === 'held')
      return { text: 'On Hold', color: 'bg-yellow-500/20 text-yellow-400' };
    if (customerAnswered)
      return { text: 'Connected', color: 'bg-green-500/20 text-green-400' };
    return { text: 'Ringing...', color: 'bg-blue-500/20 text-blue-400' };
  };

  const sipColors: Record<string, string> = {
    registered: 'bg-green-500',
    registering: 'bg-yellow-500 animate-pulse',
    unregistered: 'bg-gray-500',
    error: 'bg-red-500',
  };

  const badge = statusBadge();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Phone Dialer</h2>
        <div className="flex items-center space-x-2 bg-dark-700 px-3 py-1.5 rounded-lg">
          <span
            className={`w-2 h-2 rounded-full ${sipColors[sipStatus] ?? 'bg-gray-500'}`}
          />
          <span className="text-xs text-gray-300 capitalize">{sipStatus}</span>
        </div>
      </div>

      <div className="card p-6">
        {/* Number display */}
        <div className="mb-6">
          <div className="bg-dark-700 rounded-lg p-4 mb-4">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => !isCallActive && setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full bg-transparent text-3xl text-center text-gray-100 focus:outline-none"
              readOnly={isCallActive}
            />
          </div>

          {/* Status badge */}
          {isCallActive && badge && (
            <div className="text-center">
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${badge.color}`}
              >
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span className="font-medium">{badge.text}</span>
                {customerAnswered && (
                  <span className="font-mono">
                    {formatDuration(callSeconds)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dialpad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(
            (num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="bg-dark-700 hover:bg-dark-600 text-gray-100 text-2xl font-semibold py-4 rounded-lg transition-colors"
              >
                {num}
              </button>
            )
          )}
        </div>

        {/* Controls */}
        {!isCallActive ? (
          <div className="flex gap-3">
            <button
              onClick={() => setPhoneNumber((prev) => prev.slice(0, -1))}
              className="btn-secondary flex-1"
            >
              Backspace
            </button>
            <button
              onClick={handleCall}
              disabled={!phoneNumber || sipStatus !== 'registered'}
              className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {/* Mute */}
            <button
              onClick={handleMuteToggle}
              className={`p-4 rounded-lg transition-colors ${isMuted ? 'bg-red-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 mx-auto" />
              ) : (
                <Mic className="w-5 h-5 mx-auto" />
              )}
            </button>

            {/* Hold */}
            <button
              onClick={toggleHold}
              className={`p-4 rounded-lg transition-colors ${callState === 'held' ? 'bg-yellow-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
            >
              {callState === 'held' ? (
                <Play className="w-5 h-5 mx-auto" />
              ) : (
                <Pause className="w-5 h-5 mx-auto" />
              )}
            </button>

            {/* Volume (placeholder) */}
            <button className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-gray-300">
              <Volume2 className="w-5 h-5 mx-auto" />
            </button>

            {/* End call */}
            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
            >
              <PhoneOff className="w-5 h-5 mx-auto" />
            </button>
          </div>
        )}
      </div>

      {/* Remote audio — JsSIP pipes audio here */}
      <audio id="remoteAudio" autoPlay hidden />
    </div>
  );
};

export default Dialer;
