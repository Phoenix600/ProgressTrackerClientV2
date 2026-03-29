import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Batch } from '../types';
import { Layers, Calendar, PlusCircle, Save } from 'lucide-react';
import { addDays } from 'date-fns';

const BatchManager: React.FC = () => {
  const { courses, addBatch } = useAppContext();
  
  const [batchName, setBatchName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    addDays(new Date(), 30).toISOString().split('T')[0]
  );

  const handleCreateBatch = async () => {
    if (!batchName.trim()) return alert('Batch Name is required');
    if (!selectedCourse) return alert('Please select a course');
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return alert('End date must be after start date');

    const newBatch: Batch = {
      id: `batch_${Date.now()}`,
      name: batchName,
      courseId: selectedCourse,
      startDate: start.toISOString(),
      plannedEndDate: end.toISOString()
    };

    try {
      await addBatch(newBatch);
      alert('Batch created successfully!');
      
      // Reset form
      setBatchName('');
      setSelectedCourse('');
    } catch (err) {
      alert('Failed to spawn batch in database. Check connections!');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Layers className="text-primary" />
          Batch Manager
        </h1>
        <p className="mt-2 text-slate-500">Create new learning batches and assign courses.</p>
      </div>

      <div className="glass rounded-3xl p-8 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-slate-50"
              placeholder="e.g. Winter 2026 Bootcamp"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Assign Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-slate-50 text-slate-700"
            >
              <option value="" disabled>Select a predefined course...</option>
              {courses.map(course => (
                 <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Calendar size={16} className="text-primary" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Calendar size={16} className="text-warning" /> Planned End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-slate-50"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleCreateBatch}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-primary/30 font-bold transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle size={20} /> Create Batch
          </button>
        </div>
      </div>
      
      {/* Optional: Simple list of recent batches */}
      <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
         <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Save size={18} /> Quick Tips</h3>
         <p className="text-sm text-slate-500 leading-relaxed">
           When creating a batch, the progress tracking is automatically generated based on the selected course structure. The expected progress will strictly depend on the Start and Planned End Dates you define above. If you need a more flexible curriculum, create a new course structure in the Course Builder first.
         </p>
      </div>
    </div>
  );
};

export default BatchManager;
