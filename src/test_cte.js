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

console.log('* Ejemplo CTE 1');
console.log(check('Declinación para 11 junio (delta)',
                  declination, 23.0, 1));

// Ejemplo 2
const data = climadata('zonaD3.met');

let julydata = data.data
    .filter(e => e.mes === 7)
    .filter(e => e.rdifhor !== 0)
    .map(
      ({ mes, dia, hora, rdirhor, rdifhor, azimut, cenit }
      ) => ({ mes, dia, hora, rdirhor, rdifhor, azimut, cenit }));
julydata = julydata.map(e => {
  e.salt = 90 - e.cenit;
  e.latitud = data.meta.latitude;
  e.rdir = sol.gsolbeam(e.rdirhor, e.salt);
  return e;
});

let d = julydata[6];
const surf = { Area: 1.0, beta: 0, gamma: 0, name: 'Horiz.' };
const albedo = 0.2;
let idirtot = sol.idirtot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                          d.latitud, surf.beta, surf.gamma);
let idiftot = sol.idiftot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                          d.latitud, surf.beta, surf.gamma, albedo);


console.log('* Ejemplo CTE 2');
console.log(d);
console.log(data.meta);
console.log("Resultados para hora: ", d, " y superficie: ", surf);
console.log(check('Irradiación directa + difusa horiz. (Mod. Pérez)',
                  idirtot + idiftot, d.rdirhor + d.rdifhor, 1));

// Ejemplo 3

// Orientaciones
const ORIENTATIONS = [
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

console.log('* Ejemplo CTE 3');
console.log(check('Declinación para 11 junio (delta)',
                  declination, 23.0, 1));

// TODO


// Ejemplo huecos para A_sol_ver
//
const huecos = [
  // n, Area, slope, azimuth, F_sh_mov
  [1, 1.0, 90, 0, 1.0],
  [2, 2.3 * 1.0, 90, 0, 0.1],
  [1, 2.5 * 1.5, 90, 0, 0.1]
];

// TODO
