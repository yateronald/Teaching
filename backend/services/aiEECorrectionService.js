const { GoogleGenAI } = require('@google/genai');

// ============================================================
// AI Expression Écrite Correction Service — Powered by Gemini
// ============================================================
// Abstracted behind a class so swapping to OpenAI/Claude later
// only requires a new implementation of correctWriting().
// ============================================================

class AIEECorrectionService {
    constructor() {
        this.apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY1].filter(Boolean);
        this.currentKeyIndex = 0;
        this.model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
        this.client = null;

        if (this.apiKeys.length > 0) {
            this.client = new GoogleGenAI({ apiKey: this.apiKeys[this.currentKeyIndex] });
            console.log(`✍️  AI EE Correction Service initialized (model: ${this.model}, keys: ${this.apiKeys.length})`);
        } else {
            console.warn('⚠️  AI EE Correction Service: GEMINI_API_KEY not set — correction disabled');
        }
    }

    get isConfigured() {
        return !!this.client;
    }

    // --------------------------------------------------------
    // System Prompt — Expert French writing evaluator
    // --------------------------------------------------------
    get systemPrompt() {
        return `You are an expert TCF (Test de connaissance du français) examiner specializing in Expression Écrite.

You evaluate French writing submissions based on TCF Canada standards. You are rigorous, fair, and pedagogically constructive.

EVALUATION CRITERIA (for each task):
1. **Grammaire et correction linguistique** (Grammar & Language Accuracy)
   - Verb conjugation, agreement (gender/number), tense usage
   - Syntax, sentence structure, punctuation
   - Spelling and accents

2. **Richesse du vocabulaire** (Vocabulary Richness)
   - Range and precision of vocabulary
   - Appropriate register (formal/informal based on task type)
   - Avoidance of repetition, use of synonyms

3. **Structure et cohérence** (Structure & Coherence)
   - Logical organization of ideas
   - Use of connectors and transitions
   - Paragraph structure and flow

4. **Respect des consignes** (Instructions Adherence)
   - Relevance to the topic/prompt
   - Appropriate format for the task type
   - Word count compliance (within min/max range)

TASK TYPES:
- **message_court**: Short message (email, note, SMS). Expects appropriate greeting/closing, clear purpose, correct register.
- **narration**: Narrative writing. Expects storytelling elements, temporal markers, descriptive language.
- **argumentation**: Argumentative essay. Expects thesis, structured arguments, counter-arguments, conclusion.

SCORING GUIDE (per task, out of 20):
- 0: No answer or completely off-topic
- 1-4: A1 level — Very basic, major errors, barely comprehensible
- 5-8: A2 level — Simple sentences, frequent errors, limited vocabulary
- 9-11: B1 level — Adequate communication, some errors, moderate vocabulary
- 12-14: B2 level — Good control, few errors, varied vocabulary
- 15-17: C1 level — Strong mastery, sophisticated vocabulary, well-structured
- 18-20: C2 level — Near-native, exceptional vocabulary, flawless structure

IMPORTANT RULES:
- If a task answer is EMPTY or blank, assign score 0 and level A1 with a note about no submission.
- If the word count is significantly below minimum, penalize in "Respect des consignes".
- Be specific in feedback — cite examples from the student's text.
- Give at least 2 positive points and 2 improvement areas per task (unless score is 0).
- All feedback MUST be in French.
- Output ONLY valid JSON matching the required schema.`;
    }

    // --------------------------------------------------------
    // JSON Schema for structured output
    // --------------------------------------------------------
    get responseSchema() {
        return {
            type: 'object',
            properties: {
                tasks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            task_number: { type: 'number', description: 'Task number (1, 2, or 3)' },
                            score: { type: 'number', description: 'Score out of 20' },
                            level: { type: 'string', description: 'CEFR level (A1-C2)' },
                            positives: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'List of positive points (in French)'
                            },
                            improvements: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'List of areas for improvement (in French)'
                            }
                        },
                        required: ['task_number', 'score', 'level', 'positives', 'improvements']
                    }
                }
            },
            required: ['tasks']
        };
    }

    // --------------------------------------------------------
    // Build the evaluation prompt
    // --------------------------------------------------------
    buildEvaluationPrompt(tasks) {
        const parts = [`Evaluate the following ${tasks.length} writing tasks from a TCF Expression Écrite exam.\n`];

        for (const t of tasks) {
            const wordCount = t.answer ? t.answer.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
            parts.push(`--- TÂCHE ${t.task_number} ---`);
            parts.push(`Type: ${t.task_type}`);
            parts.push(`Consigne: ${t.prompt_text}`);
            if (t.argument_text_1) parts.push(`Argument 1: ${t.argument_text_1}`);
            if (t.argument_text_2) parts.push(`Argument 2: ${t.argument_text_2}`);
            parts.push(`Limites de mots: ${t.min_words} – ${t.max_words}`);
            parts.push(`Nombre de mots de l'étudiant: ${wordCount}`);
            parts.push(`Réponse de l'étudiant:`);
            parts.push(t.answer && t.answer.trim() ? `"${t.answer.trim()}"` : '[AUCUNE RÉPONSE]');
            parts.push('');
        }

        parts.push(`Evaluate each task independently. Return a JSON object with a "tasks" array containing one evaluation per task.`);
        return parts.join('\n');
    }

    // --------------------------------------------------------
    // Call Gemini to correct the writing
    // --------------------------------------------------------
    async correctWriting(tasks) {
        if (!this.client || this.apiKeys.length === 0) {
            throw new Error('AI EE Correction Service is not configured. Set GEMINI_API_KEY in your .env file.');
        }

        const prompt = this.buildEvaluationPrompt(tasks);
        console.log(`✍️  AI EE: Correcting ${tasks.length} tasks via ${this.model}...`);

        let attempts = 0;

        while (attempts < this.apiKeys.length) {
            try {
                const response = await this.client.models.generateContent({
                    model: this.model,
                    contents: prompt,
                    config: {
                        systemInstruction: this.systemPrompt,
                        responseMimeType: 'application/json',
                        responseSchema: this.responseSchema,
                        temperature: 0.3, // Lower temperature for consistent evaluation
                        maxOutputTokens: 4096,
                    }
                });

                const rawText = response.text;
                if (!rawText) {
                    throw new Error('Empty response from AI model');
                }

                let parsed;
                try {
                    parsed = JSON.parse(rawText);
                } catch (parseErr) {
                    console.error('✍️  AI EE: Failed to parse JSON:', rawText.substring(0, 500));
                    throw new Error('AI returned invalid JSON. Please try again.');
                }

                // Validate and sanitize
                const validated = this.validateResponse(parsed, tasks);
                console.log(`✅ AI EE: Correction complete — scores: ${validated.tasks.map(t => `T${t.task_number}=${t.score}/20`).join(', ')}`);
                return validated;

            } catch (error) {
                if (error.status === 429) {
                    console.warn(`⚠️ AI rate limit on key ${this.currentKeyIndex}`);
                    attempts++;
                    if (attempts < this.apiKeys.length) {
                        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
                        console.log(`🔄 Switching to key ${this.currentKeyIndex}...`);
                        this.client = new GoogleGenAI({ apiKey: this.apiKeys[this.currentKeyIndex] });
                        continue;
                    }
                    throw new Error('All AI rate limits reached. Please try again later.');
                }
                if (error.status === 403) {
                    throw new Error('AI API key invalid. Check GEMINI_API_KEY.');
                }
                console.error('✍️  AI EE correction error:', error.message);
                throw error;
            }
        }
    }

    // --------------------------------------------------------
    // Validate and sanitize the AI response
    // --------------------------------------------------------
    validateResponse(parsed, inputTasks) {
        if (!parsed || !Array.isArray(parsed.tasks)) {
            throw new Error('AI response missing tasks array');
        }

        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const validated = [];

        for (const inputTask of inputTasks) {
            // Find matching response task
            let responseTask = parsed.tasks.find(t => t.task_number === inputTask.task_number);

            if (!responseTask) {
                // Fallback: create default response for missing task
                console.warn(`✍️  AI EE: Missing evaluation for task ${inputTask.task_number}, creating default`);
                responseTask = {
                    task_number: inputTask.task_number,
                    score: 0,
                    level: 'A1',
                    positives: ['Évaluation non disponible'],
                    improvements: ['Veuillez réessayer']
                };
            }

            // Clamp score to 0-20
            const score = Math.max(0, Math.min(20, Math.round(Number(responseTask.score) * 10) / 10));

            // Validate level
            let level = responseTask.level;
            if (!validLevels.includes(level)) {
                // Derive from score
                if (score >= 18) level = 'C2';
                else if (score >= 15) level = 'C1';
                else if (score >= 12) level = 'B2';
                else if (score >= 9) level = 'B1';
                else if (score >= 5) level = 'A2';
                else level = 'A1';
            }

            validated.push({
                task_number: inputTask.task_number,
                score,
                level,
                positives: Array.isArray(responseTask.positives) ? responseTask.positives.filter(s => typeof s === 'string') : [],
                improvements: Array.isArray(responseTask.improvements) ? responseTask.improvements.filter(s => typeof s === 'string') : [],
            });
        }

        return { tasks: validated };
    }
}

// Singleton
let instance = null;
function getAIEECorrectionService() {
    if (!instance) {
        instance = new AIEECorrectionService();
    }
    return instance;
}

module.exports = { AIEECorrectionService, getAIEECorrectionService };
