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

const sol = require('./soljscte.js');
const met = require('./met.js');
const _ = require('lodash');

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
