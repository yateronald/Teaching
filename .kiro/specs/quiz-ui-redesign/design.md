# Quiz UI Redesign — Design

## Quiz List Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  📝 Quiz Management                    [+ Create Quiz]  │
│  Manage quizzes for your students                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │  12  │ │  8   │ │  4   │ │ 75%  │                  │
│  │Total │ │Publd │ │Draft │ │ Avg  │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
├─────────────────────────────────────────────────────────┤
│  [Search...] [Status ▼] [Batch ▼]                      │
├─────────────────────────────────────────────────────────┤
│  Title      │ Batch    │ Questions │ Marks │ Status    │
│  Quiz 10    │ A1       │ 5         │ 50    │ Published │
│  Quiz 9     │ B2       │ 3         │ 30    │ Draft     │
└─────────────────────────────────────────────────────────┘
```

## Quiz Builder Layout (inside modal)

```
┌─────────────────────────────────────────────────────────┐
│  Create New Quiz                                    [X] │
├───────────────────────────────────┬─────────────────────┤
│                                   │  Quiz Summary       │
│  📋 Quiz Details                  │  ┌───────────────┐  │
│  ┌─────────────────────────────┐  │  │ Questions: 5  │  │
│  │ Title: [____________]       │  │  │ Points: 50    │  │
│  │ Description: [__________]   │  │  │ MCQ: 3        │  │
│  │ Instructions: [_________]   │  │  │ Yes/No: 2     │  │
│  └─────────────────────────────┘  │  └───────────────┘  │
│                                   │                     │
│  ⚙️ Settings                      │                     │
│  ┌─────────────────────────────┐  │                     │
│  │ Batches: [Select ▼]        │  │                     │
│  │ Duration: [30] min          │  │                     │
│  │ Schedule: [Start] → [End]   │  │                     │
│  │ ☐ Randomize Questions       │  │                     │
│  │ ☐ Randomize Options         │  │                     │
│  └─────────────────────────────┘  │                     │
│                                   │                     │
│  📝 Questions                     │                     │
│  ┌─────────────────────────────┐  │                     │
│  │ Q1: What is...  [MCQ] 10pt │  │                     │
│  │ Q2: Is French... [Y/N] 5pt │  │                     │
│  │ [+ Add Question]           │  │                     │
│  └─────────────────────────────┘  │                     │
│                                   │                     │
│  [Cancel] [Save Draft] [Publish]  │                     │
└───────────────────────────────────┴─────────────────────┘
```

## Component Structure
- QuizManagement.tsx: list page with stats, filters, table
- QuizBuilder.tsx: creation/edit form with sections and summary sidebar
- Question modal: embedded in QuizBuilder, opens for add/edit question
