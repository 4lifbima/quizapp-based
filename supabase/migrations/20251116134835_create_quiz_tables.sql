/*
  # Create Quiz Application Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty` (text: easy, medium, hard)
      - `created_by` (uuid, references profiles)
      - `is_published` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `questions`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, references quizzes)
      - `question_text` (text)
      - `question_type` (text: multiple_choice, true_false)
      - `order_number` (integer)
      - `created_at` (timestamptz)
    
    - `options`
      - `id` (uuid, primary key)
      - `question_id` (uuid, references questions)
      - `option_text` (text)
      - `is_correct` (boolean)
      - `order_number` (integer)
    
    - `quiz_attempts`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, references quizzes)
      - `user_id` (uuid, references profiles)
      - `score` (integer)
      - `total_questions` (integer)
      - `completed_at` (timestamptz)
      - `time_taken` (integer, seconds)
    
    - `user_answers`
      - `id` (uuid, primary key)
      - `attempt_id` (uuid, references quiz_attempts)
      - `question_id` (uuid, references questions)
      - `selected_option_id` (uuid, references options)
      - `is_correct` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to published quizzes
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'general',
  difficulty text DEFAULT 'medium',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Users can create own quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own quizzes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice',
  order_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions of accessible quizzes"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
      AND (quizzes.is_published = true OR quizzes.created_by = auth.uid())
    )
  );

CREATE POLICY "Quiz creators can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- Options table
CREATE TABLE IF NOT EXISTS options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  order_number integer NOT NULL
);

ALTER TABLE options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view options of accessible questions"
  ON options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = options.question_id
      AND (quizzes.is_published = true OR quizzes.created_by = auth.uid())
    )
  );

CREATE POLICY "Quiz creators can manage options"
  ON options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = options.question_id
      AND quizzes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = options.question_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score integer DEFAULT 0,
  total_questions integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  time_taken integer DEFAULT 0
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  selected_option_id uuid REFERENCES options(id) ON DELETE CASCADE,
  is_correct boolean DEFAULT false
);

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = user_answers.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own answers"
  ON user_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = user_answers.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON user_answers(attempt_id);