
import React, { useEffect, useState, useRef } from 'react';
import { SimulationEngine } from './engine/Simulation';
import { ACTIONS, TICK_RATE_MS } from './constants';
import { generatePopulation } from './generators';
import { LocationType, ActionDefinition, SerializableAction, GameConfig, Character } from './types';
import WorldMap from './components/WorldMap';
import CharacterPanel from './components/CharacterPanel';
import LogPanel from './components/LogPanel';
import TutorialModal from './components/TutorialModal';
import { Play, Pause, FastForward, RefreshCw, Download, Upload, Eye, Calendar, Clock } from 'lucide-react';

function getFunctionBody(func: Function): string {
  const str = func.toString();
  return str;
}

function serializeConfig(characters: Character[], actions: ActionDefinition[]): string {
  const serializableActions: SerializableAction[] = actions.map(a => ({
    id: a.id,
    label: a.label,
    requiredLocation: a.requiredLocation,
    duration: a.duration,
    utilityScorerCode: a.utilityScorer.toString(),
    effectsCode: a.effects.toString(),
  }));

  const config: GameConfig = {
    characters,
    actions: serializableActions
  };
  return JSON.stringify(config, null, 2);
}

function deserializeConfig(json: string): { characters: Character[], actions: ActionDefinition[] } {
  const config: GameConfig = JSON.parse(json);
  
  const actions: ActionDefinition[] = config.actions.map(sa => {
    let scorerFunc: any;
    let effectsFunc: any;

    try {
      scorerFunc = new Function(`return (${sa.utilityScorerCode})`)();
      effectsFunc = new Function(`return (${sa.effectsCode})`)();
    } catch (e) {
      console.error("Failed to parse function code for action", sa.id, e);
      scorerFunc = () => 0;
      effectsFunc = () => ({});
    }

    return {
      id: sa.id,
      label: sa.label,
      requiredLocation: sa.requiredLocation,
      duration: sa.duration,
      utilityScorer: scorerFunc,
      effects: effectsFunc
    };
  });

  return { characters: config.characters, actions };
}

function App() {
  const [engineRef] = useState(() => new SimulationEngine(generatePopulation(), ACTIONS));
  
  const [worldState, setWorldState] = useState(engineRef.getState());
  const [isRunning, setIsRunning] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const tick = () => {
    const newState = engineRef.tick();
    setWorldState({ ...newState }); 
  };

  const handleLocationClick = (location: LocationType) => {
    engineRef.commandPlayer(location);
    setWorldState({ ...engineRef.getState() });
  };

  const handleInteraction = (targetId: string, type: 'gossip' | 'gift' | 'propose') => {
    engineRef.commandInteraction(targetId, type);
    setWorldState({ ...engineRef.getState() });
  };

  useEffect(() => {
    if (isRunning && !showTutorial) {
      intervalRef.current = window.setInterval(tick, TICK_RATE_MS / speedMultiplier);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speedMultiplier, showTutorial]);

  const handleReset = () => {
    window.location.reload();
  };

  const handleExportConfig = () => {
    const currentState = engineRef.getState();
    const json = serializeConfig(currentState.characters, (engineRef as any).actions);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `office_sim_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        deserializeConfig(json);
        alert("导入功能需要重构 Engine 实例，当前版本建议只用于导出备份。请手动刷新页面生成新角色。");
      } catch (err) {
        console.error(err);
        alert("配置文件格式错误或解析失败。");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-200 relative">
      
      {/* Tutorial Overlay */}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
               职场模拟器：Utility AI
             </h1>
             {worldState.managerActive && (
               <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg flex items-center gap-2">
                 <Eye size={14} /> 经理巡视中
               </div>
             )}
          </div>
          <p className="text-slate-500 text-sm">自主 Agent 仿真系统</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
           {/* Time Display */}
           <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-400" />
                <span className="text-sm font-bold text-slate-200">Q{worldState.quarter}</span>
              </div>
              <div className="w-[1px] h-4 bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-slate-200">第 {worldState.week} 周</span>
              </div>
           </div>

          {/* Game Controls */}
          <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="p-2 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
              title={isRunning ? "暂停" : "开始"}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              onClick={() => setSpeedMultiplier(prev => prev === 1 ? 4 : 1)}
              className={`p-2 rounded transition-colors ${speedMultiplier > 1 ? 'text-blue-400 bg-blue-400/10' : 'text-slate-300 hover:bg-slate-800'}`}
              title="加速"
            >
              <FastForward size={20} />
            </button>
            <button 
              onClick={handleReset}
              className="p-2 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
              title="重置 (生成新NPC)"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visuals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex justify-center">
            <WorldMap 
              worldState={worldState} 
              onLocationClick={handleLocationClick} 
              onInteraction={handleInteraction}
            />
          </div>
          <LogPanel logs={worldState.logs} />
          <div className="text-center text-xs text-slate-500 flex justify-center gap-6">
             <span>📌 点击【办公区】将自动前往你的专属工位</span>
             <span>⚠️ 坐错工位会降低社交关系</span>
          </div>
        </div>

        {/* Right Column: Data */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">角色状态</h2>
            <CharacterPanel characters={worldState.characters} />
          </div>

          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-xs text-slate-500">
            <h3 className="font-bold text-slate-400 mb-2">游戏机制更新</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>100 Tick = 1 周。每 4 周发薪水并自动偿还贷款。</li>
              <li>每 12 周 (1季度) 进行绩效考评，S级绩效将获得双倍月薪年终奖。</li>
              <li>请确保在自己的工位工作，占用他人位置会导致冲突。</li>
              <li>送礼需要消耗 ¥500。</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
