import React, { useState, useEffect, useRef } from 'react';
import {
    Modal, Button, Input, Select, Space, Typography, Tag,
    Upload, InputNumber, Switch, Card, Alert, Spin, Radio, message, Tooltip, Popconfirm
} from 'antd';
import {
    SoundOutlined, RobotOutlined, UploadOutlined,
    PlusOutlined, DeleteOutlined, EditOutlined,
    AudioOutlined, CheckCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Voice options (must match backend VOICE_OPTIONS)
const VOICE_OPTIONS = [
    { name: 'Kore', label: 'Kore (Female) — Clear, neutral', gender: 'female' },
    { name: 'Puck', label: 'Puck (Male) — Upbeat, friendly', gender: 'male' },
    { name: 'Charon', label: 'Charon (Male) — Deep, authoritative', gender: 'male' },
    { name: 'Aoede', label: 'Aoede (Female) — Warm, expressive', gender: 'female' },
    { name: 'Fenrir', label: 'Fenrir (Male) — Strong, clear', gender: 'male' },
    { name: 'Leda', label: 'Leda (Female) — Soft, gentle', gender: 'female' },
    { name: 'Orus', label: 'Orus (Male) — Rich, formal', gender: 'male' },
    { name: 'Zephyr', label: 'Zephyr (Female) — Light, airy', gender: 'female' },
];

interface AudioClipData {
    tempId: string;
    transcript: string;
    voiceName: string;
    sourceType: 'tts' | 'upload';
    kdriveFileId?: string;
    fileName?: string;
    durationSeconds?: number;
    maxPlays: number;
}

interface LinkedQuestion {
    question_text: string;
    question_type: 'mcq_single' | 'mcq_multiple' | 'yes_no';
    marks: number;
    correct_answer?: string;
    explanation?: string;
    options?: { option_text: string; is_correct: boolean }[];
    audio_clip_temp_id: string;
}

interface AudioQuestionModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (audioClip: AudioClipData, questions: LinkedQuestion[]) => void;
    quizTitle?: string;
    editData?: {
        audioClip: AudioClipData;
        questions: LinkedQuestion[];
    } | null;
}

const AudioQuestionModal: React.FC<AudioQuestionModalProps> = ({
    visible, onClose, onAdd, quizTitle, editData
}) => {
    const { apiCall } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    // Audio source mode
    const [sourceMode, setSourceMode] = useState<'tts' | 'upload'>('tts');

    // TTS fields
    const [transcript, setTranscript] = useState('');
    const [voiceName, setVoiceName] = useState('Kore');
    const [generating, setGenerating] = useState(false);

    // Generated/uploaded audio
    const [audioData, setAudioData] = useState<AudioClipData | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Upload
    const [uploading, setUploading] = useState(false);

    // Questions
    const [questionMode, setQuestionMode] = useState<'manual' | 'ai'>('manual');
    const [questions, setQuestions] = useState<LinkedQuestion[]>([]);
    const [maxPlays, setMaxPlays] = useState(0); // 0 = unlimited

    // AI question generation
    const [aiQuestionCount, setAiQuestionCount] = useState(3);
    const [aiPoints, setAiPoints] = useState(6);
    const [generatingQuestions, setGeneratingQuestions] = useState(false);

    // Manual question form
    const [editingQuestion, setEditingQuestion] = useState<Partial<LinkedQuestion> | null>(null);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number>(-1); // -1 = new, >=0 = editing existing
    const [manualOptions, setManualOptions] = useState<{ option_text: string; is_correct: boolean }[]>([
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
    ]);

    // Reset state when modal closes / pre-populate in edit mode
    useEffect(() => {
        if (!visible) {
            setTranscript('');
            setVoiceName('Kore');
            setAudioData(null);
            setPreviewUrl(null);
            setQuestions([]);
            setSourceMode('tts');
            setEditingQuestion(null);
            setEditingQuestionIndex(-1);
            setMaxPlays(0);
        } else if (editData) {
            // Pre-populate for edit mode
            const { audioClip, questions: editQuestions } = editData;
            setTranscript(audioClip.transcript || '');
            setVoiceName(editData.audioClip.voiceName || 'Kore');
            setSourceMode(editData.audioClip.sourceType || 'tts');
            setMaxPlays(editData.audioClip.maxPlays || 0);
            setAudioData(editData.audioClip);
            setQuestions(editQuestions.map(q => ({ ...q })));

            // Fetch audio preview if we have a kDrive file ID
            if (editData.audioClip.kdriveFileId) {
                apiCall(`/quizzes/audio/preview/${editData.audioClip.kdriveFileId}`)
                    .then(resp => {
                        if (resp.ok) return resp.blob();
                        return null;
                    })
                    .then(blob => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            setPreviewUrl(url);
                        }
                    })
                    .catch(() => {});
            }
        }
    }, [visible, editData]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []);

    const generateTempId = () => `audio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // ---- TTS Generation ----
    const handleGenerateAudio = async () => {
        if (!transcript.trim()) {
            messageApi.warning('Please enter a transcript first');
            return;
        }
        setGenerating(true);
        try {
            const resp = await apiCall('/quizzes/audio/generate', {
                method: 'POST',
                body: JSON.stringify({
                    transcript: transcript.trim(),
                    voiceName,
                    quizTitle: quizTitle || 'quiz'
                })
            });
            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error || 'Failed to generate audio');
            }
            const data = await resp.json();
            const clip: AudioClipData = {
                tempId: generateTempId(),
                transcript: transcript.trim(),
                voiceName,
                sourceType: 'tts',
                kdriveFileId: data.audio.kdriveFileId,
                fileName: data.audio.fileName,
                durationSeconds: data.audio.durationSeconds,
                maxPlays
            };
            setAudioData(clip);

            // Use inline base64 audio for instant preview (no extra fetch needed)
            if (data.audio.wavBase64) {
                const byteChars = atob(data.audio.wavBase64);
                const byteNums = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteNums[i] = byteChars.charCodeAt(i);
                }
                const blob = new Blob([byteNums], { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(url);
            } else if (data.audio.kdriveFileId) {
                // Fallback: fetch the audio blob separately
                try {
                    const audioResp = await apiCall(`/quizzes/audio/preview/${data.audio.kdriveFileId}`);
                    if (audioResp.ok) {
                        const blob = await audioResp.blob();
                        const url = URL.createObjectURL(blob);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(url);
                    }
                } catch {
                    console.warn('Could not fetch audio preview');
                }
            }

            messageApi.success('Audio generated successfully! 🎙️');
        } catch (err: any) {
            messageApi.error(err.message || 'Failed to generate audio');
        } finally {
            setGenerating(false);
        }
    };

    // ---- File Upload ----
    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('audio', file);
            const resp = await apiCall('/quizzes/audio/upload', {
                method: 'POST',
                body: formData,
                headers: {} // let browser set content-type for FormData
            });
            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error || 'Failed to upload audio');
            }
            const data = await resp.json();
            const clip: AudioClipData = {
                tempId: generateTempId(),
                transcript: transcript.trim() || `[Uploaded: ${file.name}]`,
                voiceName: '',
                sourceType: 'upload',
                kdriveFileId: data.audio.kdriveFileId,
                fileName: data.audio.fileName,
                maxPlays
            };
            setAudioData(clip);
            // Create preview from the file
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            messageApi.success('Audio uploaded successfully! 📁');
        } catch (err: any) {
            messageApi.error(err.message || 'Failed to upload audio');
        } finally {
            setUploading(false);
        }
        return false; // prevent default upload
    };

    // ---- AI Question Generation ----
    const handleGenerateQuestions = async () => {
        if (!transcript.trim()) {
            messageApi.warning('Please enter a transcript to generate questions from');
            return;
        }
        if (!audioData) {
            messageApi.warning('Please generate or upload audio first');
            return;
        }

        setGeneratingQuestions(true);
        try {
            const resp = await apiCall('/quizzes/ai-generate', {
                method: 'POST',
                body: JSON.stringify({
                    totalQuestions: aiQuestionCount,
                    singleChoiceCount: Math.ceil(aiQuestionCount * 0.6),
                    multipleChoiceCount: 0,
                    yesNoCount: aiQuestionCount - Math.ceil(aiQuestionCount * 0.6),
                    totalPoints: aiPoints,
                    userPrompt: `Create listening comprehension questions based on this French audio transcript. The questions should test the student's ability to understand the spoken content:\n\n"${transcript.trim()}"\n\nFocus on: key details, main ideas, vocabulary in context, and inference.`
                })
            });

            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error || 'Failed to generate questions');
            }

            const data = await resp.json();
            const generatedQuestions: LinkedQuestion[] = (data.questions || []).map((q: any) => ({
                ...q,
                audio_clip_temp_id: audioData.tempId
            }));

            setQuestions(generatedQuestions);
            messageApi.success(`Generated ${generatedQuestions.length} comprehension questions! ✨`);
        } catch (err: any) {
            messageApi.error(err.message || 'Failed to generate questions');
        } finally {
            setGeneratingQuestions(false);
        }
    };

    // ---- Manual Question ----
    const addManualQuestion = () => {
        setEditingQuestionIndex(-1);
        setEditingQuestion({
            question_text: '',
            question_type: 'mcq_single',
            marks: 2,
            correct_answer: undefined,
            explanation: '',
        });
        setManualOptions([
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ]);
    };

    const startEditQuestion = (idx: number) => {
        const q = questions[idx];
        setEditingQuestionIndex(idx);
        setEditingQuestion({
            question_text: q.question_text,
            question_type: q.question_type,
            marks: q.marks,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
        });
        setManualOptions(
            q.question_type !== 'yes_no' && q.options?.length
                ? q.options.map(o => ({ ...o }))
                : [
                    { option_text: '', is_correct: true },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                ]
        );
        setQuestionMode('manual');
    };

    const saveManualQuestion = () => {
        if (!editingQuestion?.question_text?.trim()) {
            messageApi.warning('Question text is required');
            return;
        }
        if (!audioData) {
            messageApi.warning('Please generate or upload audio first');
            return;
        }

        const q: LinkedQuestion = {
            question_text: editingQuestion.question_text!.trim(),
            question_type: editingQuestion.question_type || 'mcq_single',
            marks: editingQuestion.marks || 2,
            explanation: editingQuestion.explanation || '',
            audio_clip_temp_id: audioData.tempId,
        };

        if (q.question_type === 'yes_no') {
            q.correct_answer = editingQuestion.correct_answer || 'yes';
        } else {
            q.options = manualOptions.filter(o => o.option_text.trim());
            if (q.options.length < 2) {
                messageApi.warning('At least 2 options are required');
                return;
            }
        }

        if (editingQuestionIndex >= 0) {
            // Editing existing question
            setQuestions(prev => prev.map((existing, i) => i === editingQuestionIndex ? q : existing));
        } else {
            // Adding new question
            setQuestions(prev => [...prev, q]);
        }
        setEditingQuestion(null);
        setEditingQuestionIndex(-1);
    };

    const deleteQuestion = (idx: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const deleteAudioAndReset = () => {
        setAudioData(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };

    // ---- Submit ----
    const handleAddToQuiz = () => {
        if (!audioData) {
            messageApi.warning('Please generate or upload audio first');
            return;
        }
        if (questions.length === 0) {
            messageApi.warning('Please add at least one question');
            return;
        }

        audioData.maxPlays = maxPlays;
        onAdd(audioData, questions);
        onClose();
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            width={800}
            footer={null}
            destroyOnClose
            closable={false}
            styles={{
                body: { padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh' },
                content: { padding: 0 }
            }}
        >
            {contextHolder}

            {/* Fixed Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)',
                padding: '20px 28px',
                position: 'relative',
                flexShrink: 0,
            }}>
                {/* Custom close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 14,
                        right: 16,
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 'bold',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                >
                    ✕
                </button>
                <Space align="center" size={16}>
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <SoundOutlined style={{ fontSize: 28, color: 'white' }} />
                    </div>
                    <div>
                        <Title level={4} style={{ color: 'white', margin: 0 }}>
                            🎧 Listening Comprehension
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                            Add audio and comprehension questions for your students
                        </Text>
                    </div>
                </Space>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
                {/* Step 1: Audio Source */}
                <Card
                    size="small"
                    title={<Space><AudioOutlined /> <Text strong>Step 1: Audio Source</Text></Space>}
                    style={{ marginBottom: 20, borderRadius: 12, border: '1px solid #e8e8e8' }}
                >
                    <Radio.Group
                        value={sourceMode}
                        onChange={(e) => { setSourceMode(e.target.value); setAudioData(null); }}
                        style={{ marginBottom: 16 }}
                    >
                        <Radio.Button value="tts">🎙️ Generate from Text (AI)</Radio.Button>
                        <Radio.Button value="upload">📁 Upload Audio File</Radio.Button>
                    </Radio.Group>

                    {sourceMode === 'tts' ? (
                        <>
                            <div style={{ marginBottom: 12 }}>
                                <Text strong style={{ display: 'block', marginBottom: 6 }}>French Transcript</Text>
                                <TextArea
                                    rows={4}
                                    maxLength={5000}
                                    showCount
                                    placeholder="Enter the French text to be spoken aloud..."
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                />
                            </div>
                            <Space style={{ marginBottom: 12 }} wrap>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Voice</Text>
                                    <Select
                                        value={voiceName}
                                        onChange={setVoiceName}
                                        style={{ width: 260 }}
                                        options={VOICE_OPTIONS.map(v => ({
                                            value: v.name,
                                            label: `${v.gender === 'female' ? '👩' : '👨'} ${v.label}`
                                        }))}
                                    />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                        Max Plays <Tooltip title="0 = unlimited"><InfoCircleOutlined /></Tooltip>
                                    </Text>
                                    <InputNumber min={0} max={10} value={maxPlays} onChange={v => setMaxPlays(v || 0)} />
                                </div>
                            </Space>
                            <div>
                                <Button
                                    type="primary"
                                    icon={<SoundOutlined />}
                                    onClick={handleGenerateAudio}
                                    loading={generating}
                                    disabled={!transcript.trim()}
                                    style={{
                                        background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                                        border: 'none',
                                        borderRadius: 8,
                                    }}
                                >
                                    {generating ? 'Generating Audio...' : '🎙️ Generate Audio'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {!audioData && (
                                <Upload.Dragger
                                    key={`upload-${Date.now()}-${audioData ? 'has' : 'none'}`}
                                    accept=".mp3,.wav,.ogg,.m4a,.webm"
                                    maxCount={1}
                                    showUploadList={false}
                                    beforeUpload={handleFileUpload}
                                    disabled={uploading}
                                    fileList={[]}
                                >
                                    {uploading ? (
                                        <Spin tip="Uploading..." />
                                    ) : (
                                        <>
                                            <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 32, color: '#0891b2' }} /></p>
                                            <p className="ant-upload-text">Click or drag an audio file here</p>
                                            <p className="ant-upload-hint">Supports MP3, WAV, OGG, M4A, WebM (max 25MB)</p>
                                        </>
                                    )}
                                </Upload.Dragger>
                            )}
                            <div style={{ marginTop: 12 }}>
                                <Text strong style={{ display: 'block', marginBottom: 6 }}>Transcript (optional, for AI question generation)</Text>
                                <TextArea
                                    rows={3}
                                    maxLength={5000}
                                    placeholder="Optionally paste the transcript here to enable AI question generation..."
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                />
                            </div>
                            <Space style={{ marginTop: 12 }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                        Max Plays <Tooltip title="0 = unlimited"><InfoCircleOutlined /></Tooltip>
                                    </Text>
                                    <InputNumber min={0} max={10} value={maxPlays} onChange={v => setMaxPlays(v || 0)} />
                                </div>
                            </Space>
                        </>
                    )}

                    {/* Audio Preview with Player + Delete */}
                    {audioData && (
                        <div style={{
                            marginTop: 16,
                            padding: '14px 16px',
                            background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
                            borderRadius: 10,
                            border: '1px solid #a7f3d0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Space>
                                    <CheckCircleOutlined style={{ color: '#10b981', fontSize: 18 }} />
                                    <Text strong style={{ color: '#065f46' }}>Audio Ready</Text>
                                    {audioData.durationSeconds && (
                                        <Tag color="cyan">{audioData.durationSeconds}s</Tag>
                                    )}
                                    <Tag color={audioData.sourceType === 'tts' ? 'purple' : 'blue'}>
                                        {audioData.sourceType === 'tts' ? '🎙️ TTS' : '📁 Uploaded'}
                                    </Tag>
                                </Space>
                                <Popconfirm
                                    title="Delete this audio?"
                                    description="This will remove the generated audio. You can generate a new one."
                                    onConfirm={deleteAudioAndReset}
                                    okText="Yes, delete"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        style={{ borderRadius: 6 }}
                                    >
                                        Delete & Retry
                                    </Button>
                                </Popconfirm>
                            </div>
                            {/* Audio Player */}
                            <audio
                                controls
                                controlsList="nodownload"
                                style={{ width: '100%', height: 40 }}
                                src={previewUrl || undefined}
                                ref={(el) => { audioRef.current = el; }}
                            />
                        </div>
                    )}
                </Card>

                {/* Step 2: Questions */}
                <Card
                    size="small"
                    title={
                        <Space>
                            <RobotOutlined />
                            <Text strong>Step 2: Comprehension Questions ({questions.length})</Text>
                        </Space>
                    }
                    style={{ marginBottom: 20, borderRadius: 12, border: '1px solid #e8e8e8' }}
                >
                    {/* Question mode toggle */}
                    <Space style={{ marginBottom: 16 }} wrap>
                        <Button
                            type={questionMode === 'ai' ? 'primary' : 'default'}
                            icon={<RobotOutlined />}
                            onClick={() => setQuestionMode('ai')}
                            style={questionMode === 'ai' ? {
                                background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                border: 'none', borderRadius: 8,
                            } : { borderRadius: 8 }}
                        >
                            Generate with AI ✨
                        </Button>
                        <Button
                            type={questionMode === 'manual' ? 'primary' : 'default'}
                            icon={<PlusOutlined />}
                            onClick={() => { setQuestionMode('manual'); addManualQuestion(); }}
                            style={questionMode === 'manual' ? {
                                background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                                border: 'none', borderRadius: 8,
                            } : { borderRadius: 8 }}
                        >
                            Add Manually
                        </Button>
                    </Space>

                    {/* AI Question Controls */}
                    {questionMode === 'ai' && (
                        <div style={{
                            padding: 16, background: '#faf5ff', borderRadius: 10,
                            border: '1px solid #e9d5ff', marginBottom: 16
                        }}>
                            <Space wrap>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Questions</Text>
                                    <InputNumber min={1} max={10} value={aiQuestionCount} onChange={v => setAiQuestionCount(v || 3)} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Total Points</Text>
                                    <InputNumber min={1} max={50} value={aiPoints} onChange={v => setAiPoints(v || 6)} />
                                </div>
                                <Button
                                    type="primary"
                                    icon={<RobotOutlined />}
                                    loading={generatingQuestions}
                                    onClick={handleGenerateQuestions}
                                    disabled={!audioData || !transcript.trim()}
                                    style={{
                                        background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                        border: 'none', borderRadius: 8, marginTop: 18
                                    }}
                                >
                                    Generate Questions
                                </Button>
                            </Space>
                            {!transcript.trim() && (
                                <Alert
                                    message="A transcript is required for AI question generation"
                                    type="info"
                                    showIcon
                                    style={{ marginTop: 12 }}
                                />
                            )}
                        </div>
                    )}

                    {/* Manual Question Form */}
                    {editingQuestion && (
                        <div style={{
                            padding: 16, background: '#f0fdfa', borderRadius: 10,
                            border: '1px solid #a7f3d0', marginBottom: 16
                        }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                {editingQuestionIndex >= 0 ? `Edit Question ${editingQuestionIndex + 1}` : 'New Question'}
                            </Text>
                            <Input
                                placeholder="Question text..."
                                value={editingQuestion.question_text}
                                onChange={(e) => setEditingQuestion(prev => ({ ...prev!, question_text: e.target.value }))}
                                style={{ marginBottom: 8 }}
                            />
                            <Space style={{ marginBottom: 8 }} wrap>
                                <Select
                                    value={editingQuestion.question_type}
                                    onChange={(v) => setEditingQuestion(prev => ({ ...prev!, question_type: v }))}
                                    style={{ width: 160 }}
                                    options={[
                                        { value: 'mcq_single', label: 'Single Choice' },
                                        { value: 'mcq_multiple', label: 'Multiple Choice' },
                                        { value: 'yes_no', label: 'True / False' },
                                    ]}
                                />
                                <InputNumber
                                    min={1}
                                    max={10}
                                    value={editingQuestion.marks}
                                    onChange={(v) => setEditingQuestion(prev => ({ ...prev!, marks: v || 1 }))}
                                    addonAfter="pts"
                                />
                            </Space>

                            {editingQuestion.question_type === 'yes_no' ? (
                                <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Correct Answer</Text>
                                    <Radio.Group
                                        value={editingQuestion.correct_answer || 'yes'}
                                        onChange={(e) => setEditingQuestion(prev => ({ ...prev!, correct_answer: e.target.value }))}
                                    >
                                        <Radio value="yes">Yes / True</Radio>
                                        <Radio value="no">No / False</Radio>
                                    </Radio.Group>
                                </div>
                            ) : (
                                <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Options</Text>
                                    {manualOptions.map((opt, idx) => (
                                        <Space key={idx} style={{ display: 'flex', marginBottom: 4 }}>
                                            <Input
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                value={opt.option_text}
                                                onChange={(e) => {
                                                    const newOpts = [...manualOptions];
                                                    newOpts[idx] = { ...newOpts[idx], option_text: e.target.value };
                                                    setManualOptions(newOpts);
                                                }}
                                                style={{ width: 300 }}
                                            />
                                            <Switch
                                                checked={opt.is_correct}
                                                onChange={(val) => {
                                                    const newOpts = [...manualOptions];
                                                    if (editingQuestion.question_type === 'mcq_single') {
                                                        newOpts.forEach(o => o.is_correct = false);
                                                    }
                                                    newOpts[idx] = { ...newOpts[idx], is_correct: val };
                                                    setManualOptions(newOpts);
                                                }}
                                                checkedChildren="✓"
                                                unCheckedChildren="✗"
                                                style={{ backgroundColor: opt.is_correct ? '#10b981' : undefined }}
                                            />
                                        </Space>
                                    ))}
                                    {manualOptions.length < 6 && (
                                        <Button
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => setManualOptions(prev => [...prev, { option_text: '', is_correct: false }])}
                                            style={{ marginTop: 4 }}
                                        >
                                            Add Option
                                        </Button>
                                    )}
                                </div>
                            )}

                            <Space>
                                <Button type="primary" onClick={saveManualQuestion} style={{ borderRadius: 8 }}>
                                    {editingQuestionIndex >= 0 ? 'Save Changes' : 'Add Question'}
                                </Button>
                                <Button onClick={() => { setEditingQuestion(null); setEditingQuestionIndex(-1); }} style={{ borderRadius: 8 }}>
                                    Cancel
                                </Button>
                            </Space>
                        </div>
                    )}

                    {/* Question List */}
                    {questions.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            {questions.map((q, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        padding: '10px 14px',
                                        background: '#f9fafb',
                                        borderRadius: 8,
                                        marginBottom: 6,
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                                        <Space size={6} style={{ marginBottom: 4 }}>
                                            <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>Q{idx + 1}</Tag>
                                            <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                                                {q.question_type === 'mcq_single' ? 'Single' : q.question_type === 'mcq_multiple' ? 'Multiple' : 'T/F'}
                                            </Tag>
                                            <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>{q.marks} pts</Tag>
                                        </Space>
                                        <div style={{
                                            fontSize: 13,
                                            color: '#374151',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.4,
                                        }}>
                                            {q.question_text}
                                        </div>
                                    </div>
                                    <Space size={4} style={{ flexShrink: 0 }}>
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => startEditQuestion(idx)}
                                            style={{ borderRadius: 6 }}
                                        />
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteQuestion(idx)}
                                            style={{ borderRadius: 6 }}
                                        />
                                    </Space>
                                </div>
                            ))}
                        </div>
                    )}

                    {questions.length === 0 && !editingQuestion && (
                        <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>
                            <SoundOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                            <br />
                            <Text type="secondary">No questions added yet. Use AI or add manually.</Text>
                        </div>
                    )}

                    {/* Add another manual question button */}
                    {!editingQuestion && questions.length > 0 && (
                        <Button
                            icon={<PlusOutlined />}
                            onClick={addManualQuestion}
                            style={{ marginTop: 8, borderRadius: 8 }}
                            block
                            type="dashed"
                        >
                            Add Another Question
                        </Button>
                    )}
                </Card>
            </div>

            {/* Fixed Footer */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                padding: '14px 28px',
                borderTop: '1px solid #e8e8e8',
                background: '#fff',
                flexShrink: 0,
                boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            }}>
                <Button onClick={onClose} style={{ borderRadius: 8, height: 38 }}>
                    Cancel
                </Button>
                <Button
                    type="primary"
                    onClick={handleAddToQuiz}
                    disabled={!audioData || questions.length === 0}
                    style={{
                        background: !audioData || questions.length === 0 ? undefined :
                            'linear-gradient(135deg, #0891b2, #06b6d4)',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        height: 38,
                    }}
                >
                    🎧 Add to Quiz ({questions.length} questions)
                </Button>
            </div>
        </Modal>
    );
};

export default AudioQuestionModal;
