import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";

interface RecordingItem {
  id: string;
  name: string;
  url: string;
  duration: number;
}

export function AudioStudioApp() {
  const { getUserStorageItem, setUserStorageItem, currentUser } = useUser();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const saved = getUserStorageItem("audio_studio_clips");
    if (saved) {
      try {
        setRecordings(JSON.parse(saved));
      } catch {
        setRecordings([]);
      }
    } else {
      setRecordings([]);
    }
  }, [currentUser]);

  const saveClips = (items: RecordingItem[]) => {
    setRecordings(items);
    setUserStorageItem("audio_studio_clips", JSON.stringify(items));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const newClip: RecordingItem = {
            id: crypto.randomUUID(),
            name: `Clip_${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
            url: base64Data,
            duration: recordingTime,
          };
          saveClips([newClip, ...recordings]);
        };
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      alert("Microphone access is required or unavailable in this environment.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = (id: string) => {
    saveClips(recordings.filter((r) => r.id !== id));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "8px",
        gap: "8px",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "inherit",
      }}
    >
      <div
        className="outset-border"
        style={{
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong style={{ fontSize: "14px" }}>Sound Recorder & Audio Pad</strong>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>
            Status: {isRecording ? `🎙️ Recording (${recordingTime}s)...` : "Idle"}
          </div>
        </div>
        <div>
          {!isRecording ? (
            <button type="button" onClick={startRecording} style={{ fontWeight: "bold", color: "red" }}>
              🔴 Record
            </button>
          ) : (
            <button type="button" onClick={stopRecording} style={{ fontWeight: "bold" }}>
              ⏹️ Stop
            </button>
          )}
        </div>
      </div>

      <div
        className="inset-border"
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          overflowY: "auto",
          padding: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {recordings.map((rec) => (
          <div
            key={rec.id}
            style={{
              padding: "6px",
              backgroundColor: "#f9f9f9",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div>
              <strong style={{ fontSize: "12px", color: "#000" }}>{rec.name}</strong>
              <div style={{ fontSize: "10px", color: "#666" }}>Duration: {rec.duration}s</div>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <audio controls src={rec.url} style={{ height: "28px" }} />
              <button type="button" onClick={() => deleteRecording(rec.id)} style={{ fontSize: "10px" }}>
                ✕
              </button>
            </div>
          </div>
        ))}
        {recordings.length === 0 && (
          <div style={{ color: "#808080", padding: "12px", textAlign: "center", fontSize: "11px" }}>
            No saved audio recordings for active user profile.
          </div>
        )}
      </div>
    </div>
  );
}
