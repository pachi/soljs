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

/* Solar functions for building science

Implementation based on formulas from:

    Duffie, J.A. & Beckman, W.A., Solar Engineering of Thermal Processes, Wiley, 2013.
*/

// *********************** Constants **************************

const G_SC = 1367.0; // Solar constant, W/m2
const TO_RAD = Math.PI / 180; // Degrees to radians conversion factor
const TO_DEG = 180 / Math.PI; // Radians to degrees conversion factor

// ***************** General utility functions ****************

function sind(angle) { return Math.sin(TO_RAD * angle); }
function cosd(angle) { return Math.cos(TO_RAD * angle); }
function tand(angle) { return Math.tan(TO_RAD * angle); }
function acosd(rcos) { return TO_DEG * Math.acos(rcos); }
function atand(rtan) { return TO_DEG * Math.atan(rtan); }

// Number of day for given date [1, 365/366]
// isodatestring: date string in iso format, e.g. "2016-12-23"
function dayInYear(isodatestring) {
  const now = new Date(isodatestring);
  const start = new Date(now.getFullYear(), 0, 0);
  const oneDay = 1000 * 60 * 60 * 24; // miliseconds in day
  return Math.floor((now - start) / oneDay);
}

// ******************* Solar position functions **********************

// Equation of time -> minutes
// Spencer(1971) (1.5.3)
// n: day of the year (1<= n <= 365)
function EOT(n) {
    const bb = angleForDay(n);
    return 229.2 * (0.000075
                    + 0.001868 * cosd(bb)
                    - 0.032077 * sind(bb)
                    - 0.014615 * cosd(2 * bb)
                    - 0.04089 * sind(2 * bb));
}

// Solar time to standard time correction -> hours
// (1.5.2)
// * Standard time does not include DST.
// latst: Standard meridian for the local time zone (0 < L < 360, W+)
// latloc: Longitude of the location in question (0 < L < 360, W+)
// n: day of the year (1<= n <= 365)
function solarToStandardTimeCorrection(latst, latloc, n) {
    return (4 * (latst - latloc) + EOT(n)) / 60;
}

// Declination (delta) -> degrees
//
// angular position of the sun at solar noon with respect to the plane of the equator, north positive
// -23.45 <= delta <= 23.45 (degrees)
// n: day of the year (1<= n <= 365)
// Cooper(1969) (1.6.1a)
function declinationForDay(n) {
    return 23.45 * sind((284 + n) * 360 / 365);
}

// Hour angle (w) of given hour -> degrees
//
// angular displacement of the sun east or west of the local meridian due to
// rotation of the earth on its axis at 15º per hour; morning negative, afternoon positive.
// e.g. for noon (hour=12), w=0
function hourAngle(hour) {
    return 15 * (hour - 12);
}

// Convert from hour angle to hour (angle) -> hours
//
// hourangle: degrees from south (from noon)
// useful to convert sunrise and sunset angles to time in hours
function hourAngleToTime(hourangle) {
  return 12 + hourangle / 15; // earth rotates 15º per hour
}

// solar altitude -> degrees
//
// sunZenith (zeta_z): angle in degrees between the vertical and the line to the sun (angle of incidence of beam radiation on a horizontal surface)
function solarAltitude(sunzenith) {
    return 90 - sunzenith;
}

// Angle of incidence of the beam radiation on a surface (zeta) -> degrees
// from declination, latitude and hour data (1.6.2)
//
// latitude (phi): latitude in degrees, north positive (-90 <= phi <= 90)
// declination (delta): declination in degrees for day n
// hourangle (w): hour angle in degrees
// surfslope (beta): angle in degrees between the plane of the surface and the horizontal 0<=beta <=180 (beta>90 means it has a downward facing component)
// surfazimuth (gamma): deviation in degrees of the projection on a horizontal plane of the normal to the surface from the local meridian, with zero due south, east negative, west positive (-180 <= gamma <= 180).

function surfAngle(latitude, declination, hourangle, surfslope, surfazimuth) {
  return acosd(
    sind(declination) * sind(latitude) * sind(surfslope)
      - sind(declination) * cosd(latitude) * sind(surfslope) * cosd(surfazimuth)
      + cosd(declination) * cosd(latitude) * cosd(surfslope) * cosd(hourangle)
      + cosd(declination) * sind(latitude) * sind(surfslope) * cosd(surfazimuth) * cosd(hourangle)
      + cosd(declination) * sind(surfslope) * sind(surfazimuth) * sind(hourangle)
  );
}

// Angle of incidence of the beam radiation on a vertical surface (zeta) -> degrees
// from declination, latitude and hour data (1.6.4)
// eq. 1.6.2 with surfSlope beta=90
// latitude (phi): latitude in degrees, north positive (-90 <= phi <= 90)
// declination (delta): declination in degrees for day n
// hourAngle(w): hour angle in degrees
// surfAzimuth (gamma): deviation in degrees of the projection on a horizontal plane of the normal to the surface from the local meridian, with zero due south, east negative, west positive (-180 <= gamma <= 180).

function surfAngleVert(latitude, declination, hourangle, surfazimuth) {
  return acosd(
      -1 * sind(declination) * cosd(latitude) * cosd(surfazimuth)
      + cosd(declination) * sind(latitude) * cosd(surfazimuth) * cosd(hourangle)
      + cosd(declination) * sind(surfazimuth) * sind(hourangle)
  );
}

// Angle of incidence of the beam radiation on a surface (zeta) -> degrees
// from sun position data (1.6.3)
//
// sunZenith (zeta_z): angle in degrees between the vertical and the line to the sun (angle of incidence of beam radiation on a horizontal surface)
// sunAzimuth (gamma_s): solar azimuth angle in degrees (angle from south of the horizontal projection of the beam. East of south are negative and west of south are positive)
// surfSlope (beta): angle between the plane of the surface and the horizontal 0<=beta <=180 (beta>90 means it has a downward facing component)
// surfAzimuth (gamma): deviation of the projection on a horizontal plane of the normal to the surface from the local meridian, with zero due south, east negative, west positive (-180 <= gamma <= 180).

function surfAngle2(sunzenith, sunazimuth, surfslope, surfazimuth) {
  return acosd(
    cosd(sunzenith) * cosd(surfslope)
      + sind(sunzenith) * sind(surfslope) * cosd(sunazimuth - surfazimuth)
  );
}

// Solar zenith -> degrees
//
// [0, 90] when sun over the horizon
// 1.6.5
function sunZenith(latitude, declination, hourangle) {
  return acosd(
    cosd(latitude) * cosd(declination) * cosd(hourangle)
      + sind(latitude) * sind(declination)
  );
}

// Solar azimuth angle -> degrees [-180, 180]
//
// (1.6.6)
function sunAzimuth(latitude, declination, hourangle, szenith) {
  const sign = (hourangle >= 0) ? 1 : -1;
  return sign * Math.abs(
    acosd(
      (cosd(szenith) * sind(latitude) - sind(declination))
        / (sind(szenith) * cosd(latitude))
    )
  );
}

// sunset hour angle w_s -> degrees
//
// hour angle for sunset. sunrise is the negative of the sunset hour angle
// (1.6.10)
function sunsetHourAngle(latitude, declination) {
  return acosd(-tand(latitude) * tand(declination));
}

// number of daylight hours -> hours
//
// (1.6.11)
function numberOfDaylightHours(latitude, declination) {
  return 2 * sunsetHourAngle(latitude, declination) / 15;
}

// profile angle for surface with given azimuth
//
// (1.6.12)
// profile angle = projection of the solar altitude angle on a vertical plane
// useful in calculating shading by overhangs
function profileAngle(sunaltitude, sunazimuth, surfazimuth) {
  return atand(tand(sunaltitude) / cosd(sunazimuth - surfazimuth));
}

// Ratio of beam radiation on tilted surface to that on horizontal surface (R_b)
//
// (1.8.1)
// sunZenith (zeta_z): angle in degrees between the vertical and the line to the sun (angle of incidence of beam radiation on a horizontal surface)
// sunAzimuth (gamma_s): solar azimuth angle in degrees (angle from south of the horizontal projection of the beam. East of south are negative and west of south are positive)
// surfSlope (beta): angle between the plane of the surface and the horizontal 0<=beta <=180 (beta>90 means it has a downward facing component)
// surfAzimuth (gamma): deviation of the projection on a horizontal plane of the normal to the surface from the local meridian, with zero due south, east negative, west positive (-180 <= gamma <= 180).
function beamRatio(sunzenith, sunazimuth, surfslope, surfazimuth) {
  return cosd(surfAngle2(sunzenith, sunazimuth, surfslope, surfazimuth))
    / cosd(sunzenith);
}

// Ratio of beam radiation on tilted surface facing south to horizontal (R_b_noon)
//
// 1.8.4a
// Valid only for the northern hemisphere
function beamRatioNoon(latitude, declination, surfslope) {
  return (cosd(Math.abs(latitude - declination - surfslope)) / cosd(Math.abs(latitude - declination)));
}

// Table 1.6.1
// -----------
// Average days of month, from Klein(1977) - use fon |latitude| <= 66.5º
//
// Month      Average date n    declination (delta)
// ---------- ------------ ---- -------------------
// January    17           17   -20.9
// February   16           47   -13.0
// March      16           75   -2.4
// April      15           105  9.4
// May        15           135  18.8
// June       11           162  23.1
// July       17           198  21.2
// August     16           228  13.5
// September  15           258  2.2
// October    15           288  -9.6
// November   14           318  -18.9
// December   10           344  -23.0
// ---------- ------------ ---- -------------------
const MEANDAYS = [17, 47, 75, 105, 135, 162, 198, 228, 258, 288, 318, 344];

// Solar position plot for latitude Xº
// -------------------------------------------------------
// X axis - solar azimuth angle (gamma_s)
// Y axis - solar altitude angle (alpha_s)
//        - solar zenith (theta_s = 90 - alpha_s)
// Lines of constant declination
//        - for mean days of the months (see table 1.6.1)
// Lines of constant hour angles labeled by hours
// -------------------------------------------------------

// ************************ Radiation functions ************************

// Day angle, B -> degrees
// n: day of the year (1<= n <= 365)
function angleForDay(n) {
    return (n - 1) * 360 / 365;
}

// Extraterrestrial radiation on the plane normal to the radiation -> W/m2
// n: day of the year (1<= n <= 365)
function G_on(n) {
    return G_SC * (1 + 0.033 * cosd(angleForDay(n + 1))); // (1.4.1.a)
}

// Extraterrestrial radiation on an horizontal plane (1.10.1) (1.10.2)
//
// latitude (phi)
// gon: extraterrestrial radiation on the plane normal to the radiation [W/m2]
// zenith: sun zenith [degrees].
function G_o(gon, zenith) {
  return gon * cosd(zenith);
}

// Daily extraterrestrial radiation on a horizontal surface, H_o -> J/m².day
//
function H_o(latitude, nday) {
  const declination = declinationForDay(nday);
  const sunsethourangle = sunsetHourAngle(latitude, declination);
  return 24 * 3600 * G_SC / Math.PI
    * (1 + 0.033 * cosd(360 * nday / 365))
    * (cosd(latitude) * cosd(declination) * sind(sunsethourangle)
       + Math.PI * sunsethourangle / 180 * sind(latitude) * sind(declination));
}

// Monthly mean daily extraterrestrial radiation H_o_mean -> J/m².day
// Computed using the mean day of each month
// nmonth: [1,12]
function H_o_mean(latitude, nmonth) {
  const nday = MEANDAYS[nmonth - 1];
  return H_o(latitude, nday);
}

// Extraterrestrial radiation on a horizontal plane for an hour period -> J/m²
// (1.10.4)
// XXX: check
function I_o(latitude, nday, starthour, endhour) {
  const declination = declinationForDay(nday);
  const hangle1 = hourAngle(starthour);
  const hangle2 = hourAngle(endhour);
  return 12 * 3600 * G_SC / Math.PI
    * (1 + 0.033 * cosd(360 * nday / 365))
    * (cosd(latitude) * cosd(declination) * (sind(hangle2) - sind(hangle1))
       + Math.PI * (hangle2 - hangle1) / 180 * sind(latitude) * sind(declination));
}

// Atmospheric transmittance for beam radiation (tau_b) (2.8.1a)
//
// tau_b = G_bn / G_on
// zenith: sun zenith angle (degrees)
// altitude: loation altitude (km)
// XXX: See correction factors r_i for climate types in table 2.8.1
//
// Table 2.8.1 Correction Factors for Climate Types (From Hottel (1976))
// Climate Type         r0   r1   rk
// -------------------- ---- ---- ----
// Tropical             0.95 0.98 1.02
// Midlatitude summer   0.97 0.99 1.02
// Subarctic summer     0.99 0.99 1.01
// Midlatitude winter   1.03 1.01 1.00
//
function tau_b(zenith, altitude, climatetype) {
  const coefs = { 'Tropical': [0.95, 0.98, 1.02],
                  'Midlatitude summer': [0.97, 0.99, 1.02],
                  'Subarctic summer': [0.99, 0.99, 1.01],
                  'Midlatitude winter': [1.03, 1.01, 1.00]
                }[climatetype] || [1.00, 1.00, 1.00];
  const r0 = coefs[0];
  const r1 = coefs[1];
  const rk = coefs[2];
  // const r0 = 1,
  //       r1 = 1,
  //       rk = 1;
  const a0 = r0 * (0.4237 - 0.00821 * Math.pow((6 - altitude), 2));
  const a1 = r1 * (0.5055 + 0.00595 * Math.pow((6.5 - altitude), 2));
  const k = rk * (0.2711 + 0.01858 * Math.pow((2.5 - altitude), 2));
  return a0 + a1 * Math.exp(-k / cosd(zenith));
}

// Clear-sky normal beam radiation (G_cnb) -> W/m2
//
// G_cnb = tau_b * G_on
function G_cnb(taub, gon) {
  return taub * gon;
}

// Clear-sky horizontal beam radiation (G_cb) -> W/m2
//
// G_cb = tau_b * G_on * cos(zenith)
function G_cb(taub, gon, zenith) {
  return taub * gon * cosd(zenith);
}

// Transmission coefficient for diffuse radiation for clear days (tau_d) (2.8.5)
//
// Liu and Jordan(1960) tau_d = G_d / G_o = I_d / I_o
// G_d can be used to get total radiation G_c = G_cb + G_cd
// taub: transmission coefficient for beam radiation for clear sky
function tau_d(taub) {
  return 0.271 - 0.294 * taub;
}

// TODO:

// 2.12.1a / 2.12.1b
// Monthly average difuse fraction correlations Hm_d / Hm = f(Km_T)
// Compute average daily radiation for CTE climates -> Km_T -> Hm_d


// 2.14.1 -> 2.12.3 -> R_b,ave

module.exports = { G_SC, TO_RAD, TO_DEG,
                   dayInYear, angleForDay,
                   EOT, solarToStandardTimeCorrection,
                   declinationForDay, hourAngle, hourAngleToTime, solarAltitude,
                   surfAngle, surfAngleVert, surfAngle2,
                   sunZenith, sunAzimuth,
                   sunsetHourAngle, numberOfDaylightHours,
                   profileAngle,
                   beamRatio, beamRatioNoon,
                   MEANDAYS,
                   G_on, G_o, H_o, H_o_mean, I_o,
                   tau_b, G_cnb, G_cb,
                   tau_d
                 };
