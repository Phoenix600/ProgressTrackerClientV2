import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Course, Batch, AppState, CompletedTopic } from '../types';
import { API_BASE } from '../utils/api';

interface AppContextType extends AppState {
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, updatedCourse: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addBatch: (batch: Batch) => Promise<void>;
  updateBatch: (id: string, updatedBatch: Partial<Batch>) => Promise<void>;
  toggleTopicProgress: (batchId: string, topicId: string) => Promise<void>;
  updateTopicCompletionDate: (batchId: string, topicId: string, completedAt: string) => Promise<void>;
  updateOverdueReason: (batchId: string, topicId: string, reason: string) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchProgress, setBatchProgress] = useState<Record<string, CompletedTopic[]>>({});
  const [loading, setLoading] = useState(true);

  // Network Hydration
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch(`${API_BASE}/api/courses`),
          fetch(`${API_BASE}/api/batches`)
        ]);
        const cData = await cRes.json();
        const bData = await bRes.json();

        setCourses(cData.data || []);
        setBatches(bData.data || []);

        const progressMap: Record<string, CompletedTopic[]> = {};
        if (bData.data) {
          await Promise.all(bData.data.map(async (b: Batch) => {
            const pRes = await fetch(`${API_BASE}/api/batches/${b.id}/progress`);
            const pData = await pRes.json();
            progressMap[b.id] = pData.completedTopics || [];
          }));
        }
        setBatchProgress(progressMap);
      } catch (err) {
        console.error('Failed fetching DB hydration:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addCourse = async (course: Course) => {
    // Drop the ID so MongoDB generates a pure _id safely
    const payload = { ...course };
    delete (payload as any).id;
    
    const res = await fetch(`${API_BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      setCourses(prev => [...prev, data.data]);
    }
  };

  const updateCourse = async (id: string, updatedCourse: Course) => {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCourse)
    });
    if (res.ok) {
      const data = await res.json();
      setCourses(prev => prev.map(c => c.id === id ? data.data : c));
    }
  };

  const deleteCourse = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  const addBatch = async (batch: Batch) => {
    const payload = { ...batch };
    delete (payload as any).id;
    
    const res = await fetch(`${API_BASE}/api/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      setBatches(prev => [...prev, data.data]);
      setBatchProgress(prev => ({ ...prev, [data.data.id]: [] }));
    }
  };

  const updateBatch = async (id: string, updatedBatch: Partial<Batch>) => {
    const payload = { ...updatedBatch };
    delete (payload as any).id;
    
    const res = await fetch(`${API_BASE}/api/batches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      setBatches(prev => prev.map(b => b.id === id ? data.data : b));
      
      // If the batch was recalculated, refresh progress data
      if (data.recalculated) {
        const pRes = await fetch(`${API_BASE}/api/batches/${id}/progress`);
        const pData = await pRes.json();
        setBatchProgress(prev => ({ ...prev, [id]: pData.completedTopics || [] }));
      }
    }
  };

  const updateTopicCompletionDate = async (batchId: string, topicId: string, completedAt: string) => {
    // Optimistic Update
    setBatchProgress(prev => {
      const current = prev[batchId] || [];
      const updated = current.map(ct => 
        ct.topicId === topicId ? { ...ct, completedAt } : ct
      );
      return { ...prev, [batchId]: updated };
    });

    // Network Request Sync
    try {
      await fetch(`${API_BASE}/api/batches/${batchId}/progress/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, completedAt })
      });
    } catch (err) {
      console.error('Progress update failed', err);
      // Fallback reversion logic could go here
    }
  };

  const toggleTopicProgress = async (batchId: string, topicId: string) => {
    // Optimistic Update
    setBatchProgress(prev => {
      const current = prev[batchId] || [];
      const existingIndex = current.findIndex(ct => ct.topicId === topicId);
      let newProg: CompletedTopic[];
      if (existingIndex > -1) {
        newProg = current.filter(ct => ct.topicId !== topicId);
      } else {
        newProg = [...current, { topicId, completedAt: new Date().toISOString() }];
      }
      return { ...prev, [batchId]: newProg };
    });

    // Network Request Sync
    try {
      await fetch(`${API_BASE}/api/batches/${batchId}/progress/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
    } catch (err) {
      console.error('Progress sync failed', err);
      // Fallback reversion logic could go here
    }
  };
 
  const updateOverdueReason = async (batchId: string, topicId: string, overdueReason: string) => {
    // Optimistic Update
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const newSchedule = b.topicSchedule?.map(ts => 
        ts.topicId === topicId ? { ...ts, overdueReason } : ts
      );
      return { ...b, topicSchedule: newSchedule };
    }));
 
    // Network Request
    try {
      const res = await fetch(`${API_BASE}/api/batches/${batchId}/topics/${topicId}/overdue-reason`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdueReason })
      });
      if (!res.ok) throw new Error('Failed to update overdue reason');
    } catch (err) {
      console.error('Reason update failed', err);
    }
  };

  return (
    <AppContext.Provider value={{
      courses,
      batches,
      batchProgress,
      addCourse,
      updateCourse,
      deleteCourse,
      addBatch,
      updateBatch,
      toggleTopicProgress,
      updateTopicCompletionDate,
      updateOverdueReason,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
