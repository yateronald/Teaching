const { GoogleGenAI } = require('@google/genai');
const wav = require('wav');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getKDriveService } = require('./kdriveService');

// ============================================================
// TTS Service — Text-to-Speech via Gemini 3.1 Flash TTS
// ============================================================

// Curated voice options for French teaching
const VOICE_OPTIONS = [
    { name: 'Kore', label: 'Kore — Clear, neutral', gender: 'female' },
    { name: 'Puck', label: 'Puck — Upbeat, friendly', gender: 'male' },
    { name: 'Charon', label: 'Charon — Deep, authoritative', gender: 'male' },
    { name: 'Aoede', label: 'Aoede — Warm, expressive', gender: 'female' },
    { name: 'Fenrir', label: 'Fenrir — Strong, clear', gender: 'male' },
    { name: 'Leda', label: 'Leda — Soft, gentle', gender: 'female' },
    { name: 'Orus', label: 'Orus — Rich, formal', gender: 'male' },
    { name: 'Zephyr', label: 'Zephyr — Light, airy', gender: 'female' },
];

class TTSService {
    constructor() {
        this.apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY1].filter(Boolean);
        this.currentKeyIndex = 0;
        this.model = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
        this.client = null;

        if (this.apiKeys.length > 0) {
            this.client = new GoogleGenAI({ apiKey: this.apiKeys[this.currentKeyIndex] });
            console.log(`🎙️ TTS Service initialized (model: ${this.model}, keys available: ${this.apiKeys.length})`);
        } else {
            console.warn('⚠️  TTS Service: GEMINI_API_KEY not set — TTS disabled');
        }
    }

    get isConfigured() {
        return !!this.client;
    }

    get voices() {
        return VOICE_OPTIONS;
    }

    // --------------------------------------------------------
    // Generate audio from transcript using Gemini TTS
    // Returns: Buffer (raw PCM data, 24kHz 16-bit mono)
    // --------------------------------------------------------
    async generateAudio(transcript, voiceName = 'Kore') {
        if (!this.client || this.apiKeys.length === 0) {
            throw new Error('TTS Service is not configured. Set GEMINI_API_KEY in your .env file.');
        }

        if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
            throw new Error('Transcript is required for TTS generation.');
        }

        console.log(`🎙️ TTS: Generating audio for ${transcript.length} chars with voice "${voiceName}"...`);

        let attempts = 0;
        
        while (attempts < this.apiKeys.length) {
            try {
                const response = await this.client.models.generateContent({
                    model: this.model,
                    contents: [{ parts: [{ text: transcript }] }],
                    config: {
                        responseModalities: ['AUDIO'],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
                            },
                        },
                    },
                });

                const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (!audioData) {
                    throw new Error('No audio data in TTS response');
                }

                const pcmBuffer = Buffer.from(audioData, 'base64');
                console.log(`✅ TTS: Generated ${pcmBuffer.length} bytes of PCM audio`);
                return pcmBuffer;

            } catch (error) {
                if (error.status === 429) {
                    console.warn(`⚠️ TTS rate limit reached on key (Index: ${this.currentKeyIndex}).`);
                    attempts++;
                    if (attempts < this.apiKeys.length) {
                        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
                        console.log(`🔄 Switching to alternate API key (Index: ${this.currentKeyIndex})...`);
                        this.client = new GoogleGenAI({ apiKey: this.apiKeys[this.currentKeyIndex] });
                        continue;
                    } else {
                        throw new Error('All TTS rate limits reached. Please try again later.');
                    }
                }
                if (error.status === 403) {
                    throw new Error('API key invalid or lacks permissions for TTS.');
                }
                console.error('🎙️ TTS generation error:', error.message);
                throw error;
            }
        }
    }

    // --------------------------------------------------------
    // Convert raw PCM buffer to WAV format
    // Gemini TTS outputs: 24000 Hz, 16-bit signed LE, mono
    // --------------------------------------------------------
    pcmToWav(pcmBuffer) {
        return new Promise((resolve, reject) => {
            const tmpFile = path.join(os.tmpdir(), `tts_${Date.now()}.wav`);

            const writer = new wav.FileWriter(tmpFile, {
                channels: 1,
                sampleRate: 24000,
                bitDepth: 16,
            });

            writer.on('finish', () => resolve(tmpFile));
            writer.on('error', reject);

            writer.write(pcmBuffer);
            writer.end();
        });
    }

    // --------------------------------------------------------
    // Estimate audio duration from PCM buffer size
    // 24000 Hz × 2 bytes × 1 channel = 48000 bytes/second
    // --------------------------------------------------------
    estimateDuration(pcmBuffer) {
        const bytesPerSecond = 24000 * 2 * 1; // sampleRate × bytesPerSample × channels
        return Math.ceil(pcmBuffer.length / bytesPerSecond);
    }

    // --------------------------------------------------------
    // Full pipeline: Transcript → TTS → WAV → kDrive upload
    // Returns: { kdriveFileId, fileName, durationSeconds }
    // --------------------------------------------------------
    async generateAndUpload(transcript, voiceName, teacherId, quizTitle) {
        // Step 1: Generate PCM audio
        const pcmBuffer = await this.generateAudio(transcript, voiceName);

        // Step 2: Convert to WAV
        const wavPath = await this.pcmToWav(pcmBuffer);

        // Step 3: Estimate duration
        const durationSeconds = this.estimateDuration(pcmBuffer);

        // Step 4: Upload to kDrive
        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) {
            // Clean up temp file
            try { fs.unlinkSync(wavPath); } catch {}
            throw new Error('kDrive is not configured. Cannot store audio files.');
        }

        const sanitizedTitle = (quizTitle || 'quiz').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const fileName = `audio_${sanitizedTitle}_${Date.now()}.wav`;

        try {
            // Ensure teacher folder exists
            const teacherFolderName = `Teacher_${teacherId}_Audio`;
            const teacherFolder = await kdrive.getOrCreateFolder(kdrive.rootFolderId, teacherFolderName);

            // Upload the WAV file
            const uploadResult = await kdrive.uploadFile(wavPath, teacherFolder.id, fileName);

            console.log(`✅ TTS: Audio uploaded to kDrive (id: ${uploadResult.id}, file: ${fileName})`);

            return {
                kdriveFileId: String(uploadResult.id),
                fileName,
                durationSeconds,
            };
        } finally {
            // Always clean up temp file
            try { fs.unlinkSync(wavPath); } catch {}
        }
    }

    // --------------------------------------------------------
    // Upload a user-provided audio file to kDrive
    // --------------------------------------------------------
    async uploadAudioFile(filePath, originalName, teacherId) {
        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) {
            throw new Error('kDrive is not configured. Cannot store audio files.');
        }

        const teacherFolderName = `Teacher_${teacherId}_Audio`;
        const teacherFolder = await kdrive.getOrCreateFolder(kdrive.rootFolderId, teacherFolderName);

        const ext = path.extname(originalName) || '.wav';
        const fileName = `upload_${Date.now()}${ext}`;

        const uploadResult = await kdrive.uploadFile(filePath, teacherFolder.id, fileName);

        console.log(`✅ TTS: User audio uploaded to kDrive (id: ${uploadResult.id}, file: ${fileName})`);

        return {
            kdriveFileId: String(uploadResult.id),
            fileName,
        };
    }

    // --------------------------------------------------------
    // Stream audio from kDrive to HTTP response
    // --------------------------------------------------------
    async streamAudio(kdriveFileId, res, reqHeaders = {}) {
        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) {
            throw new Error('kDrive is not configured.');
        }

        await kdrive.streamFile(kdriveFileId, res, reqHeaders, 'inline', 'audio.wav');
    }

    // --------------------------------------------------------
    // Get audio as a base64 string to evade download managers
    // --------------------------------------------------------
    async getAudioAsBase64(kdriveFileId) {
        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) {
            throw new Error('kDrive is not configured.');
        }

        const buffer = await kdrive.downloadFileAsBuffer(kdriveFileId);
        return buffer.toString('base64');
    }
}

// Singleton
let instance = null;
function getTTSService() {
    if (!instance) instance = new TTSService();
    return instance;
}

module.exports = { TTSService, getTTSService, VOICE_OPTIONS };
