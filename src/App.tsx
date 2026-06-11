import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Beer, 
  Thermometer, 
  Flame, 
  HelpCircle, 
  RotateCcw, 
  Plus, 
  Minus,
  Sparkles,
  Percent,
  Atom,
  Droplet,
  Sprout,
  Save,
  Trash2,
  FolderOpen,
  FolderClosed,
  ChevronDown,
  Activity,
  Award,
  BookOpen,
  Download,
  Upload,
  Layers,
  Info
} from "lucide-react";

import { BrewingInputs, CalculationResults, BeerPreset } from "./types";
import BeerVisualizer from "./components/BeerVisualizer";
import MashingChart from "./components/MashingChart";
import BrewingGlossary from "./components/BrewingGlossary";
import RecipeExporter from "./components/RecipeExporter";
import WaterCalculator from "./components/WaterCalculator";
import BoilingAndVolumes from "./components/BoilingAndVolumes";
import GrainBillCalculator from "./components/GrainBillCalculator";
import HopMapCalculator, { HopAddition } from "./components/HopMapCalculator";
import MashPhCalculator from "./components/MashPhCalculator";

const presets: BeerPreset[] = [
  {
    name: "Класичний Лагер / Пілснер",
    description: "Світле сухе пиво з низькою кінцевою щільністю та високим ступенем зброджування.",
    inputs: {
      OG_beer: 11.5,
      Yeast_atten: 80,
      Adjuncts_pct: 0,
      Temp_1: 62.5,
      Time_1: 50,
      Temp_2: 72,
      Time_2: 15
    },
    colorHex: "#eab308" // vibrant amber golden
  },
  {
    name: "Американський Pale Ale / IPA",
    description: "Освіжаючий хмелевий ель із виваженою солодовою основою та помірним тілом.",
    inputs: {
      OG_beer: 14.5,
      Yeast_atten: 77,
      Adjuncts_pct: 6,
      Temp_1: 65,
      Time_1: 45,
      Temp_2: 72,
      Time_2: 20
    },
    colorHex: "#d97706" // rich amber copper
  },
  {
    name: "Бельгійське Пшеничне (Witbier)",
    description: "Зварене з великою часткою несолодженної пшениці та вівсяних пластівців.",
    inputs: {
      OG_beer: 12.0,
      Yeast_atten: 78,
      Adjuncts_pct: 15,
      Temp_1: 64,
      Time_1: 40,
      Temp_2: 72,
      Time_2: 25
    },
    colorHex: "#fef08a" // light straw golden
  },
  {
    name: "Насичений Стаут (Sweet Stout)",
    description: "Повнотіле десертне пиво за рахунок високих пауз затирання та спецсолодів.",
    inputs: {
      OG_beer: 16.5,
      Yeast_atten: 73,
      Adjuncts_pct: 22,
      Temp_1: 68,
      Time_1: 60,
      Temp_2: 0,
      Time_2: 0
    },
    colorHex: "#321d12" // deep stout black-brown
  }
];

export interface SavedRecipe {
  id: string;
  name: string;
  timestamp: string;
  state: {
    inputs: BrewingInputs;
    beerColorHex: string;
    beerEbc: number;
    beerTurbidity: number;
    selectedPreset: string | null;
    totalGrainWeight: number;
    targetVolume: number;
    useProteinPause: boolean;
    proteinTemp: number;
    proteinTime: number;
    waterRatio: number;
    totalEnergy: number;
    boilTime: number;
    preBoilVol: number;
    preBoilBrix: number;
    targetChloride: number;
    targetSulfate: number;
    grainRows: any[];
    spiceRows?: any[];
    flocType: "high" | "medium" | "low";
    additions: HopAddition[];
    beerName: string;
    yeastStrain: string;
    fermentTemp: number;
    fermentDays: number;
    evapCoeff: number;
    measureType: "volume" | "distance" | "height";
    measureVolume: number;
    measureDistance: number;
    measureHeight: number;
    wortTemp: number;
    fermenterLoss: number;
  };
}

export default function App() {
  const [currentStage, setCurrentStage] = useState<"preparation" | "execution">("preparation");
  
  const defaultInputs: BrewingInputs = {
    OG_beer: 12.5,
    Yeast_atten: 78,
    Adjuncts_pct: 10,
    Temp_1: 63,
    Time_1: 40,
    Temp_2: 72,
    Time_2: 20,
  };

  // State Declarations
  const [inputs, setInputs] = useState<BrewingInputs>(defaultInputs);
  const [beerColorHex, setBeerColorHex] = useState<string>("#f59e0b");
  const [beerEbc, setBeerEbc] = useState<number>(12.0);
  const [beerTurbidity, setBeerTurbidity] = useState<number>(20);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  const [totalGrainWeight, setTotalGrainWeight] = useState<number>(5.0);
  const [targetVolume, setTargetVolume] = useState<number>(55.0);

  // Protein pause states
  const [useProteinPause, setUseProteinPause] = useState<boolean>(false);
  const [proteinTemp, setProteinTemp] = useState<number>(52);
  const [proteinTime, setProteinTime] = useState<number>(20);

  // Beta-glucan pause states
  const [useBetaGlucanPause, setUseBetaGlucanPause] = useState<boolean>(false);
  const [betaGlucanTemp, setBetaGlucanTemp] = useState<number>(45);
  const [betaGlucanTime, setBetaGlucanTime] = useState<number>(15);

  // Hop schedule states
  const [totalIbu, setTotalIbu] = useState<number>(0);
  
  // Stage 1 & 2 Inputs
  const [waterRatio, setWaterRatio] = useState<number>(3.0);
  const [totalEnergy, setTotalEnergy] = useState<number>(5.5);
  const [boilTime, setBoilTime] = useState<number>(90);
  const [preBoilVol, setPreBoilVol] = useState<number>(65.0);
  const [preBoilBrix, setPreBoilBrix] = useState<number>(11.0);
  const [targetChloride, setTargetChloride] = useState<number>(80);
  const [targetSulfate, setTargetSulfate] = useState<number>(80);

  // Kettle Geometry - physical parameters (Defaults requested: D=47.5cm, H=50.5cm)
  const [kettleD, setKettleD] = useState<number>(47.5);
  const [kettleH, setKettleH] = useState<number>(50.5);
  const [measureType, setMeasureType] = useState<"volume" | "distance" | "height">("volume");
  const [measureVolume, setMeasureVolume] = useState<number>(50.0);
  const [measureDistance, setMeasureDistance] = useState<number>(15.0);
  const [measureHeight, setMeasureHeight] = useState<number>(35.0);
  const [wortTemp, setWortTemp] = useState<number>(100);
  const [fermenterLoss, setFermenterLoss] = useState<number>(2.0);

  // New report inputs
  const [beerName, setBeerName] = useState<string>("Мій NEIPA");
  const [yeastStrain, setYeastStrain] = useState<string>("Verdant IPA");
  const [fermentTemp, setFermentTemp] = useState<number>(20);
  const [fermentDays, setFermentDays] = useState<number>(14);
  const [evapCoeff, setEvapCoeff] = useState<number>(2.0);

  // Lifted child state lists
  const [grainRows, setGrainRows] = useState<any[]>([
    { id: "row-1", maltId: "pilsner", weight: 4.5 },
    { id: "row-2", maltId: "carahell", weight: 0.5 }
  ]);
  const [spiceRows, setSpiceRows] = useState<any[]>([]);
  const [flocType, setFlocType] = useState<"high" | "medium" | "low">("medium");
  const [additions, setAdditions] = useState<HopAddition[]>([
    { id: "1", name: "Magnum", alphaAcid: 12.5, weight: 30, time: 60 },
    { id: "2", name: "Saaz (Жатецький)", alphaAcid: 3.5, weight: 40, time: 15 }
  ]);

  // Recipe Profiles storage lists
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [profileNameInput, setProfileNameInput] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [outputs, setOutputs] = useState<CalculationResults>({
    T_avg: 63,
    Mash_mod: 6,
    Grain_mod: 1,
    Final_atten: 83,
    Est_FG: 2.125,
    ABV_est: 5.6
  });

  const [triggerAnimate, setTriggerAnimate] = useState(0);

  // Dynamic boil-off derivative
  const totalBoilOff = totalEnergy * evapCoeff;

  // React calculation routine
  const runCalculation = (currentInputs: BrewingInputs) => {
    const { OG_beer, Yeast_atten, Adjuncts_pct, Temp_1, Time_1, Temp_2, Time_2 } = currentInputs;
    
    let T_avg = 0;
    if (Time_2 === 0) {
      T_avg = Temp_1;
    } else {
      T_avg = ((Temp_1 * Time_1) + (Temp_2 * Time_2)) / (Time_1 + Time_2);
    }

    const Mash_mod = (67 - T_avg) * 1.5;
    const Grain_mod = Adjuncts_pct * 0.1;
    const Final_atten = Yeast_atten + Mash_mod - Grain_mod;
    const Est_FG = OG_beer - (OG_beer * (Final_atten / 100));
    const safeFG = Math.max(0.1, Math.min(OG_beer, Est_FG));

    const convertBrixToSG = (brix: number): number => {
      return 1 + (brix / (258.6 - (brix * 0.88)));
    };
    const sg_og = convertBrixToSG(OG_beer);
    const sg_fg = convertBrixToSG(safeFG);
    const ABV_est = Math.max(0, (sg_og - sg_fg) * 131.25);

    setOutputs({
      T_avg,
      Mash_mod,
      Grain_mod,
      Final_atten,
      Est_FG: safeFG,
      ABV_est
    });
  };

  // Run calculation on inputs updates
  useEffect(() => {
    runCalculation(inputs);
  }, [inputs]);

  // Handle Preset Select
  const applyPreset = (preset: BeerPreset) => {
    setInputs(preset.inputs);
    setBeerColorHex(preset.colorHex);
    setSelectedPreset(preset.name);
    setTriggerAnimate(prev => prev + 1);
  };

  const handleBoilTimeChange = (newTime: number) => {
    const currentHours = boilTime / 60;
    const avgPower = totalEnergy / (currentHours > 0 ? currentHours : 1.5);
    const newHours = newTime / 60;
    const newEnergy = avgPower * newHours;
    setBoilTime(newTime);
    setTotalEnergy(Math.max(0.1, Number(newEnergy.toFixed(2))));
  };

  // LOAD SESSION on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("brew_calculator_session");
      if (savedSession) {
        const data = JSON.parse(savedSession);
        if (data.inputs) setInputs(data.inputs);
        if (data.beerColorHex) setBeerColorHex(data.beerColorHex);
        if (data.beerEbc) setBeerEbc(data.beerEbc);
        if (data.beerTurbidity) setBeerTurbidity(data.beerTurbidity);
        if (data.selectedPreset) setSelectedPreset(data.selectedPreset);
        if (data.totalGrainWeight) setTotalGrainWeight(data.totalGrainWeight);
        if (data.targetVolume) setTargetVolume(data.targetVolume);
        if (data.useProteinPause !== undefined) setUseProteinPause(data.useProteinPause);
        if (data.proteinTemp !== undefined) setProteinTemp(data.proteinTemp);
        if (data.proteinTime !== undefined) setProteinTime(data.proteinTime);
        if (data.useBetaGlucanPause !== undefined) setUseBetaGlucanPause(data.useBetaGlucanPause);
        if (data.betaGlucanTemp !== undefined) setBetaGlucanTemp(data.betaGlucanTemp);
        if (data.betaGlucanTime !== undefined) setBetaGlucanTime(data.betaGlucanTime);
        if (data.waterRatio !== undefined) setWaterRatio(data.waterRatio);
        if (data.totalEnergy !== undefined) setTotalEnergy(data.totalEnergy);
        if (data.boilTime !== undefined) setBoilTime(data.boilTime);
        if (data.preBoilVol !== undefined) setPreBoilVol(data.preBoilVol);
        if (data.preBoilBrix !== undefined) setPreBoilBrix(data.preBoilBrix);
        if (data.targetChloride !== undefined) setTargetChloride(data.targetChloride);
        if (data.targetSulfate !== undefined) setTargetSulfate(data.targetSulfate);
        if (data.grainRows) setGrainRows(data.grainRows);
        if (data.spiceRows) setSpiceRows(data.spiceRows);
        if (data.flocType) setFlocType(data.flocType);
        if (data.additions) setAdditions(data.additions);
        if (data.beerName) setBeerName(data.beerName);
        if (data.yeastStrain) setYeastStrain(data.yeastStrain);
        if (data.fermentTemp !== undefined) setFermentTemp(data.fermentTemp);
        if (data.fermentDays !== undefined) setFermentDays(data.fermentDays);
        if (data.evapCoeff !== undefined) setEvapCoeff(data.evapCoeff);
        if (data.kettleD !== undefined) setKettleD(data.kettleD);
        if (data.kettleH !== undefined) setKettleH(data.kettleH);
        if (data.measureType) setMeasureType(data.measureType);
        if (data.measureVolume !== undefined) setMeasureVolume(data.measureVolume);
        if (data.measureDistance !== undefined) setMeasureDistance(data.measureDistance);
        if (data.measureHeight !== undefined) setMeasureHeight(data.measureHeight);
        if (data.wortTemp !== undefined) setWortTemp(data.wortTemp);
        if (data.fermenterLoss !== undefined) setFermenterLoss(data.fermenterLoss);
      }

      // Load Saved Custom Profiles List
      const savedProfiles = localStorage.getItem("brew_calculator_saved_recipes");
      if (savedProfiles) {
        setSavedRecipes(JSON.parse(savedProfiles));
      }
    } catch (e) {
      console.error("Error reading initial configs:", e);
    }
  }, []);

  // SAVE SESSION automatically on changes (ON-CHANGE PERSISTENCE)
  useEffect(() => {
    try {
      const stateObj = {
        inputs,
        beerColorHex,
        beerEbc,
        beerTurbidity,
        selectedPreset,
        totalGrainWeight,
        targetVolume,
        useProteinPause,
        proteinTemp,
        proteinTime,
        useBetaGlucanPause,
        betaGlucanTemp,
        betaGlucanTime,
        waterRatio,
        totalEnergy,
        boilTime,
        preBoilVol,
        preBoilBrix,
        targetChloride,
        targetSulfate,
        grainRows,
        spiceRows,
        flocType,
        additions,
        beerName,
        yeastStrain,
        fermentTemp,
        fermentDays,
        evapCoeff,
        kettleD,
        kettleH,
        measureType,
        measureVolume,
        measureDistance,
        measureHeight,
        wortTemp,
        fermenterLoss
      };
      localStorage.setItem("brew_calculator_session", JSON.stringify(stateObj));
    } catch (e) {
      console.warn("Error saving session state:", e);
    }
  }, [
    inputs,
    beerColorHex,
    beerEbc,
    beerTurbidity,
    selectedPreset,
    totalGrainWeight,
    targetVolume,
    useProteinPause,
    proteinTemp,
    proteinTime,
    useBetaGlucanPause,
    betaGlucanTemp,
    betaGlucanTime,
    waterRatio,
    totalEnergy,
    boilTime,
    preBoilVol,
    preBoilBrix,
    targetChloride,
    targetSulfate,
    grainRows,
    spiceRows,
    flocType,
    additions,
    beerName,
    yeastStrain,
    fermentTemp,
    fermentDays,
    evapCoeff,
    kettleD,
    kettleH,
    measureType,
    measureVolume,
    measureDistance,
    measureHeight,
    wortTemp,
    fermenterLoss
  ]);

  // RESET ALL FIELD EXPECT WORT / BREWER PARAMETERS
  const resetAllStages = () => {
    // Stage 1 Fields
    setInputs(defaultInputs);
    setBeerColorHex("#f59e0b");
    setBeerEbc(12.0);
    setBeerTurbidity(20);
    setSelectedPreset(null);
    setUseProteinPause(false);
    setProteinTemp(52);
    setProteinTime(20);
    setUseBetaGlucanPause(false);
    setBetaGlucanTemp(45);
    setBetaGlucanTime(15);

    // Grains
    setGrainRows([
      { id: "row-1", maltId: "pilsner", weight: 4.5 },
      { id: "row-2", maltId: "carahell", weight: 0.5 }
    ]);
    setSpiceRows([]);
    setFlocType("medium");

    // Hops
    setAdditions([
      { id: "1", name: "Magnum", alphaAcid: 12.5, weight: 30, time: 60 },
      { id: "2", name: "Saaz (Жатецький)", alphaAcid: 3.5, weight: 40, time: 15 }
    ]);

    // Metadata & Fermentation
    setBeerName("Мій NEIPA");
    setYeastStrain("Verdant IPA");
    setFermentTemp(20);
    setFermentDays(14);

    // Stage 2 Fields
    setWaterRatio(3.0);
    setTotalEnergy(5.5);
    setBoilTime(90);
    setPreBoilVol(65.0);
    setPreBoilBrix(11.0);
    setTargetChloride(80);
    setTargetSulfate(80);
    setTargetVolume(55.0);

    // Dynamic metrics
    setMeasureType("volume");
    setMeasureVolume(50.0);
    setMeasureDistance(15.0);
    setMeasureHeight(35.0);
    setWortTemp(100);
    setFermenterLoss(2.0);
    
    // KEEP kettleD and kettleH intact!
    // Alert or animate
    setTriggerAnimate(prev => prev + 1);
  };

  // Recipe Profile - Save current layout
  const handleSaveProfile = () => {
    const nameToSave = profileNameInput.trim() || beerName || `Рецепт від ${new Date().toLocaleDateString()}`;
    
    const newProfile: SavedRecipe = {
      id: "recipe-" + Date.now(),
      name: nameToSave,
      timestamp: new Date().toLocaleDateString("uk-UA", { hour: "numeric", minute: "numeric" }),
      state: {
        inputs,
        beerColorHex,
        beerEbc,
        beerTurbidity,
        selectedPreset,
        totalGrainWeight,
        targetVolume,
        useProteinPause,
        proteinTemp,
        proteinTime,
        waterRatio,
        totalEnergy,
        boilTime,
        preBoilVol,
        preBoilBrix,
        targetChloride,
        targetSulfate,
        grainRows,
        spiceRows,
        flocType,
        additions,
        beerName: nameToSave,
        yeastStrain,
        fermentTemp,
        fermentDays,
        evapCoeff,
        measureType,
        measureVolume,
        measureDistance,
        measureHeight,
        wortTemp,
        fermenterLoss
      }
    };

    const updated = [...savedRecipes, newProfile];
    setSavedRecipes(updated);
    localStorage.setItem("brew_calculator_saved_recipes", JSON.stringify(updated));
    setSelectedProfileId(newProfile.id);
    setBeerName(nameToSave);
    setProfileNameInput("");
  };

  // Recipe Profile - Load selected
  const handleLoadProfile = (profileId: string) => {
    const found = savedRecipes.find(r => r.id === profileId);
    if (!found) return;

    const data = found.state;
    if (data.inputs) setInputs(data.inputs);
    if (data.beerColorHex) setBeerColorHex(data.beerColorHex);
    if (data.beerEbc) setBeerEbc(data.beerEbc);
    if (data.beerTurbidity) setBeerTurbidity(data.beerTurbidity);
    if (data.selectedPreset) setSelectedPreset(data.selectedPreset);
    if (data.totalGrainWeight) setTotalGrainWeight(data.totalGrainWeight);
    if (data.targetVolume) setTargetVolume(data.targetVolume);
    if (data.useProteinPause !== undefined) setUseProteinPause(data.useProteinPause);
    if (data.proteinTemp !== undefined) setProteinTemp(data.proteinTemp);
    if (data.proteinTime !== undefined) setProteinTime(data.proteinTime);
    if (data.waterRatio !== undefined) setWaterRatio(data.waterRatio);
    if (data.totalEnergy !== undefined) setTotalEnergy(data.totalEnergy);
    if (data.boilTime !== undefined) setBoilTime(data.boilTime);
    if (data.preBoilVol !== undefined) setPreBoilVol(data.preBoilVol);
    if (data.preBoilBrix !== undefined) setPreBoilBrix(data.preBoilBrix);
    if (data.targetChloride !== undefined) setTargetChloride(data.targetChloride);
    if (data.targetSulfate !== undefined) setTargetSulfate(data.targetSulfate);
    if (data.grainRows) setGrainRows(data.grainRows);
    if (data.spiceRows) setSpiceRows(data.spiceRows);
    if (data.flocType) setFlocType(data.flocType);
    if (data.additions) setAdditions(data.additions);
    if (data.beerName) setBeerName(data.beerName);
    if (data.yeastStrain) setYeastStrain(data.yeastStrain);
    if (data.fermentTemp !== undefined) setFermentTemp(data.fermentTemp);
    if (data.fermentDays !== undefined) setFermentDays(data.fermentDays);
    if (data.evapCoeff !== undefined) setEvapCoeff(data.evapCoeff);
    if (data.measureType) setMeasureType(data.measureType);
    if (data.measureVolume !== undefined) setMeasureVolume(data.measureVolume);
    if (data.measureDistance !== undefined) setMeasureDistance(data.measureDistance);
    if (data.measureHeight !== undefined) setMeasureHeight(data.measureHeight);
    if (data.wortTemp !== undefined) setWortTemp(data.wortTemp);
    if (data.fermenterLoss !== undefined) setFermenterLoss(data.fermenterLoss);

    setSelectedProfileId(profileId);
    setTriggerAnimate(prev => prev + 1);
  };

  // Recipe Profile - Delete profile
  const handleDeleteProfile = (profileId: string) => {
    const updated = savedRecipes.filter(r => r.id !== profileId);
    setSavedRecipes(updated);
    localStorage.setItem("brew_calculator_saved_recipes", JSON.stringify(updated));
    if (selectedProfileId === profileId) {
      setSelectedProfileId("");
    }
  };

  // Export recipe database helper
  const handleExportDatabase = () => {
    try {
      const saved = localStorage.getItem("brew_calculator_saved_recipes");
      const dataToExport = saved ? JSON.parse(saved) : savedRecipes;
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pivas_recipes_backup.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Помилка експорту бази рецептів:", e);
      alert("Не вдалося експортувати базу рецептів");
    }
  };

  // Import recipe database helper
  const handleImportDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          alert("Невірний формат файлу. Очікувався JSON-масив рецептів.");
          return;
        }

        const currentSavedStr = localStorage.getItem("brew_calculator_saved_recipes");
        let currentSaved: SavedRecipe[] = currentSavedStr ? JSON.parse(currentSavedStr) : [...savedRecipes];

        let updatedRecipes = [...currentSaved];
        let overwriteCount = 0;
        let newCount = 0;

        for (const importedRecipe of imported) {
          if (!importedRecipe.name || !importedRecipe.id || !importedRecipe.state) {
            continue; // Ignore malformed recipes
          }

          const existingIndex = updatedRecipes.findIndex(
            (r) => r.name.trim().toLowerCase() === importedRecipe.name.trim().toLowerCase()
          );

          if (existingIndex !== -1) {
            const confirmOverwrite = window.confirm(
              `Рецепт із назвою "${importedRecipe.name}" вже існує. Бажаєте перезаписати його?`
            );
            if (confirmOverwrite) {
              updatedRecipes[existingIndex] = {
                ...importedRecipe,
                timestamp: importedRecipe.timestamp || new Date().toLocaleDateString("uk-UA", { hour: "numeric", minute: "numeric" })
              };
              overwriteCount++;
            }
          } else {
            updatedRecipes.push({
              ...importedRecipe,
              timestamp: importedRecipe.timestamp || new Date().toLocaleDateString("uk-UA", { hour: "numeric", minute: "numeric" })
            });
            newCount++;
          }
        }

        setSavedRecipes(updatedRecipes);
        localStorage.setItem("brew_calculator_saved_recipes", JSON.stringify(updatedRecipes));
        event.target.value = "";

        alert(`Імпорт завершено успішно!\nНових додано: ${newCount}\nПерезаписано: ${overwriteCount}`);
      } catch (err) {
        console.error("Помилка під час імпорту файлу:", err);
        alert("Помилка імпорту бази рецептів. Перевірте формат JSON-файлу.");
      }
    };
    reader.readAsText(file);
  };

  // Physical calculation for current packaging volume
  let vHot = 0;
  const radius = kettleD / 2;
  if (measureType === "distance") {
    const hLiq = Math.max(0, kettleH - measureDistance);
    vHot = (Math.PI * Math.pow(radius, 2) * hLiq) / 1000;
  } else if (measureType === "height") {
    vHot = (Math.PI * Math.pow(radius, 2) * measureHeight) / 1000;
  } else {
    vHot = measureVolume;
  }
  const tempDiff = Math.max(0, wortTemp - 20);
  const shrinkageFactor = 1 + (tempDiff * 0.0004);
  const vCold = vHot / shrinkageFactor;
  const trubLoss = targetVolume * 0.05;
  const vFermenter = Math.max(0, vCold - trubLoss);
  const packagingVol = Math.max(0, vFermenter - fermenterLoss);

  // Incrementor/Decrementor helper for mash inputs
  const adjustValue = (key: keyof BrewingInputs, amount: number, min: number, max: number) => {
    setInputs(prev => {
      const val = parseFloat((prev[key] + amount).toFixed(1));
      return {
        ...prev,
        [key]: Math.max(min, Math.min(max, val))
      };
    });
    setSelectedPreset(null);
  };

  // Safe manual input handler
  const handleInputChange = (key: keyof BrewingInputs, value: number, min: number, max: number) => {
    const val = isNaN(value) ? min : Math.max(min, Math.min(max, value));
    setInputs(prev => ({
      ...prev,
      [key]: val
    }));
    setSelectedPreset(null);
  };

  // Toggle for single vs double pause
  const isSinglePause = inputs.Time_2 === 0;
  const Total_Mash_Time = inputs.Time_1 + inputs.Time_2 + (useProteinPause ? proteinTime : 0) + (useBetaGlucanPause ? betaGlucanTime : 0);
  const toggleSinglePause = (useSingle: boolean) => {
    if (useSingle) {
      setInputs(prev => ({
        ...prev,
        Temp_2: 0,
        Time_2: 0
      }));
    } else {
      setInputs(prev => ({
        ...prev,
        Temp_2: 72,
        Time_2: 20
      }));
    }
  };

  // Custom visual converters
  const convertBrixToSG = (brix: number): number => {
    return 1 + (brix / (258.6 - (brix * 0.88)));
  };
  const sg_og = convertBrixToSG(inputs.OG_beer);
  const sg_fg = convertBrixToSG(outputs.Est_FG);

  return (
    <div className="min-h-screen bg-[#070a13] text-[#F8FAFC] font-sans selection:bg-[#FF9F1C]/25 selection:text-[#FF9F1C] overflow-x-hidden relative">
      
      {/* Dynamic atmospheric ambient glow in background */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#FF9F1C]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[400px] h-[400px] bg-[#d97706]/4 rounded-full blur-[200px] pointer-events-none" />

      {/* Main Micro Branding bar at top */}
      <div className="border-b border-[#1E2638] bg-[#070a13]/90 sticky top-0 backdrop-blur-md z-[1001]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="bg-[#FF9F1C] p-3 rounded-2xl shadow-[0_4px_20px_rgba(255,159,28,0.25)] flex items-center justify-center">
              <Beer className="w-5 h-5 text-[#070a13] font-black rotate-[-5deg]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#FF9F1C] uppercase font-black block leading-none">
                SENIOR BREWING PANEL
              </span>
              <h1 className="font-serif font-black text-2xl text-white tracking-tight leading-none mt-1.5">
                BREWESTIMATE PRO
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="#glossary-section"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#FF9F1C] bg-[#121826] border border-[#1E2638] px-4 py-2.5 rounded-xl transition-all font-serif font-bold"
            >
              <BookOpen className="w-4 h-4 text-[#FF9F1C]" />
              <span>Глосарій термінів</span>
            </a>

            <button
              onClick={resetAllStages}
              className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-[#0B0F19] hover:bg-[#FF9F1C] py-2.5 px-4 rounded-xl bg-[#121826] border border-[#1E2638] hover:border-[#FF9F1C] transition-all cursor-pointer font-bold"
              title="Очистити всі поля Етапів 1-2 крім діаметру та висоти варочника"
              id="btn-global-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Скинути Етап 1-2</span>
            </button>
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6 relative z-10">

        {/* 
          CENTRAL RECIPE MANAGEMENT CARD: "УПРАВЛІННЯ РЕЦЕПТАМИ"
          Fulfills the user request at the very top of the page.
        */}
        <div className="bg-[#121826] rounded-3xl p-5 border border-[#1E2638] shadow-2xl flex flex-col gap-4 font-sans" id="recipe-manager-widget">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1E2638]/60 pb-3 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#FF9F1C]/10 p-2 rounded-xl border border-[#FF9F1C]/20 text-[#FF9F1C]">
                {selectedProfileId ? <FolderOpen className="w-4.5 h-4.5" /> : <FolderClosed className="w-4.5 h-4.5" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-snug">Управління рецептами (LocalStorage)</h2>
                <p className="text-[11px] text-slate-400">Зберігайте поточні налаштування на льоту або обирайте збережені</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Прихований інпут для імпорту бази рецептів */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportDatabase}
                accept=".json"
                className="hidden"
                id="recipe-db-import-input"
              />

              <select
                value={selectedProfileId}
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadProfile(e.target.value);
                  }
                }}
                className="bg-[#0B0F19] text-xs text-slate-200 border border-[#1E2638] rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#FF9F1C] focus:outline-none w-full sm:w-auto sm:min-w-[190px] font-medium"
              >
                <option value="">-- Виберіть збережений рецепт --</option>
                {savedRecipes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.timestamp})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportDatabase}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-[#0B0F19] text-slate-300 border border-[#1E2638] hover:border-[#FF9F1C] hover:text-[#FF9F1C] rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
                title="Експортувати всю базу рецептів у файл pivas_recipes_backup.json"
                id="btn-export-db"
              >
                <Download className="w-4 h-4 text-[#FF9F1C]" />
                <span>Експорт бази</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-[#0B0F19] text-slate-300 border border-[#1E2638] hover:border-[#FF9F1C] hover:text-[#FF9F1C] rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
                title="Імпортувати базу рецептів із файлу JSON"
                id="btn-import-db"
              >
                <Upload className="w-4 h-4 text-[#FF9F1C]" />
                <span>Імпорт бази</span>
              </button>

              {selectedProfileId && (
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(selectedProfileId)}
                  className="p-2.5 text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
                  title="Видалити вибраний рецепт"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Введіть назву для нового рецепта (напр. Мій Stout, Бланш)"
                value={profileNameInput}
                onChange={(e) => setProfileNameInput(e.target.value)}
                className="w-full bg-[#0B0F19] border border-[#1E2638] rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-[#FF9F1C] focus:outline-none placeholder-slate-500 font-medium"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#FF9F1C]/10 text-[#FF9F1C] border border-[#FF9F1C]/25 rounded-xl text-xs font-bold hover:bg-[#FF9F1C] hover:text-[#0B0F19] transition-all cursor-pointer font-sans"
            >
              <Save className="w-4 h-4" />
              <span>Зберегти як рецепт</span>
            </button>
          </div>
        </div>

        {/* TAB STEP SELECTORS */}
        <div className="flex bg-[#121826] p-1.5 rounded-3xl border border-[#1E2638] max-w-2xl w-full self-center mx-auto shadow-2xl relative z-10 font-sans">
          <button
            onClick={() => setCurrentStage("preparation")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl text-[10px] sm:text-xs font-serif font-black uppercase tracking-wider transition-all cursor-pointer ${
              currentStage === "preparation"
                ? "bg-[#FF9F1C] text-[#0B0F19] shadow-[0_4px_15px_rgba(255,159,28,0.2)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/10"
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>СТАДІЯ 1: Рецепт і затираня</span>
          </button>
          <button
            onClick={() => setCurrentStage("execution")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl text-[10px] sm:text-xs font-serif font-black uppercase tracking-wider transition-all cursor-pointer ${
              currentStage === "execution"
                ? "bg-[#FF9F1C] text-[#0B0F19] shadow-[0_4px_15px_rgba(255,159,28,0.2)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/10"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>СТАДІЯ 2: Кип'ятіння і Розлив</span>
          </button>
        </div>

        {/* STAGE 1 AREA */}
        <div style={{ display: currentStage === "preparation" ? "block" : "none" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* STAGE 1 LEFT: Ingredients & Pauses */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Presets Grid */}
              <div className="flex flex-col gap-3 font-sans">
                <div className="flex items-center gap-2 border-b border-[#1E2638] pb-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF9F1C]" />
                  <h2 className="text-[10px] font-black font-mono text-slate-400 tracking-wider uppercase">
                    ШВИДКІ ПРЕСЕТИ КРАФТОВИХ СТИЛІВ
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {presets.map((p, i) => {
                    const active = selectedPreset === p.name;
                    return (
                      <button
                        key={i}
                        onClick={() => applyPreset(p)}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 relative overflow-hidden group ${
                          active 
                            ? "bg-[#161D30] border-[#FF9F1C] shadow-[0_0_15px_rgba(255,159,28,0.12)]" 
                            : "bg-[#121826] border-[#1E2638] hover:border-slate-500 hover:bg-[#151D30]"
                        }`}
                      >
                        <div>
                          <h3 className={`font-serif font-black text-xs sm:text-sm leading-snug transition-colors ${active ? "text-[#FF9F1C]" : "text-white"}`}>
                            {p.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal font-sans">
                            {p.description}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 font-bold border-t border-slate-800/60 w-full mt-1 pt-1">
                          <span className="text-slate-400">{p.inputs.OG_beer.toFixed(1)}°Bx | atten: {p.inputs.Yeast_atten}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grain bill layout */}
              <GrainBillCalculator 
                initialBatchVolume={targetVolume}
                rows={grainRows}
                setRows={setGrainRows}
                flocType={flocType}
                setFlocType={setFlocType}
                yeastStrain={yeastStrain}
                setYeastStrain={setYeastStrain}
                spiceRows={spiceRows}
                setSpiceRows={setSpiceRows}
                onGrainBillChange={(data) => {
                  setInputs(prev => ({ ...prev, Adjuncts_pct: data.adjunctsPct }));
                  setBeerColorHex(data.beerColorHex);
                  setBeerEbc(data.ebc);
                  setBeerTurbidity(data.turbidity);
                  setTotalGrainWeight(data.totalWeight);
                }}
                onYeastChange={(attenVal, flocVal) => {
                  setInputs(prev => ({ ...prev, Yeast_atten: attenVal }));
                  setFlocType(flocVal);
                }}
              />

              {/* Mash pauses inputs */}
              <div className="bg-[#121826] rounded-3xl p-6 shadow-2xl border border-[#1E2638] flex flex-col gap-6 font-sans">
                <div className="flex justify-between items-center pb-3 border-b border-[#1E2638] h-11">
                  <div className="flex items-center gap-2.5">
                    <Thermometer className="w-5 h-5 text-[#FF9F1C]" />
                    <h3 className="font-serif font-black text-lg text-white">
                      Блок затирання та сусла
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-[#0b0f19] p-1 rounded-xl border border-[#1E2638]">
                    <button
                      type="button"
                      onClick={() => toggleSinglePause(true)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                        isSinglePause ? "bg-[#FF9F1C] text-[#0B0F19]" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      1 пауза
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSinglePause(false)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                        !isSinglePause ? "bg-[#FF9F1C] text-[#0B0F19]" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      2 паузи
                    </button>
                  </div>
                </div>

                {/* Beta-Glucan Pause Option */}
                <div className="bg-[#0b0f19] p-4 rounded-2xl border border-[#1E2638] flex flex-col gap-4 font-sans">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2 relative">
                      <Layers className="w-4 h-4 text-[#FF9F1C]" />
                      <span>Бета-глюканова пауза (Beta-Glucan Pause)</span>
                      <div className="group relative cursor-pointer ml-1 inline-flex items-center">
                        <Info className="w-3.5 h-3.5 text-slate-400 hover:text-[#FF9F1C] transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-[#1E2638] text-slate-200 text-[11px] p-2.5 rounded-xl border border-[#FF9F1C]/30 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-50 leading-relaxed">
                          Обов'язкова пауза для руйнування в'язкості при використанні понад 10% нескладеної пшениці, жита або вівса.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2638]" />
                        </div>
                      </div>
                    </label>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={useBetaGlucanPause}
                        onChange={(e) => setUseBetaGlucanPause(e.target.checked)}
                        className="w-4.5 h-4.5 text-[#FF9F1C] bg-[#121826] border-[#1E2638] rounded focus:ring-0 checked:bg-[#FF9F1C] cursor-pointer"
                      />
                    </div>
                  </div>

                  {useBetaGlucanPause && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-4 animate-fade-in mt-1">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Температура PAUSE 1.2</label>
                          <input
                            type="number"
                            value={betaGlucanTemp}
                            onChange={(e) => setBetaGlucanTemp(Math.max(35, Math.min(50, parseInt(e.target.value) || 45)))}
                            className="w-full bg-[#121826] border border-[#1E2638] text-slate-100 font-mono text-xs rounded-xl px-3.5 py-1.5"
                          />
                          <span className="text-[9px] text-slate-500 block mt-1">Межа: 35°C - 50°C</span>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Час тривалості (хв)</label>
                          <input
                            type="number"
                            value={betaGlucanTime}
                            onChange={(e) => setBetaGlucanTime(Math.max(5, Math.min(45, parseInt(e.target.value) || 15)))}
                            className="w-full bg-[#121826] border border-[#1E2638] text-slate-100 font-mono text-xs rounded-xl px-3.5 py-1.5"
                          />
                          <span className="text-[9px] text-slate-500 block mt-1">Межа: 5 - 45 хв</span>
                        </div>
                      </div>
                      
                      <div className="p-2.5 bg-[#121826] border-l-2 border-[#FF9F1C] text-[10px] text-slate-300 leading-normal rounded-r-lg">
                        <strong className="text-[#FF9F1C]">Підказка:</strong> Обов'язкова пауза для руйнування в'язкості при використанні понад 10% нескладеної пшениці, жита або вівса.
                      </div>
                    </div>
                  )}
                </div>

                {/* Protein Pause Option */}
                <div className="bg-[#0b0f19] p-4 rounded-2xl border border-[#1E2638] flex flex-col gap-4 font-sans">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#FF9F1C]" />
                      Білокова пауза (Protein Pause)
                    </label>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={useProteinPause}
                        onChange={(e) => setUseProteinPause(e.target.checked)}
                        className="w-4.5 h-4.5 text-[#FF9F1C] bg-[#121826] border-[#1E2638] rounded focus:ring-0 checked:bg-[#FF9F1C] cursor-pointer"
                      />
                    </div>
                  </div>

                  {useProteinPause && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in mt-1">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Температура PAUSE 1.5</label>
                        <input
                          type="number"
                          value={proteinTemp}
                          onChange={(e) => setProteinTemp(Math.max(45, Math.min(55, parseInt(e.target.value) || 52)))}
                          className="w-full bg-[#121826] border border-[#1E2638] text-slate-100 font-mono text-xs rounded-xl px-3.5 py-1.5"
                        />
                        <span className="text-[9px] text-slate-500 block mt-1">Межа: 45°C - 55°C</span>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Час тривалості (хв)</label>
                        <input
                          type="number"
                          value={proteinTime}
                          onChange={(e) => setProteinTime(Math.max(5, Math.min(45, parseInt(e.target.value) || 20)))}
                          className="w-full bg-[#121826] border border-[#1E2638] text-slate-100 font-mono text-xs rounded-xl px-3.5 py-1.5"
                        />
                        <span className="text-[9px] text-slate-500 block mt-1">Межа: 5 - 45 хв</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input: OG_beer */}
                <div className="flex flex-col gap-2.5 bg-[#0b0f19] p-4.5 rounded-2xl border border-[#1E2638]">
                  <div className="flex justify-between items-center">
                    <label htmlFor="OG_beer" className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-[#FF9F1C]" />
                      Початкова щільність (OG_beer)
                    </label>
                    <div className="border border-[#FF9F1C] bg-[#121826]/80 px-3 py-1 text-xs text-[#FF9F1C] font-mono font-black rounded-lg uppercase shadow-[0_0_10px_rgba(255,159,28,0.1)]">
                      {inputs.OG_beer.toFixed(1)} Brix
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <button 
                      type="button"
                      onClick={() => adjustValue("OG_beer", -0.5, 4.0, 30.0)}
                      className="w-9 h-9 rounded-xl bg-[#1E2638] flex items-center justify-center text-slate-300 hover:text-[#0B0F19] hover:bg-[#FF9F1C] border border-[#1e2638] transition-all cursor-pointer font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="range" 
                      id="OG_beer"
                      min="4.0" 
                      max="30.0" 
                      step="0.1"
                      value={inputs.OG_beer} 
                      onChange={(e) => handleInputChange("OG_beer", parseFloat(e.target.value), 4.0, 30.0)}
                      className="flex-1 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer accent-[#FF9F1C]"
                    />
                    <button 
                      type="button"
                      onClick={() => adjustValue("OG_beer", 0.5, 4.0, 30.0)}
                      className="w-9 h-9 rounded-xl bg-[#1E2638] flex items-center justify-center text-slate-300 hover:text-[#0B0F19] hover:bg-[#FF9F1C] border border-[#1e2638] transition-all cursor-pointer font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Yeast Yeast_atten */}
                <div className="flex flex-col gap-2.5 bg-[#0b0f19] p-4.5 rounded-2xl border border-[#1E2638]">
                  <div className="flex justify-between items-center">
                    <label htmlFor="Yeast_atten" className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-[#FF9F1C]" />
                      Здатність дріжджів до зброджування (Yeast_atten)
                    </label>
                    <div className="border border-[#1E2638] bg-[#121826] px-3 py-1 text-xs text-white font-mono font-black rounded-lg">
                      {inputs.Yeast_atten}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <button 
                      type="button"
                      onClick={() => adjustValue("Yeast_atten", -1, 50, 95)}
                      className="w-9 h-9 rounded-xl bg-[#1E2638] flex items-center justify-center text-slate-300 hover:text-[#0B0F19] hover:bg-[#FF9F1C] border border-[#1e2638] transition-all cursor-pointer font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="range" 
                      id="Yeast_atten"
                      min="50" 
                      max="95" 
                      step="1"
                      value={inputs.Yeast_atten} 
                      onChange={(e) => handleInputChange("Yeast_atten", parseInt(e.target.value), 50, 95)}
                      className="flex-1 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer accent-[#FF9F1C]"
                    />
                    <button 
                      type="button"
                      onClick={() => adjustValue("Yeast_atten", 1, 50, 95)}
                      className="w-9 h-9 rounded-xl bg-[#1E2638] flex items-center justify-center text-slate-300 hover:text-[#0B0F19] hover:bg-[#FF9F1C] border border-[#1e2638] transition-all cursor-pointer font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pauses Slider rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Temp 1 */}
                  <div className="flex flex-col gap-2.5 bg-[#0b0f19] p-4 rounded-xl border border-[#1E2638]">
                    <div className="flex justify-between items-center">
                      <label htmlFor="Temp_1" className="text-xs font-bold text-slate-300">
                        Температура 1-Ї паузи (Temp_1)
                      </label>
                      <div className="border border-[#FF9F1C]/20 bg-[#121826] px-2 py-0.5 text-[11px] text-[#FF9F1C] font-mono font-black rounded-lg">
                        {inputs.Temp_1} °C
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input 
                        type="range" 
                        id="Temp_1"
                        min="55.0" 
                        max="75.0" 
                        step="0.5"
                        value={inputs.Temp_1} 
                        onChange={(e) => handleInputChange("Temp_1", parseFloat(e.target.value), 55.0, 75.0)}
                        className="flex-1 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer accent-[#FF9F1C]"
                      />
                    </div>
                  </div>

                  {/* Time 1 */}
                  <div className="flex flex-col gap-2.5 bg-[#0b0f19] p-4 rounded-xl border border-[#1E2638]">
                    <div className="flex justify-between items-center">
                      <label htmlFor="Time_1" className="text-xs font-bold text-slate-300">
                        Час 1-Ї паузи (Time_1)
                      </label>
                      <div className="border border-[#FF9F1C]/20 bg-[#121826] px-2 py-0.5 text-[11px] text-[#FF9F1C] font-mono font-black rounded-lg">
                        {inputs.Time_1} хв
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input 
                        type="range" 
                        id="Time_1"
                        min="10" 
                        max="120" 
                        value={inputs.Time_1} 
                        onChange={(e) => handleInputChange("Time_1", parseInt(e.target.value), 10, 120)}
                        className="flex-1 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer accent-[#FF9F1C]"
                      />
                    </div>
                  </div>

                  {/* Temp 2 */}
                  <div className={`flex flex-col gap-2.5 p-4 rounded-xl border transition-all ${
                    isSinglePause 
                      ? "bg-[#0b0f19]/30 border-dashed border-slate-800 opacity-30 select-none cursor-not-allowed" 
                      : "bg-[#0b0f19]"
                  }`}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="Temp_2" className="text-xs font-bold text-slate-300">
                        Температура 2-Ї паузи
                      </label>
                      <div className="border border-[#FF9F1C]/20 bg-[#121826] px-2 py-0.5 text-[11px] text-[#FF9F1C] font-mono font-black rounded-lg">
                        {inputs.Temp_2} °C
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input 
                        type="range" 
                        id="Temp_2"
                        min="0.0" 
                        max="80.0" 
                        step="0.5"
                        disabled={isSinglePause}
                        value={inputs.Temp_2} 
                        onChange={(e) => handleInputChange("Temp_2", parseFloat(e.target.value), 0.0, 80.0)}
                        className="flex-1 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer accent-[#FF9F1C] disabled:opacity-20"
                      />
                    </div>
                  </div>

                  {/* Time 2 */}
                  <div className={`flex flex-col gap-2.5 p-4 rounded-xl border transition-all ${
                    isSinglePause 
                      ? "bg-[#0b0f19]/30 border-dashed border-slate-800 opacity-30 select-none cursor-not-allowed" 
                      : "bg-[#0b0f19]"
                  }`}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="Time_2" className="text-xs font-bold text-slate-300">
                        Час 2-Ї паузи
                      </label>
                      <div className="border border-[#FF9F1C]/20 bg-[#121826] px-2 py-0.5 text-[11px] text-[#FF9F1C] font-mono font-black rounded-lg">
                        {inputs.Time_2} хв
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input 
                        type="range" 
                        id="Time_2"
                        min="0" 
                        max="120" 
                        disabled={isSinglePause}
                        value={inputs.Time_2} 
                        onChange={(e) => handleInputChange("Time_2", parseInt(e.target.value), 0, 120)}
                        className="flex-1 h-1.5 bg-[#121826] rounded-lg appearance-none cursor-pointer accent-[#FF9F1C] disabled:opacity-20"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    runCalculation(inputs);
                    setTriggerAnimate(prev => prev + 1);
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl text-[#0B0F19] bg-[#FF9F1C] hover:bg-[#ffaa1d] font-mono font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,159,28,0.2)] cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-[#0B0F19] fill-[#0B0F19]" />
                  <span>Розрахувати кінцеву щільність (Est_FG)</span>
                </button>

                <div className="flex justify-between items-center bg-[#0b0f19] px-4 py-3 rounded-xl border border-[#1E2638] text-xs">
                  <span className="text-slate-300 font-bold">Загальний час затирання:</span>
                  <span className="font-mono text-[#FF9F1C] font-black">{Total_Mash_Time} хв</span>
                </div>
              </div>

              {/* Hop selections calculator */}
              <HopMapCalculator 
                ogBrix={inputs.OG_beer}
                targetVolume={targetVolume}
                onTotalIbuChange={setTotalIbu}
                additions={additions}
                setAdditions={setAdditions}
                spiceRows={spiceRows}
              />

              {/* FAQ Section */}
              <div id="glossary-section">
                <BrewingGlossary />
              </div>

            </div>

            {/* STAGE 1 RIGHT: Beer Pint Glass Realtime Viz & Results Table */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky lg:top-24">
              
              {/* Specification outputs */}
              <div className="bg-[#121826] rounded-3xl p-6 shadow-2xl border border-[#1E2638] relative overflow-hidden" id="results-outputs-card">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F1C]/2 via-transparent to-transparent pointer-events-none" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
                    ПРОФІЛЬ ПИВА (BEER PROFILE)
                  </span>
                  <span className="text-xs text-[#FF9F1C] flex items-center gap-1.5 bg-[#FF9F1C]/10 px-3 py-1 rounded-xl border border-[#FF9F1C]/20 font-extrabold uppercase font-mono tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-[#FF9F1C]" />
                    Реактивний Аналіз
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="result-bg p-5 rounded-2xl border border-[#FF9F1C] flex flex-col justify-between items-center text-center relative min-h-[114px] shadow-[0_0_20px_rgba(255,159,28,0.08)]">
                    <p className="text-slate-200 text-xs font-serif font-bold uppercase tracking-wide">
                      Очікувана кінцева щільність (Est_FG)
                    </p>
                    
                    <AnimatePresence mode="popLayout">
                      <motion.h3 
                        key={`${outputs.Est_FG}_fg_${triggerAnimate}`}
                        className="font-serif font-black text-4xl text-white tracking-tight mt-1.5"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 180, damping: 15 }}
                      >
                        {outputs.Est_FG.toFixed(2)} <span className="text-lg font-bold text-slate-300 font-mono tracking-normal">Brix</span>
                      </motion.h3>
                    </AnimatePresence>

                    <p className="text-[10px] text-slate-400/90 mt-1.5 font-mono uppercase tracking-widest leading-none font-bold">
                      Залишковий екстракт
                    </p>
                  </div>

                  <div className="bg-[#0b0f19] p-5 rounded-2xl border border-[#1E2638] flex flex-col justify-between items-center text-center relative min-h-[114px] transition-all hover:border-[#FF9F1C]/30">
                    <p className="text-slate-300 text-xs font-serif font-bold uppercase tracking-wide">
                      Зброджуваність (Final_atten)
                    </p>
                    
                    <AnimatePresence mode="popLayout">
                      <motion.h3 
                        key={`${outputs.Final_atten}_atten_${triggerAnimate}`}
                        className="font-serif font-black text-4xl text-white mt-1.5"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 180, damping: 15 }}
                      >
                        {outputs.Final_atten.toFixed(1)}<span className="text-xl font-bold font-mono text-[#FF9F1C]">%</span>
                      </motion.h3>
                    </AnimatePresence>

                    <p className="text-[10px] text-slate-400 mt-1.5 font-mono uppercase tracking-widest leading-none font-bold">
                      Ступінь утилізації цукру
                    </p>
                  </div>

                  <div className="bg-[#0b0f19] p-5 rounded-2xl border border-[#1E2638] flex flex-col justify-between items-center text-center relative min-h-[114px] transition-all hover:border-[#FF9F1C]/30">
                    <p className="text-slate-300 text-xs font-serif font-bold uppercase tracking-wide">
                      Розрахунковий рівень алкоголю (ABV)
                    </p>
                    
                    <AnimatePresence mode="popLayout">
                      <motion.h3 
                        key={`${outputs.ABV_est}_abv_${triggerAnimate}`}
                        className="font-serif font-black text-4xl text-[#FF9F1C] mt-1.5"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 180, damping: 15 }}
                      >
                        {outputs.ABV_est.toFixed(2)}<span className="text-xl font-bold font-mono text-slate-400">%</span>
                      </motion.h3>
                    </AnimatePresence>

                    <div className="text-[10px] text-slate-400 mt-1.5 font-mono uppercase tracking-widest leading-none font-bold">
                      <span>OG: {sg_og.toFixed(3)} SG | FG: {sg_fg.toFixed(3)} SG</span>
                    </div>
                  </div>

                  {/* Shared details logs */}
                  <div className="bg-[#0b0f19]/70 p-4 rounded-xl border border-[#1E2638] flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1E2638]">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-[#FF9F1C]" />
                        Середньозважена темп. затирання (T_avg)
                      </span>
                      <span className="font-mono font-black text-[#FF9F1C]">
                        {outputs.T_avg.toFixed(1)} °C
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1E2638]">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-emerald-400" />
                        Сумарна гіркота пива (Total IBU)
                      </span>
                      <span className="font-mono font-black text-emerald-400">
                        {totalIbu.toFixed(1)} IBU
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Модифікатор температури (Mash_mod)</span>
                      <span className={`font-mono font-bold ${outputs.Mash_mod >= 0 ? "text-emerald-400" : "text-[#FF9F1C]"}`}>
                        {outputs.Mash_mod >= 0 ? "+" : ""}{outputs.Mash_mod.toFixed(2)} %
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Модифікатор спецсолодів (Grain_mod)</span>
                      <span className="font-mono font-bold text-[#FF9F1C]">
                        -{outputs.Grain_mod.toFixed(2)} %
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Graphic Glass Pint */}
              <BeerVisualizer 
                og={inputs.OG_beer} 
                fg={outputs.Est_FG} 
                attenuation={outputs.Final_atten}
                beerColorHex={beerColorHex}
                ebc={beerEbc}
                turbidity={beerTurbidity}
              />

              {/* SVG mashing curves */}
              <MashingChart
                temp1={inputs.Temp_1}
                time1={inputs.Time_1}
                temp2={inputs.Temp_2}
                time2={inputs.Time_2}
                tAvg={outputs.T_avg}
                mashMod={outputs.Mash_mod}
              />

            </div>
          </motion.div>
        </div>

        {/* STAGE 2 AREA */}
        <div style={{ display: currentStage === "execution" ? "block" : "none" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* STAGE 2 LEFT: Water Calculator (6 columns) */}
            <div className="lg:col-span-12 xl:col-span-6 flex flex-col gap-6 font-sans">
              <WaterCalculator 
                totalGrainWeight={totalGrainWeight}
                totalBoilOff={totalBoilOff}
                targetVolume={targetVolume}
                onTargetVolumeChange={setTargetVolume}
                waterRatio={waterRatio}
                setWaterRatio={setWaterRatio}
                targetChloride={targetChloride}
                setTargetChloride={setTargetChloride}
                targetSulfate={targetSulfate}
                setTargetSulfate={setTargetSulfate}
              />
              <MashPhCalculator 
                grainRows={grainRows}
                totalGrainWeight={totalGrainWeight}
                waterRatio={waterRatio}
              />
            </div>

            {/* STAGE 2 RIGHT: Merged Boil + Kettle Geometry Block (6 columns) */}
            <div className="lg:col-span-12 xl:col-span-6 flex flex-col gap-6">
              <BoilingAndVolumes 
                targetVolume={targetVolume}
                onApplyOG={(og) => {
                  setInputs(prev => ({ ...prev, OG_beer: og }));
                  setSelectedPreset(null);
                  setTriggerAnimate(prev => prev + 1);
                }}
                
                // Boiling
                totalEnergy={totalEnergy}
                setTotalEnergy={setTotalEnergy}
                boilTime={boilTime}
                setBoilTime={handleBoilTimeChange}
                preBoilVol={preBoilVol}
                setPreBoilVol={setPreBoilVol}
                preBoilBrix={preBoilBrix}
                setPreBoilBrix={setPreBoilBrix}
                evapCoeff={evapCoeff}
                setEvapCoeff={setEvapCoeff}

                // Kettle physical size props
                kettleD={kettleD}
                setKettleD={setKettleD}
                kettleH={kettleH}
                setKettleH={setKettleH}
                measureType={measureType}
                setMeasureType={setMeasureType}
                measureVolume={measureVolume}
                setMeasureVolume={setMeasureVolume}
                measureDistance={measureDistance}
                setMeasureDistance={setMeasureDistance}
                measureHeight={measureHeight}
                setMeasureHeight={setMeasureHeight}
                wortTemp={wortTemp}
                setWortTemp={setWortTemp}
                fermenterLoss={fermenterLoss}
                setFermenterLoss={setFermenterLoss}
              />
            </div>
          </motion.div>
        </div>


        {/* FINAL INTEGRATED WIDGET: RECIPE REPORT (Saves results, malts, hops, yeasts, physics) */}
        <RecipeExporter 
          inputs={inputs}
          outputs={outputs}
          selectedPreset={selectedPreset}
          beerColorHex={beerColorHex}
          totalIbu={totalIbu}
          calculatedEbc={beerEbc}

          beerName={beerName}
          setBeerName={setBeerName}
          yeastStrain={yeastStrain}
          setYeastStrain={setYeastStrain}
          fermentTemp={fermentTemp}
          setFermentTemp={setFermentTemp}
          fermentDays={fermentDays}
          setFermentDays={setFermentDays}

          grainRows={grainRows}
          spiceRows={spiceRows}
          hopAdditions={additions}
          packagingVol={packagingVol}

          useBetaGlucanPause={useBetaGlucanPause}
          betaGlucanTemp={betaGlucanTemp}
          betaGlucanTime={betaGlucanTime}
          useProteinPause={useProteinPause}
          proteinTemp={proteinTemp}
          proteinTime={proteinTime}
        />

      </main>

      {/* Styled Footer */}
      <footer className="border-t border-[#1E2638] bg-[#070a13]/90 py-8 text-center text-xs text-slate-400 mt-12 relative z-10 font-medium font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} BrewEstimate Pro Panel. Горизонти варки розраховано за термодинамічними формулами.
          </p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>1 Plato ≈ 1 Brix</span>
            <span>•</span>
            <span>Est_FG розрахунок за формула Стіва Крейга</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
