// const x = {
//   location: {
//     name: "Kolkata",
//     region: "West Bengal",
//     country: "India",
//     lat: 22.5697,
//     lon: 88.3697,
//     tz_id: "Asia/Kolkata",
//     localtime_epoch: 1790766104,
//     localtime: "2026-09-30 16:31",
//   },
//   current: {
//     last_updated_epoch: 1790765100,
//     last_updated: "2026-09-30 16:15",
//     temp_c: 32.6,
//     temp_f: 90.6,
//     is_day: 1,
//     condition: {
//       text: "Smoky haze",
//       icon: "//cdn.weatherapi.com/weather/64x64/day/149.png",
//       code: 1036,
//     },
//     wind_mph: 7.4,
//     wind_kph: 11.9,
//     wind_degree: 284,
//     wind_dir: "WNW",
//     pressure_mb: 1008.0,
//     pressure_in: 29.77,
//     precip_mm: 0.0,
//     precip_in: 0.0,
//     humidity: 53,
//     cloud: 56,
//     feelslike_c: 36.3,
//     feelslike_f: 97.3,
//     windchill_c: 32.6,
//     windchill_f: 90.6,
//     heatindex_c: 36.8,
//     heatindex_f: 98.2,
//     dewpoint_c: 21.8,
//     dewpoint_f: 71.3,
//     vis_km: 10.0,
//     vis_miles: 6.0,
//     uv: 0.3,
//     gust_mph: 9.0,
//     gust_kph: 14.5,
//     will_it_rain: 0,
//     chance_of_rain: 6,
//     will_it_snow: 0,
//     chance_of_snow: 0,
//     wetbulb_c: 24.8,
//     wetbulb_f: 76.6,
//   },
// };
// console.log(x);

import readline from "node:readline/promises";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 2. Await the user's responses
const name = await rl.question("What is your name? ");

rl.close();

console.log("Really you are", name);
