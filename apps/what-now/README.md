# What Now

[![Website Up](https://img.shields.io/website/https/what-now.netlify.app.svg)](https://what-now.netlify.app)
[![Project license](https://img.shields.io/github/license/Shuunen/monorepo.svg?color=informational)](https://github.com/Shuunen/monorepo/blob/master/LICENSE)

![logo](docs/logo-double.svg)

> Minimalist task coach

## What is it ?

This app is a minimalist todo list based on recurring tasks.

![demo](docs/demo.gif)

For example here "Call my best friend" is a weekly task, it was displayed because the task was not done since 7 days or more. Then you marked it has done, you can see the green mark.

Tomorrow the task will be hidden for the next 7 days. This mechanism allows two things :

- see the tasks completed for the current day
- focus on the remaining tasks only

Like this you can have daily, weekly, monthly tasks or even custom recurring delays like : every X days or month, etc.

## How it differs from basic todo apps ?

This app :

- totally free, no hidden costs or "pro"/"premium" things
- open source and does not use analytics or trackers
- focus on simplicity
- works on desktop, tablets, mobile
- let you setup recurring tasks to free your head

If you find an other app like this, then it does not differs :D

Else enjoy it, you can even contribute to make it better !

## How does it work ?

The tasks are stored on [AppWrite](appwrite.io), it's a great db provider with a nice free tier.

The app is a single page app, your credentials are stored in the local storage of your browser to let you close the tab and re-open it later without the need to fill your credentials again.

The data is fetched from AppWrite, then processed to display the tasks in the right order.

When you mark a task as done, the app sends the new status to AppWrite.

Your data is stored on AppWrite, your credentials are stored in your browser, the app does not store anything else.

Your data is yours, you can delete it anytime on AppWrite, you can also delete the credentials in your browser.

You can have a look at the sources to see that this app is not sharing your data with anyone, no analytics, trackers or other annoying things.

## TODO

- [ ] try to use reefjs.com on this project

## New UX/UI & ideas

1. instead of tasks, the daily goal might be to reach levels like : chores, health, mental and each task will give points to each level
2. there could be bonus & malus tasks, for exemple walk 8000 steps will give points to health but drinking alcool will remove some
3. also these gauges might not be interesting on a daily basis, maybe a longer period of time
4. maybe alcool could be a gauge & for exemple a few shots will raise a green state alcool gauge to an orange state, and a night in a bar drinkng pints over pints will raise the gauge to red, and the next day, if no alcool taken, that gauge could repair or recover and slightly go back to orange state, and the next day to green-ish etc

in terms of ui/ux :

1. a dashboard that shows global state
2. a slider at the bottom that shows every levels/gauges and where visually we can already see a level/gauge that has not reach it's goal state/level/amount
3. ideally we could see progressions over months or years
  
## Benchmarks

### Build ts sources to js

- 5,3 seconds with poi
- 0,9 seconds with tsup :tada:
- 0,8 seconds with esbuild :tada:

### Build Tailwind styles

- 1,9 seconds with tailwindcss & jit
- instant with twind

## Thanks

- [AppWrite](https://appwrite.io) : great db provider with a nice free tier <3
- [Boxy Svg](https://boxy-svg.com) : simple & effective svg editor
- [Canvas-Confetti](https://github.com/catdad/canvas-confetti) : superb fireworks/confetti effets
- [Dependency-cruiser](https://github.com/sverweij/dependency-cruiser) : handy tool to validate and visualize dependencies
- [Esbuild](https://github.com/evanw/esbuild) : an extremely fast JavaScript bundler and minifier
- [Eslint](https://eslint.org) : super tool to find & fix problems
- [Favicon.io](https://favicon.io) : cool favicon generator
- [Florian Reichelt](https://freesound.org/people/florianreichelt/sounds/459973/) : fireworks sound effect hosted on FreeSound
- [Github](https://github.com) : for all their great work year after year, pushing OSS forward
- [Netlify](https://netlify.com) : awesome company that offers free CI & hosting for OSS projects
- [Repo-checker](https://github.com/Shuunen/repo-checker) : eslint cover /src code and this tool the rest ^^
- [Shields.io](https://shields.io) : nice looking badges to be proud of
- [Svg Omg](https://jakearchibald.github.io/svgomg/) : the great king of svg file size reduction
- [TailwindCss](https://tailwindcss.com) : awesome lib to produce maintainable style
- [V8](https://github.com/demurgos/v8-coverage) : simple & effective cli for code coverage
- [Vite](https://github.com/vitejs/vite) : super fast frontend tooling
- [Vitest](https://github.com/vitest-dev/vitest) : super fast vite-native testing framework

## Stargazers over time

[![Stargazers over time](https://starchart.cc/Shuunen/what-now.svg?variant=adaptive)](https://starchart.cc/Shuunen/what-now)

## Page views

[![Free Website Counter](https://www.websitecounterfree.com/c.php?d=9&id=64400&s=12)](https://www.websitecounterfree.com)
