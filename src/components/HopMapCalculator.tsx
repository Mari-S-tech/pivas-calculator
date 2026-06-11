/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, 
  Trash2, 
  Plus, 
  Info, 
  HelpCircle, 
  ChevronDown, 
  Settings2,
  Beer
} from "lucide-react";

export interface HopAddition {
  id: string;
  name: string;
  alphaAcid: number; // AA% (e.g. 11.5)
  weight: number;    // grams (e.g. 30)
  time: number;      // minutes of boil or days of dry hop
  isDryHop?: boolean;
}

interface HopMapCalculatorProps {
  ogBrix: number;
  targetVolume: number;
  onTotalIbuChange: (ibu: number) => void;
  additions: HopAddition[];
  setAdditions: (val: HopAddition[] | ((prev: HopAddition[]) => HopAddition[])) => void;
  spiceRows?: any[];
}

// Popular hop varieties with expanded American varieties
const HOP_PRESETS = [
  { name: "Magnum", aa: 12.5 },
  { name: "Challenger", aa: 7.0 },
  { name: "Saaz (Жатецький)", aa: 3.5 },
  { name: "Cascade", aa: 6.0 },
  { name: "Citra", aa: 13.5 },
  { name: "Centennial", aa: 10.5 },
  { name: "Perle", aa: 8.0 },
  { name: "Hersbrucker", aa: 4.0 },
  { name: "Amarillo", aa: 9.0 },
  { name: "Mosaic", aa: 12.0 },
  { name: "Simcoe", aa: 13.0 },
  { name: "Chinook", aa: 12.5 },
  { name: "El Dorado", aa: 14.0 },
  { name: "Galaxy", aa: 14.5 },
  { name: "Sabro", aa: 13.5 },
];

const SPICE_NAMES: Record<string, string> = {
  "coriander": "Коріандр",
  "orange_sweet": "Апельсинова цедра (солодка)",
  "orange_bitter": "Апельсинова цедра (гірка Кюрасао)",
  "lemon_peel": "Лимонна цедра"
};

const getSpiceName = (spiceId: string): string => {
  return SPICE_NAMES[spiceId] || spiceId;
};

export default function HopMapCalculator({
  ogBrix = 12.0,
  targetVolume = 55.0,
  onTotalIbuChange,
  additions = [],
  setAdditions,
  spiceRows = []
}: HopMapCalculatorProps) {
  // Conversions for SG
  const convertBrixToSG = (brix: number): number => {
    return 1 + (brix / (258.6 - (brix * 0.88)));
  };
  const sg = convertBrixToSG(ogBrix);

  // Form input state
  const [hopName, setHopName] = useState("");
  const [alphaAcid, setAlphaAcid] = useState<number>(6.5);
  const [weight, setWeight] = useState<number>(25);
  const [time, setTime] = useState<number>(30);
  const [isDryHop, setIsDryHop] = useState<boolean>(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Calculate individual Tinseth IBU
  const calculateIndividualIbu = (add: Omit<HopAddition, "id">, currentSg: number, volL: number): number => {
    if (add.isDryHop) return 0; // "Якщо обрано її, IBU для цього хмелю дорівнює 0."
    if (volL <= 0 || add.weight <= 0 || add.alphaAcid <= 0 || add.time <= 0) return 0;
    
    // Bigness Factor = 1.65 * 0.000125^(SG - 1)
    const bignessFactor = 1.65 * Math.pow(0.000125, currentSg - 1);
    
    // Boil Time Factor = (1 - e^(-0.04 * Time)) / 4.15
    const boilTimeFactor = (1 - Math.exp(-0.04 * add.time)) / 4.15;
    
    // Utilization
    const utilization = bignessFactor * boilTimeFactor;
    
    // IBU = (Weight * AA * Utilization * 10) / Vol
    return (add.weight * add.alphaAcid * utilization * 10) / volL;
  };

  // Compute Total IBU
  const totalIbu = additions.reduce((acc, current) => {
    return acc + calculateIndividualIbu(current, sg, targetVolume);
  }, 0);

  // Combine hops and spices for chronological timeline
  const combinedItems = [
    ...additions.map(h => ({
      id: h.id,
      type: "hop" as const,
      name: h.name,
      weight: h.weight,
      time: h.time,
      isDryHop: !!h.isDryHop,
      detail: `${h.alphaAcid.toFixed(1)}% AA`,
      ibuContribution: h.isDryHop ? 0 : calculateIndividualIbu(h, sg, targetVolume)
    })),
    ...spiceRows.map(s => ({
      id: s.id,
      type: "spice" as const,
      name: getSpiceName(s.spiceId),
      weight: s.weight,
      time: s.time !== undefined ? s.time : 10,
      isDryHop: false,
      detail: "Спеція",
      ibuContribution: 0
    }))
  ].sort((a, b) => {
    // Dry hop items should show up at the very bottom
    if (a.isDryHop && !b.isDryHop) return 1;
    if (!a.isDryHop && b.isDryHop) return -1;
    if (a.isDryHop && b.isDryHop) return b.time - a.time; // sort dry hops by days descending
    return b.time - a.time; // sort boil times descending
  });

  // Emit total IBU reactively
  useEffect(() => {
    if (onTotalIbuChange) {
      onTotalIbuChange(totalIbu);
    }
  }, [totalIbu, onTotalIbuChange]);

  const handleAddHop = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = hopName.trim() || `Хміль ${additions.length + 1}`;
    
    const newAdd: HopAddition = {
      id: Math.random().toString(36).substr(2, 9),
      name: finalName,
      alphaAcid,
      weight,
      time: isDryHop && time === 30 ? 3 : time, // Reasonable default for dry hops if they didn't adjust 30 mins
      isDryHop
    };

    setAdditions(prev => [...prev, newAdd]);
    
    // Reset form with generic defaults
    setHopName("");
    setAlphaAcid(6.5);
    setWeight(25);
    setTime(15);
    setIsDryHop(false);
  };

  const handleRemoveHop = (id: string) => {
    setAdditions(prev => prev.filter(item => item.id !== id));
  };

  const applyPreset = (preset: typeof HOP_PRESETS[0]) => {
    setHopName(preset.name);
    setAlphaAcid(preset.aa);
  };

  // Determine bitterness profile & colors
  const getBitternessTier = (ibu: number) => {
    if (ibu < 15) return { label: "Ніжна / Низька", color: "text-blue-400 font-mono", bg: "bg-blue-500/10 border-blue-500/20" };
    if (ibu < 35) return { label: "Збалансована / Округла", color: "text-emerald-400 font-mono", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (ibu < 60) return { label: "Виражена / Відчутна", color: "text-amber-400 font-mono", bg: "bg-amber-500/10 border-amber-500/20" };
    return { label: "Екстремальна / IPA-стиль", color: "text-rose-500 font-mono", bg: "bg-rose-500/10 border-rose-500/25" };
  };

  const bitterness = getBitternessTier(totalIbu);

  return (
    <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col gap-5" id="hop-map-card">
      
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/15 p-2.5 rounded-xl border border-emerald-500/25">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase font-mono">
              БЛОК 6: Розрахунок гіркоти
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-black mt-0.5">
              Хмелева карта варки (Hop Schedule)
            </h3>
          </div>
        </div>

        {/* Formula Explainer Button */}
        <button 
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          type="button"
          className="p-2 rounded-xl bg-[#0B0F19] border border-[#1E2638] text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1 text-[11px] font-medium font-sans"
        >
          <HelpCircle className="w-4 h-4 text-[#FF9F1C]" />
          <span>Формула Тінсета</span>
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
        Контролюйте хмелевий профіль та гіркоту готового пива. Розрахунки проводяться за математичною моделлю Глена Тінсета (Glenn Tinseth) з урахуванням щільності сусла перед розливом.
      </p>

      {/* FORMULA EXPLANATION BANNER */}
      <AnimatePresence>
        {showFormulaInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-[#0B0F19] rounded-2xl border border-emerald-500/20 text-xs text-slate-300 leading-relaxed space-y-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1 font-sans">
              <Info className="w-4 h-4" />
              <span>Фізика формули Tinseth</span>
            </div>
            <p className="text-slate-300">
              Гіркота в пиві виражається в міжнародних одиницях <strong>IBU</strong> (International Bitterness Units) і залежить від коефіцієнта корисної дії хмелю (утилізації), ваги та вмісту альфа-кислоти:
            </p>
            <div className="p-3 bg-[#121826] rounded-xl border border-[#1E2638] font-mono text-[11px] text-amber-400 space-y-1">
              <div>• Bigness Factor (Коеф. густини) = 1.65 × 0.000125^(SG - 1)</div>
              <div>• Boil Time Factor (Коеф. часу) = (1 - e^(-0.04 × Time)) / 4.15</div>
              <div>• Коеф. утилізації = Bigness Factor × Boil Time Factor</div>
              <div>• IBU додавання = (Вага (г) × Alpha % × Утилізація × 10) / Цільовий Об'єм (л)</div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              * Завдяки цій математиці, чим густіше початкове сусло ({ogBrix.toFixed(1)} °Bx / {sg.toFixed(3)} SG) чи менший час кипіння — тим нижча утилізація альфа-кислот.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT: INPUT FORM & ADDED LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-1">
        
        {/* INPUTS PANEL (5 Cols) */}
        <form onSubmit={handleAddHop} className="lg:col-span-5 flex flex-col gap-4 font-sans text-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
            <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
            Додати нову порцію хмелю
          </h4>

          {/* Quick variety selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Популярні типи (швидке заповнення)</span>
            <div className="flex flex-wrap gap-1 bg-[#0B0F19] p-2 rounded-2xl border border-[#1E2638]">
              {HOP_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    hopName === preset.name 
                      ? "bg-emerald-500 text-[#0B0F19] border-emerald-500" 
                      : "bg-[#121826] text-slate-300 border-[#1E2638] hover:border-emerald-500/30 hover:text-white"
                  }`}
                >
                  {preset.name} ({preset.aa}%)
                </button>
              ))}
            </div>
          </div>

          {/* Hop Name Input */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>Сорт хмелю</span>
              <span className="text-[10px] text-slate-500 font-mono">текстове позначення</span>
            </label>
            <input 
              type="text" 
              placeholder="Введіть назву хмелю..."
              value={hopName}
              onChange={(e) => setHopName(e.target.value)}
              className="w-full font-mono bg-[#121826] border border-[#1E2638] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Alpha Acids % Slider */}
          <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                Вміст корисних Альфа-кислот (% AA)
              </span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  max="25"
                  value={alphaAcid} 
                  onChange={(e) => setAlphaAcid(Math.max(0.1, Math.min(25, parseFloat(e.target.value) || 6.5)))}
                  className="w-12 text-center font-mono font-bold text-xs bg-[#121826] border border-[#1E2638] rounded py-0.5 text-emerald-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono font-bold">%</span>
              </div>
            </div>
            
            <input 
              type="range"
              min="1.0"
              max="20.0"
              step="0.1"
              value={alphaAcid}
              onChange={(e) => setAlphaAcid(parseFloat(e.target.value))}
              className="accent-emerald-400 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>1.0% (Ароматичний)</span>
              <span>12.0% (Гіркий)</span>
              <span>20.0%+ (Супер Гіркий)</span>
            </div>
          </div>

          {/* Toggle for Dry Hop */}
          <div 
            onClick={() => setIsDryHop(!isDryHop)}
            className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex items-center gap-3 select-none cursor-pointer hover:border-emerald-500/20 transition-all"
          >
            <div className="relative">
              <input 
                type="checkbox" 
                checked={isDryHop} 
                onChange={() => {}} 
                className="sr-only"
              />
              <div className={`w-8 h-5 rounded-full transition-colors ${isDryHop ? 'bg-emerald-400' : 'bg-[#121826] border border-[#1E2638]'}`} />
              <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-slate-400 transition-transform ${isDryHop ? 'translate-x-3 bg-[#0B0F19]' : ''}`} />
            </div>
            <span className="text-xs font-bold text-slate-300">
              Сухе охмелення (Dry Hop) *(IBU = 0)*
            </span>
          </div>

          {/* Dual Weights and Mins controls */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Weight inputs */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-1.5 font-sans">
              <span className="text-slate-300 text-xs font-bold">Вага засипу (г)</span>
              <div className="flex items-center justify-between gap-1 mt-1 font-sans">
                <button
                  type="button"
                  onClick={() => setWeight(prev => Math.max(1, prev - 5))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-[#0B0F19] transition-colors cursor-pointer text-xs"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1"
                  max="500"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 25))}
                  className="w-10 text-center font-mono font-bold bg-transparent text-white focus:outline-none border-b border-[#1E2638] py-0.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setWeight(prev => Math.min(500, prev + 5))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-[#0B0F19] transition-colors cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Addition timing inputs */}
            <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#1E2638] flex flex-col gap-1.5 font-sans">
              <span className="text-slate-300 text-xs font-bold">
                {isDryHop ? "Період (днів)" : "Час варки (хв)"}
              </span>
              <div className="flex items-center justify-between gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setTime(prev => Math.max(0, prev - (isDryHop ? 1 : 5)))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-[#0B0F19] transition-colors cursor-pointer text-xs"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="0"
                  max={isDryHop ? 30 : 180}
                  value={time}
                  onChange={(e) => setTime(Math.max(0, parseInt(e.target.value) || (isDryHop ? 3 : 15)))}
                  className="w-10 text-center font-mono font-bold bg-transparent text-white focus:outline-none border-b border-[#1E2638] py-0.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setTime(prev => Math.min(isDryHop ? 30 : 180, prev + (isDryHop ? 1 : 5)))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-[#0B0F19] transition-colors cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl text-[#0B0F19] bg-emerald-400 hover:bg-emerald-350 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Внести хміль до карти</span>
          </button>
        </form>

        {/* RESULTS & SCHEDULE LIST (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0B0F19] p-4.5 rounded-3xl border border-[#1E2638] flex flex-col justify-between gap-5 relative">
          
          <div>
            <div className="flex justify-between items-center pb-2.5 border-b border-[#1E2638] mb-3">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
                Поточна хмелева сітка варки
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-mono">
                Для об'єму {targetVolume.toFixed(0)} л
              </span>
            </div>

            {/* SCROLLABLE TABLE/LIST */}
            <div className="max-h-[290px] overflow-y-auto pr-1.5 space-y-2 mt-1">
              <AnimatePresence initial={false}>
                {combinedItems.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3 relative font-sans"
                  >
                    <Beer className="w-8 h-8 text-slate-600 animate-bounce" />
                    <span>Схема завантажень порожня. Додайте хміль зліва або спеції у блоці засипу для відображення хронології.</span>
                  </motion.div>
                ) : (
                  combinedItems.map((item) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`flex items-center justify-between p-3.5 bg-[#121826] rounded-2xl border ${
                          item.type === "hop" ? "border-[#1E2638] hover:border-emerald-500/25" : "border-[#1E2638]/80 hover:border-[#FF9F1C]/25"
                        } gap-3 transition-all group font-sans`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-black text-white truncate">{item.name}</span>
                            {item.type === "hop" ? (
                              <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 rounded-md py-0.5">
                                {item.detail}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono bg-[#FF9F1C]/15 border border-[#FF9F1C]/25 text-[#FF9F1C] px-1.5 rounded-md py-0.5">
                                Спеція
                              </span>
                            )}
                            {item.isDryHop && (
                              <span className="text-[8px] font-mono bg-[#FF9F1C]/15 border border-[#FF9F1C]/20 text-[#FF9F1C] px-1.5 rounded-md py-0.5 uppercase font-bold animate-pulse">
                                Dry Hop
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-[10px] font-mono text-slate-400 mt-1">
                            <span>Засип: <strong>{item.weight} г</strong></span>
                            <span>
                              {item.isDryHop 
                                ? "Сухе охмелення:" 
                                : item.type === "hop" 
                                  ? "Час варки:" 
                                  : "Час внесення:"} <strong>{item.time} {item.isDryHop ? "днів" : "хв"}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Calculated contribution or stage info */}
                        <div className="text-right flex items-center gap-3">
                          {item.type === "hop" && (
                            <div className="flex flex-col">
                              <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 font-bold">Contribution</span>
                              <span className="text-xs font-mono font-black text-emerald-400">+{item.ibuContribution.toFixed(1)} IBU</span>
                            </div>
                          )}
                          {item.type === "hop" ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveHop(item.id)}
                              className="p-2 rounded-lg bg-[#0B0F19] text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                              title="Видалити хміль"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic px-2 font-mono" title="Редагується або видаляється в блоці 'Спеції та добавки' на Етапі 1">
                              Активна
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* LOWER IBU SUMMARY GAUGE & TOTAL */}
          <div className="border-t border-[#1E2638]/70 pt-4 mt-auto">
            <div className="flex items-end justify-between mb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Розрахована гіркота рецепту:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    {totalIbu.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-300 font-sans">IBU</span>
                </div>
              </div>

              {/* Bitterness Tier Status */}
              <div className={`p-2 rounded-xl text-[10px] border capitalize shadow-md flex flex-col gap-0.5 text-right font-medium ${bitterness.bg}`}>
                <span className="text-slate-400 text-[8px] font-mono uppercase tracking-widest block leading-none">Профіль сусла</span>
                <span className={bitterness.color}>{bitterness.label}</span>
              </div>
            </div>

            {/* Custom crafted color-coded line indicator of IBU level */}
            <div className="w-full h-2.5 bg-[#121826] rounded-full overflow-hidden flex border border-[#1E2638] relative mt-2.5">
              {/* Markers for sectors */}
              <div className="absolute left-[15%] h-full w-[1px] bg-slate-800 z-10" />
              <div className="absolute left-[35%] h-full w-[1px] bg-slate-800 z-10" />
              <div className="absolute left-[60%] h-full w-[1px] bg-slate-800 z-10" />

              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-rose-500 flex relative rounded-full"
                style={{ width: `${Math.min(100, (totalIbu / 90) * 100)}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalIbu / 90) * 100)}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
              <span>0 (Лайт)</span>
              <span>15 (Лагер)</span>
              <span>35 (Ель)</span>
              <span>60 (IPA)</span>
              <span>90+ (Дабл IPA)</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
