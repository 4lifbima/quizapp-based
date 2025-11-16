import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import InstallPopup from './components/InstallPopup';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CreateQuizPage from './pages/CreateQuizPage';
import ScoresPage from './pages/ScoresPage';
import ProfilePage from './pages/ProfilePage';
import QuizPlayPage from './pages/QuizPlayPage';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#571fff] to-[#8040ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (activeQuizId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <QuizPlayPage quizId={activeQuizId} onBack={() => setActiveQuizId(null)} />
      </div>
    );
  }

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 md:ml-64">
          {activeTab === 'home' && <HomePage onStartQuiz={handleStartQuiz} />}
          {activeTab === 'create' && <CreateQuizPage />}
          {activeTab === 'scores' && <ScoresPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </main>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      {/* >>> Tambahkan InstallPopup di sini <<< */}
      <InstallPopup />

      {/* AppContent tetap berjalan seperti biasa */}
      <AppContent />
    </AuthProvider>
  );
}

export default App;
