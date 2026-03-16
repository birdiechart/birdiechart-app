'use client'

import { Course } from '@/lib/types'

interface CourseSwitcherProps {
  courses: Course[]
  activeCourseId: string
  onSelect: (courseId: string) => void
  onAddCourse: () => void
  onDeleteCourse: (courseId: string) => void
}

export default function CourseSwitcher({
  courses,
  activeCourseId,
  onSelect,
  onAddCourse,
  onDeleteCourse,
}: CourseSwitcherProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
      {courses.map((course) => {
        const active = course.id === activeCourseId
        return (
          <div key={course.id} className="flex-shrink-0 flex items-center rounded-full overflow-hidden"
            style={{
              backgroundColor: active ? '#1D6B3B' : '#f3f4f6',
              boxShadow: active ? '0 2px 8px rgba(29,107,59,0.3)' : 'none',
            }}
          >
            <button
              onClick={() => onSelect(course.id)}
              className="px-3.5 py-1.5 text-sm font-medium whitespace-nowrap"
              style={{ color: active ? '#ffffff' : '#374151' }}
            >
              {course.name}
            </button>
            {active && (
              <button
                onClick={() => onDeleteCourse(course.id)}
                className="pr-2.5 pl-0.5 py-1.5 text-white/60 hover:text-white/90 transition-colors"
                aria-label="Remove course"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="11" y2="11"/>
                  <line x1="11" y1="1" x2="1" y2="11"/>
                </svg>
              </button>
            )}
          </div>
        )
      })}

      <button
        onClick={onAddCourse}
        className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-gray-300 text-gray-400 whitespace-nowrap transition-colors hover:border-green-400 hover:text-green-600"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="1" x2="6" y2="11"/>
          <line x1="1" y1="6" x2="11" y2="6"/>
        </svg>
        Add Course
      </button>
    </div>
  )
}
