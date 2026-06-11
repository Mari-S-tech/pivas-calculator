/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Atom, 
  Plus, 
  Trash2, 
  Sparkles, 
  RotateCcw, 
  Settings2, 
  Info,
  Layers,
  ChevronDown,
  Scale
} from "lucide-react";

export interface GrainRow {
  id: string;
  maltId: string;
  weight: number; // in kg
}

export interface MaltDefinition {
  id: string;
  name: string;
  ebc: number;
  extract: number; // in %
  haze: 0 | 1;
}

export const MALT_DATABASE: MaltDefinition[] = [
  // Базові солоди Weyermann
  { id: "pilsner", name: "Weyermann Pilsner (Пілснер)", ebc: 3.5, extract: 81, haze: 0 },
  { id: "premium-pilsner", name: "Weyermann Premium Pilsner", ebc: 2.5, extract: 81.5, haze: 0 },
  { id: "barke-pilsner", name: "Weyermann Barke® Pilsner", ebc: 3.5, extract: 80.5, haze: 0 },
  { id: "pale-ale", name: "Weyermann Pale Ale (Пейл Ель)", ebc: 6.5, extract: 80, haze: 0 },
  { id: "vienna", name: "Weyermann Vienna (Віденський)", ebc: 7.0, extract: 79, haze: 0 },
  { id: "barke-vienna", name: "Weyermann Barke® Vienna", ebc: 7.5, extract: 79, haze: 0 },
  { id: "munich-i", name: "Weyermann Munich I (Мюнхенський I)", ebc: 15.0, extract: 78, haze: 0 },
  { id: "munich-ii", name: "Weyermann Munich II (Мюнхенський II)", ebc: 22.0, extract: 78, haze: 0 },
  { id: "barke-munich", name: "Weyermann Barke® Munich", ebc: 19.0, extract: 78, haze: 0 },
  
  // Пшеничні солоди
  { id: "wheat", name: "Weyermann Wheat Malt / Пшеничний", ebc: 4.5, extract: 82, haze: 1 },
  { id: "dark-wheat", name: "Weyermann Dark Wheat / Темний пшеничний", ebc: 17.0, extract: 80, haze: 1 },
  { id: "chateau-wheat-blanc", name: "CHÂTEAU WHEAT BLANC® (Castle Malting)", ebc: 4.5, extract: 84, haze: 1 },

  // Карамельні солоди Weyermann
  { id: "carapils", name: "Weyermann Carapils® (Карапілс)", ebc: 4.0, extract: 78, haze: 0 },
  { id: "carahell", name: "Weyermann Carahell® (Карахель)", ebc: 26.0, extract: 74, haze: 0 },
  { id: "carared", name: "Weyermann Carared® (Караред)", ebc: 45.0, extract: 74, haze: 0 },
  { id: "caraamber", name: "Weyermann Caraamber® (Караамбер)", ebc: 70.0, extract: 74, haze: 0 },
  { id: "carabelge", name: "Weyermann Carabelge® (Карабельж)", ebc: 35.0, extract: 74, haze: 0 },
  { id: "caramunich-i", name: "Weyermann Caramunich® I", ebc: 90.0, extract: 73, haze: 0 },
  { id: "caramunich-ii", name: "Weyermann Caramunich® II", ebc: 120.0, extract: 73, haze: 0 },
  { id: "caramunich-iii", name: "Weyermann Caramunich® III", ebc: 150.0, extract: 73, haze: 0 },
  { id: "caraaroma", name: "Weyermann Caraaroma® (Караарома)", ebc: 400.0, extract: 73, haze: 0 },

  // Спеціальні та інші солоди Weyermann
  { id: "abbey-malt", name: "Weyermann Abbey Malt® (Еббі Мальт)", ebc: 45.0, extract: 75, haze: 0 },
  { id: "melanoidin", name: "Weyermann Melanoidin", ebc: 70.0, extract: 75, haze: 0 },
  { id: "acidulated", name: "Weyermann Acidulated / Кислий солод", ebc: 5.0, extract: 74, haze: 0 },
  { id: "smoked", name: "Weyermann Smoked / Копчений солод", ebc: 5.0, extract: 77, haze: 0 },
  { id: "special-w", name: "Weyermann Special W®", ebc: 300.0, extract: 73, haze: 0 },

  // Палені солоди Weyermann
  { id: "carafa-i-classic", name: "Weyermann Carafa® I", ebc: 800.0, extract: 65, haze: 0 },
  { id: "carafa-ii-classic", name: "Weyermann Carafa® II", ebc: 1150.0, extract: 65, haze: 0 },
  { id: "carafa-iii-classic", name: "Weyermann Carafa® III", ebc: 1400.0, extract: 65, haze: 0 },
  { id: "carafa-i", name: "Weyermann Carafa® Special I", ebc: 900.0, extract: 65, haze: 0 },
  { id: "carafa-ii", name: "Weyermann Carafa® Special II", ebc: 1150.0, extract: 65, haze: 0 },
  { id: "carafa-iii", name: "Weyermann Carafa® Special III", ebc: 1400.0, extract: 65, haze: 0 },

  // Пластівці та інші замінники
  { id: "oat-flakes", name: "Вівсяні пластівці / Oat Flakes", ebc: 4.0, extract: 70, haze: 1 },
  { id: "flaked-wheat", name: "Пшеничні пластівці (Flaked Wheat)", ebc: 3.5, extract: 77, haze: 1 },

  // Рисове лушпиння
  { id: "rice-hulls", name: "Рисове лушпиння (Rice Hulls)", ebc: 0, extract: 0, haze: 0 }
];

export interface FlocculationOption {
  id: "high" | "medium" | "low";
  name: string;
  baseTurbidity: number;
}

export const FLOCCULATION_OPTIONS: FlocculationOption[] = [
  { id: "high", name: "Висока • 0% мутності", baseTurbidity: 0 },
  { id: "medium", name: "Середня • 20% мутності", baseTurbidity: 20 },
  { id: "low", name: "Низька / Hazy штами • 60% мутності", baseTurbidity: 60 }
];

export interface YeastDefinition {
  name: string;
  brand: "Fermentis" | "Lallemand";
  flocculation: "high" | "medium" | "low";
  attenuation: number;
}

export const YEAST_DATABASE: Record<string, YeastDefinition> = {
  "SafAle US-05": { name: "SafAle US-05", brand: "Fermentis", flocculation: "medium", attenuation: 81 },
  "SafAle S-04": { name: "SafAle S-04", brand: "Fermentis", flocculation: "high", attenuation: 75 },
  "SafAle WB-06": { name: "SafAle WB-06", brand: "Fermentis", flocculation: "low", attenuation: 86 },
  "SafLager W-34/70": { name: "SafLager W-34/70", brand: "Fermentis", flocculation: "high", attenuation: 82 },
  "Wit (Бельгійські)": { name: "Wit (Бельгійські)", brand: "Lallemand", flocculation: "low", attenuation: 78 },
  "Verdant IPA": { name: "Verdant IPA", brand: "Lallemand", flocculation: "low", attenuation: 77 },
  "Voss Kveik": { name: "Voss Kveik", brand: "Lallemand", flocculation: "medium", attenuation: 78 },
  "Nottingham": { name: "Nottingham", brand: "Lallemand", flocculation: "high", attenuation: 77 }
};

export interface SpiceRow {
  id: string;
  spiceId: string;
  weight: number; // in grams
  time: number; // in minutes (before end of boil)
}

export const SPICE_DATABASE = [
  { id: "coriander", name: "Коріандр" },
  { id: "orange_sweet", name: "Апельсинова цедра (солодка)" },
  { id: "orange_bitter", name: "Апельсинова цедра (гірка Кюрасао)" },
  { id: "lemon_peel", name: "Лимонна цедра" }
];

interface GrainBillCalculatorProps {
  onGrainBillChange: (data: {
    ebc: number;
    srm: number;
    turbidity: number;
    adjunctsPct: number;
    totalWeight: number;
    beerColorHex: string;
  }) => void;
  initialBatchVolume?: number; // Volume_Liters fallback
  rows?: GrainRow[];
  setRows?: (rows: GrainRow[] | ((prev: GrainRow[]) => GrainRow[])) => void;
  flocType?: "high" | "medium" | "low";
  setFlocType?: (val: "high" | "medium" | "low") => void;
  yeastStrain?: string;
  setYeastStrain?: (val: string) => void;
  spiceRows?: SpiceRow[];
  setSpiceRows?: (rows: SpiceRow[] | ((prev: SpiceRow[]) => SpiceRow[])) => void;
  onYeastChange?: (attenuation: number, flocType: "high" | "medium" | "low") => void;
}

export default function GrainBillCalculator({ 
  onGrainBillChange, 
  initialBatchVolume = 20,
  rows: rowsProp,
  setRows: setRowsProp,
  flocType: flocTypeProp,
  setFlocType: setFlocTypeProp,
  yeastStrain: yeastStrainProp,
  setYeastStrain: setYeastStrainProp,
  spiceRows: spiceRowsProp,
  setSpiceRows: setSpiceRowsProp,
  onYeastChange
}: GrainBillCalculatorProps) {
  // Backups for initial State
  const [localRows, setLocalRows] = useState<GrainRow[]>([
    { id: "row-1", maltId: "pilsner", weight: 4.5 },
    { id: "row-2", maltId: "carahell", weight: 0.5 }
  ]);
  const [localFlocType, setLocalFlocType] = useState<"high" | "medium" | "low">("medium");
  const [localYeastStrain, setLocalYeastStrain] = useState<string>("Verdant IPA");
  const [localSpiceRows, setLocalSpiceRows] = useState<SpiceRow[]>([]);

  const rows = rowsProp !== undefined ? rowsProp : localRows;
  const setRows = setRowsProp !== undefined ? setRowsProp : setLocalRows;
  const flocType = flocTypeProp !== undefined ? flocTypeProp : localFlocType;
  const setFlocType = setFlocTypeProp !== undefined ? setFlocTypeProp : setLocalFlocType;
  const yeastStrain = yeastStrainProp !== undefined ? yeastStrainProp : localYeastStrain;
  const setYeastStrain = setYeastStrainProp !== undefined ? setYeastStrainProp : setLocalYeastStrain;
  const spiceRows = spiceRowsProp !== undefined ? spiceRowsProp : localSpiceRows;
  const setSpiceRows = setSpiceRowsProp !== undefined ? setSpiceRowsProp : setLocalSpiceRows;

  // 3. Batch Volume (L) slider for Morey's equation color dilution
  const [batchVolume, setBatchVolume] = useState<number>(initialBatchVolume);

  // Sync batchVolume with parent's initialBatchVolume reactive changes
  useEffect(() => {
    setBatchVolume(initialBatchVolume);
  }, [initialBatchVolume]);

  // Helper to convert SRM to HEX color for visual indicator inside the card
  function getSrmToHex(srm: number): string {
    const s = Math.max(1.0, srm);
    let r = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(0.97, s))));
    let g = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(0.88, s))));
    let b = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(0.70, s))));
    
    // Stout threshold
    if (s > 25) {
      r = Math.max(15, r);
      g = Math.max(8, g);
      b = Math.max(4, b);
    }
    
    const hex = (c: number) => {
      const h = Math.min(255, Math.max(0, c)).toString(16);
      return h.length === 1 ? "0" + h : h;
    };
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }

  // calculations triggered on rows or volume changes
  const totalWeight = rows.reduce((sum, r) => sum + r.weight, 0);

  // Calculate EBC with Morey's Equation
  let mcuTotal = 0;
  let totalHazeWeight = 0;
  let specialtyWeight = 0;

  rows.forEach(row => {
    const malt = MALT_DATABASE.find(m => m.id === row.maltId);
    if (malt) {
      // MCU calculation
      // MCU_total = Sum( (Weight_kg * 2.20462 * (EBC / 1.97)) / (Volume_Liters * 0.264172) )
      const weightLbs = row.weight * 2.20462;
      const srmGrain = malt.ebc / 1.97;
      const volGallons = batchVolume * 0.264172;
      mcuTotal += (weightLbs * srmGrain) / Math.max(0.1, volGallons);

      // Flocculation Haze check
      if (malt.haze === 1) {
        totalHazeWeight += row.weight;
      }

      // Specialty adjuncts/color mod check (anything other than basic base grains counts as specialty/adjunct)
      const isBaseGrain = [
        "pilsner", "premium-pilsner", "barke-pilsner", 
        "pale-ale", 
        "vienna", "barke-vienna", 
        "munich-i", "munich-ii", "barke-munich",
        "wheat", "dark-wheat", "chateau-wheat-blanc"
      ].includes(malt.id);

      if (!isBaseGrain) {
        specialtyWeight += row.weight;
      }
    }
  });

  // Calculate SRM using Morey's Equation
  // SRM_final = 1.4922 * Math.pow(MCU_total, 0.6859)
  const srmFinal = mcuTotal > 0 ? (1.4922 * Math.pow(mcuTotal, 0.6859)) : 0;
  const ebcFinal = srmFinal * 1.97;

  // Haze dynamic percentage: Haze_Grain_Pct = (Haze_Weight / Total_Weight) * 100.
  const hazeGrainPct = totalWeight > 0 ? (totalHazeWeight / totalWeight) * 100 : 0;

  // Grain turbidity bonus: Grain_Turbidity = (Haze_Grain_Pct / 20) * 40. (Max 40)
  const grainTurbidity = Math.min(40, (hazeGrainPct / 20) * 40);

  // Total turbidity = Base + Grain Bonus. (Max 100)
  const baseTurb = FLOCCULATION_OPTIONS.find(o => o.id === flocType)?.baseTurbidity || 0;
  const totalTurbidity = Math.min(100, baseTurb + grainTurbidity);

  // Specialty grain percentage (used as a modifier for Adjuncts_pct)
  const calculatedAdjunctsPct = totalWeight > 0 ? Math.round((specialtyWeight / totalWeight) * 100) : 0;

  const realColorHex = getSrmToHex(srmFinal);

  // Emit updates to parent component whenever changes occur
  useEffect(() => {
    onGrainBillChange({
      ebc: ebcFinal,
      srm: srmFinal,
      turbidity: totalTurbidity,
      adjunctsPct: calculatedAdjunctsPct,
      totalWeight,
      beerColorHex: realColorHex
    });
  }, [ebcFinal, srmFinal, totalTurbidity, calculatedAdjunctsPct, totalWeight, realColorHex, batchVolume]);

  // Malt Action methods
  const addRow = () => {
    const id = "row-" + Date.now();
    setRows(prev => [...prev, { id, maltId: "pilsner", weight: 1.0 }]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return; // Keep at least one
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRowMalt = (id: string, maltId: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, maltId } : r));
  };

  const updateRowWeight = (id: string, weight: number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, weight: Math.max(0.1, weight) } : r));
  };

  // Spice Action methods
  const addSpiceRow = () => {
    const id = "spice-" + Date.now();
    setSpiceRows(prev => [...prev, { id, spiceId: "coriander", weight: 15, time: 10 }]);
  };

  const removeSpiceRow = (id: string) => {
    setSpiceRows(prev => prev.filter(r => r.id !== id));
  };

  const updateSpiceRowId = (id: string, spiceId: string) => {
    setSpiceRows(prev => prev.map(r => r.id === id ? { ...r, spiceId } : r));
  };

  const updateSpiceRowWeight = (id: string, weight: number) => {
    setSpiceRows(prev => prev.map(r => r.id === id ? { ...r, weight: Math.max(1, weight) } : r));
  };

  const updateSpiceRowTime = (id: string, time: number) => {
    setSpiceRows(prev => prev.map(r => r.id === id ? { ...r, time: Math.max(0, time) } : r));
  };

  const resetGrainBill = () => {
    setRows([
      { id: "row-1", maltId: "pilsner", weight: 4.5 },
      { id: "row-2", maltId: "carahell", weight: 0.5 }
    ]);
    setFlocType("medium");
    setYeastStrain("Verdant IPA");
    setSpiceRows([]);
    setBatchVolume(20);
  };

  return (
    <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-5" id="grain-bill-calculator-card">
      
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9F1C]/10 p-2.5 rounded-xl border border-[#FF9F1C]/25">
            <Scale className="w-5 h-5 text-[#FF9F1C]" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider text-[#FF9F1C] uppercase font-mono">
              Розрахунок засипу
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5">
              Засип зерна та дріжджовий профіль
            </h3>
          </div>
        </div>

        <button
          onClick={resetGrainBill}
          type="button"
          className="text-slate-400 hover:text-white bg-[#1E2638]/50 p-2 rounded-xl transition-all border border-[#1E2638] cursor-pointer"
          title="Скинути засип"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
        Спроектуйте засип солоду вашого пива. Калькулятор автоматично вирахує колір за формулою Morey (EBC/SRM), виділить "мутні" компоненти та скоригує очікуваний відсоток мутності (Turbidity).
      </p>

      {/* INPUTS AND CONFIG FIELDS */}
      <div className="flex flex-col gap-4 font-sans text-sm">
        
        {/* Dynamic Rows list */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center px-1 text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
            <span>Вибір солодів / пластівців</span>
            <span>Вага (кг)</span>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {rows.map((row) => {
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 bg-[#0B0F19] p-2.5 rounded-xl border border-[#1E2638] overflow-hidden"
                  >
                    {/* Malt Select Dropdown wrapper */}
                    <div className="flex-1 relative">
                      <select
                        value={row.maltId}
                        onChange={(e) => updateRowMalt(row.id, e.target.value)}
                        className="w-full bg-[#121826] border border-[#1E2638] text-xs font-bold text-white py-2 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-[#FF9F1C] cursor-pointer"
                      >
                        {MALT_DATABASE.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.ebc} EBC) {m.haze ? "🌾 Hazy" : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Weight Input */}
                    <div className="flex items-center bg-[#121826] border border-[#1E2638] rounded-xl px-2.5 py-1 w-24">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                        value={row.weight}
                        onChange={(e) => updateRowWeight(row.id, parseFloat(e.target.value) || 0.1)}
                        className="w-full text-center font-mono font-bold text-xs bg-transparent border-none text-white focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-mono font-bold ml-1">кг</span>
                    </div>

                    {/* Delete row button */}
                    <button
                      type="button"
                      disabled={rows.length <= 1}
                      onClick={() => removeRow(row.id)}
                      className="text-slate-400 hover:text-rose-400 disabled:opacity-20 p-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Add grain button */}
          <button
            type="button"
            onClick={addRow}
            className="w-full py-2 border border-dashed border-[#1E2638] rounded-xl text-slate-400 hover:text-[#FF9F1C] hover:border-[#FF9F1C]/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Додати солод</span>
          </button>
        </div>

        {/* Спеції та добавки (Spices Module) */}
        <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-[#1E2638]">
          <div className="flex items-center gap-2 px-1 text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
            <span className="flex-1">Спеції та добавки</span>
            <span className="w-20 text-center">Вага</span>
            <span className="w-24 text-center">Час</span>
            <span className="w-8"></span>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {spiceRows.map((row) => {
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 bg-[#0B0F19] p-2.5 rounded-xl border border-[#1E2638] overflow-hidden"
                  >
                    {/* Spice Select Dropdown wrapper */}
                    <div className="flex-1 relative">
                      <select
                        value={row.spiceId}
                        onChange={(e) => updateSpiceRowId(row.id, e.target.value)}
                        className="w-full bg-[#121826] border border-[#1E2638] text-xs font-bold text-white py-2 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-[#FF9F1C] cursor-pointer"
                      >
                        {SPICE_DATABASE.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Weight Input (grams) */}
                    <div className="flex items-center bg-[#121826] border border-[#1E2638] rounded-xl px-2 py-1 w-20">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="1000"
                        value={row.weight}
                        onChange={(e) => updateSpiceRowWeight(row.id, parseInt(e.target.value) || 1)}
                        className="w-full text-center font-mono font-bold text-xs bg-transparent border-none text-white focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-mono font-bold ml-0.5">г</span>
                    </div>

                    {/* Time Input (minutes before end of boil) */}
                    <div className="flex items-center gap-0.5 bg-[#121826] border border-[#1E2638] rounded-xl px-2 py-1 w-24 relative group/time">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="240"
                        value={row.time !== undefined ? row.time : 10}
                        onChange={(e) => updateSpiceRowTime(row.id, parseInt(e.target.value) || 0)}
                        className="w-full text-center font-mono font-bold text-xs bg-transparent border-none text-white focus:outline-none"
                        placeholder="Час"
                      />
                      <span className="text-[10px] text-slate-400 font-mono font-bold">хв</span>
                      
                      {/* Tooltip description */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-[#1A2234] text-slate-200 text-[10px] p-2 rounded-lg border border-[#FF9F1C]/30 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover/time:opacity-100 group-hover/time:scale-100 transition-all z-30 text-center leading-tight">
                        хвилин до кінця кипу
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A2234]" />
                      </div>
                    </div>

                    {/* Delete row button */}
                    <button
                      type="button"
                      onClick={() => removeSpiceRow(row.id)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Add spice button */}
          <button
            type="button"
            onClick={addSpiceRow}
            className="w-full py-2 border border-dashed border-[#1E2638] rounded-xl text-slate-400 hover:text-[#FF9F1C] hover:border-[#FF9F1C]/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Додати спецію</span>
          </button>
        </div>

        {/* Yeast Selection Dropdown */}
        <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2 mt-2 pt-3 border-t border-[#1E2638]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              Вибір дріжджів:
            </span>
          </div>
          <div className="relative">
            <select
              value={yeastStrain}
              onChange={(e) => {
                const selected = e.target.value;
                setYeastStrain(selected);
                
                const selectedOption = e.target.selectedOptions?.[0];
                if (selectedOption) {
                  const attenuation = parseInt(selectedOption.getAttribute("data-attenuation") || "78");
                  const flocVal = (selectedOption.getAttribute("data-flocculation") || "medium") as "high" | "medium" | "low";
                  
                  if (setFlocType) {
                    setFlocType(flocVal);
                  }
                  if (onYeastChange) {
                    onYeastChange(attenuation, flocVal);
                  }
                } else {
                  const yeastInfo = YEAST_DATABASE[selected];
                  if (yeastInfo) {
                    if (setFlocType) setFlocType(yeastInfo.flocculation);
                    if (onYeastChange) onYeastChange(yeastInfo.attenuation, yeastInfo.flocculation);
                  }
                }
              }}
              className="w-full bg-[#121826] border border-[#1E2638] text-xs font-bold text-[#FF9F1C] py-2.5 pl-3.5 pr-10 rounded-xl appearance-none focus:outline-none focus:border-[#FF9F1C] cursor-pointer"
            >
              <optgroup label="Fermentis">
                <option value="SafAle US-05" data-attenuation="81" data-flocculation="medium">SafAle US-05 (Середня флок.)</option>
                <option value="SafAle S-04" data-attenuation="75" data-flocculation="high">SafAle S-04 (Висока флок.)</option>
                <option value="SafAle WB-06" data-attenuation="86" data-flocculation="low">SafAle WB-06 (Низька флок.)</option>
                <option value="SafLager W-34/70" data-attenuation="82" data-flocculation="high">SafLager W-34/70 (Висока флок.)</option>
              </optgroup>
              <optgroup label="Lallemand (LalBrew)">
                <option value="Wit (Бельгійські)" data-attenuation="78" data-flocculation="low">Wit (Бельгійські) (Низька флок.)</option>
                <option value="Verdant IPA" data-attenuation="77" data-flocculation="low">Verdant IPA (Низька флок.)</option>
                <option value="Voss Kveik" data-attenuation="78" data-flocculation="medium">Voss Kveik (Середня флок.)</option>
                <option value="Nottingham" data-attenuation="77" data-flocculation="high">Nottingham (Висока флок.)</option>
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-[#FF9F1C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Batch volume helper slider to configure color dilution */}
        <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold">
              Об'єм варки для розведення кольору:
            </span>
            <span className="font-mono text-xs font-black text-[#FF9F1C]">
              {batchVolume.toFixed(1)} л
            </span>
          </div>
          <input
            type="range"
            min="5.0"
            max="100.0"
            step="0.5"
            value={batchVolume}
            onChange={(e) => setBatchVolume(parseFloat(e.target.value))}
            className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
          />
          <span className="text-[9px] text-slate-500 italic block">
            Це значення використовується у формулі Morey пивоваріння для визначення насиченості кольору солоду за об'ємом води.
          </span>
        </div>

      </div>

      {/* QUICK STATUS DISPLAY ROW */}
      <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-1 text-xs">
        <div>
          <span className="text-slate-400 block text-[9px] font-mono uppercase">Загальна вага</span>
          <span className="text-sm font-black text-white font-mono mt-0.5 block">{totalWeight.toFixed(2)} кг</span>
        </div>

        <div>
          <span className="text-slate-400 block text-[9px] font-mono uppercase">Колір пива</span>
          <span className="text-sm font-black text-[#FF9F1C] font-mono mt-0.5 block inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: realColorHex }} />
            {ebcFinal.toFixed(1)} EBC
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[9px] font-mono uppercase">Мутність</span>
          <span className="text-sm font-black text-sky-450 font-mono mt-0.5 block">{totalTurbidity.toFixed(0)}%</span>
        </div>

        <div>
          <span className="text-slate-400 block text-[9px] font-mono uppercase">Спецсолоди</span>
          <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">{calculatedAdjunctsPct}%</span>
        </div>
      </div>

    </div>
  );
}
