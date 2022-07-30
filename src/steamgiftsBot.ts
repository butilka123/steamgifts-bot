import { AxiosRequestConfig, AxiosResponse } from "axios";
import cheerio from "cheerio";
import * as fs from "fs";
import { Website } from "./Website";

export class SteamgiftsBot {
  website = new Website();

  currentPage: number = 1;

  xsrf_token: string = "";

  points: number = 0;

  headers = {
    Cookie: "PHPSESSID=" + fs.readFileSync("./cookie.txt", "utf-8"),
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

      const $ = cheerio.load(this.html);
      const gameList = $(".giveaway__row-inner-wrap");
      this.points = Number($(".nav__points").text());
      this.xsrf_token = $('[name="xsrf_token"]').val();

      console.log(
        new Date().toLocaleString() +
          " - " +
          "Processing games from Page " +
          this.currentPage
      );

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

        const isEntered: boolean = $(game).hasClass("is-faded");

        if (this.points - gameCost < 0 && !isEntered) {
          await this.enterGiveaway;

          await new Promise((resolve) => setTimeout(resolve, 1000 * 2)); // Console log wrong for some reason
          console.log(
            new Date().toLocaleString() +
              " - " +
              "Not enough Points to enter the next giveaway. Waiting 1 hour to get more Points"
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 60)); // 1 h
          this.getGames();
          break;
        } else if (!isEntered) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2)); // 2 sec (request limit)
          await this.enterGiveaway(
            "https://www.steamgifts.com/ajax.php",
            gameCode,
            gameName,
            gameCost
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * 2)); // Console log wrong for some reason
      console.log("List of games ended. Waiting 10 Minutes to update");
      await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 10)); // 10 min
      // this.currentPage = this.currentPage + 1; // Not working propperly
      this.getGames();
    } catch (error) {
      throw error;
    }
  }

  async enterGiveaway(
    url: string,
    gameCode: string,
    gameName: string,
    gameCost: number
  ): Promise<void> {
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
          console.log(
            new Date().toLocaleString() +
              " - " +
              "Entering giveaway: " +
              gameName
          );
          this.points = this.points - gameCost;
        } else {
          throw console.error(response.status + " - " + response.statusText);
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
