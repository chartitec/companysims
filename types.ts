
export enum CharacterState {
  IDLE = 'IDLE',
  MOVING = 'MOVING',
  PERFORMING = 'PERFORMING',
  BREAKDOWN = 'BREAKDOWN',
  DEAD = 'DEAD',
}

export enum LocationType {
  DESK = 'Desk', // Generic type, but logic uses specific coordinates
  PANTRY = 'Pantry',
  RESTROOM = 'Restroom',
  LOUNGE = 'Lounge',
  MEETING_ROOM_1 = 'Meeting Room 1',
  MEETING_ROOM_2 = 'Meeting Room 2',
  CEO_OFFICE = 'CEO Office',
  ELEVATOR = 'Elevator',
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Stats {
  energy: number; // 0-100 (Decays)
  stress: number; // 0-100 (Increases)
  bladder: number; // 0-100 (Increases)
  social: number; // 0-100 (Decays)
}

export interface StatDeltas {
  energy: number;
  stress: number;
  bladder: number;
  social: number;
  physical_health: number;
  mental_health: number;
}

export type Characteristic = '钝感力' | '高敏感' | '卷王' | '社恐' | '真诚' | '城府' | '野心' | '拜金' | '朴素' | '理性' | '感性' | '好色' | '贪吃' | '易怒' | '八卦';

export interface Skills {
  programming: number;
  system_design: number;
  analysis: number;
  guitar?: number;
  literature?: number;
  debate?: number;
  psychology?: number;
  [key: string]: number | undefined;
}

export interface PerformanceMetrics {
  linesOfCode: number;
  bugsFixed: number;
  lastReviewScore: number;
}

export interface Secret {
  id: string;
  content: string;
  rarity: 'Common' | 'Rare' | 'Epic';
}

export interface Character {
  id: string;
  isPlayer?: boolean; // Flag for player control
  name: string;
  role: string;
  color: string;
  
  // Spatial
  position: Coordinates;
  targetPosition: Coordinates | null;
  targetCharacterId?: string | null; // ID of character being interacted with
  assignedDesk: Coordinates; // The desk strictly assigned to this character
  location: LocationType; // Logical location zone
  
  state: CharacterState;
  currentActionId: string | null;
  actionTimer: number; // Ticks remaining for current action/movement
  stats: Stats;
  lastDeltas: StatDeltas; // Tracks the change in stats from the last tick
  thoughtBubble: string;

  // New Detailed Attributes
  age: number;
  hometown: string;
  hometown_tier: 1 | 2 | 3 | 4 | 5;
  university: string;
  university_level: 'Top2' | '985' | '211' | 'Ordinary' | 'Overseas';
  gender: 'Male' | 'Female' | 'Other';
  sex_orientation: 'Hetero' | 'Homo' | 'Bi' | 'Pan';
  
  // Relationship & Family
  spouseId: string | null;
  isPregnant: boolean;
  pregnancyTimer: number; // 0-100 progress or ticks
  
  // Job & Economy
  level: string; // P5, P6...
  company_years: number;
  monthly_salary_base: number; // RMB
  annual_bonus_months: number;
  savings: number;
  debt: number;
  stocks: number;
  options: number;
  assets: number;
  is_married: boolean; // Keep for backward compat or simple flag
  performance: PerformanceMetrics; // Quarterly KPI

  // Inner Stats (Stable)
  intelligence: number; // 0-100
  attraction: number; // 0-100
  ambition: number; // 0-100
  physical_health: number; // 0-100
  mental_health: number; // 0-100
  sickness: string | null;

  // Social & Personality
  network_intimacy: Record<string, number>; // ID -> Value (0-100)
  characteristics: Characteristic[];
  skills: Skills;
  knownSecrets: Secret[];
}

export interface ActionDefinition {
  id: string;
  label: string;
  requiredLocation: LocationType;
  duration: number; // In ticks
  utilityScorer: (char: Character) => number;
  effects: (char: Character) => Record<string, any>; // Relaxed type to allow root property updates
  animation?: string;
}

// For JSON Export/Import
export interface SerializableAction {
  id: string;
  label: string;
  requiredLocation: LocationType;
  duration: number;
  utilityScorerCode: string; // The function body as string
  effectsCode: string;      // The function body as string
}

export interface GameConfig {
  characters: Character[];
  actions: SerializableAction[];
}

export interface WorldState {
  tick: number;
  week: number;
  quarter: number;
  characters: Character[];
  logs: LogEntry[];
  locations: Record<LocationType, Coordinates>;
  managerActive: boolean;
  managerTimer: number;
}

export interface LogEntry {
  id: string;
  tick: number;
  message: string;
  type: 'info' | 'action' | 'alert' | 'finance' | 'system' | 'love' | 'secret';
}
