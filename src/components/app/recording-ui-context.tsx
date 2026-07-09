"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface RecordingUIContextValue {
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
}

const RecordingUIContext = createContext<RecordingUIContextValue>({
  isRecording: false,
  setIsRecording: () => {},
});

export function RecordingUIProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  return (
    <RecordingUIContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingUIContext.Provider>
  );
}

export function useRecordingUI() {
  return useContext(RecordingUIContext);
}
