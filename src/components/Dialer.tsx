import React, { useEffect, useState } from 'react';

import {
  Phone,
  PhoneOff,
  Volume2,
  Mic,
  MicOff,
  Pause,
  Play,
} from 'lucide-react';
import axiosInstance from '../helpers/axios';
import socket from '../helpers/socket';
const Dialer: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');

  const [channel, setChannel] = useState('');

  const handleNumberClick = (num: string) => {
    setPhoneNumber((prev) => prev + num);
  };

  useEffect(() => {
    socket.emit('join_Room', '1002');

    socket.on('receiveCallStats', (data) => {
      console.log('CALL STATUS:', data);

      // 👇 THIS updates your UI
      setIsCallActive(false);
    });

    return () => {
      socket.off('receiveCallStats');
    };
  }, []);
  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (phoneNumber) {
      setIsCallActive(true);
      try {
        await axiosInstance().post('/api/calls/outbound', {
          agent: 1002,
          target: phoneNumber,
        });
        // Start call logic here
      } catch (error) {
        console.error('Call failed', error);
        setIsCallActive(false);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      const res: any = await axiosInstance().post('/api/calls/agent_hangup', {
        agent: 1002,
      });
      if (res.data.data.success) {
        setIsCallActive(false);
        setIsMuted(false);
        setIsOnHold(false);
        setPhoneNumber('');
        setCallDuration('00:00');
      }
      // Start call logic here
    } catch (error) {
      console.error('Call failed', error);
      setIsCallActive(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Phone Dialer</h2>

      <div className="card p-6">
        {/* Display */}
        <div className="mb-6">
          <div className="bg-dark-700 rounded-lg p-4 mb-4">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full bg-transparent text-3xl text-center text-gray-100 focus:outline-none"
            />
          </div>

          {isCallActive && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Call Active</span>
                <span className="font-mono">{callDuration}</span>
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
                disabled={isCallActive}
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
              disabled={!phoneNumber}
              className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-lg transition-colors ${
                isMuted
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 mx-auto" />
              ) : (
                <Mic className="w-5 h-5 mx-auto" />
              )}
            </button>

            <button
              onClick={() => setIsOnHold(!isOnHold)}
              className={`p-4 rounded-lg transition-colors ${
                isOnHold
                  ? 'bg-yellow-600 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {isOnHold ? (
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
    </div>
  );
};

export default Dialer;
