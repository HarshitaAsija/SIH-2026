export const SAMPLE_PRESETS = [
  {
    id: "preset-low",
    name: "Scenario 1: Low / Moderate Concern",
    category: "Moderate Concern",
    is_critical_preset: false,
    complaint_text: "I have been feeling stressed and unsafe lately, but I am currently in a safe place.",
    detected_indicators: ["General Distress", "Currently Safe Location"],
    prosody: {
      pitch_mean: 195.0,
      pitch_std: 22.0,
      jitter: 0.015,
      shimmer: 0.030,
      pause_ratio: 0.20,
      speaking_rate: 2.6,
      energy_variance: 10.0
    }
  },
  {
    id: "preset-high",
    name: "Scenario 2: High Concern",
    category: "High Threat",
    is_critical_preset: false,
    complaint_text: "I have been repeatedly threatened and I am afraid that the situation may get worse.",
    detected_indicators: ["Repeated Intimidation", "Fear Signals", "Escalation Threat"],
    prosody: {
      pitch_mean: 230.0,
      pitch_std: 38.0,
      jitter: 0.028,
      shimmer: 0.052,
      pause_ratio: 0.32,
      speaking_rate: 2.0,
      energy_variance: 15.0
    }
  },
  {
    id: "preset-critical",
    name: "Scenario 3: Critical Concern",
    category: "Critical Escalation",
    is_critical_preset: true,
    complaint_text: "I am receiving repeated threats, I am afraid for my family, and I don't know where to go for help.",
    detected_indicators: ["Active Death Threat", "Family Vulnerability", "Imminent Danger"],
    prosody: {
      pitch_mean: 255.0,
      pitch_std: 52.0,
      jitter: 0.042,
      shimmer: 0.070,
      pause_ratio: 0.40,
      speaking_rate: 1.6,
      energy_variance: 20.0
    }
  },
  {
    id: "preset-hathras",
    name: "Scenario 4: Urgent Protection & Violence Threat",
    category: "Critical Protection",
    is_critical_preset: true,
    complaint_text: "I am facing physical violence and illegal land encroachment in my village. We are being threatened with our lives if we do not leave immediately, and the local authorities refused to file an FIR. I feel helpless and need urgent protection.",
    detected_indicators: ["Physical Violence", "Police Refusal to File FIR", "Land Encroachment", "Imminent Safety Threat"],
    prosody: {
      pitch_mean: 245.0,
      pitch_std: 48.2,
      jitter: 0.038,
      shimmer: 0.065,
      pause_ratio: 0.38,
      speaking_rate: 1.7,
      energy_variance: 18.5
    }
  }
];


