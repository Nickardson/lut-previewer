import { Observable } from "rxjs";

/**
 * Applies a LUT
 * @param out Image which will have the result written to
 * @param image Image source
 * @param clut LUT image
 * @param clutMix Amount of LUT applied from 0 to 1, with 1 being full LUT.
 */
export function mapColorsFast(out: ImageData, image: ImageData, clut: ImageData, clutMix: number) {
  console.time('mapColorsFast');
  let outputData = out.data,
    inputData = image.data,
    w = out.width,
    h = out.height,
    clutData = clut.data;

  let blockWidth: number, blockHeight: number;
  let rm: number, gm: number, bm: number;
  let columns: number, rows: number;
  if (clut.width === clut.height) {
    // Handle Hald CLUT
    blockHeight = Math.floor(Math.pow(clut.width, 1 / 3) + 0.001); // ie 8 for a 512x512
    blockWidth = blockHeight * blockHeight; // ie 64 for a 512x512

    columns = clut.width / blockWidth;
    rows = clut.height / blockHeight;

    rm = 1, gm = blockWidth, bm = blockWidth * columns * blockHeight;
  } else {
    // Assume a flat list?
    blockHeight = clut.height; // ie 32 for a 1024x32
    blockWidth = clut.width / blockHeight; // ie 32 for a 1024x32
    columns = blockHeight;
    rows = 1;

    rm = 1, gm = clut.width, bm = blockWidth;
  }

  // Calculate volume based on block size
  let blockPixelsCount = blockWidth * columns,
    // TODO: is this generic for non-hald?
    cs1 = blockWidth - 1;

  // Is there a deterministic way of seeing what size the LUT is?
  // cube root of (width * height) tells the dimension size of the lut
  //   1024x32 luts are 32 size
  //       This may be an 'unwrapped cube image 3d lut'?
  //       image width / height = block width
  //       height = block height
  //   512x512 luts are 64 size
  //       Hald CLUT
  //       8 blocks per row, 64x8 blocks.
  //       cuberoot(512) = 8 = block height
  //       cuberoot(512)^2 = 64 = block width

  var x0 = 1 - clutMix, x1 = clutMix;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      let i = (y * w + x) * 4,
        r = inputData[i] / 255 * cs1,
        g = inputData[i + 1] / 255 * cs1,
        b = inputData[i + 2] / 255 * cs1,
        a = inputData[i + 3] / 255,
        // r is on the x axis because moving right within a block makes it more red.   Advance by 1 per r
        // g is on the y axis because moving down  within a block makes it more green. Advance by blockWidth per g
        // b is on the block-axis because moving to the next block makes it more blue. Advance by blockWidth * columns * blockHeight per b
        clutIndex = (dither(b) * bm + dither(g) * gm + dither(r) * rm) * 4;

      outputData[i] = inputData[i] * x0 + x1 * clutData[clutIndex];
      outputData[i + 1] = inputData[i + 1] * x0 + x1 * clutData[clutIndex + 1];
      outputData[i + 2] = inputData[i + 2] * x0 + x1 * clutData[clutIndex + 2];
      outputData[i + 3] = a * 255;
    }
  }
  console.timeEnd('mapColorsFast');
}

export function dither(value: number): number {
  var floorValue = Math.floor(value),
    remainder = value - floorValue;
  return (Math.random() > remainder) ? floorValue : Math.ceil(value);
}

export function mapColors(out: ImageData, image: ImageData, clut: ImageData, clutMix: number) {
  console.time('mapColors');
  let od = out.data,
    id = image.data,
    w = out.width,
    h = out.height,
    cd = clut.data,
    cl = Math.floor(Math.pow(clut.width, 1 / 3) + 0.001),
    cs = cl * cl,
    cs2 = cs - 1;

  let r_min_g_min_b_min = [0, 0, 0],
    r_min_g_min_b_max = [0, 0, 0],
    r_min_g_max_b_min = [0, 0, 0],
    r_min_g_max_b_max = [0, 0, 0],
    r_max_g_min_b_min = [0, 0, 0],
    r_max_g_min_b_max = [0, 0, 0],
    r_max_g_max_b_min = [0, 0, 0],
    r_max_g_max_b_max = [0, 0, 0];

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      let i = (y * w + x) * 4,
        // randomize these to avoid banding
        r = id[i] / 256 * cs2,
        g = id[i + 1] / 256 * cs2,
        b = id[i + 2] / 256 * cs2,
        a = id[i + 3] / 256,
        r0 = Math.floor(r),
        r1 = Math.ceil(r),
        g0 = Math.floor(g),
        g1 = Math.ceil(g),
        b0 = Math.floor(b),
        b1 = Math.ceil(b);

      sample(r_min_g_min_b_min, cd, cs, r0, g0, b0);
      sample(r_min_g_min_b_max, cd, cs, r0, g0, b1);
      sample(r_min_g_max_b_min, cd, cs, r0, g1, b0);
      sample(r_min_g_max_b_max, cd, cs, r0, g1, b1);
      sample(r_max_g_min_b_min, cd, cs, r1, g0, b0);
      sample(r_max_g_min_b_max, cd, cs, r1, g0, b1);
      sample(r_max_g_max_b_min, cd, cs, r1, g1, b0);
      sample(r_max_g_max_b_max, cd, cs, r1, g1, b1);

      let t = b - b0;
      rgbLerp(r_min_g_min_b_min, r_min_g_min_b_min, r_min_g_min_b_max, t);
      rgbLerp(r_min_g_max_b_min, r_min_g_max_b_min, r_min_g_max_b_max, t);
      rgbLerp(r_max_g_min_b_min, r_max_g_min_b_min, r_max_g_min_b_max, t);
      rgbLerp(r_max_g_max_b_min, r_max_g_max_b_min, r_max_g_max_b_max, t);

      t = g - g0;
      rgbLerp(r_min_g_min_b_min, r_min_g_min_b_min, r_min_g_max_b_min, t);
      rgbLerp(r_max_g_min_b_min, r_max_g_min_b_min, r_max_g_max_b_min, t);

      t = r - r0;
      rgbLerp(r_min_g_min_b_min, r_min_g_min_b_min, r_max_g_min_b_min, t);

      let x0 = 1 - clutMix, x1 = clutMix;

      od[i] = id[i] * x0 + (r_min_g_min_b_min[0]) * x1;
      od[i + 1] = od[i + 1] * x0 + (r_min_g_min_b_min[1]) * x1;
      od[i + 2] = od[i + 2] * x0 + (r_min_g_min_b_min[2]) * x1;
      od[i + 3] = a * 256;
    }
  }
  console.timeEnd('mapColors');
}

export function rgbLerp(out: number[], x: number[], y: number[], t: number): void {
  out[0] = x[0] + (y[0] - x[0]) * t;
  out[1] = x[1] + (y[1] - x[1]) * t;
  out[2] = x[2] + (y[2] - x[2]) * t;
}

export function sample(out: number[], cd: Uint8ClampedArray, cs: number, r: number, g: number, b: number): void {
  let ci = (b * cs * cs + g * cs + r) * 4;
  out[0] = cd[ci];
  out[1] = cd[ci + 1];
  out[2] = cd[ci + 2];
}

export function loadImage(url: string): Observable<HTMLImageElement> {
  let img: HTMLImageElement;

  return new Observable(s => {
    img = new Image();
    img.src = url;
    img.onload = () => { s.next(img); s.complete(); };
    img.onerror = (e) => s.error(e);
  });
}

export function getImageData(img: HTMLImageElement): ImageData {
  let c = document.createElement('canvas'),
    ctx = c.getContext('2d'),
    w = ~~img.naturalWidth,
    h = ~~img.naturalHeight;
  c.width = w;
  c.height = h;

  if (!ctx) {
    throw new Error('Could not load image data because canvas could not be created');
  }

  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export function scaleImage(img: CanvasImageSource, w: number, h: number) {
  let c = document.createElement('canvas'),
    ctx = c.getContext('2d');

  if (!ctx) {
    throw new Error('Could not load image data because canvas could not be created');
  }

  c.width = w;
  c.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}

// results in a much smoother image
export function scaleImageHQ(image: HTMLImageElement, w: number, h: number) {
  let iw = ((image as HTMLImageElement).naturalWidth || image.width),
    ih = ((image as HTMLImageElement).naturalHeight || image.height);
  let finalImage: CanvasImageSource = image;
  if (iw > w * 2 && ih > h * 2) {
    finalImage = scaleImage(image, w * 2, h * 2);
  }
  return scaleImage(finalImage, w, h);
}
