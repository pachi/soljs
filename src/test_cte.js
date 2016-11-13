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




// *********************** Examples **************************
function check(msg, value, expected, precision) {
  const prec = precision !== undefined ? precision : 2;
  const isok = value.toFixed(prec) === expected.toFixed(prec);
  const res = isok ? ' ok' : ' error (' + expected.toFixed(prec) + ')';
  return `${ msg } = ${ value.toFixed(prec) } ${ res }`;
}

// Ejemplo
const nday = sol.ndayfromdate('2001-6-11');
const declination = sol.declination(nday);

console.log('* Ejemplo CTE');
console.log(check('Declinación para 11 junio (delta)',
                  declination, 23.0, 1));

const D3path = path.resolve(__dirname, 'zonaD3.met');
const D3data = met.readmetfile(D3path);
console.log(D3data.meta);
const meta = D3data.meta;

let julydata = D3data.data
    .filter(e => e.mes === 7)
    .filter(e => e.rdifhor !== 0)
    .map(({ mes, dia, hora,
            rdirhor, rdifhor,
            azimut, cenit }
         ) => (
           { mes, dia, hora,
             rdirhor, rdifhor,
             azimut, cenit }
         )
        );
julydata = julydata
  .map(e => {
    e.salt = 90 - e.cenit;
    e.latitud = D3data.meta.latitude;
    e.rdir = sol.gsolbeam(e.rdirhor, e.salt);
    return e;
  });

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

let d = julydata[6];
const surf = ORIENTATIONS[0];
const albedo = 0.2;

console.log(d);
console.log(meta);
console.log("Results for data: ", d, " and surface: ", surf);

let idirtot = sol.idirtot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                          d.latitud, surf.beta, surf.gamma);
let idiftot = sol.idiftot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                          d.latitud, surf.beta, surf.gamma, albedo);
console.log('directa horiz: ', d.rdirhor, '->', idirtot);
console.log('difusa horiz : ', d.rdifhor, '->', idiftot);


// Ejemplo huecos para A_sol_ver
//
const huecos = [
  // n, Area, slope, azimuth, F_sh_mov
  [1, 1.0, 90, 0, 1.0],
  [2, 2.3 * 1.0, 90, 0, 0.1],
  [1, 2.5 * 1.5, 90, 0, 0.1]
];

console.log(sol.sangleforsurf(-14, -22.5, 43, 45, 15));
