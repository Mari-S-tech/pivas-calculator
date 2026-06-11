/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Droplet, 
  Settings, 
  Info, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Beaker
} from "lucide-react";
import { GrainRow, MALT_DATABASE } from "./GrainBillCalculator";

interface MashPhCalculatorProps {
  grainRows: GrainRow[];
  totalGrainWeight: number;
  waterRatio: number;
}

export default function MashPhCalculator({
  grainRows = [],
  totalGrainWeight = 5.0,
  waterRatio = 3.0
}: MashPhCalculatorProps) {
  // 1. Water profile states
  const [hco3, setHco3] = useState<number>(150); // Hydrocarbonates in ppm (mg/L)
  const [ca, setCa] = useState<number>(80);     // Calcium in ppm
  const [mg, setMg] = useState<number>(15);     // Magnesium in ppm

  // 2. Custom mash water volume state (initialized from props, but can be customized)
  const [mashWaterVolume, setMashWaterVolume] = useState<number>(totalGrainWeight * waterRatio);
  const [isAutoVolume, setIsAutoVolume] = useState<boolean>(true);

  // Synchronize water volume if auto-mode is enabled
  useEffect(() => {
    if (isAutoVolume) {
      setMashWaterVolume(parseFloat((totalGrainWeight * waterRatio).toFixed(1)));
    }
  }, [totalGrainWeight, waterRatio, isAutoVolume]);

  // 3. Acid setup states
  const [targetPh, setTargetPh] = useState<number>(5.2);
  const [acidType, setAcidType] = useState<"lactic_80" | "phosphoric_75">("lactic_80");

  // 4. Categorize malts dynamically based on row definitions
  let baseWeight = 0;
  let crystalWeight = 0;
  let roastedWeight = 0;

  // Classifications
  const ROASTED_MALT_IDS = [
    "carafa-i-classic", "carafa-ii-classic", "carafa-iii-classic", 
    "carafa-i", "carafa-ii", "carafa-iii"
  ];
  
  const CRYSTAL_MALT_IDS = [
    "carapils", "carahell", "carared", "caraamber", "carabelge", 
    "caramunich-i", "caramunich-ii", "caramunich-iii", "caraaroma", 
    "abbey-malt", "melanoidin", "special-w"
  ];

  grainRows.forEach(row => {
    if (row.maltId === "rice-hulls") {
      return; // Rice hulls are technology/filtration hulls without acidity/buffer impact
    }
    const malt = MALT_DATABASE.find(m => m.id === row.maltId);
    if (!malt) return;
    
    if (ROASTED_MALT_IDS.includes(row.maltId)) {
      roastedWeight += row.weight;
    } else if (CRYSTAL_MALT_IDS.includes(row.maltId)) {
      crystalWeight += row.weight;
    } else {
      baseWeight += row.weight;
    }
  });

  const computedTotal = baseWeight + crystalWeight + roastedWeight;
  const activeTotalWeight = computedTotal > 0 ? computedTotal : totalGrainWeight;

  // Percentages for distilled pH calculation
  const basePct = activeTotalWeight > 0 ? (baseWeight / activeTotalWeight) * 100 : 90;
  const crystalPct = activeTotalWeight > 0 ? (crystalWeight / activeTotalWeight) * 100 : 10;
  const roastedPct = activeTotalWeight > 0 ? (roastedWeight / activeTotalWeight) * 100 : 0;

  // 5. Mathematical core calculations
  // Residual Alkalinity (RA) in mEq/L
  // Kolbach formula: RA = Alkalinity_mEq/L - (Ca_ppm / 70.1 + Mg_ppm / 85.1)
  const alkalinity = hco3 / 61.0;
  const ra = alkalinity - (ca / 70.1) - (mg / 85.1);

  // Estimated pH of the grain bill on distilled water
  // Light malts average 5.75 pH, crystal lowers it, roasted lowers it more
  const estimatedDistilledPh = 5.75 - (0.05 * (crystalPct / 10)) - (0.16 * (roastedPct / 10));
  const clampedDistilledPh = Math.max(5.1, Math.min(5.8, estimatedDistilledPh));

  // Actual expected mash pH before acid addition (including Residual Alkalinity influence)
  // 1 mEq/L RA increases mash pH by roughly 0.06 units
  const estimatedMashPh = clampedDistilledPh + (0.06 * ra);
  const clampedMashPh = Math.max(4.8, Math.min(6.3, estimatedMashPh));

  // Determine needed pH shift
  const deltaPh = clampedMashPh - targetPh;

  // Acid specs
  // Lactic acid 80% = ~11.8 mEq/mL
  // Phosphoric acid 75% = ~13.5 mEq/mL
  const acidNormality = acidType === "lactic_80" ? 11.8 : 13.5;

  let requiredAcidMl = 0;
  let requiredMeq = 0;

  if (deltaPh > 0) {
    // Buffering capacity of mash: grain buffering is ~28 mEq/kg per pH unit.
    // Water buffer contribution is related to its Residual Alkalinity or bicarbonate titration.
    const grainBuffer = activeTotalWeight * 28;
    const waterBuffer = mashWaterVolume * (ra > 0 ? ra * 1.5 : 0.5);
    requiredMeq = (grainBuffer + waterBuffer) * deltaPh;
    requiredAcidMl = requiredMeq / acidNormality;
  }

  // Pre-configured water profile helpers
  const applyWaterProfilePreset = (type: "soft" | "medium" | "hard") => {
    if (type === "soft") {
      setHco3(25);
      setCa(15);
      setMg(5);
    } else if (type === "medium") {
      setHco3(120);
      setCa(65);
      setMg(12);
    } else {
      setHco3(280);
      setCa(110);
      setMg(25);
    }
  };

  return (
    <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-5 text-sans" id="mash-ph-acid-card">
      
      {/* CARD HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/15 p-2.5 rounded-xl border border-amber-500/25">
            <Beaker className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase font-mono">
              Mash pH & Acid additions
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5">
              Моделювання pH затору та підкислення
            </h3>
          </div>
        </div>

        <div className="border border-amber-400/20 bg-amber-500/5 px-2.5 py-1 text-[10px] text-amber-400 font-mono font-black rounded-lg leading-tight uppercase">
          pH 4.8 - 6.2
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
        Математичне прогнозування водневого показника (pH) затору на основі залишкової лужності води та буферної ємності солоду. Визначає точний об'єм кислоти для затирання.
      </p>

      {/* QUICK PRESET SELECTORS */}
      <div className="flex items-center gap-2 bg-[#0B0F19] p-1.5 rounded-2xl border border-[#1E2638]">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2">Вода:</span>
        <button
          type="button"
          onClick={() => applyWaterProfilePreset("soft")}
          className="flex-1 py-1.5 px-2.5 rounded-xl text-[10px] font-mono font-bold text-sky-400 bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/10 transition-all cursor-pointer"
        >
          М'яка (25 HCO3)
        </button>
        <button
          type="button"
          onClick={() => applyWaterProfilePreset("medium")}
          className="flex-1 py-1.5 px-2.5 rounded-xl text-[10px] font-mono font-bold text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 transition-all cursor-pointer"
        >
          Середня (120 HCO3)
        </button>
        <button
          type="button"
          onClick={() => applyWaterProfilePreset("hard")}
          className="flex-1 py-1.5 px-2.5 rounded-xl text-[10px] font-mono font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all cursor-pointer"
        >
          Жорстка (280 HCO3)
        </button>
      </div>

      {/* INPUT CONTROLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* LEFT INSIDE COLUMN: Water Profile Ions */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            Профіль заторної води
          </h4>

          {/* HCO3 Input */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold">Гідрокарбонати (HCO₃⁻)</span>
              <span className="font-mono text-xs font-black text-amber-400">{hco3} ppm</span>
            </div>
            <input 
              type="range"
              min="0"
              max="400"
              step="5"
              value={hco3}
              onChange={(e) => setHco3(parseInt(e.target.value) || 0)}
              className="accent-amber-500 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
            />
            <span className="text-[9px] text-slate-500 leading-normal">Визначає тимчасову карбонатну лужність і буфер води.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Ca Input */}
            <div className="bg-[#0B0F19] p-3 rounded-2xl border border-[#1E2638] flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Кальцій (Ca²⁺) ppm</label>
              <input 
                type="number"
                min="0"
                max="300"
                value={ca}
                onChange={(e) => setCa(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-[#121826] border border-[#1E2638] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            {/* Mg Input */}
            <div className="bg-[#0B0F19] p-3 rounded-2xl border border-[#1E2638] flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Магній (Mg²⁺) ppm</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={mg}
                onChange={(e) => setMg(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-[#121826] border border-[#1E2638] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Volume Control */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold">Об'єм води затирання</span>
              <span className="font-mono text-xs font-black text-amber-400">{mashWaterVolume.toFixed(1)} л</span>
            </div>
            <input 
              type="range"
              min="5"
              max="150"
              step="0.5"
              disabled={isAutoVolume}
              value={mashWaterVolume}
              onChange={(e) => setMashWaterVolume(parseFloat(e.target.value) || 10)}
              className="accent-amber-500 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1 disabled:opacity-30"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isAutoVolume}
                  onChange={(e) => setIsAutoVolume(e.target.checked)}
                  className="rounded border-[#1E2638] text-amber-500 bg-[#121826] focus:ring-0 w-3.5 h-3.5"
                />
                Синхронізувати автоматично
              </label>
              <span>{isAutoVolume ? "Зафіксовано з гідромодуля" : "Ручний режим"}</span>
            </div>
          </div>

        </div>

        {/* RIGHT INSIDE COLUMN: Target pH, Acid Choice, Stats breakdown */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Налаштування моделювання
          </h4>

          {/* Target pH Field */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold">Цільовий pH затору</span>
              <span className="font-mono text-sm font-black text-emerald-400">{targetPh.toFixed(2)}</span>
            </div>
            <input 
              type="range"
              min="5.0"
              max="5.8"
              step="0.05"
              value={targetPh}
              onChange={(e) => setTargetPh(parseFloat(e.target.value))}
              className="accent-emerald-400 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>5.0 (Дуже сухе)</span>
              <span>5.4 (Збалансоване)</span>
              <span>5.8 (Макс межа)</span>
            </div>
          </div>

          {/* Acid Type list */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Тип харчової кислоти:</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setAcidType("lactic_80")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  acidType === "lactic_80"
                    ? "bg-amber-500/20 text-[#FF9F1C] border-[#FF9F1C]"
                    : "bg-[#121826] text-slate-400 border-[#1E2638] hover:text-white"
                }`}
              >
                Молочна кислота 80%
              </button>
              <button
                type="button"
                onClick={() => setAcidType("phosphoric_75")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  acidType === "phosphoric_75"
                    ? "bg-amber-500/20 text-[#FF9F1C] border-[#FF9F1C]"
                    : "bg-[#121826] text-slate-400 border-[#1E2638] hover:text-white"
                }`}
              >
                Ортофосфорна 75%
              </button>
            </div>
          </div>

          {/* Grain Bill classifications preview */}
          <div className="bg-[#0B0F19] p-3 text-xs rounded-2xl border border-[#1E2638] flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Поточний засип (з Етапу 1):</span>
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>Базовий солод:</span>
              <span className="font-mono text-slate-200">{baseWeight.toFixed(1)} кг ({basePct.toFixed(0)}%)</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>Карамельний солод:</span>
              <span className="font-mono text-amber-400">{crystalWeight.toFixed(1)} кг ({crystalPct.toFixed(0)}%)</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>Палений солод:</span>
              <span className="font-mono text-rose-400">{roastedWeight.toFixed(1)} кг ({roastedPct.toFixed(0)}%)</span>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED MATH INTERMEDIATES (RESIDUAL ALKALINITY, ECT) */}
      <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-slate-500 block text-[9px] font-mono uppercase">Залишкова лужність</span>
          <span className="text-xs sm:text-sm font-black text-rose-450 font-mono mt-0.5 block">{ra.toFixed(2)} mEq/L</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] font-mono uppercase">pH дистильованої</span>
          <span className="text-xs sm:text-sm font-black text-sky-450 font-mono mt-0.5 block">{clampedDistilledPh.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] font-mono uppercase">Розрахунковий pH затору</span>
          <span className="text-xs sm:text-sm font-black text-amber-500 font-mono mt-0.5 block">{clampedMashPh.toFixed(2)}</span>
        </div>
      </div>

      {/* FINAL OUTPUT SUMMARY WIDGET */}
      <div className="bg-[#0B0F19] rounded-2xl border border-[#1E2638] overflow-hidden">
        
        {deltaPh > 0 ? (
          <div className="p-4 bg-[#FF9F1C]/5 border-l-4 border-[#FF9F1C] flex flex-col gap-2">
            <div className="flex items-center gap-2.5 text-[#FF9F1C]">
              <Sparkles className="w-5 h-5 flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
              <h5 className="font-serif font-black text-sm uppercase tracking-tight">Розрахунок завершено</h5>
            </div>
            <p className="text-xs text-slate-200 leading-normal">
              Для досягнення цільового рівня рН <strong className="text-white bg-[#121826] px-1.5 py-0.5 rounded border border-[#1E2638] font-mono">{targetPh.toFixed(2)}</strong> Вам необхідно додати:
            </p>
            <div className="bg-[#121826] p-3 rounded-xl border border-[#1E2638] flex justify-between items-center mt-1">
              <span className="text-xs text-slate-300 font-medium">
                {acidType === "lactic_80" ? "Молочна кислота 80%" : "Ортофосфорна кислота 75%"}
              </span>
              <span className="text-lg font-mono font-black text-[#FF9F1C] bg-[#FF9F1C]/10 px-3 py-1 border border-[#FF9F1C]/25 rounded-md animate-pulse">
                {requiredAcidMl.toFixed(1)} мл
              </span>
            </div>
            
            <div className="flex items-start gap-2 text-[10px] text-slate-450 mt-1 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Рекомендація:</strong> Додайте кислоту в заторну воду безпосередньо перед внесенням солоду (засипом) для рівномірного розподілу.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <h5 className="font-serif font-black text-sm uppercase tracking-tight">Кислота не потрібна</h5>
            </div>
            <p className="text-xs text-slate-200 leading-normal">
              Ваш поточний зерновий засип і склад води самостійно понижують водневий показник затору до природного рН <strong className="text-emerald-400 font-mono">{clampedMashPh.toFixed(2)}</strong>, що нижче або дорівнює цілі <strong className="text-white font-mono">{targetPh.toFixed(2)}</strong>.
            </p>
          </div>
        )}

        {/* SECURE DUST WARNING ON COOL PROBE */}
        <div className="bg-[#121826]/75 px-4.5 py-3 flex items-start gap-2.5 border-t border-[#1E2638] text-[11px] leading-relaxed text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="relative group">
            <span className="font-bold text-slate-300">Попередження:</span> Завжди перевіряйте фактичний pH охолодженої проби через 15 хвилин після засипу солоду. 
            <span className="hidden sm:inline"> Модель дає теоретичний орієнтир, проте ферментативна активність та локальні мінерали можуть зміщувати показники.</span>
          </p>
        </div>

      </div>

    </div>
  );
}
