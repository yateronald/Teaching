import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Select, Button } from 'antd';
import {
  AudioOutlined, AudioMutedOutlined, VideoCameraOutlined,
  SoundOutlined, CheckCircleOutlined,
} from '@ant-design/icons';

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface DeviceSettingsProps {
  onReady?: (settings: { audioDeviceId: string; videoDeviceId: string; speakerDeviceId: string; audioEnabled: boolean; videoEnabled: boolean }) => void;
  compact?: boolean;
}

const DeviceSettings: React.FC<DeviceSettingsProps> = ({ onReady, compact = false }) => {
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
      // Request permission first to get labels
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

      // Release temp stream
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
      // Stop previous stream
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

        // Video preview
        if (videoRef.current && videoEnabled) {
          videoRef.current.srcObject = stream;
        }

        // Audio level meter
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

  // Audio level meter using Web Audio API
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
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
      const rms = Math.sqrt(sum / dataArray.length);
      const level = Math.min(100, Math.round((rms / 128) * 100));
      setMicLevel(level);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  // Speaker test — play a short tone
  const testSpeaker = () => {
    setSpeakerTestPlaying(true);
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
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

  // Notify parent of settings
  useEffect(() => {
    if (onReady) {
      onReady({ audioDeviceId: selectedMic, videoDeviceId: selectedCamera, speakerDeviceId: selectedSpeaker, audioEnabled, videoEnabled });
    }
  }, [selectedMic, selectedCamera, selectedSpeaker, audioEnabled, videoEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  const sectionStyle: React.CSSProperties = {
    padding: compact ? '8px 0' : '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const,
    letterSpacing: 0.5, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
  };

  return (
    <div style={{ color: '#e2e8f0' }}>
      {/* Video Preview */}
      {!compact && (
        <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: '#1e293b', aspectRatio: '16/9', position: 'relative' }}>
          {videoEnabled ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff' }}>
                👤
              </div>
            </div>
          )}
          {/* Toggle overlays */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            <button onClick={() => setAudioEnabled(!audioEnabled)}
              style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: audioEnabled ? 'rgba(255,255,255,0.15)' : '#ef4444', color: '#fff', backdropFilter: 'blur(8px)' }}>
              {audioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            </button>
            <button onClick={() => setVideoEnabled(!videoEnabled)}
              style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: videoEnabled ? 'rgba(255,255,255,0.15)' : '#ef4444', color: '#fff', backdropFilter: 'blur(8px)' }}>
              <VideoCameraOutlined />
            </button>
          </div>
        </div>
      )}

      {/* Microphone */}
      <div style={sectionStyle}>
        <div style={labelStyle}>
          <AudioOutlined style={{ color: '#6366f1' }} /> Microphone
        </div>
        <Select value={selectedMic} onChange={setSelectedMic} style={{ width: '100%', marginBottom: 8 }}
          options={microphones.map(m => ({ value: m.deviceId, label: m.label }))}
          dropdownStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }}
        />
        {/* Mic level meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AudioOutlined style={{ color: micLevel > 10 ? '#22c55e' : '#64748b', fontSize: 14 }} />
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3, transition: 'width 0.05s',
              width: `${micLevel}%`,
              background: micLevel > 60 ? '#ef4444' : micLevel > 30 ? '#f59e0b' : '#22c55e',
            }} />
          </div>
          <span style={{ fontSize: 10, color: '#64748b', minWidth: 28, textAlign: 'right' }}>{micLevel}%</span>
        </div>
        {micLevel > 5 && (
          <div style={{ fontSize: 10, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircleOutlined /> Microphone is working
          </div>
        )}
      </div>

      {/* Speaker / Headset */}
      <div style={sectionStyle}>
        <div style={labelStyle}>
          <SoundOutlined style={{ color: '#f59e0b' }} /> Speaker / Headset
        </div>
        {speakers.length > 0 ? (
          <Select value={selectedSpeaker} onChange={setSelectedSpeaker} style={{ width: '100%', marginBottom: 8 }}
            options={speakers.map(s => ({ value: s.deviceId, label: s.label }))}
            dropdownStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }}
          />
        ) : (
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Default speaker (browser does not support speaker selection)</div>
        )}
        <Button size="small" icon={<SoundOutlined />} onClick={testSpeaker} loading={speakerTestPlaying}
          style={{ borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>
          {speakerTestPlaying ? 'Playing...' : 'Test Speaker'}
        </Button>
      </div>

      {/* Camera */}
      <div style={{ ...sectionStyle, borderBottom: 'none' }}>
        <div style={labelStyle}>
          <VideoCameraOutlined style={{ color: '#22c55e' }} /> Camera
        </div>
        <Select value={selectedCamera} onChange={setSelectedCamera} style={{ width: '100%' }}
          options={cameras.map(c => ({ value: c.deviceId, label: c.label }))}
          dropdownStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }}
        />
      </div>
    </div>
  );
};

export default DeviceSettings;
