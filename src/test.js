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

const fs = require('fs');
const path = require('path');

const met = require('./met.js');
const sol = require('./soljs.js');

const Wh2MJ = sol.Wh2MJ;

// *********************** Aux functions *********************

// Lee datos climáticos desde archivo .met
function climadata(metfile) {
  const metpath = path.resolve(__dirname, metfile);
  let datalines = fs.readFileSync(metpath, 'utf-8');
  return met.parsemet(datalines);
}

const myround = (num, ndigits = 2) => Math.round(num * Math.pow(10, ndigits)) / Math.pow(10, ndigits);

// Calcula radiación directa y difusa en una superficie orientada y con albedo
//
// latitude: latitud de la localización
// hourlydata: datos climáticos horarios (.data de climadata)
// surf: descripción de la superficie orientada (inclinación, azimuth)
//       { beta: [0, 180], gamma: [-180, 180] }
// albedo: reflectancia del entorno [0.0, 1.0]
function radiationForSurface(latitude, surf, albedo, hourlydata) {
  return hourlydata.map(
    d => {
      // Calcula altura solar = 90 - cenit y
      // corregir problema numérico con altitud solar = 0
      const salt = 90 - d.cenit;
      const rdir = sol.gsolbeam(d.rdirhor, salt);
      const dir = sol.idirtot(d.mes, d.dia, d.hora, rdir, d.rdifhor, salt,
                              latitude, surf.beta, surf.gamma);
      const dif = sol.idiftot(d.mes, d.dia, d.hora, rdir, d.rdifhor, salt,
                              latitude, surf.beta, surf.gamma, albedo);
      return { mes: d.mes, dia: d.dia, hora: d.hora, dir, dif, tot: dir + dif };
    });
}

// *********************** Examples **************************
function check(msg, value, expected, precision) {
  const prec = precision !== undefined ? precision : 2;
  const isok = value.toFixed(prec) === expected.toFixed(prec);
  const res = isok ? ' ok' : ' error (' + expected.toFixed(prec) + ')';
  return `${ msg } = ${ value.toFixed(prec) } ${ res }`;
}

// Ejemplo 1
const nday = sol.ndayfromdatestring('2001-6-11');
const declination = sol.declination(nday);

console.log('* Test CTE 1');
console.log(check(`Declinación para 11 junio (delta) nday=(${ nday } )`,
                  declination, 23.0, 1));

// Ejemplo 2
let metdata = climadata('zonaD3.met');
let latitud = metdata.meta.latitud;

let july_data = metdata.data.filter(d => d.mes === 7);
let surf = { Area: 1.0, beta: 0, gamma: 0, name: 'Horiz.' };
let albedo = 0.2;
let d = july_data[6];
let saltj6 = 90 - d.cenit;
let rdirj6 = sol.gsolbeam(d.rdirhor, saltj6);
let idirtot = sol.idirtot(d.mes, d.dia, d.hora, rdirj6, d.rdifhor, saltj6,
                          latitud, surf.beta, surf.gamma);
let idiftot = sol.idiftot(d.mes, d.dia, d.hora, rdirj6, d.rdifhor, saltj6,
                          latitud, surf.beta, surf.gamma, albedo);

console.log('* Test CTE 2');
console.log("Metadatos de clima: ", metdata.meta);
console.log("Resultados para hora: ", d, " y superficie: ", surf);
console.log(idirtot, idiftot);
console.log(check('Irradiación directa + difusa horiz. (Mod. Pérez)',
                  idirtot + idiftot, d.rdirhor + d.rdifhor, 0));

// Ejemplo 3
const maxdif = 2;
console.log('* Test CTE 3');
console.log("Dato calculado vs dato de .met hora a hora, para superficie ", surf, " y albedo ", albedo);
console.log("Valores con más de ", maxdif, " W/m2 de diferencia");
let julylist = radiationForSurface(latitud, surf, albedo, july_data);
let tuples = julylist
    .map(({ dir, dif }, i) =>
         [july_data[i].rdirhor + july_data[i].rdifhor, myround(dir + dif, 2).toFixed(2)])
    .filter(([metval, calcval]) => Math.abs(metval - calcval) > maxdif);
console.log(tuples);

// Ejemplo 4
console.log('* Test CTE 4');
console.log("Acumulado mensual julio D3.met sup. horiz.");
let cumdir = julylist.map(v => v.dir).reduce((a, b) => a + b, 0) / 1000;
let cumdif = julylist.map(v => v.dif).reduce((a, b) => a + b, 0) / 1000;
console.log(`[kWh/m2/mes] - total: ${ (cumdir + cumdif).toFixed(2) }, `
            + `directa: ${ cumdir.toFixed(2) }, `
            + `difusa: ${ cumdif.toFixed(2) }`);
console.log(`[kWh/m2/dia] - total: ${ ((cumdir + cumdif) / 31).toFixed(2) }, `
            + `directa: ${ (cumdir / 31).toFixed(2) }, `
            + `difusa: ${ (cumdif / 31).toFixed(2) }`);


// Orientaciones
const ORIENTACIONES = [
  // Area, slope, azimuth, name
  { beta: 0, gamma: 0, name: 'Horiz.' },
  { beta: 90, gamma: -135, name: 'NE' },
  { beta: 90, gamma: -90, name: 'E' },
  { beta: 90, gamma: -45, name: 'SE' },
  { beta: 90, gamma: 0, name: 'S' },
  { beta: 90, gamma: 45, name: 'SW' },
  { beta: 90, gamma: 90, name: 'W' },
  { beta: 90, gamma: 135, name: 'NW' },
  { beta: 90, gamma: 180, name: 'N' }
];

const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


// Acumulados mensuales para el clima y la superficie dados
function monthlyRadiationForSurface(metdata, surf, albedo) {
  const latitud = metdata.meta.latitud;
  const data = metdata.data;
  //console.log('Data: ', mobx.toJS(data));
  const surfRadiation = radiationForSurface(latitud, surf, albedo, data);
  //console.log('Data: ', mobx.toJS(surfRadiation));
  return MESES.map(imes => {
    let monthRadiation = surfRadiation.filter(d => d.mes === imes);
    return { imes,
             surf,
             dir: monthRadiation.map(v => v.dir).reduce((a, b) => a + b),
             dif: monthRadiation.map(v => v.dif).reduce((a, b) => a + b) };
  });
}

// Acumulado mensual por orientación
{
  let albedo = 0.2;
  let metdata = climadata('zonaD3.met');
  let surf = ORIENTACIONES[4];
  let results = monthlyRadiationForSurface(metdata, surf, albedo);
  results.map(({ imes, surf, dir, dif }) =>
              console.log(`beta: ${ surf.beta }, orient.: ${ surf.name }. `
                          + `Rad. mes ${ imes } [kWh/m2/mes]: `
                          + `TOTAL:  ${ ((dir + dif) / 1000).toFixed(2) }, `
                          + `DIR.: ${ (dir / 1000).toFixed(2) }, `
                          + `DIF.: ${ (dif / 1000).toFixed(2) } `)
             );
}

