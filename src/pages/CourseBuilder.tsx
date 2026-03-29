import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import type { Course, Chapter } from '../types';
import { Plus, Trash2, Save, BookOpen, Clock, GripVertical } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTopicItemProps {
  topic: any;
  chapterId: string;
  cIdx: number;
  tIdx: number;
  updateTopic: (cId: string, tId: string, title: string) => void;
  removeTopic: (cId: string, tId: string) => void;
}

const SortableTopicItem: React.FC<SortableTopicItemProps> = ({ topic, chapterId, cIdx, tIdx, updateTopic, removeTopic }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-2 rounded-xl border border-transparent ${isDragging ? 'opacity-50 border-primary shadow-md relative' : 'hover:border-slate-200'}`}>
       <button {...attributes} {...listeners} className="text-slate-400 hover:text-primary cursor-grab active:cursor-grabbing p-1 hidden sm:block outline-none" title="Drag to reorder">
         <GripVertical size={18} />
       </button>
       <span className="text-slate-300 w-6 text-right text-sm hidden sm:block">{cIdx + 1}.{tIdx + 1}</span>
       <input
         type="text"
         value={topic.title}
         onChange={(e) => updateTopic(chapterId, topic.id, e.target.value)}
         className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm shadow-sm"
         placeholder="Topic Title"
       />
       <div className="flex items-center justify-end sm:justify-start">
         <button {...attributes} {...listeners} className="text-slate-400 hover:text-primary cursor-grab active:cursor-grabbing p-2 block sm:hidden outline-none">
           <GripVertical size={18} />
         </button>
         <button
           onClick={() => removeTopic(chapterId, topic.id)}
           className="text-slate-400 hover:text-danger p-2 transition-colors sm:ml-2 outline-none"
           title="Delete Topic"
         >
           <Trash2 size={16} />
         </button>
       </div>
    </div>
  );
};

const CourseBuilder: React.FC = () => {
  const { courses, addCourse, updateCourse } = useAppContext();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    if (courseId) {
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        setCourseName(course.name);
        setDescription(course.description);
        setChapters(course.chapters);
      }
    }
  }, [courseId, courses]);

  const addChapter = () => {
    setChapters([
      ...chapters,
      {
        id: `c_${Date.now()}`,
        title: '',
        durationDays: 1,
        topics: []
      }
    ]);
  };

  const updateChapter = (id: string, field: keyof Chapter, value: any) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
  };

  const addTopic = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          return {
            ...c,
            topics: [...c.topics, { id: `t_${Date.now()}_${Math.random()}`, title: '' }]
          };
        }
        return c;
      })
    );
  };

  const updateTopic = (chapterId: string, topicId: string, title: string) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          return {
            ...c,
            topics: c.topics.map((t) => (t.id === topicId ? { ...t, title } : t))
          };
        }
        return c;
      })
    );
  };

  const removeTopic = (chapterId: string, topicId: string) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          return {
            ...c,
            topics: c.topics.filter((t) => t.id !== topicId)
          };
        }
        return c;
      })
    );
  };

  const handleDragEnd = (chapterId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChapters((prev) =>
        prev.map((c) => {
          if (c.id === chapterId) {
            const oldIndex = c.topics.findIndex(t => t.id === active.id);
            const newIndex = c.topics.findIndex(t => t.id === over.id);
            return { ...c, topics: arrayMove(c.topics, oldIndex, newIndex) };
          }
          return c;
        })
      );
    }
  };

  const handleSave = async () => {
    if (!courseName.trim()) return alert('Course Name is required');
    if (chapters.length === 0) return alert('At least one chapter is required');
    
    // Check if chapters have topics
    for (const chap of chapters) {
      if (!chap.title.trim()) return alert('Chapter titles are required');
      if (chap.topics.length === 0) return alert('Each chapter must have at least one topic');
      for (const topic of chap.topics) {
        if (!topic.title.trim()) return alert('Topic titles are required');
      }
    }

    const newCourse: Course = {
      id: courseId || `course_${Date.now()}`,
      name: courseName,
      description,
      chapters
    };

    try {
      if (courseId) {
        await updateCourse(courseId, newCourse);
        alert('Course updated successfully!');
      } else {
        await addCourse(newCourse);
        alert('Course created successfully!');
      }
      
      navigate('/courses');
    } catch (err) {
      alert('Failed to save course to database!');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <BookOpen className="text-primary" />
          {courseId ? 'Edit Course' : 'Course Builder'}
        </h1>
        <p className="mt-2 text-slate-500">
          {courseId ? 'Modify the existing curriculum.' : 'Design the curriculum structure and define timelines.'}
        </p>
      </div>

      <div className="glass rounded-3xl p-8 mb-8 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-slate-50"
              placeholder="e.g. Master React Native 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-slate-50"
              placeholder="Briefly describe the course goals..."
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Curriculum Structure</h2>
        <button
          onClick={addChapter}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={16} /> Add Chapter
        </button>
      </div>

      <div className="space-y-6 mb-8">
        {chapters.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl glass text-slate-500">
            No chapters added yet. Click 'Add Chapter' to start building.
          </div>
        ) : (
          chapters.map((chapter, cIdx) => (
            <div key={chapter.id} className="glass rounded-2xl shadow-sm overflow-hidden border border-slate-100">
              <div className="bg-slate-50 p-6 flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-100">
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {cIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Chapter Title"
                  />
                  <div className="relative w-32 shrink-0">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                       <Clock size={16} />
                     </div>
                     <input
                       type="number"
                       min="1"
                       value={chapter.durationDays}
                       onChange={(e) => updateChapter(chapter.id, 'durationDays', parseInt(e.target.value) || 0)}
                       className="w-full pl-10 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                       placeholder="Days"
                     />
                  </div>
                </div>
                <button
                  onClick={() => removeChapter(chapter.id)}
                  className="text-slate-400 hover:text-danger p-2 transition-colors self-end md:self-auto shrink-0"
                  title="Remove Chapter"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="p-6 bg-white/40">
                <div className="space-y-1 mb-4">
                  <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(chapter.id, e)}>
                    <SortableContext items={chapter.topics.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {chapter.topics.map((topic, tIdx) => (
                         <SortableTopicItem 
                           key={topic.id}
                           topic={topic}
                           chapterId={chapter.id}
                           cIdx={cIdx}
                           tIdx={tIdx}
                           updateTopic={updateTopic}
                           removeTopic={removeTopic}
                         />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
                
                <button
                  onClick={() => addTopic(chapter.id)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-blue-700 font-medium px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors ml-9"
                >
                  <Plus size={16} /> Add Topic
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-green-600 text-white rounded-xl shadow-lg shadow-success/30 font-bold transition-all transform hover:-translate-y-0.5"
        >
          <Save size={20} /> {courseId ? 'Update Course' : 'Save Course'}
        </button>
      </div>
    </div>
  );
};

export default CourseBuilder;
