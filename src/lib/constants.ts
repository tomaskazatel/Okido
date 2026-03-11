export const MODE_CONFIG = {
  ok: {
    emoji: '\u{1F7E2}',
    label: 'All good',
    color: 'emerald',
    intervalHours: 24,
  },
  uncertain: {
    emoji: '\u{1F7E1}',
    label: 'Uncertain',
    color: 'amber',
    intervalHours: 12,
  },
  crisis: {
    emoji: '\u{1F534}',
    label: 'Crisis',
    color: 'red',
    intervalHours: 3,
  },
} as const

export type CheckinMode = keyof typeof MODE_CONFIG

export const MESSAGE_MAX_LENGTH = 140

export const CHECKIN_HISTORY_LIMIT = 20
