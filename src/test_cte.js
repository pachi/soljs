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

const path = require('path');
const _ = require('lodash');
const sol = require('./soljscte.js');
const met = require('./met.js');

const Wh2MJ = sol.Wh2MJ;

// *********************** Aux functions *********************

// Lee datos climáticos desde archivo .met
function climadata(metfile) {
  const datapath = path.resolve(__dirname, metfile);
  return met.readmetfile(datapath);
}

// *********************** Examples **************************
function check(msg, value, expected, precision) {
  const prec = precision !== undefined ? precision : 2;
  const isok = value.toFixed(prec) === expected.toFixed(prec);
  const res = isok ? ' ok' : ' error (' + expected.toFixed(prec) + ')';
  return `${ msg } = ${ value.toFixed(prec) } ${ res }`;
}

// Ejemplo 1
const nday = sol.ndayfromdate('2001-6-11');
const declination = sol.declination(nday);

console.log('* Test CTE 1');
console.log(check('Declinación para 11 junio (delta)',
                  declination, 23.0, 1));

// Ejemplo 2
let data = climadata('zonaD3.met');

let july_data = met.prepareData(data).filter(d => d.mes === 7);
let surf = { Area: 1.0, beta: 0, gamma: 0, name: 'Horiz.' };
let albedo = 0.2;
let d = july_data[6];
let idirtot = sol.idirtot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                          d.latitud, surf.beta, surf.gamma);
let idiftot = sol.idiftot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                          d.latitud, surf.beta, surf.gamma, albedo);

console.log('* Test CTE 2');
console.log("Metadatos de clima: ", data.meta);
console.log("Resultados para hora: ", d, " y superficie: ", surf);
console.log(check('Irradiación directa + difusa horiz. (Mod. Pérez)',
                  idirtot + idiftot, d.rdirhor + d.rdifhor, 1));

// Ejemplo 3
console.log('* Test CTE 3');
console.log("Dato calculado vs dato de .met hora a hora, para superficie ", surf, " y albedo ", albedo);
let julylist = met.radiationForSurface(july_data, surf, albedo);
let res = julylist.map(([rdir, rdif], i) => [july_data[i].rdirhor + july_data[i].rdifhor, rdir + rdif]);
console.log(res);


// Ejemplo 4
console.log('* Test CTE 4');
console.log("Acumulado mensual julio D3.met sup. horiz.");
let [cumdir, cumdif] = met.cumulatedRadiation(julylist);
console.log(`[kWh/m2/mes] - total: ${ (cumdir + cumdif).toFixed(2) }, directa: ${ cumdir.toFixed(2) }, difusa: ${ cumdif.toFixed(2) }`);
console.log(`[kWh/m2/dia] - total: ${ ((cumdir + cumdif) / 31).toFixed(2) }, directa: ${ (cumdir / 31).toFixed(2) }, difusa: ${ (cumdif / 31).toFixed(2) }`);


// Orientaciones
const ORIENTACIONES = [
  // Area, slope, azimuth, name
  { Area: 1.0, beta: 0, gamma: 0, name: 'Horiz.' }, // horizontal
  { Area: 1.0, beta: 90, gamma: -135, name: 'NE' },
  { Area: 1.0, beta: 90, gamma: -90, name: 'E' },
  { Area: 1.0, beta: 90, gamma: -45, name: 'SE' },
  { Area: 1.0, beta: 90, gamma: 0, name: 'S' },
  { Area: 1.0, beta: 90, gamma: 45, name: 'SW' },
  { Area: 1.0, beta: 90, gamma: 90, name: 'W' },
  { Area: 1.0, beta: 90, gamma: 135, name: 'NW' },
  { Area: 1.0, beta: 90, gamma: 180, name: 'N' }
];

const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// Acumulado mensual por orientación
{
  let albedo = 0.2;
  let data = climadata('zonaD3.met');

  let surf = ORIENTACIONES[4];
  let results = MESES.map(
    imonth => {
      let [cumdir, cumdif] = met.cumulatedRadiation(met.radiationForSurface(met.prepareData(data).filter(d => d.mes === imonth), surf, albedo));
      return [surf, imonth, cumdir, cumdif];
    }
  );
  results.map(([surf, imonth, cumdir, cumdif]) => console.log(`beta: ${ surf.beta }, orientación: ${ surf.name }. Radiación mes ${imonth} [kWh/m2/mes]: TOTAL:  ${ (cumdir + cumdif).toFixed(2) }, DIR.: ${ cumdir.toFixed(2) }, DIF.: ${ cumdif.toFixed(2) } `)
)
}

// Ejemplo huecos para A_sol_ver
//
const huecos = [
  // n, Area, slope, azimuth, F_sh_mov
  [1, 1.0, 90, 0, 1.0],
  [2, 2.3 * 1.0, 90, 0, 0.1],
  [1, 2.5 * 1.5, 90, 0, 0.1]
];

// TODO
