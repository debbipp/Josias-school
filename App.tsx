
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Gamepad2, 
  MessageSquare, 
  LogOut, 
  User as UserIcon, 
  Bell,
  Award
} from 'lucide-react';
import { Subject, Course, UserProfile, Message } from './types';
import Dashboard from './components/Dashboard';
import SubjectView from './components/SubjectView';
import GamesRoom from './components/GamesRoom';
import TeacherChat from './components/TeacherChat';
import Login from './components/Login';
import ProfileView from './components/ProfileView';
import TeacherDashboard from './components/TeacherDashboard';
import EmotionSurvey from './components/EmotionSurvey';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('josias_current_user');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed) {
      return {
        ...parsed,
        totalStars: parsed.totalStars || 0,
        badges: parsed.badges || [],
        streak: parsed.streak || 1,
        dailyProgress: parsed.dailyProgress || 0
      };
    }
    return null;
  });
  
  const [view, setView] = useState<'dashboard' | 'subject' | 'games' | 'chat' | 'profile'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [notification, setNotification] = useState<{title: string, msg: string, icon: string} | null>(null);
  const [showEmotionSurvey, setShowEmotionSurvey] = useState(false);
  
  const [allMessages, setAllMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('josias_messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('josias_current_user', JSON.stringify(user));
      
      const allUsers = JSON.parse(localStorage.getItem('josias_users') || '[]');
      const updatedUsers = allUsers.map((u: UserProfile) => 
        u.name.toLowerCase() === user.name.toLowerCase() ? user : u
      );
      localStorage.setItem('josias_users', JSON.stringify(updatedUsers));

      // Comprobar si ya hizo la encuesta hoy
      if (user.role === 'student') {
        const lastSurvey = localStorage.getItem(`survey_${user.name}`);
        const today = new Date().toDateString();
        if (lastSurvey !== today) {
          setShowEmotionSurvey(true);
        }
      }

      // Notificaciones tipo Duolingo
      const interval = setInterval(() => {
        if (user.role === 'student') {
          const savedMessages: Message[] = JSON.parse(localStorage.getItem('josias_messages') || '[]');
          const unread = savedMessages.filter(m => m.to === user.name && !m.read).length;
          
          if (unread > 0) {
            setNotification({ title: '¡Mensaje nuevo!', msg: `Tienes ${unread} respuesta(s) de tu profe.`, icon: '✉️' });
          } else if (user.dailyProgress && user.dailyProgress < 50) {
            setNotification({ title: '¡Casi lo logras!', msg: 'Te falta poco para tu meta del día.', icon: '🚀' });
          } else {
            setNotification({ title: '¡Hora de aprender!', msg: `¡No rompas tu racha de ${user.streak} días!`, icon: '🦅' });
          }
          setTimeout(() => setNotification(null), 8000);
        }
      }, 45000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Sincronizar mensajes reales periódicamente (simulando polling)
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('josias_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(allMessages)) {
          setAllMessages(parsed);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [allMessages]);

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    if (user.role === 'teacher') {
      return allMessages.filter(m => (m.to === user.name || m.to === 'teacher') && !m.read).length;
    }
    return allMessages.filter(m => m.to === user.name && !m.read).length;
  }, [allMessages, user]);

  const handleEmotionComplete = (emotion: string) => {
    if (user) {
      localStorage.setItem(`survey_${user.name}`, new Date().toDateString());
    }
    setShowEmotionSurvey(false);
  };

  if (!user) {
    return <Login onLogin={(userProfile) => setUser(userProfile)} />;
  }

  const navigateToSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setView('subject');
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const isTeacher = user.role === 'teacher';

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-800 flex flex-col selection:bg-blue-100">
      {showEmotionSurvey && user.role === 'student' && (
        <EmotionSurvey userName={user.name} onComplete={handleEmotionComplete} />
      )}

      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50 border-b border-slate-100 px-6">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => setView('dashboard')}
        >
          <div className="bg-blue-500 p-2 rounded-xl group-hover:rotate-6 transition-transform">
            <BookOpen className="text-white" size={24} />
          </div>
          <h1 className="font-kids text-2xl text-blue-600 hidden sm:block">Josías School</h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          {!isTeacher && (
            <div className="hidden md:flex items-center gap-2 mr-4 bg-yellow-400 px-4 py-1.5 rounded-full border-b-4 border-yellow-600 shadow-md">
              <span className="text-lg font-bold text-white">{(user.totalStars || 0)}</span>
              <span className="text-sm">⭐️</span>
            </div>
          )}

          <button 
            onClick={() => setView('chat')}
            className={`p-2 rounded-full transition-all relative group ${view === 'chat' ? 'bg-orange-100 text-orange-600' : 'hover:bg-orange-50 text-orange-500'}`}
            title={isTeacher ? "Mensajes de Alumnos" : "Centro de Mensajes"}
          >
            <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setView('profile')}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border-2 transition-all hover:scale-105 ${
              view === 'profile' 
                ? 'bg-blue-500 border-blue-600 text-white shadow-lg' 
                : 'bg-white border-slate-100 text-slate-600 shadow-sm hover:border-blue-300'
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-xl overflow-hidden border border-blue-200 text-2xl">
              {user.avatar}
            </div>
            <span className="hidden sm:inline font-kids text-xs pt-0.5">{isTeacher ? 'Mi Perfil Profe' : 'Mi Perfil'}</span>
          </button>

          <button 
            onClick={() => setUser(null)} 
            className="p-2 text-slate-300 hover:text-red-500 transition-colors ml-1"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8">
        {view === 'dashboard' && (
          isTeacher ? (
            <TeacherDashboard 
              user={user} 
              messages={allMessages} 
              setMessages={setAllMessages} 
            />
          ) : (
            <Dashboard 
              user={user} 
              onSelectSubject={navigateToSubject} 
              onOpenGames={() => setView('games')} 
            />
          )
        )}
        {view === 'subject' && selectedSubject && (
          <SubjectView 
            subject={selectedSubject} 
            userCourse={user.course}
            onBack={() => setView('dashboard')} 
            role={user.role}
            userName={user.name}
          />
        )}
        {view === 'games' && (
          <GamesRoom 
            user={user}
            onUpdateUser={updateUser}
            onBack={() => setView('dashboard')} 
          />
        )}
        {view === 'chat' && (
          <TeacherChat 
            onBack={() => setView('dashboard')} 
            user={user}
            messages={allMessages}
            setMessages={setAllMessages}
          />
        )}
        {view === 'profile' && (
          <ProfileView 
            user={user} 
            onUpdateUser={updateUser}
            onBack={() => setView('dashboard')} 
          />
        )}
      </main>

      {notification && (
        <div className="fixed bottom-6 right-6 bg-white border-4 border-blue-400 shadow-2xl rounded-[2rem] p-5 flex items-center gap-4 animate-in slide-in-from-right duration-500 max-w-sm z-[100] border-b-8 border-r-8 cursor-pointer hover:scale-105 transition-transform"
             onClick={() => { setView(notification.title.includes('Mensaje') ? 'chat' : 'dashboard'); setNotification(null); }}>
          <div className="bg-blue-100 p-3 rounded-2xl text-4xl">{notification.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
               <Bell size={14} className="text-blue-500 animate-pulse" />
               <p className="font-kids text-blue-600 text-lg leading-none">{notification.title}</p>
            </div>
            <p className="text-sm text-slate-600 leading-tight font-bold">
              {notification.msg}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setNotification(null); }} 
            className="text-slate-300 hover:text-slate-500 p-1 font-black"
          >×</button>
        </div>
      )}

      <nav className="sm:hidden bg-white border-t-2 border-slate-100 p-3 flex justify-around items-center sticky bottom-0 z-50">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-blue-500' : 'text-slate-400'}`}>
          <BookOpen size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isTeacher ? 'Cursos' : 'Clases'}</span>
        </button>
        {!isTeacher && (
          <button onClick={() => setView('games')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'games' ? 'text-green-500' : 'text-slate-400'}`}>
            <Gamepad2 size={22} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Juegos</span>
          </button>
        )}
        <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}>
          <UserIcon size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
