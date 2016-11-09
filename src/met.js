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

// Compute primary energy (weighted energy) from data in filename
function readmetfile(metpath) {
  let datalines = fs.readFileSync(metpath, 'utf-8')
        .replace('\n\r', '\n').split('\n')
        .map(line => line.trim());
  // metadata
  const metname = datalines[0];
  const [latitude, longitude, altitud, longref] = datalines[1]
        .split(' ').map(parseFloat);
  const meta = { metname, latitude, longitude, altitud, longref };
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

// ************************* Exports *****************************************

module.exports = { readmetfile };
