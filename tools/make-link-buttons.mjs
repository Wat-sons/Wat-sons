/* 生成顶部链接按钮：图标 + 文字，整块可点。
 *
 * 图标来源（都不是我瞎画的）：
 *   个人网站   —— 自绘地球，用站点强调色
 *   Codeforces —— 官方图标路径，取自 cdn.simpleicons.org，用 CF 品牌蓝
 *   牛客       —— **官方彩色 logo**，从 static.nowcoder.com/acm/images-acm/logo.png
 *                左侧方形部分切出（98×98）后 base64 内嵌
 *   技术博客   —— **官方 favicon**（cnblogs.com/favicon.ico）base64 内嵌
 *
 * 为什么内嵌 base64 而不是外链图片：SVG 经 GitHub 的 camo 代理时，
 * 里面的相对 URL 会相对 camo 域名解析，必然 404。只能用 data URI。
 *
 * 每个链接出两张：深色版 / 浅色版，README 里用 <picture> 按 GitHub 主题切。
 *
 * 重新生成：node tools/make-link-buttons.mjs
 * 图标原图在 assets/links/src/ 下，换图标只要替换那两个 PNG。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";

const OUT = "assets/links";
const SRC = "assets/links/src";
mkdirSync(OUT, { recursive: true });

// Codeforces 官方图标路径，取自 cdn.simpleicons.org/codeforces（2026-10 抓取后内联）。
// 内联是为了让这个脚本不依赖网络 —— 换个环境跑仍然得到同样的结果。
const CF_PATH = "M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.673 21 0 20.328 0 19.5V9c0-.828.673-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.827 0-1.5-.672-1.5-1.5v-15c0-.828.673-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z";

const b64 = (f) => {
  const p = `${SRC}/${f}`;
  if (!existsSync(p)) throw new Error(`缺图标原图 ${p}`);
  return `data:image/png;base64,${readFileSync(p).toString("base64")}`;
};

const THEMES = {
  dark:  { bg: "#1C2128", bd: "#30363D", fg: "#C9D1D9", site: "#D8FF4A", cf: "#4FA8DC" },
  // CF 品牌蓝 #1F8ACB 在浅底上只有约 3.1:1，压暗一档
  light: { bg: "#F6F8FA", bd: "#D0D7DE", fg: "#1F2328", site: "#5C7500", cf: "#1273A8" },
};

const ICONS = {
  site: `<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.7"/>
         <ellipse cx="12" cy="12" rx="3.6" ry="8.2" fill="none" stroke="currentColor" stroke-width="1.7"/>
         <path d="M3.8 12h16.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
  codeforces: `<path d="${CF_PATH}" fill="currentColor" transform="translate(0.6 1.2) scale(0.95)"/>`,
};

const LINKS = [
  { id: "site",       label: "个人网站",   kind: "glyph", icon: "site",       color: (c) => c.site },
  { id: "codeforces", label: "Codeforces", kind: "glyph", icon: "codeforces", color: (c) => c.cf },
  { id: "nowcoder",   label: "牛客",       kind: "image", src: "nowcoder-64.png" },
  { id: "blog",       label: "技术博客",   kind: "image", src: "cnblogs.png" },
];

const textWidth = (s, fs) =>
  [...s].reduce((a, ch) => a + (/[\u4e00-\u9fff]/.test(ch) ? fs : fs * 0.62), 0);

const PAD_X = 14, GAP = 9, ICON = 19, H = 40, FS = 14;

for (const [theme, c] of Object.entries(THEMES)) {
  for (const l of LINKS) {
    const W = Math.round(PAD_X * 2 + ICON + GAP + textWidth(l.label, FS));
    const ix = PAD_X, iy = (H - ICON) / 2;
    const body = l.kind === "image"
      // 彩色图标：铺满 19px 方格（圆角已经在图片里）
      ? `<image href="${b64(l.src)}" x="${ix}" y="${iy}" width="${ICON}" height="${ICON}"/>`
      : `<g transform="translate(${ix} ${iy}) scale(${(ICON / 24).toFixed(4)})" color="${l.color(c)}">${ICONS[l.icon]}</g>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${l.label}">
  <title>${l.label}</title>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="9" fill="${c.bg}" stroke="${c.bd}"/>
  ${body}
  <text x="${ix + ICON + GAP}" y="${(H / 2 + FS * 0.35).toFixed(1)}" font-family="-apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
        font-size="${FS}" font-weight="600" fill="${c.fg}">${l.label}</text>
</svg>
`;
    writeFileSync(`${OUT}/${l.id}-${theme}.svg`, svg, "utf8");
  }
}
const out = readdirSync(OUT).filter((f) => f.endsWith(".svg")).sort();
console.log(`  已生成 ${out.length} 个按钮 SVG：`);
for (const f of out) console.log(`    ${f.padEnd(24)} ${String(statSync(`${OUT}/${f}`).size).padStart(6)} B`);
