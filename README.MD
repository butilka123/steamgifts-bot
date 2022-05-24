# About this bot

This bot is a web scraper for https://www.steamgifts.com/. The Idea came originally from https://github.com/stilManiac/steamgifts-bot. This bot automatically enters the giveaways on the website for you.

# Running Code from Source:

Pre-requirements:

- npm (node package manager - https://docs.npmjs.com/getting-started)

### Installing Dependencies:

> npm install

### Setting the cookie

First make sure you are logged in (https://www.steamgifts.com/). Then get the `PHPSESSID` cookie from the website.
Create a cookie.txt in the `/src` folder and put your `PHPSESSID` inside it. Make sure there are no spaces at all and that it's only 1 line.

### Starting with live-server

> npm run dev
