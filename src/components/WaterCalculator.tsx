/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { 
  Scale, 
  Droplet, 
  Droplets,
  Flame, 
  Settings2, 
  Plus, 
  Minus, 
  Info,
  Beaker,
  Sparkles,
  ChevronDown
} from "lucide-react";

interface WaterCalculatorProps {
  totalGrainWeight: number;
  totalBoilOff: number;
  targetVolume: number;
  onTargetVolumeChange: (vol: number) => void;
  waterRatio: number;
  setWaterRatio: (ratio: number) => void;
  targetChloride: number;
  setTargetChloride: (ppm: number) => void;
  targetSulfate: number;
  setTargetSulfate: (ppm: number) => void;
}

export default function WaterCalculator({
  totalGrainWeight = 5.0,
  totalBoilOff = 6.875,
  targetVolume = 55.0,
  onTargetVolumeChange,
  waterRatio = 3.0,
  setWaterRatio,
  targetChloride = 80,
  setTargetChloride,
  targetSulfate = 80,
  setTargetSulfate
}: WaterCalculatorProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "table">("visual");

  const applyPresetVolume = (batchSize: number) => {
    onTargetVolumeChange(batchSize);
  };

  // 1. Calculate Water Balance accurately per specifications
  const grainAbsorbed = totalGrainWeight * 1.0; // Grain_Absorption = Total_Grain_Weight * 1.0
  const trubLoss = targetVolume * 0.05;         // Trub_Loss = Target_Volume * 0.05
  const mashWater = totalGrainWeight * waterRatio; // Mash_Water = Total_Grain_Weight * Mash_Ratio
  
  // Total water required
  const totalWater = targetVolume + grainAbsorbed + totalBoilOff + trubLoss;
  
  // Sparge water = Total Needed - Mash Water
  const spargeWaterRaw = totalWater - mashWater;
  const spargeWater = spargeWaterRaw > 0 ? spargeWaterRaw : 0;
  const adjustedTotalWater = mashWater + spargeWater;
  
  // Percentages for visualization
  const totalDisplay = adjustedTotalWater > 0 ? adjustedTotalWater : 1;
  const mashPercent = (mashWater / totalDisplay) * 100;
  const spargePercent = (spargeWater / totalDisplay) * 100;
  const totalLosses = grainAbsorbed + totalBoilOff + trubLoss;

  // 2. RO Water / Salt Additions Calculations
  // CaCl2 (g) = (targetChloride * Water_Volume_L) / 482
  const cacl2MashG = (targetChloride * mashWater) / 482;
  const cacl2SpargeG = (targetChloride * spargeWater) / 482;
  const cacl2TotalG = cacl2MashG + cacl2SpargeG;

  // CaSO4 (g) = (targetSulfate * Water_Volume_L) / 558
  const caso4MashG = (targetSulfate * mashWater) / 558;
  const caso4SpargeG = (targetSulfate * spargeWater) / 558;
  const caso4TotalG = caso4MashG + caso4SpargeG;

  // Resulting Calcium (ppm) = Sulfate * 0.417 + Chloride * 0.566
  const calciumMashPpm = targetSulfate * 0.417 + targetChloride * 0.566;

  // Sulfate to Chloride Ratio
  const sulfToChlorideRatio = targetChloride > 0 ? targetSulfate / targetChloride : targetSulfate;

  const getProfileDescription = (ratio: number) => {
    if (ratio < 0.5) return { label: "Максимально Солодовий (Very Malty)", desc: "Підкреслює солодкість, повнотілість пива, карамельні та зернові ноти. Чудово для стаутів, боків.", color: "text-amber-500", border: "border-amber-500/20" };
    if (ratio < 0.9) return { label: "Солодовий (Malty)", desc: "Тонка солодова домінанта. Ідеально для солодкуватих елів, класичних темних лагерів.", color: "text-amber-300", border: "border-amber-500/10" };
    if (ratio < 1.3) return { label: "Збалансований (Balanced)", desc: "Рівномурна присутність хмелю та солоду. Стандарт для пілснерів, портерів.", color: "text-emerald-400", border: "border-emerald-500/20" };
    if (ratio < 2.0) return { label: "Хмелевий / Гіркий (Bitter / Hoppy)", desc: "Підсилює сприйняття гіркоти, робить її чистою і сухою. Прекрасно підходить для IPA, APA.", color: "text-sky-400", border: "border-sky-500/20" };
    return { label: "Яскраво Хмелевий (Very Bitter / Sharp)", desc: "Екстремальне посилення сухості та гіркоти хмелю. Типово для West Coast IPA, Double IPA.", color: "text-indigo-400", border: "border-indigo-500/20" };
  };

  const ionProfile = getProfileDescription(sulfToChlorideRatio);

  return (
    <div className="flex flex-col gap-6">

      {/* BLOCK 1: GLOBAL WATER BALANCE */}
      <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-5" id="water-balance-card">
        
        {/* CARD HEADER */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF9F1C]/10 p-2.5 rounded-xl border border-[#FF9F1C]/25">
              <Droplets className="w-5 h-5 text-[#FF9F1C]" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-[#FF9F1C] uppercase font-mono">
                Водорозподіл варки
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5 animate-fade-in">
                Глобальний водяний баланс
              </h3>
            </div>
          </div>

          {/* Quick Batch Presets */}
          <div className="hidden sm:flex gap-1 bg-[#0B0F19] p-1 rounded-xl border border-[#1E2638] text-[10px]">
            {[10, 20, 30, 55].map((preset) => (
              <button 
                key={preset}
                type="button"
                onClick={() => applyPresetVolume(preset)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                  targetVolume === preset ? "bg-[#FF9F1C] text-[#0B0F19]" : "text-slate-400 hover:text-white"
                }`}
              >
                Батч {preset}л
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
          Автоматична синхронізація водяних об'ємів. Калькулятор підтягує сумарну вагу солоду з Етапу 1 та втрати на кип'ятіння для утримання ідеального фізичного балансу затору.
        </p>

        {/* THREE COLUMN GRID: 1. CORE INPUTS, 2. LOSSES, 3. SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mt-2">
          
          {/* COLUMN 1: Inputs Sliders */}
          <div className="lg:col-span-5 flex flex-col gap-4 font-sans text-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Settings2 className="w-3.5 h-3.5 text-[#FF9F1C]" />
              Базові налаштування
            </h4>

            {/* Total Grain display */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute right-3.5 top-3.5">
                <span className="text-[8px] uppercase font-mono font-black border border-emerald-500/25 text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                  Миттєво з Етапу 1
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  Вага засипу (Total_Grain_Weight)
                </span>
                <span className="font-mono text-sm font-black text-white mr-16">
                  {totalGrainWeight.toFixed(2)} кг
                </span>
              </div>
              <p className="text-[9px] text-slate-450 leading-normal">
                Розраховується в Етапі 1. Ця вага є ключовою константою для розрахунку гідромодуля та абсорбції поглинання води.
              </p>
            </div>

            {/* Water to Grain Ratio (Mash_Ratio) Slider */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Beaker className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Заторний гідромодуль (Mash_Ratio)
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setWaterRatio(Math.max(1.5, Number((waterRatio - 0.1).toFixed(1))))}
                    className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs text-[#FF9F1C]">
                    {waterRatio.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-450 font-mono font-bold">л/кг</span>
                  <button 
                    onClick={() => setWaterRatio(Math.min(8.0, Number((waterRatio + 0.1).toFixed(1))))}
                    className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <input 
                type="range"
                min="1.5"
                max="6.0"
                step="0.1"
                value={waterRatio}
                onChange={(e) => setWaterRatio(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>1.5 л/кг (Густий)</span>
                <span>3.0 л/кг (Дефолт)</span>
                <span>6.0 л/кг (Рідкий)</span>
              </div>
            </div>

            {/* Target final Batch volume (Target_Volume) Slider */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Цільовий об'єм готового пива (Target_Volume)
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => onTargetVolumeChange(Math.max(2.0, Number((targetVolume - 1).toFixed(0))))}
                    className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs text-[#FF9F1C]">
                    {targetVolume.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">л</span>
                  <button 
                    onClick={() => onTargetVolumeChange(Math.min(150.0, Number((targetVolume + 1).toFixed(0))))}
                    className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <input 
                type="range"
                min="5.0"
                max="150.0"
                step="1"
                value={targetVolume}
                onChange={(e) => onTargetVolumeChange(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                <span>5.0 л</span>
                <span>55.0 л (Дефолт)</span>
                <span>150.0 л</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Auto Coefficients */}
          <div className="lg:col-span-3 flex flex-col gap-4 font-sans text-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Info className="w-3.5 h-3.5 text-[#FF9F1C]" />
              Фракційні втрати
            </h4>

            {/* Grain absorption */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col justify-between h-full min-h-[92px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-xs font-bold leading-none">Поглинання дробиною</span>
                <span className="text-xs font-mono font-black text-amber-500">{grainAbsorbed.toFixed(1)} л</span>
              </div>
              <p className="text-[9px] text-slate-400 italic mt-2.5 leading-snug">
                Коефіцієнт {totalGrainWeight.toFixed(2)} кг × 1.0 л/кг. Волога, яку абсорбує дробина.
              </p>
            </div>

            {/* System boil off */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col justify-between h-full min-h-[92px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-xs font-bold leading-none">Випаровування (Boil-off)</span>
                <span className="text-xs font-mono font-black text-amber-500">{totalBoilOff.toFixed(1)} л</span>
              </div>
              <p className="text-[9px] text-slate-400 italic mt-2.5 leading-snug">
                Отримано на основі електроенергії кип'ятіння котла (Total_Energy × 1.25).
              </p>
            </div>

            {/* Trub loss */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col justify-between h-full min-h-[92px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-xs font-bold leading-none">Втрати осаду (Trub_Loss)</span>
                <span className="text-xs font-mono font-black text-amber-500">{trubLoss.toFixed(1)} л</span>
              </div>
              <p className="text-[9px] text-slate-400 italic mt-2.5 leading-snug">
                5% від цільового батчу ({targetVolume.toFixed(0)} л × 0.05). Осад білків та залишків хмелю.
              </p>
            </div>
          </div>

          {/* COLUMN 3: Global Water Summary */}
          <div className="lg:col-span-4 bg-[#0B0F19] p-4.5 rounded-2xl border border-[#1E2638] flex flex-col justify-between gap-4">
            
            {/* Tabs Header */}
            <div className="flex justify-between items-center pb-2 border-b border-[#1E2638]">
              <span className="text-[9px] font-mono tracking-widest text-[#FF9F1C] uppercase font-black">
                ЗАГАЛЬНА ВОДА
              </span>
              <div className="flex bg-[#121826] p-0.5 rounded-lg border border-[#1E2638] text-[9px] font-bold">
                <button 
                  type="button" 
                  onClick={() => setActiveTab("visual")}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${activeTab === "visual" ? "bg-[#FF9F1C] text-[#0B0F19]" : "text-slate-450 hover:text-white"}`}
                >
                  ГРАФІКА
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab("table")}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${activeTab === "table" ? "bg-[#FF9F1C] text-[#0B0F19]" : "text-slate-450 hover:text-white"}`}
                >
                  ФОРМУЛА
                </button>
              </div>
            </div>

            {/* Total water stats */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Розрахована загальна вода:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3.5xl font-black font-mono text-[#FF9F1C]">
                  {adjustedTotalWater.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-300 font-sans">літрів</span>
              </div>
            </div>

            {/* Conditional contents */}
            <div className="flex-1 flex flex-col justify-center min-h-[140px]">
              {activeTab === "visual" ? (
                <div className="space-y-4">
                  {/* Visual slider metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono font-bold">
                      <span className="text-[#FF9F1C] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F1C]" />
                        Вода затору (Mash_Water): {mashWater.toFixed(1)} л
                      </span>
                      <span className="text-sky-400">
                        {mashPercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono font-bold">
                      <span className="text-[#a5b4fc] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a5b4fc]" />
                        Промивна (Sparge_Water): {spargeWater.toFixed(1)} л
                      </span>
                      <span className="text-indigo-300">
                        {spargePercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Combination display cylinder tank */}
                  <div className="relative w-full h-8 bg-[#121826] rounded-xl border border-[#1E2638] overflow-hidden flex shadow-inner">
                    {mashWater > 0 && (
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#d97706]/85 to-[#FF9F1C] flex items-center justify-center relative overflow-hidden text-[#0B0F19] font-mono text-[9px] font-bold"
                        style={{ width: `${mashPercent}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${mashPercent}%` }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="z-10 truncate px-1">Затир</span>
                        <div className="absolute inset-0 bg-white/5 opacity-10 animate-pulse pointer-events-none" />
                      </motion.div>
                    )}
                    {spargeWater > 0 && (
                      <motion.div 
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 flex items-center justify-center relative overflow-hidden text-[#0B0F19] font-mono text-[9px] font-bold"
                        style={{ width: `${spargePercent}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${spargePercent}%` }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                      >
                        <span className="z-10 truncate px-1">Промивання</span>
                        <div className="absolute inset-0 bg-white/5 opacity-10 animate-pulse pointer-events-none" />
                      </motion.div>
                    )}
                  </div>

                  {/* Summary items */}
                  <div className="bg-[#121826]/80 px-2.5 py-2 rounded-xl border border-[#1E2638] text-[9px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Цільовий батч пива:</span>
                      <span className="font-mono text-white font-bold">{targetVolume.toFixed(0)} л</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Незворотні технологічні втрати:</span>
                      <span className="font-mono text-amber-500 font-bold">{totalLosses.toFixed(1)} л</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-300 font-sans">
                  <div className="flex justify-between items-center pb-1 border-b border-[#1E2638]/60">
                    <span className="text-slate-400 text-[11px]">Mash_Water (Вода затиру):</span>
                    <span className="font-mono font-bold text-white text-[11px]">
                      {totalGrainWeight.toFixed(1)} кг × {waterRatio.toFixed(1)} = <span className="text-[#FF9F1C]">{mashWater.toFixed(1)} л</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-[#1E2638]/60">
                    <span className="text-slate-400 text-[11px]">Абсорбція зерном:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {totalGrainWeight.toFixed(2)} × 1.0 = {grainAbsorbed.toFixed(1)} л
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-[#1E2638]/60">
                    <span className="text-slate-400 text-[11px]">Сумарні втрати варки:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {totalBoilOff.toFixed(1)}л (Boil) + {trubLoss.toFixed(1)}л (Trub) = {totalLosses.toFixed(1)} л
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono pt-1.5 text-[#FF9F1C]">
                    <span>Sparge_Water (Промивна):</span>
                    <span className="font-bold">
                      {adjustedTotalWater.toFixed(1)}л - {mashWater.toFixed(1)}л = {spargeWater.toFixed(1)} л
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Warning banner */}
            {spargeWaterRaw <= 0 && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 leading-snug">
                ⚠️ <strong>Гідромодуль завеликий!</strong> Заторна вода повністю покриває ваші потреби. Зменшіть показник Mash_Ratio.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BLOCK 2: RO WATER PREPARATION (CaCl2, CaSO4) */}
      <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-5" id="ro-water-treatment-card">
        
        {/* CARD HEADER */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/15 p-2.5 rounded-xl border border-sky-500/25">
              <Droplet className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-sky-450 uppercase font-mono">
                Водопідготовка та мінералізація
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5">
                Хімія осмосу (RO Water & Salts)
              </h3>
            </div>
          </div>

          <div className="border border-sky-400/20 bg-sky-500/5 px-2.5 py-1 text-[10px] text-sky-450 font-mono font-black rounded-lg leading-tight uppercase">
            Осмос 0 ppm
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
          Створення сольового профілю з дистильованої або RO води. Калькулятор автоматично бере розраховані <strong className="text-white">Mash_Water</strong> ({mashWater.toFixed(1)}л) та <strong className="text-white">Sparge_Water</strong> ({spargeWater.toFixed(1)}л) і вираховує дозування солей у грамах за вашими цільовими значеннями.
        </p>

        {/* CONTROLS AND RESULTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-1">
          
          {/* LEFT: PPM Target Sliders (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <Settings2 className="w-3.5 h-3.5 text-sky-400" />
              Цільові показники (ppm)
            </h4>

            {/* Chloride Sliders */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Хлориди (Cl⁻)
                </span>
                <span className="font-mono text-xs font-black text-amber-400">
                  {targetChloride} ppm
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="250"
                step="5"
                value={targetChloride}
                onChange={(e) => setTargetChloride(parseInt(e.target.value))}
                className="accent-amber-450 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                <span>0 ppm (Низький)</span>
                <span>100 ppm</span>
                <span>250 ppm (Макс)</span>
              </div>
            </div>

            {/* Sulfate Sliders */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Сульфати (SO₄²⁻)
                </span>
                <span className="font-mono text-xs font-black text-sky-400">
                  {targetSulfate} ppm
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="250"
                step="5"
                value={targetSulfate}
                onChange={(e) => setTargetSulfate(parseInt(e.target.value))}
                className="accent-sky-400 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                <span>0 ppm (Низький)</span>
                <span>100 ppm</span>
                <span>250 ppm (Макс)</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Math result tables (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Salt additions dashboard table */}
            <div className="bg-[#0B0F19] rounded-2xl border border-[#1E2638] overflow-hidden">
              <div className="bg-[#121826]/75 px-4.5 py-3 border-b border-[#1E2638] flex justify-between items-center">
                <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">Грами солей для внесення</span>
                <span className="text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Точний розрахунок
                </span>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-[#1E2638]/60 text-xs font-sans">
                
                {/* Headers */}
                <div className="grid grid-cols-4 p-3 font-mono font-bold text-[9px] text-slate-500 text-center uppercase tracking-wider">
                  <span className="text-left">РЕАГЕНТ</span>
                  <span>ЗАТОРНА ВОДА</span>
                  <span>ПРОМИВНА ВОДА</span>
                  <span className="text-right text-emerald-400">СУМА</span>
                </div>

                {/* row 1: CaCl2 */}
                <div className="grid grid-cols-4 p-3.5 items-center text-center">
                  <div className="text-left flex flex-col">
                    <span className="text-slate-200 font-black">CaCl₂</span>
                    <span className="text-[9px] text-slate-450 font-mono">Хлорид Кальцію</span>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">{(cacl2MashG).toFixed(2)} г</span>
                  <span className="font-mono text-slate-300 font-bold">{(cacl2SpargeG).toFixed(2)} г</span>
                  <span className="font-mono text-right font-black text-[#FF9F1C] text-sm">{(cacl2TotalG).toFixed(2)} г</span>
                </div>

                {/* row 2: CaSO4 */}
                <div className="grid grid-cols-4 p-3.5 items-center text-center">
                  <div className="text-left flex flex-col">
                    <span className="text-slate-200 font-black">CaSO₄</span>
                    <span className="text-[9px] text-slate-450 font-mono">Гіпс (Сульфат)</span>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">{(caso4MashG).toFixed(2)} г</span>
                  <span className="font-mono text-slate-300 font-bold">{(caso4SpargeG).toFixed(2)} г</span>
                  <span className="font-mono text-right font-black text-sky-400 text-sm">{(caso4TotalG).toFixed(2)} г</span>
                </div>

              </div>

              {/* Table Footer: resultant Calcium */}
              <div className="bg-[#121826]/30 px-4.5 py-3 flex justify-between items-center border-t border-[#1E2638] text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Beaker className="w-3.5 h-3.5 text-sky-450" />
                  Сумарний вміст Кальцію (Ca²⁺) в суслі:
                </span>
                <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/15 rounded-lg">
                  {calciumMashPpm.toFixed(0)} ppm
                </span>
              </div>
            </div>

            {/* Flavor profile indicators */}
            <div className={`p-4 rounded-2xl border ${ionProfile.border} bg-[#0B0F19] flex flex-col gap-1.5`}>
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-widest font-mono text-slate-500 font-bold">Профіль пивного балансу (SO₄²⁻ / Cl⁻ Ratio)</span>
                <span className="text-[10px] font-mono font-black text-slate-450 bg-[#121826] px-2 py-0.5 rounded border border-[#1E2638]">
                  Коеф. {sulfToChlorideRatio.toFixed(2)}
                </span>
              </div>
              <p className={`font-serif text-sm font-black uppercase tracking-tight ${ionProfile.color} mt-0.5`}>
                {ionProfile.label}
              </p>
              <p className="text-[11px] text-slate-400 leading-normal leading-relaxed">
                {ionProfile.desc}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
