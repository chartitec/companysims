import React from 'react';
import { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 h-64 overflow-hidden flex flex-col">
      <div className="bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
        活动日志
      </div>
      <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-1 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className={`flex gap-2 ${
            log.type === 'action' ? 'text-blue-300' :
            log.type === 'alert' ? 'text-red-300' : 'text-slate-400'
          }`}>
            <span className="opacity-50">[{String(log.tick).padStart(4, '0')}]</span>
            <span>{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-slate-600 italic">暂无活动...</div>}
      </div>
    </div>
  );
};

export default LogPanel;