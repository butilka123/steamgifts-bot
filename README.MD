# About this bot

This bot is a web scraper for https://www.steamgifts.com/. The Idea came originally from https://github.com/stilManiac/steamgifts-bot. This bot automatically enters the giveaways on the website for you.

# How to use this bot

### Configuring giveaways

First make sure you are logged in (https://www.steamgifts.com/). Then disable all giveaways you can't enter, in the settings page: https://www.steamgifts.com/account/settings/giveaways. This step is important because the bot will try to enter each single visible giveaway. This way the bot doesn't spam the website with unnecessary requests.

### Setting the cookie

Get the `PHPSESSID` cookie from the website.
Create a cookie.txt in the `/src` folder and put your `PHPSESSID` inside it. Make sure there are no spaces at all and that it's only 1 line.

If you followed both steps you are ready to go.

# Running Code from Source:

Pre-requirements:

- npm (node package manager - https://docs.npmjs.com/getting-started)

### Installing Dependencies:

> npm install

### Starting with live-server

> npm run dev
