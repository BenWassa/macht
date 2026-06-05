import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useHistoryStore } from "@/state/useHistoryStore";
import type { SessionLog } from "@/domain/types";
import { formatWorkoutName } from "@/lib/format";

interface ActivityHistoryProps {
  sessions: SessionLog[];
  onStart: () => void;
}

export function ActivityHistory({ sessions, onStart }: ActivityHistoryProps) {
  const deleteSession = useHistoryStore((state) => state.deleteSession);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function handleSwipe(id: string) {
    setPendingDelete(id);
  }

  function handleConfirmDelete(id: string) {
    deleteSession(id);
    setPendingDelete(null);
  }

  function handleCancel() {
    setPendingDelete(null);
  }

  return (
    <div>
      <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
        Activity history
      </h2>
      <div className="border-t border-edge overflow-hidden">
        {sessions.length === 0 && (
          <button
            onClick={onStart}
            className="mt-4 w-full border border-dashed border-edge bg-well p-6 text-center font-mono text-[11px] uppercase tracking-widest text-neutral-500 transition hover:border-[#252525] hover:bg-canvas hover:text-neutral-400 active:bg-[#111]"
          >
            No sessions yet. Start your first session.
          </button>
        )}
        <AnimatePresence initial={false}>
          {sessions.slice(0, 6).map((session) => {
            const isConfirming = pendingDelete === session.id;
            return (
              <motion.div
                key={session.id}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "linear" }}
                className="relative group border-b border-edge bg-red-600"
              >
                {/* Delete Action Background */}
                <div className="absolute inset-0 flex items-center justify-end">
                  {isConfirming ? (
                    <div className="flex h-full items-center gap-0">
                      <button
                        onClick={handleCancel}
                        className="h-full px-5 font-mono text-[10px] uppercase tracking-wider text-white/70 bg-neutral-700 hover:bg-neutral-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(session.id)}
                        className="h-full px-5 font-mono text-[10px] uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end px-6 text-white pointer-events-none">
                      <Trash2 className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Swipable Card Body */}
                <motion.div
                  drag="x"
                  dragConstraints={{
                    left: isConfirming ? -160 : -100,
                    right: 0,
                  }}
                  dragElastic={0.05}
                  animate={{ x: isConfirming ? -160 : 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) {
                      handleSwipe(session.id);
                    } else if (isConfirming && info.offset.x > 40) {
                      handleCancel();
                    }
                  }}
                  className="relative flex items-center justify-between bg-[#060606] py-3 cursor-grab active:cursor-grabbing"
                >
                  <div>
                    <p className="font-mono text-sm font-bold uppercase text-neutral-200">
                      {formatWorkoutName(session.template)}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                      {session.date} · {session.duration} · {session.sets} sets
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-neutral-300">
                      {session.volume.toLocaleString()}{" "}
                      <span className="font-mono text-[10px] text-neutral-500">
                        lbs
                      </span>
                    </p>
                    {session.adapted && (
                      <span className="mt-0.5 block font-mono text-[10px] uppercase text-blue-400">
                        Adapted
                      </span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
