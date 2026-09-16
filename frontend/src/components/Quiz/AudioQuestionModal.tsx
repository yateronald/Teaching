import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Input, InputNumber, Modal, Segmented, Select, Upload } from 'antd';
import {
    AudioOutlined, CheckCircleFilled, CloseOutlined, CloudUploadOutlined, DeleteOutlined, ExclamationCircleOutlined, LoadingOutlined,
    SoundOutlined, ThunderboltOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { plural, questionFromGenerated, uid } from './quizModel';
import type { DraftClip, DraftQuestion } from './quizModel';
import '../Teacher/Teacher.css';
import './Quiz.css';

/* ══════════════════════════════════════════
   LISTENING SECTION — the audio for a group of questions.
   Generated voice or an uploaded recording, how often students may play it,
   and (optionally) a first set of questions written from the transcript.
══════════════════════════════════════════ */

interface Props {
    open: boolean;
    quizTitle?: string;
    /** The clip being edited, or null for a new section. */
    clip: DraftClip | null;
    onClose: () => void;
    onSave: (clip: DraftClip, generated: DraftQuestion[]) => void;
}

interface Audio {
    sourceType: 'tts' | 'upload';
    kdriveFileId: string;
    fileName?: string;
    durationSeconds?: number;
    /** What the generated voice actually says — used to spot a transcript edited after generation. */
    spoken?: { transcript: string; voice: string };
}

// Must match the backend's VOICE_OPTIONS.
const VOICES = [
    { value: 'Kore', label: 'Kore', hint: 'Female · clear, neutral' },
    { value: 'Aoede', label: 'Aoede', hint: 'Female · warm, expressive' },
    { value: 'Leda', label: 'Leda', hint: 'Female · soft, gentle' },
    { value: 'Zephyr', label: 'Zephyr', hint: 'Female · light, airy' },
    { value: 'Puck', label: 'Puck', hint: 'Male · upbeat, friendly' },
    { value: 'Charon', label: 'Charon', hint: 'Male · deep, authoritative' },
    { value: 'Fenrir', label: 'Fenrir', hint: 'Male · strong, clear' },
    { value: 'Orus', label: 'Orus', hint: 'Male · rich, formal' },
];
const MAX_UPLOAD_MB = 50;
const ACCEPT = '.mp3,.wav,.ogg,.m4a,.webm';
const TRANSCRIPT_MAX = 5000;
/** "40 s", "1 min 05 s" */
const fmtSpoken = (s: number) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`);

const readDuration = (file: File) => new Promise<number | undefined>(resolve => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('audio');
    const done = (v?: number) => { URL.revokeObjectURL(url); resolve(v && Number.isFinite(v) ? Math.round(v) : undefined); };
    el.preload = 'metadata';
    el.onloadedmetadata = () => done(el.duration);
    el.onerror = () => done();
    el.src = url;
});

const AudioQuestionModal: React.FC<Props> = ({ open, quizTitle, clip, onClose, onSave }) => {
    const { apiCall } = useAuth();
    const editing = !!clip;

    // State is seeded once per opening — the modal is mounted only while open.
    const [source, setSource] = useState<'tts' | 'upload'>(clip?.sourceType ?? 'tts');
    const [transcript, setTranscript] = useState(clip?.transcript && !clip.transcript.startsWith('[Uploaded') ? clip.transcript : '');
    const [voice, setVoice] = useState(clip?.voiceName || 'Kore');
    const [maxPlays, setMaxPlays] = useState(clip?.maxPlays ?? 0);
    const [audio, setAudio] = useState<Audio | null>(clip?.kdriveFileId ? {
        sourceType: clip.sourceType, kdriveFileId: clip.kdriveFileId, fileName: clip.fileName, durationSeconds: clip.durationSeconds,
        spoken: clip.sourceType === 'tts' ? { transcript: clip.transcript, voice: clip.voiceName } : undefined,
    } : null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [busy, setBusy] = useState<null | 'voice' | 'upload' | 'preview' | 'questions'>(null);
    const [error, setError] = useState<string | null>(null);
    const [withAI, setWithAI] = useState(!editing);
    const [aiCount, setAiCount] = useState(4);
    const [aiPoints, setAiPoints] = useState(8);
    const urlRef = useRef<string | null>(null);

    const showPreview = (url: string | null) => {
        if (urlRef.current && urlRef.current !== url) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setPreviewUrl(url);
    };
    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

    const text = transcript.trim();
    // Read aloud at a teaching pace, French runs at roughly 150 words a minute.
    const spokenSeconds = text ? Math.max(1, Math.round(text.split(/\s+/).length / 2.5)) : 0;
    const stale = !!audio && audio.sourceType === 'tts' && !!audio.spoken && (audio.spoken.transcript.trim() !== text || audio.spoken.voice !== voice);
    const aiPossible = text.length >= 20;

    const generateVoice = async () => {
        if (!text) return;
        setBusy('voice');
        setError(null);
        try {
            const res = await apiCall('/quizzes/audio/generate', { method: 'POST', body: JSON.stringify({ transcript: text, voiceName: voice, quizTitle: quizTitle || 'quiz' }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.audio?.kdriveFileId) throw new Error(data?.error || 'The audio could not be generated.');
            setAudio({ sourceType: 'tts', kdriveFileId: String(data.audio.kdriveFileId), fileName: data.audio.fileName, durationSeconds: data.audio.durationSeconds, spoken: { transcript: text, voice } });
            if (data.audio.wavBase64) {
                const bytes = Uint8Array.from(atob(data.audio.wavBase64), c => c.charCodeAt(0));
                showPreview(URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
            } else {
                showPreview(null);
            }
        } catch (e: any) {
            setError(e?.message || 'The audio could not be generated.');
        } finally {
            setBusy(null);
        }
    };

    const upload = async (file: File) => {
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) { setError(`That file is larger than ${MAX_UPLOAD_MB} MB.`); return; }
        setBusy('upload');
        setError(null);
        try {
            const body = new FormData();
            body.append('audio', file);
            const [res, durationSeconds] = await Promise.all([apiCall('/quizzes/audio/upload', { method: 'POST', body }), readDuration(file)]);
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.audio?.kdriveFileId) throw new Error(data?.error || 'The recording could not be uploaded.');
            setAudio({ sourceType: 'upload', kdriveFileId: String(data.audio.kdriveFileId), fileName: data.audio.fileName || file.name, durationSeconds });
            showPreview(URL.createObjectURL(file));
        } catch (e: any) {
            setError(e?.message || 'The recording could not be uploaded.');
        } finally {
            setBusy(null);
        }
    };

    const loadPreview = async () => {
        if (!audio) return;
        setBusy('preview');
        try {
            const res = await apiCall(`/quizzes/audio/preview/${audio.kdriveFileId}`);
            if (!res.ok) throw new Error();
            showPreview(URL.createObjectURL(await res.blob()));
        } catch {
            setError('The audio could not be loaded for playback.');
        } finally {
            setBusy(null);
        }
    };

    const removeAudio = () => { setAudio(null); showPreview(null); };

    const save = async () => {
        if (!audio || stale) return;
        setError(null);
        let generated: DraftQuestion[] = [];
        if (withAI && aiPossible) {
            setBusy('questions');
            try {
                const single = Math.max(1, Math.ceil(aiCount * 0.6));
                const res = await apiCall('/quizzes/ai-generate', {
                    method: 'POST',
                    body: JSON.stringify({
                        totalQuestions: aiCount,
                        singleChoiceCount: Math.min(aiCount, single),
                        multipleChoiceCount: 0,
                        yesNoCount: Math.max(0, aiCount - single),
                        totalPoints: aiPoints,
                        userPrompt: `Listening comprehension questions for a French audio recording. Students hear the audio but never see this transcript, so every question must be answerable from listening. Test key details, the main idea, vocabulary in context and simple inference.\n\nTranscript:\n"""${text.slice(0, 700)}"""`,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || 'The questions could not be generated.');
                generated = (Array.isArray(data?.questions) ? data.questions : []).map(questionFromGenerated);
                if (!generated.length) throw new Error('The AI returned no usable questions.');
            } catch (e: any) {
                setError(`${e?.message || 'The questions could not be generated.'} Untick “Write questions with AI” to save the section and write them yourself.`);
                setBusy(null);
                return;
            }
            setBusy(null);
        }
        onSave({
            key: clip?.key ?? uid('c'),
            id: clip?.id,
            transcript: text,
            voiceName: audio.sourceType === 'tts' ? voice : '',
            sourceType: audio.sourceType,
            kdriveFileId: audio.kdriveFileId,
            fileName: audio.fileName,
            durationSeconds: audio.durationSeconds,
            maxPlays,
        }, generated);
    };

    const working = busy !== null && busy !== 'preview';
    const saveLabel = withAI && aiPossible ? `Write ${plural(aiCount, 'question')} & ${editing ? 'save' : 'add'}` : editing ? 'Save section' : 'Add section';

    return (
        <Modal open={open} onCancel={() => !working && onClose()} footer={null} closable={false} title={null} centered destroyOnHidden
            width="min(720px, calc(100vw - 24px))" wrapClassName="tc-modal qz-modal" styles={{ body: { padding: 0 } }} maskClosable={!working}>
            <div className="qz-mod">
                <header className="qz-mod-head">
                    <span className="qz-mod-ic is-audio"><SoundOutlined /></span>
                    <div>
                        <h2>{editing ? 'Edit listening section' : 'New listening section'}</h2>
                        <p>Students hear the audio, then answer the questions in this section.</p>
                    </div>
                    <Button type="text" icon={<CloseOutlined />} onClick={onClose} disabled={working} aria-label="Close" />
                </header>

                <div className="qz-mod-body">
                    {/* 1 · Audio */}
                    <section className="qz-step">
                        <h3><span>1</span> Audio</h3>
                        <Segmented block value={source} disabled={!!audio || working} onChange={v => setSource(v as 'tts' | 'upload')}
                            options={[{ value: 'tts', label: 'Generate a voice' }, { value: 'upload', label: 'Upload a recording' }]} />
                        {audio && <p className="qz-hint">Remove the current audio to switch source.</p>}

                        <div className="qz-field">
                            <div className="qz-label-row">
                                <label htmlFor="qz-transcript">
                                    {source === 'tts' ? 'French text to read aloud' : 'Transcript'} {source === 'upload' && <em>optional — needed to write questions with AI</em>}
                                </label>
                                <span id="qz-transcript-count" className={`qz-count${transcript.length > TRANSCRIPT_MAX * 0.9 ? ' is-near' : ''}`}>
                                    {source === 'tts' && spokenSeconds > 0 && <><span>≈ {fmtSpoken(spokenSeconds)} spoken</span>{' '}<i aria-hidden>·</i>{' '}</>}
                                    <span>{transcript.length.toLocaleString('en-US')} / {TRANSCRIPT_MAX.toLocaleString('en-US')}</span>
                                </span>
                            </div>
                            <Input.TextArea id="qz-transcript" aria-describedby="qz-transcript-count" autoSize={{ minRows: 4, maxRows: 10 }} maxLength={TRANSCRIPT_MAX} value={transcript}
                                placeholder={source === 'tts' ? 'Bonjour à tous ! Aujourd’hui, je vais vous parler de…' : 'Paste what is said in the recording'}
                                onChange={e => setTranscript(e.target.value)} disabled={working} />
                        </div>

                        {source === 'tts' ? (
                            <div className="qz-voice-row">
                                <Select className="qz-voice" value={voice} onChange={setVoice} disabled={working} aria-label="Voice"
                                    options={VOICES.map(v => ({ value: v.value, label: v.label, hint: v.hint }))}
                                    optionRender={o => <span className="qz-batch-opt"><span>{o.data.label}</span><em>{o.data.hint}</em></span>} />
                                <Button type={audio && !stale ? 'default' : 'primary'} icon={busy === 'voice' ? <LoadingOutlined /> : <AudioOutlined />}
                                    disabled={!text || working} onClick={generateVoice}>
                                    {busy === 'voice' ? 'Generating…' : audio ? 'Regenerate audio' : 'Generate audio'}
                                </Button>
                            </div>
                        ) : !audio && (
                            <Upload.Dragger accept={ACCEPT} showUploadList={false} multiple={false} disabled={working}
                                beforeUpload={file => { upload(file); return Upload.LIST_IGNORE; }}>
                                <p className="ant-upload-drag-icon">{busy === 'upload' ? <LoadingOutlined /> : <CloudUploadOutlined />}</p>
                                <p className="ant-upload-text">{busy === 'upload' ? 'Uploading…' : 'Drop a recording here, or click to choose'}</p>
                                <p className="ant-upload-hint">MP3, WAV, OGG, M4A or WebM · up to {MAX_UPLOAD_MB} MB</p>
                            </Upload.Dragger>
                        )}

                        {audio && (
                            <div className={`qz-audio-card${stale ? ' is-stale' : ''}`}>
                                <div className="qz-audio-card-top">
                                    {stale ? <WarningOutlined /> : <CheckCircleFilled />}
                                    <span>
                                        <strong>{stale ? 'The text or voice changed' : 'Audio ready'}</strong>
                                        <em>{stale ? 'Regenerate so students hear what the section says.' : [audio.sourceType === 'tts' ? `Voice: ${audio.spoken?.voice || voice}` : audio.fileName, audio.durationSeconds ? `${audio.durationSeconds} s` : null].filter(Boolean).join(' · ')}</em>
                                    </span>
                                    <Button type="text" size="small" className="is-danger" icon={<DeleteOutlined />} onClick={removeAudio} disabled={working}>Remove</Button>
                                </div>
                                {previewUrl ? (
                                    <audio controls controlsList="nodownload" src={previewUrl} />
                                ) : (
                                    <Button size="small" icon={busy === 'preview' ? <LoadingOutlined /> : <SoundOutlined />} onClick={loadPreview} disabled={!!busy}>Play audio</Button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 2 · Playback */}
                    <section className="qz-step">
                        <h3><span>2</span> How often can students play it?</h3>
                        <Segmented value={maxPlays} onChange={v => setMaxPlays(Number(v))} disabled={working}
                            options={[{ value: 0, label: 'Unlimited' }, { value: 1, label: 'Once' }, { value: 2, label: 'Twice' }, { value: 3, label: '3 times' }]} />
                        <p className="qz-hint">Exam conditions (TCF, DELF) usually allow one or two plays.</p>
                    </section>

                    {/* 3 · Questions */}
                    <section className="qz-step">
                        <h3><span>3</span> Questions</h3>
                        <Checkbox checked={withAI && aiPossible} disabled={!aiPossible || working} onChange={e => setWithAI(e.target.checked)}>
                            {editing ? 'Also write more questions with AI from the transcript' : 'Write questions with AI from the transcript'}
                        </Checkbox>
                        {!aiPossible ? (
                            <p className="qz-hint">{source === 'upload' ? 'Add a transcript of at least a sentence to use AI.' : 'Write at least a sentence of text to use AI.'} {editing ? '' : 'Otherwise you add the questions yourself after saving.'}</p>
                        ) : withAI ? (
                            <div className="qz-ai-grid is-tight">
                                <label className="qz-ai-split-item"><span>Questions</span><InputNumber min={1} max={10} value={aiCount} onChange={v => setAiCount(Math.min(10, Math.max(1, Number(v) || 1)))} disabled={working} /></label>
                                <label className="qz-ai-split-item"><span>Total points</span><InputNumber min={1} max={50} value={aiPoints} onChange={v => setAiPoints(Math.min(50, Math.max(1, Number(v) || 1)))} disabled={working} /></label>
                            </div>
                        ) : (
                            <p className="qz-hint">{editing ? 'Existing questions stay as they are.' : 'You will write the first question right after adding the section.'}</p>
                        )}
                        {withAI && aiPossible && <p className="qz-hint">Generated questions appear in the section so you can review and edit them.</p>}
                    </section>

                    {error && <div className="tc-alert" role="alert"><ExclamationCircleOutlined /><span>{error}</span></div>}
                </div>

                <footer className="qz-mod-foot">
                    <Button onClick={onClose} disabled={working}>Cancel</Button>
                    <Button type="primary" icon={withAI && aiPossible ? <ThunderboltOutlined /> : undefined} loading={busy === 'questions'}
                        disabled={!audio || stale || (working && busy !== 'questions')} onClick={save}>
                        {busy === 'questions' ? 'Writing questions…' : saveLabel}
                    </Button>
                </footer>
            </div>
        </Modal>
    );
};

export default AudioQuestionModal;
