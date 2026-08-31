import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import * as api from '../api/novel';
import type { Work } from '../types';

export interface WorkContextValue {
  works: Work[];
  currentWorkId: string | null;
  currentWorkData: Work | null;
  currentChapterIndex: number;
  currentChapterVersion: string;
  loadingWorks: boolean;
  loadingWork: boolean;
  setWorks: React.Dispatch<React.SetStateAction<Work[]>>;
  setCurrentWorkId: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentWorkData: React.Dispatch<React.SetStateAction<Work | null>>;
  setCurrentChapterIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentChapterVersion: React.Dispatch<React.SetStateAction<string>>;
  refreshWorks: () => Promise<void>;
  loadWork: (workId: string) => Promise<Work>;
  refreshCurrentWork: () => Promise<Work | undefined>;
  selectWork: (workId: string) => Promise<Work>;
}

const WorkContext = createContext<WorkContextValue | null>(null);

export function WorkProvider({ children }: { children: ReactNode }) {
  const [works, setWorks] = useState<Work[]>([]);
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [currentWorkData, setCurrentWorkData] = useState<Work | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentChapterVersion, setCurrentChapterVersion] = useState<string>('default');
  const [loadingWorks, setLoadingWorks] = useState<boolean>(false);
  const [loadingWork, setLoadingWork] = useState<boolean>(false);

  const refreshWorks = useCallback(async () => {
    setLoadingWorks(true);
    try {
      const data = await api.getWorks();
      setWorks(data.works || []);
    } finally {
      setLoadingWorks(false);
    }
  }, []);

  const loadWork = useCallback(async (workId: string) => {
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

  const selectWork = useCallback(async (workId: string) => {
    return loadWork(workId);
  }, [loadWork]);

  const value = useMemo<WorkContextValue>(() => ({
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

export function useWork(): WorkContextValue {
  const ctx = useContext(WorkContext);
  if (!ctx) throw new Error('useWork must be used within WorkProvider');
  return ctx;
}
