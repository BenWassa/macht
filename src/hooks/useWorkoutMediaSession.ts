import { useEffect, useRef } from "react";
import { useWorkoutStore } from "@/state/useWorkoutStore";

function buildSilentWavSrc(): string {
  // Minimal 1-second silent WAV at 8kHz mono 16-bit
  const rate = 8000;
  const numSamples = rate;
  const buf = new ArrayBuffer(44 + numSamples * 2);
  const v = new DataView(buf);
  const str = (offset: number, s: string) =>
    [...s].forEach((c, i) => v.setUint8(offset + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + numSamples * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, numSamples * 2, true);
  // samples remain 0 (silence)
  const bytes = new Uint8Array(buf);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return "data:audio/wav;base64," + btoa(binary);
}

let silentSrc: string | null = null;
function getSilentSrc(): string {
  if (!silentSrc) silentSrc = buildSilentWavSrc();
  return silentSrc;
}

export function useWorkoutMediaSession(workoutName: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const audio = new Audio(getSilentSrc());
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    void audio.play().catch(() => {
      // Autoplay blocked — media session controls won't appear on lock screen
      // until the user interacts with the page (e.g. starts a set).
    });

    navigator.mediaSession.metadata = new MediaMetadata({
      title: workoutName,
      artist: "Macht",
      album: "Active session",
    });

    const markSetDone = () => {
      const store = useWorkoutStore.getState();
      const exerciseId = store.activeWorkoutList[store.selectedExIndex];
      if (!exerciseId) return;
      const set = (store.workoutSets[exerciseId] ?? [])[store.selectedSetIndex];
      if (set && !set.completed) {
        store.toggleComplete(exerciseId, store.selectedSetIndex);
      }
    };

    const nextExercise = () => {
      const { activeWorkoutList, selectedExIndex, setSelectedExIndex } =
        useWorkoutStore.getState();
      if (selectedExIndex < activeWorkoutList.length - 1) {
        setSelectedExIndex(selectedExIndex + 1);
      }
    };

    const prevExercise = () => {
      const { selectedExIndex, setSelectedExIndex } = useWorkoutStore.getState();
      if (selectedExIndex > 0) setSelectedExIndex(selectedExIndex - 1);
    };

    navigator.mediaSession.setActionHandler("play", markSetDone);
    navigator.mediaSession.setActionHandler("pause", markSetDone);
    navigator.mediaSession.setActionHandler("nexttrack", nextExercise);
    navigator.mediaSession.setActionHandler("previoustrack", prevExercise);

    return () => {
      audio.pause();
      audioRef.current = null;
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [workoutName]);
}
