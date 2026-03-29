import type { Course, Batch, AppState } from '../types';
import { addDays } from 'date-fns';

const today = new Date();

export const MOCK_COURSES: Course[] = [
  {
    id: 'course_react_01',
    name: 'Advanced React patterns',
    description: 'Master modern React with hooks, context, and performance optimizations.',
    chapters: [
      {
        id: 'chap_1',
        title: 'React Fundamentals Refresher',
        durationDays: 3,
        topics: [
          { id: 'top_1_1', title: 'Component Lifecycle and Hooks' },
          { id: 'top_1_2', title: 'Custom Hooks Deep Dive' },
          { id: 'top_1_3', title: 'Context API Best Practices' },
        ]
      },
      {
        id: 'chap_2',
        title: 'Performance Optimization',
        durationDays: 5,
        topics: [
          { id: 'top_2_1', title: 'React.memo and useMemo' },
          { id: 'top_2_2', title: 'useCallback and referential equality' },
          { id: 'top_2_3', title: 'Code splitting and lazy loading' },
          { id: 'top_2_4', title: 'Virtualization basics' },
        ]
      }
    ]
  },
  {
    id: 'course_node_01',
    name: 'Node.js Backend Architecture',
    description: 'Learn how to structure scalable Node.js microservices.',
    chapters: [
      {
        id: 'chap_node_1',
        title: 'Express Deep Dive',
        durationDays: 4,
        topics: [
          { id: 'top_n1_1', title: 'Middleware concepts' },
          { id: 'top_n1_2', title: 'Error handling strategies' },
          { id: 'top_n1_3', title: 'Routing structures' },
        ]
      },
      {
        id: 'chap_node_2',
        title: 'Database Integrations',
        durationDays: 6,
        topics: [
          { id: 'top_n2_1', title: 'Sequelize ORM' },
          { id: 'top_n2_2', title: 'Mongoose and MongoDB' },
          { id: 'top_n2_3', title: 'Redis caching' },
          { id: 'top_n2_4', title: 'Connection pooling' },
          { id: 'top_n2_5', title: 'Transaction management' },
        ]
      }
    ]
  }
];

export const MOCK_BATCHES: Batch[] = [
  {
    id: 'batch_react_jan',
    name: 'React Mastery - Jan Intake',
    courseId: 'course_react_01',
    startDate: addDays(today, -30).toISOString(), // 1 month ago
    plannedEndDate: addDays(today, 30).toISOString(), // 1 month from now (2-month batch)
    topicSchedule: [
      { topicId: 'top_1_1', expectedDate: addDays(today, -28).toISOString() },
      { topicId: 'top_1_2', expectedDate: addDays(today, -21).toISOString() },
      { topicId: 'top_1_3', expectedDate: addDays(today, -14).toISOString() },
      { topicId: 'top_2_1', expectedDate: addDays(today, -7).toISOString() },
      { topicId: 'top_2_2', expectedDate: addDays(today, 1).toISOString() },
      { topicId: 'top_2_3', expectedDate: addDays(today, 8).toISOString() },
      { topicId: 'top_2_4', expectedDate: addDays(today, 15).toISOString() },
    ]
  },
  {
    id: 'batch_node_feb',
    name: 'Node.js Bootcamp - Feb Intake',
    courseId: 'course_node_01',
    startDate: addDays(today, -15).toISOString(), // 15 days ago
    plannedEndDate: addDays(today, 45).toISOString(), // 45 days from now (2-month batch)
    topicSchedule: [
      { topicId: 'top_n1_1', expectedDate: addDays(today, -14).toISOString() },
      { topicId: 'top_n1_2', expectedDate: addDays(today, -7).toISOString() },
      { topicId: 'top_n1_3', expectedDate: addDays(today, 1).toISOString() },
      { topicId: 'top_n2_1', expectedDate: addDays(today, 8).toISOString() },
      { topicId: 'top_n2_2', expectedDate: addDays(today, 15).toISOString() },
      { topicId: 'top_n2_3', expectedDate: addDays(today, 22).toISOString() },
      { topicId: 'top_n2_4', expectedDate: addDays(today, 29).toISOString() },
      { topicId: 'top_n2_5', expectedDate: addDays(today, 36).toISOString() },
    ]
  },
  {
    id: 'batch_react_mar',
    name: 'React Weekend Batch',
    courseId: 'course_react_01',
    startDate: addDays(today, 5).toISOString(), // Starts in 5 days
    plannedEndDate: addDays(today, 65).toISOString(), // 60 days from start (2-month batch)
    topicSchedule: [
      { topicId: 'top_1_1', expectedDate: addDays(today, 8).toISOString() },
      { topicId: 'top_1_2', expectedDate: addDays(today, 15).toISOString() },
      { topicId: 'top_1_3', expectedDate: addDays(today, 22).toISOString() },
      { topicId: 'top_2_1', expectedDate: addDays(today, 29).toISOString() },
      { topicId: 'top_2_2', expectedDate: addDays(today, 36).toISOString() },
      { topicId: 'top_2_3', expectedDate: addDays(today, 43).toISOString() },
      { topicId: 'top_2_4', expectedDate: addDays(today, 50).toISOString() },
    ]
  }
];

export const INITIAL_STATE: AppState = {
  courses: MOCK_COURSES,
  batches: MOCK_BATCHES,
  batchProgress: {
    'batch_react_jan': [
      { topicId: 'top_1_1', completedAt: addDays(today, -4).toISOString() },
      { topicId: 'top_1_2', completedAt: addDays(today, -3).toISOString() },
      { topicId: 'top_1_3', completedAt: addDays(today, -2).toISOString() },
      { topicId: 'top_2_1', completedAt: addDays(today, -1).toISOString() }
    ], // Ahead of schedule
    'batch_node_feb': [
      { topicId: 'top_n1_1', completedAt: addDays(today, -1).toISOString() }
    ], // A bit behind schedule
    'batch_react_mar': [], // Unstarted
  }
};
