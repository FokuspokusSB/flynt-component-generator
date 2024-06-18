import { readdirSync, mkdirSync, statSync, copyFileSync, existsSync } from "fs";
import { join } from "path";

export function collectScreenshots(componentsDir: string) {
  const screenshotDir = join(componentsDir, "screenshots");
  mkdirSync(screenshotDir);
  const dir = readdirSync(componentsDir);

  dir.forEach((el: any) => {
    const comDir = join(componentsDir, el);
    if (statSync(comDir).isDirectory()) {
      if (existsSync(join(comDir, "screenshot.png"))) {
        copyFileSync(
          join(comDir, "screenshot.png"),
          join(screenshotDir, `${el}.png`)
        );
      }
    }
  });
}

export function deployScreenshots(componentsDir: string) {
  const screenshotDir = join(componentsDir, "screenshots");
  readdirSync(screenshotDir).forEach((el: string) => {
    const dirName = el.split(".")[0];
    const comDir = join(componentsDir, dirName);
    if (statSync(comDir).isDirectory()) {
      copyFileSync(join(screenshotDir, el), join(comDir, "screenshot.png"));
    }
  });
}
