/* -*- coding: utf-8 -*-

Copyright (c) 2016 Rafael Villar Burke <pachi@rvburke.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const sol = require('./soljsalt.js');
const Wh2MJ = sol.Wh2MJ;

// *********************** Examples **************************
function check(msg, value, expected, precision) {
  const prec = precision !== undefined ? precision : 2;
  const isok = value.toFixed(prec) === expected.toFixed(prec);
  const res = isok ? ' ok' : ' error (' + expected.toFixed(prec) + ')';
  return `${ msg } = ${ value.toFixed(prec) } ${ res }`;
}

// ************************ CTE weather data *********************************

// Monthly average daily clearness index (KTmean = H_mean/H_o_mean)
// Computed from CTE standard climates
function CTE_KTmean(ZCV, canarias) {
  let KTmean = 1.0;
  if (canarias === true) {
    if (ZCV === '1') {
      KTmean = 0.531;
    } else if (ZCV === '2') {
      KTmean = 0.591;
    } else if (ZCV === '3') {
      KTmean = 0.605;
    } else if (ZCV === '4') {
      KTmean = 0.645;
    } else {
      KTmean = null;
    }
  } else {
    if (ZCV === '1') {
      KTmean = 0.555;
    } else if (ZCV === '2') {
      KTmean = 0.618;
    } else if (ZCV === '3') {
      KTmean = 0.632;
    } else if (ZCV === '4') {
      KTmean = 0.675;
    } else {
      KTmean = null;
    }
  }
  return KTmean;
}

const CTE_LATPENINSULA = 40.7;
const CTE_LATCANARIAS = 28.3;

// Latitude for location ('peninsula' or 'canarias')
function CTE_latitude(location) {
    if (location === 'peninsula') return CTE_LATPENINSULA;
    if (location === 'canarias') return CTE_LATCANARIAS;
    return null;
}

const CTE_NDAYJULY = 198; // mean day for July: 17, nday = 198
const CTE_WSPENINSULA = sol.sunsetHourAngle(CTE_LATPENINSULA, sol.declinationForDay(198)); // = 109.5 deg
const CTE_WSCANARIAS = sol.sunsetHourAngle(CTE_LATCANARIAS, sol.declinationForDay(198)); // = 102.0 deg

//    ZC, H_mean(jul) Wh/m2dia, K_T_mean1(jul), Id_I_mean(jul), I_mean(year) [Wh/m2dia], ZC, lat [deg.]
//    H_o_mean_jul [Wh/m2dia]: peninsula = 10572.74, canarias = 10111.41
const CTE_CLIMATES = [
    // Canarias
    { ZC: 'A1', H_mean_jul: 5612.81, K_T_mean_jul: 0.531, Id_I_mean_jul: 0.522, I_mean_year: 4391.833, lat: 28.3, name: 'A1_canarias' },
    { ZC: 'A2', H_mean_jul: 6248.77, K_T_mean_jul: 0.591, Id_I_mean_jul: 0.445, I_mean_year: 4666.189, lat: 28.3, name: 'A2_canarias' },
    { ZC: 'A3', H_mean_jul: 6391.52, K_T_mean_jul: 0.605, Id_I_mean_jul: 0.411, I_mean_year: 4745.775, lat: 28.3, name: 'A3_canarias' },
    { ZC: 'A4', H_mean_jul: 6821.39, K_T_mean_jul: 0.645, Id_I_mean_jul: 0.364, I_mean_year: 4868.340, lat: 28.3, name: 'A4_canarias' },
    { ZC: 'B1', H_mean_jul: 5613.48, K_T_mean_jul: 0.531, Id_I_mean_jul: 0.513, I_mean_year: 4400.211, lat: 28.3, name: 'B1_canarias' },
    { ZC: 'B2', H_mean_jul: 6248.10, K_T_mean_jul: 0.591, Id_I_mean_jul: 0.438, I_mean_year: 4515.756, lat: 28.3, name: 'B2_canarias' },
    { ZC: 'B3', H_mean_jul: 6391.23, K_T_mean_jul: 0.605, Id_I_mean_jul: 0.409, I_mean_year: 4595.452, lat: 28.3, name: 'B3_canarias' },
    { ZC: 'B4', H_mean_jul: 6821.26, K_T_mean_jul: 0.645, Id_I_mean_jul: 0.367, I_mean_year: 4717.975, lat: 28.3, name: 'B4_canarias' },
    { ZC: 'C1', H_mean_jul: 5613.26, K_T_mean_jul: 0.531, Id_I_mean_jul: 0.493, I_mean_year: 3919.501, lat: 28.3, name: 'C1_canarias' },
    { ZC: 'C2', H_mean_jul: 6248.71, K_T_mean_jul: 0.591, Id_I_mean_jul: 0.427, I_mean_year: 4107.942, lat: 28.3, name: 'C2_canarias' },
    { ZC: 'C3', H_mean_jul: 6391.26, K_T_mean_jul: 0.605, Id_I_mean_jul: 0.406, I_mean_year: 4187.551, lat: 28.3, name: 'C3_canarias' },
    { ZC: 'C4', H_mean_jul: 6821.55, K_T_mean_jul: 0.645, Id_I_mean_jul: 0.375, I_mean_year: 4310.019, lat: 28.3, name: 'C4_canarias' },
    { ZC: 'D1', H_mean_jul: 5613.39, K_T_mean_jul: 0.531, Id_I_mean_jul: 0.545, I_mean_year: 3975.115, lat: 28.3, name: 'D1_canarias' },
    { ZC: 'D2', H_mean_jul: 6248.32, K_T_mean_jul: 0.591, Id_I_mean_jul: 0.426, I_mean_year: 4163.630, lat: 28.3, name: 'D2_canarias' },
    { ZC: 'D3', H_mean_jul: 6391.39, K_T_mean_jul: 0.605, Id_I_mean_jul: 0.405, I_mean_year: 4243.293, lat: 28.3, name: 'D3_canarias' },
    { ZC: 'E1', H_mean_jul: 5612.29, K_T_mean_jul: 0.531, Id_I_mean_jul: 0.531, I_mean_year: 3906.962, lat: 28.3, name: 'E1_canarias' },
    { ZC: 'α1', H_mean_jul: 5613.35, K_T_mean_jul: 0.531, Id_I_mean_jul: 0.521, I_mean_year: 5080.658, lat: 28.3, name: 'alpha1_canarias' },
    { ZC: 'α2', H_mean_jul: 6248.45, K_T_mean_jul: 0.591, Id_I_mean_jul: 0.413, I_mean_year: 5366.953, lat: 28.3, name: 'alpha2_canarias' },
    { ZC: 'α3', H_mean_jul: 6391.29, K_T_mean_jul: 0.605, Id_I_mean_jul: 0.415, I_mean_year: 5392.156, lat: 28.3, name: 'alpha3_canarias' },
    { ZC: 'α4', H_mean_jul: 6820.87, K_T_mean_jul: 0.645, Id_I_mean_jul: 0.375, I_mean_year: 5471.348, lat: 28.3, name: 'alpha4_canarias' },
    // Peninsula
    { ZC: 'A3', H_mean_jul: 6391.42, K_T_mean_jul: 0.632, Id_I_mean_jul: 0.371, I_mean_year: 4746.003, lat: 40.7, name: 'A3_peninsula' },
    { ZC: 'A4', H_mean_jul: 6820.58, K_T_mean_jul: 0.675, Id_I_mean_jul: 0.327, I_mean_year: 4868.356, lat: 40.7, name: 'A4_peninsula' },
    { ZC: 'B3', H_mean_jul: 6392.10, K_T_mean_jul: 0.632, Id_I_mean_jul: 0.401, I_mean_year: 4595.452, lat: 40.7, name: 'B3_peninsula' },
    { ZC: 'B4', H_mean_jul: 6820.87, K_T_mean_jul: 0.675, Id_I_mean_jul: 0.340, I_mean_year: 4717.877, lat: 40.7, name: 'B4_peninsula' },
    { ZC: 'C1', H_mean_jul: 5613.65, K_T_mean_jul: 0.555, Id_I_mean_jul: 0.479, I_mean_year: 3919.586, lat: 40.7, name: 'C1_peninsula' },
    { ZC: 'C2', H_mean_jul: 6248.81, K_T_mean_jul: 0.618, Id_I_mean_jul: 0.397, I_mean_year: 4107.962, lat: 40.7, name: 'C2_peninsula' },
    { ZC: 'C3', H_mean_jul: 6391.26, K_T_mean_jul: 0.632, Id_I_mean_jul: 0.363, I_mean_year: 4187.540, lat: 40.7, name: 'C3_peninsula' },
    { ZC: 'C4', H_mean_jul: 6821.52, K_T_mean_jul: 0.675, Id_I_mean_jul: 0.330, I_mean_year: 4310.123, lat: 40.7, name: 'C4_peninsula' },
    { ZC: 'D1', H_mean_jul: 5613.16, K_T_mean_jul: 0.555, Id_I_mean_jul: 0.499, I_mean_year: 3975.205, lat: 40.7, name: 'D1_peninsula' },
    { ZC: 'D2', H_mean_jul: 6249.03, K_T_mean_jul: 0.618, Id_I_mean_jul: 0.382, I_mean_year: 4163.726, lat: 40.7, name: 'D2_peninsula' },
    { ZC: 'D3', H_mean_jul: 6391.90, K_T_mean_jul: 0.632, Id_I_mean_jul: 0.391, I_mean_year: 4243.211, lat: 40.7, name: 'D3_peninsula' },
    { ZC: 'E1', H_mean_jul: 5613.48, K_T_mean_jul: 0.555, Id_I_mean_jul: 0.496, I_mean_year: 3907.241, lat: 40.7, name: 'E1_peninsula' }
];


console.log('* CTE 1');
console.log(check('Sunset hour angle for CTE_LATPENINSULA and July 17 (ws) [deg]',
                  CTE_WSPENINSULA, 109.5, 1));
console.log(check('Daily diffuse to total radiation ratio H_d_mean / H_mean (ZC1, Peninsula)',
                  sol.monthly_Id_to_I(CTE_KTmean('1', false), CTE_WSPENINSULA), 0.38, 2));
console.log(check('Sunset hour angle for CTE_LATCANARIAS and July 17 (ws) [deg]',
                  CTE_WSCANARIAS, 102.0, 1));
console.log(check('Daily diffuse to total radiation ratio H_d_mean / H_mean (ZC1, Canarias)',
                  sol.monthly_Id_to_I(CTE_KTmean('1', true), CTE_WSCANARIAS), 0.38, 2));

// Orientaciones
const ORIENTATIONS = [
  // Area, slope, azimuth, name
  [1.0, 0, 0, '-'], // horizontal
  [1.0, 90, -135, 'NE'],
  [1.0, 90, -90, 'E'],
  [1.0, 90, -45, 'SE'],
  [1.0, 90, 0, 'S'],
  [1.0, 90, 45, 'SW'],
  [1.0, 90, 90, 'W'],
  [1.0, 90, 135, 'NW'],
  [1.0, 90, 180, 'N']
];


// Ejemplo huecos para A_sol_ver
//
const huecos = [
  // n, Area, slope, azimuth, F_sh_mov
  [1, 1.0, 90, 0, 1.0],
  [2, 2.3 * 1.0, 90, 0, 0.1],
  [1, 2.5 * 1.5, 90, 0, 0.1]
];
