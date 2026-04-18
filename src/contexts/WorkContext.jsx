import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import * as api from '../api/novel';

const WorkContext = createContext(null);

export function WorkProvider({ children }) {
  const [works, setWorks] = useState([]);
  const [currentWorkId, setCurrentWorkId] = useState(null);
  const [currentWorkData, setCurrentWorkData] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentChapterVersion, setCurrentChapterVersion] = useState('default');
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [loadingWork, setLoadingWork] = useState(false);

  const refreshWorks = useCallback(async () => {
    setLoadingWorks(true);
    try {
      const data = await api.getWorks();
      setWorks(data.works || []);
    } finally {
      setLoadingWorks(false);
    }
  }, []);

  const loadWork = useCallback(async (workId) => {
    setLoadingWork(true);
    try {
      const data = await api.getWork(workId);
      setCurrentWorkId(workId);
      setCurrentWorkData(data);
      setCurrentChapterIndex(Math.max(0, (data.chapters?.length || 1) - 1));
      setCurrentChapterVersion('default');
      return data;
    } finally {
      setLoadingWork(false);
    }
  }, []);

  const refreshCurrentWork = useCallback(async () => {
    if (!currentWorkId) return;
    return loadWork(currentWorkId);
  }, [currentWorkId, loadWork]);

  const selectWork = useCallback(async (workId) => {
    return loadWork(workId);
  }, [loadWork]);

  const value = useMemo(() => ({
    works,
    currentWorkId,
    currentWorkData,
    currentChapterIndex,
    currentChapterVersion,
    loadingWorks,
    loadingWork,
    setWorks,
    setCurrentWorkId,
    setCurrentWorkData,
    setCurrentChapterIndex,
    setCurrentChapterVersion,
    refreshWorks,
    loadWork,
    refreshCurrentWork,
    selectWork,
  }), [
    works, currentWorkId, currentWorkData, currentChapterIndex, currentChapterVersion,
    loadingWorks, loadingWork, refreshWorks, loadWork, refreshCurrentWork, selectWork,
  ]);

  return (
    <WorkContext.Provider value={value}>
      {children}
    </WorkContext.Provider>
  );
}

export function useWork() {
  const ctx = useContext(WorkContext);
  if (!ctx) throw new Error('useWork must be used within WorkProvider');
  return ctx;
}
