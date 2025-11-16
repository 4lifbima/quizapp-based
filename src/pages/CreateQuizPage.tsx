import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Save } from 'lucide-react';

type QuestionForm = {
  question_text: string;
  question_type: string;
  options: { option_text: string; is_correct: boolean }[];
};

export default function CreateQuizPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      question_text: '',
      question_type: 'multiple_choice',
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: string | boolean
  ) => {
    const newQuestions = [...questions];
    (newQuestions[questionIndex].options[optionIndex] as any)[field] = value;
    if (field === 'is_correct' && value === true) {
      newQuestions[questionIndex].options.forEach((opt, i) => {
        if (i !== optionIndex) opt.is_correct = false;
      });
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          category,
          difficulty,
          created_by: user.id,
          is_published: true,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quizData.id,
            question_text: question.question_text,
            question_type: question.question_type,
            order_number: i + 1,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          const { error: optionError } = await supabase.from('options').insert({
            question_id: questionData.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_number: j + 1,
          });

          if (optionError) throw optionError;
        }
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
      setCategory('general');
      setDifficulty('medium');
      setQuestions([
        {
          question_text: '',
          question_type: 'multiple_choice',
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
          ],
        },
      ]);

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
        <p className="text-gray-600">Design your own quiz and share it with others</p>
      </div>

      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl mb-6">
          Quiz created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#571fff] focus:outline-none transition-colors"
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#571fff] focus:outline-none transition-colors resize-none"
                placeholder="Describe your quiz"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#571fff] focus:outline-none transition-colors"
                >
                  <option value="general">General</option>
                  <option value="science">Science</option>
                  <option value="history">History</option>
                  <option value="technology">Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#571fff] focus:outline-none transition-colors"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#571fff] focus:outline-none transition-colors"
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={option.is_correct}
                        onChange={() => updateOption(qIndex, oIndex, 'is_correct', true)}
                        className="w-5 h-5 text-[#571fff] focus:ring-[#571fff]"
                      />
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, 'option_text', e.target.value)
                        }
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#571fff] focus:outline-none transition-colors"
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="mt-3 text-[#571fff] hover:text-[#4516cc] font-medium flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Option
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Question
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#571fff] text-white font-bold py-4 rounded-xl hover:bg-[#4516cc] transition-colors shadow-lg shadow-[#571fff]/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {loading ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
}
