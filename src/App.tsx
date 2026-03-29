
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseBuilder from './pages/CourseBuilder';
import BatchManager from './pages/BatchManager';
import BatchDetails from './pages/BatchDetails';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<CourseList />} />
              <Route path="courses/new" element={<CourseBuilder />} />
              <Route path="courses/:courseId/edit" element={<CourseBuilder />} />
              <Route path="batches" element={<BatchManager />} />
              <Route path="batches/:batchId" element={<BatchDetails />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
