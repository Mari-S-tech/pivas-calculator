/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Flame, Droplet, Clock, Settings2, Beaker, Zap, ChevronRight } from "lucide-react";

interface BoilingCalculatorProps {
  onApplyOG?: (og: number) => void;
  totalEnergy: number;
  setTotalEnergy: (val: number) => void;
  boilTime: number;
  setBoilTime: (val: number) => void;
  preBoilVol: number;
  setPreBoilVol: (val: number) => void;
  preBoilBrix: number;
  setPreBoilBrix: (val: number) => void;
}

export default function BoilingCalculator({
  onApplyOG,
  totalEnergy = 5.5,
  setTotalEnergy,
  boilTime = 90,
  setBoilTime,
  preBoilVol = 25.0,
  setPreBoilVol,
  preBoilBrix = 11.0,
  setPreBoilBrix
}: BoilingCalculatorProps) {
  
  // Calculations based on specifications
  const totalBoilOff = totalEnergy * 1.25; // Boil_off_Liters = Total_Energy_kWh * 1.25 (Liters)
  const boilHours = boilTime / 60; // Boil_Hours = Boil_Time / 60
  const avgPower = totalEnergy / (boilHours > 0 ? boilHours : 1); // Avg_Power_kW = Total_Energy_kWh / Boil_Hours
  const avgBoilOffRate = totalBoilOff / (boilHours > 0 ? boilHours : 1); // Avg_Boil_off_Rate = Total_Boil_off / Boil_Hours

  // Guard against boiling down to negative water or zero
  const postBoilVolRaw = preBoilVol - totalBoilOff;
  const postBoilVol = postBoilVolRaw > 0 ? postBoilVolRaw : 0.1;

  // Mass conservation rule: preBoilVol * preBoilBrix = postBoilVol * ogFinal
  const ogFinal = (preBoilVol * preBoilBrix) / postBoilVol;

  return (
    <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-5" id="boiling-calculator-card">
      
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9F1C]/10 p-2.5 rounded-xl border border-[#FF9F1C]/25">
            <Flame className="w-5 h-5 text-[#FF9F1C]" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider text-[#FF9F1C] uppercase font-mono">
              Процес варильного цеху
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5">
              Кип'ятіння та густина сусла
            </h3>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
        Енергетичні розрахунки кип'ятіння. Швидкість та об'єм випаровування води вираховуються за теплофізичним коефіцієнтом перетворення підведеної електроенергії (кВт·год).
      </p>

      {/* INPUTS AND OUTPUTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mt-2">
        
        {/* LEFT COLUMN: Inputs form (7 cols on large screen) */}
        <div className="lg:col-span-7 flex flex-col gap-4 font-sans text-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
            <Settings2 className="w-3.5 h-3.5 text-[#FF9F1C]" />
            Параметри роботи
          </h4>

          {/* Pre_boil_Vol input */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-[#FF9F1C]" />
                Об'єм сусла перед кипінням (Pre_boil_Vol)
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={() => setPreBoilVol(Math.max(5.0, Number((preBoilVol - 0.5).toFixed(1))))}
                  className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                >
                  -
                </button>
                <input 
                  type="number" 
                  step="0.1"
                  min="5"
                  max="500"
                  value={preBoilVol} 
                  onChange={(e) => setPreBoilVol(Math.max(5, Number(parseFloat(e.target.value) || 25)))}
                  className="w-14 text-center font-mono font-bold text-xs bg-[#121826] border border-[#1E2638] rounded py-0.5 text-[#FF9F1C] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono font-bold">л</span>
                <button 
                  type="button"
                  onClick={() => setPreBoilVol(Math.min(500.0, Number((preBoilVol + 0.5).toFixed(1))))}
                  className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            
            <input 
              type="range"
              min="5.0"
              max="100.0"
              step="0.5"
              value={preBoilVol}
              onChange={(e) => setPreBoilVol(parseFloat(e.target.value))}
              className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
            />
          </div>

          {/* Pre_boil_Brix input */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Beaker className="w-3.5 h-3.5 text-[#FF9F1C]" />
                Густина перед кипінням (Pre_boil_Brix)
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={() => setPreBoilBrix(Math.max(1.0, Number((preBoilBrix - 0.2).toFixed(1))))}
                  className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                >
                  -
                </button>
                <input 
                  type="number" 
                  step="0.1"
                  min="1"
                  max="40"
                  value={preBoilBrix} 
                  onChange={(e) => setPreBoilBrix(Math.max(1, Number(parseFloat(e.target.value) || 11)))}
                  className="w-14 text-center font-mono font-bold text-xs bg-[#121826] border border-[#1E2638] rounded py-0.5 text-[#FF9F1C] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono font-bold">°Bx</span>
                <button 
                  type="button"
                  onClick={() => setPreBoilBrix(Math.min(40.0, Number((preBoilBrix + 0.2).toFixed(1))))}
                  className="w-5 h-5 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            
            <input 
              type="range"
              min="1.0"
              max="25.0"
              step="0.1"
              value={preBoilBrix}
              onChange={(e) => setPreBoilBrix(parseFloat(e.target.value))}
              className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Boil_time input */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Час кипіння (Boil_Time)
                </span>
                <span className="font-mono text-[#FF9F1C] font-bold text-xs">{boilTime} хв</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="range"
                  min="10"
                  max="180"
                  step="5"
                  value={boilTime}
                  onChange={(e) => setBoilTime(parseInt(e.target.value))}
                  className="flex-1 accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    min="10"
                    max="180"
                    value={boilTime} 
                    onChange={(e) => setBoilTime(Math.max(10, parseInt(e.target.value) || 90))}
                    className="w-12 text-center font-mono font-bold text-xs bg-[#121826] border border-[#1E2638] rounded py-0.5 text-[#FF9F1C] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono font-bold">хв</span>
                </div>
              </div>
            </div>

            {/* Total_Energy_kWh input */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Енергія кип'ятіння (Total_Energy)
                </span>
                <span className="font-mono text-[#FF9F1C] font-bold text-xs">{totalEnergy.toFixed(1)} кВт·год</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="range"
                  min="1.0"
                  max="15.0"
                  step="0.1"
                  value={totalEnergy}
                  onChange={(e) => setTotalEnergy(parseFloat(e.target.value))}
                  className="flex-1 accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    step="0.1"
                    min="1.0"
                    max="15.0"
                    value={totalEnergy} 
                    onChange={(e) => setTotalEnergy(Math.max(1.0, parseFloat(e.target.value) || 5.5))}
                    className="w-12 text-center font-mono font-bold text-xs bg-[#121826] border border-[#1E2638] rounded py-0.5 text-[#FF9F1C] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono font-bold">kWh</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Calculated Outputs (5 cols on large screen) */}
        <div className="lg:col-span-5 bg-[#0B0F19] p-5 rounded-3xl border border-[#1E2638] flex flex-col justify-between gap-5" id="boiling-outputs">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black block mb-3 border-b border-[#1E2638] pb-1.5">
              Аналітичні результати кип'ятіння
            </span>

            <div className="flex flex-col gap-3">
              {/* Output 1: Total Boil Off (Загалом випарується) */}
              <div className="flex flex-col bg-[#121826]/70 p-3.5 rounded-xl border border-[#1E2638] gap-1">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">Загальне випаровування</span>
                <span className="text-sm text-slate-200">
                  Загалом випарується: <strong className="text-[#FF9F1C] text-lg font-mono font-black">{totalBoilOff.toFixed(2)}</strong> л
                </span>
              </div>

              {/* Output 2: Process Analytics (Аналітика процесу) */}
              <div className="flex flex-col bg-[#121826]/70 p-3.5 rounded-xl border border-[#1E2638] gap-1">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">Аналітика процесу</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Середня потужність складе <strong className="text-white font-mono font-black">{avgPower.toFixed(2)}</strong> кВт (швидкість ~<strong className="text-sky-400 font-mono font-black">{avgBoilOffRate.toFixed(2)}</strong> л/год).
                </p>
              </div>

              {/* Output 3: Post Boil Volume */}
              <div className="flex justify-between items-center bg-[#121826]/70 px-3.5 py-2.5 rounded-xl border border-[#1E2638] text-xs">
                <span className="text-slate-300">Залишок у котлі (Post_boil_Vol):</span>
                <span className="text-slate-200 font-mono font-bold">
                  <strong className="text-white text-sm">{postBoilVolRaw > 0 ? postBoilVolRaw.toFixed(1) : "0.0"}</strong> л
                </span>
              </div>

              {/* Output 4: Final gravity OG_final */}
              <div className="bg-gradient-to-r from-[#FF9F1C]/5 to-transparent p-4 rounded-2xl border border-[#FF9F1C]/30 flex flex-col justify-between items-center text-center relative mt-1 shadow-[inset_0_0_15px_rgba(255,159,28,0.05)]">
                <span className="text-slate-300 text-xs font-serif font-bold uppercase tracking-wider mb-1">
                  Фінальна густина (OG) після варки
                </span>
                <span className="font-serif font-black text-3xl text-[#FF9F1C] font-mono">
                  <strong>{ogFinal.toFixed(1)}</strong> <span className="text-sm font-bold text-slate-300 font-mono">°Bx</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest">
                  Розраховано за сухим залишком
                </p>
              </div>
            </div>
          </div>

          {/* Sync Connection Button */}
          {onApplyOG && ogFinal > 0 && ogFinal < 40 && (
            <button
              type="button"
              onClick={() => onApplyOG(parseFloat(ogFinal.toFixed(1)))}
              className="w-full py-2.5 px-4 rounded-xl text-[#0B0F19] bg-[#FF9F1C] hover:bg-[#ffaa1d] font-mono font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Застосувати як OG для Бродіння</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {postBoilVolRaw <= 0 && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-300 leading-snug">
              ⚠️ <strong>Помилка:</strong> Загальна енергія або час кипіння завеликі для цього об'єму! Ви випарували все сусло.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
