import React, { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import BatchCard from '../components/BatchCard';
import { calculateProgressMetrics } from '../hooks/useProgress';
import { Filter, SortAsc, LayoutGrid } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { batches, courses, batchProgress } = useAppContext();
  const [filter, setFilter] = useState<'All' | 'Delayed' | 'OnTrack'>('All');
  const [sort, setSort] = useState<'Progress' | 'Deviation'>('Progress');

  const filteredAndSortedBatches = useMemo(() => {
    return batches
      .filter((batch) => {
        const course = courses.find((c) => c.id === batch.courseId);
        if (!course) return false;
        
        const metrics = calculateProgressMetrics(batch, course, batchProgress[batch.id] || []);
        if (!metrics) return true;

        if (filter === 'Delayed') return metrics.status === 'Behind';
        if (filter === 'OnTrack') return metrics.status === 'On Track' || metrics.status === 'Ahead';
        return true;
      })
      .sort((a, b) => {
        const courseA = courses.find((c) => c.id === a.courseId);
        const courseB = courses.find((c) => c.id === b.courseId);
        
        const metricsA = calculateProgressMetrics(a, courseA, batchProgress[a.id] || []);
        const metricsB = calculateProgressMetrics(b, courseB, batchProgress[b.id] || []);

        if (!metricsA || !metricsB) return 0;

        if (sort === 'Progress') {
          return metricsB.actualProgressPercent - metricsA.actualProgressPercent; // descending
        } else {
          return metricsA.deviationPercent - metricsB.deviationPercent; // sorting ascending (most behind first)
        }
      });
  }, [batches, courses, batchProgress, filter, sort]);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-primary" />
            Dashboard
          </h1>
          <p className="mt-2 text-slate-500">Monitor all active batches and their tracking progress.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none focus:ring-0 cursor-pointer py-2"
            >
              <option value="All">All Batches</option>
              <option value="Delayed">Delayed Only</option>
              <option value="OnTrack">On Track / Ahead</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 px-3">
            <SortAsc size={16} className="text-slate-400" />
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none focus:ring-0 cursor-pointer py-2"
            >
              <option value="Progress">Sort by Progress</option>
              <option value="Deviation">Sort by Deviation</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedBatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              course={courses.find(c => c.id === batch.courseId)}
              completedTopics={batchProgress[batch.id] || []}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-lg">No batches match your filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
