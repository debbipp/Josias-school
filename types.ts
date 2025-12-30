export type Subject = 'Lenguaje' | 'Historia' | 'Matemáticas' | 'Inglés' | 'Ciencias';

export type Course = 
  | '1ro Básico' 
  | '2do Básico' 
  | '3ro Básico' 
  | '4to Básico' 
  | '5to Básico' 
  | '6to Básico'
  | '7mo Básico'
  | '8vo Básico';

export type UserRole = 'student' | 'teacher';

export interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'ppt' | 'youtube';
  date: string;
  course: Course;
  subject: Subject;
  url?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  course: Course;
  subject: Subject;
  totalSubmissions?: number;
}

export interface Message {
  id: string;
  from: string; // Nombre del usuario
  to: string;   // 'teacher' o nombre del alumno
  text: string;
  timestamp: number;
  read: boolean;
  subject?: Subject;
}

export interface UserProfile {
  name: string;
  password?: string;
  avatar: string; // Un solo emoji representativo
  course: Course;
  role: UserRole;
  subject?: Subject;
  totalStars?: number;
  badges?: string[];
  streak?: number;
  dailyProgress?: number; // 0 to 100
}