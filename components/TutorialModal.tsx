
import React from 'react';
import { Briefcase, TrendingUp, Crown, CheckCircle, Heart } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        {/* Header Image/Banner Area */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 h-32 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.5)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.5)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-10" />
          <h2 className="text-3xl font-bold text-white drop-shadow-lg relative z-10">欢迎入职</h2>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold text-slate-200">你的职场生涯从今天开始</h3>
            <p className="text-slate-400 text-sm">这是一个真实而残酷的职场模拟。在这里，你的终极目标只有三个：</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
              <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 shrink-0">
                <Briefcase size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">1. 升职加薪</h4>
                <p className="text-[11px] text-slate-400 leading-tight">努力写代码 (LOC) 和修 Bug，争取季度考核 S 级，获得高额奖金。不要被房贷压垮。</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">2. 积累财富</h4>
                <p className="text-[11px] text-slate-400 leading-tight">利用工资炒股、买房。当然，你也可以选择通过送礼建立“深厚”的同事关系，甚至结婚生子。</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-900/20 to-slate-800/50 p-3 rounded-xl border border-yellow-700/30 hover:border-yellow-500/50 transition-colors">
              <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-400 shrink-0">
                <Crown size={20} />
              </div>
              <div>
                <h4 className="font-bold text-yellow-200 text-sm">3. 当上 CEO</h4>
                <p className="text-[11px] text-slate-400 leading-tight">熬走竞争对手，或者展现出惊人的野心。最终目标是取代马总，成为公司的主宰！</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              我准备好了，开始打工！
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
