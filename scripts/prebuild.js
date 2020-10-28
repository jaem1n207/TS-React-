import { resolve } from 'path';
import { existsSync, readdir, unlinkSync, rmdirSync, mkdirSync, copyFileSync } from 'fs';

const APP_DIR = process.cwd();
const BUILD_DIR = resolve(APP_DIR, 'build');
const PUBLIC_DIR = resolve(APP_DIR, 'public');

function getBuildPath(name) {
  return resolve(BUILD_DIR, name);
}
function getPublicPath(name) {
  return resolve(PUBLIC_DIR, name);
}

// build 내 파일이 존재하면 비우고 build directory가 없으면 만듬
function emptyDir(dir) {
  if (existsSync(dir)) {
    readdir(dir, (_, files) => {
      files.forEach((item) => {
        if (/_|\.[\w]{1,}/.test(item)) {
          unlinkSync(getBuildPath(item));
        } else {
          rmdirSync(getBuildPath(item), { recursive: true });
        }
      });
    });
  } else {
    mkdirSync(dir);
  }
}
// `passList: Array<string>`를 제외한 모든 public 파일을 build/로 복사
function copyPublic(passList) {
  readdir(PUBLIC_DIR, (_, files) => {
    files.forEach((item) => {
      if (!passList.includes(item)) {
        copyFileSync(getPublicPath(item), getBuildPath(item));
      }
    });
  });
}

emptyDir(BUILD_DIR);
copyPublic(['index.html']);
