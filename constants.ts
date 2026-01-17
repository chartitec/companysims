
import { ActionDefinition, Character, CharacterState, LocationType } from './types';

export const TICK_RATE_MS = 500; // 500ms real time = 1 game tick
export const MOVEMENT_SPEED = 1; // Grid units per tick

// Time Constants
export const TICKS_PER_WEEK = 100;
export const WEEKS_PER_MONTH = 4;
export const MONTHS_PER_QUARTER = 3;
export const TICKS_PER_MONTH = TICKS_PER_WEEK * WEEKS_PER_MONTH; // 400
export const TICKS_PER_QUARTER = TICKS_PER_MONTH * MONTHS_PER_QUARTER; // 1200

// Map Layout (20x20 Grid)
// We define "Centroids" or entry points for these locations
export const LOCATIONS: Record<LocationType, { x: number; y: number }> = {
  [LocationType.CEO_OFFICE]: { x: 2, y: 2 },
  [LocationType.MEETING_ROOM_1]: { x: 9, y: 3 },
  [LocationType.MEETING_ROOM_2]: { x: 16, y: 3 },
  
  // Desk Area is a zone, this is just a reference point (e.g., entrance to desk area)
  [LocationType.DESK]: { x: 10, y: 10 }, 
  
  [LocationType.PANTRY]: { x: 2, y: 17 },
  [LocationType.RESTROOM]: { x: 17, y: 17 },
  [LocationType.LOUNGE]: { x: 9, y: 17 },
  [LocationType.ELEVATOR]: { x: 18, y: 9 },
};

export const LOCATION_NAMES: Record<LocationType, string> = {
  [LocationType.DESK]: '办公区',
  [LocationType.PANTRY]: '茶水间',
  [LocationType.RESTROOM]: '卫生间',
  [LocationType.LOUNGE]: '休息区',
  [LocationType.MEETING_ROOM_1]: '会议室 A',
  [LocationType.MEETING_ROOM_2]: '会议室 B',
  [LocationType.CEO_OFFICE]: 'CEO 办公室',
  [LocationType.ELEVATOR]: '电梯间',
};

// Utility AI Logic
export const ACTIONS: ActionDefinition[] = [
  {
    id: 'work_code',
    label: '写代码',
    requiredLocation: LocationType.DESK,
    duration: 8,
    utilityScorer: (char: Character) => {
      // Base score
      let score = 30;

      // 1. Money/Economy Pressure
      if (char.debt > 0) {
        score += Math.min(50, char.debt / 100000); 
      }
      if (char.savings < 5000 && char.level !== 'Intern') {
        score += 20;
      }

      // 2. Core Stats & Skills
      score += char.intelligence * 0.2; 
      score += char.ambition * 0.5;
      score += (char.skills.programming || 0) * 0.15;

      // 3. Characteristics
      if (char.characteristics.includes('卷王')) score += 50;
      if (char.characteristics.includes('拜金')) score += 25; 
      if (char.characteristics.includes('理性')) score += 10;
      if (char.characteristics.includes('社恐')) score += 15; 

      // 4. Penalties
      if (char.stats.energy < 30) score -= 30;
      if (char.sickness) score -= 40;
      
      if (char.stats.stress > 80 && !char.characteristics.includes('卷王')) {
         score -= 60; 
      }
      
      score -= char.stats.bladder * 0.5;

      return Math.max(0, score);
    },
    effects: (char) => {
      const stressGain = 15 - (char.intelligence * 0.05); 
      const energyCost = 10 - ((char.skills.programming || 0) * 0.03);
      
      // Calculate LOC generated
      const locBase = 50;
      const locBonus = (char.skills.programming || 0) * 2;
      const performanceGain = locBase + locBonus + (Math.random() * 20);
      
      // Chance to fix (or create?) bugs. Let's say we track "Bugs Fixed" as a positive metric.
      // Higher skill = more bugs fixed.
      const bugFixChance = 0.2 + ((char.skills.programming || 0) * 0.005);
      const bugsFixed = Math.random() < bugFixChance ? 1 : 0;

      return {
        energy: char.stats.energy - Math.max(2, energyCost),
        stress: char.stats.stress + Math.max(5, stressGain),
        social: char.stats.social - 2,
        performance: {
          ...char.performance,
          linesOfCode: char.performance.linesOfCode + Math.floor(performanceGain),
          bugsFixed: char.performance.bugsFixed + bugsFixed
        }
      };
    },
  },
  {
    id: 'stock_trading',
    label: '摸鱼炒股',
    requiredLocation: LocationType.DESK,
    duration: 4,
    utilityScorer: (char: Character) => {
      if (char.stocks === 0 && !char.characteristics.includes('拜金')) return 0;
      let score = 0;
      if (char.characteristics.includes('拜金')) score += 40;
      if (char.characteristics.includes('卷王')) score -= 30; 
      score += Math.min(40, char.stocks / 5000);
      if (char.stats.stress > 40 && char.stats.stress < 80) score += 15;
      return Math.max(0, score);
    },
    effects: (char) => {
      const marketMove = (Math.random() - 0.45) * 0.05; 
      const newStockVal = Math.floor(char.stocks * (1 + marketMove));
      const profit = newStockVal - char.stocks;
      const moodImpact = profit > 0 ? -10 : 15; 

      return {
        stocks: newStockVal,
        stress: Math.max(0, char.stats.stress + moodImpact),
        energy: char.stats.energy - 2,
        skills: {
            ...char.skills,
            analysis: (char.skills.analysis || 0) + (Math.random() > 0.8 ? 0.1 : 0)
        }
      };
    }
  },
  {
    id: 'drink_coffee',
    label: '喝咖啡',
    requiredLocation: LocationType.PANTRY,
    duration: 3,
    utilityScorer: (char: Character) => {
      let score = (100 - char.stats.energy) * 1.5;
      if (char.characteristics.includes('贪吃')) score += 20;
      if (char.characteristics.includes('卷王')) score += 10; 
      if (char.stats.stress > 70) score += 20; 
      if (char.sickness) score += 25; 
      score -= char.stats.bladder * 0.5;
      return Math.max(0, score);
    },
    effects: (char) => ({
      energy: Math.min(100, char.stats.energy + 40),
      bladder: Math.min(100, char.stats.bladder + 25),
      stress: Math.max(0, char.stats.stress - 5),
    }),
  },
  {
    id: 'use_restroom',
    label: '上厕所',
    requiredLocation: LocationType.RESTROOM,
    duration: 4,
    utilityScorer: (char: Character) => {
      let score = Math.pow(char.stats.bladder, 2.2) / 100;
      if (char.physical_health < 50) score *= 1.2;
      if (char.age > 40) score *= 1.3;
      if (char.characteristics.includes('社恐') && char.stats.stress > 70) score += 30;
      return score;
    },
    effects: (char) => ({
      bladder: 0,
      stress: Math.max(0, char.stats.stress - 5),
    }),
  },
  {
    id: 'nap',
    label: '休息打盹',
    requiredLocation: LocationType.LOUNGE,
    duration: 10,
    utilityScorer: (char: Character) => {
      if (char.stats.energy > 50 && !char.sickness) return 0;
      let score = (100 - char.stats.energy) * 1.8;
      if (char.characteristics.includes('钝感力')) score += 25;
      if (char.characteristics.includes('卷王')) score -= 40; 
      if (char.physical_health < 40) score += 40;
      if (char.sickness) score += 60;
      return Math.max(0, score);
    },
    effects: (char) => {
      const recoveryBonus = char.characteristics.includes('钝感力') ? 20 : 0;
      return {
        energy: Math.min(100, char.stats.energy + 50 + recoveryBonus),
        stress: Math.max(0, char.stats.stress - 20),
      };
    },
  },
  {
    id: 'gossip',
    label: '摸鱼八卦',
    requiredLocation: LocationType.PANTRY, // Moved to Pantry/Lounge often
    duration: 5,
    utilityScorer: (char: Character) => {
      const socialNeed = (100 - char.stats.social);
      let score = (socialNeed * 0.8) + (char.stats.stress * 0.6);
      if (char.characteristics.includes('社恐')) score -= 100; 
      if (char.characteristics.includes('城府')) score += 30;
      if (char.characteristics.includes('感性')) score += 20;
      if (char.characteristics.includes('卷王')) score -= 30;
      if (char.debt > 5000000) score -= 20;
      return Math.max(0, score);
    },
    effects: (char) => {
      const socialRecovery = 30 + (char.attraction * 0.2);
      const stressRelief = 20 + ((char.skills.psychology || 0) * 0.2);
      return {
        stress: Math.max(0, char.stats.stress - stressRelief),
        social: Math.min(100, char.stats.social + socialRecovery),
        energy: Math.max(0, char.stats.energy - 5),
      };
    },
  },
  {
    id: 'training_session',
    label: '技能培训',
    requiredLocation: LocationType.MEETING_ROOM_1,
    duration: 15,
    utilityScorer: (char: Character) => {
      let score = char.ambition * 0.6;
      if (char.company_years < 3) score += (3 - char.company_years) * 10;
      if (char.stats.energy < 40) score -= 30;
      if (char.characteristics.includes('野心') || char.characteristics.includes('卷王')) score += 20;
      if ((char.skills.system_design || 0) < 30) score += 20;
      return Math.max(0, score);
    },
    effects: (char) => {
      return {
        energy: Math.max(0, char.stats.energy - 25), 
        stress: Math.min(100, char.stats.stress + 5),
        intelligence: Math.min(100, char.intelligence + 0.2),
        skills: {
          ...char.skills,
          system_design: (char.skills.system_design || 0) + 0.5
        }
      };
    }
  },
  {
    id: 'visit_ceo',
    label: '汇报工作',
    requiredLocation: LocationType.CEO_OFFICE,
    duration: 10,
    utilityScorer: (char: Character) => {
       if (char.level === 'Intern') return 0;
       if (!char.characteristics.includes('野心') && !char.characteristics.includes('城府')) return 0;
       
       // High ambition, good performance, low stress -> try to impress CEO
       if (char.ambition > 80 && char.stats.stress < 50) return 40;
       return 0;
    },
    effects: (char) => {
       const success = Math.random() > 0.5;
       return {
         stress: char.stats.stress + 20, // Stressful
         social: char.stats.social + (success ? 20 : -20),
         // Small chance of political skill gain
         skills: { ...char.skills, psychology: (char.skills.psychology || 0) + 0.2 }
       }
    }
  },
  {
    id: 'record_misconduct',
    label: '打小报告',
    requiredLocation: LocationType.DESK, // Just a placeholder, Manager moves to victim
    duration: 5,
    utilityScorer: (char: Character) => 0, // Triggered manually by Simulation logic
    effects: (char) => {
      // Manager feels a bit of power (stress relief) but social hit?
      return {
        stress: Math.max(0, char.stats.stress - 5),
      };
    }
  }
];
