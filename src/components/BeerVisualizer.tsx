/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface BeerVisualizerProps {
  og: number;
  fg: number;
  attenuation: number;
  beerColorHex: string;
  ebc?: number;
  turbidity?: number;
}

export default function BeerVisualizer({ og, fg, attenuation, beerColorHex, ebc = 12.0, turbidity = 20 }: BeerVisualizerProps) {
  // Let's determine the beer profile description in Ukrainian based on FG (Brix)
  let bodyProfile = "Сухе (Питке)";
  let bodyDesc = "Легке тіло, чудова сухість та висока питкість. Ідеально для літніх сортів.";
  let opacityBonus = 0.85;

  if (fg >= 4.5) {
    bodyProfile = "Дуже повнотіле / Солодке";
    bodyDesc = "Щільний, десертний еліксир з оксамитовою солодкістю. Характерно для імперських стаутів.";
    opacityBonus = 1.0;
  } else if (fg >= 3.2) {
    bodyProfile = "Полнотіле (Насичене)";
    bodyDesc = "Багате солодове тіло, відчутна залишкова солодкість. Традиційні міцні елі.";
    opacityBonus = 0.95;
  } else if (fg >= 2.0) {
    bodyProfile = "Збалансоване";
    bodyDesc = "Досконала гармонія між солодовою солодкістю та сухістю кінцевого профілю.";
    opacityBonus = 0.9;
  }

  // Calculate estimated ABV
  const convertBrixToSG = (brix: number): number => {
    return 1 + (brix / (258.6 - (brix * 0.88)));
  };

  const sg_og = convertBrixToSG(og);
  const sg_fg = convertBrixToSG(fg);
  const estimatedABV = Math.max(0, (sg_og - sg_fg) * 131.25);

  // Appx liquid height based on attenuation
  const liquidHeightPercent = 85; 

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-[#121826] rounded-3xl border border-[#1E2638] relative overflow-hidden" id="beer-visualizer-card">
      {/* Subtle organic light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1E2638]/20 to-transparent pointer-events-none" />

      {/* Title */}
      <div className="mb-4 text-center z-10">
        <span className="text-[10px] font-black tracking-wider text-[#FF9F1C] uppercase font-mono">
          Візуалізація Ферментації
        </span>
        <h3 className="font-serif text-2xl text-white font-black mt-1">
          Ваш Пивний Профіль
        </h3>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-auto z-10">
        {/* Animated Drinking Pint Glass representing the beer state */}
        <div className="relative w-44 h-64 flex items-end justify-center">
          
          {/* Glass Contour and Outline */}
          <div className="absolute inset-0 border-r-2 border-l-2 border-b-4 border-slate-600/40 rounded-b-[4rem] rounded-t-md pointer-events-none z-30 shadow-[inset_0_-10px_25px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 inset-x-0 h-4 border-t-2 border-slate-600/30 rounded-t-md" />
          </div>

          {/* Liquid Container with Overflow hidden & round-bottom */}
          <div className="absolute inset-x-0.5 bottom-0.5 h-full rounded-b-[3.8rem] overflow-hidden flex items-end z-10">
            {/* Beer Liquid body with animated height & color */}
            <motion.div 
              className="w-full relative transition-colors duration-700"
              style={{ 
                height: `${liquidHeightPercent}%`,
                background: `linear-gradient(to top, rgba(0,0,0,0.3) 0%, ${beerColorHex} 70%, ${beerColorHex} 100%)`,
                opacity: opacityBonus
              }}
              layout
            >
              {/* Dynamic rising fermentation bubbles */}
              <div className="absolute inset-0 overflow-hidden opacity-40">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white/60 rounded-full"
                    style={{
                      width: Math.random() * 3 + 1.5 + "px",
                      height: Math.random() * 3 + 1.5 + "px",
                      left: Math.random() * 90 + 5 + "%",
                      bottom: "0px",
                    }}
                    animate={{
                      bottom: ["0%", "100%"],
                      opacity: [0, 0.8, 1, 0.4, 0],
                      x: [0, (Math.random() - 0.5) * 20, 0]
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * i * 0.4,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Turbidity cloudiness overlay representing haziness */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-500 overflow-hidden"
                style={{
                  background: "linear-gradient(to top, rgba(255, 253, 242, 0.45) 0%, rgba(255, 255, 255, 0.15) 100%)",
                  opacity: turbidity / 100 * 0.75, // Up to 75% max opacity to allow color to shine through
                  backdropFilter: `blur(${Math.min(5, (turbidity / 100) * 5)}px)`
                }}
              />

              {/* Dynamic sediment layer at the bottom */}
              <div className="absolute bottom-0 inset-x-0 h-2 bg-amber-950/20 border-t border-amber-950/30 blur-xs pointer-events-none" />
            </motion.div>

            {/* Beer Foam (Head) riding on top of liquid */}
            <motion.div 
              className="absolute w-[101%] left-[-0.5%] h-6 bg-stone-100 rounded-full border-b border-stone-200/20 shadow-inner z-20"
              style={{ bottom: `calc(${liquidHeightPercent}% - 10px)` }}
              animate={{ 
                y: [0, -1.5, 0],
                rotate: [-0.4, 0.4, -0.4]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Foam texture overlay */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:5px_5px]" />
            </motion.div>
          </div>

          {/* Quick Stats Overlaid on Glass (OG / FG transition) */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 bg-[#0B0F19]/90 py-1 px-3 border border-[#FF9F1C]/40 rounded-xl text-center z-40 shadow-lg">
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">
              OG (Початкова)
            </span>
            <span className="text-xs font-black font-mono text-white leading-none">
              {og.toFixed(1)} °Bx
            </span>
          </div>

          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 bg-[#0B0F19]/90 py-1.5 px-3 border border-[#FF9F1C] rounded-xl text-center z-40 shadow-2xl">
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-300 font-bold">
              FG (Кінцева)
            </span>
            <span className="text-sm font-black font-mono text-[#FF9F1C] leading-none">
              {fg.toFixed(1)} °Bx
            </span>
          </div>
        </div>

        {/* Detailed brewing metrics panel */}
        <div className="flex-1 w-full max-w-xs flex flex-col gap-3.5 text-left">
          {/* Estimated ABV box */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-[#1E2638] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Розрахована міцність</p>
              <h4 className="font-serif text-2xl font-black text-[#FF9F1C] mt-0.5 leading-tight">
                {estimatedABV.toFixed(1)}% <span className="text-xs text-slate-300 font-sans font-normal">ABV</span>
              </h4>
            </div>
            <div className="bg-[#FF9F1C]/10 p-2 rounded-lg border border-[#FF9F1C]/15 h-9 w-9 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[#FF9F1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Body thickness profile and description */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-[#1E2638] flex flex-col gap-1.5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Профіль тіла пива</p>
              <h4 className="font-serif text-base font-black text-white mt-0.5">
                {bodyProfile}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {bodyDesc}
            </p>
          </div>

          {/* Color & EBC Box */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-[#1E2638] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-sans">Розрахунковий колір</p>
              <h4 className="font-serif text-base font-black text-[#FF9F1C] mt-0.5 leading-tight flex items-center gap-1.5 font-mono">
                <span className="w-3.5 h-3.5 rounded-full border border-white/25 inline-block shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ backgroundColor: beerColorHex }} />
                {ebc.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal normal-case">EBC</span>
              </h4>
            </div>
            <span className="font-mono text-[9px] uppercase font-black bg-[#FF9F1C]/10 text-[#FF9F1C] px-2 py-0.5 rounded border border-[#FF9F1C]/15">
              {(ebc / 1.97).toFixed(1)} SRM
            </span>
          </div>

          {/* Haze & Turbidity Box */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-[#1E2638] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-sans">Показник мутності</p>
              <h4 className="font-serif text-base font-black text-sky-400 mt-0.5 leading-tight font-mono">
                {turbidity.toFixed(0)}% <span className="text-xs text-slate-400 font-sans font-normal normal-case">Haze</span>
              </h4>
            </div>
            <span className="text-[10px] text-slate-300 font-medium font-sans">
              {turbidity === 0 ? "☀️ Блискуче" : turbidity > 50 ? "☁️ Насичений джус" : "⛅ Помірна мутність"}
            </span>
          </div>

          {/* Attenuation progress bar */}
          <div className="bg-[#0b0f19]/60 p-3.5 rounded-xl border border-[#1E2638]">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase mb-1.5">
              <span>Зброджування</span>
              <span className="font-mono text-[#FF9F1C] font-black">{attenuation.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#121826] h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#d97706] to-[#FF9F1C] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, attenuation))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
