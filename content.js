/* ============================================================================
   content.js —— 全站文字内容，只改这一个文件就够了
   ----------------------------------------------------------------------------
   规则：
   1. 每个双语字段都写成 { en: '英文', zh: '中文' }。
   2. 想删掉某一条，把整个 { ... } 连同后面的逗号删掉即可。
   3. 想加一条，复制上一条，改里面的字。
   4. 引号里如果要用引号，用中文引号「」或英文单引号 '，别用 " 。
   5. 改完保存 → git push，网站两分钟内自动更新。
   ========================================================================== */

window.SITE = {

  /* ── 基本身份 ────────────────────────────────────────────────── */
  name:      { en: 'Li Linhong',  zh: '李林鸿' },   // ← 改成你的真名
  nameCaps:  { en: 'LI LINHONG',  zh: '李林鸿' },   // 页眉用的大写形式

  affiliation: {
    en: 'PhD student, School of Philosophy<br>Shanxi University, Taiyuan',
    zh: '山西大学哲学学院 博士研究生<br>太原'
  },

  /* 注：浏览器标签页标题、搜索引擎摘要、社交分享卡片
     统一在 index.html 的 <head> 里改，不在这里。 */

  /* ── 首页题词 ────────────────────────────────────────────────── */
  epigraph: {
    text:   { en: 'Reason is, and ought only to be the slave of the passions.',
              zh: '理性是、而且应当只是激情的奴隶。' },
    source: { en: 'DAVID HUME', zh: '休谟' }
  },

  /* ── 自我介绍（可写多段，每段一个字符串） ──────────────────── */
  about: {
    en: [
      'I work on two questions that turn out to be the same question. Do the unobservable things our best theories talk about — electrons, fields, curved spacetime — actually exist, or are they just very good ways of talking? And when a neural network is said to <em>represent</em> something, is there anything there doing the representing?',
      'Both are questions about credit: how much of the world are we allowed to read off a working instrument. I spend most days reading, arguing with people who disagree with me, and rewriting the same paragraph.'
    ],
    zh: [
      '我做的两个问题，说到底是同一个问题。我们最好的理论谈到的那些看不见的东西——电子、场、弯曲的时空——是真的存在，还是只是一种特别好用的说法？而当人们说一个神经网络「表征」了什么，那个在做表征的东西又在哪里？',
      '两边问的其实都是同一件事：一台好用的仪器，能让我们读出多少关于世界的东西。剩下的时间我在读书、跟不同意我的人争论、以及反复重写同一段话。'
    ]
  },

  /* 头像：放一张图到 assets/ 里，然后写 'assets/portrait.jpg'；
     留空字符串则显示占位斜纹格 */
  portrait: '',

  /* ── 研究方向 ────────────────────────────────────────────────── */
  research: [
    {
      title: { en: 'Representation without a representer', zh: '没有表征者的表征' },
      body:  { en: 'Whether the internal states of deep networks are representations in any sense a philosopher should care about — and what interpretability results are actually evidence for.',
               zh: '深度网络的内部状态，在哲学上够得上「表征」吗？可解释性研究给出的，究竟是关于什么的证据？' }
    },
    {
      title: { en: 'What survives theory change', zh: '理论更替中留下的东西' },
      body:  { en: 'Selective and structural realism against the pessimistic induction: which posits earn their keep, and whether approximate truth does any work at all.',
               zh: '选择性实在论、结构实在论与悲观归纳：哪些理论设定真正立得住，「近似真」这个说法到底做了多少工作。' }
    },
    {
      title: { en: 'Instruments that think', zh: '会思考的仪器' },
      body:  { en: 'Machine learning as a new kind of scientific instrument: model-based understanding, opacity, and the epistemology of predictions nobody can follow.',
               zh: '把机器学习当作一种新的科学仪器：基于模型的理解、不透明性，以及无人能跟上的预测背后的认识论。' }
    }
  ],

  /* ── 论文 ────────────────────────────────────────────────────
     year   : 左栏显示的年份，也可以写 'draft'
     status : 右栏没有链接时显示的文字（如 'IN PROGRESS'），留空则不显示
     links  : [{ label: '显示文字', href: '网址' }]，可以有 0~3 个
     href 暂时没有就写 ''，会自动渲染成不可点的灰字            */
  papers: [
    {
      year:  '2026',
      title: { en: 'Do Deep Networks Have Representations? Interpretability and the Reference Problem', zh: '' },
      venue: { en: 'Under review', zh: '审稿中' },
      links: [ { label: 'PDF', href: '' }, { label: 'ABSTRACT', href: '' } ]
    },
    {
      year:  '2025',
      title: { en: 'Structural Realism and the Unobservables of Machine Learning', zh: '' },
      venue: { en: 'Journal placeholder · vol. 00, 1–24', zh: '期刊占位 · 第 00 卷, 1–24' },
      links: [ { label: 'PDF', href: '' }, { label: 'DOI', href: '' } ]
    },
    {
      year:  '2025',
      title: { en: '从选择性实在论看机器学习中的不可观察者', zh: '从选择性实在论看机器学习中的不可观察者' },
      venue: { en: '中文期刊占位 · 第 00 期', zh: '中文期刊占位 · 第 00 期' },
      links: [ { label: 'PDF', href: '' } ]
    }
  ],

  /* ── 在写但还没投的 ──────────────────────────────────────────
     显示在 Papers 版块下半部分，不要和上面的 papers 重复列同一篇。 */
  workingPapers: [
    {
      title: { en: 'Selective Realism after Deep Learning', zh: 'Selective Realism after Deep Learning' },
      body:  { en: 'If the parts of a theory we should believe are the parts doing the predictive work, what happens when the predictive work is done by something we cannot read?',
               zh: '如果理论中值得相信的部分，正是承担预测工作的部分，那么当预测工作由我们读不懂的东西完成时，会发生什么？' },
      tag:   { en: 'DRAFT · AVAILABLE ON REQUEST', zh: '草稿 · 可来信索取' }
    },
    {
      title: { en: 'The Instrument Argument', zh: 'The Instrument Argument' },
      body:  { en: 'A reconstruction of the no-miracles argument for the case where the miracle is performed by a trained model rather than a theory.',
               zh: '重构「无奇迹论证」：当奇迹由一个训练好的模型而非一套理论完成时。' },
      tag:   { en: 'EARLY NOTES', zh: '初步笔记' }
    }
  ],

  /* ── 讲座 / 报告 ─────────────────────────────────────────────── */
  talks: [
    { year: '2026', title: { en: 'Representation Without a Representer', zh: '没有表征者的表征' },
      venue: { en: 'Workshop on Philosophy of AI, Beijing', zh: 'AI 哲学工作坊 · 北京' } },
    { year: '2025', title: { en: 'What Survives Theory Change in ML', zh: '机器学习中的理论更替' },
      venue: { en: 'Graduate seminar, Shanxi University', zh: '研究生讨论班 · 山西大学' } },
    { year: '2025', title: { en: 'Are Particles Real? A Reading Group', zh: '粒子是真的吗？读书会' },
      venue: { en: 'Invited comment, Taiyuan', zh: '特邀评论 · 太原' } }
  ],

  /* ── 随笔 ────────────────────────────────────────────────────── */
  notes: [
    { date: '06 · 2026', href: '',
      title: { en: 'Reading Hume on the inference we cannot justify', zh: '读休谟：那个我们无法证成的推论' } },
    { date: '04 · 2026', href: '',
      title: { en: 'Three ways a saliency map can lie to you', zh: '显著性图骗人的三种方式' } },
    { date: '01 · 2026', href: '',
      title: { en: 'Notes toward a realism without pictures', zh: '一种不靠图像的实在论' } }
  ],

  /* ── 联系方式 ────────────────────────────────────────────────
     全部都会显示；href 留空 '' 的暂时渲染成不可点的灰字，
     等你拿到网址再填进去。                                     */
  links: [
    { label: 'EMAIL',          href: 'mailto:you@example.com' },
    { label: 'GOOGLE SCHOLAR', href: '' },
    { label: 'ORCID',          href: '' },
    { label: 'ARXIV',          href: '' },
    { label: 'CV ↓',           href: '' }   // 例：'cv.pdf'（把 cv.pdf 放到仓库根目录）
  ],

  /* 页脚年份 */
  year: { en: '2026', zh: '二〇二六' }
};
