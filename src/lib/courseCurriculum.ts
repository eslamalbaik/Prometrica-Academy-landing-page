export type CurriculumItemType = 'lesson' | 'quiz'

export interface CurriculumItem {
  id: number
  item_type: CurriculumItemType
  order?: number
}

export interface CourseModuleLike {
  id: number
  lessons?: Array<{ id: number; order?: number }>
  quizzes?: Array<{ id: number; order?: number }>
}

export function buildModuleItems(module: CourseModuleLike): CurriculumItem[] {
  const lessons = (module.lessons || []).map(l => ({
    id: l.id,
    item_type: 'lesson' as const,
    order: l.order,
  }))
  const quizzes = (module.quizzes || []).map(q => ({
    id: q.id,
    item_type: 'quiz' as const,
    order: q.order,
  }))
  return [...lessons, ...quizzes].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  )
}

/** Next lesson to watch after passing a quiz (same module or a later module). */
export function findNextLessonAfterQuiz(
  modules: CourseModuleLike[],
  quizId: number,
): { id: number; moduleId: number } | null {
  let quizModuleIndex = -1

  for (let mIdx = 0; mIdx < modules.length; mIdx++) {
    const items = buildModuleItems(modules[mIdx])
    const quizIndex = items.findIndex(
      i => i.item_type === 'quiz' && i.id === quizId,
    )
    if (quizIndex === -1)
      continue

    quizModuleIndex = mIdx

    for (let i = quizIndex + 1; i < items.length; i++) {
      if (items[i].item_type === 'lesson')
        return { id: items[i].id, moduleId: modules[mIdx].id }
    }
    break
  }

  if (quizModuleIndex === -1)
    return null

  for (let mIdx = quizModuleIndex + 1; mIdx < modules.length; mIdx++) {
    const items = buildModuleItems(modules[mIdx])
    const firstLesson = items.find(i => i.item_type === 'lesson')
    if (firstLesson)
      return { id: firstLesson.id, moduleId: modules[mIdx].id }
  }

  const quizModule = modules[quizModuleIndex]
  const items = buildModuleItems(quizModule)
  const quizIndex = items.findIndex(
    i => i.item_type === 'quiz' && i.id === quizId,
  )
  for (let i = quizIndex - 1; i >= 0; i--) {
    if (items[i].item_type === 'lesson')
      return { id: items[i].id, moduleId: quizModule.id }
  }

  return null
}
