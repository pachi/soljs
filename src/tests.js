'use strict';
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

const sol = require('./soljs.js');
const _ = require('lodash');

// *********************** Examples **************************
function check(msg, value, expected, precision) {
  const prec = precision | 2;
  const isok = value.toFixed(prec) === expected.toFixed(prec);
  const res = isok ? ' ok' : ' error (' + expected.toFixed(prec) + ')';
  return `${ msg } = ${ value.toFixed(prec) } ${ res }`;
}

// dayInYear
const day1 = sol.dayInYear('2016-12-23');
const day2 = sol.dayInYear('2000-2-3');
console.log(check('n (December 23)', day1, 358));
console.log(check('n (February 3)', day2, 34));

// Example 1.5.1
let nday = sol.dayInYear('2000-2-3'); // February 3
let Lst = 90; // Reference longitude
let Lloc = 89.4; // Location longitude
let eot_res = sol.EOT(nday);
let solstdshift = sol.solarToStandardTimeCorrection(Lst, Lloc, nday) * 60;
console.log('* Example 1.5.1');
console.log(check(`EOT(${ nday })`, eot_res, -13.49));
console.log(check('Solar to standard time difference (minutes)',
            solstdshift, -11.09));

// Example 1.6.1
// Angle of incidence of beam radiation on a surface
// in Madison (WI) (lat=43ºN)
// at 10:30 (SOT)
// on February 13 (n=44)
// if the surface is tilted 45º from the horizontal (surfSlope, Beta=45º)
// and pointed 15º West of south (surfAzimuth = 15º).
let nday2 = sol.dayInYear('2001-2-13');
let delta1 = sol.declinationForDay(nday2);
let sa1 = sol.surfAngle(43, // latitude
                        delta1, // delta
                        sol.hourAngle(10.5), // hourAngle
                        45, // surfSlope
                        15 // surfAzimuth
                       );
let hourangle161 = sol.hourAngle(10.5);
let sunzenith161 = sol.sunZenith(43, delta1, hourangle161);
let sunazimuth161 = sol.sunAzimuth(43, delta1, hourangle161, sunzenith161);
let sa2 = sol.surfAngle2(sunzenith161, sunazimuth161, 45, 15);

console.log('* Example 1.6.1');
console.log(check(`Declination for day ${ nday }`, delta1, -13.95));
console.log(check('Surface angle (deg)', sa1, 35.16));
console.log(check('Surface angle (deg)', sa2, 35.16));

// Example 1.6.2a - zenith and solar azimuth
// latitude = 43º
// a) time 9:30 am February 13
let delta162a = sol.declinationForDay(sol.dayInYear('2001-2-13'));
let hourangle162a = sol.hourAngle(9.5);
let sunzenith1 = sol.sunZenith(43, delta162a, hourangle162a);
let sunazimuth1 = sol.sunAzimuth(43, delta162a, hourangle162a, sunzenith1);
console.log('* Example 1.6.2a');
console.log(check('Declination (d)', delta162a, -13.95));
console.log(check('Hour angle (w)', hourangle162a, -37.5));
console.log(check('Sun Zenith', sunzenith1, 66.5));
console.log(check('Solar Azimuth', sunazimuth1, -40.11));

// Example 1.6.2b - zenith and solar azimuth
// latitude = 43º
// b) time 6:30 pm July 1
let delta162b = sol.declinationForDay(sol.dayInYear('2001-7-1'));
let hourangle162b = sol.hourAngle(18.5);
let sunzenith2 = sol.sunZenith(43, delta162b, hourangle162b);
let sunazimuth2 = sol.sunAzimuth(43, delta162b, hourangle162b, sunzenith2);
console.log('* Example 1.6.2b');
console.log(check('Declination (d)', delta162b, 23.18));
console.log(check('Hour angle (w)', hourangle162b, 97.5));
console.log(check('Sun Zenith', sunzenith2, 79.59));
console.log(check('Solar Azimuth', sunazimuth2, 112.08));

// Example 1.6.3
// latitude 43º
// surfSlope 60º
// surfAzimuth 25º (W)
// solar time 16:00
// date March 16

let declination163 = sol.declinationForDay(sol.dayInYear('2001-3-16'));
let sunsethourangle163 = sol.sunsetHourAngle(43, declination163);
let hourangle163 = sol.hourAngle(16);
let sunzenith = sol.sunZenith(43, declination163, hourangle163);
let sunaltitude = 90 - sunzenith;
let sunazimuth163 = sol.sunAzimuth(43, declination163, hourangle163, sunzenith);
let profileangle163 = sol.profileAngle(sunaltitude, sunazimuth163, 25);

console.log('* Example 1.6.3');
console.log(check('Declination for 2000-3-15', declination163, -2.42));
console.log(check('Sunrise hour angle', -sunsethourangle163, -87.74));
console.log(check('Sunset hour angle', sunsethourangle163, 87.74));
console.log(check('Sunrise time', sol.hourAngleToTime(-sunsethourangle163), 6.15));
console.log(check('Sunset time', sol.hourAngleToTime(sunsethourangle163), 17.81));
console.log(check('Hour angle (w) at 16h', hourangle163, 60));
console.log(check('Sun zenith (theta_s)', sunzenith, 70.33));
console.log(check('Solar altitude (alfa_s)', sunaltitude, 19.67));
console.log(check('Sun azimuth (gamma_s)', sunazimuth163, 66.76));
console.log(check('Profile angle (alfa_P)', profileangle163, 25.6));

// Example 1.8.1
// Ratio for data in example 1.6.1
// Angle of incidence of beam radiation on a surface
// in Madison (WI) (lat=43ºN)
// at 10:30 (SOT) on February 13 (n=44)
// if the surface is tilted 45º from the horizontal (surfSlope, Beta=45º)
// and pointed 15º West of south (surfAzimuth = 15º).
let declination181 = sol.declinationForDay(sol.dayInYear('2001-2-13'));
let hourangle181 = sol.hourAngle(10.5);
let sunzenith181 = sol.sunZenith(43, declination181, hourangle181);
let sunazimuth181 = sol.sunAzimuth(43, declination181, hourangle181, sunzenith181);
let beamratio181 = sol.beamRatio(sunzenith181, sunazimuth181, 45, 15);

console.log('* Example 1.8.1');
console.log(check('Beam Ratio (R_b)', beamratio181, 1.66));
console.log(check('Surfangle',
                  sol.surfAngle2(sunzenith181, sunazimuth181, 45, 15),
                  35.16)
           );

// Example 1.8.2
// latitude 40º, tilt 30º, sufazimuth=0
// 9 to 10h, February 16
let declination182 = sol.declinationForDay(sol.dayInYear('2001-2-16'));
let hourangle182 = sol.hourAngle(9.5);
let sunzenith182 = sol.sunZenith(40, declination182, hourangle182);
let sunazimuth182 = sol.sunAzimuth(40, declination182, hourangle182, sunzenith182);
let beamratio182 = sol.beamRatio(sunzenith182, sunazimuth182, 30, 0);

console.log('* Example 1.8.2');
console.log(check('Beam Ratio (R_b)', beamratio182, 1.61));

// Example 1.8.3
// latitude 40º, tilt 50º, sufazimuth=0
// 9 to 10h, February 16
let beamratio183 = sol.beamRatio(sunzenith182, sunazimuth182, 50, 0);

console.log('* Example 1.8.3');
console.log(check('Beam Ratio (R_b)', beamratio183, 1.79));

// Example 1.10.1
// latitude 43º
// April 15
let nday1101 = sol.dayInYear('2011-4-15');

console.log('* Example 1.10.1');
console.log(check('Horizontal extraterrestrial radiation (H_o) [MJ/m2]',
                  sol.H_o(43, nday1101) / 1e6, 33.54));

// Example 1.10.2
// latitude 43º
// April 15
// hstart = 10h, hend=11h

console.log('* Example 1.10.2');
console.log(check('Extraterrestrial radiation on horizontal plane (I_o) [MJ/m2]',
                  sol.I_o(43, nday1101, 10) / 1e6, 3.77));

// Example 2.8.1
// Madison (Wisconsin)
// altitude 270m -> 0.27km
// latitude 43º
// August 22
// hour = 11:30h (SOT)
const nday281 = sol.dayInYear('2001-08-22');
const declination281 = sol.declinationForDay(nday281);
const hourangle281 = sol.hourAngle(11.5);
const zenith281 = sol.sunZenith(43, declination281, hourangle281);
const taub281 = sol.tau_b(zenith281, 0.27, 'Midlatitude summer');
const gon281 = sol.G_on(nday281);
const gcnb281 = sol.G_cnb(taub281, gon281);
const gcb281 = sol.G_cb(taub281, gon281, zenith281);

console.log('* Example 2.8.1');
console.log(check('Transmittance (beam) of the standard clear atmosphere (tau_b)',
                  taub281, 0.62));
console.log(check('Extraterrestrial radiation G_on [W/m2]',
                  gon281, 1338.49));
console.log(check('Clear-sky normal radiation G_cnb [W/m2]',
                  gcnb281, 829.58));
console.log(check('Clear-sky radiation on horizontal plane G_cnb [W/m2]',
                  gcb281, 701.51));

// Example 2.8.2
// Madison (Wisconsin)
// altitude 270m -> 0.27km
// latitude 43º
// August 22
// hour = 11:30h (SOT)
const declination282 = declination281;
const zenith282 = zenith281;
const taub282 = taub281;
const taud282 = sol.tau_d(taub282);
const go282 = sol.G_o(gon281, zenith282);
const gcb282 = gcb281;
const gcd282 = go282 * taud282;
console.log('* Example 2.8.2');
console.log(check('Transmittance (diffuse) of the standard clear atmosphere (tau_d)',
                  taud282, 0.089, 3));
console.log(check('Extraterrestrial radiation on an horizontal plane G_o [W/m2]',
                  go282, 1131.85));
console.log(check('Clear-sky diffuse radiation G_cd [W/m2]',
                  gcd282, 100.49));
console.log(check('Clear-sky total radiation on horizontal plane G_c = G_cb + G_cd [W/m2]',
                  gcb282 + gcd282, 802.00));

const Wh2MJ = 3600 * 1e-6;

console.log("Hora \t taub \t Icbn \t Icb \t taud \t Icd \t Ic");
_.range(0.5, 24.5)
  .map(h => {
    let hangle = sol.hourAngle(h);
    return [h, sol.sunZenith(43, declination282, hangle)];
  })
  .filter(data => {
    let zenith = data[1];
    return zenith <= 90;
  }) // sun over the horizon
  .map(data => {
    let h = data[0],
        zenith = data[1];
    let taub = sol.tau_b(zenith, 0.27, 'Midlatitude summer');
    let gon = sol.G_on(nday281);
    let gcbn = sol.G_cnb(taub, gon);
    let gcb = sol.G_cb(taub, gon, zenith);
    let taud = sol.tau_d(taub);
    let go = sol.G_o(gon, zenith);
    let gcd = go * taud;

    console.log(`${ h } \t ${ taub.toFixed(3) } \t ` +
                `${ (gcbn * Wh2MJ).toFixed(2) } \t ` +
                `${ (gcb * Wh2MJ).toFixed(2) } \t ` +
                `${ taud.toFixed(3) } \t ` +
                `${ (gcd * Wh2MJ).toFixed(2) } \t ` +
                `${ ((gcb + gcd) * Wh2MJ).toFixed(2) } \t `
               );
});


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
