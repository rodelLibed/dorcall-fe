import { useEffect, useRef, useState, useCallback } from 'react';
import {
  UserAgent,
  Registerer,
  Inviter,
  Session,
  SessionState,
  UserAgentOptions,
  RegistererState,
} from 'sip.js';

export type SipStatus = 'idle' | 'registering' | 'registered' | 'error';
export type CallStatus = SessionState | 'idle';

interface UseSipOptions {
  uri: string;
  wsServer: string;
  username: string;
  password: string;
  domain?: string; // ← optional, defaults to 127.0.0.1
}

export function useSip({
  uri,
  wsServer,
  username,
  password,
  domain = '127.0.0.1',
}: UseSipOptions) {
  const uaRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Session | null>(null);

  const [sipStatus, setSipStatus] = useState<SipStatus>('idle');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');

  useEffect(() => {
    const parsedUri = UserAgent.makeURI(uri);
    if (!parsedUri) {
      console.error('❌ Invalid SIP URI:', uri);
      setSipStatus('error');
      return;
    }

    const options: UserAgentOptions = {
      uri: parsedUri,
      transportOptions: {
        server: wsServer,
        traceSip: true,
      },
      authorizationUsername: username,
      authorizationPassword: password,
      logLevel: 'debug',
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        },
      },
    };

    const ua = new UserAgent(options);
    uaRef.current = ua;

    ua.start()
      .then(() => {
        console.log('✅ UA started');
        setSipStatus('registering');

        const registerer = new Registerer(ua, {
          expires: 300,
        });
        registererRef.current = registerer;

        registerer.stateChange.addListener((state: RegistererState) => {
          console.log('📋 Registerer state:', state);
          if (state === RegistererState.Registered) {
            setSipStatus('registered');
          } else if (state === RegistererState.Unregistered) {
            setSipStatus('idle');
          } else if (state === RegistererState.Terminated) {
            setSipStatus('error');
          }
        });

        registerer.register().catch((err) => {
          console.error('❌ Register failed:', err);
          setSipStatus('error');
        });
      })
      .catch((err) => {
        console.error('❌ UA start failed:', err);
        setSipStatus('error');
      });

    return () => {
      registererRef.current?.unregister().catch(() => {});
      ua.stop().catch(() => {});
    };
  }, [uri, wsServer, username, password]);

  const call = useCallback(
    (targetUri: string) => {
      if (!uaRef.current) {
        console.error('❌ UA not initialized');
        return;
      }

      // ← Auto-build full SIP URI if only extension number passed
      const fullUri = targetUri.includes('@')
        ? targetUri
        : `sip:${targetUri}@${domain}`;

      console.log('📞 Calling:', fullUri);

      const target = UserAgent.makeURI(fullUri);
      if (!target) {
        console.error('❌ Invalid target URI:', fullUri);
        return;
      }

      const session = new Inviter(uaRef.current, target);
      sessionRef.current = session;

      session.stateChange.addListener((state: SessionState) => {
        console.log('📞 Call state:', state);
        setCallStatus(state);

        if (state === SessionState.Terminated) {
          sessionRef.current = null;
          setCallStatus('idle');
        }

        // ← ADD THIS BLOCK
        if (state === SessionState.Established) {
          const pc = (session.sessionDescriptionHandler as any)?.peerConnection;
          if (pc) {
            const remoteStream = new MediaStream();
            pc.getReceivers().forEach((receiver: RTCRtpReceiver) => {
              if (receiver.track) {
                remoteStream.addTrack(receiver.track);
              }
            });

            // Attach to audio element
            let audio = document.getElementById(
              'remoteAudio'
            ) as HTMLAudioElement;
            if (!audio) {
              audio = document.createElement('audio');
              audio.id = 'remoteAudio';
              audio.autoplay = true;
              document.body.appendChild(audio);
            }
            audio.srcObject = remoteStream;
            audio
              .play()
              .catch((err) => console.error('❌ Audio play failed:', err));
            console.log('🔊 Remote audio attached');
          }
        }
        // ← END OF ADDED BLOCK

        if (state === SessionState.Terminated) {
          sessionRef.current = null;
          setCallStatus('idle');

          // Clean up audio
          const audio = document.getElementById(
            'remoteAudio'
          ) as HTMLAudioElement;
          if (audio) {
            audio.srcObject = null;
          }
        }
      });

      session.invite().catch((err) => {
        console.error('❌ Invite failed:', err);
        setCallStatus('idle');
      });
    },
    [domain]
  );

  const hangup = useCallback(() => {
    if (!sessionRef.current) return;

    const session = sessionRef.current;
    const state = session.state;

    if (state === SessionState.Established) {
      session.bye().catch(console.error);
    } else if (
      state === SessionState.Establishing ||
      state === SessionState.Initial
    ) {
      (session as Inviter).cancel().catch(console.error);
    }

    sessionRef.current = null;
    setCallStatus('idle');
  }, []);

  return { sipStatus, callStatus, call, hangup };
}
