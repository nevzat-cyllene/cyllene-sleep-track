"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface RecordingUIContextValue {
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
}

const RecordingUIContext = createContext<RecordingUIContextValue>({
  isRecording: false,
  setIsRecording: () => {},
});

export function RecordingUIProvider({ children }: { children: ReactNode }) {
  const [isRecording, setRecordingState] = useState(false);

  const setIsRecording = useCallback((value: boolean) => {
    setRecordingState(value);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cyllene:recording-ui", { detail: value }));
    }
  }, []);

  return (
    <RecordingUIContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingUIContext.Provider>
  );
}

export function useRecordingUI() {
  return useContext(RecordingUIContext);
}
