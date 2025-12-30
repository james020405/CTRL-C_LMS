import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfessorRoute from './components/auth/ProfessorRoute';
import AdminRoute from './components/auth/AdminRoute';
import { Loader2 } from 'lucide-react';

// Eagerly loaded (core routes - needed immediately)
import Landing from './views/Landing';
import Login from './views/Login';
import Register from './views/Register';
import ResetPassword from './views/ResetPassword';
import EmailConfirmed from './views/EmailConfirmed';
import StudentLayout from './components/layouts/StudentLayout';

// Lazy loaded - Heavy components (3D, games, complex features)
const SimulatorView = React.lazy(() => import('./views/student/SimulatorView'));
const StudentFlashcards = React.lazy(() => import('./views/student/StudentFlashcards'));
const FaultRoulette = React.lazy(() => import('./views/student/FaultRoulette'));
const ServiceWriter = React.lazy(() => import('./views/student/ServiceWriter'));
const CrossSystemDetective = React.lazy(() => import('./views/student/CrossSystemDetective'));
const ToolSelectionChallenge = React.lazy(() => import('./views/student/ToolSelectionChallenge'));
const SystemChainReaction = React.lazy(() => import('./views/student/SystemChainReaction'));
const TechnicianDetective = React.lazy(() => import('./views/student/TechnicianDetective'));

// Lazy loaded - Medium weight components
const ProfessorDashboard = React.lazy(() => import('./views/professor/Dashboard'));
const AdminDashboard = React.lazy(() => import('./views/admin/AdminDashboard'));
const StudentDashboard = React.lazy(() => import('./views/student/CourseDashboard'));
const SystemsExplorer = React.lazy(() => import('./views/student/SystemsExplorer'));
const StudyView = React.lazy(() => import('./views/student/StudyView'));
const StudentCourseView = React.lazy(() => import('./views/student/StudentCourseView'));
const ProgressDashboard = React.lazy(() => import('./views/student/ProgressDashboard'));
const Leaderboard = React.lazy(() => import('./views/student/Leaderboard'));
const ProfileSettings = React.lazy(() => import('./views/student/ProfileSettings'));
const GamesHub = React.lazy(() => import('./views/student/GamesHub'));
const StudentActivities = React.lazy(() => import('./views/student/StudentActivities'));

/**
 * Loading fallback component for lazy-loaded routes
 */
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/email-confirmed" element={<EmailConfirmed />} />
                            <Route element={<ProtectedRoute />}>
                                <Route element={<ProfessorRoute />}>
                                    <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
                                </Route>
                                <Route element={<AdminRoute />}>
                                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                </Route>
                            </Route>

                            {/* Protected Student Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/student" element={<StudentLayout />}>
                                    <Route path="dashboard" element={<StudentDashboard />} />
                                    <Route path="course/:courseId" element={<StudentCourseView />} />
                                    <Route path="systems" element={<SystemsExplorer />} />
                                    <Route path="study" element={<StudyView />} />
                                    <Route path="simulator" element={<SimulatorView />} />
                                    <Route path="flashcards" element={<StudentFlashcards />} />
                                    <Route path="games" element={<GamesHub />} />
                                    <Route path="roulette" element={<FaultRoulette />} />
                                    <Route path="service-writer" element={<ServiceWriter />} />
                                    <Route path="cross-system" element={<CrossSystemDetective />} />
                                    <Route path="tool-selection" element={<ToolSelectionChallenge />} />
                                    <Route path="chain-reaction" element={<SystemChainReaction />} />
                                    <Route path="technician-detective" element={<TechnicianDetective />} />
                                    <Route path="progress" element={<ProgressDashboard />} />
                                    <Route path="leaderboard" element={<Leaderboard />} />
                                    <Route path="profile" element={<ProfileSettings />} />
                                    <Route path="course/:courseId/activities" element={<StudentActivities />} />
                                </Route>
                            </Route>
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;

