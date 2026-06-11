/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface MashingChartProps {
  temp1: number;
  time1: number;
  temp2: number;
  time2: number;
  tAvg: number;
  mashMod: number;
}

export default function MashingChart({ temp1, time1, temp2, time2, tAvg, mashMod }: MashingChartProps) {
  // Let's build the coordinate points for the SVG graph.
  const isMultiPause = time2 > 0 && temp2 > 0;
  
  const p1Time = Math.max(10, time1);
  const p2Time = isMultiPause ? time2 : 0;
  const transitionTime = isMultiPause ? 5 : 0; // Transition ramp takes ~5 minutes representation
  const totalMins = p1Time + p2Time + transitionTime + 10; // extra padding at end

  // Y range: 45°C to 85°C
  const yMin = 45;
  const yMax = 85;

  // Viewbox coordinates: width 500, height 220
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Map mins to X coordinate
  const getX = (mins: number) => {
    return paddingLeft + (mins / totalMins) * chartWidth;
  };

  // Map temp °C to Y coordinate
  const getY = (t: number) => {
    const clampedT = Math.max(yMin, Math.min(yMax, t));
    return paddingTop + chartHeight - ((clampedT - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Generate path points
  const points: { x: number; y: number; label?: string; temp?: number }[] = [];
  
  // Starting warm-up point (assume starts mashing-in at 50°C)
  points.push({ x: getX(0), y: getY(Math.min(temp1, 50)), temp: Math.min(temp1, 50) });
  
  // Start of Pause 1 (instant warm-up representation line for simplification or nice slope)
  points.push({ x: getX(2), y: getY(temp1), temp: temp1 });
  
  // End of Pause 1
  const endP1Mins = 2 + p1Time;
  points.push({ x: getX(endP1Mins), y: getY(temp1), label: `Пауза 1: {val}°C`.replace('{val}', temp1.toString()), temp: temp1 });

  if (isMultiPause) {
    // Ramp up to Pause 2
    const startP2Mins = endP1Mins + transitionTime;
    points.push({ x: getX(startP2Mins), y: getY(temp2), temp: temp2 });
    
    // End of Pause 2
    const endP2Mins = startP2Mins + p2Time;
    points.push({ x: getX(endP2Mins), y: getY(temp2), label: `Пауза 2: {val}°C`.replace('{val}', temp2.toString()), temp: temp2 });
    
    // Final cooling/mashout projection
    points.push({ x: getX(totalMins), y: getY(temp2), temp: temp2 });
  } else {
    // Single pause extends to end
    points.push({ x: getX(totalMins), y: getY(temp1), temp: temp1 });
  }

  // Construct SVG Polyline string
  const pathString = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="bg-[#121826] rounded-3xl p-6 border border-[#1E2638] shadow-2xl flex flex-col justify-between" id="mashing-chart-card">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black tracking-wider text-[#FF9F1C] uppercase font-mono">
              Профіль затирання
            </span>
            <h3 className="font-serif text-2xl text-white font-black mt-1">
              Температурний Графік
            </h3>
          </div>
          <div className="bg-[#0B0F19] px-3 py-1.5 rounded-xl border border-[#1E2638] text-right">
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold">Сер. температура</p>
            <p className="text-base font-black text-[#FF9F1C] font-mono">
              {tAvg.toFixed(1)} °C
            </p>
          </div>
        </div>

        {/* SVG Render */}
        <div className="w-full h-44 bg-[#0B0F19] rounded-2xl border border-[#1E2638] text-white relative p-1 mb-4">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            {/* Guide Grid lines (Y axis temp markers) */}
            {[50, 60, 67, 72, 78].map((temp, idx) => {
              const y = getY(temp);
              return (
                <g key={idx}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke={temp === 67 ? "#FF9F1C" : "#1E2638"} 
                    strokeOpacity={temp === 67 ? "0.5" : "0.74"}
                    strokeDasharray={temp === 67 ? "4,4" : undefined}
                    strokeWidth={temp === 67 ? 1.5 : 1}
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3} 
                    fill={temp === 67 ? "#FF9F1C" : "#94A3B8"} 
                    fontSize="10" 
                    textAnchor="end"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {temp}°C
                  </text>
                </g>
              );
            })}

            {/* Area under the curve */}
            {points.length > 0 && (
              <path 
                d={`M ${getX(0)},${getY(yMin)} L ${pathString} L ${getX(totalMins)},${getY(yMin)} Z`}
                fill="url(#beerGradient)"
                opacity="0.1"
              />
            )}

            {/* Gradient definition for area */}
            <defs>
              <linearGradient id="beerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9F1C" />
                <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Main Temp curve line */}
            <motion.polyline
              fill="none"
              stroke="#FF9F1C"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pathString}
              initial={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Weighted average temp mark indicator */}
            <g>
              <line 
                x1={paddingLeft} 
                y1={getY(tAvg)} 
                x2={width - paddingRight} 
                y2={getY(tAvg)} 
                stroke="#FF9F1C" 
                strokeWidth="1" 
                strokeDasharray="2,2"
                opacity="0.4"
              />
              <circle cx={getX(totalMins * 0.75)} cy={getY(tAvg)} r="3.5" fill="#FF9F1C" />
              <text 
                x={getX(totalMins * 0.75) + 6} 
                y={getY(tAvg) - 4} 
                fill="#FF9F1C" 
                fontSize="9" 
                fontWeight="black"
                fontFamily="sans-serif"
              >
                Т_сер: {tAvg.toFixed(1)}°C
              </text>
            </g>

            {/* Interactive Data Nodes circles */}
            {points.filter(p => p.label).map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="5" 
                  fill="#0B0F19" 
                  stroke="#FF9F1C" 
                  strokeWidth="2" 
                />
                <text 
                  x={p.x} 
                  y={p.y - 10} 
                  fill="#FFFFFF" 
                  fontSize="9" 
                  fontWeight="black"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {p.label}
                </text>
              </g>
            ))}

            {/* Current Pause markers and durations */}
            <text 
              x={getX(p1Time / 2)} 
              y={getY(temp1) + 14} 
              fill="#94A3B8" 
              fontSize="9" 
              textAnchor="middle"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {time1} хв
            </text>
            {isMultiPause && (
              <text 
                x={getX(p1Time + transitionTime + p2Time / 2)} 
                y={getY(temp2) + 14} 
                fill="#94A3B8" 
                fontSize="9" 
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {time2} хв
              </text>
            )}

            {/* X-axis title (Time) */}
            <text 
              x={width - paddingRight} 
              y={height - 5} 
              fill="#94A3B8" 
              fontSize="9" 
              textAnchor="end"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Час (хвилин) →
            </text>
          </svg>
        </div>
      </div>

      {/* Chemical explanation banner */}
      <div className="bg-[#0B0F19]/65 p-4 rounded-xl border border-[#1E2638] flex flex-col gap-2.5 text-sm">
        <h4 className="font-serif font-bold text-white flex items-center gap-1.5 uppercase text-xs tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#FF9F1C]" />
          Біохімія затирання та вплив температури:
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className={`p-2.5 rounded-lg border flex flex-col justify-between transition-colors ${
            temp1 >= 60 && temp1 <= 66 ? "bg-[#121826] border-[#FF9F1C] text-white" : "bg-[#121826]/30 border-[#1E2638] text-slate-500"
          }`}>
            <span className="font-bold font-serif flex items-center justify-between text-xs">
              Бета-Амілаза (61-65°C)
              {temp1 >= 60 && temp1 <= 66 && <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FF9F1C]/20 text-[#FF9F1C] font-black">АКТИВНА</span>}
            </span>
            <span className="mt-1 leading-snug text-[11px]">
              Розщеплює крохмаль до високоферментованої мальтози. Ефект: {mashMod >= 0 ? `+${mashMod.toFixed(1)}%` : "менше"} до зброджуваності (сухе пиво).
            </span>
          </div>

          <div className={`p-2.5 rounded-lg border flex flex-col justify-between transition-colors ${
            (isMultiPause ? temp2 >= 67 && temp2 <= 75 : temp1 >= 67 && temp1 <= 75) 
              ? "bg-[#121826] border-[#FF9F1C] text-white" 
              : "bg-[#121826]/30 border-[#1E2638] text-slate-500"
          }`}>
            <span className="font-bold font-serif flex items-center justify-between text-xs">
              Альфа-Амілаза (68-72°C)
              {((isMultiPause ? temp2 : temp1) >= 67 && (isMultiPause ? temp2 : temp1) <= 75) && <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FF9F1C]/20 text-[#FF9F1C] font-black">АКТИВНА</span>}
            </span>
            <span className="mt-1 leading-snug text-[11px]">
              Утворює недеструктивні декстрини. Менша зброджуваність. Ефект: {mashMod < 0 ? `${mashMod.toFixed(1)}%` : "менше"} зброджуваності (густе пиво).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
