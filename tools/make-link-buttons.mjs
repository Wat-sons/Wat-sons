/* 生成顶部链接按钮：图标 + 文字，整块可点。
 *
 * 为什么不直接用 shields.io / simple-icons：
 *   simple-icons 上有 codeforces，但 **没有 nowcoder 和 cnblogs**（实测 404）。
 *   混着用会出现「两个真 logo + 两个通用图标」的割裂感。
 *   所以自绘一整套，风格统一、不新增外部依赖、服务挂了也不影响。
 *
 * 每个链接出两张：深色版 / 浅色版，README 里用 <picture> 按 GitHub 主题切。
 * 配色直接用 GitHub 自己的中性色，放在页面里不违和。
 *
 * 图标几何：
 *   网站    —— 地球（圆 + 经线椭圆 + 赤道）
 *   Codeforces —— 官方图标路径（simple-icons 取的，不是我画的）
 *   牛客    —— 几何化 N（无官方矢量，用字形标记 + alt 文字说明）
 *   博客    —— 文稿（带折角 + 三行文字）
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";

const OUT = "assets/links";
mkdirSync(OUT, { recursive: true });
// Codeforces 官方图标路径，取自 cdn.simpleicons.org/codeforces（2026-10 抓取后内联）。
// 内联是为了让这个脚本不依赖网络 —— 换个环境跑仍然得到同样的结果。
const CF_PATH = 'M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.673 21 0 20.328 0 19.5V9c0-.828.673-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.827 0-1.5-.672-1.5-1.5v-15c0-.828.673-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z';

const THEMES = {
  dark:  { bg: "#1C2128", bd: "#30363D", fg: "#C9D1D9", dim: "#8B949E" },
  light: { bg: "#F6F8FA", bd: "#D0D7DE", fg: "#1F2328", dim: "#59636E" },
};

/** 24×24 图标笔画，都画在 (0,0)-(24,24) 里 */
const ICONS = {
  // 地球
  site: `<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.7"/>
         <ellipse cx="12" cy="12" rx="3.6" ry="8.2" fill="none" stroke="currentColor" stroke-width="1.7"/>
         <path d="M3.8 12h16.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
  // Codeforces 官方
  codeforces: `<path d="${CF_PATH}" fill="currentColor" transform="translate(0.6 1.2) scale(0.95)"/>`,
  // 牛客：几何化 N（无官方矢量，见文件头说明）
  nowcoder: `<path d="M5.4 18.6V5.4h2.9l7.3 8.1V5.4h2.9v13.2h-2.9L8.3 10.5v8.1z" fill="currentColor"/>`,
  // 文稿
  blog: `<path d="M6.2 3.4h7.4l4.2 4.2v13H6.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
         <path d="M13.6 3.4v4.2h4.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
         <path d="M9.2 12h5.6M9.2 15h5.6M9.2 18h3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
};

const LINKS = [
  { id: "site",       label: "个人网站",   icon: "site" },
  { id: "codeforces", label: "Codeforces", icon: "codeforces" },
  { id: "nowcoder",   label: "牛客",       icon: "nowcoder" },
  { id: "blog",       label: "技术博客",   icon: "blog" },
];

/* 中文按整字宽度估算，英文按 0.62em —— 只是为了给按钮定宽，不求精确 */
const textWidth = (s, fs) =>
  [...s].reduce((a, ch) => a + (/[\u4e00-\u9fff]/.test(ch) ? fs : fs * 0.62), 0);

const PAD_X = 14, GAP = 9, ICON = 19, H = 40, FS = 14;

for (const [theme, c] of Object.entries(THEMES)) {
  for (const l of LINKS) {
    const tw = textWidth(l.label, FS);
    const W = Math.round(PAD_X * 2 + ICON + GAP + tw);
    const ty = H / 2 + FS * 0.35;          // 视觉居中
    const ix = PAD_X, iy = (H - ICON) / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${l.label}">
  <title>${l.label}</title>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="9" fill="${c.bg}" stroke="${c.bd}"/>
  <g transform="translate(${ix} ${iy}) scale(${(ICON / 24).toFixed(4)})" color="${c.fg}">${ICONS[l.icon]}</g>
  <text x="${ix + ICON + GAP}" y="${ty.toFixed(1)}" font-family="-apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
        font-size="${FS}" font-weight="600" fill="${c.fg}">${l.label}</text>
</svg>
`;
    writeFileSync(`${OUT}/${l.id}-${theme}.svg`, svg, "utf8");
  }
}
console.log("  已生成 " + readdirSync(OUT).length + " 个按钮 SVG：");
for (const f of readdirSync(OUT).sort()) {
  console.log(`    ${f.padEnd(24)} ${String(statSync(`${OUT}/${f}`).size).padStart(5)} B`);
}
