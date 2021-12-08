## lan-cam

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)

See your phone camera on your computer. You can use that in obs and even use it as a webcam :)

## How to use:

Download executable/installable files from project's github release page

## How to build

1- You should install npm or yarn

2- Clone or download source code and go to project folder on your computer

3- install dependencies with this command in terminal:

```bash
npm install
```

4- make electron app:

```bash
npm run make
```

5- this will create a directory named `out` in the project folder which contains the executable/installable files. Install or execute app from there.

6- enjoy!! :)

## Scripts

- `start` runs your app for development, reloading on file changes
- `start:build` runs your app after it has been built using the build command
- `build` builds your app and outputs it in your `dist` directory
- `test` runs your test suite with Web Test Runner
- `lint` runs the linter for your project
- `format` fixes linting and formatting errors
- more commands in `package.json` file

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
