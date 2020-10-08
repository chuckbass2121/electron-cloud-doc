**Note**

there are 2 ways to show settings

1. using setting folder, and you need to add `"settings/**/*"` to "files"

`"files": [ "build/**/*", "node_modules/**/*", "settings/**/*", "package.json" ],`

and don't forget to uncomment below in main.js
`` // const settingsFileLocation = isDev // ? `file://${path.join(__dirname, './settings/settings.html')}` // : `file://${path.join(__dirname, '../settings/settings.html')}`; ``

2. using hash router. currently it's using hash router
