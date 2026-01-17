
import { Character, CharacterState, LocationType, Stats, Skills, Characteristic, Coordinates } from './types';
import { LOCATIONS } from './constants';

const NAMES_MALE = ['伟', '强', '磊', '洋', '勇', '军', '杰', '涛', '超', '明', '刚', '平', '辉', '鹏', '华'];
const NAMES_FEMALE = ['芳', '娜', '敏', '静', '秀', '娟', '英', '华', '丽', '艳', '菲', '琳', '晶', '萍', '玲'];
const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林'];

const CITIES_TIER_1 = ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou'];
const CITIES_TIER_2 = ['Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an', 'Nanjing'];

const ROLES = ['后端开发', '前端开发', '产品经理', 'UI设计师', '测试工程师', '算法工程师', '运维'];

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
];

const CHARACTERISTICS_POOL: Characteristic[] = [
  '钝感力', '高敏感', '卷王', '社恐', '真诚', '城府', '野心', '拜金', '朴素', '理性', '感性', '好色', '贪吃', '易怒'
];

// Desk Slots: x: 2-18, y: 5-14 (Grid is 20x20). 
// Regular employee rows
const DESK_SLOTS: Coordinates[] = [];
// Row 1
for (let x = 4; x <= 16; x += 2) DESK_SLOTS.push({ x, y: 7 });
// Row 2
for (let x = 4; x <= 16; x += 2) DESK_SLOTS.push({ x, y: 10 });
// Row 3
for (let x = 4; x <= 16; x += 2) DESK_SLOTS.push({ x, y: 13 });

// Helper to get random item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Base Character Template
const createBaseCharacter = (id: string, name: string, assignedDesk: Coordinates): Character => ({
    id,
    isPlayer: false,
    name,
    role: 'Employee',
    color: 'bg-slate-500',
    position: { ...assignedDesk },
    targetPosition: null,
    assignedDesk,
    location: LocationType.DESK,
    state: CharacterState.IDLE,
    currentActionId: null,
    actionTimer: 0,
    stats: { energy: 80, stress: 0, bladder: 0, social: 50 },
    lastDeltas: { energy: 0, stress: 0, bladder: 0, social: 0, physical_health: 0, mental_health: 0 },
    thoughtBubble: '...',
    age: 25,
    hometown: 'Shanghai',
    hometown_tier: 1,
    university: 'Unknown',
    university_level: 'Ordinary',
    gender: 'Male',
    sex_orientation: 'Hetero',
    level: 'P5',
    company_years: 1,
    monthly_salary_base: 15000,
    annual_bonus_months: 2,
    savings: 50000,
    debt: 0,
    stocks: 0,
    options: 0,
    assets: 0,
    is_married: false,
    spouseId: null,
    isPregnant: false,
    pregnancyTimer: 0,
    performance: { linesOfCode: 0, bugsFixed: 0, lastReviewScore: 70 },
    intelligence: 70,
    attraction: 60,
    ambition: 50,
    physical_health: 80,
    mental_health: 80,
    sickness: null,
    network_intimacy: {},
    characteristics: [],
    skills: { programming: 50, system_design: 30, analysis: 40 }
});

const generateIdentity = (id: string, assignedDesk: Coordinates): Character => {
  const gender = Math.random() > 0.4 ? 'Male' : 'Female';
  const name = pick(SURNAMES) + (gender === 'Male' ? pick(NAMES_MALE) : pick(NAMES_FEMALE));
  const char = createBaseCharacter(id, name, assignedDesk);
  
  // Customization
  char.gender = gender;
  char.role = pick(ROLES);
  char.color = pick(COLORS);
  
  // Level & Age Correlation
  const levelRoll = Math.random();
  if (levelRoll < 0.1) {
    char.level = 'Intern'; char.age = randInt(20, 22); char.monthly_salary_base = 4000;
  } else if (levelRoll < 0.5) {
    char.level = 'P5'; char.age = randInt(23, 27); char.monthly_salary_base = randInt(12000, 20000);
  } else if (levelRoll < 0.8) {
    char.level = 'P6'; char.age = randInt(26, 32); char.monthly_salary_base = randInt(20000, 35000);
  } else if (levelRoll < 0.95) {
    char.level = 'P7'; char.age = randInt(30, 40); char.monthly_salary_base = randInt(35000, 60000);
  } else {
    char.level = 'P8'; char.age = randInt(35, 45); char.monthly_salary_base = randInt(60000, 90000);
  }

  // Financials
  const years_worked = Math.max(0, char.age - 22);
  char.company_years = years_worked > 0 ? randInt(0, Math.min(10, years_worked)) : 0;
  const raw_savings = years_worked * char.monthly_salary_base * 12 * 0.2 * (Math.random() * 0.5 + 0.8);
  char.savings = Math.floor(raw_savings);
  
  if (char.level === 'P7' || char.level === 'P8' || (char.level === 'P6' && char.age > 28)) {
    if (Math.random() > 0.3) {
      const housePrice = randInt(3000000, 10000000);
      char.savings = Math.max(0, char.savings - housePrice * 0.3);
      char.debt = Math.floor(housePrice * 0.7);
      char.assets = housePrice;
    }
  }

  if (char.level !== 'Intern') {
    char.options = Math.floor((char.level === 'P5' ? 0 : char.level === 'P6' ? 500 : char.level === 'P7' ? 2000 : 5000) * (Math.random() + 0.5));
  }

  if (Math.random() > 0.6) {
    char.stocks = randInt(1000, Math.max(10000, char.savings * 0.5));
    char.savings -= char.stocks;
  }

  // Traits
  const traitCount = randInt(2, 4);
  while (char.characteristics.length < traitCount) {
    const t = pick(CHARACTERISTICS_POOL);
    if (!char.characteristics.includes(t)) char.characteristics.push(t);
  }
  if (char.characteristics.includes('卷王')) char.monthly_salary_base *= 1.1;

  // Stats
  char.intelligence = randInt(60, 95);
  char.attraction = randInt(40, 90);
  char.ambition = randInt(40, 100);
  char.skills = {
    programming: randInt(10, 90),
    system_design: randInt(10, 90),
    analysis: randInt(10, 90)
  };

  return char;
};

export const generatePopulation = (): Character[] => {
  const characters: Character[] = [];
  
  // Shuffle desk slots
  const shuffledDesks = [...DESK_SLOTS].sort(() => Math.random() - 0.5);

  // 1. The Player (User)
  const playerDesk = shuffledDesks.pop() || { x: 2, y: 2 };
  characters.push({
    ...createBaseCharacter('player', '你 (玩家)', playerDesk),
    isPlayer: true,
    role: '新员工',
    color: 'bg-pink-500',
    stats: { energy: 100, stress: 0, bladder: 0, social: 100 },
    thoughtBubble: '新的一天开始了。',
    characteristics: ['真诚', '朴素'],
    skills: { programming: 60, system_design: 40, analysis: 50 },
    savings: 10000,
    stocks: 5000,
    monthly_salary_base: 12000
  });

  // 2. The CEO (Boss Ma) - Special Location
  const ceoDesk = { x: 2, y: 2 }; // Inside CEO Office
  const ceo = createBaseCharacter('npc_ceo', '马总', ceoDesk);
  ceo.role = 'CEO';
  ceo.color = 'bg-yellow-600';
  ceo.age = 48;
  ceo.level = 'P10';
  ceo.monthly_salary_base = 200000;
  ceo.savings = 50000000;
  ceo.stocks = 10000000;
  ceo.assets = 100000000;
  ceo.ambition = 100;
  ceo.intelligence = 95;
  ceo.characteristics = ['野心', '城府', '理性', '卷王'];
  ceo.location = LocationType.CEO_OFFICE;
  characters.push(ceo);

  // 3. The Tech Manager (Director Li) - Head of Rows
  const managerDesk = { x: 10, y: 5 }; // Special spot above desk rows
  const manager = createBaseCharacter('npc_manager', '李总监', managerDesk);
  manager.role = '技术总监';
  manager.color = 'bg-red-600';
  manager.age = 36;
  manager.level = 'P9';
  manager.monthly_salary_base = 85000;
  manager.savings = 3000000;
  manager.stocks = 200000;
  manager.options = 50000;
  manager.ambition = 90;
  manager.characteristics = ['易怒', '卷王', '城府'];
  manager.skills.system_design = 95;
  manager.skills.programming = 80;
  characters.push(manager);

  // 4. The HR (HR Sister) - Near Entrance
  const hrDesk = { x: 14, y: 5 }; // Special spot
  const hr = createBaseCharacter('npc_hr', 'HR姐姐', hrDesk);
  hr.role = 'HRBP';
  hr.color = 'bg-fuchsia-500';
  hr.age = 29;
  hr.level = 'P6';
  hr.monthly_salary_base = 25000;
  hr.savings = 400000;
  hr.attraction = 90;
  hr.intelligence = 80;
  hr.characteristics = ['高敏感', '感性', '八卦']; // High EQ/Gossip
  hr.skills.psychology = 90;
  characters.push(hr);

  // 5. Generate remaining generic NPCs (7 more to reach ~11 total)
  for (let i = 0; i < 7; i++) {
    const desk = shuffledDesks.pop() || { x: i, y: 0 };
    characters.push(generateIdentity(`npc_${i}`, desk));
  }

  return characters;
};
