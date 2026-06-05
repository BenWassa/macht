import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useUpgradeStore } from "@/state/useUpgradeStore";

export function UpgradeNotesPanel() {
  const items = useUpgradeStore((state) => state.items);
  const addItem = useUpgradeStore((state) => state.addItem);
  const toggleItem = useUpgradeStore((state) => state.toggleItem);
  const deleteItem = useUpgradeStore((state) => state.deleteItem);
  const [text, setText] = useState("");

  const submit = () => {
    if (!addItem(text)) return;
    setText("");
  };

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
        Upgrade notes
      </h2>
      <div className="border border-[#1a1a1a] bg-[#0c0c0c]">
        <div className="flex gap-2 border-b border-[#1a1a1a] p-4">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            placeholder="Add upgrade"
            className="min-w-0 flex-1 border border-edge bg-black px-3 py-2 font-mono text-xs uppercase tracking-wide text-neutral-200 placeholder:text-neutral-600 focus:border-blue-800 focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            aria-label="Add upgrade note"
            className="border border-[#222] bg-blue-600 px-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="p-4 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            No upgrade notes
          </p>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-pressed={item.completed}
                  aria-label="Toggle upgrade note"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center border transition ${
                    item.completed
                      ? "border-emerald-700 bg-emerald-950 text-emerald-300"
                      : "border-[#222] bg-black text-neutral-600 hover:text-neutral-300"
                  }`}
                >
                  {item.completed && <Check className="h-3.5 w-3.5" />}
                </button>
                <p
                  className={`min-w-0 flex-1 break-words font-mono text-[11px] uppercase tracking-wide ${
                    item.completed
                      ? "text-neutral-600 line-through"
                      : "text-neutral-300"
                  }`}
                >
                  {item.text}
                </p>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  aria-label="Delete upgrade note"
                  className="p-2 text-neutral-600 transition hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
