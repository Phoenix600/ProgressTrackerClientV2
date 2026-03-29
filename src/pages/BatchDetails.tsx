import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useProgress } from '../hooks/useProgress';
import { DualProgressBar } from '../components/ProgressBar';
import { getStatusConfig } from '../components/BatchCard';
import { CheckCircle2, Circle, ArrowLeft, Clock, Calendar, BookOpen, Edit3, AlertTriangle, Save, X } from 'lucide-react';
import { format } from 'date-fns';

const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { batches, courses, batchProgress, toggleTopicProgress, updateTopicCompletionDate, updateBatch } = useAppContext();

  const batch = batches.find((b) => b.id === batchId);
  const course = useMemo(() => courses.find((c) => c.id === batch?.courseId), [courses, batch?.courseId]);
  const completedTopics = batchProgress[batchId || ''] || [];
  const completedTopicIds = completedTopics.map(ct => ct.topicId);

  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editDateTime, setEditDateTime] = useState('');

  // Batch editing state
  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [editBatchName, setEditBatchName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const getTopicSchedule = (topicId: string) => {
    return batch?.topicSchedule?.find(ts => ts.topicId === topicId);
  };

  const isTopicOverdue = (topicId: string) => {
    const schedule = getTopicSchedule(topicId);
    if (!schedule) return false;
    
    const expectedDate = new Date(schedule.expectedDate);
    const now = new Date();
    return expectedDate < now && !completedTopicIds.includes(topicId);
  };

  const updateTopicCompletionDateLocal = async (topicId: string, newCompletedAt: string) => {
    if (!batch) return;
    await updateTopicCompletionDate(batch.id, topicId, newCompletedAt);
  };

  const startEditing = (topicId: string) => {
    const completion = completedTopics.find(ct => ct.topicId === topicId);
    if (completion) {
      setEditingTopic(topicId);
      setEditDateTime(new Date(completion.completedAt).toISOString().slice(0, 16));
    }
  };

  const saveEdit = () => {
    if (editingTopic && editDateTime) {
      updateTopicCompletionDateLocal(editingTopic, new Date(editDateTime).toISOString());
      setEditingTopic(null);
      setEditDateTime('');
    }
  };

  const cancelEdit = () => {
    setEditingTopic(null);
    setEditDateTime('');
  };

  // Batch editing functions
  const startEditingBatch = () => {
    if (!batch) return;
    setEditBatchName(batch.name);
    setEditStartDate(new Date(batch.startDate).toISOString().split('T')[0]);
    setEditEndDate(new Date(batch.plannedEndDate).toISOString().split('T')[0]);
    setIsEditingBatch(true);
  };

  const cancelBatchEdit = () => {
    setIsEditingBatch(false);
    setEditBatchName('');
    setEditStartDate('');
    setEditEndDate('');
  };

  const saveBatchEdit = async () => {
    if (!batch) return;
    
    const start = new Date(editStartDate);
    const end = new Date(editEndDate);
    
    if (end <= start) {
      alert('End date must be after start date');
      return;
    }

    try {
      await updateBatch(batch.id, {
        name: editBatchName,
        startDate: start.toISOString(),
        plannedEndDate: end.toISOString()
      });
      setIsEditingBatch(false);
      alert('Batch updated successfully! Topic schedules have been recalculated.');
    } catch (err) {
      alert('Failed to update batch');
      console.error(err);
    }
  };

  const totalTopics = useMemo(() => {
    return course?.chapters.reduce((acc, chap) => acc + chap.topics.length, 0) || 0;
  }, [course]);

  const completedTopicsCount = completedTopicIds.length;

  const overdueTopics = useMemo(() => {
    if (!course || !batch?.topicSchedule) return 0;
    return course.chapters.flatMap(ch => ch.topics)
      .filter(topic => isTopicOverdue(topic.id)).length;
  }, [course, batch, completedTopicIds]);

  const metrics = useProgress(batch!, course!, completedTopics);

  if (!batch || !course || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Batch not found</h2>
        <button onClick={() => navigate('/batches')} className="mt-4 text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(metrics.status);

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Dashboard
      </button>

      {/* Header Card */}
      <div className="glass rounded-3xl p-8 mb-8 border-t-8 shadow-sm" style={{ borderTopColor: statusConfig.textClass.replace('text-', '') === 'success' ? '#22c55e' : statusConfig.textClass.replace('text-', '') === 'danger' ? '#ef4444' : '#eab308' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 ${statusConfig.textClass} ${statusConfig.badgeBgClass}`}>
              <div className={`w-2 h-2 rounded-full ${statusConfig.bgClass}`}></div>
              {metrics.status} · {metrics.deviationPercent > 0 ? '+' : ''}{metrics.deviationPercent}% deviation
              {overdueTopics > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {overdueTopics} overdue
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{batch.name}</h1>
            <p className="mt-2 text-lg text-slate-600 flex items-center gap-2">
              <BookOpen size={20} className="text-primary" /> {course.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startEditingBatch}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Edit3 size={16} />
              Edit Batch
            </button>
          </div>

          <div className="flex gap-4 md:gap-8">
             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-w-32">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5"><Calendar size={14}/> Start</p>
                <p className="font-bold text-slate-800">{format(new Date(batch.startDate), 'MMM d, yyyy')}</p>
             </div>
             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-w-32">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5"><Calendar size={14}/> Planned End</p>
                <p className="font-bold text-slate-800">{format(new Date(batch.plannedEndDate), 'MMM d, yyyy')}</p>
             </div>
          </div>
        </div>

        {/* Batch Edit Form */}
        {isEditingBatch && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
              <Edit3 size={20} />
              Edit Batch Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  value={editBatchName}
                  onChange={(e) => setEditBatchName(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Batch name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">Planned End Date</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveBatchEdit}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={cancelBatchEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
            <p className="text-sm text-amber-700 mt-3">
              ⚠️ Changing dates will recalculate topic schedules and may affect progress tracking.
            </p>
          </div>
        )}

        {/* Progress Section */}
        <div className="bg-white/60 rounded-2xl p-6 border border-white top-full shadow-inner">
          <DualProgressBar 
            actualPercent={metrics.actualProgressPercent} 
            expectedPercent={metrics.expectedProgressPercent} 
            statusConfig={statusConfig}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
             <div>
               <p className="text-xs text-slate-500 mb-1">Topics</p>
               <p className="font-semibold text-lg">{metrics.completedTopics} / {metrics.totalTopics}</p>
             </div>
             <div>
               <p className="text-xs text-slate-500 mb-1">Status</p>
               <p className={`font-semibold text-lg ${statusConfig.textClass}`}>{metrics.status}</p>
             </div>
             <div>
               <p className="text-xs text-slate-500 mb-1">Deviated</p>
               <p className="font-semibold text-lg">{Math.abs(metrics.deviatedDays)} days {metrics.deviationPercent < 0 ? 'behind' : 'ahead'}</p>
             </div>
             <div>
               <p className="text-xs text-slate-500 mb-1">Est. Completion</p>
               <p className="font-semibold text-lg flex items-center gap-2">
                 <Clock size={18} className="text-slate-400" />
                 {metrics.actualProgressPercent === 0 ? 'N/A' : format(metrics.estimatedEndDate, 'MMM d')}
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Curriculum Tracker */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Curriculum Tracker</h2>
            <p className="text-slate-500">Track topic completion against scheduled dates. Overdue topics are highlighted in red.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Progress Summary</div>
            <div className="text-lg font-bold text-slate-800">
              {completedTopicsCount}/{totalTopics} Topics Completed
            </div>
            {overdueTopics > 0 && (
              <div className="text-sm font-bold text-red-600">
                {overdueTopics} Overdue
              </div>
            )}
          </div>
        </div>
        
        {overdueTopics > 0 && (
          <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-bounce">🚨</div>
              <div>
                <h3 className="text-lg font-bold text-red-800">CRITICAL: {overdueTopics} Topic{overdueTopics > 1 ? 's' : ''} Overdue</h3>
                <p className="text-red-700">
                  {overdueTopics} topic{overdueTopics > 1 ? 's are' : ' is'} behind schedule and need{overdueTopics > 1 ? '' : 's'} immediate attention!
                  Please prioritize completing these topics to get back on track.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {course.chapters.map((chapter, index) => {
          const chapCompletedTopics = chapter.topics.filter(t => completedTopicIds.includes(t.id)).length;
          const isChapDone = chapCompletedTopics === chapter.topics.length;

          return (
            <div key={chapter.id} className="glass rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               {/* Chapter Header */}
               <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{chapter.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">{chapter.durationDays} Days Duration · {chapCompletedTopics}/{chapter.topics.length} Completed</p>
                    </div>
                  </div>
                  {isChapDone && (
                    <div className="flex items-center gap-1.5 text-success font-semibold px-3 py-1 bg-success/10 rounded-full text-sm">
                      <CheckCircle2 size={16} /> Completed
                    </div>
                  )}
               </div>

               {/* Chapter Topics */}
               <div className="px-6 py-2">
                 {chapter.topics.map((topic, tIdx) => {
                   const isCompleted = completedTopicIds.includes(topic.id);
                   const completion = completedTopics.find(ct => ct.topicId === topic.id);
                   const schedule = getTopicSchedule(topic.id);
                   const overdue = isTopicOverdue(topic.id);
                   const isEditing = editingTopic === topic.id;
                   
                   return (
                     <div key={topic.id} className={`py-4 ${tIdx !== chapter.topics.length - 1 ? 'border-b border-slate-100' : ''} ${overdue ? 'bg-red-50 border-l-4 border-l-red-500 shadow-lg animate-pulse' : ''}`}>
                       <div className="flex items-center gap-4">
                         <div className="relative">
                           <button 
                             onClick={() => toggleTopicProgress(batch.id, topic.id)}
                             className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-success' : overdue ? 'text-red-600' : 'text-slate-300 hover:text-primary'}`}
                           >
                             {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                           </button>
                           {overdue && (
                             <div className="absolute -top-1 -right-1">
                               <AlertTriangle size={16} className="text-red-600 fill-red-600 animate-bounce" />
                             </div>
                           )}
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center justify-between">
                             <span className={`text-base font-medium transition-colors ${isCompleted ? 'text-slate-400 line-through' : overdue ? 'text-red-700 font-bold' : 'text-slate-700 hover:text-primary'}`}>
                               {topic.title}
                               {overdue && <span className="ml-2 text-red-600 text-sm font-bold">⚠️ OVERDUE</span>}
                             </span>
                             {schedule && (
                               <div className={`text-xs px-2 py-1 rounded-full font-semibold ${overdue ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-blue-100 text-blue-700'}`}>
                                 Due: {format(new Date(schedule.expectedDate), 'MMM d, yyyy')}
                               </div>
                             )}
                           </div>
                           {isCompleted && completion && !isEditing && (
                             <div className="flex items-center gap-2 mt-1">
                               <p className="text-xs text-slate-400">
                                 Completed on {format(new Date(completion.completedAt), 'MMM d, yyyy \'at\' h:mm a')}
                               </p>
                               <button 
                                 onClick={() => startEditing(topic.id)}
                                 className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                               >
                                 <Edit3 size={12} />
                                 Edit
                               </button>
                             </div>
                           )}
                           {overdue && !isCompleted && (
                             <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                               <p className="text-sm text-red-800 font-bold flex items-center gap-2">
                                 <span className="text-lg">🚨</span>
                                 CRITICAL: Should have been completed by {format(new Date(schedule!.expectedDate), 'MMM d, yyyy')}
                               </p>
                               <p className="text-xs text-red-600 mt-1">
                                 This topic is behind schedule and needs immediate attention!
                               </p>
                             </div>
                           )}
                           {isEditing && (
                             <div className="mt-2 flex items-center gap-2">
                               <input
                                 type="datetime-local"
                                 value={editDateTime}
                                 onChange={(e) => setEditDateTime(e.target.value)}
                                 className="text-sm border border-slate-300 rounded px-2 py-1"
                               />
                               <button 
                                 onClick={saveEdit}
                                 className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                               >
                                 Save
                               </button>
                               <button 
                                 onClick={cancelEdit}
                                 className="text-xs text-slate-500 hover:text-slate-700"
                               >
                                 Cancel
                               </button>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BatchDetails;
