import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  XCircle, 
  RefreshCw, 
  ClipboardList, 
  Target, 
  Award, 
  Clock, 
  BookOpen, 
  HelpCircle,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuizSubmitResult {
  passed: boolean
  progress_percentage?: number
  score?: number
}

interface QuizPlayerProps {
  quizId: number;
  /** Called when the student passes — update course progress in the parent. */
  onQuizPassed?: (result: QuizSubmitResult) => void | Promise<void>;
  /** Called when the student clicks Continue Learning — return to course videos. */
  onContinueLearning?: () => void | Promise<void>;
  onBack?: () => void;
}

export function QuizPlayer({ quizId, onQuizPassed, onContinueLearning, onBack }: QuizPlayerProps) {
  const { t } = useTranslation();
  const [quiz, setQuiz] = useState<any>(null);
  const [lastAttempt, setLastAttempt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentState, setCurrentState] = useState<'entry' | 'active' | 'results'>('entry');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number | null>>({});
  const [resultData, setResultData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (currentState === 'active' && timeLeft !== null) {
      if (timeLeft <= 0) {
        submitQuiz();
        return;
      }
      const timer = setTimeout(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentState, timeLeft]);

  // Reset scroll position to top of the quiz container when question changes
  useEffect(() => {
    const container = document.getElementById('quiz-player-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/student/quizzes/${quizId}`);
        setQuiz(response.data.quiz);
        setLastAttempt(response.data.last_attempt);
        
        // Initialize answers
        const initialAnswers: Record<number, number | null> = {};
        if (response.data.quiz?.questions) {
          response.data.quiz.questions.forEach((q: any) => {
            initialAnswers[q.id] = null;
          });
        }
        setUserAnswers(initialAnswers);
      } catch (error) {
        console.error('Failed to load quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setCurrentState('entry');
    setCurrentQuestionIndex(0);
    setResultData(null);
    setTimeLeft(null);
    fetchQuiz();
  }, [quizId]);

  const startQuiz = () => {
    setCurrentState('active');
    setCurrentQuestionIndex(0);
    setResultData(null);
    
    // Set 3 minutes per question
    if (quiz?.questions?.length) {
      setTimeLeft(quiz.questions.length * 180);
    }
    
    // Reset answers
    const freshAnswers: Record<number, number | null> = {};
    if (quiz?.questions) {
      quiz.questions.forEach((q: any) => {
        freshAnswers[q.id] = null;
      });
    }
    setUserAnswers(freshAnswers);
  };

  const handleSelectOption = (questionId: number, optionId: number | null) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const payload = quiz.questions.map((q: any) => ({
        question_id: q.id,
        option_id: userAnswers[q.id]
      }));

      const response = await api.post(`/student/quizzes/${quizId}/submit`, { answers: payload });
      setResultData(response.data);
      setCurrentState('results');
      setTimeLeft(null);
      if (response.data.passed && onQuizPassed) {
        await onQuizPassed(response.data);
      }
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = quiz?.questions?.length 
    ? Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 bg-slate-50 border-b border-slate-200 min-h-[500px] rounded-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 bg-slate-50 border-b border-slate-200 min-h-[500px] rounded-2xl">
        <div className="text-center text-slate-500">{t('failed_load_quiz', 'Failed to load quiz data.')}</div>
      </div>
    );
  }

  return (
    <div id="quiz-player-container" className="flex flex-col w-full bg-slate-50 border border-slate-200 rounded-2xl relative overflow-visible shrink-0 shadow-sm min-h-[500px]">
      
      {/* ================= PERSISTENT TOP HEADER (COURSERA STYLE) ================= */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm text-start rounded-t-2xl" dir="auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (currentState === 'active') {
                if (window.confirm(t('confirm_exit_quiz', 'Are you sure you want to leave? Your answers in this attempt will be lost.'))) {
                  if (onBack) onBack();
                }
              } else {
                if (onBack) onBack();
              }
            }}
            className="inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm text-slate-700 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('back_label', 'Back')}</span>
          </button>
          
          <div className="border-r border-slate-200 h-8 hidden sm:block" />
          
          <div className="text-start">
            <h3 className="text-sm md:text-base font-bold text-slate-900 leading-tight">{quiz.title}</h3>
            <span className="text-[11px] md:text-xs font-semibold text-slate-400">
              {currentState === 'active' 
                ? `${t('question_progress_label', 'Question')} ${currentQuestionIndex + 1} ${t('of_label', 'of')} ${quiz.questions.length}`
                : `${quiz.questions?.length || 0} ${t('questions_count_label', 'Questions')} • ${t('graded_assignment', 'Graded Assignment')}`
              }
            </span>
          </div>
        </div>
        
        {currentState === 'active' && timeLeft !== null ? (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600">
            <Clock className="h-4 w-4 text-slate-400 animate-pulse" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500">
            <Target className="h-4 w-4 text-emerald-500" />
            <span>{quiz.passing_score}% {t('to_pass_label', 'to pass')}</span>
          </div>
        )}
      </div>

      {/* ================= MAIN CONTENT AREA (FLOW LAYOUT) ================= */}
      <div className="flex-1 flex flex-col">
        
        {/* ================= ENTRY SCREEN ================= */}
        {currentState === 'entry' && (
          <div className="w-full flex-1 flex items-center justify-center p-6 bg-slate-50 min-h-[400px]">
            <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center my-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 mb-5 border border-emerald-100">
                <ClipboardList className="h-8 w-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                {t('quiz_description', 'Test your knowledge on this topic. You need to achieve the passing score to complete this module.')}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
                  <Target className="h-4 w-4 text-emerald-500" />
                  <span>{quiz.passing_score}% {t('passing_score_label', 'Passing Score')}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>{quiz.questions?.length || 0} {t('questions_count_label', 'Questions')}</span>
                </div>
              </div>

              {lastAttempt && (
                <div className={`mb-6 p-4 rounded-xl border text-sm text-start flex items-start gap-3
                  ${lastAttempt.passed 
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                    : 'bg-red-50/50 border-red-100 text-red-800'}`}
                >
                  {lastAttempt.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold mb-0.5">
                      {t('previous_attempt', 'Previous Attempt')}: {lastAttempt.score}%
                    </p>
                    <p className="opacity-90">
                      {lastAttempt.passed 
                        ? t('passed_previous_attempt', 'You have already passed this quiz.') 
                        : t('failed_previous_attempt', 'You did not pass. Try again!')}
                    </p>
                  </div>
                </div>
              )}

              <button 
                onClick={startQuiz}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600 shadow-sm w-full sm:w-auto"
              >
                {lastAttempt ? t('retake_quiz', 'Retake Quiz') : t('start_quiz', 'Start Quiz')} <Play className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* ================= ACTIVE QUIZ SCREEN ================= */}
        {currentState === 'active' && quiz.questions && quiz.questions.length > 0 && (
          <div className="flex flex-col w-full bg-slate-50 flex-1 justify-between">
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1">
              <div 
                className="bg-emerald-500 h-1 transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Body */}
            <div className="w-full p-4 md:p-6 flex flex-col items-center">
              <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
                
                <div className="flex justify-between items-center mb-4 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('question_progress_label', 'Question')} {currentQuestionIndex + 1} {t('of_label', 'of')} {quiz.questions.length}
                  </span>

                  {/* Clear Selection Button */}
                  {userAnswers[quiz.questions[currentQuestionIndex].id] !== null && (
                    <button
                      onClick={() => handleSelectOption(quiz.questions[currentQuestionIndex].id, null)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 transition flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>{t('clear_selection', 'Clear Choice')}</span>
                    </button>
                  )}

                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {progressPercent}%
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <h4 className="text-base md:text-lg font-bold text-slate-900 mb-4 leading-relaxed">
                      {quiz.questions[currentQuestionIndex].question_text}
                    </h4>

                    <div className="flex flex-col gap-2.5">
                      {quiz.questions[currentQuestionIndex].options.map((option: any, idx: number) => {
                        const isSelected = userAnswers[quiz.questions[currentQuestionIndex].id] === option.id;
                        const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelectOption(quiz.questions[currentQuestionIndex].id, option.id)}
                            className={`flex items-center gap-4 py-3 px-4 rounded-xl border-2 transition-all duration-200 text-start w-full cursor-pointer
                              ${isSelected 
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-sm' 
                                : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                              }
                            `}
                          >
                            <div className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-lg border-2 font-bold text-xs transition-colors
                              ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-500'}
                            `}>
                              {optionLabel}
                            </div>
                            <span className="text-sm md:text-base font-semibold flex-1 leading-snug">
                              {option.option_text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Question Navigator Map */}
            <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-center gap-1.5">
              {quiz.questions.map((q: any, idx: number) => {
                const isAnswered = userAnswers[q.id] !== null;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-7 w-7 rounded-lg font-bold text-xs flex items-center justify-center border transition-all
                      ${isCurrent 
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                        : isAnswered 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Footer Controls */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between mt-auto w-full rounded-b-2xl shadow-sm">
              <button 
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('prev_label', 'Previous')}
              </button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button 
                  onClick={submitQuiz}
                  disabled={isSubmitting || userAnswers[quiz.questions[currentQuestionIndex].id] === null}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} 
                  {t('submit_quiz_label', 'Submit Quiz')}
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  disabled={userAnswers[quiz.questions[currentQuestionIndex].id] === null}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  {t('next_label', 'Next')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= RESULTS SCREEN ================= */}
        {currentState === 'results' && resultData && (
          <div className="w-full bg-slate-50">
            <div className="w-full max-w-2xl mx-auto p-6 md:p-8">
              
              {/* Completion Result Card */}
              <div className={`text-center p-8 rounded-2xl border-2 mb-8 shadow-sm bg-white relative overflow-hidden
                ${resultData.passed ? 'border-emerald-200' : 'border-red-200'}
              `}>
                
                {resultData.passed ? (
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 mb-4 border border-emerald-100">
                    <Award className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4 border border-red-100">
                    <XCircle className="h-8 w-8" />
                  </div>
                )}
                
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2">
                  {resultData.score}%
                </h2>
                
                <h3 className={`text-xl font-bold mb-2 ${resultData.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                  {resultData.passed ? t('passed_congrats', 'Congratulations, you passed!') : t('failed_quiz', 'You did not pass.')}
                </h3>
                
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  {resultData.passed 
                    ? t('passed_quiz_desc', 'Great job! You have demonstrated a solid understanding of the material and can proceed.') 
                    : t('failed_quiz_desc', `You need at least ${quiz.passing_score}% to pass. Review the material and try again.`)}
                </p>

                <button 
                  onClick={async () => {
                    if (resultData.passed) {
                      if (onContinueLearning)
                        await onContinueLearning();
                    } else {
                      startQuiz();
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition w-full sm:w-auto"
                >
                  {resultData.passed ? t('continue_course', 'Continue Learning') : t('retake_quiz', 'Retake Quiz')} 
                  {resultData.passed ? <ArrowRight className="h-4 w-4 rtl:rotate-180" /> : <RefreshCw className="h-4 w-4" />}
                </button>
              </div>

              {/* Answer Review Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-slate-400" /> {t('answers_review', 'Answers Review')}
                </h4>
                
                {quiz.questions.map((question: any, index: number) => {
                  const result = resultData.results?.find((r: any) => r.question_id === question.id);
                  const isCorrect = result?.is_correct;
                  const userAnswerId = result?.user_option_id;
                  const correctOptionId = result?.correct_option_id;
                  
                  return (
                    <div key={question.id} className={`p-5 rounded-2xl border bg-white shadow-sm transition-colors ${isCorrect ? 'border-emerald-100' : 'border-red-100'}`}>
                      <div className="flex gap-3 mb-4">
                        <div className={`flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full font-bold text-xs mt-0.5
                          ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                        `}>
                          {isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        </div>
                        <h5 className="text-base font-bold text-slate-800">{index + 1}. {question.question_text}</h5>
                      </div>

                      <div className="flex flex-col gap-2 pl-9">
                        {question.options.map((option: any, optIdx: number) => {
                          const isUserAnswer = userAnswerId === option.id;
                          const isTheCorrectAnswer = correctOptionId === option.id;
                          const optionLabel = String.fromCharCode(65 + optIdx);
                          
                          let cardStyle = 'border-slate-100 bg-slate-50/50 text-slate-600';
                          let labelStyle = 'bg-slate-100 text-slate-500 border-slate-200';
                          
                          if (isUserAnswer) {
                            if (isCorrect) {
                              cardStyle = 'border-emerald-200 bg-emerald-50/30 text-emerald-900';
                              labelStyle = 'bg-emerald-500 text-white border-emerald-500';
                            } else {
                              cardStyle = 'border-red-200 bg-red-50/30 text-red-900';
                              labelStyle = 'bg-red-500 text-white border-red-500';
                            }
                          } else if (isTheCorrectAnswer) {
                            cardStyle = 'border-emerald-200 bg-emerald-50/20 text-emerald-900 border-dashed';
                            labelStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          }

                          return (
                            <div key={option.id} className={`flex items-center justify-between p-3 rounded-xl border text-sm ${cardStyle}`}>
                              <div className="flex items-center gap-3">
                                <div className={`h-6 w-6 rounded-lg border flex items-center justify-center text-xs font-bold ${labelStyle}`}>
                                  {optionLabel}
                                </div>
                                <span className="font-semibold leading-snug">{option.option_text}</span>
                              </div>
                              
                              {isUserAnswer && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ml-2
                                  ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {t('your_answer_label', 'Your Answer')}
                                </span>
                              )}
                              {!isUserAnswer && isTheCorrectAnswer && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 shrink-0 ml-2">
                                  {t('correct_answer_label', 'Correct Answer')}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
