import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/toast';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { BottomNavigationContainer } from './components/layout/BottomNavigation';
import { HomePage } from './pages/HomePage';
import { LessonsPage } from './pages/LessonsPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddLessonPage } from './pages/AddLessonPage';
import { TestIOSBottomBar } from './pages/TestIOSBottomBar';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/lessons" element={<LessonsPage />} />
                <Route path="/add" element={<AddLessonPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/test-ios-bottom" element={<TestIOSBottomBar />} />
              </Routes>
              <BottomNavigationContainer />
              <PWAInstallPrompt />
            </AppLayout>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
