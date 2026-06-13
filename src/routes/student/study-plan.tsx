import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BookOpen, CheckCircle2, Circle, Calendar, Trophy, BellOff, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api, API_ORIGIN } from '../../lib/api'

export const Route = createFileRoute('/student/study-plan')({
  component: StudyPlanPage,
})

interface StudyPlanTask {
  id: number
  title: string
  type: 'lesson' | 'quiz'
  scheduled_date: string
  completed_at: string | null
  lesson_id: number | null
  quiz_id: number | null
}

interface StudyPlan {
  id: number
  course: { id: number; title: string; thumbnail: string | null } | null
  start_date: string
  end_date: string | null
  status: string
  progress: number
  completed_tasks: number
  total_tasks: number
  tasks: StudyPlanTask[]
}

async function fetchStudyPlans(): Promise<StudyPlan[]> {
  const res = await api.get('/v1/student/study-plans')
  return res.data
}

/** Build the full image URL regardless of whether thumbnail is a relative path or already absolute. */
function thumbnailUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_ORIGIN}/storage/${path}`
}

function StudyPlanPage() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const queryClient = useQueryClient()

  // Handle email unsubscribe via URL param
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('unsubscribe') === '1') {
      unsubscribeMutation.mutate()
      url.searchParams.delete('unsubscribe')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['study-plans'],
    queryFn: fetchStudyPlans,
  })

  const unsubscribeMutation = useMutation({
    mutationFn: () => api.post('/v1/student/study-plans/unsubscribe'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-plans'] }),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className={`mx-auto max-w-2xl px-4 py-16 text-center ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
        <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
        <h2 className="mb-2 text-xl font-bold text-foreground">
          {t('study_plan.no_plans_title')}
        </h2>
        <p className="mb-6 text-muted-foreground">
          {t('study_plan.no_plans_desc')}
        </p>
        <Link
          to="/courses"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          {t('study_plan.browse_courses')}
        </Link>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div
      className={`mx-auto max-w-3xl space-y-8 px-4 py-8 ${isAr ? 'font-arabic' : ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('study_plan.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('study_plan.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Back to dashboard */}
          <Link
            to="/student/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted"
          >
            {isAr ? (
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            ) : (
              <ArrowLeft className="h-3.5 w-3.5" />
            )}
            {t('study_plan.back_dashboard')}
          </Link>

          {/* Unsubscribe from emails */}
          <button
            onClick={() => unsubscribeMutation.mutate()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted"
            title={t('study_plan.unsubscribe_weekly')}
          >
            <BellOff className="h-3.5 w-3.5" />
            {t('study_plan.unsubscribe')}
          </button>
        </div>
      </div>

      {/* Plans */}
      {plans.map((plan) => {
        const overdueTasks = plan.tasks.filter(
          (task) => !task.completed_at && task.scheduled_date < today,
        )
        const todayTasks = plan.tasks.filter(
          (task) => !task.completed_at && task.scheduled_date === today,
        )
        const upcomingTasks = plan.tasks.filter(
          (task) => !task.completed_at && task.scheduled_date > today,
        )
        const completedTasks = plan.tasks.filter((task) => task.completed_at)
        const thumb = thumbnailUrl(plan.course?.thumbnail ?? null)

        return (
          <div
            key={plan.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {/* Course header */}
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className={`flex items-start gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                {thumb && (
                  <img
                    src={thumb}
                    alt={plan.course?.title ?? ''}
                    className="h-12 w-12 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h2 className={`font-bold text-foreground ${isAr ? 'text-right' : ''}`}>
                    {plan.course?.title ?? t('study_plan.unknown_course')}
                  </h2>
                  <p className={`mt-0.5 text-xs text-muted-foreground ${isAr ? 'text-right' : ''}`}>
                    {plan.start_date} → {plan.end_date ?? t('study_plan.lifetime')}
                  </p>
                </div>
                {plan.progress === 100 && (
                  <Trophy className="h-6 w-6 text-yellow-500 shrink-0" />
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className={`mb-1.5 flex items-center justify-between text-xs ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">
                    {plan.completed_tasks}/{plan.total_tasks} {t('study_plan.tasks_done')}
                  </span>
                  <span className="font-bold text-primary">{plan.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-2 rounded-full bg-primary transition-all duration-500 ${isAr ? 'float-right' : ''}`}
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* No content yet */}
            {plan.total_tasks === 0 ? (
              <div className={`px-6 py-8 text-center ${isAr ? 'text-right' : ''}`}>
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-semibold text-muted-foreground">
                  {t('study_plan.no_content')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {t('study_plan.no_content_desc')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {overdueTasks.length > 0 && (
                  <TaskSection
                    title={t('study_plan.overdue')}
                    tasks={overdueTasks}
                    colorClass="text-red-500"
                    bgClass="bg-red-50 dark:bg-red-950/20"
                    isAr={isAr}
                  />
                )}
                {todayTasks.length > 0 && (
                  <TaskSection
                    title={t('study_plan.today')}
                    tasks={todayTasks}
                    colorClass="text-primary"
                    bgClass="bg-primary/5"
                    isAr={isAr}
                  />
                )}
                {upcomingTasks.length > 0 && (
                  <TaskSection
                    title={t('study_plan.upcoming')}
                    tasks={upcomingTasks.slice(0, 5)}
                    colorClass="text-muted-foreground"
                    bgClass=""
                    isAr={isAr}
                  />
                )}
                {completedTasks.length > 0 && (
                  <TaskSection
                    title={t('study_plan.completed')}
                    tasks={completedTasks.slice(-3)}
                    colorClass="text-green-600"
                    bgClass=""
                    completed
                    isAr={isAr}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TaskSection({
  title,
  tasks,
  colorClass,
  bgClass,
  completed = false,
  isAr = false,
}: {
  title: string
  tasks: StudyPlanTask[]
  colorClass: string
  bgClass: string
  completed?: boolean
  isAr?: boolean
}) {
  return (
    <div className={bgClass}>
      <div className="px-6 py-3">
        <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${colorClass} ${isAr ? 'text-right' : ''}`}>
          {title}
        </p>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}
            >
              {completed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-border" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`truncate text-sm ${completed ? 'text-muted-foreground line-through' : 'text-foreground'} ${isAr ? 'text-right' : ''}`}
                >
                  {task.type === 'quiz' ? '📝 ' : '🎬 '}
                  {task.title}
                </p>
              </div>
              <div className={`flex items-center gap-1 text-xs text-muted-foreground shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Calendar className="h-3 w-3" />
                {task.scheduled_date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
