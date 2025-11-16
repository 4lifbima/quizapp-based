import { useEffect, useState } from 'react';
import { supabase, Quiz, Question, Option } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

type QuizPlayPageProps = {
  quizId: string;
  onBack: () => void;
};

type QuestionWithOptions = Question & {
  options: Option[];
};

export default function QuizPlayPage({ quizId, onBack }: QuizPlayPageProps) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .maybeSingle();

      if (quizError) throw quizError;
      setQuiz(quizData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: true });

      if (questionsError) throw questionsError;

      const formattedQuestions = (questionsData || []).map((q: any) => ({
        ...q,
        options: (q.options || []).sort((a: Option, b: Option) => a.order_number - b.order_number),
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentQuestionIndex].id]: optionId,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    questions.forEach((question) => {
      const selectedOptionId = selectedAnswers[question.id];
      const correctOption = question.options.find((opt) => opt.is_correct);
      if (selectedOptionId === correctOption?.id) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);

    if (user) {
      try {
        const { data: attemptData, error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: quizId,
            user_id: user.id,
            score: correctCount,
            total_questions: questions.length,
            time_taken: timeTaken,
          })
          .select()
          .single();

        if (attemptError) throw attemptError;

        const userAnswers = questions.map((question) => {
          const selectedOptionId = selectedAnswers[question.id];
          const correctOption = question.options.find((opt) => opt.is_correct);
          return {
            attempt_id: attemptData.id,
            question_id: question.id,
            selected_option_id: selectedOptionId,
            is_correct: selectedOptionId === correctOption?.id,
          };
        });

        await supabase.from('user_answers').insert(userAnswers);
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-[#571fff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
        <button
          onClick={onBack}
          className="bg-[#571fff] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4516cc] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
            percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {percentage >= 70 ? (
              <CheckCircle size={64} className="text-green-600" />
            ) : (
              <XCircle size={64} className="text-red-600" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 mb-6">Here's how you did</p>

          <div className="bg-gradient-to-r from-[#571fff] to-[#8040ff] text-white rounded-2xl p-6 mb-6">
            <div className="text-6xl font-bold mb-2">{percentage}%</div>
            <div className="text-lg">
              {score} out of {questions.length} correct
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{questions.length - score}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-[#571fff] text-white font-semibold py-3.5 rounded-xl hover:bg-[#4516cc] transition-colors shadow-lg shadow-[#571fff]/30"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[#571fff] to-[#8040ff] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Clock size={20} />
              <span className="font-semibold">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.question_text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[#571fff] bg-[#571fff]/5 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-[#571fff] bg-[#571fff]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-[#571fff]' : 'text-gray-700'}`}>
                      {option.option_text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuestion.id]}
            className="w-full mt-8 bg-[#571fff] text-white font-semibold py-4 rounded-xl hover:bg-[#4516cc] transition-colors shadow-lg shadow-[#571fff]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
