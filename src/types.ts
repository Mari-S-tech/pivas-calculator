/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BrewingInputs {
  OG_beer: number;       // Original Gravity in Brix
  Yeast_atten: number;   // Yeast Attenuation in %
  Adjuncts_pct: number;  // Specialty malts/unmalted adjuncts portion in %
  Temp_1: number;        // Temperature of mashing pause 1 in °C
  Time_1: number;        // Duration of mashing pause 1 in minutes
  Temp_2: number;        // Temperature of mashing pause 2 in °C
  Time_2: number;        // Duration of mashing pause 2 in minutes
}

export interface CalculationResults {
  T_avg: number;         // Weighted average mashing temperature in °C
  Mash_mod: number;      // Mashing temperature modifier
  Grain_mod: number;     // Grain bill modifier
  Final_atten: number;   // Calculated final yeast attenuation in %
  Est_FG: number;        // Estimated final gravity in Brix
  ABV_est: number;       // Estimated alcohol by volume (for premium brewer value add!)
}

export interface BeerPreset {
  name: string;
  description: string;
  inputs: BrewingInputs;
  colorHex: string;      // RGB hex color for beer visualizer
}
