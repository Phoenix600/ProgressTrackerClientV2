export interface Topic {
  id: string;
  title: string;
}

export interface Chapter {
  id: string;
  title: string;
  durationDays: number;
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  chapters: Chapter[];
}

export interface TopicSchedule {
  topicId: string;
  expectedDate: string;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  startDate: string; // ISO string format
  plannedEndDate: string; // ISO string format
  topicSchedule?: TopicSchedule[];
}

export interface CompletedTopic {
  topicId: string;
  completedAt: string; // ISO string
}

export interface AppState {
  courses: Course[];
  batches: Batch[];
  batchProgress: Record<string, CompletedTopic[]>; // Map batchId -> Array of completed topics with timestamps
}
