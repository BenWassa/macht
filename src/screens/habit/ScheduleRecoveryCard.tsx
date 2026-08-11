import { CalendarClock, CalendarPlus2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MissedSessionRecovery } from "@/domain/habit/types";

interface ScheduleRecoveryCardProps {
  recovery: MissedSessionRecovery;
  onTrainToday: () => void;
  onMoveForward: () => void;
  onSkip: () => void;
}

export function ScheduleRecoveryCard({
  recovery,
  onTrainToday,
  onMoveForward,
  onSkip,
}: ScheduleRecoveryCardProps) {
  return (
    <section className="rounded-lg bg-caution-soft p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-caution" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-text">Adjust the schedule</h2>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {recovery.sessionName} was planned for {recovery.plannedDate}. Choose what fits
            the week now; later sessions will keep their training order.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button onClick={onTrainToday}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Do today
        </Button>
        <Button variant="secondary" onClick={onMoveForward}>
          <CalendarPlus2 className="h-4 w-4" aria-hidden="true" />
          Move to {recovery.suggestedMoveDate.slice(5)}
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Skip this session
        </Button>
      </div>
    </section>
  );
}
