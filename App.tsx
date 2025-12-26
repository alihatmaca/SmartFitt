import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, 
  BookOpen, 
  Bot, 
  User, 
  ChevronLeft, 
  Plus, 
  Send, 
  Activity,
  Calendar,
  Trophy,
  Crown,
  Check,
  Sparkles,
  Zap
} from 'lucide-react';
import { Content } from "@google/genai";

import { Screen, UserProfile, WorkoutLog, Article, ChatMessage } from './types';
import { generateCoachResponse } from './services/geminiService';
import { Button } from './components/Button';
import { Card } from './components/Card';

// --- INITIAL STATE (Simulated Database) ---
const INITIAL_USER: UserProfile = {
  name: "Ahmet",
  level: "Intermediate Lifter",
  goal: "Hypertrophy",
  subscription: "Free Tier"
};

const INITIAL_LOGS: WorkoutLog[] = [
  { id: '1', date: '2023-12-20', exercise: 'Bench Press', weight: 80, reps: 8, rpe: 9 },
  { id: '2', date: '2023-12-22', exercise: 'Squat', weight: 100, reps: 5, rpe: 8 }
];

const ARTICLES: Article[] = [
  {
    id: 'A',
    title: 'Mechanisms of Hypertrophy',
    authors: 'Schoenfeld et al.',
    summary: 'Hypertrophy is mediated by mechanical tension, metabolic stress, and muscle damage. Mechanical tension is the primary driver. Progressive overload is essential for continued adaptation.'
  },
  {
    id: 'B',
    title: 'Protein Timing: Myth or Reality?',
    authors: 'Aragon et al.',
    summary: 'Total daily protein intake is more critical than immediate post-workout timing (the "anabolic window"). However, feeding intervals of 3-4 hours may optimize muscle protein synthesis.'
  }
];

export default function App() {
  // --- STATE ---
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [logs, setLogs] = useState<WorkoutLog[]>(INITIAL_LOGS);
  
  // Tracker State
  const [exerciseInput, setExerciseInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: `Hello ${INITIAL_USER.name}. I am your evidence-based AI coach. How can I help you optimize your hypertrophy training today?`, timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (currentScreen === Screen.AI_COACH) {
      scrollToBottom();
    }
  }, [chatMessages, currentScreen]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- HANDLERS ---

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseInput || !weightInput || !repsInput) return;

    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      exercise: exerciseInput,
      weight: Number(weightInput),
      reps: Number(repsInput),
      rpe: 8 // Defaulting RPE for simulation simplicity
    };

    setLogs([newLog, ...logs]);
    setExerciseInput('');
    setWeightInput('');
    setRepsInput('');
    setNotification("Workout saved successfully!");
    setCurrentScreen(Screen.DASHBOARD);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    
    // Add User Message
    const newUserMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: userText, 
      timestamp: new Date() 
    };
    
    setChatMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    // Prepare History for API
    const historyForApi: Content[] = chatMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Call API
    const responseText = await generateCoachResponse(userText, user, logs, historyForApi);

    const newAiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newAiMsg]);
    setIsTyping(false);
  };

  const handleSubscribe = (plan: 'Monthly' | 'Yearly') => {
    setUser(prev => ({ ...prev, subscription: `Pro ${plan}` }));
    setNotification(`Welcome to Pro! You subscribed to the ${plan} plan.`);
    setCurrentScreen(Screen.DASHBOARD);
  };

  // --- RENDER HELPERS ---

  const renderHeader = (title: string, showBack: boolean = false) => (
    <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => setCurrentScreen(Screen.DASHBOARD)}
            className="p-1 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
      </div>
      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/50">
        <User size={16} />
      </div>
    </header>
  );

  // --- SCREENS ---

  const DashboardScreen = () => (
    <div className="min-h-screen bg-slate-900 pb-20">
      {renderHeader('SmartFit OS')}
      
      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-1">
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white">{user.name}</h2>
            {user.subscription.includes('Pro') && (
              <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1 font-semibold">
                <Crown size={10} /> PRO
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mt-2">
            <Activity size={14} />
            <span>Last workout: 2 days ago</span>
          </div>
        </div>

        {/* PRO Banner (Only if free) */}
        {!user.subscription.includes('Pro') && (
          <button 
            onClick={() => setCurrentScreen(Screen.SUBSCRIPTION)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-2xl shadow-lg shadow-emerald-900/40 relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
              <Sparkles size={100} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Zap size={16} className="text-yellow-300 fill-yellow-300" />
                  Upgrade to Pro
                </h3>
                <p className="text-emerald-100 text-sm mt-1">Unlock advanced AI analysis & stats.</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg text-white">
                <ChevronLeft className="rotate-180" size={20} />
              </div>
            </div>
          </button>
        )}

        {/* Quick Stats Widget */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Current Goal</p>
              <p className="text-xl text-white font-bold">{user.goal}</p>
            </div>
            <Trophy className="text-yellow-500" size={24} />
          </div>
          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-emerald-500 rounded-full"></div>
          </div>
          <p className="text-slate-500 text-xs mt-2 text-right">Progress: 66%</p>
        </Card>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setCurrentScreen(Screen.TRACKER)}
            className="col-span-2 group relative overflow-hidden rounded-2xl bg-emerald-600 p-6 transition-all hover:bg-emerald-500 active:scale-[0.98]"
          >
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-emerald-400 opacity-20 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative z-10 flex flex-col items-start gap-3">
              <div className="rounded-xl bg-white/20 p-3 text-white backdrop-blur-md">
                <Dumbbell size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Log Workout</h3>
                <p className="text-emerald-100 text-sm">Track your lifts</p>
              </div>
            </div>
          </button>

          <Card 
            onClick={() => setCurrentScreen(Screen.KNOWLEDGE_HUB)}
            className="flex flex-col gap-4 items-start hover:border-emerald-500/50 transition-colors group"
          >
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 group-hover:text-blue-300 transition-colors">
              <BookOpen size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">Knowledge</h3>
              <p className="text-slate-400 text-sm">Science Hub</p>
            </div>
          </Card>

          <Card 
            onClick={() => setCurrentScreen(Screen.AI_COACH)}
            className="flex flex-col gap-4 items-start hover:border-emerald-500/50 transition-colors group"
          >
             <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400 group-hover:text-purple-300 transition-colors">
              <Bot size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">AI Coach</h3>
              <p className="text-slate-400 text-sm">Ask Expert</p>
            </div>
          </Card>
          
          <Card 
            onClick={() => setCurrentScreen(Screen.PROFILE)}
            className="col-span-2 flex items-center justify-between hover:border-emerald-500/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-slate-700 p-3 text-slate-300">
                <User size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Profile</h3>
                <p className="text-slate-400 text-sm">Settings & Stats</p>
              </div>
            </div>
            <ChevronLeft className="rotate-180 text-slate-500" />
          </Card>
        </div>
      </main>

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl shadow-emerald-500/20 text-center font-medium animate-bounce z-50">
          {notification}
        </div>
      )}
    </div>
  );

  const SubscriptionScreen = () => (
    <div className="min-h-screen bg-slate-900 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <button 
          onClick={() => setCurrentScreen(Screen.DASHBOARD)}
          className="p-1 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">Subscription</h1>
      </header>
      
      <main className="p-6 pb-12">
        <div className="text-center mb-8 mt-2">
          <div className="inline-block p-4 bg-emerald-500/10 rounded-full mb-4">
            <Crown size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-slate-400">Unlock the full potential of your scientific training journey.</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto">
          {/* Monthly Plan */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-medium text-slate-300 mb-1">Monthly Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">$4.99</span>
                <span className="text-slate-500">/ month</span>
              </div>
              <ul className="space-y-3 mb-6">
                 <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check size={16} className="text-emerald-400" /> Unlimited AI Coach
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check size={16} className="text-emerald-400" /> Advanced Hypertrophy Stats
                </li>
              </ul>
              <Button 
                onClick={() => handleSubscribe('Monthly')}
                variant="secondary" 
                fullWidth
              >
                Select Monthly
              </Button>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gradient-to-b from-emerald-900/50 to-slate-800 rounded-2xl p-6 border border-emerald-500/50 relative overflow-hidden ring-1 ring-emerald-500/50">
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium text-emerald-100 mb-1">Yearly Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">$49.99</span>
                <span className="text-emerald-200/70">/ year</span>
              </div>
              <p className="text-emerald-400 text-xs font-semibold mb-4">Save ~17% compared to monthly</p>
              <ul className="space-y-3 mb-6">
                 <li className="flex items-center gap-3 text-white text-sm">
                  <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={12} className="text-emerald-400" /></div>
                  All Monthly Features
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={12} className="text-emerald-400" /></div>
                  Priority Support
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={12} className="text-emerald-400" /></div>
                  Exclusive Science Articles
                </li>
              </ul>
              <Button 
                onClick={() => handleSubscribe('Yearly')}
                variant="primary" 
                fullWidth
                className="shadow-emerald-900/50"
              >
                Subscribe Yearly
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-6">
          Recurring billing. Cancel anytime in your profile settings.
        </p>
      </main>
    </div>
  );

  const TrackerScreen = () => (
    <div className="min-h-screen bg-slate-900">
      {renderHeader('Log Workout', true)}
      <main className="p-6">
        <form onSubmit={handleSaveLog} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Exercise Name</label>
            <input
              type="text"
              value={exerciseInput}
              onChange={(e) => setExerciseInput(e.target.value)}
              placeholder="e.g. Bench Press"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Weight (kg)</label>
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Reps</label>
              <input
                type="number"
                value={repsInput}
                onChange={(e) => setRepsInput(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          <Button type="submit" fullWidth className="mt-8">
            <Plus size={20} />
            Save Set
          </Button>

          <div className="mt-12">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Recent History</h3>
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div>
                    <p className="font-semibold text-white">{log.exercise}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar size={10} /> {log.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">{log.weight}kg</p>
                    <p className="text-xs text-slate-400">{log.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );

  const KnowledgeHubScreen = () => (
    <div className="min-h-screen bg-slate-900">
      {renderHeader('Knowledge Hub', true)}
      <main className="p-6 space-y-4">
        <p className="text-slate-400 text-sm mb-4">Curated evidence-based articles for {user.goal}.</p>
        
        {ARTICLES.map(article => (
          <Card key={article.id} className="group hover:bg-slate-800 transition-colors">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{article.title}</h3>
            <p className="text-xs text-slate-500 mb-3 italic">{article.authors}</p>
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-300 leading-relaxed">{article.summary}</p>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );

  const AICoachScreen = () => (
    <div className="flex flex-col h-screen bg-slate-900">
      {renderHeader('AI Coach', true)}
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {chatMessages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full delay-75"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full delay-150"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about your hypertrophy..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim() || isTyping}
            className="bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="min-h-screen bg-slate-900">
      {renderHeader('Profile', true)}
      <main className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-900/50 mb-4">
            <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">{user.name}</h2>
          <p className="text-emerald-400 font-medium">{user.level}</p>
        </div>

        <div className="space-y-4">
          <Card>
             <div className="flex justify-between items-center border-b border-slate-700/50 pb-3 mb-3">
               <span className="text-slate-400">Current Goal</span>
               <span className="text-white font-semibold">{user.goal}</span>
             </div>
             <div className="flex justify-between items-center border-b border-slate-700/50 pb-3 mb-3">
               <span className="text-slate-400">Subscription</span>
               <span className={`font-semibold bg-emerald-500/10 px-2 py-1 rounded text-xs border border-emerald-500/20 ${user.subscription.includes('Pro') ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' : 'text-emerald-400'}`}>
                 {user.subscription}
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-slate-400">Total Workouts</span>
               <span className="text-white font-semibold">{logs.length}</span>
             </div>
          </Card>
          
          {!user.subscription.includes('Pro') && (
            <Button 
              onClick={() => setCurrentScreen(Screen.SUBSCRIPTION)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 border-none shadow-yellow-900/20"
              fullWidth
            >
              <Zap size={18} className="fill-white" /> Upgrade to Pro
            </Button>
          )}

          <Button variant="secondary" fullWidth onClick={() => setCurrentScreen(Screen.DASHBOARD)}>
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );

  // --- MAIN ROUTER ---
  return (
    <>
      {currentScreen === Screen.DASHBOARD && <DashboardScreen />}
      {currentScreen === Screen.TRACKER && <TrackerScreen />}
      {currentScreen === Screen.KNOWLEDGE_HUB && <KnowledgeHubScreen />}
      {currentScreen === Screen.AI_COACH && <AICoachScreen />}
      {currentScreen === Screen.PROFILE && <ProfileScreen />}
      {currentScreen === Screen.SUBSCRIPTION && <SubscriptionScreen />}
    </>
  );
}