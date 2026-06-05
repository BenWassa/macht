import { useState } from "react";
import { InjuryModal } from "@/modals/InjuryModal";
import type { ExerciseInjury } from "@/domain/types";
import { InjuryManager } from "./InjuryManager";
import { SettingsPanel } from "./SettingsPanel";
import { BackupPanel } from "./BackupPanel";
import { DangerZone } from "./DangerZone";
import { UpgradeNotesPanel } from "./UpgradeNotesPanel";

export function ProfileScreen() {
  const [editing, setEditing] = useState<ExerciseInjury | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Strength log
        </p>
        <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
          Profile
        </h1>
      </div>

      <InjuryManager
        onEdit={(injury) => {
          setEditing(injury);
          setShowModal(true);
        }}
        onAdd={() => {
          setEditing(null);
          setShowModal(true);
        }}
      />

      <UpgradeNotesPanel />

      <div className="space-y-0">
        <SettingsPanel />
        <BackupPanel />
      </div>

      <DangerZone />

      {showModal && (
        <InjuryModal injury={editing} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
