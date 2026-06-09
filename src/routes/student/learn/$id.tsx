import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { CourseVideoPlayer } from "@/components/video/CourseVideoPlayer";
import { UpsellModal } from "@/components/course/UpsellModal";
import { useTranslation } from "react-i18next";
import { PlayCircle, CheckCircle2, ChevronDown, ArrowLeft, Loader2, Play, Lock, BookOpen, Clock, MessageSquare, Star, ThumbsUp, MessageCircle, Send, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Confetti from 'react-confetti';
import { Award } from 'lucide-react';
import { QuizPlayer, type QuizSubmitResult } from '@/components/quiz/QuizPlayer';
import { findNextLessonAfterQuiz } from '@/lib/courseCurriculum';
import { pageTitle } from '@/lib/siteMeta';

export const Route = createFileRoute("/student/learn/$id")({
  head: () => ({
    meta: [{ title: pageTitle("Learn") }],
  }),
  component: CoursePlayer,
});

function CoursePlayer() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [activeItemTypeState, setActiveItemTypeState] = useState<'lesson' | 'quiz' | null>(null);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  
  // Interactive States
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);
  const [reviews, setReviews] = useState<any[]>([
    { id: 1, user: "Dr. Sarah M.", text: "Absolutely phenomenal course. The breakdown of the clinical cases was exactly what I needed.", date: "1 month ago", rating: 5, avatar: 10 },
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: response, isLoading, isError, error: courseError } = useQuery({
    queryKey: ['student-course', id],
    queryFn: async () => {
      const res = await api.get(`/student/courses/${id}/learn`);
      return res.data;
    },
    enabled: isMounted,
    retry: (failCount, error: any) => {
      // Don't retry on device-lock (423) or forbidden (403)
      const status = error?.response?.status;
      if (status === 423 || status === 403) return false;
      return failCount < 2;
    },
  });

  // Detect device lock (HTTP 423)
  const isDeviceLocked = (courseError as any)?.response?.status === 423;

  const course = response?.course;
  const completedLessonIds = response?.completed_lesson_ids || [];
  const passedQuizIds: number[] = response?.passed_quiz_ids || [];
  const courseProgressPercent: number | undefined = response?.progress_percentage;

  // Tiered entitlements (backend is the source of truth; default = unlocked).
  const entitlements = response?.entitlements ?? { has_quizzes: true, has_files: true, has_certificate: true };
  const packages = response?.packages ?? [];
  const quizzesLocked = entitlements?.has_quizzes === false;
  const [upsell, setUpsell] = useState<{ open: boolean; feature: string | null }>({ open: false, feature: null });

  useEffect(() => {
    if (course?.title)
      document.title = pageTitle(course.title)
  }, [course?.title])

  const computedModules = course?.modules?.map((module: any) => {
    const lessons = (module.lessons || []).map((l: any) => ({ ...l, item_type: 'lesson' }));
    const quizzes = (module.quizzes || []).map((q: any) => ({ ...q, item_type: 'quiz' }));
    const items = [...lessons, ...quizzes].sort((a: any, b: any) => a.order - b.order);
    return { ...module, items };
  }) || [];

  const activeLesson = computedModules
    ?.flatMap((m: any) => m.items)
    ?.find((l: any) => l.id === activeItemId && l.item_type === 'lesson') || null;

  const activeQuiz = computedModules
    ?.flatMap((m: any) => m.items)
    ?.find((q: any) => q.id === activeItemId && q.item_type === 'quiz') || null;

  const activeItemType = activeItemTypeState;

  const comments = activeLesson?.comments || [];

  // Server-confirmed (anti-cheat) auto-completion → refresh progress silently.
  const handleVideoAutoCompleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['student-course', id] });
    queryClient.invalidateQueries({ queryKey: ['my-dashboard-data'] });
    toast.success(t('lesson_auto_completed', 'Lesson marked complete — great job!'));
  }, [queryClient, id, t]);

  useEffect(() => {
    if (computedModules.length > 0 && !activeItemId) {
      const firstModule = computedModules[0];
      setExpandedModules([firstModule.id]);
      if (firstModule.items && firstModule.items.length > 0) {
        setActiveItemId(firstModule.items[0].id);
        setActiveItemTypeState(firstModule.items[0].item_type);
      }
    }
  }, [course, activeItemId]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleQuizPassed = useCallback(async (result: QuizSubmitResult) => {
    if (!activeQuiz?.id)
      return;

    const quizId = activeQuiz.id;
    queryClient.setQueryData(['student-course', id], (old: any) => {
      if (!old)
        return old;

      const passedIds = Array.from(
        new Set([...(old.passed_quiz_ids || []), quizId]),
      ) as number[];
      const progress = result.progress_percentage ?? old.progress_percentage;
      const completedLessonsCount = (old.completed_lesson_ids || []).length;

      return {
        ...old,
        passed_quiz_ids: passedIds,
        progress_percentage: progress,
        completed_items: result.completed_items ?? completedLessonsCount + passedIds.length,
        total_items: result.total_items ?? old.total_items,
        course: old.course
          ? {
              ...old.course,
              pivot: { ...(old.course.pivot || {}), progress },
            }
          : old.course,
      };
    });

    await queryClient.invalidateQueries({ queryKey: ['student-course', id] });
    await queryClient.invalidateQueries({ queryKey: ['my-dashboard-data'] });

    if (result.is_course_completed) {
      setShowCelebration(true);
    }
  }, [activeQuiz?.id, id, queryClient]);

  const handleContinueAfterQuiz = useCallback(async () => {
    const fresh = await queryClient.fetchQuery({
      queryKey: ['student-course', id],
      queryFn: async () => {
        const res = await api.get(`/student/courses/${id}/learn`);
        return res.data;
      },
    });

    const modules = fresh?.course?.modules || course?.modules || [];
    const quizId = activeQuiz?.id;
    if (!quizId)
      return;

    const next = findNextLessonAfterQuiz(modules, quizId);
    if (next) {
      setExpandedModules(prev =>
        prev.includes(next.moduleId) ? prev : [...prev, next.moduleId],
      );
      setActiveItemId(next.id);
      setActiveItemTypeState('lesson');
      return;
    }

    const moduleWithQuiz = modules.find((mod: any) =>
      mod.quizzes?.some((q: any) => q.id === quizId),
    );
    const fallbackLesson = moduleWithQuiz?.lessons?.[0];
    if (fallbackLesson) {
      setExpandedModules(prev =>
        prev.includes(moduleWithQuiz.id) ? prev : [...prev, moduleWithQuiz.id],
      );
      setActiveItemId(fallbackLesson.id);
      setActiveItemTypeState('lesson');
    }
  }, [activeQuiz?.id, course?.modules, id, queryClient]);

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      const res = await api.post(`/student/lessons/${lessonId}/complete`);
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate to refresh progress
      queryClient.invalidateQueries({ queryKey: ['student-course', id] });
      
      if (data.is_course_completed) {
        setShowCelebration(true);
      } else if (data.next_lesson_id && course) {
        let nextLessonObj = null;
        for (const mod of course.modules) {
          for (const lesson of mod.lessons) {
            if (lesson.id === data.next_lesson_id) {
              nextLessonObj = lesson;
              if (!expandedModules.includes(mod.id)) {
                setExpandedModules(prev => [...prev, mod.id]);
              }
              break;
            }
          }
          if (nextLessonObj) break;
        }
        if (nextLessonObj) {
          setActiveItemId(nextLessonObj.id);
          setActiveItemTypeState(nextLessonObj.item_type || 'lesson');
        }
      }
    },
    onError: () => {
      toast.error("Failed to mark lesson as complete. Please try again.");
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number, comment: string }) => {
      const res = await api.post(`/student/courses/${id}/reviews`, { rating, comment });
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('submit_review')); // Wait, maybe "Review submitted"
      queryClient.invalidateQueries({ queryKey: ['student-course', id] });
      setIsReviewModalOpen(false);
      setReviewText("");
    },
    onError: () => {
      toast.error("Failed to submit review.");
    }
  });

  const submitCommentMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await api.post(`/student/lessons/${activeLesson?.id}/comments`, { body });
      return res.data;
    },
    onSuccess: (data) => {
      setCommentText("");
      toast.success("Comment posted successfully!");
      queryClient.invalidateQueries({ queryKey: ['student-course', id] });
    },
    onError: () => {
      toast.error("Failed to post comment.");
    }
  });

  const handleCompleteAndContinue = () => {
    if (!course || !activeLesson) return;
    completeLessonMutation.mutate(activeLesson.id);
  };

  const handlePostComment = () => {
    if (!commentText.trim() || !activeLesson) return;
    submitCommentMutation.mutate(commentText);
  };

  const submitReplyMutation = useMutation({
    mutationFn: async ({ parentId, body }: { parentId: number; body: string }) => {
      const res = await api.post(`/student/lessons/${activeLesson?.id}/comments`, { body, parent_id: parentId });
      return res.data;
    },
    onSuccess: () => {
      setReplyText("");
      setReplyToCommentId(null);
      toast.success("Reply posted successfully!");
      queryClient.invalidateQueries({ queryKey: ['student-course', id] });
    },
    onError: () => {
      toast.error("Failed to post reply.");
    }
  });

  const handlePostReply = (parentId: number) => {
    if (!replyText.trim() || !activeLesson) return;
    submitReplyMutation.mutate({ parentId, body: replyText });
  };

  const handlePostReview = () => {
    if (!reviewText.trim()) return;
    submitReviewMutation.mutate({ rating: reviewRating, comment: reviewText });
  };

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isDeviceLocked) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-center px-4">
        {/* Lock icon with pulse ring */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" />
          <div className="relative rounded-full bg-orange-500/10 p-7">
            <svg viewBox="0 0 24 24" className="h-16 w-16 fill-orange-500">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-foreground mb-3">
          {t('device_locked.title', 'الكورس مقفول على جهاز آخر')}
        </h2>
        <p className="text-muted-foreground max-w-md mb-2 text-lg leading-relaxed">
          {t('device_locked.desc', 'هذا الكورس مرتبط بجهاز مختلف. لا يمكن فتحه من أكثر من جهاز واحد في نفس الوقت.')}
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          {t('device_locked.help', 'تواصل مع الدعم الفني لإلغاء القفل وتسجيل الجهاز الجديد.')}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="https://wa.me/966500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#1da851]"
          >
            {/* WhatsApp icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('device_locked.contact_support', 'تواصل مع الدعم')}
          </a>
          <Link
            to="/student/dashboard"
            className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:border-primary"
          >
            {t('device_locked.back', 'العودة للوحة')}
          </Link>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-center px-4">
        <div className="rounded-full bg-destructive/10 p-6 mb-6">
          <Lock className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          You are either not enrolled in this course, or it no longer exists.
        </p>
        <Link to="/student/dashboard" className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90">
          Back to My Dashboard
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0);
  const totalQuizzes = course.modules.reduce((acc: number, mod: any) => acc + (mod.quizzes?.length || 0), 0);
  const totalItems = totalLessons + totalQuizzes;
  const completedLessons = completedLessonIds.length;
  const completedQuizzes = passedQuizIds.length;
  const completedItems = completedLessons + completedQuizzes;
  const progressPercent = courseProgressPercent
    ?? course.pivot?.progress
    ?? (totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100));

  const fetchedReviews = course.reviews || reviews;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(ytRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
    }
    return null;
  };

  const embedUrl = activeLesson ? getEmbedUrl(activeLesson.video_url) : null;

  return (
    <div className={`flex w-full flex-col bg-background rounded-2xl shadow-sm border border-border ${activeItemType === 'quiz' ? 'overflow-visible' : 'overflow-hidden'}`} style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* Main Content Area */}
      <div className="flex flex-1 lg:flex-row flex-col">
        
        {/* Left Side (Video + Interaction) */}
        <div className="flex-1 flex flex-col bg-gray-50/50 min-h-[500px]">
          
          {/* Top: Video Player or Quiz Placeholder */}
          {activeItemType === 'lesson' && activeLesson ? (
            <div className="w-full bg-black aspect-video relative group border-b border-border shadow-md shrink-0">
              {activeLesson.video_url ? (
                embedUrl ? (
                  <iframe 
                    src={embedUrl}
                    className="absolute inset-0 h-full w-full aspect-video border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <CourseVideoPlayer
                    src={activeLesson.video_url}
                    lessonId={activeLesson.id}
                    onAutoCompleted={handleVideoAutoCompleted}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                  <Play className="h-20 w-20 mb-4 opacity-50" />
                  <p className="text-lg">{t('video_not_available')}</p>
                </div>
              )}
            </div>
          ) : activeItemType === 'quiz' && activeQuiz ? (
            <QuizPlayer 
              quizId={activeQuiz.id} 
              onQuizPassed={handleQuizPassed}
              onContinueLearning={handleContinueAfterQuiz}
              onBack={() => {
                let lessonToSelect = null;
                if (course && course.modules) {
                  const moduleWithQuiz = course.modules.find((mod: any) => 
                    mod.quizzes?.some((q: any) => q.id === activeQuiz.id)
                  );
                  if (moduleWithQuiz && moduleWithQuiz.lessons && moduleWithQuiz.lessons.length > 0) {
                    lessonToSelect = moduleWithQuiz.lessons[0];
                  } else {
                    for (const mod of course.modules) {
                      if (mod.lessons && mod.lessons.length > 0) {
                        lessonToSelect = mod.lessons[0];
                        break;
                      }
                    }
                  }
                }
                if (lessonToSelect) {
                  setActiveItemId(lessonToSelect.id);
                  setActiveItemTypeState('lesson');
                }
              }}
            />
          ) : (
            <div className="flex aspect-video w-full shrink-0 items-center justify-center bg-zinc-900 border-b border-border">
              <div className="text-center p-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
                  <PlayCircle className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100">{t('welcome_course')}</h3>
                <p className="text-zinc-400 mt-2 max-w-md mx-auto">{t('welcome_course_desc')}</p>
              </div>
            </div>
          )}

          {/* Bottom: Interaction Zone */}
          {activeItemType === 'lesson' && activeLesson && (
            <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full">
              
              {/* Sticky Action Bar */}
              <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-6 pb-6 pt-2 bg-gray-50/95 backdrop-blur-sm border-b border-border mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">{activeLesson.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                    {activeLesson.duration_minutes > 0 && (
                      <span className="flex items-center gap-1.5 bg-secondary/70 px-2.5 py-1 rounded-full text-foreground">
                        <PlayCircle className="h-3.5 w-3.5 text-primary" /> {activeLesson.duration_minutes} min
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-secondary/70 px-2.5 py-1 rounded-full text-foreground"><BookOpen className="h-3.5 w-3.5 text-primary" /> {t('lesson')} {activeLesson.id}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCompleteAndContinue}
                  disabled={completeLessonMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 shadow-sm shrink-0 disabled:opacity-50"
                  dir="auto"
                >
                  {completeLessonMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t('mark_complete')} <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>

              {/* Tabs for Overview, Q&A, Reviews */}
              <Tabs defaultValue="overview" className="w-full pb-12">
                <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-6 overflow-x-auto hide-scrollbar">
                  <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-700 text-sm font-bold text-muted-foreground">
                    {t('overview')}
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-700 text-sm font-bold text-muted-foreground">
                    {t('q_a')}
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-700 text-sm font-bold text-muted-foreground">
                    {t('reviews')}
                  </TabsTrigger>
                </TabsList>
                
                {/* Overview Content */}
                <TabsContent value="overview" className="outline-none">
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground p-2 text-start" dir="auto">
                    <p>{activeLesson.description || t('no_lessons')}</p>
                  </div>

                  {/* PDF Attachments */}
                  {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                    <div className="mt-6 rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold text-foreground text-sm">{t('lesson_files')}</h3>
                        <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                          {activeLesson.attachments.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {activeLesson.attachments.map((att: any) => (
                          <a
                            key={att.id}
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/student/attachments/${att.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200 transition">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-1 overflow-hidden text-start">
                              <div className="truncate font-semibold">{att.title}</div>
                              {att.file_size > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {att.file_size < 1048576
                                    ? `${(att.file_size / 1024).toFixed(1)} KB`
                                    : `${(att.file_size / 1048576).toFixed(1)} MB`}
                                </div>
                              )}
                            </div>
                            <Download className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Q&A Content */}
                <TabsContent value="comments" className="space-y-8 mt-4 outline-none">
                  <div className="flex gap-4 p-2">
                    <Avatar className="h-10 w-10 border border-border shrink-0">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                      <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={t('ask_question_placeholder')}
                        className="w-full min-h-[100px] resize-y rounded-xl border border-border bg-card p-4 pb-12 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                        dir="auto"
                      />
                      <div className="absolute bottom-3 end-3 flex items-center gap-2">
                        <button onClick={handlePostComment} className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-white hover:bg-emerald-600 transition">
                          <Send className="me-1.5 h-3 w-3 rtl:rotate-180" /> {t('post')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 px-2">
                    {comments.map((comment: any) => {
                      const userName = typeof comment.user === 'object' ? comment.user?.name : (comment.user || comment.user_name || "User");
                      const commentTextBody = comment.body || comment.text;
                      const commentDate = comment.created_at ? new Date(comment.created_at).toLocaleDateString() : (comment.date || "Just now");
                      return (
                        <div key={comment.id} className="space-y-4 group">
                          <div className="flex gap-4">
                            <Avatar className="h-10 w-10 border border-border shrink-0">
                              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                                {userName ? userName.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-start" dir="auto">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-sm text-foreground">{userName}</h4>
                                {(comment.user?.role === 'admin' || comment.user_id === course.instructor_id) && (
                                  <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                                    Admin
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">{commentDate}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                {commentTextBody}
                              </p>
                              <div className="flex items-center gap-4">
                                <button className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-emerald-600 transition">
                                  <ThumbsUp className="h-3.5 w-3.5" /> 0
                                </button>
                                <button 
                                  onClick={() => setReplyToCommentId(replyToCommentId === comment.id ? null : comment.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-emerald-600 transition"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" /> {t('reply')}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Reply Input Form */}
                          {replyToCommentId === comment.id && (
                            <div className="flex gap-4 ms-14 mt-2">
                              <Avatar className="h-8 w-8 border border-border shrink-0">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 relative">
                                <input 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={t('reply_placeholder', 'Write a reply...')}
                                  className="w-full rounded-xl border border-border bg-card px-4 py-2 pe-12 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                                  dir="auto"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handlePostReply(comment.id);
                                    }
                                  }}
                                />
                                <button 
                                  onClick={() => handlePostReply(comment.id)} 
                                  className="absolute right-2 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                                >
                                  <Send className="h-3 w-3 rtl:rotate-180" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Sub-replies */}
                          {comment.replies && comment.replies.map((reply: any) => {
                            const rUserName = reply.user?.name || "User";
                            const rCommentTextBody = reply.body;
                            const rCommentDate = reply.created_at ? new Date(reply.created_at).toLocaleDateString() : "Just now";
                            return (
                              <div key={reply.id} className="flex gap-3 ms-14 bg-secondary/10 p-3 rounded-xl border border-border/50 text-start" dir="auto">
                                <Avatar className="h-8 w-8 border border-border shrink-0">
                                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                                    {rUserName ? rUserName.charAt(0).toUpperCase() : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <h5 className="font-bold text-xs text-foreground">{rUserName}</h5>
                                    {(reply.user?.role === 'admin' || reply.user_id === course.instructor_id) && (
                                      <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                                        Admin
                                      </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">{rCommentDate}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {rCommentTextBody}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Reviews Content */}
                <TabsContent value="reviews" className="outline-none mt-4">
                  <div className="grid lg:grid-cols-[250px_1fr] gap-8 p-2">
                    <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border shadow-sm text-center h-fit">
                      <h3 className="text-5xl font-black text-foreground mb-2">4.8</h3>
                      <div className="flex items-center gap-1 text-yellow-400 mb-2">
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current opacity-50" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mb-4">
                        {t('based_on_reviews').replace('{{count}}', String(fetchedReviews.length))}
                      </p>
                      
                      <button 
                        onClick={() => setIsReviewModalOpen(!isReviewModalOpen)}
                        className="w-full mt-2 rounded-xl border-2 border-emerald-500 text-emerald-600 py-2 text-sm font-bold hover:bg-emerald-500 hover:text-white transition"
                      >
                        {t('leave_review')}
                      </button>
                    </div>

                    <div className="space-y-6 text-start" dir="auto">
                      {isReviewModalOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-2xl bg-secondary/30 p-6 border border-border mb-6">
                          <h4 className="font-bold text-foreground mb-3">{t('your_rating')}</h4>
                          <div className="flex gap-2 mb-4">
                            {[1,2,3,4,5].map(star => (
                              <button key={star} onClick={() => setReviewRating(star)}>
                                <Star className={`h-6 w-6 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} />
                              </button>
                            ))}
                          </div>
                          <textarea 
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder={t('write_review_placeholder')}
                            className="w-full min-h-[100px] rounded-xl border border-border bg-card p-4 text-sm focus:border-emerald-500 focus:outline-none mb-4"
                          />
                          <button disabled={submitReviewMutation.isPending} onClick={handlePostReview} className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
                            {submitReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin inline-block me-2" /> : null}
                            {t('submit_review')}
                          </button>
                        </motion.div>
                      )}

                      {fetchedReviews.map((review: any) => {
                        const reviewerName = typeof review.user === 'object' ? review.user?.name : (review.user_name || review.user || "User");
                        const reviewTextContent = review.review || review.comment || review.text;
                        const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString() : (review.date || "Just now");
                        return (
                          <div key={review.id} className="rounded-2xl bg-card p-6 border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex gap-3">
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarImage src={`https://i.pravatar.cc/150?u=${review.id}`} />
                                  <AvatarFallback>{reviewerName ? reviewerName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-bold text-sm text-foreground">{reviewerName}</h4>
                                  <span className="text-xs text-muted-foreground">{reviewDate}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 text-yellow-400 shrink-0">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {reviewTextContent}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Right Side: Curriculum Sidebar */}
        {activeItemType !== 'quiz' && (
          <div className="w-full lg:w-80 xl:w-96 shrink-0 border-s border-border bg-card flex flex-col z-10 shadow-sm">
            <div className="p-5 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-20 text-start" dir="auto">
              <h2 className="text-lg font-bold text-foreground">{t('curriculum')}</h2>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
                <span className="text-xs font-bold text-emerald-600 shrink-0">{progressPercent}%</span>
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {completedItems} / {totalItems} {t('items_completed', 'items completed')}
              </div>
            </div>

            <div className="flex-1 p-3 space-y-2">
              {computedModules?.map((mod: any, mIdx: number) => {
                const isExpanded = expandedModules.includes(mod.id);
                const totalModItems = mod.items?.length || 0;
                
                return (
                  <div key={mod.id} className="rounded-xl border border-border bg-background overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => toggleModule(mod.id)}
                      className={`flex w-full items-center justify-between p-3 text-start transition hover:bg-secondary/50 focus:outline-none ${isExpanded ? 'bg-secondary/30' : ''}`}
                      dir="auto"
                    >
                      <div className="flex-1 pe-3">
                        <h3 className="font-bold text-sm text-foreground line-clamp-2">{t('sec')} {mIdx + 1}: {mod.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">{totalModItems} Items</p>
                      </div>
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card border border-border text-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-emerald-500 text-white border-emerald-500' : ''}`}>
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="divide-y divide-border border-t border-border bg-card/50">
                            {mod.items?.map((item: any, iIdx: number) => {
                              const isActive = activeItemId === item.id && activeItemTypeState === item.item_type;
                              const isLessonCompleted = item.item_type === 'lesson' && completedLessonIds.includes(item.id);
                              const isQuizPassed = item.item_type === 'quiz' && passedQuizIds.includes(item.id);
                              const isLocked = item.item_type === 'quiz' && quizzesLocked;

                              return (
                                <button
                                  key={`${item.item_type}-${item.id}`}
                                  onClick={() => {
                                    if (isLocked) { setUpsell({ open: true, feature: 'has_quizzes' }); return; }
                                    setActiveItemId(item.id); setActiveItemTypeState(item.item_type);
                                  }}
                                  className={`flex w-full items-start gap-3 p-3 text-start transition hover:bg-secondary focus:outline-none ${isActive ? 'bg-emerald-50/50 relative' : ''} ${isLocked ? 'opacity-70' : ''}`}
                                  dir="auto"
                                >
                                  {isActive && <div className="absolute start-0 top-0 h-full w-1 bg-emerald-500" />}

                                  <div className="mt-0.5 shrink-0">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 text-amber-500" />
                                    ) : item.item_type === 'lesson' ? (
                                      isLessonCompleted ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                      ) : isActive ? (
                                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                          <Play className="h-2 w-2 fill-current ms-0.5" />
                                        </div>
                                      ) : (
                                        <PlayCircle className="h-4 w-4 text-muted-foreground opacity-50" />
                                      )
                                    ) : isQuizPassed ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <div className={`flex h-4 w-4 items-center justify-center rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-transparent text-emerald-500'}`}>
                                        <CheckCircle2 className="h-4 w-4 fill-current opacity-80" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className={`text-sm font-semibold line-clamp-2 leading-snug ${isActive ? 'text-emerald-700' : 'text-foreground'}`}>
                                      {iIdx + 1}. {item.title}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                      {item.item_type === 'lesson' ? (
                                        item.duration_minutes > 0 ? (
                                          <><Clock className="h-3 w-3" /> {item.duration_minutes}m</>
                                        ) : null
                                      ) : isLocked ? (
                                        <><Lock className="h-3 w-3" /> {t('quiz_locked', 'Quiz • Locked')}</>
                                      ) : (
                                        <><CheckCircle2 className="h-3 w-3" /> Quiz • {item.passing_score}% pass</>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                            {(!mod.items || mod.items.length === 0) && (
                              <div className="p-3 text-center text-xs text-muted-foreground italic">
                                {t('no_lessons')}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {(!course.modules || course.modules.length === 0) && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-muted-foreground text-sm">
                  <BookOpen className="mx-auto h-5 w-5 mb-2 opacity-50" />
                  {t('curriculum_empty')}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
          >
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
              gravity={0.15}
            />
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="bg-card border border-border shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center relative z-10 mx-4"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-5xl">🏆</span>
              </div>
              <h2 className="text-3xl font-extrabold text-foreground mb-4">
                Congratulations!
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                You have successfully completed <strong>{course.title}</strong>! Your certificate is now ready to view.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row justify-center">
                <button 
                  onClick={() => setShowCelebration(false)}
                  className="px-6 py-3 rounded-xl border border-border font-medium hover:bg-secondary transition"
                >
                  Close
                </button>
                <Link
                  to="/student/dashboard"
                  search={{ tab: 'certificates' }}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Award className="h-5 w-5" />
                  View Certificate
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock & Upsell modal for tier-gated features */}
      <UpsellModal
        open={upsell.open}
        feature={upsell.feature}
        requiredTier={(entitlements as any)?.required_tier}
        packages={packages}
        onClose={() => setUpsell({ open: false, feature: null })}
        onChoose={() => {
          setUpsell({ open: false, feature: null });
          navigate({ to: '/courses/$id', params: { id: String(id) } } as any);
        }}
      />
    </div>
  );
}
