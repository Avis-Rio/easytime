import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LessonRecord, AppSettings, MonthlyStats } from '@/types/lesson';
import type { Student, NewStudent } from '@/types/student';
import { v4 as uuidv4 } from 'uuid';

interface LessonStore {
  lessons: LessonRecord[];
  settings: AppSettings;
  students: Student[];
  addLesson: (lesson: Omit<LessonRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLesson: (id: string, lesson: Partial<Omit<LessonRecord, 'id' | 'createdAt'>>) => void;
  deleteLesson: (id: string) => void;
  getLessonsByDate: (date: string) => LessonRecord[];
  getLessonsByMonth: (year: number, month: number) => LessonRecord[];
  getLessonsByStudent: (studentName: string) => LessonRecord[];
  getMonthlyStats: (year: number, month: number) => MonthlyStats;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addStudent: (data: NewStudent) => void;
  updateStudent: (id: string, data: Partial<NewStudent>) => void;
  deleteStudent: (id: string) => void;
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
      students: [],

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
        const plannedLessons = monthLessons.filter(l => l.status === 'planned');
        const cancelledLessons = monthLessons.filter(l => l.status === 'cancelled');
        const onlineLessons = completedLessons.filter(l => l.teachingMethod === 'online');
        const offlineLessons = completedLessons.filter(l => l.teachingMethod === 'offline');
        
        const grossIncome = completedLessons.reduce((sum, lesson) => {
          return sum + (lesson.hourlyRate * lesson.duration);
        }, 0);

        const taxRate = get().settings.taxRate / 100; // 转换为小数
        const taxDeduction = grossIncome * taxRate;
        const netIncome = grossIncome - taxDeduction;

        const totalHours = completedLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
        const onlineHours = onlineLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
        const offlineHours = offlineLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
        const uniqueStudents = new Set(monthLessons.map(l => l.studentName)).size;

        // 计算最多取消的学生
        const studentCancelledCount = new Map<string, number>();
        monthLessons.filter(l => l.status === 'cancelled').forEach(lesson => {
          const current = studentCancelledCount.get(lesson.studentName) || 0;
          studentCancelledCount.set(lesson.studentName, current + 1);
        });

        let mostCancelledStudent: string | undefined;
        let maxCancelled = 0;
        studentCancelledCount.forEach((count, student) => {
          if (count > maxCancelled) {
            maxCancelled = count;
            mostCancelledStudent = student;
          }
        });

        return {
          year,
          month,
          totalLessons: monthLessons.length,
          completedLessons: completedLessons.length,
          plannedLessons: plannedLessons.length,
          cancelledLessons: cancelledLessons.length,
          totalIncome: Math.round(netIncome * 100) / 100,
          totalHours: Math.round(totalHours * 100) / 100,
          uniqueStudents,
          completionRate: monthLessons.length > 0 ? Math.round((completedLessons.length / monthLessons.length) * 100) : 0,
          averageHourlyRate: totalHours > 0 ? Math.round((netIncome / totalHours) * 100) / 100 : 0,
          grossIncome: Math.round(grossIncome * 100) / 100,
          taxDeduction: Math.round(taxDeduction * 100) / 100,
          netIncome: Math.round(netIncome * 100) / 100,
          onlineHours: Math.round(onlineHours * 100) / 100,
          offlineHours: Math.round(offlineHours * 100) / 100,
          mostCancelledStudent
        };
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      addStudent: (data) => {
        const newStudent: Student = {
          id: uuidv4(),
          studentId: String(data.studentId).trim(),
          name: String(data.name).trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({
          students: [...state.students, newStudent].sort((a, b) => a.studentId.localeCompare(b.studentId, 'zh-CN'))
        }));
      },

      updateStudent: (id, data) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
          ).sort((a, b) => a.studentId.localeCompare(b.studentId, 'zh-CN'))
        }));
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id)
        }));
      }
    }),
    {
      name: 'lesson-store',
      partialize: (state) => ({ lessons: state.lessons, settings: state.settings, students: state.students })
    }
  )
);
