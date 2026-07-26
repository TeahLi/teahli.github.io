# teahli.github.io

个人学术主页。纯静态站点，无框架、无构建步骤 —— 改完直接推送即可上线。

## 文件

| 文件 | 作用 | 你会不会改 |
|---|---|---|
| `content.js` | **全站文字内容**（姓名、简介、论文、讲座、随笔、链接） | 经常改 |
| `index.html` | 标签页标题、搜索摘要、分享卡片 | 偶尔改 |
| `style.css` | 配色、字号、间距 | 想调外观时 |
| `site.js` | 渲染逻辑 + 背景水墨/星空画布 | 基本不用改 |
| `assets/` | 三张背景素材（水墨峡谷、星系、小舟） | 换背景时 |
| `favicon.svg` | 浏览器标签页小图标 | 基本不用改 |
| `.nojekyll` | 告诉 GitHub 不要跑 Jekyll，直接发原始文件 | 别删 |
| `robots.txt` / `sitemap.xml` | 给搜索引擎看的 | 换域名时改一次 |

## 日常更新流程

```bash
# 1. 改 content.js
# 2. 本地预览（必须用服务器，不能双击 index.html，见下）
python3 -m http.server 8000
#    浏览器打开 http://localhost:8000

# 3. 满意后推送
git add -A
git commit -m "update publications"
git push
```

推送后 1–10 分钟内 <https://teahli.github.io> 自动更新。

## 为什么本地预览要起服务器

背景动画需要从水墨图里读像素，来决定星点回落时聚成什么形状。
用 `file://` 直接打开时浏览器的同源策略会禁止读取像素（canvas 会被"污染"），
结果是星点散开、小舟不显示 —— 但站点其他部分正常。
上线到 GitHub Pages 后同源，一切正常。

## 站内三个开关

- **STYLE / 风格** —— 在「单页长卷」和「册页分页」两种布局间切换
- **EN / 中** —— 中英文切换（两套文字都在 `content.js` 里）
- **☀ / ☾** —— 宣纸白天 / 星空夜晚

只想保留一种布局：在 `site.js` 顶部把 `sty: 'a'` 改成 `'b'`，
再在 `content.js` 之外把 `CTL` 里那一行 `data-act="sty"` 的按钮删掉即可。

## 几个常见需求

**换头像**：把图片放进 `assets/`，然后在 `content.js` 里写
`portrait: 'assets/portrait.jpg'`。

**挂 CV**：把 `cv.pdf` 放到仓库根目录，`content.js` 的 links 里写
`{ label: 'CV ↓', href: 'cv.pdf' }`。

**加一篇论文**：复制 `content.js` 里 `papers` 数组的任意一项，改字。
`href` 暂时留空 `''` 的链接会渲染成带虚线的灰字（位置留着但点不动），
把网址填进去就自动变成正常链接。`links`（EMAIL / GOOGLE SCHOLAR / ORCID / ARXIV / CV）同理，
一律显示，不会因为没填网址就消失。

**栏目结构**：两种布局共用同一套四个栏目 —— Research / Papers / Talks & notes / Contact & CV。
要增删栏目改 `site.js` 顶部的 `NAV` 数组，布局 A 的锚点和布局 B 的页码会一起跟着变。

**字体在国内加载慢**：本站用 Google Fonts 提供 EB Garamond 与思源宋体，
国内访问可能取不到，此时会自动回退到系统的 Georgia / 宋体，版式不会塌。
想彻底解决就把字体文件下载到 `assets/fonts/` 自托管，再改 `index.html` 里那行 `<link>`。
