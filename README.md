# LutPreviewer

## LUT Formats

### HaldCLUT

```bash
# 12-level sRGB HaldCLUT
magick convert hald:12 -depth 16 -colorspace sRGB "Hald Identity 12 level 16 bit.png"
# 12-level RGB HaldCLUT
magick convert hald:12 -depth 8 -colorspace RGB "Hald Identity 12 level 8 bit.png"

# 8-level sRGB HaldCLUT
magick convert hald:8 -depth 16 -colorspace sRGB "Hald Identity 8 level 16 bit.png"
# 8-level RGB HaldCLUT
magick convert hald:8 -depth 8 -colorspace RGB "Hald Identity 8 level 8 bit.png"
```

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
