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

const fs = require('fs');
const sol = require('./soljs.js');

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

// Calcula radiación directa y difusa en una superficie orientada y con albedo
//
// latitude: latitud de la localización
// hourlydata: datos climáticos horarios (.data de climadata)
// surf: descripción de la superficie orientada (inclinación, azimuth)
//       { beta: [0, 180], gamma: [-180, 180] }
// albedo: reflectancia del entorno [0.0, 1.0]
function radiationForSurface(latitude, hourlydata, surf, albedo) {
  return hourlydata.map(
    d => {
      // Calcula altura solar = 90 - cenit y
      // corregir problema numérico con altitud solar = 0
      const salt = (d.cenit !== 90) ? 90 - d.cenit : 90 - 89.95;
      const rdir = sol.gsolbeam(d.rdirhor, salt);
      const dir = sol.idirtot(d.mes, d.dia, d.hora, rdir, d.rdifhor, salt,
                              latitude, surf.beta, surf.gamma);
      const dif = sol.idiftot(d.mes, d.dia, d.hora, rdir, d.rdifhor, salt,
                              latitude, surf.beta, surf.gamma, albedo);
      return { mes: d.mes, dia: d.dia, hora: d.hora, dir, dif, tot: dir + dif };
    });
}

// ************************* Exports *****************************************

module.exports = { readmetfile, radiationForSurface };
