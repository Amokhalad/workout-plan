export type Phase = 'Build' | 'Deload' | 'Strength' | 'Power + Test'

export interface WeekMeta {
  week: number
  phase: Phase
  goal: string
  intensity: string
  progression: string
  dates: {
    upperStrength: string
    lowerStrength: string
    engineMind: string
    upperHypertrophy: string
    lowerHypertrophy: string
    aerobicRecovery: string
    rest: string
  }
}

export interface Exercise {
  name: string
  targets: string[]
  seedActual?: Partial<Record<number, string>>
  seedNotes?: Partial<Record<number, string>>
}

export interface WorkoutTemplate {
  id: string
  title: string
  subtitle: string
  day: string
  accent: string
  exercises: Exercise[]
  footer?: { label: string; targets: string[] }[]
}

const W = (t: string) => Array(12).fill(t) as string[]
const prog = (...weeks: string[]) => {
  const arr = Array(12).fill('')
  weeks.forEach((v, i) => { arr[i] = v })
  return arr
}

export const weekMeta: WeekMeta[] = [
  { week: 1, phase: 'Build', goal: 'Learn rhythm', intensity: 'RPE 7', progression: 'Start conservative', dates: { upperStrength: 'Sun, May 24', lowerStrength: 'Mon, May 25', engineMind: 'Tue, May 26', upperHypertrophy: 'Wed, May 27', lowerHypertrophy: 'Thu, May 28', aerobicRecovery: 'Fri, May 29', rest: 'Sat, May 30' } },
  { week: 2, phase: 'Build', goal: 'Add reps', intensity: 'RPE 7–8', progression: 'Add reps', dates: { upperStrength: 'Sun, May 31', lowerStrength: 'Mon, Jun 1', engineMind: 'Tue, Jun 2', upperHypertrophy: 'Wed, Jun 3', lowerHypertrophy: 'Thu, Jun 4', aerobicRecovery: 'Fri, Jun 5', rest: 'Sat, Jun 6' } },
  { week: 3, phase: 'Build', goal: 'Add weight', intensity: 'RPE 8', progression: 'Add weight if ready', dates: { upperStrength: 'Sun, Jun 7', lowerStrength: 'Mon, Jun 8', engineMind: 'Tue, Jun 9', upperHypertrophy: 'Wed, Jun 10', lowerHypertrophy: 'Thu, Jun 11', aerobicRecovery: 'Fri, Jun 12', rest: 'Sat, Jun 13' } },
  { week: 4, phase: 'Build', goal: 'Push volume', intensity: 'RPE 8–9', progression: 'Add reps/sets', dates: { upperStrength: 'Sun, Jun 14', lowerStrength: 'Mon, Jun 15', engineMind: 'Tue, Jun 16', upperHypertrophy: 'Wed, Jun 17', lowerHypertrophy: 'Thu, Jun 18', aerobicRecovery: 'Fri, Jun 19', rest: 'Sat, Jun 20' } },
  { week: 5, phase: 'Deload', goal: 'Recover', intensity: 'RPE 6', progression: 'Reduce volume', dates: { upperStrength: 'Sun, Jun 21', lowerStrength: 'Mon, Jun 22', engineMind: 'Tue, Jun 23', upperHypertrophy: 'Wed, Jun 24', lowerHypertrophy: 'Thu, Jun 25', aerobicRecovery: 'Fri, Jun 26', rest: 'Sat, Jun 27' } },
  { week: 6, phase: 'Strength', goal: 'Heavier loads', intensity: 'RPE 8', progression: 'Heavier main lifts', dates: { upperStrength: 'Sun, Jun 28', lowerStrength: 'Mon, Jun 29', engineMind: 'Tue, Jun 30', upperHypertrophy: 'Wed, Jul 1', lowerHypertrophy: 'Thu, Jul 2', aerobicRecovery: 'Fri, Jul 3', rest: 'Sat, Jul 4' } },
  { week: 7, phase: 'Strength', goal: 'Add weight', intensity: 'RPE 8', progression: 'Add small weight', dates: { upperStrength: 'Sun, Jul 5', lowerStrength: 'Mon, Jul 6', engineMind: 'Tue, Jul 7', upperHypertrophy: 'Wed, Jul 8', lowerHypertrophy: 'Thu, Jul 9', aerobicRecovery: 'Fri, Jul 10', rest: 'Sat, Jul 11' } },
  { week: 8, phase: 'Strength', goal: 'Push strength', intensity: 'RPE 8–9', progression: 'Add reps', dates: { upperStrength: 'Sun, Jul 12', lowerStrength: 'Mon, Jul 13', engineMind: 'Tue, Jul 14', upperHypertrophy: 'Wed, Jul 15', lowerHypertrophy: 'Thu, Jul 16', aerobicRecovery: 'Fri, Jul 17', rest: 'Sat, Jul 18' } },
  { week: 9, phase: 'Strength', goal: 'Rep PRs', intensity: 'RPE 9', progression: 'Push rep PRs', dates: { upperStrength: 'Sun, Jul 19', lowerStrength: 'Mon, Jul 20', engineMind: 'Tue, Jul 21', upperHypertrophy: 'Wed, Jul 22', lowerHypertrophy: 'Thu, Jul 23', aerobicRecovery: 'Fri, Jul 24', rest: 'Sat, Jul 25' } },
  { week: 10, phase: 'Deload', goal: 'Recover', intensity: 'RPE 6', progression: 'Reduce volume', dates: { upperStrength: 'Sun, Jul 26', lowerStrength: 'Mon, Jul 27', engineMind: 'Tue, Jul 28', upperHypertrophy: 'Wed, Jul 29', lowerHypertrophy: 'Thu, Jul 30', aerobicRecovery: 'Fri, Jul 31', rest: 'Sat, Aug 1' } },
  { week: 11, phase: 'Power + Test', goal: 'Explosive work', intensity: 'RPE 7–8', progression: 'Add power work', dates: { upperStrength: 'Sun, Aug 2', lowerStrength: 'Mon, Aug 3', engineMind: 'Tue, Aug 4', upperHypertrophy: 'Wed, Aug 5', lowerHypertrophy: 'Thu, Aug 6', aerobicRecovery: 'Fri, Aug 7', rest: 'Sat, Aug 8' } },
  { week: 12, phase: 'Power + Test', goal: 'Test progress', intensity: 'RPE 8–9', progression: 'Test 3–5RM', dates: { upperStrength: 'Sun, Aug 9', lowerStrength: 'Mon, Aug 10', engineMind: 'Tue, Aug 11', upperHypertrophy: 'Wed, Aug 12', lowerHypertrophy: 'Thu, Aug 13', aerobicRecovery: 'Fri, Aug 14', rest: 'Sat, Aug 15' } },
]

export const workouts: WorkoutTemplate[] = [
  {
    id: 'upper-strength',
    title: 'Upper Strength',
    subtitle: 'Heavy pressing & pulling',
    day: 'Sunday',
    accent: '#c9a962',
    exercises: [
      {
        name: 'Bench Press',
        targets: prog('4 x 5–8', '4 x 5–8', '4 x 5–8', '4 x 5–8', '4 x 3–6', '4 x 3–6', '4 x 3–6', '4 x 3–6', '2 x 5 easy', '> 3–5 reps', '> 3–5 reps', '> 3–5 reps'),
        seedActual: { 1: '135x5, 145x3, 140x2, 150x3' },
        seedNotes: { 1: 'Was feeling a bit tired and lower back pain' },
      },
      {
        name: 'Pull-Ups or Lat Pulldown',
        targets: prog('4 x 6–10', '4 x 6–10', '4 x 6–10', '4 x 6–10', '4 x 4–8', '4 x 4–8', '4 x 4–8', '4 x 4–8', '2 x 8 easy', '3 x 5–8', '3 x 5–8', '3 x 5–8'),
        seedActual: { 3: '138x4' },
      },
      {
        name: 'Overhead Press',
        targets: prog('3 x 6–10', '3 x 6–10', '3 x 6–10', '3 x 6–10', '3 x 4–6', '3 x 4–6', '3 x 4–6', '3 x 4–6', '2 x 6 easy', '3 x 5', '3 x 5', '3 x 5'),
      },
      {
        name: 'Chest-Supported Row',
        targets: prog('3 x 8–10', '3 x 8–10', '3 x 8–10', '3 x 8–10', '3 x 6–8', '3 x 6–8', '3 x 6–8', '3 x 6–8', '2 x 8 easy', '3 x 8', '3 x 8', '3 x 8'),
      },
      {
        name: 'Face Pulls',
        targets: W('2 x 15–20'),
      },
      {
        name: 'Curls + Triceps',
        targets: prog('2 x 10–12 each', '2 x 10–12 each', '2 x 10–12 each', '2 x 10–12 each', '2 x 8–12 each', '2 x 8–12 each', '2 x 8–12 each', '2 x 8–12 each', 'Optional', '2 x 10–12 each', '2 x 10–12 each', '2 x 10–12 each'),
      },
    ],
    footer: [{ label: 'Recovery', targets: prog('Sauna 10–15 min', 'Sauna 10–15 min', 'Sauna 10–15 min', 'Sauna 10–15 min', 'Optional sauna', 'Sauna 10–15 min', 'Sauna 10–15 min', 'Sauna 10–15 min', 'Sauna 10–15 min', 'Optional sauna', 'Sauna 10–15 min', 'Sauna 10–15 min') }],
  },
  {
    id: 'lower-strength',
    title: 'Lower Strength',
    subtitle: 'Squat pattern & posterior chain',
    day: 'Monday',
    accent: '#7eb8a4',
    exercises: [
      { name: 'Squat or Hack Squat', targets: prog('4 x 5–8', '4 x 5–8', '4 x 5–8', '4 x 5–8', '4 x 3–6', '4 x 3–6', '4 x 3–6', '4 x 3–6', '2 x 5 easy', '> 3–5 reps', '> 3–5 reps', '> 3–5 reps') },
      { name: 'Romanian Deadlift', targets: prog('3 x 6–10', '3 x 6–10', '3 x 6–10', '3 x 6–10', '3 x 5–8', '3 x 5–8', '3 x 5–8', '3 x 5–8', '2 x 6 easy', '3 x 5–8', '3 x 5–8', '3 x 5–8') },
      { name: 'Leg Press', targets: prog('3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 6–10', '3 x 6–10', '3 x 6–10', '3 x 6–10', '2 x 8 easy', '3 x 8–10', '3 x 8–10', '3 x 8–10') },
      { name: 'Walking Lunge', targets: prog('2 x 10/leg', '2 x 10/leg', '2 x 10/leg', '2 x 10/leg', '2 x 8–10/leg', '2 x 8–10/leg', '2 x 8–10/leg', '2 x 8–10/leg', '1–2 x 8/leg', '2 x 8/leg', '2 x 8/leg', '2 x 8/leg') },
      { name: 'Calf Raises', targets: prog('3 x 10–15', '3 x 10–15', '3 x 10–15', '3 x 10–15', '3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '2 x 12', '3 x 10–15', '3 x 10–15', '3 x 10–15') },
      { name: 'Core', targets: prog('3 rounds', '3 rounds', '3 rounds', '3 rounds', '3 rounds', '3 rounds', '3 rounds', '3 rounds', '2 rounds', '3 rounds', '3 rounds', '3 rounds') },
    ],
    footer: [{ label: 'Recovery', targets: W('No cold plunge after') }],
  },
  {
    id: 'engine-mind',
    title: 'Engine + Mind',
    subtitle: 'Cardio, mobility & breath',
    day: 'Tuesday',
    accent: '#6b9fd4',
    exercises: [
      { name: 'Zone 2 Cardio', targets: prog('40–50 min', '40–50 min', '40–50 min', '40–50 min', '30–40 min easy', '40–60 min', '40–60 min', '40–60 min', '40–60 min', '30–40 min easy', '40–60 min', '40–60 min') },
      { name: 'Mobility', targets: prog('10 min', '10 min', '10 min', '10 min', '10–15 min', '10 min', '10 min', '10 min', '10 min', '10–15 min', '10 min', '10 min') },
      { name: 'Cold Plunge', targets: prog('1–3 min', '1–3 min', '1–3 min', '1–3 min', 'Optional 1–2 min', '1–3 min', '1–3 min', '1–3 min', '1–3 min', 'Optional 1–2 min', '1–3 min', '1–3 min') },
      { name: 'Breathwork', targets: W('3–5 min') },
    ],
    footer: [{ label: 'Goal', targets: prog('Aerobic base', 'Aerobic base', 'Aerobic base', 'Aerobic base', 'Recover', 'Aerobic base', 'Aerobic base', 'Aerobic base', 'Aerobic base', 'Recover', 'Mental discipline', 'Mental discipline') }],
  },
  {
    id: 'upper-hypertrophy',
    title: 'Upper Hypertrophy',
    subtitle: 'Volume for chest, back & arms',
    day: 'Wednesday',
    accent: '#d4a574',
    exercises: [
      { name: 'Incline DB Press', targets: prog('3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–10', '3 x 8–10', '3 x 8–10', '3 x 8–10', '2 x 10 easy', '3 x 8–12', '3 x 8–12', '3 x 8–12') },
      { name: 'Cable Row', targets: prog('3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–10', '3 x 8–10', '3 x 8–10', '3 x 8–10', '2 x 10 easy', '3 x 8–12', '3 x 8–12', '3 x 8–12') },
      { name: 'Machine Chest Press or Dips', targets: prog('3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–10', '3 x 8–10', '3 x 8–10', '3 x 8–10', '2 x 10 easy', '3 x 8–12', '3 x 8–12', '3 x 8–12') },
      { name: 'Lat Pulldown', targets: prog('3 x 10–12', '3 x 10–12', '3 x 10–12', '3 x 10–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '2 x 10 easy', '3 x 10–12', '3 x 10–12', '3 x 10–12') },
      { name: 'Lateral Raise', targets: W('3 x 12–20') },
      { name: 'Rear Delt Fly', targets: W('2 x 12–20') },
      { name: 'Curls', targets: prog('2–3 x 10–15', '2–3 x 10–15', '2–3 x 10–15', '2–3 x 10–15', '2–3 x 8–12', '2–3 x 8–12', '2–3 x 8–12', '2–3 x 8–12', '1–2 easy sets', '2–3 x 10–15', '2–3 x 10–15', '2–3 x 10–15') },
      { name: 'Triceps Pressdown', targets: prog('2–3 x 10–15', '2–3 x 10–15', '2–3 x 10–15', '2–3 x 10–15', '2–3 x 8–12', '2–3 x 8–12', '2–3 x 8–12', '2–3 x 8–12', '1–2 easy sets', '2–3 x 10–15', '2–3 x 10–15', '2–3 x 10–15') },
    ],
  },
  {
    id: 'lower-hypertrophy',
    title: 'Lower Hypertrophy',
    subtitle: 'Glutes, quads & hamstrings',
    day: 'Thursday',
    accent: '#a88bc9',
    exercises: [
      { name: 'Hex Deadlift or Hip Thrust', targets: prog('3 x 6–10', '3 x 6–10', '3 x 6–10', '3 x 6–10', '3 x 5–8', '3 x 5–8', '3 x 5–8', '3 x 5–8', '2 x 6 easy', '3 x 5–8', '3 x 5–8', '3 x 5–8') },
      { name: 'Bulgarian Split Squat', targets: prog('3 x 8–12/leg', '3 x 8–12/leg', '3 x 8–12/leg', '3 x 8–12/leg', '3 x 8–10/leg', '3 x 8–10/leg', '3 x 8–10/leg', '3 x 8–10/leg', '2 x 8/leg easy', '3 x 8–12/leg', '3 x 8–12/leg', '3 x 8–12/leg') },
      { name: 'Leg Curl', targets: prog('3 x 10–15', '3 x 10–15', '3 x 10–15', '3 x 10–15', '3 x 8–12', '3 x 8–12', '3 x 8–12', '3 x 8–12', '2 x 12 easy', '3 x 10–15', '3 x 10–15', '3 x 10–15') },
      { name: 'Leg Extension', targets: prog('2–3 x 12–15', '2–3 x 12–15', '2–3 x 12–15', '2–3 x 12–15', '2–3 x 10–12', '2–3 x 10–12', '2–3 x 10–12', '2–3 x 10–12', '2 x 12 easy', '2–3 x 12–15', '2–3 x 12–15', '2–3 x 12–15') },
      { name: 'Back Extension or Cable Pull-Through', targets: prog('2 x 10–15', '2 x 10–15', '2 x 10–15', '2 x 10–15', '2 x 8–12', '2 x 8–12', '2 x 8–12', '2 x 8–12', '2 x 10 easy', '2 x 10–15', '2 x 10–15', '2 x 10–15') },
      { name: 'Core', targets: prog('3 sets', '3 sets', '3 sets', '3 sets', '3 sets', '3 sets', '3 sets', '3 sets', '2 sets', '3 sets', '3 sets', '3 sets') },
    ],
    footer: [{ label: 'Finisher', targets: prog('8–10 min bike/rower', '8–10 min bike/rower', '8–10 min bike/rower', '8–10 min bike/rower', 'Skip', '8–10 min bike/rower', '8–10 min bike/rower', '8–10 min bike/rower', '8–10 min bike/rower', 'Skip', '8–10 min bike/rower', '8–10 min bike/rower') }],
  },
  {
    id: 'aerobic-recovery',
    title: 'Aerobic + Recovery',
    subtitle: 'Long cardio & spa protocols',
    day: 'Friday',
    accent: '#5c8a9e',
    exercises: [
      { name: 'Zone 2 Cardio', targets: prog('45–60 min', '45–60 min', '45–60 min', '45–60 min', '30–45 min easy', '50–75 min', '50–75 min', '50–75 min', '50–75 min', '30–45 min easy', '45–75 min', '45–75 min') },
      { name: 'Sauna', targets: prog('10–20 min', '10–20 min', '10–20 min', '10–20 min', '10 min optional', '10–20 min', '10–20 min', '10–20 min', '10–20 min', '10 min optional', '10–20 min', '10–20 min') },
      { name: 'Steam Room', targets: W('Optional 5–10 min') },
      { name: 'Cold Plunge', targets: W('Optional 1–3 min') },
    ],
    footer: [
      { label: 'Goal', targets: prog('Recovery + aerobic base', 'Recovery + aerobic base', 'Recovery + aerobic base', 'Recovery + aerobic base', 'Recover', 'Recovery + aerobic base', 'Recovery + aerobic base', 'Recovery + aerobic base', 'Recovery + aerobic base', 'Recover', 'Recovery + discipline', 'Recovery + discipline') },
      { label: 'Core', targets: prog('3 rounds', '3 rounds', '3 rounds', '3 rounds', '2 rounds', '3 rounds', '3 rounds', '3 rounds', '3 rounds', '2 rounds', '3 rounds', '3 rounds') },
      { label: 'Recovery', targets: W('No cold plunge after') },
    ],
  },
]

export const restDay = {
  title: 'REST',
  subtitle: 'Full recovery — let adaptations happen',
  day: 'Saturday',
}

export const planTitle = 'Legendary Workout Plan'
export const planSubtitle = '12 Week Plan: Strong Body, Strong Mind'
