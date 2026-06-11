/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Ruler, 
  Thermometer, 
  Settings2, 
  Wine, 
  Sparkles,
  Layers
} from "lucide-react";

interface FermentationGeometryProps {
  targetVolume: number;
}

export default function FermentationGeometry({ targetVolume = 55.0 }: FermentationGeometryProps) {
  // 1. Core Kettle Dimensions
  const [kettleD, setKettleD] = useState<number>(40.0); // inner diameter in cm
  const [kettleH, setKettleH] = useState<number>(50.0); // inner height in cm

  // 2. Measure type: "volume" or "distance"
  const [measureType, setMeasureType] = useState<"volume" | "distance">("volume");

  // Since measure value can mean either Volume in liters or Distance from edge in cm
  const [measureVolume, setMeasureVolume] = useState<number>(30.0); // Liters
  const [measureDistance, setMeasureDistance] = useState<number>(15.0); // Distance from top edge in cm

  // 3. Process Variables
  const [wortTemp, setWortTemp] = useState<number>(95.0); // °C during measurement
  
  // Trub loss derived dynamically from Target Volume (Trub_Loss = Target_Volume * 0.05)
  const trubLoss = targetVolume * 0.05; 
  
  const [fermenterLoss, setFermenterLoss] = useState<number>(3.0); // Yeast sediment/dry hopping loss in L

  // 4. Calculations Step-by-Step
  
  // Calculate hot volume (V_hot)
  let vHot = 0;
  let hLiq = 0;

  if (measureType === "distance") {
    // Distance from edge to liquid: liquid height = Kettle height - distance from top edge
    hLiq = Math.max(0, kettleH - measureDistance);
    // V_hot (liters) = Pi * R^2 * h_liq (cm3) / 1000
    const radius = kettleD / 2;
    vHot = (Math.PI * Math.pow(radius, 2) * hLiq) / 1000;
  } else {
    vHot = measureVolume;
    // Back-calculate liquid height for fancy visual representation
    const radius = kettleD / 2;
    hLiq = (vHot * 1000) / (Math.PI * Math.pow(radius, 2));
  }

  // Ensure absolute bounds
  vHot = Math.max(0, vHot);
  hLiq = Math.max(0, hLiq);

  // Temperature shrinkage correction
  const tempDiff = Math.max(0, wortTemp - 20);
  const shrinkageFactor = 1 + (tempDiff * 0.0004);
  const vCold = vHot / shrinkageFactor;

  // Volume in fermenter (after cooling and leaving trub behind)
  const vFermenter = Math.max(0, vCold - trubLoss);

  // Net beer volume for packaging (e.g., priming/bottling/kegging)
  const vPackaging = Math.max(0, vFermenter - fermenterLoss);

  // Shrinkage percentage
  const shrinkageFraction = (shrinkageFactor - 1) * 100;

  return (
    <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-5" id="fermentation-geometry-card">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9F1C]/10 p-2.5 rounded-xl border border-[#FF9F1C]/25 pb-3">
            <Ruler className="w-5 h-5 text-[#FF9F1C] mt-0.5" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider text-[#FF9F1C] uppercase font-mono">
              Конфігурація Резервуару
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5">
              Геометрія та Об'єми Ферментації
            </h3>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
        Блок розраховує фактичний охолоджений об'єм сусла з урахуванням високих температур варки, геометричних параметрів котла, відстані до дзеркала рідини та сумарних технологічних втрат.
      </p>

      {/* PARAMETERS CONFIGURATION ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
        
        {/* INPUT PARAMETERS FORM CONTAINER (Left column) */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4 font-sans text-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
            <Settings2 className="w-3.5 h-3.5 text-[#FF9F1C]" />
            Геометричні розміри варочника
          </h4>

          {/* Core Dimensions: Kettle Diameter and Kettle Height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Kettle Diameter Selector */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  Діаметр котла (Kettle_D)
                </span>
                <span className="font-mono text-xs font-black text-[#FF9F1C]">
                  {kettleD.toFixed(1)} см
                </span>
              </div>
              <input 
                type="range"
                min="20.0"
                max="100.0"
                step="0.5"
                value={kettleD}
                onChange={(e) => setKettleD(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>20 см</span>
                <span>60 см</span>
                <span>100 см</span>
              </div>
            </div>

            {/* Kettle Height Selector */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  Висота котла (Kettle_H)
                </span>
                <span className="font-mono text-xs font-black text-[#FF9F1C]">
                  {kettleH.toFixed(1)} см
                </span>
              </div>
              <input 
                type="range"
                min="20.0"
                max="120.0"
                step="0.5"
                value={kettleH}
                onChange={(e) => setKettleH(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>20 см</span>
                <span>70 см</span>
                <span>120 см</span>
              </div>
            </div>
            
          </div>

          {/* Toggle Choice Measurement Type: Volume / Distance */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-300">
                Спосіб заміру рідини (Measure_Type)
              </label>
              
              <div className="flex bg-[#121826] p-1 rounded-xl border border-[#1E2638] text-[10px] font-bold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMeasureType("volume")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
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
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    measureType === "distance" 
                      ? "bg-[#FF9F1C] text-[#0B0F19]" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Відстань від краю (см)
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
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1.5 pt-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Гарячий об'єм (Measure_Value):</span>
                    <span className="font-mono text-xs font-black text-[#FF9F1C] bg-[#121826] px-2.5 py-1 border border-[#1E2638] rounded-lg">
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
                    className="accent-[#FF9F1C] h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>5 л</span>
                    <span>77.5 л</span>
                    <span>150 л</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="dist-slider"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1.5 pt-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Вільна відстань від краю (Measure_Value):</span>
                    <span className="font-mono text-xs font-black text-sky-400 bg-[#121826] px-2.5 py-1 border border-[#1E2638] rounded-lg">
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
                    className="accent-sky-400 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0 cм (До краю)</span>
                    <span>{(kettleH / 2).toFixed(0)} см</span>
                    <span>{kettleH.toFixed(0)} см (Порожній)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic font-mono mt-0.5 text-center">
                    Математично розрахована висота сусла в котлі: <strong className="text-white text-xs">{(kettleH - measureDistance).toFixed(1)} см</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Temperature and Losses sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Temperature */}
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#1E2638] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Температура
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
                className="accent-[#FF9F1C] h-1 w-full bg-[#121826] rounded appearance-none cursor-pointer"
              />
              <span className="text-[8px] text-slate-500 italic block mt-0.5 leading-snug">
                Коефіцієнт стиснення: {shrinkageFactor.toFixed(3)}x (~{(shrinkageFraction).toFixed(1)}% стиснення)
              </span>
              <div className="text-[10px] text-slate-300 bg-[#121826]/60 p-2 rounded-lg border border-[#1E2638] mt-1 leading-normal font-sans">
                {wortTemp > 20 ? (
                  <span>
                    🌡️ Оскільки замір проводиться при гарячій температурі (<strong>{wortTemp}°C</strong>), сусло розширене. При охолодженні воно стиснеться на <strong className="text-[#FF9F1C]">{shrinkageFraction.toFixed(1)}%</strong>. Тому гарячий об'єм <strong>{vHot.toFixed(1)} л</strong> перетвориться на <strong>{vCold.toFixed(1)} л</strong> холодного сусла.
                  </span>
                ) : (
                  <span>
                    ❄️ Сусло вже холодне (<strong>20°C</strong>), замір не потребує теплового коригування. Охолоджений об'єм дорівнює замінному об'єму — <strong>{vCold.toFixed(1)} л</strong>.
                  </span>
                )}
              </div>
            </div>

            {/* Trub Loss - read only with informative badge */}
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#1E2638] flex flex-col gap-1.5 justify-between">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  Втрати у котлі
                </span>
                <span className="font-mono font-bold text-amber-500">{trubLoss.toFixed(1)} л</span>
              </div>
              <div className="text-[8.5px] text-slate-500 leading-snug mt-1 italic">
                Враховано автоматично як 5% від цільового батчу в {targetVolume.toFixed(0)} л.
              </div>
            </div>

            {/* Fermenter Loss */}
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#1E2638] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Осад ферментера
                </span>
                <span className="font-mono font-bold text-slate-200">{fermenterLoss.toFixed(1)} л</span>
              </div>
              <input 
                type="range"
                min="0.0"
                max="15.0"
                step="0.5"
                value={fermenterLoss}
                onChange={(e) => setFermenterLoss(parseFloat(e.target.value))}
                className="accent-[#FF9F1C] h-1 w-full bg-[#121826] rounded appearance-none cursor-pointer"
              />
              <span className="text-[8px] text-slate-500 italic block mt-0.5 leading-snug">
                Дріжджовий осад на дні ЦКТ, втрати сухого хмелю.
              </span>
            </div>

          </div>
        </div>

        {/* OUTPUT ANALYSIS BOX (Right column) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-[#0B0F19] p-5 rounded-3xl border border-[#1E2638] flex flex-col justify-between gap-4" id="geometry-outputs">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black block mb-4 border-b border-[#1E2638] pb-1.5">
              Результати об'ємів сусла
            </span>

            {/* Three key outputs calculated step-by-step requested by the user */}
            <div className="flex flex-col gap-3">
              
              {/* Output 1: V_cold - Охолоджене сусло в котлі */}
              <div className="bg-[#121826]/80 p-3.5 rounded-2xl border border-[#1E2638] flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                    Охолоджене сусло в котлі (V_cold):
                  </span>
                  <span className="text-slate-400 text-[10px]">Темп. корекція</span>
                </div>
                <div className="text-right mt-1.5">
                  <span className="text-xl font-black text-white font-mono">
                    <strong>{vCold.toFixed(2)}</strong> <span className="text-xs font-bold text-slate-400">л</span>
                  </span>
                </div>
              </div>

              {/* Output 2: V_fermenter - Сусло у ферментері */}
              <div className="bg-[#121826]/80 p-3.5 rounded-2xl border border-[#1E2638] flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#FF9F1C]" />
                    Сусло у ферментері (після зливу/бруху):
                  </span>
                  <span className="text-slate-400 text-[10px]">V_fermenter</span>
                </div>
                <div className="text-right mt-1.5">
                  <span className="text-xl font-black text-sky-400 font-mono">
                    <strong>{vFermenter.toFixed(2)}</strong> <span className="text-xs font-bold text-slate-400">л</span>
                  </span>
                </div>
              </div>

              {/* Output 3: V_packaging - Чисте пиво на розлив */}
              <div className="bg-gradient-to-r from-[#FF9F1C]/10 to-[#FF9F1C]/2 p-4 rounded-2xl border border-[#FF9F1C]/30 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-slate-100 text-xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Wine className="w-4 h-4 text-[#FF9F1C]" />
                    Чисте пиво на розлив (для праймера):
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold bg-[#FF9F1C]/20 px-1.5 py-0.5 rounded text-[#FF9F1C]">
                    V_packaging
                  </span>
                </div>
                <div className="text-right mt-2.5">
                  <span className="text-3xl font-black text-[#FF9F1C] font-mono leading-none">
                    <strong>{vPackaging.toFixed(2)}</strong> <span className="text-sm font-bold text-slate-200">л</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick analysis dynamic visual warning based on geometry */}
          {vPackaging <= 0 ? (
            <div className="p-3 bg-rose-500/15 border border-rose-500/35 rounded-xl text-xs text-rose-300 leading-normal animate-pulse">
              ⚠️ <strong>Увага:</strong> Сумарні технологічні втрати ({ (trubLoss + fermenterLoss).toFixed(1) } л) більші за об'єм охолодженого сусла! Ви отримаєте 0 л пива на розлив. Будь ласка, замініть розміри або об'єм заповнення котла.
            </div>
          ) : (
            <div className="p-3 bg-[#121826] border border-[#1E2638] rounded-xl text-[11px] text-slate-400 leading-relaxed flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#FF9F1C] shrink-0" />
              <span>
                Ви втрачаєте <strong>{(vCold - vPackaging).toFixed(1)} л</strong> (на котел і дріжджі) від початкової гарячої варки. Ефективність передачі: <strong>{((vPackaging / Math.max(0.1, vCold)) * 100).toFixed(0)}%</strong>.
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
