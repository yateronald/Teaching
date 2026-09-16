import React, { useState } from 'react';
import { Button, Select, Switch } from 'antd';
import { VideoTrack, useLocalParticipant, useMediaDeviceSelect, useRoomContext, useTrackVolume } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { LocalAudioTrack } from 'livekit-client';
import { Ic, cleanDeviceLabel, colorFor, initials } from './meetingUi';
import { loadMediaChoices, saveMediaChoices } from './PreJoin';
import type { MediaChoices } from './PreJoin';

/* ══════════════════════════════════════════
   IN-CALL AUDIO & VIDEO SETTINGS
   Switches the devices of the live call through LiveKit (no second stream),
   and remembers the choice for the next class.
══════════════════════════════════════════ */

const remember = (patch: Partial<MediaChoices>) => saveMediaChoices({ ...loadMediaChoices(), ...patch });
const canPickSpeaker = typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;

const DeviceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } = useLocalParticipant();
  const mic = useMediaDeviceSelect({ kind: 'audioinput', room });
  const cam = useMediaDeviceSelect({ kind: 'videoinput', room });
  const out = useMediaDeviceSelect({ kind: 'audiooutput', room });
  const volume = useTrackVolume(microphoneTrack?.track as LocalAudioTrack | undefined);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = localParticipant.name || 'You';
  const preview = cameraTrack?.track && !cameraTrack.isMuted
    ? { participant: localParticipant, source: Track.Source.Camera, publication: cameraTrack }
    : null;

  const options = (list: MediaDeviceInfo[], fallback: string) =>
    list.map((d, i) => ({ value: d.deviceId, label: cleanDeviceLabel(d.label) || `${fallback} ${i + 1}` }));
  const valueIn = (list: MediaDeviceInfo[], id: string) => (list.some(d => d.deviceId === id) ? id : undefined);

  const choose = (select: ReturnType<typeof useMediaDeviceSelect>, key: keyof MediaChoices) => (id: string) => {
    setError(null);
    select.setActiveMediaDevice(id)
      .then(() => remember({ [key]: id } as Partial<MediaChoices>))
      .catch(() => setError('That device could not be used. Pick another one.'));
  };

  const toggle = (kind: 'mic' | 'cam') => async (on: boolean) => {
    setError(null);
    try {
      if (kind === 'mic') await localParticipant.setMicrophoneEnabled(on);
      else await localParticipant.setCameraEnabled(on);
      remember(kind === 'mic' ? { audioEnabled: on } : { videoEnabled: on });
    } catch (e: any) {
      setError(e?.name === 'NotAllowedError'
        ? `Your browser is blocking the ${kind === 'mic' ? 'microphone' : 'camera'}. Allow it from the address bar.`
        : `The ${kind === 'mic' ? 'microphone' : 'camera'} could not be started.`);
    }
  };

  const testSpeaker = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const Ctx: typeof AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const dest = ctx.createMediaStreamDestination();
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = ctx.currentTime + i * 0.17;
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.7);
        osc.connect(gain).connect(dest);
        osc.start(t0);
        osc.stop(t0 + 0.75);
      });
      const el = new Audio();
      el.srcObject = dest.stream;
      if (out.activeDeviceId && typeof (el as any).setSinkId === 'function') {
        await (el as any).setSinkId(out.activeDeviceId).catch(() => { });
      }
      await el.play();
      window.setTimeout(() => { el.pause(); ctx.close().catch(() => { }); setTesting(false); }, 1400);
    } catch {
      setTesting(false);
    }
  };

  return (
    <div className="mr-dialog-backdrop" onClick={onClose}>
      <div className="mr-dialog mr-settings" role="dialog" aria-modal="true" aria-label="Audio and video settings" onClick={e => e.stopPropagation()}>
        <header className="mr-dialog-head">
          <div>
            <h3>Audio &amp; video</h3>
            <p>Changes apply to the call right away.</p>
          </div>
          <button type="button" className="mr-dialog-close" onClick={onClose} aria-label="Close settings">{Ic.close}</button>
        </header>

        <div className="mr-settings-body">
          <div className="mr-settings-preview">
            {preview ? (
              <VideoTrack trackRef={preview} className="mr-settings-video" />
            ) : (
              <div className="mr-settings-off">
                <span className="mr-avatar" style={{ background: colorFor(name) }}>{initials(name)}</span>
                <span>Your camera is off</span>
              </div>
            )}
          </div>

          <div className="mr-settings-fields">
            <section className="mr-field">
              <div className="mr-field-head">
                <span>{Ic.cam} Camera</span>
                <Switch size="small" checked={isCameraEnabled} onChange={toggle('cam')} aria-label="Camera on" />
              </div>
              <Select value={valueIn(cam.devices, cam.activeDeviceId)} placeholder="Default camera" style={{ width: '100%' }}
                options={options(cam.devices, 'Camera')} onChange={choose(cam, 'videoDeviceId')} disabled={!cam.devices.length} />
            </section>

            <section className="mr-field">
              <div className="mr-field-head">
                <span>{Ic.mic} Microphone</span>
                <Switch size="small" checked={isMicrophoneEnabled} onChange={toggle('mic')} aria-label="Microphone on" />
              </div>
              <Select value={valueIn(mic.devices, mic.activeDeviceId)} placeholder="Default microphone" style={{ width: '100%' }}
                options={options(mic.devices, 'Microphone')} onChange={choose(mic, 'audioDeviceId')} disabled={!mic.devices.length} />
              <div className="mr-level" aria-hidden>
                <i style={{ transform: `scaleX(${isMicrophoneEnabled ? Math.min(1, volume * 2.5) : 0})` }} />
              </div>
              <span className="mr-field-hint">{isMicrophoneEnabled ? 'Speak — the bar moves when we hear you.' : 'Your microphone is muted.'}</span>
            </section>

            <section className="mr-field">
              <div className="mr-field-head"><span>{Ic.speaker} Speaker</span></div>
              <div className="mr-field-row">
                {canPickSpeaker && out.devices.length > 0 ? (
                  <Select value={valueIn(out.devices, out.activeDeviceId)} placeholder="Default speaker" style={{ flex: 1, minWidth: 0 }}
                    options={options(out.devices, 'Speaker')} onChange={choose(out, 'speakerDeviceId')} />
                ) : <span className="mr-field-static">System default speaker</span>}
                <Button onClick={testSpeaker} loading={testing}>Test</Button>
              </div>
            </section>

            {error && <div className="mr-field-error" role="alert">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettings;
