// Stillpoint — meditation content
// Each session: id, category, title, subtitle, description, pattern {inhale,holdIn,exhale,holdOut} in seconds,
// lengths (minutes options), guideText: array of lines shown periodically during practice.

const SESSIONS = [

  // ---------------- CALM ----------------
  {
    id: "calm-box",
    category: "calm",
    title: "Box Breathing",
    subtitle: "Equal-count square breath",
    description: "A steady four-part rhythm used by Navy SEALs and clinicians alike to settle the nervous system. Equal counts on every phase create a sense of containment and control.",
    pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
    lengths: [3, 5, 10, 15],
    guideText: [
      "Let your shoulders drop away from your ears.",
      "Trace each side of the square with your breath.",
      "There is nowhere else you need to be right now.",
      "Notice the stillness in the pause.",
      "Soften your jaw. Soften your hands."
    ]
  },
  {
    id: "calm-coherent",
    category: "calm",
    title: "Coherent Breathing",
    subtitle: "5.5 breaths per minute",
    description: "A gentle, even breath at roughly 5.5 cycles a minute — the rate researchers associate with maximal heart-rate variability and a calm, balanced nervous system.",
    pattern: { inhale: 5.5, holdIn: 0, exhale: 5.5, holdOut: 0 },
    lengths: [5, 10, 15, 20],
    guideText: [
      "No pauses. Just a slow, continuous wave.",
      "Let the exhale be the same length as the inhale.",
      "Feel the breath as one long, unbroken line.",
      "Your heart rate is finding its rhythm.",
      "Nothing to force. Only to allow."
    ]
  },
  {
    id: "calm-bodyscan",
    category: "calm",
    title: "Body Scan",
    subtitle: "Progressive awareness, natural breath",
    description: "A slow inward journey from crown to feet, releasing tension you didn't know you were holding. Breathe naturally throughout.",
    pattern: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
    lengths: [10, 15, 20],
    guideText: [
      "Bring attention to the crown of your head.",
      "Let your forehead and eyes go slack.",
      "Notice your jaw. Let it unclench.",
      "Feel the weight of your shoulders releasing down.",
      "Soften through your chest and belly.",
      "Let your hands rest, fingers loose.",
      "Notice your hips supported beneath you.",
      "Feel your legs, heavy and at ease.",
      "Your feet, warm and still.",
      "The whole body, resting."
    ]
  },

  // ---------------- FOCUS ----------------
  {
    id: "focus-478",
    category: "focus",
    title: "4-7-8 Clarity Breath",
    subtitle: "Sharpen attention before deep work",
    description: "A longer exhale relative to inhale that clears mental fog and primes the mind for a single-pointed task. Popularized by Dr. Andrew Weil.",
    pattern: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
    lengths: [3, 5, 10],
    guideText: [
      "Inhale quietly through the nose.",
      "Hold — let the oxygen settle.",
      "Exhale slowly, like air leaving a tire.",
      "Each cycle clears a little more static.",
      "You're arriving at the point of focus."
    ]
  },
  {
    id: "focus-single",
    category: "focus",
    title: "Single-Point Attention",
    subtitle: "Train sustained concentration",
    description: "A focus-training practice: hold attention on the breath sensation at the nostrils. Each time the mind wanders, gently return — that return is the rep.",
    pattern: { inhale: 4, holdIn: 2, exhale: 4, holdOut: 2 },
    lengths: [5, 10, 15, 20],
    guideText: [
      "Find the exact point where breath touches the nostrils.",
      "When the mind wanders, that's not failure — bring it back.",
      "Each return builds the muscle of attention.",
      "Stay with the sensation, moment to moment.",
      "Notice the subtle textures of each breath."
    ]
  },
  {
    id: "focus-alternate",
    category: "focus",
    title: "Alternate Nostril Balance",
    subtitle: "Nadi Shodhana for mental balance",
    description: "A classical pranayama technique believed to balance the two hemispheres of processing. Follow the cue and alternate which nostril you breathe through (finger on the opposite side).",
    pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 0 },
    lengths: [5, 10, 15],
    guideText: [
      "Close the right nostril. Inhale left.",
      "Switch — close left, exhale right.",
      "Inhale right, then switch and exhale left.",
      "Let each switch mark a small mental reset.",
      "Balance builds one cycle at a time."
    ]
  },

  // ---------------- SLEEP ----------------
  {
    id: "sleep-478",
    category: "sleep",
    title: "4-7-8 Wind Down",
    subtitle: "Slow the system for sleep",
    description: "The same 4-7-8 ratio, applied gently at a lower pace to cue the body toward rest. Best done lying down, lights low.",
    pattern: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 2 },
    lengths: [5, 10, 15],
    guideText: [
      "Let the bed hold your full weight.",
      "There is nowhere to be but here, now.",
      "Each exhale sinks you a little deeper.",
      "The day is finished. It can be put down.",
      "Let your thoughts drift like slow clouds."
    ]
  },
  {
    id: "sleep-descent",
    category: "sleep",
    title: "Body Descent",
    subtitle: "Heavy-body relaxation for sleep",
    description: "A body-scan variant that emphasizes heaviness and release, moving slowly downward to prime the body for deep sleep.",
    pattern: { inhale: 5, holdIn: 0, exhale: 7, holdOut: 0 },
    lengths: [10, 15, 20, 30],
    guideText: [
      "Feel your head grow heavy on the pillow.",
      "Your shoulders sink into the mattress.",
      "Your arms are heavy, warm, unmoving.",
      "Your chest rises and falls without effort.",
      "Your hips are heavy, supported completely.",
      "Your legs feel like they're sinking into the bed.",
      "Your feet are warm and still.",
      "The whole body is heavy, at rest, safe.",
      "Let sleep come in its own time."
    ]
  },
  {
    id: "sleep-count",
    category: "sleep",
    title: "Descending Count",
    subtitle: "Counting breath for a racing mind",
    description: "Silently count each exhale down from 20 to 1. If you lose count or your mind wanders, simply start again at 20 — no judgment, just return.",
    pattern: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
    lengths: [5, 10, 15],
    guideText: [
      "Count each exhale, starting at 20.",
      "If you lose the count, begin again at 20.",
      "There's no failing this — only returning.",
      "Let the numbers get slower and quieter.",
      "Let the count dissolve into rest."
    ]
  },

  // ---------------- STRESS RELIEF ----------------
  {
    id: "stress-physiological",
    category: "stress",
    title: "Physiological Sigh",
    subtitle: "Fast-acting stress release",
    description: "Double inhale through the nose followed by a long exhale through the mouth — the fastest known technique to lower physiological arousal in real time, from Huberman Lab research.",
    pattern: { inhale: 2, holdIn: 1, exhale: 6, holdOut: 0 },
    lengths: [3, 5, 10],
    guideText: [
      "Two short inhales through the nose, stacked.",
      "One long, slow exhale through the mouth.",
      "Feel the immediate drop in tension.",
      "Each sigh discharges a little more stress.",
      "You are actively downshifting your body right now."
    ]
  },
  {
    id: "stress-extended-exhale",
    category: "stress",
    title: "Extended Exhale",
    subtitle: "Activate the calming response",
    description: "A long, slow exhale relative to the inhale directly stimulates the vagus nerve and parasympathetic 'rest and digest' response — useful in the middle of a stressful moment.",
    pattern: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 },
    lengths: [3, 5, 10, 15],
    guideText: [
      "Breathe in through the nose, unhurried.",
      "Let the exhale stretch out, twice as long.",
      "Feel your heart rate ease with every exhale.",
      "This moment of stress does not need to control you.",
      "You have a way through — it's this breath."
    ]
  },
  {
    id: "stress-grounding",
    category: "stress",
    title: "Grounding Presence",
    subtitle: "Return to the body, out of the spiral",
    description: "A sensory-anchored practice for moments of anxiety or overwhelm — using the breath as an anchor back into the present body.",
    pattern: { inhale: 4, holdIn: 4, exhale: 6, holdOut: 0 },
    lengths: [5, 10],
    guideText: [
      "Feel the points where your body touches the chair or floor.",
      "Notice one sound in the room, without naming it.",
      "Notice the temperature of the air on your skin.",
      "You are safe, here, in this exact moment.",
      "The spiral loses power the moment you notice it."
    ]
  },

  // ---------------- ENERGY ----------------
  {
    id: "energy-bellows",
    category: "energy",
    title: "Bellows Breath",
    subtitle: "Quick, energizing rhythm",
    description: "A brisk, equal-ratio breath that raises alertness without caffeine — good for a mid-afternoon lift or before a demanding task.",
    pattern: { inhale: 2, holdIn: 0, exhale: 2, holdOut: 0 },
    lengths: [3, 5],
    guideText: [
      "Quick, energetic inhales and exhales.",
      "Feel alertness building with each cycle.",
      "Keep the breath light and rhythmic.",
      "Energy is rising through the body.",
      "You're waking up the system, gently."
    ]
  },
  {
    id: "energy-morning",
    category: "energy",
    title: "Morning Activation",
    subtitle: "A brighter start to the day",
    description: "A moderately paced breath with a slightly longer inhale, designed to shift you out of sleep inertia and into an awake, engaged state.",
    pattern: { inhale: 5, holdIn: 2, exhale: 4, holdOut: 0 },
    lengths: [3, 5, 10],
    guideText: [
      "Breathe in as if drawing in morning light.",
      "Hold — feel the day's possibility.",
      "Exhale anything left over from sleep.",
      "Notice the body waking, cell by cell.",
      "You're choosing how today begins."
    ]
  },

  // ---------------- GRATITUDE ----------------
  {
    id: "gratitude-open",
    category: "gratitude",
    title: "Open Gratitude",
    subtitle: "Unstructured reflection with steady breath",
    description: "A simple steady breath as a backdrop while you silently bring to mind three things — big or small — that you're grateful for today.",
    pattern: { inhale: 4, holdIn: 2, exhale: 6, holdOut: 0 },
    lengths: [3, 5, 10],
    guideText: [
      "Bring to mind one person you're grateful for.",
      "Notice the feeling in your chest as you think of them.",
      "Bring to mind one small comfort from today.",
      "Let gratitude be a felt sense, not just a thought.",
      "Notice one thing about your own body to be thankful for.",
      "Let this feeling settle before you return to the day."
    ]
  },
  {
    id: "gratitude-loving-kindness",
    category: "gratitude",
    title: "Loving-Kindness",
    subtitle: "Metta practice, outward-expanding",
    description: "A classical practice of extending goodwill — first to yourself, then to someone you love, then to someone neutral, then to all beings.",
    pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 0 },
    lengths: [5, 10, 15],
    guideText: [
      "May I be safe. May I be at ease.",
      "Bring to mind someone you love. May they be safe and at ease.",
      "Bring to mind someone neutral. May they be safe and at ease.",
      "Even someone difficult. May they, too, find ease.",
      "Let the feeling expand outward to all beings, everywhere.",
      "Rest in the warmth of that wide-open care."
    ]
  }
];

const CATEGORY_LABELS = {
  calm: "Calm",
  focus: "Focus",
  sleep: "Sleep",
  stress: "Stress Relief",
  energy: "Energy",
  gratitude: "Gratitude"
};
