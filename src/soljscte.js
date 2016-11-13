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

Authors: Rafael Villar Burke <pachi@rvburke.com>
*/

/* Solar functions for building science

Implementation based on formulas from ISO/FDIS 52010-1:2015
*/

// *********************** Constants **************************

const G_SC = 1370.0; // Solar constant, W/m2
const TO_RAD = Math.PI / 180; // Degrees to radians conversion factor
const TO_DEG = 180 / Math.PI; // Radians to degrees conversion factor
const Wh2MJ = 3600 * 1e-6; // Wh to MJ conversion factor

// ***************** General utility functions ****************

function sind(angle) { return Math.sin(TO_RAD * angle); }
function cosd(angle) { return Math.cos(TO_RAD * angle); }
//function tand(angle) { return Math.tan(TO_RAD * angle); }
function asind(rsin) { return TO_DEG * Math.asin(rsin); }
function acosd(rcos) { return TO_DEG * Math.acos(rcos); }
//function atand(rtan) { return TO_DEG * Math.atan(rtan); }

// Number of day for given date [1, 365/366]
// isodatestring: date string in iso format, e.g. "2016-12-23"
function ndayfromdate(isodatestring) {
  const now = new Date(isodatestring);
  const start = new Date(now.getFullYear(), 0, 0);
  const oneDay = 1000 * 60 * 60 * 24; // miliseconds in day
  return Math.floor((now - start) / oneDay);
}

// ******************* Solar position functions **********************


// Solar declination (delta) -> degrees -23.45 <= delta <= 23.45
//
// angular position of the sun at solar noon with respect to the plane of the equator, north positive, eqs. (1), (2)
// nday: day of the year (1<= n <= 365)
function declination(nday) {
  const Rdc = nday * 360 / 365; // earth orbit deviation (2)
  return (0.33281 - 22.984 * cosd(Rdc) - 0.3499 * cosd(2 * Rdc)
          - 0.1398 * cosd(3 * Rdc) + 3.7872 * sind(Rdc)
          + 0.03205 * sind(2 * Rdc) + 0.07187 * sind(3 * Rdc));
}

// Equation of time -> minutes
//
// eqs. (3), (4), (5), (6), (7)
// nday: day of the year (1<= n <= 366)
function teq(nday) {
  let result = 0;
  if (nday < 21) {
    result = 2.6 + 0.44 * nday;
  } else if (nday < 136) {
    result = 5.2 + 9 * Math.cos((nday - 43) * 0.0357);
  } else if (nday < 241) {
    result = 1.4 - 5 * Math.cos((nday - 135) * 0.0449);
  } else if (nday < 336) {
    result = -6.3 - 10 * Math.cos((nday - 306) * 0.036);
  } else {
    result = 0.45 * (nday - 359);
  }
  return result;
}
// Time shift -> hours
//
// eqs. (8)
// tz: time zone (clock time for the location compared to UTC) [-12, +12]
// wlong: longitude of the weather station (degrees), east+, west- [-180, +180]
function tshift(tz, wlong) {
  return tz - wlong / 15;
}

// Solar time for clock time -> hours
//
// eqs. (9)
// nhour: clock time for the location, h [1, 24]
// nday: day of the year (1<= n <= 366)
// tz: time zone (clock time for the location compared to UTC) [-12, +12]
// wlong: longitude of the weather station (degrees), east+, west- [-180, +180]
function tsol(nhour, nday, tz, wlong) {
  return nhour - teq(nday) / 60 - tshift(tz, wlong);
}

// Solar hour angle -> degrees [-180, 180]
//
// eqs. (10)
// tsol: solar time (hours) [1, 24]
function hourangle(tsol) {
  let w = (12.5 - tsol) * 180 / 12;
  w = (w > 180) ? w - 360 : w;
  w = (w < -180) ? w + 360 : w;
  return w;
}

// Solar altitude -> degrees
//
// angle between the solar beam and the horizontal plane (degrees) eqs. (11)
// delta: solar declination, degrees
// hangle: solar hour angle, degrees [-180, 180]
// wlat: latitude of the weather station, degrees [-90, +90]
function saltitude(delta, hangle, wlat) {
  let alt = asind(sind(delta) * sind(wlat) + cosd(delta) * cosd(wlat) * cosd(hangle));
  return (alt < 0.0001) ? 0 : alt;
}

// solar altitude from zenith -> degrees
//
// szen: angle in degrees between the vertical and the line to the sun (angle of incidence of beam radiation on a horizontal surface)
function saltfromzenith(szen) {
    return 90 - szen;
}

// Solar zenith from solar altitude -> degrees
//
// angle between the solar beam and the zenith, degrees. eqs. (12)
// salt: solar altitude, degrees
function szenithfromalt(salt) {
  return 90 - salt;
}

// Solar azimuth -> degrees
//
// angle from south east+, west-, degrees [-180, +180], eqs. (13)-(16)
// delta: solar declination for day (degrees)
// hangle: hour angle for hour (degrees)
// salt: solar altitude (degrees)
// wlat: latitude of the weather station (degrees)
function sazimuth(delta, hangle, salt, wlat) {
  const cos1 = cosd(asind(sind(salt)));
  const sazimaux1 = cosd(delta) * sind(180 - hangle) / cos1;
  const cazimaux1 = (cosd(wlat) * sind(delta)
                     + sind(wlat) * cosd(delta) * cosd(180 - hangle)) / cos1;
  const azimaux = asind(cosd(delta) * sind(180 - hangle)) / cos1;
  if (sazimaux1 >= 0 && cazimaux1 > 0) { return 180 - azimaux; }
  if (cazimaux1 < 0) { return azimaux; }
  return -(180 + azimaux);
}

// Solar angle of incidence of inclined surface, degrees
//
// angle of the solar beam on an inclined surface, degrees, eqs. (17)
// (1.6.2)
// delta: solar declination for day (degrees)
// hangle: hour angle for hour (degrees)
// wlat: latitude of the weather station (degrees)
// beta: surface tilt angle, degrees [0, 180]
// gamma: surface orientation (deviation from south, E+, W-), degrees [-180, 180]
function sangleforsurf(delta, hangle, wlat, beta, gamma) {
  const sd = sind(delta);
  const cd = cosd(delta);
  const sh = sind(hangle);
  const ch = cosd(hangle);
  const sw = sind(wlat);
  const cw = cosd(wlat);
  const sb = sind(beta);
  const cb = cosd(beta);
  const sg = sind(gamma);
  const cg = cosd(gamma);
  return acosd(sd * sw * cb
               - sd * cw * sb * cg
               + cd * cw * cb * ch
               + cd * sw * sb * cg * ch
               + cd * sb * sg * sh);
}

// Azimuth between sun and the inclined surface (gamma_sol;ic) -> degrees
//
// eqs. (18)
// hangle: solar angle for hour (degrees)
// gamma: surface orientation (deviation from south, E+, W-), degrees [-180, 180]
function sgammaforsurf(hangle, gamma) {
  let saz = hangle - gamma;
  saz = (saz > 180) ? saz - 360 : saz;
  saz = (saz < -180) ? saz + 360 : saz;
  return saz;
}

// Tilt angle between sun and the inclined surface (beta_sol;ic) -> degrees
//
// eqs. (19)
// szenith: solar zenith (degrees)
// beta: surface tilt angle, degrees [0, 180]
function sbetaforsurf(szenith, beta) {
  let sbeta = beta - szenith;
  sbeta = (sbeta > 180) ? sbeta - 360 : sbeta;
  sbeta = (sbeta < -180) ? sbeta + 360 : sbeta;
  return sbeta;
}

// Air mass -> dimensionless
//
// eqs. (20), (21)
// salt: solar altitude angle, degrees
function airmass(salt) {
  const sa = sind(salt);
  if (salt >= 10) { return 1 / sa; }
  return 1 / (sa + 0.15 * Math.pow((salt + 3.885), -1.253));
}

// Split between direct and diffuse solar irradiance
// XXX: We skip this as we have climatic data

// Solar direct (beam) radiation (G_sol;b) from solar direct radiation on an horizontal surface (G_sol;hor) -> W/m2
// gsolhor: solar direct irradiance on an horizontal plane, W/m2
// salt: solar altitude, degrees
function gsolbeam(gsolhor, salt) {
  return gsolhor / sind(salt);
}

// Direct irradiance on inclined surface (I_dir) -> W/m2
//
// eqs. (26)
// gsolbeam: solar direct (beam) radiation (G_sol;b), W/m2
// sangle: solar angle of incidence on the inclined surface, degrees (function sangleforsurf)
function idir(gsolbeam, sangle) {
  return Math.max(0, gsolbeam * cosd(sangle));
}

// Extra-terrestrial radiation -> W/m2
//
// normal irradiation out of the atmosphere, by day eqs. (27)
// nday: day of the year (1<= n <= 366)
function iext(nday) {
  return G_SC * (1 + 0.033 * cosd(360 * nday / 365));
}

// Diffuse irradiance helper functions

// clearness parameter (epsilon), adimensional eq.(30)
// gsolbeam: solar direct (beam) radiation, W/m2
// gsoldiff: solar diffuse radiation on an horizontal plane, W/m2
// salt: solar altitude, degrees
function getclearness(gsolbeam, gsoldiff, salt) {
  if (gsoldiff < 0.01) return 999;
  const K = 1.014; // rad^-3
  const kk = K * Math.pow(TO_RAD * salt, 3);
  return (((gsoldiff + gsolbeam) / gsoldiff) + kk) / (1 + kk);
}

// Brightness coefficients (table 9)
function getbrightnesscoefficients(clearness) {
  if (clearness < 1.065) {
    return { f11: -0.008, f12: 0.588, f13: -0.062,
             f21: -0.060, f22: 0.072, f23: -0.022 };
  }
  if (clearness < 1.230) {
    return { f11: 0.130, f12: 0.683, f13: -0.151,
             f21: -0.019, f22: 0.066, f23: -0.029 };
  }
  if (clearness < 1.500) {
    return { f11: 0.330, f12: 0.487, f13: -0.221,
             f21: 0.055, f22: -0.064, f23: -0.026 };
  }
  if (clearness < 1.950) {
    return { f11: 0.568, f12: 0.187, f13: -0.295,
             f21: 0.109, f22: -0.152, f23: -0.014 };
  }
  if (clearness < 2.280) {
    return { f11: 0.873, f12: -0.392, f13: -0.362,
             f21: 0.226, f22: -0.462, f23: 0.001 };
  }
  if (clearness < 4.500) {
    return { f11: 1.132, f12: -1.237, f13: -0.412,
             f21: 0.288, f22: -0.823, f23: 0.056 };
  }
  if (clearness < 6.200) {
    return { f11: 1.060, f12: -1.600, f13: -0.359,
             f21: 0.264, f22: -1.127, f23: 0.131 };
  }
  return { f11: 0.678, f12: -0.327, f13: -0.250,
           f21: 0.156, f22: -1.377, f23: 0.251 };
}

// Diffuse irradiance (without ground reflection) -> W/m2
//
// eqs. (28)-(34)
// nday: day of the year (1<= n <= 366)
// gsolbeam: solar direct (beam) radiation, W/m2
// gsoldiff: solar diffuse radiation on an horizontal plane, W/m2
// salt: solar altitude, degrees
// sangle: solar angle of incidence on the inclined surface, degrees (function sangleforsurf)
// beta: surface tilt angle, degrees [0, 180]
function idif(nday, gsolbeam, gsoldiff, salt, sangle, beta) {
  const sazim = 90 - salt;
  const a = Math.max(0, cosd(sangle));
  const b = Math.max(cosd(85), cosd(sazim));
  const clearness = getclearness(gsolbeam, gsoldiff, salt);
  const c = getbrightnesscoefficients(clearness);
  const skybr = airmass(salt) * gsoldiff / iext(nday); // sky brightness param
  const F1 = Math.max(0, c.f11 + c.f12 * skybr + c.f13 * TO_RAD * sazim);
  const F2 = c.f21 + c.f22 * skybr + c.f23 * TO_RAD * sazim;

  return gsoldiff * ((1 - F1) * (1 + cosd(beta)) / 2
                     + F1 * a / b
                     + F2 * sind(beta));
}

// Diffuse irradiance due to ground reflection -> W/m2
//
// eqs. (35)
//
// gsolbeam: solar direct (beam) radiation, W/m2
// gsoldiff: solar diffuse radiation on an horizontal plane, W/m2
// salt: solar altitude, degrees
// beta: surface tilt angle, degrees [0, 180]
// albedo: solar reflectivity of the ground [0.0, 1.0]
function idifgrnd(gsolbeam, gsoldiff, salt, beta, albedo) {
  return (gsoldiff + gsolbeam * sind(salt)) * albedo * (1 - cosd(beta)) / 2;
}

// Circumsolar irradiance -> W/m2
//
// eqs. (36)
// nday: day of the year (1<= n <= 366)
// gsolbeam: solar direct (beam) radiation, W/m2
// gsoldiff: solar diffuse radiation on an horizontal plane, W/m2
// salt: solar altitude, degrees
// sangle: solar angle of incidence on the inclined surface, degrees (function sangleforsurf)
function icircum(nday, gsolbeam, gsoldiff, salt, sangle) {
  const sazim = 90 - salt;
  const a = Math.max(0, cosd(sangle));
  const b = Math.max(cosd(85), cosd(sazim));
  const clearness = getclearness(gsolbeam, gsoldiff, salt);
  const c = getbrightnesscoefficients(clearness);
  const skybr = airmass(salt) * gsoldiff / iext(nday); // sky brightness param
  const F1 = Math.max(0, c.f11 + c.f12 * skybr + c.f13 * TO_RAD * sazim);
  return gsoldiff * F1 * a / b;
}

// Total direct solar irradiance -> W/m2
//
// eqs. (37)
// month: month of the year [1, 12]
// day: day of the month [1, 31]
// hour: solar hour [1, 24]
// gsolbeam: solar direct (beam) radiation (G_sol;b), W/m2
// gsoldiff: solar diffuse radiation on an horizontal plane, W/m2
// saltitude: solar altitude, degrees
// wlat: latitude of the weather station, degrees [-90, +90]
// beta: surface tilt angle, degrees [0, 180]
// gamma: surface orientation (deviation from south, E+, W-), degrees [-180, 180]
function idirtot(month, day, hour, gsolbeam, gsoldiff, saltitude,
                 wlat, beta, gamma) {
  const nday = ndayfromdate(`2001-${ month }-${ day }`);
  const delta = declination(nday);
  const hangle = hourangle(hour);
  // sangle: surface incidence angle
  const sangle = sangleforsurf(delta, hangle, wlat, beta, gamma);
  // idir: direct irradiance on the inclined surface, W/m2
  // icircum: circumsolar irradiance, W/m2
  const idirval = idir(gsolbeam, sangle);
  const icircumval = icircum(nday, gsolbeam, gsoldiff, saltitude, sangle);
  const idirtotval = idirval + icircumval;
  //console.log('idirtot: ', idirtotval, 'idir: ', idirval, 'icircum: ', icircumval);
  return idirtotval;
}

// Total diffuse solar irradiance -> W/m2
//
// eqs. (38)
// month: month of the year [1, 12]
// day: day of the month [1, 31]
// hour: solar hour [1, 24]
// gsolbeam: solar direct (beam) radiation (G_sol;b), W/m2
// gsoldiff: solar diffuse radiation on an horizontal plane, W/m2
// saltitude: solar altitude, degrees
// wlat: latitude of the weather station, degrees [-90, +90]
// beta: surface tilt angle, degrees [0, 180]
// gamma: surface orientation (deviation from south, E+, W-), degrees [-180, 180]
// albedo: solar reflectivity of the ground [0.0, 1.0]
function idiftot(month, day, hour, gsolbeam, gsoldiff, saltitude,
                 wlat, beta, gamma, albedo) {
  const nday = ndayfromdate(`2001-${ month }-${ day }`);
  const delta = declination(nday);
  const hangle = hourangle(hour);
  const sangle = sangleforsurf(delta, hangle, wlat, beta, gamma);
  // idif: diffuse irradiance on the inclined surface, W/m2
  // icircum: circumsolar irradiance, W/m2
  // idifgrnd: irradiance on the inclined surface by ground reflection, W/m2
  const idifval = idif(nday, gsolbeam, gsoldiff, saltitude, sangle, beta);
  const icircumval = icircum(nday, gsolbeam, gsoldiff, saltitude, sangle);
  const idifgrndval = idifgrnd(gsolbeam, gsoldiff, saltitude, beta, albedo);
  const idiftotval = idifval - icircumval - idifgrndval;
  //console.log('idiftot: ', idiftotval, 'idif: ', idifval, 'icircum: ', icircumval, 'idifgrnd: ', idifgrndval);
  return idiftotval;
}

// Total solar irradiance -> W/m2
//
// eqs. (39)
// month: month of the year [1, 12]
// day: day of the month [1, 31]
// hour: solar hour [1, 24]
// gsolbeam: solar direct (beam) radiation (G_sol;b), W/m2
// gsoldiff: solar diffuse radiation on an horizontal plane, W/m2
// saltitude: solar altitude, degrees
// wlat: latitude of the weather station, degrees [-90, +90]
// beta: surface tilt angle, degrees [0, 180]
// gamma: surface orientation (deviation from south, E+, W-), degrees [-180, 180]
// albedo: solar reflectivity of the ground [0.0, 1.0]
function itot(month, day, hour, gsolbeam, gsoldiff, saltitude,
              wlat, beta, gamma, albedo) {
  return (
    idirtot(month, day, hour, gsolbeam, gsoldiff, saltitude,
            wlat, beta, gamma)
      + idiftot(month, day, hour, gsolbeam, gsoldiff, saltitude,
                wlat, beta, gamma, albedo)
  );
}

// ************************ CTE weather data *********************************

const CTE_LATPENINSULA = 40.7;
const CTE_LATCANARIAS = 28.3;

// Latitude for location ('peninsula' or 'canarias')
function CTE_latitude(location) {
    if (location === 'peninsula') return CTE_LATPENINSULA;
    if (location === 'canarias') return CTE_LATCANARIAS;
    return null;
}

// ************************* Exports *****************************************

module.exports = { G_SC, TO_RAD, TO_DEG, Wh2MJ,
                   ndayfromdate, declination, teq, tshift, tsol, hourangle,
                   saltitude, saltfromzenith, szenithfromalt, sazimuth,
                   sangleforsurf, sgammaforsurf, sbetaforsurf, airmass, gsolbeam,
                   idir, iext, idif, idifgrnd, icircum, idirtot, idiftot, itot,
                   getclearness, getbrightnesscoefficients,
                   CTE_latitude, CTE_LATPENINSULA, CTE_LATCANARIAS
                 };
