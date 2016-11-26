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

Author(s): Rafael Villar Burke <pachi@rvburke.com>
*/

/* MET format
Linea 1: nombre de archivo de clima. e.g. zonaD3.met
Línea 2: campos con datos de localización:
- latitud, grados
- longitud, grados
- altitud, metros
- longitud de referencia, grados

8760 líneas siguientes: campos con datos meteorológicos
- Día (1 a 31);
- Hora (1 a 24);
- Temperatura seca ( ◦ C);
- Temperatura efectiva del cielo ( ◦ C);
- Irradiancia solar directa sobre una superficie horizontal (W/m 2 );
- Irradiancia solar difusa sobre una superficie horizontal (W/m 2 );
- Humedad específica (kgH2O/kgaire seco);
- Humedad relativa ( %);
- Velocidad del viento (m/s);
- Dirección del viento (grados respecto al norte, E+, O-);
- Azimut solar (grados);
- Cénit solar (grados).
*/

const fs = require('fs'); //import * as fs from 'fs';
const sol = require('./soljscte.js');

// Compute primary energy (weighted energy) from data in filename
function readmetfile(metpath) {
  let datalines = fs.readFileSync(metpath, 'utf-8')
        .replace('\n\r', '\n').split('\n')
        .map(line => line.trim());
  // metadata
  const metname = datalines[0];
  const [latitud, longitud, altitud, longref] = datalines[1]
        .split(' ').map(parseFloat);
  const meta = { metname, latitud, longitud, altitud, longref };
  // datalines
  let data = datalines.slice(2).map(x => x.split(/[\s,]+/).map(parseFloat));
  data = data.map(([ mes, dia, hora,
                     tempseca, tempcielo,
                     rdirhor, rdifhor,
                     humedadabs, humedadrel,
                     velviento, dirviento,
                     azimut, cenit ]) => (
                       { mes, dia, hora,
                         tempseca, tempcielo,
                         rdirhor, rdifhor,
                         humedadabs, humedadrel,
                         velviento, dirviento,
                         azimut, cenit }
                     )
                 );

  return { meta, data };
}


// Añade datos climáticos adicionales
//
// Añade radiación a incidencia normal (rdir), altitud solar (salt) y latitud
// también corrige el cénit solar para que no sea exactamente igual a 90.
// TODO: ver si corregirmos el problema con la altitud solar en las ecuaciones
//
// data: datos climáticos tal como los devuelve readmetfile(datapath)
function prepareData(data) {
  return data.data
    .map(
      ({ mes, dia, hora, rdirhor, rdifhor, azimut, cenit }
      ) => ({ mes, dia, hora, rdirhor, rdifhor, azimut, cenit }))
    .map(e => {
      e.cenit = (e.cenit !== 90) ? e.cenit : 89.5; // Corregir problema numérico con altitud solar = 0
      e.salt = 90 - e.cenit;
      e.latitud = data.meta.latitud;
      e.rdir = sol.gsolbeam(e.rdirhor, e.salt);
      return e;
    });
}

// Calcula radiación directa y difusa en una superficie orientada y con albedo
//
// data: datos de localización y radiación sobre plano horizontal
// surf: descripción de la superficie orientada (inclinación, azimuth)
//       { beta: [0, 180], gamma: [-180, 180] }
// albedo: reflectancia del entorno [0.0, 1.0]
function radiationForSurface(data, surf, albedo) {
  return data.map(
    d => [sol.idirtot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                      d.latitud, surf.beta, surf.gamma),
          sol.idiftot(d.mes, d.dia, d.hora, d.rdir, d.rdifhor, d.salt,
                      d.latitud, surf.beta, surf.gamma, albedo)]);
}

// Radiación acumulada (p.e media mensual en kWh/m2/mes)
//
// radiationdata: lista de radiación directa y difusa [[rdir1, rdif1], ... [rdirn, rdifn]]
// supone que son datos horarios (lista de radiación horaria)
function cumulatedRadiation(radiationdata) {
  let cum = radiationdata.reduce(([ardir, ardif], [brdir, brdif]) => [ardir + brdir, ardif + brdif], [0, 0]);
  return [cum[0] / 1000, cum[1] / 1000];
}

// ************************* Exports *****************************************

module.exports = { readmetfile, prepareData, radiationForSurface, cumulatedRadiation };
