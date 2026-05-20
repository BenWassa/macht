import { Check, Minus, Plus } from 'lucide-react';
import type { SetEntry } from '@/domain/types';

interface SetRowProps {
  set: SetEntry;
  index: number;
  selected: boolean;
  effortLabel: string;
  onSelect: () => void;
  onToggleComplete: () => void;
  onUpdate: <K extends keyof SetEntry>(field: K, value: SetEntry[K]) => void;
}

export function SetRow({ set, index, selected, effortLabel, onSelect, onToggleComplete, onUpdate }: SetRowProps) {
  const nudge = (field: 'weight' | 'reps', amount: number) => {
    const next = Math.max(0, Number(set[field]) + amount);
    onUpdate(field, next);
  };

  return (
    <div
      onClick={onSelect}
      className={`grid grid-cols-[34px_1fr_1fr_1fr_36px] items-center gap-2 border p-2 transition ${
        selected ? 'border-blue-900 bg-blue-950/10' : 'border-[#1a1a1a] bg-[#0c0c0c]'
      }`}
    >
      <span className="text-center text-[10px] font-mono text-neutral-500">{index + 1}</span>
      <div className="flex items-center justify-center gap-1">
        <button aria-label="Decrease weight" onClick={(event) => { event.stopPropagation(); nudge('weight', -5); }} className="text-neutral-600 hover:text-neutral-200"><Minus className="h-3 w-3" /></button>
        <input
          value={set.weight}
          onChange={(event) => onUpdate('weight', Number(event.target.value) || 0)}
          className="w-12 border border-[#1a1a1a] bg-black py-1 text-center text-xs text-neutral-200 outline-none focus:border-blue-500"
        />
        <button aria-label="Increase weight" onClick={(event) => { event.stopPropagation(); nudge('weight', 5); }} className="text-neutral-600 hover:text-neutral-200"><Plus className="h-3 w-3" /></button>
      </div>
      <div className="flex items-center justify-center gap-1">
        <button aria-label="Decrease reps" onClick={(event) => { event.stopPropagation(); nudge('reps', -1); }} className="text-neutral-600 hover:text-neutral-200"><Minus className="h-3 w-3" /></button>
        <input
          value={set.reps}
          onChange={(event) => onUpdate('reps', Number(event.target.value) || 0)}
          className="w-10 border border-[#1a1a1a] bg-black py-1 text-center text-xs text-neutral-200 outline-none focus:border-blue-500"
        />
        <button aria-label="Increase reps" onClick={(event) => { event.stopPropagation(); nudge('reps', 1); }} className="text-neutral-600 hover:text-neutral-200"><Plus className="h-3 w-3" /></button>
      </div>
      <select
        value={set.rpe ?? ''}
        onChange={(event) => onUpdate('rpe', event.target.value ? Number(event.target.value) : null)}
        className="border border-[#1a1a1a] bg-black py-1 text-center text-[10px] text-neutral-300 outline-none"
      >
        <option value="">{effortLabel}</option>
        {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <button
        aria-label="Toggle set complete"
        onClick={(event) => { event.stopPropagation(); onToggleComplete(); }}
        className={`flex h-8 w-8 items-center justify-center border ${
          set.completed ? 'border-emerald-700 bg-emerald-950/40 text-emerald-400' : 'border-[#222] bg-black text-neutral-600'
        }`}
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}
