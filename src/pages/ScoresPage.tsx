import { useEffect, useState } from 'react';
import { supabase, QuizAttempt } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Calendar, Clock, Target } from 'lucide-react';

type AttemptWithQuiz = QuizAttempt & {
  quizzes: {
    title: string;
    category: string;
    difficulty: string;
  };
};

export default function ScoresPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttempts();
    }
  }, [user]);

  const fetchAttempts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, category, difficulty)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (attempts.length === 0) return { total: 0, avgScore: 0, bestScore: 0 };

    const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
    const totalQuestions = attempts.reduce((sum, att) => sum + att.total_questions, 0);
    const avgScore = Math.round((totalScore / totalQuestions) * 100);
    const bestScore = Math.max(...attempts.map((att) => Math.round((att.score / att.total_questions) * 100)));

    return { total: attempts.length, avgScore, bestScore };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-[#571fff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Scores</h1>
        <p className="text-gray-600">Track your quiz performance and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#571fff] to-[#8040ff] text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Trophy size={32} />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.total}</div>
          <div className="text-purple-100">Quizzes Completed</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Target size={32} />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.avgScore}%</div>
          <div className="text-green-100">Average Score</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Trophy size={32} />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.bestScore}%</div>
          <div className="text-orange-100">Best Score</div>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={48} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No scores yet</h3>
          <p className="text-gray-600">Complete your first quiz to see your scores here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
            const difficultyColors = {
              easy: 'bg-green-100 text-green-800 border-green-200',
              medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              hard: 'bg-red-100 text-red-800 border-red-200',
            };

            return (
              <div
                key={attempt.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {attempt.quizzes.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 capitalize">
                        {attempt.quizzes.category}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${
                          difficultyColors[attempt.quizzes.difficulty as keyof typeof difficultyColors]
                        }`}
                      >
                        {attempt.quizzes.difficulty}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>{formatDate(attempt.completed_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{formatTime(attempt.time_taken)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {attempt.score}/{attempt.total_questions}
                      </div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>

                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl ${
                        percentage >= 70
                          ? 'bg-green-100 text-green-700'
                          : percentage >= 50
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {percentage}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
