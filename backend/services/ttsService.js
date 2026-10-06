const ai = require('./aiModels');
const wav = require('wav');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getKDriveService } = require('./kdriveService');

// ============================================================
// TTS Service — Text-to-Speech via Gemini TTS (models in aiModels.js)
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

/**
 * Raw 16-bit PCM from a speech answer. Most models send bare PCM; some (the 3.8
 * TTS models on Vertex AI) send a whole WAV file, whose header is dropped here
 * so it is not played as a click once our own header is added.
 */
function pcmFrom(base64) {
    const buf = Buffer.from(base64, 'base64');
    if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') return buf;
    let off = 12;
    while (off + 8 <= buf.length) {
        const id = buf.toString('ascii', off, off + 4);
        const len = buf.readUInt32LE(off + 4);
        if (id === 'data') return buf.subarray(off + 8, Math.min(buf.length, off + 8 + len));
        off += 8 + len + (len % 2);
    }
    return buf.subarray(44);
}

class TTSService {
    constructor() {
        if (ai.isConfigured()) {
            console.log(`🎙️ TTS Service initialized (engine: ${ai.activeEngine()}, models: ${ai.modelsFor('tts').join(' → ')})`);
        } else {
            console.warn('⚠️  TTS Service: the AI engine is not configured — TTS disabled');
        }
    }

    get models() {
        return ai.modelsFor('tts');
    }

    get isConfigured() {
        return ai.isConfigured();
    }

    get voices() {
        return VOICE_OPTIONS;
    }

    // --------------------------------------------------------
    // Generate audio from transcript using Gemini TTS
    // Returns: Buffer (raw PCM data, 24kHz 16-bit mono)
    // --------------------------------------------------------
    async generateAudio(transcript, voiceName = 'Kore') {
        if (!this.isConfigured) {
            throw new Error('TTS Service is not configured. Set GEMINI_API_KEY in your .env file.');
        }

        if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
            throw new Error('Transcript is required for TTS generation.');
        }

        console.log(`🎙️ TTS: Generating audio for ${transcript.length} chars with voice "${voiceName}"...`);

        try {
            const { pcm: pcmBuffer, model, engine } = await this.synthesize(transcript, voiceName);
            console.log(`✅ TTS: Generated ${pcmBuffer.length} bytes of PCM audio via ${model} (${engine})`);
            return pcmBuffer;
        } catch (error) {
            const status = ai.statusOf(error);
            if (status === 401 || status === 403) throw new Error('API key invalid or lacks permissions for TTS.');
            console.error('🎙️ TTS generation error:', ai.safeMessage(error));
            if (status === 400) throw new Error('The text could not be converted to speech. Check the transcript and the voice.');
            throw new Error('The voice service is busy right now. Please try again in a minute.');
        }
    }

    // --------------------------------------------------------
    // The speech request itself, with the model's own errors (the admin
    // engine test uses it on either engine). Returns { pcm, model, engine }.
    // --------------------------------------------------------
    async synthesize(transcript, voiceName = 'Kore', { engine, onFailure } = {}) {
        // Newest model first; the other key, then the previous models when it is busy (aiModels.js).
        const { result: pcm, model, engine: used } = await ai.withFallback('tts', async (client, model) => {
            const response = await client.models.generateContent({
                model,
                // The role is required by Vertex AI and accepted by the Developer API.
                contents: [{ role: 'user', parts: [{ text: transcript }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
                        },
                    },
                },
            });
            const audioData = (response.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data)?.inlineData.data;
            if (!audioData) throw ai.badAnswer('No audio data in TTS response');
            return pcmFrom(audioData);
        }, { label: 'TTS', engine, onFailure });
        return { pcm, model, engine: used };
    }

    // --------------------------------------------------------
    // Convert raw PCM buffer to WAV format — IN-MEMORY (no disk I/O)
    // Gemini TTS outputs: 24000 Hz, 16-bit signed LE, mono
    // --------------------------------------------------------
    pcmToWavBuffer(pcmBuffer) {
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);
        const dataSize = pcmBuffer.length;
        const headerSize = 44;

        const header = Buffer.alloc(headerSize);
        // RIFF header
        header.write('RIFF', 0);
        header.writeUInt32LE(36 + dataSize, 4);
        header.write('WAVE', 8);
        // fmt sub-chunk
        header.write('fmt ', 12);
        header.writeUInt32LE(16, 16);          // Sub-chunk size
        header.writeUInt16LE(1, 20);           // PCM format
        header.writeUInt16LE(numChannels, 22);
        header.writeUInt32LE(sampleRate, 24);
        header.writeUInt32LE(byteRate, 28);
        header.writeUInt16LE(blockAlign, 32);
        header.writeUInt16LE(bitsPerSample, 34);
        // data sub-chunk
        header.write('data', 36);
        header.writeUInt32LE(dataSize, 40);

        return Buffer.concat([header, pcmBuffer]);
    }

    // Legacy file-based conversion (kept for compatibility)
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
    // Returns: { kdriveFileId, fileName, durationSeconds, wavBase64? }
    // Optimized: in-memory WAV, parallelized folder lookup + TTS
    // --------------------------------------------------------
    async generateAndUpload(transcript, voiceName, teacherId, quizTitle, { returnBase64 = false } = {}) {
        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) {
            throw new Error('kDrive is not configured. Cannot store audio files.');
        }

        const sanitizedTitle = (quizTitle || 'quiz').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const fileName = `audio_${sanitizedTitle}_${Date.now()}.wav`;

        // Run TTS generation + kDrive folder lookup IN PARALLEL
        const teacherFolderName = `Teacher_${teacherId}_Audio`;
        const [pcmBuffer, teacherFolder] = await Promise.all([
            this.generateAudio(transcript, voiceName),
            kdrive.getOrCreateFolder(kdrive.rootFolderId, teacherFolderName),
        ]);

        // Convert PCM → WAV entirely in memory (no disk I/O)
        const wavBuffer = this.pcmToWavBuffer(pcmBuffer);
        const durationSeconds = this.estimateDuration(pcmBuffer);

        // Write temp file for upload (kDrive SDK expects a file path)
        const tmpFile = path.join(os.tmpdir(), fileName);
        fs.writeFileSync(tmpFile, wavBuffer);

        try {
            const uploadResult = await kdrive.uploadFile(tmpFile, teacherFolder.id, fileName);
            console.log(`✅ TTS: Audio uploaded to kDrive (id: ${uploadResult.id}, file: ${fileName})`);

            const result = {
                kdriveFileId: String(uploadResult.id),
                fileName,
                durationSeconds,
            };

            // Optionally return audio data inline to skip the preview fetch round-trip
            if (returnBase64) {
                result.wavBase64 = wavBuffer.toString('base64');
            }

            return result;
        } finally {
            try { fs.unlinkSync(tmpFile); } catch {}
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

        res.setHeader('Content-Type', 'audio/wav');
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
