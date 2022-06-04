import { AxiosRequestConfig, AxiosResponse } from "axios";
import cheerio from "cheerio";
import * as fs from "fs";
import { Website } from "../src/Website";

export class SteamgiftsBot {
  website = new Website();

  currentPage: number = 1;

  xsrf_token: string = "";

  headers = {
    Cookie: "PHPSESSID=" + fs.readFileSync("./src/cookie.txt", "utf-8"),
  };

  html: string = "";

  constructor() {
    this.getGames();
  }

  async getPage(websiteUrl) {
    try {
      const config: AxiosRequestConfig = {
        url: websiteUrl,
        method: "get",
        headers: this.headers,
      };

      await this.website.getPage(config).then((response: AxiosResponse) => {
        if (response.status === 200) {
          this.html = response.data;
        } else {
          throw console.error(response.status + " - " + response.statusText);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async getGames() {
    try {
      await this.getPage(
        "https://www.steamgifts.com/giveaways/search?page=" + this.currentPage
      );

      console.log("Processing games from Page " + this.currentPage);

      const $ = cheerio.load(this.html);

      const points: number = Number($(".nav__points").text());
      this.xsrf_token = $('[name="xsrf_token"]').val();

      const gameList = $(".giveaway__row-inner-wrap");

      for (let game of gameList) {
        const gameCost: number = Number(
          $(game)
            .find(".giveaway__heading__thin")
            .last()
            .text()
            .replace(/[^0-9]/g, "")
        );

        const gameName: string = $(game)
          .find(".giveaway__heading__name")
          .text();

        const gameCode: string = $(game)
          .find(".giveaway__heading__name")
          .attr("href")
          .split("/")[2];

        if (points - gameCost < 0) {
          console.log(
            "Not enough Points to enter the next giveaway. Waiting 1 hour to get more Points"
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 60)); // 1 h
          this.getGames();
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2)); // 2 sec
        await this.enterGiveaway(
          "https://www.steamgifts.com/ajax.php",
          gameCode,
          gameName
        );
      }

      console.log("List of games ended. Waiting 2 Minutes to continiue");
      await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 2)); // 2 min
      this.currentPage = this.currentPage + 1;
      this.getGames();
    } catch (error) {
      throw error;
    }
  }

  async enterGiveaway(url: string, gameCode: string, gameName: string) {
    try {
      const payload = `xsrf_token=${this.xsrf_token}&do=entry_insert&code=${gameCode}`;

      const config: AxiosRequestConfig = {
        url: url,
        method: "post",
        headers: this.headers,
        data: payload,
      };

      this.website.getPage(config).then((response: AxiosResponse) => {
        if (response.status === 200) {
          console.log("> Entered giveaway: " + gameName);
        } else {
          throw console.error(response.status + " - " + response.statusText);
        }
      });
    } catch (error) {
      throw error;
    }
  }
}

// .giveaway__column--contributor-level--negative
// .is-faded
