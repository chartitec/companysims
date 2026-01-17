
import { Character, CharacterState, WorldState, LogEntry, LocationType, Coordinates, ActionDefinition } from '../types';
import { LOCATIONS, MOVEMENT_SPEED, LOCATION_NAMES, TICKS_PER_WEEK, TICKS_PER_MONTH, TICKS_PER_QUARTER } from '../constants';

const uuid = () => Math.random().toString(36).substring(2, 9);

export class SimulationEngine {
  private state: WorldState;
  private actions: ActionDefinition[];

  constructor(initialCharacters: Character[], actions: ActionDefinition[]) {
    this.state = {
      tick: 0,
      week: 1,
      quarter: 1,
      characters: JSON.parse(JSON.stringify(initialCharacters)),
      logs: [],
      locations: LOCATIONS,
      managerActive: false,
      managerTimer: 0,
    };
    this.actions = actions;
    this.log("模拟系统已启动。新季度开始。", 'system');
  }

  public getState(): WorldState {
    return this.state;
  }

  public tick(): WorldState {
    this.state.tick += 1;
    this.updateCalendar();
    
    // MANAGER EVENT CHECK (Random patrol logic)
    // We can also check if the actual 'npc_manager' is in the desk area for more realism, 
    // but for now we keep the "Aura" effect as a game mechanic.
    if (this.state.tick % 100 === 0) {
      if (!this.state.managerActive && Math.random() < 0.3) {
        this.state.managerActive = true;
        this.state.managerTimer = 50; 
        this.log("⚠️ 部门经理开始巡视！大家注意表现！", "alert");
        
        // Force the actual manager NPC to move to desk area if idle
        const managerNPC = this.state.characters.find(c => c.id === 'npc_manager');
        if (managerNPC && managerNPC.state === CharacterState.IDLE) {
           managerNPC.thoughtBubble = "去看看大家在干嘛...";
           this.commandNPCMove(managerNPC, LocationType.DESK);
        }
      }
    }

    if (this.state.managerActive) {
      this.state.managerTimer -= 1;
      if (this.state.managerTimer <= 0) {
        this.state.managerActive = false;
        this.log("部门经理结束了巡视。", "info");
      }
    }

    // Process characters
    this.state.characters = this.state.characters.map(char => {
      const prevStats = { 
        energy: char.stats.energy,
        stress: char.stats.stress,
        bladder: char.stats.bladder,
        social: char.stats.social,
        physical_health: char.physical_health,
        mental_health: char.mental_health
      };

      const updatedChar = this.processCharacter(char);
      
      updatedChar.lastDeltas = {
        energy: Number((updatedChar.stats.energy - prevStats.energy).toFixed(1)),
        stress: Number((updatedChar.stats.stress - prevStats.stress).toFixed(1)),
        bladder: Number((updatedChar.stats.bladder - prevStats.bladder).toFixed(1)),
        social: Number((updatedChar.stats.social - prevStats.social).toFixed(1)),
        physical_health: Number((updatedChar.physical_health - prevStats.physical_health).toFixed(1)),
        mental_health: Number((updatedChar.mental_health - prevStats.mental_health).toFixed(1)),
      };

      return updatedChar;
    });

    return this.state;
  }

  private updateCalendar() {
     // Week Update
     if (this.state.tick % TICKS_PER_WEEK === 0) {
       this.state.week += 1;
       this.log(`第 ${this.state.week} 周开始了。`, 'system');
     }

     // Payday (Every 4 Weeks / Month)
     if (this.state.tick > 0 && this.state.tick % TICKS_PER_MONTH === 0) {
       this.handlePayday();
     }

     // Quarterly Review
     if (this.state.tick > 0 && this.state.tick % TICKS_PER_QUARTER === 0) {
       this.handlePerformanceReview();
       this.state.quarter += 1;
       this.state.week = 1;
       this.log(`新的季度开始了 (Q${this.state.quarter})。`, 'system');
     }
  }

  private handlePayday() {
    this.log("💰 发薪日到了！", 'finance');
    this.state.characters.forEach(char => {
      if (char.state === CharacterState.DEAD) return;
      
      const salary = char.monthly_salary_base;
      char.savings += salary;
      
      // Debt Repayment (simplified)
      if (char.debt > 0) {
        const payment = Math.ceil(char.debt * 0.005); 
        const actualPayment = Math.min(payment, char.savings);
        if (actualPayment > 0) {
          char.savings -= actualPayment;
          char.debt -= actualPayment;
        }
      }
      
      if (char.isPlayer) {
        this.log(`你收到了工资 ¥${salary}。`, 'finance');
      }
    });
  }

  private handlePerformanceReview() {
    this.log("📊 季度绩效考评开始...", 'finance');
    this.state.characters.forEach(char => {
      if (char.state === CharacterState.DEAD) return;
      
      // Executives don't get reviewed by lines of code
      if (char.role === 'CEO' || char.role === '技术总监') return;

      const loc = char.performance.linesOfCode;
      const target = char.level === 'Intern' ? 2000 : char.level === 'P5' ? 5000 : 8000;
      let reviewScore = 70;
      
      // HR is judged differently? For now simple logic
      if (char.role === 'HRBP') {
          reviewScore = 80 + (Math.random() * 20 - 10);
      } else {
        if (loc > target * 1.5) reviewScore = 95;
        else if (loc > target) reviewScore = 85;
        else if (loc < target * 0.5) reviewScore = 50;
      }

      char.performance.lastReviewScore = reviewScore;

      // Bonus / Salary Adjustment
      if (reviewScore >= 90) {
        const bonus = char.monthly_salary_base * 2;
        char.savings += bonus;
        if (char.isPlayer) this.log(`绩效S！你获得了 ¥${bonus} 奖金！`, 'finance');
      } else if (reviewScore < 60) {
         if (char.isPlayer) this.log(`绩效C... 需要再接再厉。`, 'alert');
      }

      // Reset Metrics
      char.performance.linesOfCode = 0;
    });
  }

  // Internal helper to command NPCs
  private commandNPCMove(char: Character, location: LocationType) {
      const action = this.actions.find(a => a.requiredLocation === location);
      if (!action) return;
      
      // Simple override to move NPC
      let targetLoc: Coordinates;
      if (location === LocationType.DESK) {
        targetLoc = char.assignedDesk;
      } else {
        targetLoc = this.state.locations[location];
      }
      
      char.currentActionId = action.id;
      char.targetCharacterId = null; 
      
      const dist = this.getDistance(char.position, targetLoc);
      
      if (dist < 1) {
        char.state = CharacterState.PERFORMING;
        char.actionTimer = action.duration;
        char.location = location;
      } else {
        char.state = CharacterState.MOVING;
        char.targetPosition = targetLoc;
        char.actionTimer = Math.ceil(dist / MOVEMENT_SPEED);
      }
  }

  public commandPlayer(location: LocationType) {
    const player = this.state.characters.find(c => c.isPlayer);
    if (!player || player.state === CharacterState.DEAD || player.state === CharacterState.BREAKDOWN) return;

    // Special logic for DESK: Go to Assigned Desk
    let targetLoc: Coordinates;
    if (location === LocationType.DESK) {
      targetLoc = player.assignedDesk;
    } else {
      targetLoc = this.state.locations[location];
    }

    const action = this.actions.find(a => a.requiredLocation === location);
    if (!action) return;

    this.log(`玩家指令: 前往${LOCATION_NAMES[location]}进行 ${action.label}`, 'action');
    
    player.currentActionId = action.id;
    player.targetCharacterId = null;
    player.thoughtBubble = `前往${LOCATION_NAMES[location]}...`;
    
    const dist = this.getDistance(player.position, targetLoc);
    if (dist < 1) {
      player.state = CharacterState.PERFORMING;
      player.actionTimer = action.duration;
      player.location = location;
      player.thoughtBubble = action.label;
    } else {
      player.state = CharacterState.MOVING;
      player.targetPosition = targetLoc;
      player.actionTimer = Math.ceil(dist / MOVEMENT_SPEED);
    }
  }

  public commandInteraction(targetId: string, type: 'gossip' | 'gift') {
    const player = this.state.characters.find(c => c.isPlayer);
    const target = this.state.characters.find(c => c.id === targetId);
    if (!player || !target) return;

    // Cost Check for Gift
    if (type === 'gift') {
      if (player.savings < 500) {
        this.log("余额不足，买不起礼物 (需要 ¥500)。", 'alert');
        return;
      }
    }

    const actionLabel = type === 'gossip' ? '八卦' : '送礼物';
    this.log(`玩家指令: 去找 ${target.name} ${actionLabel}`, 'action');

    player.currentActionId = `interaction_${type}`;
    player.targetCharacterId = targetId;
    player.thoughtBubble = `去找 ${target.name} ${actionLabel}...`;
    player.state = CharacterState.MOVING;
    player.targetPosition = { ...target.position }; 
  }

  private processCharacter(char: Character): Character {
    if (char.state === CharacterState.DEAD) {
      char.thoughtBubble = "(已死亡)";
      return char;
    }

    char = this.applyDecay(char);

    const vitalCheck = this.checkCriticalVitals(char);
    if (vitalCheck.statusChanged) {
        return vitalCheck.char;
    }
    char = vitalCheck.char;

    switch (char.state) {
      case CharacterState.IDLE:
        return this.decideNextAction(char);
      case CharacterState.MOVING:
        return this.handleMovement(char);
      case CharacterState.PERFORMING:
        return this.handlePerformance(char);
      case CharacterState.BREAKDOWN:
        return this.handleBreakdown(char);
      default:
        return char;
    }
  }

  private checkCriticalVitals(char: Character): { char: Character, statusChanged: boolean } {
    let statusChanged = false;
    if (char.physical_health <= 0) {
      char.state = CharacterState.DEAD;
      char.thoughtBubble = "X_X";
      this.log(`${char.name} 身体透支，不幸猝死...`, 'alert');
      return { char, statusChanged: true };
    }
    if (char.stats.stress >= 100 && char.state !== CharacterState.BREAKDOWN) {
      char.state = CharacterState.BREAKDOWN;
      char.actionTimer = 20;
      char.thoughtBubble = "崩溃！";
      char.targetPosition = null;
      this.log(`${char.name} 精神崩溃了！`, 'alert');
      return { char, statusChanged: true };
    }
    if (char.stats.energy <= 0 && char.currentActionId !== 'emergency_nap') {
      char.state = CharacterState.PERFORMING;
      char.currentActionId = 'emergency_nap';
      char.actionTimer = 15;
      char.thoughtBubble = "Zzz...";
      char.targetPosition = null;
      this.log(`${char.name} 晕倒了。`, 'alert');
      statusChanged = true; 
    }
    if (char.stats.bladder >= 100) {
      char.stats.bladder = 0;
      char.stats.stress += 50;
      char.stats.social = Math.max(0, char.stats.social - 50);
      char.thoughtBubble = "湿了...";
      this.log(`${char.name} 尿裤子了...`, 'alert');
    }
    return { char, statusChanged };
  }

  private applyDecay(char: Character): Character {
    char.stats.energy = Math.max(0, char.stats.energy - 0.2);
    char.stats.bladder = Math.min(100, char.stats.bladder + 0.5);
    char.stats.social = Math.max(0, char.stats.social - 0.3);
    
    if (this.state.managerActive && char.state === CharacterState.PERFORMING) {
      const slackingActions = ['gossip', 'nap', 'drink_coffee', 'use_restroom', 'stock_trading'];
      const workingActions = ['work_code', 'training_session', 'visit_ceo'];
      
      if (char.currentActionId && slackingActions.includes(char.currentActionId)) {
        char.stats.stress = Math.min(100, char.stats.stress + 0.5);
        if (Math.random() < 0.1) char.thoughtBubble = "经理在看着...";
      } else if (char.currentActionId && workingActions.includes(char.currentActionId)) {
        char.stats.stress = Math.min(100, char.stats.stress + 0.1); 
        char.stats.social = Math.min(100, char.stats.social + 0.2); 
      }
    }

    if (char.sickness) {
       char.physical_health = Math.max(0, char.physical_health - 0.3);
       char.stats.energy = Math.max(0, char.stats.energy - 0.2);
       if (Math.random() < (char.currentActionId === 'nap' ? 0.05 : 0.005)) {
           char.sickness = null;
           this.log(`${char.name} 康复了。`, 'info');
       }
    } else {
       if (char.physical_health < 70) {
           if (Math.random() < (70 - char.physical_health) * 0.0005) {
               char.sickness = '感冒';
               this.log(`${char.name} 生病了。`, 'alert');
           }
       }
    }

    if (char.stats.stress > 80) {
       char.physical_health -= 0.1;
       char.mental_health -= 0.2;
    }

    return char;
  }

  private handleBreakdown(char: Character): Character {
    char.actionTimer -= 1;
    char.stats.stress = Math.max(0, char.stats.stress - 1);
    if (char.actionTimer <= 0) {
      char.state = CharacterState.IDLE;
      char.stats.stress = 60;
      char.thoughtBubble = "冷静...";
      this.log(`${char.name} 恢复理智。`, 'info');
    }
    return char;
  }

  private decideNextAction(char: Character): Character {
    if (char.isPlayer) {
      if (char.state === CharacterState.IDLE) char.thoughtBubble = "等待指令...";
      return char;
    }

    let bestAction = null;
    let highestScore = -Infinity;

    for (const action of this.actions) {
      // CEO Logic: Prefers staying in office or meetings
      if (char.role === 'CEO') {
         if (action.id === 'visit_ceo') continue; // Can't visit self
         if (action.requiredLocation === LocationType.DESK) {
             // CEO rarely goes to normal desk unless 'stock_trading' (lol) or inspecting
             if (action.id !== 'stock_trading') continue; 
         }
      }

      const score = action.utilityScorer(char);
      const jitter = Math.random() * 5; 
      const finalScore = score + jitter;

      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestAction = action;
      }
    }

    if (bestAction && highestScore > 10) {
      let targetLoc: Coordinates;
      if (bestAction.requiredLocation === LocationType.DESK) {
        targetLoc = char.assignedDesk;
      } else {
        targetLoc = this.state.locations[bestAction.requiredLocation];
      }

      this.log(`${char.name} 决定: ${bestAction.label}`, 'action');
      char.thoughtBubble = `去${bestAction.label}`;
      char.currentActionId = bestAction.id;
      char.targetCharacterId = null; 

      const dist = this.getDistance(char.position, targetLoc);
      
      if (dist < 1) {
        char.state = CharacterState.PERFORMING;
        char.actionTimer = bestAction.duration;
        char.location = bestAction.requiredLocation;
      } else {
        char.state = CharacterState.MOVING;
        char.targetPosition = targetLoc;
        char.actionTimer = Math.ceil(dist / MOVEMENT_SPEED);
      }
    } else {
      char.thoughtBubble = "发呆...";
    }
    return char;
  }

  private handleMovement(char: Character): Character {
    if (char.targetCharacterId) {
      const target = this.state.characters.find(c => c.id === char.targetCharacterId);
      if (target) char.targetPosition = { ...target.position };
    }

    if (!char.targetPosition) {
      char.state = CharacterState.IDLE;
      return char;
    }

    const dx = char.targetPosition.x - char.position.x;
    const dy = char.targetPosition.y - char.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= MOVEMENT_SPEED) {
      char.position = { ...char.targetPosition };
      char.targetPosition = null;
      
      if (char.currentActionId?.startsWith('interaction_')) {
         char.state = CharacterState.PERFORMING;
         char.actionTimer = 5; 
         const type = char.currentActionId.split('_')[1];
         char.thoughtBubble = type === 'gossip' ? '八卦中...' : '送礼中...';
      } else {
        const action = this.actions.find(a => a.id === char.currentActionId);
        if (action) {
          // WRONG DESK CHECK
          if (action.requiredLocation === LocationType.DESK) {
             const distToOwnDesk = this.getDistance(char.position, char.assignedDesk);
             if (distToOwnDesk > 1) {
                // Determine who's desk they are at
                const victim = this.state.characters.find(c => this.getDistance(char.position, c.assignedDesk) < 1 && c.id !== char.id);
                if (victim) {
                   this.log(`${char.name} 坐错了 ${victim.name} 的工位！好尴尬。`, 'alert');
                   char.stats.social -= 10;
                   victim.stats.stress += 5;
                }
             }
          }

          char.state = CharacterState.PERFORMING;
          char.actionTimer = action.duration;
          char.location = action.requiredLocation;
          char.thoughtBubble = action.label;
        } else {
          char.state = CharacterState.IDLE;
        }
      }
    } else {
      const angle = Math.atan2(dy, dx);
      char.position.x += Math.cos(angle) * MOVEMENT_SPEED;
      char.position.y += Math.sin(angle) * MOVEMENT_SPEED;
    }
    return char;
  }

  private handlePerformance(char: Character): Character {
    char.actionTimer -= 1;

    if (char.currentActionId === 'emergency_nap') {
        if (char.actionTimer <= 0) {
            char.state = CharacterState.IDLE;
            char.stats.energy = 30; 
            char.thoughtBubble = "醒来...";
            this.log(`${char.name} 醒了。`, 'info');
            char.currentActionId = null;
        }
        return char;
    }

    if (char.actionTimer <= 0) {
      if (char.currentActionId?.startsWith('interaction_') && char.targetCharacterId) {
        const type = char.currentActionId.split('_')[1];
        const target = this.state.characters.find(c => c.id === char.targetCharacterId);
        
        if (target) {
          if (type === 'gossip') {
            this.log(`${char.name} 与 ${target.name} 八卦。`, 'info');
            char.stats.social = Math.min(100, char.stats.social + 30);
            target.stats.social = Math.min(100, target.stats.social + 30);
          } else if (type === 'gift') {
            this.log(`${char.name} 送给 ${target.name} 礼物 (-¥500)。`, 'info');
            char.savings -= 500; // CONSUME MONEY
            char.stats.social = Math.min(100, char.stats.social + 20);
            target.stats.social = Math.min(100, target.stats.social + 50);
            target.stats.stress = Math.max(0, target.stats.stress - 40);
          }
        }
      } else {
        const action = this.actions.find(a => a.id === char.currentActionId);
        if (action) {
          const effects = action.effects(char);
          const statKeys = ['energy', 'stress', 'bladder', 'social'];
          const statsUpdate: any = {};
          const otherUpdates: any = {};

          for (const [key, val] of Object.entries(effects)) {
            if (statKeys.includes(key)) statsUpdate[key] = val;
            else otherUpdates[key] = val;
          }
          char.stats = { ...char.stats, ...statsUpdate };
          Object.assign(char, otherUpdates); 
          this.log(`${char.name} 结束: ${action.label}。`, 'info');
        }
      }
      
      char.state = CharacterState.IDLE;
      char.currentActionId = null;
      char.targetCharacterId = null;
      char.thoughtBubble = "?";
    }
    return char;
  }

  private getDistance(p1: Coordinates, p2: Coordinates): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private log(message: string, type: LogEntry['type']) {
    const entry: LogEntry = {
      id: uuid(),
      tick: this.state.tick,
      message,
      type
    };
    this.state.logs.unshift(entry);
    if (this.state.logs.length > 50) this.state.logs.pop();
  }
}
