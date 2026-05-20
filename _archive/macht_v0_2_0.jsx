import React, { useState, useEffect } from 'react';
import {
  Home,
  Clipboard,
  TrendingUp,
  User,
  Plus,
  Minus,
  Play,
  Timer,
  Check,
  AlertTriangle,
  ChevronRight,
  X,
  RotateCcw,
  Trash2,
  Calendar,
  Activity,
} from 'lucide-react';

// ==========================================
// EXERCISE LIBRARY
// ==========================================

const EXERCISE_LIBRARY = [
  { id: 'squat',              name: 'Barbell Back Squat',         target: 'Quads / Glutes',      tags: ['knee', 'lower_back'] },
  { id: 'deadlift',           name: 'Conventional Deadlift',      target: 'Posterior chain',     tags: ['lower_back', 'grip'] },
  { id: 'romanian_deadlift',  name: 'Romanian Deadlift',          target: 'Hamstrings / Glutes', tags: ['lower_back'] },
  { id: 'bench_press',        name: 'Flat Barbell Bench Press',   target: 'Chest / Triceps',     tags: ['shoulder', 'deep_rom', 'posterior_labrum', 'anterior_labrum'] },
  { id: 'overhead_press',     name: 'Overhead Barbell Press',     target: 'Shoulders / Triceps', tags: ['shoulder', 'posterior_labrum', 'cervical_spine'] },
  { id: 'neutral_db_press',   name: 'Neutral Grip DB Press',      target: 'Chest / Triceps',     tags: [] },
  { id: 'incline_db_press',   name: 'Incline Dumbbell Press',     target: 'Upper chest',         tags: ['shoulder', 'deep_rom'] },
  { id: 'lat_pulldown_front', name: 'Front Lat Pulldown',         target: 'Lats / Upper back',   tags: [] },
  { id: 'lat_pulldown_behind',name: 'Behind Neck Lat Pulldown',   target: 'Lats',                tags: ['shoulder', 'posterior_labrum', 'deep_rom'] },
  { id: 'chest_supported_row',name: 'Chest-Supported Row',        target: 'Upper back',          tags: [] },
  { id: 'barbell_row',        name: 'Barbell Bent-Over Row',      target: 'Back / Grip',         tags: ['lower_back'] },
  { id: 'dumbbell_row',       name: 'One-Arm Dumbbell Row',       target: 'Lats / Back',         tags: [] },
  { id: 'cable_lateral_raise',name: 'Cable Lateral Raise',        target: 'Lateral delts',       tags: [] },
  { id: 'face_pull',          name: 'Cable Face Pull',            target: 'Rear delts / Rotator',tags: [] },
  { id: 'chin_up',            name: 'Chin-Up',                    target: 'Lats / Biceps',       tags: ['elbow'] },
  { id: 'pull_up',            name: 'Pull-Up',                    target: 'Lats / Back',         tags: ['shoulder', 'posterior_labrum'] },
  { id: 'dip',                name: 'Chest Dip',                  target: 'Chest / Triceps',     tags: ['shoulder', 'anterior_labrum', 'deep_rom'] },
  { id: 'leg_press',          name: 'Leg Press',                  target: 'Quads',               tags: ['knee'] },
  { id: 'leg_extension',      name: 'Leg Extension',              target: 'Quads',               tags: ['knee'] },
  { id: 'leg_curl',           name: 'Lying Leg Curl',             target: 'Hamstrings',          tags: [] },
  { id: 'tricep_pushdown',    name: 'Tricep Pushdown',            target: 'Triceps',             tags: [] },
];

// ==========================================
// INITIAL DATA
// ==========================================

const INITIAL_INJURIES = [
  {
    id: 'labrum_left',
    name: 'Left Posterior Labrum',
    severity: 'avoid',
    forbiddenTags: ['posterior_labrum', 'deep_rom'],
    notes: 'Avoid extreme external rotation under load. Limit pressing ROM to neutral profiles. MRI pending.',
  }
];

const MOCK_HISTORY = [
  { id: '1', date: '2026-05-18', template: 'PPL — Pull',         duration: '48m', volume: 12450, sets: 14, adapted: false },
  { id: '2', date: '2026-05-16', template: 'PPL — Push (adapted)',duration: '41m', volume: 9800,  sets: 12, adapted: true  },
  { id: '3', date: '2026-05-13', template: 'PPL — Legs',          duration: '52m', volume: 15400, sets: 15, adapted: false },
  { id: '4', date: '2026-05-10', template: 'PPL — Pull',          duration: '45m', volume: 11900, sets: 13, adapted: false },
  { id: '5', date: '2026-05-08', template: 'PPL — Push (adapted)',duration: '39m', volume: 9450,  sets: 12, adapted: true  },
];

const WEEK_CONSISTENCY = [
  { week: '5W', count: 3, restricted: false, note: '' },
  { week: '4W', count: 4, restricted: false, note: '' },
  { week: '3W', count: 1, restricted: true,  note: 'Flare-up' },
  { week: '2W', count: 0, restricted: true,  note: 'Rest' },
  { week: '1W', count: 3, restricted: false, note: 'Return' },
  { week: 'NOW', count: 4, restricted: false, note: '' },
];

const PROGRESS_LIFTS = {
  squat: {
    name: 'Back Squat',
    current: 345,
    allTime: 345,
    delta6Wk: 20,
    paused: false,
    history: [315, 318, 320, 322, 320, 325, 328, 330, 332, 335, 340, 345],
  },
  deadlift: {
    name: 'Conventional Deadlift',
    current: 435,
    allTime: 435,
    delta6Wk: 30,
    paused: false,
    history: [405, 405, 410, 415, 415, 410, 418, 422, 425, 430, 432, 435],
  },
  bench: {
    name: 'Flat Barbell Bench Press',
    current: 265,
    allTime: 275,
    delta6Wk: 0,
    paused: true,
    pauseReason: 'Left posterior labrum — tracking suspended until cleared.',
    history: [255, 258, 260, 262, 265, 265, 265, 265, 265, 265, 265, 265],
  },
};

const DEFAULT_TEMPLATE = {
  name: 'PPL — Push (adapted)',
  notes: 'Bench press and overhead press substituted. Movement patterns adjusted to protect left posterior shoulder.',
  exercises: ['neutral_db_press', 'incline_db_press', 'cable_lateral_raise', 'tricep_pushdown'],
};

// ==========================================
// PLATE CALCULATOR
// ==========================================

const PLATE_DATA_LBS = {
  45:  { h: 64, w: 18, bg: '#dc2626', color: '#fff',     label: '45' },
  35:  { h: 56, w: 16, bg: '#2563eb', color: '#fff',     label: '35' },
  25:  { h: 48, w: 14, bg: '#ca8a04', color: '#000',     label: '25' },
  10:  { h: 40, w: 12, bg: '#16a34a', color: '#fff',     label: '10' },
  5:   { h: 32, w: 10, bg: '#737373', color: '#fff',     label: '5'  },
  2.5: { h: 24, w: 8,  bg: '#3a3a3a', color: '#a3a3a3', label: '2.5'},
};

const PLATE_DATA_KGS = {
  25:   { h: 64, w: 18, bg: '#dc2626', color: '#fff',     label: '25'   },
  20:   { h: 56, w: 16, bg: '#2563eb', color: '#fff',     label: '20'   },
  15:   { h: 48, w: 14, bg: '#ca8a04', color: '#000',     label: '15'   },
  10:   { h: 40, w: 12, bg: '#16a34a', color: '#fff',     label: '10'   },
  5:    { h: 32, w: 10, bg: '#737373', color: '#fff',     label: '5'    },
  2.5:  { h: 24, w: 8,  bg: '#3a3a3a', color: '#a3a3a3', label: '2.5'  },
  1.25: { h: 18, w: 6,  bg: '#1a1a1a', color: '#6b6b6b', label: '1.25' },
};

function getPlates(weight, units = 'lbs') {
  const barWeight = units === 'lbs' ? 45 : 20;
  let remaining = (weight - barWeight) / 2;
  if (remaining <= 0) return [];
  const denoms = units === 'lbs'
    ? [45, 35, 25, 10, 5, 2.5]
    : [25, 20, 15, 10, 5, 2.5, 1.25];
  const result = [];
  for (const d of denoms) {
    while (remaining >= d - 0.01) {
      result.push(d);
      remaining -= d;
    }
  }
  return result;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [settings, setSettings] = useState({
    units: 'lbs',
    defaultRest: 90,
    rpeMode: 'RPE',
  });

  const [injuries, setInjuries]   = useState(INITIAL_INJURIES);
  const [history, setHistory]     = useState(MOCK_HISTORY);

  // Workout state
  const [workoutActive, setWorkoutActive]     = useState(true);
  const [workoutName, setWorkoutName]         = useState('PPL — Push (adapted)');
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [selectedExIndex, setSelectedExIndex] = useState(0);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [isMinimumSession, setIsMinimumSession] = useState(false);

  const [workoutSets, setWorkoutSets] = useState({
    neutral_db_press: [
      { id: 1, weight: 80, reps: 8, rpe: 8,   completed: true,  last: '80 × 8 @ RPE 8' },
      { id: 2, weight: 80, reps: 8, rpe: null, completed: false, last: '80 × 8 @ RPE 8' },
      { id: 3, weight: 80, reps: 7, rpe: null, completed: false, last: '75 × 8 @ RPE 7' },
    ],
    incline_db_press: [
      { id: 1, weight: 70, reps: 10, rpe: null, completed: false, last: '70 × 10 @ RPE 8'   },
      { id: 2, weight: 70, reps: 9,  rpe: null, completed: false, last: '70 × 9 @ RPE 8.5'  },
      { id: 3, weight: 65, reps: 10, rpe: null, completed: false, last: '65 × 10 @ RPE 7.5' },
    ],
    cable_lateral_raise: [
      { id: 1, weight: 25, reps: 15, rpe: null, completed: false, last: '25 × 15 @ RPE 8'   },
      { id: 2, weight: 25, reps: 14, rpe: null, completed: false, last: '25 × 14 @ RPE 8'   },
      { id: 3, weight: 20, reps: 15, rpe: null, completed: false, last: '20 × 15 @ RPE 7.5' },
    ],
    tricep_pushdown: [
      { id: 1, weight: 60, reps: 12, rpe: null, completed: false, last: '60 × 12 @ RPE 8'   },
      { id: 2, weight: 60, reps: 12, rpe: null, completed: false, last: '60 × 12 @ RPE 8'   },
      { id: 3, weight: 60, reps: 10, rpe: null, completed: false, last: '55 × 12 @ RPE 8.5' },
    ],
  });

  const [activeWorkoutList, setActiveWorkoutList] = useState([
    'neutral_db_press',
    'incline_db_press',
    'cable_lateral_raise',
    'tricep_pushdown',
  ]);

  // Timers
  const [restSeconds, setRestSeconds]     = useState(90);
  const [restRunning, setRestRunning]     = useState(false);
  const [showRestBanner, setShowRestBanner] = useState(false);

  // Modals
  const [showInjuryModal, setShowInjuryModal]           = useState(false);
  const [injuryForm, setInjuryForm]                     = useState({ name: '', severity: 'avoid', forbiddenTags: [], notes: '' });
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);

  // Session clock
  useEffect(() => {
    if (!workoutActive) return;
    const interval = setInterval(() => setWorkoutDuration(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [workoutActive]);

  // Rest timer
  useEffect(() => {
    if (!restRunning || restSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestSeconds(p => {
        if (p <= 1) { setRestRunning(false); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restRunning, restSeconds]);

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getExerciseConflict = (exId) => {
    const exercise = EXERCISE_LIBRARY.find(e => e.id === exId);
    if (!exercise) return null;
    for (const injury of injuries) {
      const hits = exercise.tags.filter(t => injury.forbiddenTags.includes(t));
      if (hits.length > 0) {
        return { injury: injury.name, tags: hits, severity: injury.severity, alternative: getAlternativeFor(exId) };
      }
    }
    return null;
  };

  const getAlternativeFor = (exId) => {
    const map = {
      bench_press:        'neutral_db_press',
      lat_pulldown_behind:'lat_pulldown_front',
      overhead_press:     'neutral_db_press',
      pull_up:            'lat_pulldown_front',
      dip:                'tricep_pushdown',
    };
    return map[exId] || null;
  };

  const handleToggleComplete = (exId, setIdx) => {
    const updated = { ...workoutSets };
    const wasDone = updated[exId][setIdx].completed;
    updated[exId][setIdx].completed = !wasDone;
    setWorkoutSets(updated);
    if (!wasDone) {
      setRestSeconds(settings.defaultRest);
      setRestRunning(true);
      setShowRestBanner(true);
    }
  };

  const updateSetField = (exId, setIdx, field, val) => {
    const updated = { ...workoutSets };
    updated[exId][setIdx][field] = val;
    setWorkoutSets(updated);
  };

  const handleTweak = (field, amount) => {
    const exId = activeWorkoutList[selectedExIndex];
    const cur  = parseFloat(workoutSets[exId][selectedSetIndex][field]) || 0;
    const next = Math.max(0, cur + amount);
    updateSetField(exId, selectedSetIndex, field, Number.isInteger(next) ? next : parseFloat(next.toFixed(1)));
  };

  const handleSetRpe = (val) => {
    const exId = activeWorkoutList[selectedExIndex];
    updateSetField(exId, selectedSetIndex, 'rpe', val);
  };

  const startTemplate = () => {
    setWorkoutActive(true);
    setWorkoutDuration(0);
    setSelectedExIndex(0);
    setSelectedSetIndex(0);
    setActiveTab('workout');
  };

  const saveWorkout = () => {
    const totalSets = activeWorkoutList.reduce((acc, exId) =>
      acc + (workoutSets[exId]?.filter(s => s.completed).length || 0), 0);
    const volume = activeWorkoutList.reduce((acc, exId) => {
      const done = workoutSets[exId]?.filter(s => s.completed) || [];
      return acc + done.reduce((s, set) => s + set.weight * set.reps, 0);
    }, 0);
    setHistory([{
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      template: workoutName + (isMinimumSession ? ' (min)' : ''),
      duration: `${Math.floor(workoutDuration / 60)}m`,
      volume: volume || 0,
      sets: totalSets,
      adapted: injuries.length > 0,
    }, ...history]);
    setWorkoutActive(false);
    setWorkoutDuration(0);
    setIsMinimumSession(false);
    setShowConfirmFinishModal(false);
    setActiveTab('home');
  };

  const substituteExercise = (targetId, subId) => {
    const newList = [...activeWorkoutList];
    const idx = newList.indexOf(targetId);
    if (idx !== -1) {
      newList[idx] = subId;
      setActiveWorkoutList(newList);
      setSelectedExIndex(idx);
      setSelectedSetIndex(0);
    }
  };

  const handleAddInjury = () => {
    if (!injuryForm.name) return;
    setInjuries([...injuries, {
      id: Date.now().toString(),
      name: injuryForm.name,
      severity: injuryForm.severity,
      forbiddenTags: injuryForm.forbiddenTags,
      notes: injuryForm.notes,
    }]);
    setShowInjuryModal(false);
    setInjuryForm({ name: '', severity: 'avoid', forbiddenTags: [], notes: '' });
  };

  const removeInjury = (id) => setInjuries(injuries.filter(i => i.id !== id));

  const toggleTagInForm = (tag) => {
    const tags = [...injuryForm.forbiddenTags];
    setInjuryForm({
      ...injuryForm,
      forbiddenTags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag],
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#060606] text-[#f0f0f0] flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">

      {/* HEADER */}
      <header className="border-b border-[#1a1a1a] bg-[#0c0c0c] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.28em] font-mono font-extrabold text-neutral-200">
            MACHT
          </span>
        </div>
        {workoutActive && (
          <button
            onClick={() => setActiveTab('workout')}
            className="flex items-center space-x-2 bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] px-3 py-1 rounded-none transition"
          >
            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-neutral-300 uppercase tracking-widest text-[9px] font-bold">
              {formatTime(workoutDuration)}
            </span>
          </button>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full pb-36">

        {/* ==========================================
            HOME
           ========================================== */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-[9px] text-neutral-500 tracking-widest uppercase font-mono mb-1">Strength log</p>
              <h1 className="text-xl font-bold tracking-tight uppercase font-mono">Consistency</h1>
            </div>

            {/* Six-week chart */}
            <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">Six weeks</span>
                <div className="flex space-x-3 text-[9px] font-mono">
                  <span className="flex items-center space-x-1.5">
                    <span className="h-1.5 w-1.5 bg-blue-500 inline-block" />
                    <span className="text-neutral-500 uppercase">Logged</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="h-1.5 w-1.5 bg-neutral-800 border-t border-red-500 inline-block" />
                    <span className="text-neutral-500 uppercase">Injury week</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 h-24 items-end border-b border-[#1a1a1a] pb-2 relative">
                <div className="absolute left-0 right-0 border-t border-dashed border-neutral-800" style={{ bottom: '33.3%' }}>
                  <span className="absolute -top-2 right-0 text-[8px] font-mono text-neutral-500 bg-[#0c0c0c] pl-1">Floor: 2</span>
                </div>
                <div className="absolute left-0 right-0 border-t border-[#1f1f1f]" style={{ bottom: '66.6%' }}>
                  <span className="absolute -top-2 right-0 text-[8px] font-mono text-neutral-500 bg-[#0c0c0c] pl-1">Stretch: 4</span>
                </div>
                {WEEK_CONSISTENCY.map((w, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-neutral-400 mb-1">{w.count}</span>
                    <div
                      className={`w-full rounded-none relative ${w.restricted ? 'bg-neutral-800 border-t border-red-500' : 'bg-blue-600'}`}
                      style={{ height: `${Math.max((w.count / 6) * 100, 6)}%` }}
                    >
                      {w.note && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-red-950 text-red-400 text-[8px] font-mono uppercase px-1 border border-red-900 mb-1 whitespace-nowrap">
                          {w.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2 pt-2 text-center">
                {WEEK_CONSISTENCY.map((w, idx) => (
                  <span key={idx} className="text-[9px] font-mono text-neutral-500 uppercase">{w.week}</span>
                ))}
              </div>
            </div>

            {/* Quick start */}
            <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest block mb-0.5">Next</span>
                <h3 className="text-xs font-bold uppercase tracking-tight">{DEFAULT_TEMPLATE.name}</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">{DEFAULT_TEMPLATE.notes}</p>
              </div>
              <button
                onClick={startTemplate}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-mono uppercase tracking-widest text-xs px-4 py-2.5 rounded-none font-bold transition"
              >
                {workoutActive ? 'Resume' : 'Start'}
              </button>
            </div>

            {/* Session history */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Recent sessions</h2>
              <div className="border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
                {history.map((log) => (
                  <div key={log.id} className="bg-[#0c0c0c] p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-neutral-400">{log.date}</span>
                        {log.adapted && (
                          <span className="text-[8px] bg-yellow-950 text-yellow-500 px-1 border border-yellow-900 font-mono tracking-wider">
                            Adapted
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-tight text-neutral-200 mt-1">{log.template}</h4>
                      <div className="flex space-x-3 text-[10px] font-mono text-neutral-500 mt-1">
                        <span>Vol. {log.volume.toLocaleString()} {settings.units}</span>
                        <span>{log.sets} sets</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-neutral-300">{log.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PLANS
           ========================================== */}
        {activeTab === 'templates' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-[9px] text-neutral-500 tracking-widest uppercase font-mono mb-1">Strength log</p>
              <h1 className="text-xl font-bold tracking-tight uppercase font-mono">Templates</h1>
            </div>

            <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 space-y-4">
              <div>
                <span className="text-[9px] border border-blue-500/50 text-blue-400 font-mono px-1.5 py-0.5 uppercase tracking-widest">
                  Injury-adapted
                </span>
                <h3 className="text-sm font-bold uppercase tracking-tight mt-2.5">{DEFAULT_TEMPLATE.name}</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">{DEFAULT_TEMPLATE.notes}</p>
              </div>

              <div className="bg-[#070707] border border-[#1a1a1a] p-3 divide-y divide-[#1a1a1a] divide-dashed">
                {DEFAULT_TEMPLATE.exercises.map((exId, idx) => {
                  const ex = EXERCISE_LIBRARY.find(e => e.id === exId);
                  return (
                    <div key={idx} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 mr-2">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="text-xs font-semibold uppercase tracking-tight text-neutral-300">{ex?.name}</span>
                      </div>
                      <span className="text-[9px] font-mono bg-[#121212] border border-[#1f1f1f] text-neutral-400 px-1.5 uppercase">
                        {ex?.target}
                      </span>
                    </div>
                  );
                })}
              </div>

              {injuries.length > 0 && (
                <div className="border-l-2 border-yellow-600 bg-yellow-950/10 p-3 text-xs flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-yellow-500 font-bold block">
                      Injury adjustments active
                    </span>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Substituted to protect <strong className="text-neutral-200">{injuries.map(i => i.name).join(', ')}</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={startTemplate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase tracking-widest py-3 font-bold rounded-none transition"
                >
                  Start session
                </button>
                <button className="sm:w-1/3 bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] text-neutral-300 font-mono text-[10px] uppercase tracking-widest py-3 transition rounded-none">
                  Edit
                </button>
              </div>
            </div>

            <div className="border border-dashed border-[#1a1a1a] p-8 text-center bg-[#080808]">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-4">No other templates</p>
              <button className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#1a1a1a] px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition text-neutral-300">
                + New template
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            SESSION (WORKOUT LOGGING)
           ========================================== */}
        {activeTab === 'workout' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Session header */}
            <div className="flex justify-between items-start border-b border-[#1a1a1a] pb-4">
              <div>
                <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest block mb-0.5">
                  {workoutActive ? 'In session' : 'Session ended'}
                </span>
                <h1 className="text-lg font-bold uppercase tracking-tight font-mono">{workoutName}</h1>
                <p className="text-xs text-neutral-500 mt-0.5 font-mono">{formatTime(workoutDuration)}</p>
              </div>
              <button
                onClick={() => setShowConfirmFinishModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono uppercase tracking-widest text-xs px-4 py-2 font-bold transition rounded-none"
              >
                End session
              </button>
            </div>

            {/* Minimum session toggle */}
            <div className="flex items-center justify-between bg-[#0c0c0c] border border-[#1a1a1a] px-4 py-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Minimum session</span>
                <p className="text-[10px] text-neutral-600 mt-0.5">Still counts toward consistency</p>
              </div>
              <button
                onClick={() => setIsMinimumSession(p => !p)}
                className={`w-10 h-5 rounded-full border transition-colors relative ${isMinimumSession ? 'bg-blue-600 border-blue-500' : 'bg-[#1a1a1a] border-[#333]'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${isMinimumSession ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Exercise selector tabs */}
            <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
              {activeWorkoutList.map((exId, idx) => {
                const ex = EXERCISE_LIBRARY.find(e => e.id === exId);
                const sets = workoutSets[exId] || [];
                const doneCount = sets.filter(s => s.completed).length;
                const isDone = sets.length > 0 && doneCount === sets.length;
                const isSelected = selectedExIndex === idx;
                return (
                  <button
                    key={exId}
                    onClick={() => { setSelectedExIndex(idx); setSelectedSetIndex(0); }}
                    className={`shrink-0 border p-3 text-left font-mono transition-all rounded-none
                      ${isSelected
                        ? 'bg-[#121212] border-blue-500 text-[#f0f0f0]'
                        : 'bg-[#0c0c0c] border-[#1a1a1a] text-neutral-500 hover:bg-[#121212]'
                      }`}
                  >
                    <div className="flex items-center justify-between space-x-4">
                      <span className="text-[10px] text-neutral-500">{String(idx + 1).padStart(2, '0')}</span>
                      {isDone
                        ? <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        : doneCount > 0
                          ? <span className="text-[9px] font-bold text-blue-400">{doneCount}/{sets.length}</span>
                          : <span className="h-1 w-1 rounded-full bg-neutral-700" />
                      }
                    </div>
                    <div className="text-xs font-bold uppercase tracking-tight mt-1 whitespace-nowrap">
                      {ex?.name || 'Unknown'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active exercise card */}
            {(() => {
              const currentExId = activeWorkoutList[selectedExIndex];
              const exercise    = EXERCISE_LIBRARY.find(e => e.id === currentExId);
              if (!exercise) return null;
              const conflict    = getExerciseConflict(currentExId);
              const sets        = workoutSets[currentExId] || [];
              const selectedSet = sets[selectedSetIndex] || sets[0] || {};

              return (
                <div className="space-y-4">

                  {/* Injury conflict banner */}
                  {conflict && (
                    <div className="border border-red-900 bg-red-950/20 p-4 space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold block">
                            Injury conflict
                          </span>
                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            {exercise.name} conflicts with <strong className="text-neutral-200">{conflict.injury}</strong>. Flagged: {conflict.tags.join(', ')}.
                          </p>
                        </div>
                      </div>
                      {conflict.alternative && (() => {
                        const altEx = EXERCISE_LIBRARY.find(e => e.id === conflict.alternative);
                        return (
                          <div className="pt-2 border-t border-red-900/30 flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                              Suggested: {altEx?.name}
                            </span>
                            <button
                              onClick={() => substituteExercise(currentExId, conflict.alternative)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-mono uppercase text-[9px] tracking-widest px-3 py-1.5 font-bold transition rounded-none"
                            >
                              Use this instead
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Exercise name + last time */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase">{exercise.target}</span>
                        <h2 className="text-sm font-bold uppercase tracking-tight mt-0.5">{exercise.name}</h2>
                      </div>
                      <div className="bg-black border border-[#1a1a1a] px-3 py-2 shrink-0">
                        <span className="text-[8px] font-mono text-blue-400 uppercase block mb-0.5 tracking-wider">Last time</span>
                        <span className="text-[12px] font-mono font-bold text-neutral-200">
                          {sets[0]?.last || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Set rows */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] overflow-hidden">
                    <div className="grid grid-cols-12 gap-1 px-4 py-2 border-b border-[#1a1a1a] text-[9px] font-mono text-neutral-500 uppercase tracking-widest text-center font-bold">
                      <div className="col-span-2 text-left">Set</div>
                      <div className="col-span-3">Weight</div>
                      <div className="col-span-3">Reps</div>
                      <div className="col-span-2">RPE</div>
                      <div className="col-span-2">Done</div>
                    </div>
                    <div className="divide-y divide-[#1a1a1a]">
                      {sets.map((set, idx) => {
                        const isActive = selectedSetIndex === idx;
                        return (
                          <div
                            key={set.id}
                            onClick={() => setSelectedSetIndex(idx)}
                            className={`grid grid-cols-12 gap-1 px-4 py-3.5 items-center transition cursor-pointer relative
                              ${isActive ? 'bg-blue-950/15 border-y border-blue-900/50' : 'bg-transparent hover:bg-neutral-900/30'}`}
                          >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500" />}
                            <div className="col-span-2 text-left flex items-center space-x-2">
                              <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-blue-400' : 'text-neutral-500'}`}>{idx + 1}</span>
                              {isActive && <span className="text-[8px] font-mono bg-blue-950 text-blue-400 px-1 border border-blue-900">ACTIVE</span>}
                            </div>
                            <div className="col-span-3 text-center">
                              <span className={`text-xs font-mono font-bold ${isActive ? 'text-blue-300' : 'text-neutral-300'}`}>
                                {set.weight} <span className="text-[9px] text-neutral-600">{settings.units}</span>
                              </span>
                            </div>
                            <div className="col-span-3 text-center">
                              <span className={`text-xs font-mono font-bold ${isActive ? 'text-blue-300' : 'text-neutral-300'}`}>
                                {set.reps} <span className="text-[9px] text-neutral-600">reps</span>
                              </span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-xs font-mono font-bold text-neutral-400">
                                {set.rpe ? `@ ${set.rpe}` : '—'}
                              </span>
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleComplete(currentExId, idx); }}
                                className={`h-6 w-6 border flex items-center justify-center transition
                                  ${set.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-black border-[#2d2d2d] text-transparent hover:border-neutral-400'}`}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Steppers */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-widest font-extrabold flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>Adjust — set {selectedSetIndex + 1}</span>
                      </span>
                    </div>

                    {/* Weight */}
                    <div className="space-y-1 bg-[#070707] border border-[#171717] p-3">
                      <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-1">Weight</div>
                      <div className="flex items-center justify-between gap-2 pt-1.5">
                        {[-10, -2.5].map(d => (
                          <button key={d} onClick={() => handleTweak('weight', d)}
                            className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
                            {d}
                          </button>
                        ))}
                        <div className="flex-1 text-center py-1">
                          <span className="text-2xl font-mono font-black text-white tracking-tight">{selectedSet.weight}</span>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase ml-1.5 font-bold">{settings.units}</span>
                        </div>
                        {[2.5, 10].map(d => (
                          <button key={d} onClick={() => handleTweak('weight', d)}
                            className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
                            +{d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reps */}
                    <div className="space-y-1 bg-[#070707] border border-[#171717] p-3">
                      <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-1">Reps</div>
                      <div className="flex items-center justify-between gap-2 pt-1.5">
                        {[-5, -1].map(d => (
                          <button key={d} onClick={() => handleTweak('reps', d)}
                            className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
                            {d}
                          </button>
                        ))}
                        <div className="flex-1 text-center py-1">
                          <span className="text-2xl font-mono font-black text-white tracking-tight">{selectedSet.reps}</span>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase ml-1.5 font-bold">reps</span>
                        </div>
                        {[1, 5].map(d => (
                          <button key={d} onClick={() => handleTweak('reps', d)}
                            className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
                            +{d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RPE */}
                    <div className="space-y-1 bg-[#070707] border border-[#171717] p-3">
                      <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-1">
                        Effort ({settings.rpeMode})
                      </div>
                      <div className="flex justify-between gap-1 pt-1.5">
                        {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(val => {
                          const isActive = selectedSet.rpe === val;
                          return (
                            <button
                              key={val}
                              onClick={() => handleSetRpe(val)}
                              className={`flex-1 text-[10px] py-2.5 font-mono border transition-all rounded-none
                                ${isActive ? 'bg-blue-600 border-blue-500 text-white font-extrabold' : 'bg-[#121212] border-[#222] text-neutral-400 hover:text-white'}`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Plate calculator */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 space-y-4">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block border-b border-[#1a1a1a] pb-2 tracking-widest font-extrabold">
                      Plate breakdown
                    </span>
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-6">
                      <div className="shrink-0 space-y-1">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Per sleeve</span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-mono font-black text-neutral-100">
                            {selectedSet.weight ? ((selectedSet.weight - (settings.units === 'lbs' ? 45 : 20)) / 2).toFixed(1) : '0.0'}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">{settings.units}</span>
                        </div>
                        <p className="text-[9px] font-mono text-neutral-500 uppercase">
                          {settings.units === 'lbs' ? '45 lb bar' : '20 kg bar'}
                        </p>
                      </div>

                      {/* Barbell sleeve render */}
                      <div className="flex-1 bg-black border border-[#1a1a1a] h-24 relative flex items-center px-4 overflow-hidden">
                        <div className="absolute left-0 right-0 h-2 bg-[#2a2a2a] border-y border-[#3a3a3a]" />
                        <div className="absolute left-8 w-2 bg-[#444] border-x border-[#555] z-10" style={{ height: 72 }} />
                        <div className="absolute left-11 flex items-center z-20" style={{ gap: 2, height: '100%', alignItems: 'center' }}>
                          {getPlates(selectedSet.weight, settings.units).map((plateVal, idx) => {
                            const data = (settings.units === 'lbs' ? PLATE_DATA_LBS : PLATE_DATA_KGS)[plateVal];
                            if (!data) return null;
                            return (
                              <div
                                key={idx}
                                style={{
                                  height: data.h,
                                  width: data.w,
                                  background: data.bg,
                                  color: data.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 8,
                                  fontFamily: 'monospace',
                                  fontWeight: 800,
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  border: '1px solid rgba(0,0,0,0.4)',
                                  flexShrink: 0,
                                }}
                              >
                                {data.label}
                              </div>
                            );
                          })}
                          {getPlates(selectedSet.weight, settings.units).length === 0 && (
                            <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest pl-2">
                              Bar only
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        )}

        {/* ==========================================
            PROGRESS
           ========================================== */}
        {activeTab === 'progress' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-[9px] text-neutral-500 tracking-widest uppercase font-mono mb-1">Strength log</p>
              <h1 className="text-xl font-bold tracking-tight uppercase font-mono">Strength progress</h1>
            </div>

            <div className="space-y-6">
              {Object.keys(PROGRESS_LIFTS).map((key) => {
                const lift = PROGRESS_LIFTS[key];
                const minVal = Math.min(...lift.history.filter(Boolean)) - 10;
                const maxVal = Math.max(...lift.history.filter(Boolean)) + 10;
                const points = lift.history.map((val, idx) => {
                  const x = (idx / (lift.history.length - 1)) * 360 + 20;
                  const y = val ? 80 - ((val - minVal) / (maxVal - minVal)) * 60 : null;
                  return y !== null ? `${x},${y}` : null;
                }).filter(Boolean).join(' ');

                return (
                  <div key={key} className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#1a1a1a] pb-3 gap-2">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-200 font-mono">{lift.name}</h3>
                        <p className="text-[9px] font-mono uppercase text-neutral-500 mt-0.5">Estimated 1RM · Brzycki</p>
                      </div>
                      <div className="flex space-x-6 text-right">
                        <div>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase block">Current</span>
                          <span className="text-sm font-mono font-bold text-neutral-200">{lift.current} {settings.units}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase block">Best</span>
                          <span className="text-sm font-mono font-bold text-neutral-300">{lift.allTime} {settings.units}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase block">6-wk</span>
                          <span className={`text-sm font-mono font-bold block ${lift.paused ? 'text-neutral-500' : 'text-emerald-400'}`}>
                            {lift.paused ? 'Paused' : `+${lift.delta6Wk} ${settings.units}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      {lift.paused && (
                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center border border-[#1a1a1a] z-10 p-4 text-center">
                          <span className="font-mono text-[9px] text-red-400 bg-red-950/40 border border-red-900 px-2 py-0.5 uppercase tracking-widest font-bold">
                            Tracking paused
                          </span>
                          <p className="text-[11px] text-neutral-500 mt-2 max-w-sm">{lift.pauseReason}</p>
                        </div>
                      )}
                      <div className="bg-black border border-[#1a1a1a] h-32 w-full pt-4">
                        <svg viewBox="0 0 400 100" className="w-full h-full">
                          <line x1="20" y1="20" x2="380" y2="20" stroke="#141414" strokeDasharray="3,3" />
                          <line x1="20" y1="50" x2="380" y2="50" stroke="#141414" strokeDasharray="3,3" />
                          <line x1="20" y1="80" x2="380" y2="80" stroke="#141414" strokeDasharray="3,3" />
                          <polyline fill="none" stroke={lift.paused ? '#333' : '#2563eb'} strokeWidth="1.5" points={points} />
                          {lift.history.map((val, idx) => {
                            if (!val) return null;
                            const x = (idx / (lift.history.length - 1)) * 360 + 20;
                            const y = 80 - ((val - minVal) / (maxVal - minVal)) * 60;
                            return <circle key={idx} cx={x} cy={y} r="2.5" fill={lift.paused ? '#444' : '#2563eb'} />;
                          })}
                        </svg>
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-neutral-500 px-2 pt-2 uppercase tracking-wider">
                        <span>11W ago</span><span>8W ago</span><span>5W ago</span><span>2W ago</span><span>Now</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            SELF (PROFILE)
           ========================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-[9px] text-neutral-500 tracking-widest uppercase font-mono mb-1">Strength log</p>
              <h1 className="text-xl font-bold tracking-tight uppercase font-mono">Profile</h1>
            </div>

            {/* Active injuries */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
                <h2 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Active injuries</h2>
                <button
                  onClick={() => { setInjuryForm({ name: '', severity: 'avoid', forbiddenTags: [], notes: '' }); setShowInjuryModal(true); }}
                  className="text-[9px] font-mono text-blue-400 hover:text-blue-300 border border-blue-900/40 px-2 py-1 bg-blue-950/15"
                >
                  + Log injury
                </button>
              </div>

              <div className="space-y-3">
                {injuries.map(inj => (
                  <div key={inj.id} className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-mono px-1.5 uppercase font-bold border
                          ${inj.severity === 'avoid' ? 'bg-red-950 border-red-900 text-red-400' : 'bg-yellow-950 border-yellow-900 text-yellow-500'}`}>
                          {inj.severity === 'avoid' ? 'Avoid' : 'Caution'}
                        </span>
                        <h3 className="text-xs font-bold uppercase tracking-tight text-neutral-200 font-mono">{inj.name}</h3>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{inj.notes}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {inj.forbiddenTags.map((t, idx) => (
                          <span key={idx} className="text-[8px] font-mono bg-black text-neutral-400 border border-[#1a1a1a] px-1.5 py-0.5 uppercase tracking-wider">
                            {t.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeInjury(inj.id)} className="text-neutral-500 hover:text-red-400 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {injuries.length === 0 && (
                  <div className="border border-dashed border-[#1a1a1a] p-6 text-center bg-black">
                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">No injuries logged</span>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Settings</h2>
              <div className="bg-[#0c0c0c] border border-[#1a1a1a] divide-y divide-[#1a1a1a]">

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-tight block">Units</span>
                    <span className="text-[10px] font-mono text-neutral-500">Weight display</span>
                  </div>
                  <div className="flex border border-[#1a1a1a] bg-black p-0.5 font-mono">
                    {['lbs', 'kgs'].map(u => (
                      <button key={u} onClick={() => setSettings({ ...settings, units: u })}
                        className={`px-3 py-1 text-xs transition ${settings.units === u ? 'bg-blue-600 text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
                        {u.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-tight block">Default rest</span>
                    <span className="text-[10px] font-mono text-neutral-500">Auto-starts after each set</span>
                  </div>
                  <div className="flex border border-[#1a1a1a] bg-black p-0.5 font-mono">
                    {[60, 90, 120, 150].map(sec => (
                      <button key={sec} onClick={() => setSettings({ ...settings, defaultRest: sec })}
                        className={`px-2.5 py-1 text-xs transition ${settings.defaultRest === sec ? 'bg-blue-600 text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-tight block">Effort scale</span>
                    <span className="text-[10px] font-mono text-neutral-500">How you log perceived effort</span>
                  </div>
                  <div className="flex border border-[#1a1a1a] bg-black p-0.5 font-mono">
                    {['RPE', 'RIR'].map(mode => (
                      <button key={mode} onClick={() => setSettings({ ...settings, rpeMode: mode })}
                        className={`px-3 py-1 text-xs transition ${settings.rpeMode === mode ? 'bg-blue-600 text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-tight block">Backup</span>
                    <span className="text-[10px] font-mono text-neutral-500">Auto-saves locally after each session</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">Device storage</span>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* REST TIMER BANNER */}
      {showRestBanner && (
        <div className="fixed bottom-16 left-0 right-0 bg-[#0c0c0c] border-t border-[#1a1a1a] px-4 py-3 flex items-center justify-between z-30">
          <div className="flex items-center space-x-3">
            <Timer className={`h-4 w-4 ${restRunning ? 'text-blue-500 animate-pulse' : 'text-neutral-500'}`} />
            <div>
              <span className="text-[8px] font-mono text-neutral-500 uppercase block tracking-wider leading-none">Rest</span>
              <span className={`text-xs font-mono font-bold leading-none ${restSeconds === 0 ? 'text-emerald-400 animate-pulse' : 'text-neutral-200'}`}>
                {restSeconds === 0 ? 'Done — load next set' : formatTime(restSeconds)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 font-mono">
            <button onClick={() => setRestSeconds(p => p + 30)} className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] text-neutral-300 text-[9px] px-2 py-1">+30s</button>
            <button onClick={() => setRestSeconds(p => Math.max(0, p - 10))} className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] text-neutral-300 text-[9px] px-2 py-1">−10s</button>
            <button onClick={() => setRestRunning(p => !p)} className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] text-neutral-300 text-[9px] px-2.5 py-1">
              {restRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={() => { setRestSeconds(settings.defaultRest); setRestRunning(false); }} className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] text-neutral-300 text-[9px] p-1">
              <RotateCcw className="h-3 w-3" />
            </button>
            <button onClick={() => setShowRestBanner(false)} className="text-neutral-500 hover:text-white pl-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-[#1a1a1a] h-16 flex items-center justify-around z-30">
        {[
          { id: 'home',      Icon: Home,      label: 'HOME'     },
          { id: 'templates', Icon: Clipboard, label: 'PLANS'    },
          { id: 'workout',   Icon: Activity,  label: 'SESSION'  },
          { id: 'progress',  Icon: TrendingUp,label: 'PROGRESS' },
          { id: 'profile',   Icon: User,      label: 'SELF'     },
        ].map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors relative
              ${activeTab === id ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Icon className="h-[18px] w-[18px]" />
            {id === 'workout' && workoutActive && (
              <span className="absolute top-3 right-1/2 translate-x-5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
            <span className="text-[8px] font-mono uppercase tracking-widest mt-1">{label}</span>
          </button>
        ))}
      </nav>

      {/* INJURY MODAL */}
      {showInjuryModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c0c0c] border border-[#1a1a1a] w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-neutral-300">Log injury</h3>
              <button onClick={() => setShowInjuryModal(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-neutral-500 uppercase text-[9px] tracking-widest block">Injury name</label>
                <input
                  type="text"
                  placeholder="e.g. Left posterior shoulder labrum"
                  value={injuryForm.name}
                  onChange={e => setInjuryForm({ ...injuryForm, name: e.target.value })}
                  className="w-full bg-black border border-[#1a1a1a] px-3 py-2 text-white outline-none focus:border-blue-500 rounded-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 uppercase text-[9px] tracking-widest block">Severity</label>
                <select
                  value={injuryForm.severity}
                  onChange={e => setInjuryForm({ ...injuryForm, severity: e.target.value })}
                  className="w-full bg-black border border-[#1a1a1a] px-3 py-2 text-white outline-none focus:border-blue-500 rounded-none text-xs"
                >
                  <option value="avoid">Avoid</option>
                  <option value="caution">Caution</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 uppercase text-[9px] tracking-widest block">Affected movements</label>
                <div className="grid grid-cols-2 gap-1 bg-black p-2 border border-[#1a1a1a]">
                  {['shoulder', 'posterior_labrum', 'anterior_labrum', 'deep_rom', 'knee', 'lower_back', 'elbow'].map(tag => {
                    const active = injuryForm.forbiddenTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTagInForm(tag)}
                        className={`text-[9px] py-1.5 px-2 text-left border uppercase tracking-wider
                          ${active ? 'bg-red-950/40 border-red-500 text-red-400 font-bold' : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300'}`}
                      >
                        {tag.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 uppercase text-[9px] tracking-widest block">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Avoid external rotation under load."
                  value={injuryForm.notes}
                  onChange={e => setInjuryForm({ ...injuryForm, notes: e.target.value })}
                  className="w-full bg-black border border-[#1a1a1a] px-3 py-2 text-white outline-none focus:border-blue-500 rounded-none resize-none text-xs"
                />
              </div>

              <button
                onClick={handleAddInjury}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest text-xs py-3 font-bold transition rounded-none mt-2"
              >
                Save injury
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINISH SESSION MODAL */}
      {showConfirmFinishModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c0c0c] border border-[#1a1a1a] w-full max-w-sm p-6 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-200 font-mono">Save this session?</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Session time: <strong className="text-neutral-300">{formatTime(workoutDuration)}</strong>.
                {isMinimumSession && <span className="text-blue-400"> Logged as minimum session.</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmFinishModal(false)}
                className="flex-1 bg-transparent hover:bg-neutral-900 border border-[#222] text-neutral-400 font-mono text-[10px] uppercase py-3 font-bold transition rounded-none"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkout}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] uppercase py-3 font-bold transition rounded-none"
              >
                Save session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
