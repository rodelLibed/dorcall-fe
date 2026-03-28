import {
  UserAgent,
  Registerer,
  RegistererState,
  Inviter,
  Invitation,
  Session,
  SessionState,
  UserAgentOptions,
} from 'sip.js';
import { SessionDescriptionHandler } from 'sip.js/lib/platform/web';

export interface SipConfig {
  wsServer: string;
  sipDomain: string;
  extension: string;
  username: string;
  password: string;
  stunServers: Array<{ urls: string }>;
  turnServers: Array<{ urls: string; username: string; credential: string }>;
}

export type RegistrationState = 'unregistered' | 'registering' | 'registered' | 'error';
export type CallState = 'idle' | 'calling' | 'ringing' | 'active' | 'held' | 'ending';

export interface SipCallbacks {
  onRegistrationChange: (state: RegistrationState) => void;
  onIncomingCall: (callerNumber: string, session: Invitation) => void;
  onCallStateChange: (state: CallState) => void;
  onCallEnded: () => void;
}

let userAgent: UserAgent | null = null;
let registerer: Registerer | null = null;
let currentSession: Session | null = null;
let remoteAudio: HTMLAudioElement | null = null;
let callbacks: SipCallbacks | null = null;

function attachMedia(session: Session) {
  const sdh = session.sessionDescriptionHandler as SessionDescriptionHandler | undefined;
  if (!sdh) return;

  const peerConnection = sdh.peerConnection;
  if (!peerConnection) return;

  if (!remoteAudio) {
    remoteAudio = new Audio();
    remoteAudio.autoplay = true;
    document.body.appendChild(remoteAudio);
  }

  const remoteStream = new MediaStream();
  peerConnection.getReceivers().forEach((receiver) => {
    if (receiver.track) {
      remoteStream.addTrack(receiver.track);
    }
  });
  remoteAudio.srcObject = remoteStream;
}

function setupSessionListeners(session: Session) {
  currentSession = session;

  session.stateChange.addListener((state: SessionState) => {
    switch (state) {
      case SessionState.Establishing:
        callbacks?.onCallStateChange('calling');
        break;
      case SessionState.Established:
        callbacks?.onCallStateChange('active');
        attachMedia(session);
        break;
      case SessionState.Terminating:
        callbacks?.onCallStateChange('ending');
        break;
      case SessionState.Terminated:
        callbacks?.onCallStateChange('idle');
        callbacks?.onCallEnded();
        currentSession = null;
        break;
    }
  });
}

export function initialize(config: SipConfig, cb: SipCallbacks): void {
  callbacks = cb;

  const iceServers: RTCIceServer[] = [
    ...config.stunServers.map((s) => ({ urls: s.urls })),
    ...config.turnServers.map((t) => ({
      urls: t.urls,
      username: t.username,
      credential: t.credential,
    })),
  ];

  const uri = UserAgent.makeURI(`sip:${config.extension}@${config.sipDomain}`);
  if (!uri) {
    console.error('Failed to create SIP URI');
    callbacks.onRegistrationChange('error');
    return;
  }

  const options: UserAgentOptions = {
    uri,
    transportOptions: {
      server: config.wsServer,
    },
    authorizationUsername: config.extension,
    authorizationPassword: config.password,
    sessionDescriptionHandlerFactoryOptions: {
      peerConnectionConfiguration: {
        iceServers,
      },
    },
    delegate: {
      onInvite: (invitation: Invitation) => {
        setupSessionListeners(invitation);
        callbacks?.onCallStateChange('ringing');
        const callerUri = invitation.remoteIdentity.uri.user || 'Unknown';
        callbacks?.onIncomingCall(callerUri, invitation);
      },
    },
  };

  userAgent = new UserAgent(options);

  registerer = new Registerer(userAgent);
  registerer.stateChange.addListener((state: RegistererState) => {
    switch (state) {
      case RegistererState.Registered:
        callbacks?.onRegistrationChange('registered');
        break;
      case RegistererState.Unregistered:
        callbacks?.onRegistrationChange('unregistered');
        break;
      case RegistererState.Terminated:
        callbacks?.onRegistrationChange('unregistered');
        break;
    }
  });

  callbacks.onRegistrationChange('registering');

  userAgent
    .start()
    .then(() => registerer!.register())
    .catch((err) => {
      console.error('SIP registration failed:', err);
      callbacks?.onRegistrationChange('error');
    });
}

export function makeCall(target: string, sipDomain: string): void {
  if (!userAgent) {
    console.error('UserAgent not initialized');
    return;
  }

  const targetUri = UserAgent.makeURI(`sip:${target}@${sipDomain}`);
  if (!targetUri) {
    console.error('Invalid target URI');
    return;
  }

  const inviter = new Inviter(userAgent, targetUri);
  setupSessionListeners(inviter);

  inviter.invite().catch((err) => {
    console.error('Failed to make call:', err);
    callbacks?.onCallStateChange('idle');
  });
}

export function answerCall(invitation: Invitation): void {
  invitation.accept().catch((err) => {
    console.error('Failed to answer call:', err);
  });
}

export function rejectCall(invitation: Invitation): void {
  invitation.reject().catch((err) => {
    console.error('Failed to reject call:', err);
  });
}

export function hangUp(): void {
  if (!currentSession) return;

  switch (currentSession.state) {
    case SessionState.Initial:
    case SessionState.Establishing:
      if (currentSession instanceof Inviter) {
        currentSession.cancel();
      } else if (currentSession instanceof Invitation) {
        currentSession.reject();
      }
      break;
    case SessionState.Established:
      currentSession.bye().catch((err) => console.error('Hangup error:', err));
      break;
  }
}

export function toggleMute(): boolean {
  if (!currentSession) return false;

  const sdh = currentSession.sessionDescriptionHandler as SessionDescriptionHandler | undefined;
  if (!sdh || !sdh.peerConnection) return false;

  const senders = sdh.peerConnection.getSenders();
  const audioSender = senders.find((s) => s.track?.kind === 'audio');
  if (audioSender?.track) {
    audioSender.track.enabled = !audioSender.track.enabled;
    return !audioSender.track.enabled; // returns true if muted
  }
  return false;
}

export function toggleHold(): void {
  if (!currentSession || currentSession.state !== SessionState.Established) return;

  const sdh = currentSession.sessionDescriptionHandler as SessionDescriptionHandler | undefined;
  if (!sdh || !sdh.peerConnection) return;

  const pc = sdh.peerConnection;
  const senders = pc.getSenders();
  const isHeld = senders.some((s) => s.track && !s.track.enabled);

  senders.forEach((sender) => {
    if (sender.track) {
      sender.track.enabled = isHeld;
    }
  });

  callbacks?.onCallStateChange(isHeld ? 'active' : 'held');
}

export function sendDtmf(tone: string): void {
  if (!currentSession || currentSession.state !== SessionState.Established) return;

  const sdh = currentSession.sessionDescriptionHandler as SessionDescriptionHandler | undefined;
  if (!sdh || !sdh.peerConnection) return;

  const senders = sdh.peerConnection.getSenders();
  const audioSender = senders.find((s) => s.track?.kind === 'audio');
  if (audioSender?.dtmf) {
    audioSender.dtmf.insertDTMF(tone, 100, 70);
  }
}

export function cleanup(): void {
  if (currentSession) {
    hangUp();
  }
  if (registerer) {
    registerer.unregister().catch(() => {});
  }
  if (userAgent) {
    userAgent.stop().catch(() => {});
  }
  if (remoteAudio) {
    remoteAudio.srcObject = null;
    remoteAudio.remove();
    remoteAudio = null;
  }
  userAgent = null;
  registerer = null;
  currentSession = null;
  callbacks = null;
}
