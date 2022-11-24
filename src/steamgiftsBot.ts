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
		Cookie: `PHPSESSID=\${fs.readFileSync("cookie.txt", "utf-8")}`,
	};

	html: string = "";

	constructor() {
		this.getGames();
	}

	async getPage(websiteUrl): Promise<AxiosResponse> {
		try {
			const config: AxiosRequestConfig = {
				url: websiteUrl,
				method: "get",
				headers: this.headers,
			};

			return await this.website
				.getPage(config)
				.then((response: AxiosResponse) => {
					if (response.status === 200) {
						this.html = response.data;

						return response;
					} else {
						throw console.error(`${response.status} - ${response.statusText}`);
					}
				});
		} catch (error) {
			throw error;
		}
	}

	async getGames(): Promise<void> {
		try {
			await this.getPage(
				`https://www.steamgifts.com/giveaways/search?page=${this.currentPage}`,
			);

			// Extracting information from HTML

			const $ = cheerio.load(this.html);
			const gameList = $(".giveaway__row-inner-wrap");
			this.points = Number($(".nav__points").text());

			console.log(this.points);

			this.xsrf_token = $('[name="xsrf_token"]').val();

			this.writeLog(`Processing games from Page ${this.currentPage}`);

			for (let game of gameList) {
				const gameCost: number = Number(
					$(game)
						.find(".giveaway__heading__thin")
						.last()
						.text()
						.replace(/[^0-9]/g, ""),
				);

				const gameName: string = $(game)
					.find(".giveaway__heading__name")
					.text();

				const gameCode: string = $(game)
					.find(".giveaway__heading__name")
					.attr("href")
					.split("/")[2];

				const isEntered: boolean = $(game).hasClass("is-faded");

				// Logic for entering giveaways

				if (this.points - gameCost < 0 && !isEntered) {
					this.writeLog(
						"Not enough Points to enter the next giveaway. Waiting 1 hour to get more Points",
					);

					await this.wait(60 * 60); // 1 h

					// Stopping function and reentering
					this.getGames();
					return;
				} else if (!isEntered) {
					await this.wait(2); // 2 sec (request limit)

					await this.enterGiveaway(
						"https://www.steamgifts.com/ajax.php",
						gameCode,
						gameName,
						gameCost,
					);
				}
			}

			this.writeLog("List of games ended. Waiting 10 Minutes to update");

			await this.wait(60 * 10); // 10 min

			// this.currentPage = this.currentPage + 1; // No logic defined
			this.getGames();
		} catch (error) {
			throw error;
		}
	}

	async enterGiveaway(
		url: string,
		gameCode: string,
		gameName: string,
		gameCost: number,
	): Promise<AxiosResponse> {
		try {
			const payload = `xsrf_token=${this.xsrf_token}&do=entry_insert&code=${gameCode}`;

			const config: AxiosRequestConfig = {
				url: url,
				method: "post",
				headers: this.headers,
				data: payload,
			};

			return this.website.getPage(config).then((response: AxiosResponse) => {
				if (response.status === 200) {
					this.writeLog(`Entering giveaway: ${gameName}`);
					this.points = this.points - gameCost;

					return response;
				} else {
					throw console.error(`${response.status} - ${response.statusText}`);
				}
			});
		} catch (error) {
			throw error;
		}
	}

	writeLog(text: string): void {
		const log = `${new Date().toLocaleString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit", // All of this options to allways have same time log length
		})} - ${text}`;
		console.log(log);
	}

	async wait(time: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, 1000 * time)); // Time in seconds
	}

	checkSession() {}
}
