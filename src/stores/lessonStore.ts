import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LessonRecord, AppSettings } from '@/types/lesson';
import { v4 as uuidv4 } from 'uuid';

interface LessonStore {
  lessons: LessonRecord[];
  settings: AppSettings;
  addLesson: (lesson: Omit<LessonRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLesson: (id: string, lesson: Partial<Omit<LessonRecord, 'id' | 'createdAt'>>) => void;
  deleteLesson: (id: string) => void;
  getLessonsByDate: (date: string) => LessonRecord[];
  getLessonsByMonth: (year: number, month: number) => LessonRecord[];
  getLessonsByStudent: (studentName: string) => LessonRecord[];
  getMonthlyStats: (year: number, month: number) => {
    totalLessons: number;
    completedLessons: number;
    plannedLessons: number;
    cancelledLessons: number;
    totalIncome: number;
    totalHours: number;
    uniqueStudents: number;
  };
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useLessonStore = create<LessonStore>()(
  persist(
    (set, get) => ({
      lessons: [],
      settings: {
        hourlyRate: 55,
        taxRate: 10,
        defaultTeachingMethod: 'online',
        enableNotifications: true,
        notificationTime: 30
      },

      addLesson: (lesson) => {
        const newLesson: LessonRecord = {
          ...lesson,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({
          lessons: [...state.lessons, newLesson].sort((a, b) => 
            new Date(a.date + ' ' + a.startTime).getTime() - 
            new Date(b.date + ' ' + b.startTime).getTime()
          )
        }));
      },

      updateLesson: (id, updatedLesson) => {
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.id === id
              ? { ...lesson, ...updatedLesson, updatedAt: new Date().toISOString() }
              : lesson
          ).sort((a, b) => 
            new Date(a.date + ' ' + a.startTime).getTime() - 
            new Date(b.date + ' ' + b.startTime).getTime()
          )
        }));
      },

      deleteLesson: (id) => {
        set((state) => ({
          lessons: state.lessons.filter((lesson) => lesson.id !== id)
        }));
      },

      getLessonsByDate: (date) => {
        return get().lessons.filter((lesson) => lesson.date === date);
      },

      getLessonsByMonth: (year, month) => {
        return get().lessons.filter((lesson) => {
          const lessonDate = new Date(lesson.date);
          return lessonDate.getFullYear() === year && lessonDate.getMonth() === month;
        });
      },

      getLessonsByStudent: (studentName) => {
        return get().lessons.filter((lesson) => lesson.studentName === studentName);
      },

      getMonthlyStats: (year, month) => {
        const monthLessons = get().getLessonsByMonth(year, month);
        const completedLessons = monthLessons.filter(l => l.status === 'completed');
        
        const totalIncome = completedLessons.reduce((sum, lesson) => {
          return sum + (lesson.hourlyRate * lesson.duration);
        }, 0);

        const totalHours = completedLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
        const uniqueStudents = new Set(monthLessons.map(l => l.studentName)).size;

        return {
          totalLessons: monthLessons.length,
          completedLessons: completedLessons.length,
          plannedLessons: monthLessons.filter(l => l.status === 'planned').length,
          cancelledLessons: monthLessons.filter(l => l.status === 'cancelled').length,
          totalIncome,
          totalHours,
          uniqueStudents
        };
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      }
    }),
    {
      name: 'lesson-store',
      partialize: (state) => ({ lessons: state.lessons, settings: state.settings })
    }
  )
);