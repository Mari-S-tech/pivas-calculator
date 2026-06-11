import { useState } from "react";
import { 
  Download, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  X, 
  ExternalLink, 
  FileCode, 
  Sparkles, 
  Thermometer, 
  Calendar,
  Layers,
  Sprout,
  Activity,
  Gauge
} from "lucide-react";
import { BrewingInputs, CalculationResults } from "../types";
import { MALT_DATABASE, SPICE_DATABASE } from "./GrainBillCalculator";

interface RecipeExporterProps {
  inputs: BrewingInputs;
  outputs: CalculationResults;
  selectedPreset: string | null;
  beerColorHex: string;
  totalIbu: number;
  calculatedEbc: number;

  // New report inputs
  beerName: string;
  setBeerName: (val: string) => void;
  yeastStrain: string;
  setYeastStrain: (val: string) => void;
  fermentTemp: number;
  setFermentTemp: (val: number) => void;
  fermentDays: number;
  setFermentDays: (val: number) => void;

  grainRows: any[];
  spiceRows?: any[];
  hopAdditions: any[];
  packagingVol: number;

  useBetaGlucanPause?: boolean;
  betaGlucanTemp?: number;
  betaGlucanTime?: number;
  useProteinPause?: boolean;
  proteinTemp?: number;
  proteinTime?: number;
}

export default function RecipeExporter({
  inputs,
  outputs,
  selectedPreset,
  beerColorHex,
  totalIbu = 0,
  calculatedEbc,
  beerName,
  setBeerName,
  yeastStrain,
  setYeastStrain,
  fermentTemp,
  setFermentTemp,
  fermentDays,
  setFermentDays,
  grainRows = [],
  spiceRows = [],
  hopAdditions = [],
  packagingVol,
  useBetaGlucanPause = false,
  betaGlucanTemp = 45,
  betaGlucanTime = 15,
  useProteinPause = false,
  proteinTemp = 52,
  proteinTime = 20
}: RecipeExporterProps) {
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isLightReport, setIsLightReport] = useState(true);

  // Convert Brix to SG
  const convertBrixToSG = (brix: number): number => {
    return 1 + (brix / (258.6 - (brix * 0.88)));
  };
  const ogSG = convertBrixToSG(inputs.OG_beer);
  const fgSG = convertBrixToSG(outputs.Est_FG);

  const isSinglePause = inputs.Time_2 === 0;

  // Render Malt details dynamically for outputs
  const getMaltName = (maltId: string): string => {
    const malt = MALT_DATABASE.find((m) => m.id === maltId);
    return malt ? malt.name : maltId;
  };

  const getSpiceName = (spiceId: string): string => {
    const spice = SPICE_DATABASE.find((s) => s.id === spiceId);
    return spice ? spice.name : spiceId;
  };

  // Generate plain text report
  const generateRecipeText = (): string => {
    const currentDate = new Date().toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const grainsText = grainRows.length > 0 
      ? grainRows.map((g, idx) => `  ${idx + 1}. ${getMaltName(g.maltId)}: [ ${g.weight.toFixed(2)} кг ]`).join("\n")
      : "  Не вказано солодів";

    const spicesText = spiceRows.length > 0
      ? spiceRows.map((s, idx) => `  ${idx + 1}. ${getSpiceName(s.spiceId)}: [ ${s.weight} г ] — [ ${s.time !== undefined ? s.time : 10} хв ] (до кінця кипу)`).join("\n")
      : "  Не додано спецій та добавок";

    // Build Chronological Boil Schedule
    const boilHops = hopAdditions.filter(h => !h.isDryHop).map(h => ({
      type: "hop",
      name: h.name,
      weight: h.weight,
      time: h.time,
      detail: `[AA ${h.alphaAcid.toFixed(1)}%]`
    }));
    const boilSpices = spiceRows.map(s => ({
      type: "spice",
      name: getSpiceName(s.spiceId),
      weight: s.weight,
      time: s.time !== undefined ? s.time : 10,
      detail: "Спеція/добавка"
    }));
    const combinedBoil = [...boilHops, ...boilSpices].sort((a, b) => b.time - a.time);
    const dryHopsList = hopAdditions.filter(h => h.isDryHop);

    const boilScheduleText = combinedBoil.length > 0
      ? combinedBoil.map((item, idx) => `  ${idx + 1}. [ ${item.time} хв ] ${item.type === "hop" ? "Хміль" : "Спеція"} "${item.name}": [ ${item.weight} г ] (${item.detail})`).join("\n")
      : "  Не вказано завантажень під час кип'ятіння";

    const dryHopsText = dryHopsList.length > 0
      ? dryHopsList.map((h, idx) => `  ${idx + 1}. [ ${h.time} дн ] Сухе охмелення "${h.name}" [AA ${h.alphaAcid.toFixed(1)}%]: [ ${h.weight} г ]`).join("\n")
      : "  Немає сухого охмелення на бродіння";

    let dynamicAdvice = "";
    if (inputs.OG_beer >= 16) {
      dynamicAdvice += "• Висока початкова щільність (>16 Brix). Рекомендується подвійна норма або стартер дріжджів.\n";
    }
    if (inputs.Adjuncts_pct >= 15) {
      dynamicAdvice += `• Велика частка добавок (${inputs.Adjuncts_pct}%). Варто очікувати щільне хмарне тіло.\n`;
    }
    if (inputs.Temp_1 < 65) {
      dynamicAdvice += `• Сухе затирання (пауза ${inputs.Temp_1}°C). Пиво вийде сухим, пітким та міцним.\n`;
    } else {
      dynamicAdvice += `• Повнотіле затирання (пауза ${inputs.Temp_1}°C). Посилене оксамитове тіло солодкуватого смаку.\n`;
    }

    return `=====================================================
                 ЗВІТ РЕЦЕПТУ ПИВА (ESTIMATED FG REPORT)
=====================================================
Назва пива      : ${beerName || "Мій Крафтовий Сорт"}
Профіль стилю   : ${selectedPreset || "Індивідуальний рецепт"}
Згенеровано     : ${currentDate}
-----------------------------------------------------

1. ЗАСИП СОЛОДУ (GRAIN BILL)
-----------------------------------------------------
${grainsText}

2. СПЕЦІЇ ТА ДОБАВКИ (SPICES & ADDITIONS)
-----------------------------------------------------
${spicesText}

3. ТАЙМЕР ВАРКИ ТА СХЕМА ЗАВАНТАЖЕНЬ (BOIL SCHEDULE & CHRONOLOGY)
-----------------------------------------------------
• Графік гарячого кип'ятіння (Boil additions timer):
${boilScheduleText}

• Холодне сухе охмелення (Dry Hop schedule):
${dryHopsText}

4. ДРІЖДЖІ ТА БРОДІННЯ (FERMENTATION)
-----------------------------------------------------
• Дріжджі (штам)       : [ ${yeastStrain || "Не вказано (Wort Yeast)"} ]
• Температура бродіння : [ ${fermentTemp} °C ]
• Тривалість бродіння  : [ ${fermentDays} днів ]

5. ФІЗИЧНІ ПОКАЗНИКИ ТА КІНЦЕВІ МЕТРИКИ
-----------------------------------------------------
• Розрахункова Початкова щільність (OG) : [ ${inputs.OG_beer.toFixed(1)} °Brix ] (прибл. [ ${ogSG.toFixed(3)} SG ])
• Очікувана Кінцева щільність (FG)     : [ ${outputs.Est_FG.toFixed(2)} °Brix ] (прибл. [ ${fgSG.toFixed(3)} SG ])
• Вміст алкоголю за розрахунком (ABV)  : [ ${outputs.ABV_est.toFixed(2)}% vol ]
• Розрахункова гіркота (IBU)           : [ ${totalIbu.toFixed(1)} IBU ] (Tinseth)
• Колір пива (EBC)                     : [ ${calculatedEbc.toFixed(1)} EBC ]
• Чистий об'єм на розлив (Фізика)      : [ ${packagingVol.toFixed(1)} л ] (з урахуванням втрат)

6. РЕЖИМ ЗАТИРАННЯ (MESH-PLAN)
-----------------------------------------------------
• Бета-глюканова пауза : ${useBetaGlucanPause ? `[ ${betaGlucanTemp} °C ] — [ ${betaGlucanTime} хв ]` : "не використовується"}
• Білкова пауза        : ${useProteinPause ? `[ ${proteinTemp} °C ] — [ ${proteinTime} хв ]` : "не використовується"}
• Пауза 1 (Оцукрення)  : [ ${inputs.Temp_1.toFixed(1)} °C ] — [ ${inputs.Time_1} хв ]
• Пауза 2 (Меш-аут)    : ${isSinglePause ? "не використовується" : `[ ${inputs.Temp_2.toFixed(1)} °C ] — [ ${inputs.Time_2} хв ]`}

ТЕХНОЛОГІЧНІ КРАФТОВІ ПОРАДИ:
-----------------------------------------------------
${dynamicAdvice}
`;
  };

  const generateRecipeHtml = (): string => {
    // Helper to format metric highlighted numbers and their units with solid contrast
    const hl = (num: string | number, unit: string, color: string = "dark"): string => {
      let colorStyle = "";
      if (isLightReport) {
        if (color === "orange") colorStyle = "color: #C2410C;";
        else if (color === "amber") colorStyle = "color: #B45309;";
        else if (color === "green") colorStyle = "color: #047857;";
        else if (color === "blue") colorStyle = "color: #1D4ED8;";
        else if (color === "purple") colorStyle = "color: #6B21A8;";
        else if (color === "sky") colorStyle = "color: #0369A1;";
        else if (color === "red") colorStyle = "color: #B91C1C;";
        else if (color === "teal") colorStyle = "color: #0F766E;";
        else colorStyle = "color: #0F172A;";
      } else {
        if (color === "orange") colorStyle = "color: #FF9F1C;";
        else if (color === "amber") colorStyle = "color: #FF9F1C;";
        else if (color === "green") colorStyle = "color: #10B981;";
        else if (color === "blue") colorStyle = "color: #38BDF8;";
        else if (color === "purple") colorStyle = "color: #C084FC;";
        else if (color === "sky") colorStyle = "color: #38BDF8;";
        else if (color === "red") colorStyle = "color: #F87171;";
        else if (color === "teal") colorStyle = "color: #34D399;";
        else colorStyle = "color: #F8FAFC;";
      }
      return `<strong class="metric-highlight" style="${colorStyle}">${num}</strong>&nbsp;<span class="unit-highlight" style="${colorStyle}">${unit}</span>`;
    };

    // Build Chronological Boil Schedule
    const boilHops = hopAdditions.filter(h => !h.isDryHop).map(h => ({
      type: "hop",
      name: h.name,
      weight: h.weight,
      time: h.time,
      detail: `[AA ${h.alphaAcid.toFixed(1)}%]`
    }));
    const boilSpices = spiceRows.map(s => ({
      type: "spice",
      name: getSpiceName(s.spiceId),
      weight: s.weight,
      time: s.time !== undefined ? s.time : 10,
      detail: "Спеція/добавка"
    }));
    const combinedBoil = [...boilHops, ...boilSpices].sort((a, b) => b.time - a.time);
    const dryHopsList = hopAdditions.filter(h => h.isDryHop);

    const grainItemsHtml = grainRows.map(g => `
      <tr style="border-bottom: 1px solid ${isLightReport ? "#E2E8F0" : "#1E2638"};">
        <td style="padding: 10px; font-weight: bold; color: ${isLightReport ? "#1E293B" : "#f1f5f9"}; font-size: 13px;">
          ${getMaltName(g.maltId)}
        </td>
        <td style="padding: 10px; text-align: right;">
          ${hl(g.weight.toFixed(2), "кг", "amber")}
        </td>
      </tr>
    `).join("");

    const spiceItemsHtml = spiceRows.map(s => `
      <tr style="border-bottom: 1px solid ${isLightReport ? "#E2E8F0" : "#1E2638"};">
        <td style="padding: 10px; font-weight: bold; color: ${isLightReport ? "#1E293B" : "#f1f5f9"}; font-size: 13px;">
          ${getSpiceName(s.spiceId)}
        </td>
        <td style="padding: 10px; text-align: center;">
          ${hl(s.weight, "г", "dark")}
        </td>
        <td style="padding: 10px; text-align: right;">
          ${hl(s.time !== undefined ? s.time : 10, "хв", "orange")} <span style="font-size: 11px; color: ${isLightReport ? "#475569" : "#94a3b8"};">(до кінця)</span>
        </td>
      </tr>
    `).join("");

    const currentDate = new Date().toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let dynamicAdvice = "";
    if (inputs.OG_beer >= 16) {
      dynamicAdvice += "• Висока початкова щільність (>16 Brix). Рекомендується подвійна норма або стартер дріжджів.\n";
    }
    if (inputs.Adjuncts_pct >= 15) {
      dynamicAdvice += `• Велика частка добавок (${inputs.Adjuncts_pct}%). Варто очікувати щільне хмарне тіло.\n`;
    }
    if (inputs.Temp_1 < 65) {
      dynamicAdvice += `• Сухе затирання (пауза ${inputs.Temp_1}°C). Пиво вийде сухим, пітким та міцним.\n`;
    } else {
      dynamicAdvice += `• Повнотіле затирання (пауза ${inputs.Temp_1}°C). Посилене оксамитове тіло солодкуватого смаку.\n`;
    }

    return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Звіт рецепту пива — ${beerName || "Крафтовий Сорт"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: ${isLightReport ? "#0F172A" : "#f1f5f9"};
      line-height: 1.5;
      background-color: ${isLightReport ? "#FFFFFF" : "#0B0F19"};
      margin: 0;
      padding: 30px 15px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-card {
      max-width: 750px;
      margin: 0 auto;
      background: ${isLightReport ? "#FFFFFF" : "#121826"};
      border-radius: 16px;
      box-shadow: ${isLightReport ? "none" : "0 10px 40px rgba(0, 0, 0, 0.45)"};
      border: 1px solid ${isLightReport ? "#CBD5E1" : "#1E2638"};
      padding: 30px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid ${isLightReport ? "#E2E8F0" : "#1E2638"};
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .badge {
      display: inline-block;
      background-color: ${isLightReport ? "rgba(194, 65, 12, 0.08)" : "rgba(255, 159, 28, 0.1)"};
      color: ${isLightReport ? "#C2410C" : "#FF9F1C"};
      border: 1px solid ${isLightReport ? "rgba(194, 65, 12, 0.2)" : "rgba(255, 159, 28, 0.25)"};
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 950;
      margin: 5px 0;
      font-size: 26px;
      color: ${isLightReport ? "#0F172A" : "#ffffff"};
      letter-spacing: -0.02em;
    }
    h2 {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-bottom: 1px solid ${isLightReport ? "#CBD5E1" : "#1E2638"};
      padding-bottom: 6px;
      color: ${isLightReport ? "#B45309" : "#FF9F1C"};
      margin-top: 30px;
      margin-bottom: 15px;
      font-weight: 800;
    }
    .grid-metrics {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 15px !important;
      margin-bottom: 20px !important;
    }
    .metric-box {
      background: ${isLightReport ? "transparent" : "#0B0F19"};
      border: 1px solid ${isLightReport ? "#D3D3D3" : "#1E2638"};
      border-radius: 6px;
      padding: ${isLightReport ? "5px 6px !important" : "8px 10px !important"};
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: auto !important;
      box-shadow: none !important;
    }
    .metric-title {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${isLightReport ? "#475569" : "#94a3b8"};
      font-weight: 800;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 20px;
      font-weight: 900;
      color: ${isLightReport ? "#0F172A" : "#ffffff"};
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .metric-sub {
      font-size: 11px;
      color: ${isLightReport ? "#475569" : "#64748b"};
      margin-top: 4px;
      font-family: monospace;
    }
    .tbl {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .tbl-header {
      background-color: ${isLightReport ? "#F8FAFC" : "#0B0F19"};
      border-bottom: 2px solid ${isLightReport ? "#CBD5E1" : "#1E2638"};
    }
    .tbl-header th {
      padding: 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${isLightReport ? "#475569" : "#94a3b8"};
      font-weight: 700;
    }
    .meta-list {
      display: grid !important;
      grid-template-cols: repeat(2, 1fr) !important;
      gap: 12px;
      font-size: 13px;
      background: ${isLightReport ? "transparent" : "#0B0F19"};
      border: 1px solid ${isLightReport ? "#CBD5E1" : "#1E2638"};
      padding: 15px;
      border-radius: 8px;
    }
    .meta-list.mashing-grid {
      grid-template-cols: repeat(2, 1fr) !important;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .meta-title-label {
      color: ${isLightReport ? "#475569" : "#94a3b8"};
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
    }
    .meta-value-clean {
      color: ${isLightReport ? "#0F172A" : "#ffffff"};
      font-size: 14px;
      font-weight: 700;
    }
    .meta-value-clean strong {
      color: ${isLightReport ? "#B45309" : "#FF9F1C"};
      font-weight: 900;
    }
    .advice-card {
      background: ${isLightReport ? "rgba(194, 65, 12, 0.02)" : "rgba(255, 159, 28, 0.04)"};
      border: 1px solid ${isLightReport ? "rgba(194, 65, 12, 0.15)" : "rgba(255, 159, 28, 0.15)"};
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
    .advice-item {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: ${isLightReport ? "#334155" : "#cbd5e1"};
      margin-bottom: 8px;
    }
    .advice-item:last-child {
      margin-bottom: 0;
    }
    .advice-dot {
      color: ${isLightReport ? "#C2410C" : "#FF9F1C"};
      font-weight: bold;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: ${isLightReport ? "#475569" : "#64748b"};
      margin-top: 30px;
      border-top: 1px solid ${isLightReport ? "#E2E8F0" : "#1E2638"};
      padding-top: 15px;
      line-height: 1.6;
    }

    /* Programmatic metrics and units highlighting */
    .metric-highlight {
      font-weight: bold !important;
      font-size: 15px !important;
      font-family: -apple-system, BlinkMacSystemFont, monospace, sans-serif !important;
    }
    .unit-highlight {
      font-weight: bold !important;
      font-size: 13px !important;
    }

    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        background: #FFFFFF !important;
        color: #0F172A !important;
        padding: 0 !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .report-card {
        box-shadow: none !important;
        border: 1px solid #CBD5E1 !important;
        padding: 20px !important;
        background: #FFFFFF !important;
        margin: 0 auto !important;
      }
      .grid-metrics {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 15px !important;
      }
      .metric-box {
        background: transparent !important;
        border: 1px solid #D3D3D3 !important;
        padding: 5px 6px !important;
        min-height: auto !important;
        box-shadow: none !important;
      }
      .meta-list {
        display: grid !important;
        grid-template-cols: repeat(2, 1fr) !important;
        gap: 10px !important;
        background: transparent !important;
        border: 1px solid #CBD5E1 !important;
        padding: 10px 12px !important;
      }
      .tbl-header {
        background-color: #F8FAFC !important;
        border-bottom: 2px solid #CBD5E1 !important;
      }
      .tbl tr {
        border-bottom: 1px solid #E2E8F0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <span class="badge">ESTIMATED FG BREWER RECIPE REPORT</span>
      <h1>${beerName || "Крафтове Пиво"}</h1>
      <div style="font-size: 13px; color: ${isLightReport ? "#475569" : "#94a3b8"}; margin-top: 5px;">
        Профіль стилю: <strong style="color: ${isLightReport ? "#0F172A" : "#ffffff"};">${selectedPreset || "Індивідуальний рецепт"}</strong>
        &nbsp;&bull;&nbsp; Згенеровано: <strong style="color: ${isLightReport ? "#0F172A" : "#ffffff"};">${currentDate}</strong>
      </div>
    </div>

    <h2>1. Фізико-Хімічні Показники Сусла</h2>
    <div class="grid-metrics">
      <div class="metric-box">
        <div class="metric-title">ПОЧАТКОВА (OG)</div>
        <div class="metric-value font-mono">
          ${hl(inputs.OG_beer.toFixed(1), "°Brix", "amber")}
        </div>
        <div class="metric-sub">
          (${hl(ogSG.toFixed(3), "SG", "dark")})
        </div>
      </div>
      <div class="metric-box">
        <div class="metric-title">КІНЦЕВА (FG)</div>
        <div class="metric-value font-mono">
          ${hl(outputs.Est_FG.toFixed(2), "°Brix", "sky")}
        </div>
        <div class="metric-sub">
          (${hl(fgSG.toFixed(3), "SG", "dark")})
        </div>
      </div>
      <div class="metric-box">
        <div class="metric-title">МІЦНІСТЬ (ABV)</div>
        <div class="metric-value font-mono">
          ${hl(outputs.ABV_est.toFixed(2), "% vol", "green")}
        </div>
        <div class="metric-sub">
          зброд: ${hl(outputs.Final_atten.toFixed(1), "%", "dark")}
        </div>
      </div>
      <div class="metric-box">
        <div class="metric-title">ГІРКОТА (IBU)</div>
        <div class="metric-value font-mono">
          ${hl(totalIbu.toFixed(1), "IBU", "orange")}
        </div>
        <div class="metric-sub">Tinseth</div>
      </div>
      <div class="metric-box">
        <div class="metric-title">КОЛІР (EBC)</div>
        <div class="metric-value font-mono" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background-color:${beerColorHex}; border:1px solid rgba(0,0,0,0.15);"></span>
          ${hl(calculatedEbc.toFixed(1), "EBC", "orange")}
        </div>
        <div class="metric-sub">SRM: ${hl((calculatedEbc / 1.97).toFixed(1), "", "dark")}</div>
      </div>
      <div class="metric-box">
        <div class="metric-title">ФІЗИКА РОЗЛИВУ</div>
        <div class="metric-value font-mono">
          ${hl(packagingVol.toFixed(1), "л", "purple")}
        </div>
        <div class="metric-sub">Чистий об'єм</div>
      </div>
    </div>

    <h2>2. Сировинна Засипка (Засип Солодів)</h2>
    <table class="tbl">
      <tbody>
        ${grainItemsHtml}
      </tbody>
    </table>

    ${spiceRows.length > 0 ? `
    <h2>3. Спеції та Добавки</h2>
    <table class="tbl">
      <thead>
        <tr class="tbl-header">
          <th style="padding: 10px; text-align: left; color: ${isLightReport ? "#475569" : "#94a3b8"};">Найменування</th>
          <th style="padding: 10px; text-align: center; color: ${isLightReport ? "#475569" : "#94a3b8"};">Вага (г)</th>
          <th style="padding: 10px; text-align: right; color: ${isLightReport ? "#475569" : "#94a3b8"};">Час внесення</th>
        </tr>
      </thead>
      <tbody>
        ${spiceItemsHtml}
      </tbody>
    </table>
    ` : ""}

    <h2>4. Схема Гарячих Добавок (Boil Schedule)</h2>
    <table class="tbl" style="margin-bottom: 20px;">
      <thead>
        <tr class="tbl-header">
          <th style="padding: 10px; text-align: left; color: ${isLightReport ? "#475569" : "#94a3b8"};">Час внесення</th>
          <th style="padding: 10px; text-align: left; color: ${isLightReport ? "#475569" : "#94a3b8"};">Інгредієнт</th>
          <th style="padding: 10px; text-align: center; color: ${isLightReport ? "#475569" : "#94a3b8"};">Тип</th>
          <th style="padding: 10px; text-align: right; color: ${isLightReport ? "#475569" : "#94a3b8"};">Вага</th>
        </tr>
      </thead>
      <tbody>
        ${combinedBoil.length > 0 ? combinedBoil.map(item => `
          <tr style="border-bottom: 1px solid ${isLightReport ? "#E2E8F0" : "#1E2638"};">
            <td style="padding: 10px;">
              ${hl(item.time, "хв", "orange")}
            </td>
            <td style="padding: 10px; font-weight: bold; color: ${isLightReport ? "#0F172A" : "#f1f5f9"}; font-size: 13px;">
              ${item.name} <span style="font-weight: normal; font-size: 11px; color: ${isLightReport ? "#475569" : "#94a3b8"};">${item.detail}</span>
            </td>
            <td style="padding: 10px; text-align: center;">
              <span style="font-size: 10px; padding: 2px 8px; border-radius: 6px; display: inline-block; background-color: ${item.type === "hop" ? "rgba(16, 185, 129, 0.1)" : "rgba(249, 115, 22, 0.1)"}; color: ${item.type === "hop" ? "#047857" : "#C2410C"}; border: 1px solid ${item.type === "hop" ? "rgba(16, 185, 129, 0.2)" : "rgba(249, 115, 22, 0.2)"}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                ${item.type === "hop" ? "Хміль" : "Спеція / добавка"}
              </span>
            </td>
            <td style="padding: 10px; text-align: right;">
              ${hl(item.weight, "г", "dark")}
            </td>
          </tr>
        `).join("") : `
          <tr>
            <td colspan="4" style="padding: 24px; text-align: center; color: #64748b; font-style: italic;">
              Не вказано жодних гарячих добавок
            </td>
          </tr>
        `}
      </tbody>
    </table>

    ${dryHopsList.length > 0 ? `
    <h2>4.1. Сухе Охмелення на Головне Бродіння (Dry Hop Schedule)</h2>
    <table class="tbl">
      <thead>
        <tr class="tbl-header">
          <th style="padding: 10px; text-align: left; color: ${isLightReport ? "#475569" : "#94a3b8"};">Час контакту</th>
          <th style="padding: 10px; text-align: left; color: ${isLightReport ? "#475569" : "#94a3b8"};">Сорт хмелю</th>
          <th style="padding: 10px; text-align: right; color: ${isLightReport ? "#475569" : "#94a3b8"};">Вага</th>
        </tr>
      </thead>
      <tbody>
        ${dryHopsList.map(h => `
          <tr style="border-bottom: 1px solid ${isLightReport ? "#E2E8F0" : "#1E2638"};">
            <td style="padding: 10px;">
              ${hl(h.time, "дн.", "sky")}
            </td>
            <td style="padding: 10px; font-weight: bold; color: ${isLightReport ? "#0F172A" : "#f1f5f9"}; font-size: 13px;">
              ${h.name} <span style="font-weight: normal; font-size: 11px; color: ${isLightReport ? "#475569" : "#94a3b8"};">[AA ${h.alphaAcid.toFixed(1)}%]</span>
            </td>
            <td style="padding: 10px; text-align: right;">
              ${hl(h.weight, "г", "dark")}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    ` : ""}

    <h2>5. Дріжджовий Профіль & Бродіння</h2>
    <div class="meta-list">
      <div class="meta-item">
        <span class="meta-title-label">Штам дріжджів</span>
        <div class="meta-value-clean" style="color: ${isLightReport ? "#0284C7" : "#38bdf8"}; font-size: 15px;"><strong>${yeastStrain || "Не вказано"}</strong></div>
      </div>
      <div class="meta-item">
        <span class="meta-title-label">Умови шумування (бродіння)</span>
        <div class="meta-value-clean">
          ${hl(fermentTemp, "°C", "green")} протягом ${hl(fermentDays, "днів", "dark")}
        </div>
      </div>
    </div>

    <h2>6. Меш-план та паузи затирання</h2>
    <div class="meta-list mashing-grid">
      ${useBetaGlucanPause ? `
      <div class="meta-item">
        <span class="meta-title-label">Бета-глюканова пауза</span>
        <div class="meta-value-clean">
          ${hl(betaGlucanTemp, "°C", "dark")} тривалістю ${hl(betaGlucanTime, "хв", "dark")}
        </div>
      </div>
      ` : ""}
      ${useProteinPause ? `
      <div class="meta-item">
        <span class="meta-title-label">Білкова пауза</span>
        <div class="meta-value-clean">
          ${hl(proteinTemp, "°C", "dark")} тривалістю ${hl(proteinTime, "хв", "dark")}
        </div>
      </div>
      ` : ""}
      <div class="meta-item">
        <span class="meta-title-label">Пауза 1 (оцукрення)</span>
        <div class="meta-value-clean">
          ${hl(inputs.Temp_1.toFixed(1), "°C", "dark")} тривалістю ${hl(inputs.Time_1, "хв", "dark")}
        </div>
      </div>
      <div class="meta-item">
        <span class="meta-title-label">Пауза 2 (меш-аут / дод.)</span>
        <div class="meta-value-clean">
          ${isSinglePause ? '<span style="color: #64748b; font-style: italic;">не використовується</span>' : `${hl(inputs.Temp_2.toFixed(1), "°C", "dark")} тривалістю ${hl(inputs.Time_2, "хв", "dark")}`}
        </div>
      </div>
    </div>

    ${dynamicAdvice ? `
    <div class="advice-card">
      <span class="meta-title-label" style="color: ${isLightReport ? "#B45309" : "#FF9F1C"}; display: block; margin-bottom: 12px; font-weight: 800;">Технологічні поради</span>
      ${dynamicAdvice.split("\n").filter(line => line.trim().startsWith("•")).map(line => `
        <div class="advice-item">
          <span class="advice-dot">■</span>
          <div>${line.substring(2)}</div>
        </div>
      `).join("")}
    </div>
    ` : ""}

    <div class="footer">
      Звіт автоматично сформовано пивоварним аналітичним веб-додатком <strong>Estimated FG Brewer Panel</strong>.<br>
      Дякуємо, що вдосконалюєте пивоварну майстерність разом із нами!
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
  };

  // Download logic for txt
  const handleDownload = () => {
    const text = generateRecipeText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recipe_report_${beerName.trim().replace(/\s+/g, "_") || "unnamed"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download logic for html
  const handleDownloadHtml = () => {
    const htmlContent = generateRecipeHtml();
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recipe_report_${beerName.trim().replace(/\s+/g, "_") || "unnamed"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      const text = generateRecipeText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Не вдалося скопіювати", err);
    }
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  return (
    <>
      {/* 
        VISUAL COMPREHENSIVE PANEL: "ЗВІТ РЕЦЕПТУ"
        This matches exactly user requests to have an interactive, gorgeous summary card that acts as the final report!
      */}
      <div className="bg-[#121826] rounded-3xl p-6 shadow-2xl border border-[#1E2638] mt-6 flex flex-col gap-6" id="recipe-exporter-card">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2638]/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF9F1C]/10 p-2.5 rounded-xl border border-[#FF9F1C]/25">
              <FileText className="w-5 h-5 text-[#FF9F1C]" />
            </div>
            <div>
              <h3 className="font-serif font-black text-white text-base leading-tight">
                Звіт Рецепту Пива (Фінальні Налаштування)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Задайте фінальні параметри назви, дріжджів та бродіння перед збиранням звіту
              </p>
            </div>
          </div>

          {/* Theme Selector Toggle */}
          <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-xl border border-[#1E2638] self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsLightReport(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isLightReport 
                  ? "bg-[#FF9F1C] text-[#0B0F19]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Світлий звіт (Друк / PDF)
            </button>
            <button
              type="button"
              onClick={() => setIsLightReport(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isLightReport 
                  ? "bg-[#FF9F1C] text-[#0B0F19]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Темний звіт
            </button>
          </div>
        </div>

        {/* INPUT METADATA BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left Inputs Card */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] flex flex-col gap-3 font-sans">
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
                Назва пива / продукту
              </label>
              <input 
                type="text"
                placeholder="напр. Мій Соковитий NEIPA"
                value={beerName}
                onChange={(e) => setBeerName(e.target.value)}
                className="w-full bg-[#121826] border border-[#1E2638] rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-[#FF9F1C] focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                Штам дріжджів
              </label>
              <input 
                type="text"
                placeholder="напр. Lallemand Verdant IPA, US-05"
                value={yeastStrain}
                onChange={(e) => setYeastStrain(e.target.value)}
                className="w-full bg-[#121826] border border-[#1E2638] rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          {/* Right Inputs Card (Fermentation schema) */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] grid grid-cols-2 gap-3.5 font-sans">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 text-xs font-bold flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                Темп. бродіння (°C)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFermentTemp(Math.max(1, fermentTemp - 1))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={fermentTemp}
                  onChange={(e) => setFermentTemp(Math.max(1, parseInt(e.target.value) || 20))}
                  className="w-10 text-center font-mono font-bold bg-transparent text-white focus:outline-none border-b border-[#1E2638] py-0.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setFermentTemp(Math.min(40, fermentTemp + 1))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 text-xs font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Тривалість (днів)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFermentDays(Math.max(1, fermentDays - 1))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={fermentDays}
                  onChange={(e) => setFermentDays(Math.max(1, parseInt(e.target.value) || 14))}
                  className="w-10 text-center font-mono font-bold bg-transparent text-white focus:outline-none border-b border-[#1E2638] py-0.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setFermentDays(Math.min(90, fermentDays + 1))}
                  className="w-7 h-7 rounded bg-[#121826] flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* VISUAL LAYOUT PREVIEW (Live Stats Gauge) */}
        <div className="bg-[#0B0F19] p-5 rounded-2xl border border-[#1E2638] flex flex-col gap-4 font-sans">
          
          <div className="flex justify-between items-center border-b border-[#1E2638]/60 pb-2">
            <span className="text-[10px] font-mono tracking-wider text-[#FF9F1C] uppercase font-bold flex items-center gap-1.5">
              <Gauge className="w-4 h-4" />
              Підсумкові показники пивоваріння
            </span>
            <span className="text-[10px] text-slate-400 font-serif italic">
              Веб-аналіз Estimated FG
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-[#121826] p-3 rounded-xl border border-[#1E2638]/70 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Початкова (OG)</span>
              <span className="text-sm font-mono font-black text-[#FF9F1C] mt-1 block">{inputs.OG_beer.toFixed(1)} °Brix</span>
              <span className="text-[9px] text-slate-500 font-mono">({ogSG.toFixed(3)} SG)</span>
            </div>

            <div className="bg-[#121826] p-3 rounded-xl border border-[#1E2638]/70 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Кінцева (FG)</span>
              <span className="text-sm font-mono font-black text-sky-400 mt-1 block">{outputs.Est_FG.toFixed(2)} °Brix</span>
              <span className="text-[9px] text-slate-500 font-mono">({fgSG.toFixed(3)} SG)</span>
            </div>

            <div className="bg-[#121826] p-3 rounded-xl border border-[#1E2638]/70 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Міцність (ABV)</span>
              <span className="text-sm font-mono font-black text-emerald-400 mt-1 block">{outputs.ABV_est.toFixed(2)}% vol</span>
              <span className="text-[9px] text-slate-500 font-mono">зброд: {outputs.Final_atten.toFixed(1)}%</span>
            </div>

            <div className="bg-[#121826] p-3 rounded-xl border border-[#1E2638]/70 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Гіркота (IBU)</span>
              <span className="text-sm font-mono font-black text-amber-500 mt-1 block">{totalIbu.toFixed(1)}</span>
              <span className="text-[9px] text-slate-500 font-mono">Tinseth</span>
            </div>

            <div className="bg-[#121826] p-3 rounded-xl border border-[#1E2638]/70 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Колір (EBC)</span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm border border-black/30" style={{ backgroundColor: beerColorHex }} />
                <span className="text-sm font-mono font-black text-amber-700">{calculatedEbc.toFixed(1)}</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">SRM: ${(calculatedEbc / 1.97).toFixed(1)}</span>
            </div>

            <div className="bg-[#121826] p-3 rounded-xl border border-[#1E2638]/70 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Фізика розливу</span>
              <span className="text-sm font-mono font-black text-purple-400 mt-1 block">{packagingVol.toFixed(1)} л</span>
              <span className="text-[9px] text-slate-500 font-bold">Чистий об'єм</span>
            </div>
          </div>

        </div>

        {/* PRINT ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1.5">
          {/* Download TXT */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0B0F19] hover:bg-[#1E2638] text-white text-xs font-bold rounded-xl border border-[#1E2638] transition-all cursor-pointer hover:border-[#FF9F1C]/40 font-sans"
            title="Завантажити у текстовому форматі (.txt)"
            id="btn-recipe-txt"
          >
            <Download className="w-4 h-4 text-[#FF9F1C]" />
            <span>Скачати TXT</span>
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0B0F19] hover:bg-[#1E2638] text-white text-xs font-bold rounded-xl border border-[#1E2638] transition-all cursor-pointer min-w-[120px] hover:border-[#FF9F1C]/40 font-sans"
            title="Скопіювати текстовий звіт в буфер обміну"
            id="btn-recipe-copy"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Скопійовано!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#FF9F1C]" />
                <span>Скопіювати звіт</span>
              </>
            )}
          </button>

          {/* Print Recipe / PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FF9F1C]/10 hover:bg-[#FF9F1C]/20 text-[#FF9F1C] text-xs font-bold rounded-xl border border-[#FF9F1C]/20 transition-all cursor-pointer font-sans"
            title="Надрукувати рецепт або зберегти як PDF"
            id="btn-recipe-print"
          >
            <Printer className="w-4 h-4 text-[#FF9F1C]" />
            <span>Звіт Рецепту / PDF</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center italic leading-relaxed mt-1 font-sans">
          Підказка: При натисканні <strong>Звіт Рецепту / PDF</strong> ви зможете завантажити працездатну html-сторінку автодруку або викликати друк у вікні.
        </p>
      </div>

      {/* PDF / Print Assistance Modal */}
      {showPrintModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPrintModal(false);
            }
          }}
          className="fixed inset-0 z-[10000] flex items-start sm:items-center justify-center p-4 bg-[#0a0f1d]/85 backdrop-blur-md animate-fade-in overflow-y-auto" 
          id="print-guide-modal"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121826] border border-[#1E2638] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col gap-5 my-8 sm:my-auto overflow-visible font-sans"
          >
            {/* Top design accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF9F1C] to-amber-500 animate-pulse" />
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#FF9F1C]/10 p-2 rounded-xl text-[#FF9F1C] border border-[#FF9F1C]/20">
                  <Printer className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-white">Помічник друку та PDF</h3>
                  <p className="text-[11px] text-slate-400">Оберіть найзручніший спосіб збереження звіту</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-[#0B0F19] border border-[#1E2638] hover:border-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FF9F1C]/5 border border-[#FF9F1C]/15 rounded-2xl p-4 text-[12px] leading-relaxed text-amber-200/90 font-sans">
              <strong>⚠️ Обмеження фрейму AI Studio:</strong> Оскільки цей додаток працює у захищеному фреймі, ваш браузер може блокувати прямий виклик друку. Ми розробили кілька надійних методів вирішення:
            </div>

            <div className="flex flex-col gap-3">
              {/* Option 1: Standalone HTML Download */}
              <div className="bg-[#0B0F19] border border-[#1E2638] hover:border-[#FF9F1C]/30 p-4 rounded-2xl transition-all flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-amber-500/10 text-[#FF9F1C] border border-[#FF9F1C]/25 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Спосіб 1 • Рекомендовано</span>
                    <h4 className="text-xs font-bold text-slate-100 mt-1.5 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-[#FF9F1C]" />
                      Скачати файл автодруку (.html)
                    </h4>
                  </div>
                  <button
                    onClick={handleDownloadHtml}
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-[#FF9F1C] hover:bg-amber-500 text-[#0a0f1d] text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачати</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Завантажує спеціальний красивий HTML-файл. Просто запустіть його на вашому комп'ютері або телефоні — він самостійно відкриє рідний друк браузера для збереження в <strong>PDF без обмежень</strong>.
                </p>
              </div>

              {/* Option 2: Try native print again */}
              <div className="bg-[#0B0F19] border border-[#1E2638] hover:border-[#FF9F1C]/20 p-4 rounded-2xl transition-all flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Спосіб 2 • Прямий друк</span>
                    <h4 className="text-xs font-bold text-slate-100 mt-1.5 flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      Запустити прямий друк
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      try {
                        window.print();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-[#1E2638] hover:bg-[#2e3a54] text-slate-200 text-xs font-bold rounded-lg border border-[#1E2638] transition-all cursor-pointer"
                  >
                    <span>Друк</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Спробує викликати функцію друку прямо тут. Для найкращих результатів — відчиніть цей веб-додаток в окремій вкладці браузера, клікнувши на його посилання вгорі.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-1 pt-3 border-t border-[#1E2638]">
              <button 
                onClick={() => setShowPrintModal(false)}
                className="py-2 px-4 bg-[#121826] hover:bg-[#1E2638] border border-[#1E2638] text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Закрити вікно
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
