export interface Student {
  id: string; // internal UUID
  studentId: string; // external student number shown in exports
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type NewStudent = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
