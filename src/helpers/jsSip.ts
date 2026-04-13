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

      const session = new Inviter(uaRef.current, target, {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false },
        },
      });
      sessionRef.current = session;

      const attachRemoteAudio = (stream: MediaStream) => {
        console.log('🔊 Attaching remote audio, tracks:', stream.getTracks().length);
        let audio = document.getElementById('remoteAudio') as HTMLAudioElement | null;
        if (!audio) {
          audio = document.createElement('audio');
          audio.id = 'remoteAudio';
          audio.autoplay = true;
          document.body.appendChild(audio);
        }
        audio.srcObject = stream;
        audio.play()
          .then(() => console.log('🔊 Audio playing ✅'))
          .catch((err) => console.error('❌ Audio play() blocked:', err));
      };

      // Wire up ICE listener as soon as the session starts establishing
      // so we don't miss transitions that happen before Established fires
      const wireIceListener = () => {
        const pc = (session.sessionDescriptionHandler as any)
          ?.peerConnection as RTCPeerConnection | undefined;
        if (!pc) return false;
        pc.addEventListener('iceconnectionstatechange', () => {
          console.log('🧊 ICE state:', pc.iceConnectionState, '| Gathering:', pc.iceGatheringState);
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            console.log('✅ ICE connected — RTP should flow now');
          }
          if (pc.iceConnectionState === 'failed') {
            console.error('❌ ICE FAILED — Windows Firewall is likely blocking UDP 10000-20000 to WSL2. Run: New-NetFirewallRule -DisplayName "Asterisk RTP" -Direction Inbound -Protocol UDP -LocalPort 10000-20000 -Action Allow');
          }
        });
        console.log('🧊 ICE listener wired | current state:', pc.iceConnectionState);
        return true;
      };

      session.stateChange.addListener((state: SessionState) => {
        console.log('📞 Call state:', state);
        setCallStatus(state);

        if (state === SessionState.Establishing) {
          // SDH is created during invite() — try to wire ICE listener early
          setTimeout(() => wireIceListener(), 100);
        }

        if (state === SessionState.Established) {
          const pc = (session.sessionDescriptionHandler as any)
            ?.peerConnection as RTCPeerConnection | undefined;

          console.log('🔗 PC exists:', !!pc, '| ICE:', pc?.iceConnectionState);

          if (pc) {
            // Wire ICE listener if not already wired in Establishing
            wireIceListener();

            // ontrack fires after ICE + DTLS complete
            pc.addEventListener('track', (event: RTCTrackEvent) => {
              console.log('🎵 Track received:', event.track.kind, '| streams:', event.streams.length);
              if (event.track.kind === 'audio') {
                attachRemoteAudio(event.streams[0] ?? new MediaStream([event.track]));
              }
            });

            // Fallback: tracks may already be available
            const audioTracks = pc.getReceivers()
              .filter((r) => r.track?.kind === 'audio')
              .map((r) => r.track);
            console.log('🔊 Existing audio receivers at Established:', audioTracks.length);
            if (audioTracks.length > 0) {
              attachRemoteAudio(new MediaStream(audioTracks));
            }
          }
        }

        if (state === SessionState.Terminated) {
          sessionRef.current = null;
          setCallStatus('idle');
          const audio = document.getElementById('remoteAudio') as HTMLAudioElement | null;
          if (audio) audio.srcObject = null;
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
