import { AxiosRequestConfig, AxiosResponse } from "axios";
import * as fs from "fs";
import { Website } from "../src/Website";

export class SteamgiftsBot {
  website = new Website();

  html: string | undefined = undefined;

  page: number = 1;

  constructor() {
    // this.getPage()

    // Temporarily for testing to not spam requests - this.getPage() response in a file
    this.html = fs.readFileSync("C://Repositories/file.txt", "utf-8");
  }

  getPage(): void {
    try {
      let headers = {
        Cookie: "PHPSESSID=" + fs.readFileSync("./src/cookie.txt", "utf-8"),
      };

      let config: AxiosRequestConfig = {
        url: "https://www.steamgifts.com/",
        method: "get",
        headers: headers,
      };

      this.website.getPage(config).then((response: AxiosResponse) => {
        this.html = response.data;
      });
    } catch (error) {
      throw error;
    }
  }

  getGames(): any {}
}
