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

// ******************* Solar functions **********************

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
// declination (delta): declination in degrees for day n
// latitude (phi): latitude in degrees, north positive (-90 <= phi <= 90)
// hourangle (w): hour angle in degrees
// surfslope (beta): angle in degrees between the plane of the surface and the horizontal 0<=beta <=180 (beta>90 means it has a downward facing component)
// surfazimuth (gamma): deviation in degrees of the projection on a horizontal plane of the normal to the surface from the local meridian, with zero due south, east negative, west positive (-180 <= gamma <= 180).

function surfAngle(declination, latitude, hourangle, surfslope, surfazimuth) {
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
// declination (delta): declination in degrees for day n
// latitude (phi): latitude in degrees, north positive (-90 <= phi <= 90)
// hourAngle(w): hour angle in degrees
// surfAzimuth (gamma): deviation in degrees of the projection on a horizontal plane of the normal to the surface from the local meridian, with zero due south, east negative, west positive (-180 <= gamma <= 180).

function surfAngleVert(declination, latitude, hourangle, surfazimuth) {
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

module.exports = { G_SC, TO_RAD, TO_DEG,
                   dayInYear, angleForDay,
                   G_on, EOT, solarToStandardTimeCorrection,
                   declinationForDay, hourAngle, hourAngleToTime, solarAltitude,
                   surfAngle, surfAngleVert, surfAngle2,
                   sunZenith, sunAzimuth,
                   sunsetHourAngle, numberOfDaylightHours,
                   profileAngle };
