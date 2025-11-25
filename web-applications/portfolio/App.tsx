import React, { useState, useEffect } from 'react';
import { AppStage, Player, AnalysisResult, QuizQuestion, AppMode, BoredStage, ScenarioResult, ScenarioJudgment } from './types';
import { analyzeDisputeAndGenerateGame, generateVibeCheckScenario, generateScenarioImage, judgeVibeCheck } from './services/gemini';
import { Button } from './components/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Helper Components ---

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => (
  <div className={`animate-fade-in ${className}`} style={{ animation: `fadeIn 0.5s ease-out ${delay}s forwards`, opacity: 0 }}>
    {children}
    <style>{`
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
  </div>
);

const Avatar: React.FC<{ name: string; color: string; size?: 'sm' | 'lg' }> = ({ name, color, size = 'lg' }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-lg';
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-inner border-2 border-white`} style={{ backgroundColor: color }}>
      {initial}
    </div>
  );
};

// --- Sub-Applications ---

// 1. Counsellor Game (Original Logic)
const CounsellorGame: React.FC<{ 
  p1: Player; 
  setP1: React.Dispatch<React.SetStateAction<Player>>;
  p2: Player; 
  setP2: React.Dispatch<React.SetStateAction<Player>>;
  onBack: () => void;
}> = ({ p1, setP1, p2, setP2, onBack }) => {
  const [stage, setStage] = useState<AppStage>(AppStage.WELCOME);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleStart = () => {
    if (!p1.name || !p2.name) return;
    setStage(AppStage.INPUT_P1);
  };

  const handleRestart = () => {
    // Reset game state but keep names
    setP1(prev => ({ ...prev, statement: '', score: 0 }));
    setP2(prev => ({ ...prev, statement: '', score: 0 }));
    setAnalysis(null);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setStage(AppStage.WELCOME);
  };

  const handleSubmitAnalysis = async () => {
    setStage(AppStage.ANALYZING);
    try {
      const result = await analyzeDisputeAndGenerateGame(p1.name, p1.statement, p2.name, p2.statement);
      setAnalysis(result);
      setStage(AppStage.GAME_HUB);
    } catch (e) {
      console.error(e);
      alert("Oops! Our AI Counsellor is on a coffee break. Please try again.");
      setStage(AppStage.INPUT_P1);
    }
  };

  const handleAnswer = (optionIndex: number, question: QuizQuestion) => {
    const isCorrect = optionIndex === question.correctIndex;
    if (isCorrect) {
        if (question.targetPlayer === 'p1') setP1(prev => ({ ...prev, score: prev.score + 100 }));
        else setP2(prev => ({ ...prev, score: prev.score + 100 }));
        setFeedback({ type: 'success', msg: "✨ Spot on! +100 Empathy Points ✨" });
    } else {
        setFeedback({ type: 'error', msg: "🤔 Not quite. " + question.reasoning });
    }
    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < (analysis?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStage(AppStage.VERDICT);
      }
    }, 3500);
  };

  // -- Counsellor Render Methods --
  
  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-8">
      <div className="relative mb-6 group cursor-pointer">
         <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
         <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Heart" className="relative w-40 h-40 object-cover rounded-full border-4 border-white shadow-2xl animate-float"/>
         <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full text-2xl shadow-lg">❤️‍🩹</div>
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight">HeartToHeart<span className="text-rose-500">.ai</span></h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">The AI Counsellor that doesn't judge (much).</p>
      </div>
      <div className="glass-panel p-8 rounded-3xl shadow-xl w-full max-w-md space-y-5 border-t-4 border-rose-400">
        <div className="text-left text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Who's fighting?</div>
        <div className="flex gap-3 items-center bg-white/50 p-2 rounded-xl">
          <span className="text-2xl pl-2">🌹</span>
          <input type="text" placeholder="Name 1" className="w-full p-3 rounded-lg bg-transparent focus:outline-none text-lg font-bold text-slate-700" value={p1.name} onChange={(e) => setP1({ ...p1, name: e.target.value })} />
        </div>
        <div className="flex gap-3 items-center bg-white/50 p-2 rounded-xl">
           <span className="text-2xl pl-2">🦕</span>
           <input type="text" placeholder="Name 2" className="w-full p-3 rounded-lg bg-transparent focus:outline-none text-lg font-bold text-slate-700" value={p2.name} onChange={(e) => setP2({ ...p2, name: e.target.value })} />
        </div>
        <Button onClick={handleStart} className="w-full text-lg py-4 shadow-rose-300/50" disabled={!p1.name || !p2.name}>Start Therapy 🛋️</Button>
        <button onClick={onBack} className="text-slate-400 text-sm hover:text-slate-600 underline">Back to Menu</button>
      </div>
    </div>
  );

  const renderInput = (player: Player, setPlayer: React.Dispatch<React.SetStateAction<Player>>, nextStage: () => void, isLastInput = false) => (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full pt-6 px-4">
      <div className="flex items-center gap-6 mb-8 bg-white p-4 rounded-2xl shadow-sm">
        <Avatar name={player.name} color={player.color} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800">Hey {player.name},</h2>
          <p className="text-slate-500 font-medium">Tell us your side. 🤫</p>
        </div>
      </div>
      <textarea className="w-full flex-1 p-8 rounded-3xl border-2 border-slate-100 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 focus:outline-none resize-none bg-white shadow-inner text-lg leading-relaxed" placeholder="It all started when..." value={player.statement} onChange={(e) => setPlayer({ ...player, statement: e.target.value })} />
      <div className="py-8 flex justify-between items-center">
         <button onClick={onBack} className="text-slate-400 font-bold hover:text-rose-500">Quit</button>
         <Button onClick={nextStage} disabled={player.statement.length < 10} isLoading={isLastInput && stage === AppStage.ANALYZING} className="px-10 py-4 text-lg">{isLastInput ? "Analyze 🔮" : "Next 👉"}</Button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="relative w-48 h-48 mb-8">
        <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover rounded-full animate-pulse shadow-2xl border-4 border-white" alt="AI Thinking"/>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-3">Processing Emotions... 🤖</h2>
      <p className="text-slate-500">Our AI is taking a deep breath.</p>
    </div>
  );

  const renderGameHub = () => (
    <div className="max-w-4xl mx-auto w-full py-10 px-4 space-y-10">
       <div className="text-center space-y-4">
         <h2 className="text-4xl font-black text-slate-800">Here's the Tea 🍵</h2>
         <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white inline-block max-w-2xl">
           <p className="text-xl text-slate-700 italic font-medium">"{analysis?.summary}"</p>
         </div>
       </div>
       <div className="grid md:grid-cols-2 gap-8">
          {[
            { p: p1, text: analysis?.p1Perspective, title: "What they meant" },
            { p: p2, text: analysis?.p2Perspective, title: "What they meant" }
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.2}>
              <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 h-full" style={{ borderColor: item.p.color }}>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar name={item.p.name} color={item.p.color} />
                  <h3 className="font-bold text-xl text-slate-800">{item.p.name}</h3>
                </div>
                <p className="text-slate-600 text-lg">{item.text}</p>
              </div>
            </FadeIn>
          ))}
       </div>
       <div className="flex justify-center pt-8">
          <Button onClick={() => setStage(AppStage.QUIZ)} className="text-xl px-16 py-5 shadow-2xl shadow-indigo-200 animate-pulse">Play Empathy Quiz 🎮</Button>
       </div>
    </div>
  );

  const renderQuiz = () => {
    if (!analysis) return null;
    const question = analysis.questions[currentQuestionIndex];
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4 flex flex-col h-full justify-center">
         <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-500">TURN</span>
                 <span className="font-bold text-xl">{question.targetPlayer === 'p1' ? p1.name : p2.name}</span>
             </div>
             <div className="text-lg font-black text-slate-200">{currentQuestionIndex + 1}/{analysis.questions.length}</div>
         </div>
         <FadeIn key={currentQuestionIndex}>
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white mb-6">
               <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{question.question}</h2>
            </div>
            <div className="grid gap-4">
               {question.options.map((option, idx) => (
                 <button key={idx} onClick={() => !feedback && handleAnswer(idx, question)} className={`w-full p-6 rounded-2xl text-left transition-all duration-200 border-2 font-semibold text-lg ${feedback ? (idx === question.correctIndex ? 'bg-green-100 border-green-500 text-green-800' : 'opacity-40 border-slate-200') : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'}`}>
                   {option} {feedback && idx === question.correctIndex && '✅'}
                 </button>
               ))}
            </div>
         </FadeIn>
         {feedback && (
            <div className={`mt-8 p-6 rounded-2xl text-center font-bold animate-bounce shadow-xl ${feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
               {feedback.msg}
            </div>
         )}
      </div>
    );
  };

  const renderVerdict = () => (
     <div className="max-w-5xl mx-auto w-full py-8 px-4 space-y-8 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-black text-slate-800 mb-3">Final Verdict 👨‍⚖️</h2>
          <p className="text-slate-600">Empathy Score: {analysis?.compatibilityScore}%</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: p1.name, score: p1.score, fill: p1.color }, { name: p2.name, score: p2.score, fill: p2.color }]}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Bar dataKey="score" radius={[10, 10, 10, 10]} barSize={60}>
                       <Cell fill={p1.color} />
                       <Cell fill={p2.color} />
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
           </div>
           <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <h3 className="text-2xl font-bold text-rose-300">The Advice</h3>
                 <p className="text-lg font-light leading-relaxed">{analysis?.verdict}</p>
                 <div className="bg-white/10 p-4 rounded-xl mt-4">
                    <span className="block text-xs uppercase text-rose-200 font-bold">Tip</span>
                    <span className="font-bold text-xl">{analysis?.funTip}</span>
                 </div>
              </div>
           </div>
        </div>
        <div className="flex justify-center gap-4 pt-8">
           <Button variant="secondary" onClick={handleRestart}>New Dispute 🔄</Button>
           <Button onClick={onBack}>Main Menu 🏠</Button>
        </div>
     </div>
  );

  return (
    <div className="w-full h-full">
        {stage === AppStage.WELCOME && renderWelcome()}
        {stage === AppStage.INPUT_P1 && renderInput(p1, setP1, () => setStage(AppStage.INPUT_P2))}
        {stage === AppStage.INPUT_P2 && renderInput(p2, setP2, handleSubmitAnalysis, true)}
        {stage === AppStage.ANALYZING && renderAnalyzing()}
        {stage === AppStage.GAME_HUB && renderGameHub()}
        {stage === AppStage.QUIZ && renderQuiz()}
        {stage === AppStage.VERDICT && renderVerdict()}
    </div>
  );
};

// 2. Bored Game (Vibe Check)
const BoredGame: React.FC<{
  p1: Player; 
  setP1: React.Dispatch<React.SetStateAction<Player>>;
  p2: Player; 
  setP2: React.Dispatch<React.SetStateAction<Player>>;
  onBack: () => void;
}> = ({ p1, setP1, p2, setP2, onBack }) => {
  const [stage, setStage] = useState<BoredStage>(BoredStage.START);
  const [scenarioData, setScenarioData] = useState<ScenarioResult | null>(null);
  const [scenarioImage, setScenarioImage] = useState<string | null>(null);
  const [judgment, setJudgment] = useState<ScenarioJudgment | null>(null);

  const startScenario = async () => {
    if (!p1.name || !p2.name) return;
    setStage(BoredStage.SCENARIO_GENERATION);
    try {
      const result = await generateVibeCheckScenario();
      setScenarioData(result);
      // Start image gen in background
      generateScenarioImage(result.imagePrompt).then(setScenarioImage);
      setStage(BoredStage.INPUT);
    } catch (e) {
      console.error(e);
      setStage(BoredStage.START);
    }
  };

  const submitActions = async () => {
    if (!scenarioData || !p1.action || !p2.action) return;
    setStage(BoredStage.JUDGING);
    try {
      const result = await judgeVibeCheck(scenarioData.scenario, p1.name, p1.action, p2.name, p2.action);
      setJudgment(result);
      setStage(BoredStage.RESULT);
    } catch(e) {
      console.error(e);
      setStage(BoredStage.INPUT);
    }
  };

  const handleRestart = () => {
      setP1(prev => ({ ...prev, action: '' }));
      setP2(prev => ({ ...prev, action: '' }));
      setScenarioData(null);
      setScenarioImage(null);
      setJudgment(null);
      setStage(BoredStage.START);
  };

  if (stage === BoredStage.START) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-8 animate-fade-in">
        <div className="text-6xl mb-4">🎢</div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800">Vibe Check ✅</h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          The AI throws you into a crazy scenario. You describe what you'd do. The AI judges you.
        </p>
        
        <div className="glass-panel p-8 rounded-3xl shadow-xl w-full max-w-md space-y-5 border-t-4 border-purple-400">
           <div className="text-left text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Players</div>
           <div className="flex gap-3 items-center bg-white/50 p-2 rounded-xl">
             <Avatar name={p1.name} color={p1.color} size="sm" />
             <input type="text" placeholder="Name 1" className="w-full p-3 rounded-lg bg-transparent focus:outline-none text-lg font-bold" value={p1.name} onChange={(e) => setP1({ ...p1, name: e.target.value })} />
           </div>
           <div className="flex gap-3 items-center bg-white/50 p-2 rounded-xl">
             <Avatar name={p2.name} color={p2.color} size="sm" />
             <input type="text" placeholder="Name 2" className="w-full p-3 rounded-lg bg-transparent focus:outline-none text-lg font-bold" value={p2.name} onChange={(e) => setP2({ ...p2, name: e.target.value })} />
           </div>
           <Button onClick={startScenario} className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-500/30" disabled={!p1.name || !p2.name}>
             Generate Chaos 🎲
           </Button>
           <button onClick={onBack} className="text-slate-400 text-sm hover:text-slate-600 underline">Back to Menu</button>
        </div>
      </div>
    );
  }

  if (stage === BoredStage.SCENARIO_GENERATION) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-6xl animate-bounce mb-4">🎲</div>
            <h2 className="text-2xl font-bold">Cooking up trouble...</h2>
        </div>
     );
  }

  if (stage === BoredStage.INPUT) {
    return (
      <div className="max-w-3xl mx-auto w-full py-8 px-4 flex flex-col h-full">
         <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">The Scenario</h3>
            <p className="text-2xl font-bold text-slate-800 mb-4">{scenarioData?.scenario}</p>
            {scenarioImage ? (
                <img src={scenarioImage} alt="Scenario" className="w-full h-48 object-cover rounded-xl animate-fade-in" />
            ) : (
                <div className="w-full h-48 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400">Generatng visual...</div>
            )}
         </div>

         <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Avatar name={p1.name} color={p1.color} size="sm" />
                    <span className="font-bold">{p1.name}, what do you do?</span>
                </div>
                <textarea 
                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none h-32 resize-none"
                    placeholder="I would immediately..."
                    value={p1.action}
                    onChange={(e) => setP1({...p1, action: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Avatar name={p2.name} color={p2.color} size="sm" />
                    <span className="font-bold">{p2.name}, what do you do?</span>
                </div>
                <textarea 
                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none h-32 resize-none"
                    placeholder="I would probably..."
                    value={p2.action}
                    onChange={(e) => setP2({...p2, action: e.target.value})}
                />
            </div>
         </div>

         <div className="flex justify-center pt-8 pb-20">
             <Button onClick={submitActions} disabled={!p1.action || !p2.action} className="px-10 py-4 bg-slate-800 hover:bg-slate-900 text-white shadow-lg">
                 Judge Us ⚖️
             </Button>
         </div>
      </div>
    );
  }

  if (stage === BoredStage.JUDGING) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center p-4">
           <div className="text-6xl animate-spin mb-4">⚖️</div>
           <h2 className="text-2xl font-bold">Judging your life choices...</h2>
       </div>
    );
  }

  if (stage === BoredStage.RESULT && judgment) {
      return (
          <div className="max-w-2xl mx-auto w-full py-8 px-4 space-y-6 pb-20">
              <div className="text-center">
                  <h2 className="text-4xl font-black text-slate-800 mb-2">The Verdict</h2>
                  <div className={`inline-block px-4 py-2 rounded-full font-bold text-white ${judgment.winner === 'Tie' ? 'bg-yellow-400' : (judgment.winner === p1.name ? 'bg-rose-500' : 'bg-blue-500')}`}>
                      Winner: {judgment.winner === 'Tie' ? "It's a Tie!" : judgment.winner}
                  </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-purple-500">
                  <p className="text-lg text-slate-700 leading-relaxed mb-6">{judgment.analysis}</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Vibe Compatibility</span>
                      <span className="text-3xl font-black text-purple-600">{judgment.compatibility}%</span>
                  </div>
              </div>
              
              <div className="bg-slate-800 text-slate-200 p-6 rounded-2xl italic text-center">
                  "{judgment.funnyComment}"
              </div>

              <div className="flex justify-center gap-4 pt-4">
                  <Button variant="secondary" onClick={handleRestart}>Next Scenario 🔄</Button>
                  <Button onClick={onBack}>Main Menu 🏠</Button>
              </div>
          </div>
      );
  }

  return null;
};


// --- Main App Container ---

export default function App() {
  const [mode, setMode] = useState<AppMode>('LANDING');
  const [p1, setP1] = useState<Player>({ name: '', statement: '', score: 0, color: '#F43F5E' });
  const [p2, setP2] = useState<Player>({ name: '', statement: '', score: 0, color: '#3B82F6' });

  // Preload fonts or setup global styles if needed
  
  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-10 animate-fade-in">
       <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 pb-2">
             HeartToHeart
          </h1>
          <p className="text-xl text-slate-500 font-medium">Your AI Relationship Companion</p>
       </div>

       <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Card 1: Counsellor */}
          <button 
            onClick={() => setMode('COUNSELLOR')}
            className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-rose-200 text-left flex flex-col h-80 justify-between overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
             <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">🛋️</div>
             <div className="relative z-10">
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Dispute Doctor</h3>
                <p className="text-slate-500 text-lg leading-snug">Settle arguments with empathy, humor, and AI mediation. No yelling allowed.</p>
             </div>
             <div className="mt-4 font-bold text-rose-500 flex items-center gap-2 group-hover:gap-4 transition-all">
                Enter Session <span>→</span>
             </div>
          </button>

          {/* Card 2: Bored Game */}
          <button 
             onClick={() => setMode('BORED_GAME')}
             className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 text-left flex flex-col h-80 justify-between overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
             <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">🎲</div>
             <div className="relative z-10">
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Vibe Check</h3>
                <p className="text-slate-500 text-lg leading-snug">Bored? Face wild AI-generated scenarios together and see if you survive.</p>
             </div>
             <div className="mt-4 font-bold text-purple-500 flex items-center gap-2 group-hover:gap-4 transition-all">
                Play Game <span>→</span>
             </div>
          </button>
       </div>
       
       <div className="text-slate-400 text-sm mt-8">
          Powered by Gemini 2.0 Flash & Imagen
       </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-rose-50/30 text-slate-900 font-sans selection:bg-rose-200 overflow-x-hidden">
      {mode === 'LANDING' && renderLanding()}
      {mode === 'COUNSELLOR' && <CounsellorGame p1={p1} setP1={setP1} p2={p2} setP2={setP2} onBack={() => setMode('LANDING')} />}
      {mode === 'BORED_GAME' && <BoredGame p1={p1} setP1={setP1} p2={p2} setP2={setP2} onBack={() => setMode('LANDING')} />}
    </div>
  );
}
