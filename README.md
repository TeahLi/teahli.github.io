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
| `assets/music/` | 背景音乐 mp3 | 换曲子时 |
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

## 背景音乐

播放器在调节按钮旁边：上一曲 / 播放暂停（同一个键）/ 下一曲。
放完一首自动接下一首，最后一首之后回到第一首，循环不停。

- **不会自动播放**。浏览器一律拦截带声音的自动播放，何况访客一进站就出声也不礼貌，
  所以要点了才响。默认音量 0.5。
- **点之前不下载**（`preload="none"`）。不听音乐的访客不会白白吃掉几 MB 流量。
- 切换长卷 / 册页布局不会打断播放 —— 两套按钮控制的是同一个音频实例。

**换曲子**：把 mp3 放进 `assets/music/`，改 `content.js` 的 `music` 数组。
把数组清空或整段删掉，播放器按钮就不出现，其余功能不受影响。

**文件别太大**。发行级 320 kbps 的 mp3 一首就十几 MB，做背景乐是浪费。
转成 ~130 kbps 体积能降六成，背景音量下听不出差别：

```bash
ffmpeg -i 原曲.mp3 -map_metadata -1 -vn -c:a libmp3lame -q:a 5 assets/music/新曲.mp3
```
（`-map_metadata -1 -vn` 会顺手剥掉内嵌的专辑封面，那玩意常常占几百 KB。）

**版权**：公开网站上放完整的商业录音，理论上可能收到 DMCA 下架通知。
自己掂量；换成无版权 / CC 授权的曲子最省心。

## 站内三个开关

- **STYLE / 风格** —— 在「单页长卷」和「册页分页」两种布局间切换
- **EN / 中** —— 中英文切换（两套文字都在 `content.js` 里）
- **☀ / ☾** —— 宣纸白天 / 星空夜晚

（加上音乐播放器一共四组控件。）

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
