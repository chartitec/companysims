
import React from 'react';
import { Character, CharacterState } from '../types';
import { Battery, Brain, MessageCircle, Heart, DollarSign, Briefcase, Zap, Star, Trophy, Thermometer, Wallet, CreditCard, TrendingUp, PiggyBank, Code, Bug, Baby } from 'lucide-react';

interface CharacterPanelProps {
  characters: Character[];
}

const StatBar: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode; delta?: number; reverse?: boolean }> = ({ label, value, color, icon, delta, reverse = false }) => {
  let deltaColor = 'text-slate-500';
  if (delta && delta !== 0) {
    if (reverse) {
      deltaColor = delta > 0 ? 'text-red-400' : 'text-green-400';
    } else {
      deltaColor = delta > 0 ? 'text-green-400' : 'text-red-400';
    }
  }

  return (
    <div className="flex items-center gap-2 mb-1 text-[10px]">
      <div className="text-slate-400 w-3 h-3 flex-shrink-0">{icon}</div>
      <div className="w-16 text-slate-400 truncate flex justify-between items-center pr-1">
        <span>{label}</span>
      </div>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden relative mr-1">
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }} 
        />
      </div>
      <div className={`w-10 text-[9px] font-mono text-right ${deltaColor}`}>
        {delta && delta !== 0 ? (delta > 0 ? `+${delta}` : delta) : '-'}
      </div>
    </div>
  );
};

const Attribute: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center bg-slate-700/30 p-1.5 rounded border border-slate-700">
    <div className="text-slate-400 mb-0.5">{icon}</div>
    <div className="text-[9px] text-slate-500">{label}</div>
    <div className="text-xs font-bold text-slate-200">{Number.isInteger(value) ? value : value.toFixed(1)}</div>
  </div>
);

const Tag: React.FC<{ text: string; color?: string }> = ({ text, color = 'bg-slate-700 text-slate-300' }) => (
  <span className={`text-[9px] px-1.5 py-0.5 rounded border border-white/5 ${color} whitespace-nowrap`}>
    {text}
  </span>
);

const CharacterCard: React.FC<{ char: Character; allChars: Character[] }> = ({ char, allChars }) => {
  const isDead = char.state === CharacterState.DEAD;
  const isBreakdown = char.state === CharacterState.BREAKDOWN;
  const isSick = !!char.sickness;
  const spouse = char.spouseId ? allChars.find(c => c.id === char.spouseId) : null;

  return (
    <div className={`p-3 rounded-lg border shadow-md transition-all relative group overflow-hidden ${
      isDead ? 'bg-slate-900 border-slate-800 opacity-70 grayscale' :
      char.isPlayer ? 'bg-slate-800 border-yellow-500/50 ring-1 ring-yellow-500/20' : 'bg-slate-800 border-slate-700'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${char.color} ${char.isPlayer ? 'ring-2 ring-yellow-400' : ''}`}>
            {char.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className={`font-bold text-sm leading-none ${isDead ? 'text-slate-500 line-through' : 'text-white'}`}>{char.name}</h3>
              <span className="text-[9px] bg-slate-700 text-slate-300 px-1 rounded">{char.level}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-slate-400">{char.role} · {char.age}岁</span>
               {spouse && (
                 <span className="flex items-center gap-0.5 text-[9px] text-pink-400 bg-pink-500/10 px-1 rounded border border-pink-500/20">
                    <Heart size={8} className="fill-pink-400" /> {spouse.name}
                 </span>
               )}
            </div>
          </div>
        </div>
        <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
          isDead ? 'bg-slate-700 text-slate-500' :
          isBreakdown ? 'bg-red-500/20 text-red-500 animate-pulse' :
          char.state === CharacterState.PERFORMING ? 'bg-green-500/20 text-green-400' : 
          char.state === CharacterState.MOVING ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
        }`}>
          {isDead ? '已死亡' : 
           isBreakdown ? '崩溃中' : 
           char.state === 'IDLE' ? '空闲' : 
           char.state === 'MOVING' ? '移动' : '执行'}
        </div>
      </div>

      {/* Sickness / Pregnancy Alerts */}
      <div className="flex flex-col gap-1 mb-2">
        {isSick && !isDead && (
          <div className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-[10px] flex items-center gap-2">
            <Thermometer size={12} className="animate-pulse" />
            <span>患病: {char.sickness} (体力持续衰减)</span>
          </div>
        )}
        {char.isPregnant && !isDead && (
           <div className="px-2 py-1 bg-pink-500/10 border border-pink-500/30 rounded text-pink-300 text-[10px] flex items-center gap-2">
             <Baby size={12} className="animate-bounce" />
             <span>怀孕中 (体力衰减加快)</span>
           </div>
        )}
      </div>

      {/* Thought Bubble */}
      <div className={`text-[10px] mb-2 font-mono h-3.5 overflow-hidden text-ellipsis whitespace-nowrap ${isBreakdown ? 'text-red-400 font-bold' : 'text-yellow-200'}`}>
        "{char.thoughtBubble}"
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-y-0.5 mb-3 bg-slate-900/40 p-2 rounded">
        <StatBar label="精力" value={char.stats.energy} delta={char.lastDeltas?.energy} color="bg-emerald-400" icon={<Battery size={10} />} />
        <StatBar label="压力" value={char.stats.stress} delta={char.lastDeltas?.stress} reverse={true} color={char.stats.stress > 90 ? "bg-red-600 animate-pulse" : char.stats.stress > 60 ? "bg-red-500" : "bg-purple-400"} icon={<Brain size={10} />} />
        <StatBar label="身健" value={char.physical_health} delta={char.lastDeltas?.physical_health} color={char.physical_health < 30 ? "bg-red-500" : "bg-blue-400"} icon={<Heart size={10} />} />
        <StatBar label="心健" value={char.mental_health} delta={char.lastDeltas?.mental_health} color="bg-pink-400" icon={<MessageCircle size={10} />} />
      </div>

      {/* Performance Row */}
      <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-800/80 p-1.5 rounded border border-slate-700/50">
        <div className="flex items-center gap-1">
          <Code size={12} className="text-blue-400" />
          <div className="text-[9px] text-slate-400">LOC</div>
          <div className="font-mono text-xs text-blue-300 font-bold">{char.performance.linesOfCode.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-1 justify-end border-l border-slate-700/50 pl-2">
          <Bug size={12} className="text-orange-400" />
          <div className="text-[9px] text-slate-400">Fix</div>
          <div className="font-mono text-xs text-orange-300 font-bold">{char.performance.bugsFixed.toLocaleString()}</div>
        </div>
      </div>

      {/* Core Attributes */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Attribute icon={<Zap size={12} className="text-yellow-400"/>} label="智力" value={char.intelligence} />
        <Attribute icon={<Star size={12} className="text-pink-400"/>} label="魅力" value={char.attraction} />
        <Attribute icon={<Trophy size={12} className="text-orange-400"/>} label="野心" value={char.ambition} />
      </div>

      {/* Economic Assets Section */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3 bg-slate-900/30 p-2 rounded border border-slate-700/50">
         <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Wallet size={10} /> <span>存款</span>
            </div>
            <span className="font-mono text-emerald-300">¥{char.savings.toLocaleString()}</span>
         </div>
         <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CreditCard size={10} /> <span>负债</span>
            </div>
            <span className={`font-mono ${char.debt > 0 ? 'text-red-400' : 'text-slate-500'}`}>
              -¥{char.debt.toLocaleString()}
            </span>
         </div>
         <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <TrendingUp size={10} /> <span>股票</span>
            </div>
            <span className="font-mono text-blue-300">{char.stocks.toLocaleString()}</span>
         </div>
         <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <PiggyBank size={10} /> <span>期权</span>
            </div>
            <span className="font-mono text-purple-300">{char.options.toLocaleString()}</span>
         </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-1.5 border-t border-slate-700 pt-2">
        {/* Salary & Tenure */}
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <DollarSign size={10} />
            <span>月薪 {char.monthly_salary_base.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase size={10} />
            <span>{char.company_years}年司龄</span>
          </div>
        </div>

        {/* Characteristics Tags */}
        <div className="flex flex-wrap gap-1">
           {char.characteristics.map(c => (
             <Tag key={c} text={c} color="bg-indigo-500/20 text-indigo-300 border-indigo-500/30" />
           ))}
        </div>
      </div>
    </div>
  );
};

const CharacterPanel: React.FC<CharacterPanelProps> = ({ characters }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
      {characters.map(char => (
        <CharacterCard key={char.id} char={char} allChars={characters} />
      ))}
    </div>
  );
};

export default CharacterPanel;
