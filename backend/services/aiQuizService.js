const { GoogleGenAI } = require('@google/genai');

// ============================================================
// AI Quiz Generation Service — Powered by Google Gemini
// ============================================================

class AIQuizService {
    constructor() {
        this.apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY1].filter(Boolean);
        this.currentKeyIndex = 0;
        this.model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
        this.client = null;

        if (this.apiKeys.length > 0) {
            this.client = new GoogleGenAI({ apiKey: this.apiKeys[this.currentKeyIndex] });
            console.log(`🤖 AI Quiz Service initialized (model: ${this.model}, keys available: ${this.apiKeys.length})`);
        } else {
            console.warn('⚠️  AI Quiz Service: GEMINI_API_KEY not set — AI quiz generation disabled');
        }
    }

    get isConfigured() {
        return !!this.client;
    }

    // --------------------------------------------------------
    // System Prompt — Instructs the LLM how to generate quizzes
    // --------------------------------------------------------
    get systemPrompt() {
        return `You are a professional French language quiz creator for "Learn French with Natives", an online French teaching platform.

Your role is to generate high-quality, pedagogically sound quiz questions for French language learners.

RULES:
1. question_type MUST be one of exactly: "mcq_single", "mcq_multiple", "yes_no"
2. For "mcq_single": exactly ONE option must have is_correct=true. Provide exactly 4 options.
3. For "mcq_multiple": at least TWO options must have is_correct=true. Provide exactly 4-6 options.
4. For "yes_no": do NOT include an "options" array. Set "correct_answer" to exactly "yes" or "no".
5. All questions must be relevant to French language learning.
6. Distribute marks intelligently: harder questions get more points, easier ones get fewer.
7. Questions must be clear, unambiguous, and pedagogically sound.
8. Include plausible distractors (wrong answers) that test real understanding — avoid obviously wrong options.
9. Provide a brief "explanation" for each question explaining why the correct answer is right.
10. Mix difficulty levels across the quiz: include easy, medium, and hard questions.
11. For MCQ questions, option_text should be concise.
12. question_text should be complete and self-contained.
13. The total marks across all questions MUST equal the requested total points exactly.
14. Generate quiz title and description based on the teacher's instructions.
15. Output ONLY valid JSON. No markdown, no explanation, no extra text before or after the JSON.`;
    }

    // --------------------------------------------------------
    // JSON Schema — Enforces structured output from Gemini
    // --------------------------------------------------------
    get responseSchema() {
        return {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Quiz title' },
                description: { type: 'string', description: 'Brief quiz description' },
                questions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            question_text: { type: 'string', description: 'The question text' },
                            question_type: {
                                type: 'string',
                                enum: ['mcq_single', 'mcq_multiple', 'yes_no'],
                                description: 'Type of question'
                            },
                            marks: { type: 'number', description: 'Points for this question' },
                            correct_answer: {
                                type: 'string',
                                enum: ['yes', 'no'],
                                description: 'For yes_no questions only'
                            },
                            explanation: { type: 'string', description: 'Why the answer is correct' },
                            options: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        option_text: { type: 'string' },
                                        is_correct: { type: 'boolean' }
                                    },
                                    required: ['option_text', 'is_correct']
                                },
                                description: 'Answer options for MCQ questions'
                            }
                        },
                        required: ['question_text', 'question_type', 'marks']
                    }
                }
            },
            required: ['title', 'description', 'questions']
        };
    }

    // --------------------------------------------------------
    // Build the dynamic user prompt from teacher parameters
    // --------------------------------------------------------
    buildUserPrompt({ totalQuestions, singleChoiceCount, multipleChoiceCount, yesNoCount, totalPoints, userPrompt }) {
        const parts = [];

        parts.push(`Create a French language quiz with these exact specifications:`);
        parts.push(`- Total number of questions: ${totalQuestions}`);

        if (singleChoiceCount > 0) {
            parts.push(`- Single choice questions (mcq_single): exactly ${singleChoiceCount}`);
        }
        if (multipleChoiceCount > 0) {
            parts.push(`- Multiple choice questions (mcq_multiple): exactly ${multipleChoiceCount}`);
        }
        if (yesNoCount > 0) {
            parts.push(`- True/False questions (yes_no): exactly ${yesNoCount}`);
        }

        parts.push(`- Total points to distribute across ALL questions: exactly ${totalPoints}`);
        parts.push(`- Distribute the ${totalPoints} points proportionally based on difficulty (harder questions = more points)`);
        parts.push('');

        if (userPrompt && userPrompt.trim()) {
            parts.push(`Teacher's specific instructions:`);
            parts.push(`"${userPrompt.trim()}"`);
        } else {
            parts.push(`Create a general French language quiz covering grammar, vocabulary, and comprehension.`);
        }

        return parts.join('\n');
    }

    // --------------------------------------------------------
    // Call Gemini API to generate quiz questions
    // --------------------------------------------------------
    async generateQuiz({ totalQuestions, singleChoiceCount, multipleChoiceCount, yesNoCount, totalPoints, userPrompt }) {
        if (!this.client || this.apiKeys.length === 0) {
            throw new Error('AI Quiz Service is not configured. Set GEMINI_API_KEY in your .env file.');
        }

        // Validate inputs
        const sum = (singleChoiceCount || 0) + (multipleChoiceCount || 0) + (yesNoCount || 0);
        if (sum !== totalQuestions) {
            throw new Error(`Question type counts (${sum}) don't match total questions (${totalQuestions})`);
        }

        const dynamicPrompt = this.buildUserPrompt({
            totalQuestions, singleChoiceCount, multipleChoiceCount, yesNoCount, totalPoints, userPrompt
        });

        console.log(`🤖 AI Quiz: Generating ${totalQuestions} questions (${totalPoints} pts) via ${this.model}...`);

        let attempts = 0;
        
        while (attempts < this.apiKeys.length) {
            try {
                const response = await this.client.models.generateContent({
                    model: this.model,
                    contents: dynamicPrompt,
                    config: {
                        systemInstruction: this.systemPrompt,
                        responseMimeType: 'application/json',
                        responseSchema: this.responseSchema,
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                    }
                });

                const rawText = response.text;
                if (!rawText) {
                    throw new Error('Empty response from AI model');
                }

                // Parse JSON response
                let parsed;
                try {
                    parsed = JSON.parse(rawText);
                } catch (parseErr) {
                    console.error('🤖 AI Quiz: Failed to parse JSON response:', rawText.substring(0, 500));
                    throw new Error('AI returned invalid JSON. Please try again.');
                }

                // Validate and sanitize the response
                const validated = this.validateAndSanitize(parsed, {
                    totalQuestions, singleChoiceCount, multipleChoiceCount, yesNoCount, totalPoints
                });

                console.log(`✅ AI Quiz: Generated ${validated.questions.length} questions successfully`);
                return validated;

            } catch (error) {
                if (error.status === 429) {
                    console.warn(`⚠️ AI rate limit reached on key (Index: ${this.currentKeyIndex}).`);
                    attempts++;
                    if (attempts < this.apiKeys.length) {
                        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
                        console.log(`🔄 Switching to alternate API key (Index: ${this.currentKeyIndex})...`);
                        this.client = new GoogleGenAI({ apiKey: this.apiKeys[this.currentKeyIndex] });
                        continue;
                    } else {
                        throw new Error('All AI rate limits reached. Please try again later.');
                    }
                }
                if (error.status === 403) {
                    throw new Error('AI API key is invalid or lacks permissions. Check your GEMINI_API_KEY.');
                }
                console.error('🤖 AI Quiz generation error:', error.message);
                throw error;
            }
        }
    }

    // --------------------------------------------------------
    // Validate and sanitize the AI response
    // --------------------------------------------------------
    validateAndSanitize(parsed, params) {
        if (!parsed || !Array.isArray(parsed.questions)) {
            throw new Error('AI response missing questions array');
        }

        const title = typeof parsed.title === 'string' ? parsed.title.trim() : 'AI-Generated Quiz';
        const description = typeof parsed.description === 'string' ? parsed.description.trim() : '';

        const validatedQuestions = [];

        for (let i = 0; i < parsed.questions.length; i++) {
            const q = parsed.questions[i];

            // Validate question_type
            if (!['mcq_single', 'mcq_multiple', 'yes_no'].includes(q.question_type)) {
                console.warn(`🤖 AI Quiz: Question ${i + 1} has invalid type "${q.question_type}", skipping`);
                continue;
            }

            // Validate question_text
            if (!q.question_text || typeof q.question_text !== 'string') {
                console.warn(`🤖 AI Quiz: Question ${i + 1} missing text, skipping`);
                continue;
            }

            // Validate marks
            const marks = Number(q.marks);
            if (isNaN(marks) || marks <= 0) {
                q.marks = 1;
            }

            const validated = {
                question_text: q.question_text.trim(),
                question_type: q.question_type,
                marks: Number(q.marks),
                explanation: q.explanation || null
            };

            // Validate type-specific fields
            if (q.question_type === 'yes_no') {
                if (!['yes', 'no'].includes(q.correct_answer)) {
                    validated.correct_answer = 'yes'; // Default fallback
                    console.warn(`🤖 AI Quiz: Question ${i + 1} (yes_no) missing valid correct_answer, defaulting to "yes"`);
                } else {
                    validated.correct_answer = q.correct_answer;
                }
                // Ensure no options for yes_no
                validated.options = undefined;
            } else {
                // MCQ — validate options
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    console.warn(`🤖 AI Quiz: Question ${i + 1} (MCQ) has insufficient options, skipping`);
                    continue;
                }

                validated.options = q.options
                    .filter(opt => opt && typeof opt.option_text === 'string' && opt.option_text.trim())
                    .map(opt => ({
                        option_text: opt.option_text.trim(),
                        is_correct: Boolean(opt.is_correct)
                    }));

                // Validate correct answer counts
                const correctCount = validated.options.filter(o => o.is_correct).length;

                if (q.question_type === 'mcq_single') {
                    if (correctCount !== 1) {
                        // Auto-fix: keep only the first correct, or mark the first as correct
                        let foundFirst = false;
                        validated.options = validated.options.map(o => {
                            if (o.is_correct && !foundFirst) {
                                foundFirst = true;
                                return o;
                            }
                            return { ...o, is_correct: false };
                        });
                        if (!foundFirst && validated.options.length > 0) {
                            validated.options[0].is_correct = true;
                        }
                    }
                } else if (q.question_type === 'mcq_multiple') {
                    if (correctCount < 1) {
                        // Mark first two as correct
                        if (validated.options.length >= 2) {
                            validated.options[0].is_correct = true;
                            validated.options[1].is_correct = true;
                        }
                    }
                }
            }

            validatedQuestions.push(validated);
        }

        if (validatedQuestions.length === 0) {
            throw new Error('AI generated no valid questions. Please try again with different instructions.');
        }

        // Adjust marks to match total points if needed
        const currentTotal = validatedQuestions.reduce((sum, q) => sum + q.marks, 0);
        if (currentTotal !== params.totalPoints && params.totalPoints > 0) {
            const ratio = params.totalPoints / currentTotal;
            let distributed = 0;
            for (let i = 0; i < validatedQuestions.length; i++) {
                if (i === validatedQuestions.length - 1) {
                    // Last question gets the remainder to ensure exact total
                    validatedQuestions[i].marks = Math.max(1, Math.round(params.totalPoints - distributed));
                } else {
                    const adjusted = Math.max(1, Math.round(validatedQuestions[i].marks * ratio));
                    validatedQuestions[i].marks = adjusted;
                    distributed += adjusted;
                }
            }
        }

        return {
            title,
            description,
            questions: validatedQuestions
        };
    }
}

// Singleton
let instance = null;
function getAIQuizService() {
    if (!instance) {
        instance = new AIQuizService();
    }
    return instance;
}

module.exports = { AIQuizService, getAIQuizService };
