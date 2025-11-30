import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './views/Landing';
import ProfessorDashboard from './views/professor/Dashboard';
import StudentDashboard from './views/student/CourseDashboard';
import SystemsExplorer from './views/student/SystemsExplorer';
import StudyView from './views/student/StudyView';
import StudentLayout from './components/layouts/StudentLayout';
import SimulatorView from './views/student/SimulatorView';
import DiagnosticTraining from './views/student/DiagnosticTraining';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/professor/dashboard" element={<ProfessorDashboard />} />

                {/* Student Routes with Sidebar Layout */}
                <Route path="/student" element={<StudentLayout />}>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="systems" element={<SystemsExplorer />} />
                    <Route path="study" element={<StudyView />} />
                    <Route path="simulator" element={<SimulatorView />} />
                    <Route path="diagnostics" element={<DiagnosticTraining />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
