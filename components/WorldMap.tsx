
import React, { useState } from 'react';
import { Character, WorldState, LocationType, CharacterState } from '../types';
import { LOCATIONS, LOCATION_NAMES } from '../constants';
import { MessageCircle, Gift, X, Skull, Zap, Briefcase } from 'lucide-react';

interface WorldMapProps {
  worldState: WorldState;
  onLocationClick: (loc: LocationType) => void;
  onInteraction: (targetId: string, type: 'gossip' | 'gift') => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ worldState, onLocationClick, onInteraction }) => {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const GRID_SIZE = 20;

  const handleCharClick = (e: React.MouseEvent, char: Character) => {
    e.stopPropagation();
    if (char.isPlayer || char.state === CharacterState.DEAD) {
      setSelectedCharId(null);
      return;
    }
    setSelectedCharId(char.id === selectedCharId ? null : char.id);
  };

  const handleAction = (type: 'gossip' | 'gift', targetId: string) => {
    onInteraction(targetId, type);
    setSelectedCharId(null);
  };

  const getLocationStyle = (x: number, y: number, w: number = 1, h: number = 1) => ({
    left: `${x * (100 / GRID_SIZE)}%`,
    top: `${y * (100 / GRID_SIZE)}%`,
    width: `${w * (100 / GRID_SIZE)}%`,
    height: `${h * (100 / GRID_SIZE)}%`,
  });

  const player = worldState.characters.find(c => c.isPlayer);

  return (
    <div 
      className={`relative w-full aspect-square max-w-[600px] bg-slate-900 rounded-lg border overflow-hidden shadow-2xl transition-all duration-500 ${
        worldState.managerActive ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-slate-700'
      }`}
      onClick={() => setSelectedCharId(null)}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
          backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
        }} 
      />

      {/* --- ROOMS --- */}
      
      {/* CEO Office */}
      <button
        onClick={(e) => { e.stopPropagation(); onLocationClick(LocationType.CEO_OFFICE); }}
        className="absolute border border-yellow-600/50 bg-yellow-600/10 hover:bg-yellow-600/20 text-[10px] flex items-center justify-center font-bold text-yellow-500 rounded"
        style={getLocationStyle(1, 1, 4, 3)}
      >
        CEO
      </button>

      {/* Meeting Room 1 */}
      <button
        onClick={(e) => { e.stopPropagation(); onLocationClick(LocationType.MEETING_ROOM_1); }}
        className="absolute border border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-[10px] flex items-center justify-center text-purple-300 rounded"
        style={getLocationStyle(6, 1, 6, 3)}
      >
        会议室 A
      </button>

      {/* Meeting Room 2 */}
      <button
        onClick={(e) => { e.stopPropagation(); onLocationClick(LocationType.MEETING_ROOM_2); }}
        className="absolute border border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-[10px] flex items-center justify-center text-purple-300 rounded"
        style={getLocationStyle(13, 1, 6, 3)}
      >
        会议室 B
      </button>

      {/* Pantry */}
      <button
        onClick={(e) => { e.stopPropagation(); onLocationClick(LocationType.PANTRY); }}
        className="absolute border border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 text-[10px] flex items-center justify-center text-orange-300 rounded"
        style={getLocationStyle(1, 15, 5, 4)}
      >
        茶水间
      </button>

      {/* Lounge */}
      <button
        onClick={(e) => { e.stopPropagation(); onLocationClick(LocationType.LOUNGE); }}
        className="absolute border border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-[10px] flex items-center justify-center text-green-300 rounded"
        style={getLocationStyle(7, 15, 6, 4)}
      >
        休息区
      </button>

      {/* Restroom */}
      <button
        onClick={(e) => { e.stopPropagation(); onLocationClick(LocationType.RESTROOM); }}
        className="absolute border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-[10px] flex items-center justify-center text-blue-300 rounded"
        style={getLocationStyle(14, 15, 5, 4)}
      >
        卫生间
      </button>

      {/* Elevator */}
      <div className="absolute border-l border-slate-600 bg-slate-800 text-[9px] flex flex-col items-center justify-center text-slate-500"
        style={getLocationStyle(19, 5, 1, 10)}
      >
        电<br/>梯
      </div>

      {/* --- DESKS --- */}
      {/* Visual Desk Boxes */}
      {worldState.characters.map(char => {
         const isMyDesk = player && char.id === player.id;
         return (
           <div 
            key={`desk-${char.id}`}
            className={`absolute border rounded flex items-center justify-center text-[8px] opacity-50 pointer-events-none
              ${isMyDesk ? 'border-yellow-500/60 bg-yellow-500/10' : 'border-slate-600 bg-slate-700/20'}
            `}
            style={{
              left: `${char.assignedDesk.x * (100 / GRID_SIZE)}%`,
              top: `${char.assignedDesk.y * (100 / GRID_SIZE)}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              transform: 'translate(-50%, -50%)' // Center on coord
            }}
           >
             {isMyDesk ? '我' : ''}
           </div>
         )
      })}

      {/* Click Area for Desk Zone (General click to move to own desk) */}
      <button
         onClick={(e) => { e.stopPropagation(); onLocationClick(LocationType.DESK); }}
         className="absolute z-0 hover:bg-white/5 transition-colors rounded"
         style={{ ...getLocationStyle(3, 6, 14, 8) }}
         title="办公区域 (点击前往你的工位)"
      />

      {/* Characters */}
      {worldState.characters.map((char) => {
        const isDead = char.state === CharacterState.DEAD;
        const isBreakdown = char.state === CharacterState.BREAKDOWN;
        
        return (
          <div
            key={char.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 ease-linear z-10 
              ${!char.isPlayer && !isDead ? 'cursor-pointer hover:scale-110' : ''}
              ${isDead ? 'opacity-60 grayscale' : ''}
              ${isBreakdown ? 'animate-pulse' : ''}
            `}
            style={{
              left: `${char.position.x * (100 / GRID_SIZE)}%`,
              top: `${char.position.y * (100 / GRID_SIZE)}%`,
              zIndex: selectedCharId === char.id ? 50 : 10
            }}
            onClick={(e) => handleCharClick(e, char)}
          >
            {/* Interaction Menu */}
            {selectedCharId === char.id && !isDead && (
              <div className="absolute bottom-full mb-2 flex flex-col gap-1 bg-slate-800 p-2 rounded-lg border border-slate-600 shadow-xl z-50 min-w-[120px]" onClick={e => e.stopPropagation()}>
                <div className="text-[10px] text-slate-400 font-bold border-b border-slate-700 pb-1 mb-1 text-center">
                  对 {char.name} 执行:
                </div>
                <button 
                  onClick={() => handleAction('gossip', char.id)}
                  className="flex items-center gap-2 px-2 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-xs rounded transition-colors"
                >
                  <MessageCircle size={12} />
                  <span>八卦</span>
                </button>
                <button 
                  onClick={() => handleAction('gift', char.id)}
                  className="flex items-center gap-2 px-2 py-1.5 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 text-xs rounded transition-colors"
                >
                  <Gift size={12} />
                  <span>送礼物 (-¥500)</span>
                </button>
                <button 
                  onClick={() => setSelectedCharId(null)}
                  className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-500 hover:text-slate-300"
                >
                  <X size={10} />
                  取消
                </button>
              </div>
            )}

            {/* Thought Bubble */}
            <div className={`mb-1 transition-opacity bg-white text-slate-900 text-[10px] px-2 py-1 rounded shadow whitespace-nowrap absolute bottom-full ${selectedCharId === char.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
              {char.thoughtBubble}
            </div>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center text-[10px] font-bold text-white relative
              ${isDead ? 'bg-slate-700 border-slate-500' : char.color}
              ${char.isPlayer ? 'border-yellow-400 ring-2 ring-yellow-400/50' : selectedCharId === char.id ? 'border-white ring-2 ring-white' : 'border-white'}
            `}>
              {isDead ? <Skull size={16} /> : char.name.substring(0, 1)}
              
              {isBreakdown && (
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 animate-bounce">
                  <Zap size={8} className="text-white" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorldMap;
