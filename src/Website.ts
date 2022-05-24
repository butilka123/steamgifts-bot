import axios from "axios";
import * as fs from "fs";

export class Website {
  url: string = "";
  axiosInstance = axios.create();

  ownCookie: string = "";

  config = {};

  setUrl() {
    this.url = "https://www.steamgifts.com/";
  }

  setCookie() {
    this.ownCookie = fs.readFileSync("./src/cookie.txt", "utf-8");
  }

  setConfig() {
    this.config = {
      url: this.url,
      method: "get",
      headers: {
        Cookie: `PHPSESSID=${this.ownCookie}`,
      },
    };
  }

  getPage() {
    this.axiosInstance
      .request(this.config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => console.error(error));
  }
}
