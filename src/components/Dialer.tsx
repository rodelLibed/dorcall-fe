import React, { useEffect, useState, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Volume2,
  Mic,
  MicOff,
  Pause,
  Play,
  PhoneIncoming,
} from 'lucide-react';
import { useCall } from '../context/CallContext';
import { useAuth } from '../context/AuthContext';
import { useSip } from '../helpers/jsSip';
import { SessionState } from 'sip.js';
import axiosInstance from '../helpers/axios';
import socket from '../helpers/socket';

const Dialer: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [_isOnHold, setIsOnHold] = useState(false);
  const [customerAnswered, setCustomerAnswered] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { user } = useAuth();
  const sipExtension = user?.username ?? '';

  const { sipStatus, callStatus, call, hangup } = useSip({
    uri: `sip:${sipExtension}@127.0.0.1`,
    wsServer: 'wss://127.0.0.1:8089/ws',
    username: sipExtension,
    password: 'testpass',
    domain: '127.0.0.1',
  });
  console.log('sipStatus : >>> ', sipStatus);

  const {
    callState,
    callerNumber,
    incomingInvitation,
    answerIncoming,
    rejectIncoming,
    hangUp,
    toggleMute,
    toggleHold,
    sendDtmf,
  } = useCall();

  const isRinging = callState === 'ringing';

  // Format seconds → "MM:SS"
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startTimer = () => {
    if (timerRef.current) return; // already running
    setCallSeconds(0);
    timerRef.current = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallSeconds(0);
  };

  const resetCallState = () => {
    setIsCallActive(false);
    setCustomerAnswered(false);
    setIsMuted(false);
    setIsOnHold(false);
    setPhoneNumber('');
    stopTimer();
  };

  useEffect(() => {
    socket.emit('join_Room', sipExtension);

    socket.on('receiveCallStats', (data) => {
      console.log('CALL STATUS:', data);

      if (data.status === 'answered') {
        setCustomerAnswered(true);
        startTimer(); // ← start counting when customer picks up
      }

      if (data.status === 'ended') {
        resetCallState();
      }
    });

    return () => {
      socket.off('receiveCallStats');
      stopTimer();
    };
  }, []);

  const handleNumberClick = (num: string) => {
    if (isCallActive) {
      sendDtmf(num);
    } else {
      setPhoneNumber((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (phoneNumber) {
      setIsCallActive(true);
      setCustomerAnswered(false);
      try {
        // Keep SIP leg with Asterisk, and trigger SIM800C via backend AT command.
        call(phoneNumber);
        await axiosInstance().post('/api/calls/outbound', {
          target: phoneNumber,
          agent: sipExtension,
        });
      } catch (error) {
        console.error('Call failed', error);
        setIsCallActive(false);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      await axiosInstance().post('/api/calls/agent_hangup', {
        agent: sipExtension,
      });
    } catch (error) {
      console.error('Hangup failed', error);
    } finally {
      hangup();
      hangUp();
      resetCallState();
    }
  };

  const handleMuteToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const registrationColors: Record<string, string> = {
    registered: 'bg-green-500',
    registering: 'bg-yellow-500 animate-pulse',
    unregistered: 'bg-gray-500',
    error: 'bg-red-500',
  };

  // Determine status label
  const callStatusLabel = () => {
    if (!isCallActive) return null;
    if (callState === 'held')
      return { text: 'On Hold', color: 'bg-yellow-500/20 text-yellow-400' };
    if (customerAnswered || callStatus === SessionState.Established)
      return { text: 'Connected', color: 'bg-green-500/20 text-green-400' };
    return { text: 'Ringing...', color: 'bg-blue-500/20 text-blue-400' };
  };

  const statusInfo = callStatusLabel();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Phone Dialer</h2>
        <div className="flex items-center space-x-2 bg-dark-700 px-3 py-1.5 rounded-lg">
          <span
            className={`w-2 h-2 rounded-full ${registrationColors[sipStatus]}`}
          ></span>
          <span className="text-xs text-gray-300 capitalize">{sipStatus}</span>
        </div>
      </div>

      {/* Incoming Call Banner */}
      {isRinging && incomingInvitation && (
        <div className="card p-4 mb-4 border border-green-500/50 bg-green-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PhoneIncoming className="w-6 h-6 text-green-400 animate-pulse" />
              <div>
                <div className="text-sm text-gray-400">Incoming Call</div>
                <div className="text-lg font-semibold text-gray-100">
                  {callerNumber}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={answerIncoming}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Answer</span>
              </button>
              <button
                onClick={rejectIncoming}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        {/* Display */}
        <div className="mb-6">
          <div className="bg-dark-700 rounded-lg p-4 mb-4">
            <input
              type="text"
              value={isCallActive ? callerNumber || phoneNumber : phoneNumber}
              onChange={(e) => !isCallActive && setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full bg-transparent text-3xl text-center text-gray-100 focus:outline-none"
              readOnly={isCallActive}
            />
          </div>

          {/* Call Status Badge */}
          {isCallActive && statusInfo && (
            <div className="text-center">
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${statusInfo.color}`}
              >
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                <span className="font-medium">{statusInfo.text}</span>
                {/* Only show timer when customer answered */}
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

        {/* Call Controls */}
        {!isCallActive ? (
          <div className="flex gap-3">
            <button onClick={handleBackspace} className="btn-secondary flex-1">
              Backspace
            </button>
            <button
              onClick={handleCall}
              className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
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

            <button className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-gray-300">
              <Volume2 className="w-5 h-5 mx-auto" />
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
            >
              <PhoneOff className="w-5 h-5 mx-auto" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Dial */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Dial</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Support Line', number: '+1234567890' },
            { name: 'Manager', number: '+0987654321' },
            { name: 'IT Help', number: '+1122334455' },
            { name: 'HR Department', number: '+5544332211' },
          ].map((contact, index) => (
            <button
              key={index}
              onClick={() => setPhoneNumber(contact.number)}
              className="bg-dark-700 hover:bg-dark-600 p-3 rounded-lg text-left transition-colors"
              disabled={isCallActive}
            >
              <div className="text-sm font-medium text-gray-100">
                {contact.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">{contact.number}</div>
            </button>
          ))}
        </div>
      </div>
      <audio id="remoteAudio" autoPlay hidden />
    </div>
  );
};

export default Dialer;
