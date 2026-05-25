import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Select, Button, Tooltip } from 'antd';
import {
  AudioOutlined, AudioMutedOutlined, VideoCameraOutlined,
  VideoCameraAddOutlined, SoundOutlined, CheckCircleOutlined,
} from '@ant-design/icons';

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface DeviceSettingsProps {
  onReady?: (settings: { audioDeviceId: string; videoDeviceId: string; speakerDeviceId: string; audioEnabled: boolean; videoEnabled: boolean }) => void;
  /** Compact = no video preview, used inside the in-meeting settings drawer.
   *  Preview-only = no controls, used when parent (the redesigned prejoin
   *  screen) is rendering its own preview. */
  compact?: boolean;
  variant?: 'full' | 'controls-only' | 'preview-only';
  /** When true, renders against a dark background (in-meeting settings panel)
   *  rather than a white card. */
  dark?: boolean;
}

const DeviceSettings: React.FC<DeviceSettingsProps> = ({
  onReady,
  compact = false,
  variant = 'full',
  dark = false,
}) => {
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([]);
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<DeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [speakerTestPlaying, setSpeakerTestPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);

  // Enumerate devices
  const loadDevices = useCallback(async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(() => null);
      const devices = await navigator.mediaDevices.enumerateDevices();

      const mics = devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 6)}`, kind: d.kind }));
      const cams = devices.filter(d => d.kind === 'videoinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 6)}`, kind: d.kind }));
      const spks = devices.filter(d => d.kind === 'audiooutput').map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.slice(0, 6)}`, kind: d.kind }));

      setMicrophones(mics);
      setCameras(cams);
      setSpeakers(spks);

      if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
      if (cams.length > 0 && !selectedCamera) setSelectedCamera(cams[0].deviceId);
      if (spks.length > 0 && !selectedSpeaker) setSelectedSpeaker(spks[0].deviceId);

      tempStream?.getTracks().forEach(t => t.stop());
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  }, [selectedMic, selectedCamera, selectedSpeaker]);

  useEffect(() => { loadDevices(); }, []);

  // Start preview stream when device changes
  useEffect(() => {
    if (!selectedMic && !selectedCamera) return;

    const startPreview = async () => {
      streamRef.current?.getTracks().forEach(t => t.stop());

      try {
        const constraints: MediaStreamConstraints = {};
        if (selectedMic && audioEnabled) {
          constraints.audio = { deviceId: { exact: selectedMic } };
        }
        if (selectedCamera && videoEnabled) {
          constraints.video = { deviceId: { exact: selectedCamera }, width: { ideal: 640 }, height: { ideal: 360 } };
        }

        if (!constraints.audio && !constraints.video) return;

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current && videoEnabled) {
          videoRef.current.srcObject = stream;
        }

        if (audioEnabled && stream.getAudioTracks().length > 0) {
          startAudioMeter(stream);
        }
      } catch (err) {
        console.error('Failed to start preview:', err);
      }
    };

    startPreview();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedMic, selectedCamera, audioEnabled, videoEnabled]);

  const startAudioMeter = (stream: MediaStream) => {
    cancelAnimationFrame(animFrameRef.current);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
      const rms = Math.sqrt(sum / dataArray.length);
      const level = Math.min(100, Math.round((rms / 128) * 100));
      setMicLevel(level);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const testSpeaker = () => {
    setSpeakerTestPlaying(true);
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 1.5);
    setTimeout(() => {
      setSpeakerTestPlaying(false);
      ctx.close();
    }, 1600);
  };

  useEffect(() => {
    if (onReady) {
      onReady({ audioDeviceId: selectedMic, videoDeviceId: selectedCamera, speakerDeviceId: selectedSpeaker, audioEnabled, videoEnabled });
    }
  }, [selectedMic, selectedCamera, selectedSpeaker, audioEnabled, videoEnabled]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  // ── PREVIEW-ONLY (used by the new prejoin layout that owns its own
  //    container and just wants the video tile) ──
  if (variant === 'preview-only') {
    return (
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        borderRadius: 14, overflow: 'hidden',
        background: '#0f172a',
      }}>
        {videoEnabled ? (
          <video ref={videoRef} autoPlay muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b, #334155)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, color: '#fff',
              boxShadow: '0 8px 24px rgba(67,56,202,0.4)',
            }}>
              📷
            </div>
          </div>
        )}
        {/* Mic-active indicator overlay (top-left) */}
        {audioEnabled && micLevel > 5 && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(34,197,94,0.9)',
            color: '#fff', fontSize: 10.5, fontWeight: 700,
            backdropFilter: 'blur(6px)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
            Mic active
          </div>
        )}
        {/* Floating toggles (bottom center) */}
        <div style={{
          position: 'absolute', bottom: 12, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 8,
        }}>
          <Tooltip title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
            <button onClick={() => setAudioEnabled(!audioEnabled)}
              style={{
                width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                background: audioEnabled ? 'rgba(255,255,255,0.18)' : '#ef4444',
                color: '#fff', backdropFilter: 'blur(8px)',
                transition: 'all 0.18s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}>
              {audioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            </button>
          </Tooltip>
          <Tooltip title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}>
            <button onClick={() => setVideoEnabled(!videoEnabled)}
              style={{
                width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                background: videoEnabled ? 'rgba(255,255,255,0.18)' : '#ef4444',
                color: '#fff', backdropFilter: 'blur(8px)',
                transition: 'all 0.18s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}>
              {videoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  // ── CONTROLS-ONLY or FULL ──
  // Color tokens
  const labelColor = dark ? '#94a3b8' : '#475569';
  const subtleColor = dark ? '#64748b' : '#94a3b8';
  const successColor = '#22c55e';
  const successBg = dark ? 'rgba(34,197,94,0.12)' : '#dcfce7';

  const labelStyle: React.CSSProperties = {
    fontSize: 10.5, fontWeight: 800, color: labelColor,
    textTransform: 'uppercase' as const, letterSpacing: 0.6,
    marginBottom: 6,
    display: 'flex', alignItems: 'center', gap: 6,
  };
  const sectionStyle: React.CSSProperties = {
    paddingBottom: compact ? 10 : 12,
  };

  return (
    <div style={{ color: dark ? '#e2e8f0' : '#0f172a', display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14 }}>
      {/* Compact preview tile (only when variant === 'full' AND not the
          new prejoin which uses preview-only) */}
      {variant === 'full' && !compact && (
        <div style={{
          marginBottom: 4, borderRadius: 12, overflow: 'hidden',
          background: '#0f172a', aspectRatio: '16/9', position: 'relative',
        }}>
          {videoEnabled ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff' }}>📷</div>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            <button onClick={() => setAudioEnabled(!audioEnabled)}
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: audioEnabled ? 'rgba(255,255,255,0.15)' : '#ef4444', color: '#fff', backdropFilter: 'blur(8px)' }}>
              {audioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            </button>
            <button onClick={() => setVideoEnabled(!videoEnabled)}
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: videoEnabled ? 'rgba(255,255,255,0.15)' : '#ef4444', color: '#fff', backdropFilter: 'blur(8px)' }}>
              <VideoCameraOutlined />
            </button>
          </div>
        </div>
      )}

      {/* Microphone */}
      <div style={sectionStyle}>
        <div style={labelStyle}>
          <AudioOutlined style={{ color: '#6366f1', fontSize: 12 }} /> Microphone
        </div>
        <Select value={selectedMic} onChange={setSelectedMic} style={{ width: '100%', marginBottom: 8 }} size="middle"
          options={microphones.map(m => ({ value: m.deviceId, label: m.label }))}
        />
        {/* Mic level meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, height: 6, borderRadius: 999,
            background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 999, transition: 'width 0.05s, background 0.18s',
              width: `${micLevel}%`,
              background: micLevel > 60 ? '#ef4444' : micLevel > 30 ? '#f59e0b' : successColor,
            }} />
          </div>
          {micLevel > 5 ? (
            <span style={{
              fontSize: 10, fontWeight: 700, color: successColor,
              padding: '2px 8px', borderRadius: 999, background: successBg,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              whiteSpace: 'nowrap',
            }}>
              <CheckCircleOutlined style={{ fontSize: 10 }} /> Working
            </span>
          ) : (
            <span style={{ fontSize: 10, color: subtleColor, minWidth: 40, textAlign: 'right' }}>
              Speak to test
            </span>
          )}
        </div>
      </div>

      {/* Speaker / Headset */}
      <div style={sectionStyle}>
        <div style={labelStyle}>
          <SoundOutlined style={{ color: '#f59e0b', fontSize: 12 }} /> Speaker
        </div>
        {speakers.length > 0 ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <Select value={selectedSpeaker} onChange={setSelectedSpeaker} style={{ flex: 1 }} size="middle"
              options={speakers.map(s => ({ value: s.deviceId, label: s.label }))}
            />
            <Tooltip title={speakerTestPlaying ? 'Playing test tone…' : 'Play a test tone'}>
              <Button size="middle" icon={<SoundOutlined />} onClick={testSpeaker} loading={speakerTestPlaying}
                style={{
                  borderRadius: 8, fontSize: 11, fontWeight: 700,
                  color: '#f59e0b',
                  borderColor: dark ? 'rgba(245,158,11,0.4)' : '#fde68a',
                  background: dark ? 'rgba(245,158,11,0.1)' : '#fffbeb',
                  flexShrink: 0,
                }}>
                Test
              </Button>
            </Tooltip>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: subtleColor }}>
            Default system speaker (browser doesn't support speaker selection)
          </div>
        )}
      </div>

      {/* Camera */}
      <div style={{ ...sectionStyle, paddingBottom: 0 }}>
        <div style={labelStyle}>
          <VideoCameraOutlined style={{ color: '#22c55e', fontSize: 12 }} /> Camera
        </div>
        <Select value={selectedCamera} onChange={setSelectedCamera} style={{ width: '100%' }} size="middle"
          options={cameras.map(c => ({ value: c.deviceId, label: c.label }))}
        />
      </div>
    </div>
  );
};

export default DeviceSettings;
