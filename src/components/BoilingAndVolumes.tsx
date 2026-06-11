/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Droplet, 
  Clock, 
  Settings2, 
  Beaker, 
  Zap, 
  ChevronRight,
  Ruler, 
  Thermometer, 
  Wine, 
  Sparkles,
  Layers
} from "lucide-react";

interface BoilingAndVolumesProps {
  targetVolume: number;
  onApplyOG?: (og: number) => void;

  // Lifted Boiling states
  totalEnergy: number;
  setTotalEnergy: (val: number) => void;
  boilTime: number;
  setBoilTime: (val: number) => void;
  preBoilVol: number;
  setPreBoilVol: (val: number) => void;
  preBoilBrix: number;
  setPreBoilBrix: (val: number) => void;
  evapCoeff: number;
  setEvapCoeff: (val: number) => void;

  // Lifted Kettle states
  kettleD: number;
  setKettleD: (val: number) => void;
  kettleH: number;
  setKettleH: (val: number) => void;
  measureType: "volume" | "distance" | "height";
  setMeasureType: (val: "volume" | "distance" | "height") => void;
  measureVolume: number;
  setMeasureVolume: (val: number) => void;
  measureDistance: number;
  setMeasureDistance: (val: number) => void;
  measureHeight: number;
  setMeasureHeight: (val: number) => void;
  wortTemp: number;
  setWortTemp: (val: number) => void;
  fermenterLoss: number;
  setFermenterLoss: (val: number) => void;
}

export default function BoilingAndVolumes({
  targetVolume = 55.0,
  onApplyOG,

  // Boiling States
  totalEnergy,
  setTotalEnergy,
  boilTime,
  setBoilTime,
  preBoilVol,
  setPreBoilVol,
  preBoilBrix,
  setPreBoilBrix,
  evapCoeff = 2.0,
  setEvapCoeff,

  // Kettle States
  kettleD,
  setKettleD,
  kettleH,
  setKettleH,
  measureType,
  setMeasureType,
  measureVolume,
  setMeasureVolume,
  measureDistance,
  setMeasureDistance,
  measureHeight,
  setMeasureHeight,
  wortTemp,
  setWortTemp,
  fermenterLoss,
  setFermenterLoss,
}: BoilingAndVolumesProps) {

  // 1. Calculations - Boiling Section
  const totalBoilOff = totalEnergy * evapCoeff; // Boil_off_Liters = Total_Energy_kWh * evapCoeff
  const boilHours = boilTime / 60;
  const avgPower = totalEnergy / (boilHours > 0 ? boilHours : 1);
  const avgBoilOffRate = totalBoilOff / (boilHours > 0 ? boilHours : 1);

  const postBoilVolRaw = preBoilVol - totalBoilOff;
  const postBoilVol = postBoilVolRaw > 0 ? postBoilVolRaw : 0.1;

  // Post_Brix = (Pre_Volume * Pre_Brix) / Post_Volume
  const ogFinal = (preBoilVol * preBoilBrix) / postBoilVol;

  // 2. Calculations - Kettle / volumes Section
  let vHot = 0;
  let hLiq = 0;
  const radius = kettleD / 2;

  if (measureType === "distance") {
    hLiq = Math.max(0, kettleH - measureDistance);
    vHot = (Math.PI * Math.pow(radius, 2) * hLiq) / 1000;
  } else if (measureType === "height") {
    hLiq = measureHeight;
    vHot = (Math.PI * Math.pow(radius, 2) * hLiq) / 1000;
  } else {
    vHot = measureVolume;
    hLiq = (vHot * 1000) / (Math.PI * Math.pow(radius, 2));
  }

  // Ensure bounds
  vHot = Math.max(0, vHot);
  hLiq = Math.max(0, hLiq);

  // Temperature shrinkage correction
  const tempDiff = Math.max(0, wortTemp - 20);
  const shrinkageFactor = 1 + (tempDiff * 0.0004);
  const vCold = vHot / shrinkageFactor;

  // Trub loss derived dynamically from Target Volume (Trub_Loss = Target_Volume * 0.05)
  const trubLoss = targetVolume * 0.05;

  // Volume in fermenter
  const vFermenter = Math.max(0, vCold - trubLoss);

  // Net beer volume for packaging (using lifted fermenterLoss)
  const vPackaging = Math.max(0, vFermenter - fermenterLoss);

  const shrinkageFraction = (shrinkageFactor - 1) * 100;

  return (
    <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-6" id="boiling-and-volumes-block">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9F1C]/15 p-2.5 rounded-xl border border-[#FF9F1C]/25">
            <Flame className="w-5 h-5 text-[#FF9F1C]" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider text-[#FF9F1C] uppercase font-mono">
              ЕТАП 2: ПРОЦЕС ВАРИЛЬНОГО ЦЕХУ
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5">
              КИП'ЯТІННЯ ТА ОБ'ЄМИ
            </h3>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
        Єдиний блок управління кип'ятінням, енерговитратами та геометрією резервуара. Розраховує випаровування сусла, кінцеву густину Brix за законом збереження маси, температурну усадку (V_cold) та літраж для пакування готового батчу.
      </p>

      {/* INNER TWO COLUMNS SUB-LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-2">
        
        {/* SUBCOLUMN L: ENERGY & EVAPORATION COMPONENT */}
        <div className="flex flex-col gap-5 border-r border-[#1E2638]/50 pr-0 xl:pr-6" id="boil-calc-subcol">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#FF9F1C] flex items-center gap-1.5 font-mono mb-1">
            <Zap className="w-4 h-4" />
            1. Термодинаміка та випаровування
          </h4>

          {/* Pre_boil_Vol input */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-[#FF9F1C]" />
                Об'єм перед кипінням (Pre_boil_Vol)
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
              max="150.0"
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

          {/* Timing & Energy controls stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Boil_time input */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold leading-normal text-slate-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Час кипіння (Boil_Time)
                </span>
                <span className="font-mono text-[#FF9F1C] font-black">{boilTime} хв</span>
              </div>
              <input 
                type="range"
                min="10"
                max="180"
                step="5"
                value={boilTime}
                onChange={(e) => setBoilTime(parseInt(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Total_Energy_kWh input */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold leading-normal text-slate-300">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Енергія варки (Total_Energy)
                </span>
                <span className="font-mono text-[#FF9F1C] font-black">{totalEnergy.toFixed(1)} кВт·год</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="15.0"
                step="0.1"
                value={totalEnergy}
                onChange={(e) => setTotalEnergy(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer"
              />
            </div>

          </div>

          {/* NEW FIELD: Evaporation Coefficient (л/кВт·год) */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-[#FF9F1C]" />
                Коефіцієнт випаровування (л / кВт·год)
              </span>
              <span className="font-mono text-xs font-black text-[#FF9F1C] bg-[#121826] px-2 py-0.5 border border-[#1E2638] rounded-md">
                {evapCoeff.toFixed(2)} л/кВт·год
              </span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="5.0"
              step="0.05"
              value={evapCoeff}
              onChange={(e) => setEvapCoeff(parseFloat(e.target.value))}
              className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
            />
            <span className="text-[10px] text-slate-500 italic block leading-snug">
              Швидкість випаровування води на 1 кВт·год за теплофізичним коефіцієнтом котла. За замовчуванням: 2.0 л.
            </span>
          </div>

          {/* Quick process calculations summary */}
          <div className="p-4 bg-[#0B0F19] rounded-2xl border border-[#1E2638] flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Загалом випарується сусла:</span>
              <span className="font-mono font-bold text-[#FF9F1C]">{totalBoilOff.toFixed(2)} л</span>
            </div>
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Потужність варочника:</span>
              <span className="font-mono text-slate-200">~{avgPower.toFixed(2)} кВт (швидкість ~{avgBoilOffRate.toFixed(2)} л/год)</span>
            </div>
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Залишок у котлі після кипіння:</span>
              <span className="font-mono text-slate-200">{postBoilVolRaw > 0 ? postBoilVolRaw.toFixed(1) : "0.0"} л</span>
            </div>
            
            {/* Sync Connection Button built-in */}
            {onApplyOG && ogFinal > 0 && ogFinal < 40 && (
              <button
                type="button"
                onClick={() => onApplyOG(parseFloat(ogFinal.toFixed(1)))}
                className="w-full mt-2 py-2 px-4 rounded-xl text-[#0B0F19] bg-[#FF9F1C] hover:bg-[#ffaa1d] font-mono font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Запитати як OG для Бродіння ({ogFinal.toFixed(1)} °Bx)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* SUBCOLUMN R: GEOMETRY & PHYSICAL KETTLE SIZES */}
        <div className="flex flex-col gap-5" id="kettle-geometry-subcol">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#FF9F1C] flex items-center gap-1.5 font-mono mb-1">
            <Ruler className="w-4 h-4" />
            2. Геометрія та об'єми резервуару
          </h4>

          {/* Kettle Diameter & Height selectors side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Kettle Diameter */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium font-serif">Діаметр котла (D)</span>
                <span className="font-mono text-[#FF9F1C] font-bold">{kettleD.toFixed(1)} см</span>
              </div>
              <input 
                type="range"
                min="20.0"
                max="100.0"
                step="0.5"
                value={kettleD}
                onChange={(e) => setKettleD(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Kettle Height */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium font-serif">Висота котла (H)</span>
                <span className="font-mono text-[#FF9F1C] font-bold">{kettleH.toFixed(1)} см</span>
              </div>
              <input 
                type="range"
                min="20.0"
                max="120.0"
                step="0.5"
                value={kettleH}
                onChange={(e) => setKettleH(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded appearance-none cursor-pointer"
              />
            </div>

          </div>

          {/* Toggle Choice Measurement Type: Volume / Distance / NEW: Height */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-300">
                Спосіб заміру рідини (Measure_Type)
              </label>
              
              <div className="flex bg-[#121826] p-1 rounded-xl border border-[#1E2638] text-[9px] font-bold self-start sm:self-auto gap-0.5">
                <button
                  type="button"
                  onClick={() => setMeasureType("volume")}
                  className={`px-2 py-1.5 rounded-lg transition-all ${
                    measureType === "volume" 
                      ? "bg-[#FF9F1C] text-[#0B0F19]" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Об'єм (л)
                </button>
                <button
                  type="button"
                  onClick={() => setMeasureType("distance")}
                  className={`px-2 py-1.5 rounded-lg transition-all ${
                    measureType === "distance" 
                      ? "bg-[#FF9F1C] text-[#0B0F19]" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Від краю (см)
                </button>
                <button
                  type="button"
                  onClick={() => setMeasureType("height")}
                  className={`px-2 py-1.5 rounded-lg transition-all ${
                    measureType === "height" 
                      ? "bg-[#FF9F1C] text-[#0B0F19]" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Фактичний стовп рідини від дна до дзеркала"
                >
                  Стовп (см)
                </button>
              </div>
            </div>

            {/* Subslider conditional depending on Measure_Type */}
            <AnimatePresence mode="wait">
              {measureType === "volume" ? (
                <motion.div 
                  key="vol-slider"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-1.5 pt-1"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Гарячий об'єм рідини:</span>
                    <span className="font-mono text-xs font-black text-[#FF9F1C] bg-[#121826] px-2 py-0.5 border border-[#1E2638] rounded">
                      {measureVolume.toFixed(1)} л
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="5.0"
                    max="150.0"
                    step="0.5"
                    value={measureVolume}
                    onChange={(e) => setMeasureVolume(parseFloat(e.target.value))}
                    className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded"
                  />
                </motion.div>
              ) : measureType === "distance" ? (
                <motion.div 
                  key="dist-slider"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-1.5 pt-1"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Вільна відстань від верхнього краю:</span>
                    <span className="font-mono text-xs font-black text-[#FF9F1C] bg-[#121826] px-2 py-0.5 border border-[#1E2638] rounded">
                      {measureDistance.toFixed(1)} см
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0.0"
                    max={Math.max(20.0, kettleH)}
                    step="0.5"
                    value={measureDistance}
                    onChange={(e) => setMeasureDistance(Math.min(parseFloat(e.target.value), kettleH))}
                    className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded"
                  />
                  <p className="text-[10px] text-slate-400 italic font-mono text-center">
                    Висота сусла у котлі: <strong>{(kettleH - measureDistance).toFixed(1)} см</strong>
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="height-slider"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-1.5 pt-1"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Фактичний стовп рідини від дна:</span>
                    <span className="font-mono text-xs font-black text-[#FF9F1C] bg-[#121826] px-2 py-0.5 border border-[#1E2638] rounded">
                      {measureHeight.toFixed(1)} см
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0.0"
                    max={Math.max(20.0, kettleH)}
                    step="0.5"
                    value={measureHeight}
                    onChange={(e) => setMeasureHeight(Math.min(parseFloat(e.target.value), kettleH))}
                    className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded"
                  />
                  <p className="text-[10px] text-slate-400 italic font-mono text-center">
                    Пряме вимірювання від дна до дзеркала рідини. Формула: V = (PI * R^2 * H) / 1000
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wort Temperature and Packaging Loss sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Wort Temperature and correction check */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Температура заміру
                </span>
                <span className="font-mono font-bold text-[#FF9F1C]">{wortTemp.toFixed(0)}°C</span>
              </div>
              <input 
                type="range"
                min="10"
                max="100"
                step="5"
                value={wortTemp}
                onChange={(e) => setWortTemp(parseInt(e.target.value))}
                className="accent-[#FF9F1C] h-1 bg-[#121826] rounded appearance-none cursor-pointer"
              />
              <span className="text-[8px] text-slate-500 italic block mt-0.5">
                Стиснення: {shrinkageFraction.toFixed(1)}% (фактор {shrinkageFactor.toFixed(3)}x)
              </span>
            </div>

            {/* Packaging / Fermenter Loss */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold leading-normal text-slate-300">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Осади дріжджів/хмелю
                </span>
                <span className="font-mono text-[#FF9F1C]/90 font-black">{fermenterLoss.toFixed(1)} л</span>
              </div>
              <input 
                type="range"
                min="0.0"
                max="15.0"
                step="0.5"
                value={fermenterLoss}
                onChange={(e) => setFermenterLoss(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1 bg-[#121826] rounded appearance-none cursor-pointer"
              />
            </div>

          </div>

          {/* Results Analysis Panel inside the Geometry right column */}
          <div className="bg-[#0B0F19] p-4 rounded-3xl border border-[#1E2638] flex flex-col gap-3">
            <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase font-black border-b border-[#1E2638] pb-1">
              Підсумкові літражі батчу
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#121826] p-2 rounded-xl text-center border border-[#1E2638]">
                <span className="text-[8px] text-slate-400 uppercase block font-mono">V_cold (котла)</span>
                <span className="text-xs font-mono font-black text-white">{vCold.toFixed(1)} л</span>
              </div>
              <div className="bg-[#121826] p-2 rounded-xl text-center border border-[#1E2638]">
                <span className="text-[8px] text-slate-400 uppercase block font-mono">Ферментер</span>
                <span className="text-xs font-mono font-black text-[#FF9F1C]">{vFermenter.toFixed(1)} л</span>
              </div>
              <div className="bg-[#FF9F1C]/10 p-2 rounded-xl text-center border border-[#FF9F1C]/20">
                <span className="text-[8px] text-[#FF9F1C] uppercase block font-mono">На розлив</span>
                <span className="text-xs font-mono font-black text-[#FF9F1C]">{vPackaging.toFixed(1)} л</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
