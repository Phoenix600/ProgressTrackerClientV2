import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

const CourseList: React.FC = () => {
  const { courses, deleteCourse } = useAppContext();
  const navigate = useNavigate();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the course "${name}"? This action cannot be undone.`)) {
      deleteCourse(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary" />
            Courses
          </h1>
          <p className="mt-2 text-slate-500">Manage your course curriculum and edit chapters.</p>
        </div>
        <button
          onClick={() => navigate('/courses/new')}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-primary/30 font-bold transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> Create New Course
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const totalChapters = course.chapters.length;
            const totalTopics = course.chapters.reduce((acc, chap) => acc + chap.topics.length, 0);
            const totalDurationDays = course.chapters.reduce((acc, chap) => acc + chap.durationDays, 0);

            return (
              <div key={course.id} className="glass rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow h-full border-t-4 border-primary">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{course.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">{course.description}</p>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 mb-6 border border-slate-100 divide-x divide-slate-200 text-center">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Chapters</p>
                    <p className="font-bold text-slate-700">{totalChapters}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Topics</p>
                    <p className="font-bold text-slate-700">{totalTopics}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Duration</p>
                    <p className="font-bold text-slate-700">{totalDurationDays}d</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-auto">
                  <button 
                    onClick={() => navigate(`/courses/${course.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id, course.name)}
                    className="p-2 text-slate-400 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-lg mb-4">No courses available.</p>
          <button
            onClick={() => navigate('/courses/new')}
            className="text-primary hover:underline font-medium"
          >
            Create your first course
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseList;
