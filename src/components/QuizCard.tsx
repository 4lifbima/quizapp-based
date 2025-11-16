import { Clock, Target, TrendingUp } from 'lucide-react';
import { Quiz } from '../lib/supabase';

type QuizCardProps = {
  quiz: Quiz;
  onStart: (quizId: string) => void;
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
};

const categoryColors = {
  general: 'bg-blue-50 border-blue-200',
  science: 'bg-purple-50 border-purple-200',
  history: 'bg-orange-50 border-orange-200',
  technology: 'bg-teal-50 border-teal-200',
};

export default function QuizCard({ quiz, onStart }: QuizCardProps) {
  const difficultyColor = difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.medium;
  const categoryColor = categoryColors[quiz.category as keyof typeof categoryColors] || categoryColors.general;

  return (
    <div className={`bg-white rounded-2xl border-2 ${categoryColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{quiz.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 capitalize">
          {quiz.category}
        </span>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${difficultyColor}`}>
          {quiz.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          <span>~5 min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target size={16} />
          <span>10 questions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={16} />
          <span>Score</span>
        </div>
      </div>

      <button
        onClick={() => onStart(quiz.id)}
        className="w-full bg-[#571fff] text-white font-semibold py-3 rounded-xl hover:bg-[#4516cc] transition-colors shadow-lg shadow-[#571fff]/30"
      >
        Start Quiz
      </button>
    </div>
  );
}
