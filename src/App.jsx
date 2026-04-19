import { Routes, Route } from 'react-router-dom';
import { WorkProvider } from './contexts/WorkContext';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/Layout';
import { CreatePage } from './pages/CreatePage';
import { TryCreatePage } from './pages/TryCreatePage';
import { WorksPage } from './pages/WorksPage';
import { EvolvePage } from './pages/EvolvePage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { GuidePage } from './pages/GuidePage';

function App() {
  return (
    <WorkProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CreatePage />} />
            <Route path="create" element={<CreatePage />} />
            <Route path="try-create" element={<TryCreatePage />} />
            <Route path="works" element={<WorksPage />} />
            <Route path="works/:workId" element={<WorksPage />} />
            <Route path="evolve" element={<EvolvePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="guide" element={<GuidePage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </WorkProvider>
  );
}

export default App;
