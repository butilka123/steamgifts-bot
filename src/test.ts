import cheerio from "cheerio";
import * as fs from "fs";
const html = fs.readFileSync("../file.txt", "utf-8");

const $ = cheerio.load(html);

const gameList = $(".giveaway__column--contributor-level--negative").text();

console.log(gameList);

// .giveaway__column--contributor-level--negative
// .is-faded
