import { Button } from "@/components/ui/Button";
import { useModalA11y } from "@/hooks/useModalA11y";

interface CycleStartConfirmModalProps {
  currentCycleName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function CycleStartConfirmModal({
  currentCycleName,
  onConfirm,
  onClose,
}: CycleStartConfirmModalProps) {
  const containerRef = useModalA11y<HTMLDivElement>(onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cycle-confirm-dialog-title"
        className="surface-raised w-full max-w-sm p-5"
      >
        <h3
          id="cycle-confirm-dialog-title"
          className="text-xl font-bold tracking-[-0.03em] text-text"
        >
          Start a new cycle?
        </h3>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {currentCycleName} still has planned sessions. Starting a new cycle will archive
          its remaining schedule. Completed workouts and existing records stay intact.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onClose}>
            Keep current
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Start new cycle
          </Button>
        </div>
      </div>
    </div>
  );
}
