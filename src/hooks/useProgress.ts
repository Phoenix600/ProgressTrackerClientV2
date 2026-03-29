import { useMemo } from 'react';
import type { Batch, Course, CompletedTopic } from '../types';
import { differenceInDays, differenceInCalendarDays, addDays } from 'date-fns';

export interface ProgressMetrics {
  totalTopics: number;
  completedTopics: number;
  actualProgressPercent: number;
  expectedProgressPercent: number;
  deviationPercent: number;
  deviatedDays: number;
  status: 'Ahead' | 'On Track' | 'Behind';
  estimatedEndDate: Date;
}

export const calculateProgressMetrics = (
  batch: Batch,
  course: Course | undefined,
  completedTopics: CompletedTopic[] = []
): ProgressMetrics | null => {
  if (!course) return null;

  // Calculate total topics
  const totalTopics = course.chapters.reduce((acc, chap) => acc + chap.topics.length, 0);
    
    // Safety check to avoid division by zero
    if (totalTopics === 0) {
        return null;
    }

    const completedTopicIds = completedTopics.map(ct => ct.topicId);
    const completedTopicsCount = completedTopicIds.length;
    const actualProgressPercent = (completedTopicsCount / totalTopics) * 100;

    const today = new Date();
    const startDate = new Date(batch.startDate);
    const endDate = new Date(batch.plannedEndDate);

    const totalDurationDays = differenceInDays(endDate, startDate);
    
    // Safety check for duration
    if (totalDurationDays <= 0) {
        return null;
    }

    const elapsedDays = differenceInCalendarDays(today, startDate);
    
    // Calculate expected progress linearly
    let expectedProgressPercent = (elapsedDays / totalDurationDays) * 100;
    
    // Cap expected progress between 0 and 100
    expectedProgressPercent = Math.max(0, Math.min(100, expectedProgressPercent));

    const deviationPercent = actualProgressPercent - expectedProgressPercent;
    
    // Deviated days = (Deviation % / 100) * Total Duration
    const deviatedDays = (deviationPercent / 100) * totalDurationDays;

    let status: 'Ahead' | 'On Track' | 'Behind' = 'On Track';
    if (deviationPercent > 2) {
      status = 'Ahead';
    } else if (deviationPercent < -2) {
      status = 'Behind';
    }

    // Estimated end date
    // If progress is 0, we can't estimate well based on speed, just use planned end date
    let estimatedEndDate = new Date(endDate);
    if (actualProgressPercent > 0) {
      const daysPerPercent = elapsedDays / actualProgressPercent;
      const daysRemaining = (100 - actualProgressPercent) * daysPerPercent;
      estimatedEndDate = addDays(today, daysRemaining);
    }

    return {
      totalTopics,
      completedTopics: completedTopicsCount,
      actualProgressPercent: Number(actualProgressPercent.toFixed(1)),
      expectedProgressPercent: Number(expectedProgressPercent.toFixed(1)),
      deviationPercent: Number(deviationPercent.toFixed(1)),
      deviatedDays: Number(deviatedDays.toFixed(1)),
      status,
      estimatedEndDate
    };
};

export const useProgress = (
  batch: Batch,
  course: Course | undefined,
  completedTopics: CompletedTopic[] = []
): ProgressMetrics | null => {
  return useMemo(() => calculateProgressMetrics(batch, course, completedTopics), [batch, course, completedTopics]);
};
