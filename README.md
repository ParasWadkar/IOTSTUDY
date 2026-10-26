# IoT Quiz

Mobile-first personal quiz app for *Introduction to Internet of Things* (NPTEL), built with Next.js 15 (App Router), TypeScript and Tailwind CSS. Fully client-side; progress, bookmarks and theme are stored in `localStorage`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (deploys to Vercel as-is)
```

## Adding questions

Quiz content lives in `src/data/weeks/week-N.json`, separate from the UI:

```json
{ "week": 1, "title": "Week 1", "questions": [
  { "id": "w1-q1", "week": 1, "number": 1, "type": "MCQ",
    "question": "...", "options": ["...", "..."],
    "correct": [1],
    "explanation": "...", "source": "See lecture ..." } ] }
```

`type` is `MCQ`, `MSQ` or `TF`; `correct` holds indices into `options`.
Add a new week by creating its JSON file and listing it in `src/lib/data.ts`.
