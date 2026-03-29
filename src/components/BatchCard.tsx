import React from 'react';
import { format } from 'date-fns';
import type { Batch, Course, CompletedTopic } from '../types';
import { useProgress } from '../hooks/useProgress';
import { DualProgressBar } from './ProgressBar';
import { Calendar, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BatchCardProps {
  batch: Batch;
  course: Course | undefined;
  completedTopics: CompletedTopic[];
}

export const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Ahead':
      return { bgClass: 'bg-success', badgeBgClass: 'bg-success/10', textClass: 'text-green-700', icon: AlertCircle, label: 'Ahead of Schedule' };
    case 'Behind':
      return { bgClass: 'bg-danger', badgeBgClass: 'bg-danger/10', textClass: 'text-red-700', icon: AlertCircle, label: 'Behind Schedule' };
    default:
      return { bgClass: 'bg-warning', badgeBgClass: 'bg-warning/10', textClass: 'text-yellow-700', icon: AlertCircle, label: 'On Track' };
  }
};

const BatchCard: React.FC<BatchCardProps> = ({ batch, course, completedTopics }) => {
  const metrics = useProgress(batch, course, completedTopics);

  if (!course || !metrics) return null;

  const statusConfig = getStatusConfig(metrics.status);

  return (
    <div className="glass hover:shadow-md transition-all duration-300 rounded-2xl p-6 flex flex-col h-full border-t-4" style={{ borderTopColor: statusConfig.textClass.replace('text-', '') === 'success' ? '#22c55e' : statusConfig.textClass.replace('text-', '') === 'danger' ? '#ef4444' : '#eab308' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={batch.name}>{batch.name}</h3>
          <p className="text-sm text-slate-500 font-medium">{course.name}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusConfig.textClass} ${statusConfig.badgeBgClass}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.bgClass}`}></div>
          {metrics.status}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          {format(new Date(batch.startDate), 'MMM d')} - {format(new Date(batch.plannedEndDate), 'MMM d, yyyy')}
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <DualProgressBar 
            actualPercent={metrics.actualProgressPercent} 
            expectedPercent={metrics.expectedProgressPercent} 
            statusConfig={statusConfig}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Deviation</p>
            <p className={`text-sm font-bold ${statusConfig.textClass}`}>
              {metrics.deviationPercent > 0 ? '+' : ''}{metrics.deviationPercent}% 
              <span className="text-xs font-normal text-slate-500 ml-1">({Math.abs(metrics.deviatedDays)} days)</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Est. Completion</p>
            <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              {metrics.actualProgressPercent === 0 ? 'N/A' : format(metrics.estimatedEndDate, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      <Link 
        to={`/batches/${batch.id}`}
        className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition-colors border border-slate-200"
      >
        View Details
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default BatchCard;
