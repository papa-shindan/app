// ============================================
//  パパ力診断 — script.js
//  構成：
//  1. データ定義（質問・ランク・コメント）
//  2. 状態管理変数
//  3. 画面切り替え関数
//  4. クイズ進行関数
//  5. 結果集計・表示関数
// ============================================


// ============================================
// 1. データ定義
// ============================================

/**
 * ステータス6項目の定義
 * color   : バーの色
 * icon    : 絵文字アイコン
 */
const STATUS_CONFIG = {
  childcare: { label: "育児力", line1: "育児力", line2: "",   icon: "👶", color: "#3D7EAA" },
  housework: { label: "家事力", line1: "家事力", line2: "",   icon: "🍳", color: "#27AE60" },
  planning:  { label: "段取力", line1: "段取力", line2: "",   icon: "📋", color: "#7B5EA7" },
  empathy:   { label: "共感力", line1: "共感力", line2: "",   icon: "💬", color: "#E91E8C" },
  stamina:   { label: "体力",   line1: "体力",   line2: "",   icon: "💪", color: "#FF6B35" },
};

/**
 * 質問リスト（15問）
 * 選択肢は問によって4択・5択混在
 */
const QUESTIONS_A = [
  // 問1
  {
    icon: "🌙",
    text: "子どもが夜中に泣いちゃった…どうする？",
    choices: [
      { text: "すぐ起きて抱っこしてあやす",              scores: { childcare:4, stamina:3 } },
      { text: "泣き止むかも…と思いながらも起きる",        scores: { childcare:2, empathy:2 } },
      { text: "「ん…？」って半分寝ながら反応",            scores: { childcare:1, stamina:1 } },
      { text: "気づかず爆睡",                             scores: { stamina:1 } },
    ],
  },
  // 問2（5択）
  {
    icon: "🍽️",
    text: "週末、妻ちょっと疲れてそう…どうする？",
    choices: [
      { text: "「俺やるよ！」ってご飯作る",               scores: { housework:4, empathy:4 } },
      { text: "テイクアウト提案する",                      scores: { empathy:3, planning:2 } },
      { text: "買い物だけ行ってくる、と動く",              scores: { empathy:2, housework:2 } },
      { text: "「何食べたい？」って聞くだけで終わる",      scores: { empathy:1 } },
      { text: "とりあえずゴロゴロ",                        scores: { stamina:1 } },
    ],
  },
  // 問3（5択）
  {
    icon: "📅",
    text: "子どもの通院とか予防接種の日、把握してる？",
    choices: [
      { text: "ちゃんと管理してリマインドもしてる",        scores: { planning:4, childcare:2 } },
      { text: "カレンダーには入れてある",                  scores: { planning:3, childcare:1 } },
      { text: "聞けばだいたい分かる",                      scores: { planning:2 } },
      { text: "「あ、そうだっけ？」ってなる",              scores: { planning:1 } },
      { text: "正直よく分かってない",                      scores: {} },
    ],
  },
  // 問4
  {
    icon: "😢",
    text: "子どもがケンカして泣いて帰ってきたら？",
    choices: [
      { text: "まず抱きしめて、落ち着いてから話を聞く",   scores: { empathy:4, childcare:3 } },
      { text: "「どうしたの？」って原因を聞く",            scores: { empathy:2, childcare:2 } },
      { text: "「大丈夫大丈夫」ってなぐさめる",            scores: { empathy:1, childcare:1 } },
      { text: "「まぁそういうもんだよ」って流す",          scores: { stamina:1 } },
    ],
  },
  // 問5（5択）
  {
    icon: "🧹",
    text: "家の掃除、普段どうしてる？",
    choices: [
      { text: "担当決めてちゃんとやってる",                scores: { housework:4, planning:3 } },
      { text: "週1回は自分から動く",                      scores: { housework:3, planning:2 } },
      { text: "気になったときにやる",                      scores: { housework:2 } },
      { text: "言われたらやる",                            scores: { housework:1 } },
      { text: "基本おまかせ",                              scores: {} },
    ],
  },
  // 問6
  {
    icon: "🎒",
    text: "子どもの準備、どんな感じ？",
    choices: [
      { text: "前の日に一緒にチェックしてる",              scores: { planning:4, childcare:3 } },
      { text: "朝バタバタ確認",                            scores: { planning:2, childcare:2 } },
      { text: "メインは妻、自分はサポート",                 scores: { planning:1, childcare:1 } },
      { text: "何が必要かすら把握してない",                 scores: {} },
    ],
  },
  // 問7
  {
    icon: "😤",
    text: "妻が「最近しんどい」って言ってきたら？",
    choices: [
      { text: "「どこが一番大変？」って聞く",              scores: { empathy:4, housework:2 } },
      { text: "「手伝うよ」って言う",                      scores: { empathy:3, housework:2 } },
      { text: "「無理しないでね」って声かける",             scores: { empathy:2 } },
      { text: "「みんなしんどいよね」って言っちゃう",       scores: {} },
    ],
  },
  // 問8
  {
    icon: "💸",
    text: "急な出費が重なった月、どうする？",
    choices: [
      { text: "習い事・医療費など内訳を一緒に整理する",    scores: { planning:4, empathy:2 } },
      { text: "「どうしようか」って妻と相談する",          scores: { empathy:3, planning:2 } },
      { text: "「まぁなんとかなるか」",                    scores: { stamina:2 } },
      { text: "任せちゃう",                                scores: { stamina:1 } },
    ],
  },
  // 問9（4択・スコア修正）
  {
    icon: "🏃",
    text: "公園で遊ぶときの体力は？",
    choices: [
      { text: "いくらでもいける！",                        scores: { stamina:4, childcare:3 } },
      { text: "1〜2時間は余裕",                            scores: { stamina:3, childcare:2 } },
      { text: "30分で休憩しつつ工夫して遊ぶ",              scores: { stamina:2, childcare:2 } },
      { text: "ベンチで見守りながら声かけする",             scores: { childcare:2 } },
    ],
  },
  // 問10
  {
    icon: "🚨",
    text: "子どもが急に高熱…平日の朝どうする？",
    choices: [
      { text: "仕事調整してすぐ病院",                      scores: { childcare:4, planning:3 } },
      { text: "相談してどっち行くか決める",                 scores: { empathy:3, planning:2 } },
      { text: "相談はするが結局お願いする",                 scores: { empathy:1, childcare:1 } },
      { text: "相談もなく任せる",                           scores: {} },
    ],
  },
  // 問11
  {
    icon: "🍳",
    text: "朝、子どもが「おなかすいた〜！」って言ってきたら？",
    choices: [
      { text: "バナナでも何でも即出せる範囲で対応",         scores: { housework:4, childcare:3 } },
      { text: "簡単なもので対応する",                      scores: { housework:2, childcare:2 } },
      { text: "「ちょっと待ってね〜」が長くなる",           scores: { housework:1, childcare:1 } },
      { text: "とりあえず誰かに任せがち",                   scores: {} },
    ],
  },
  // 問12
  {
    icon: "😡",
    text: "子どもがぐずりモード全開のとき、どうする？",
    choices: [
      { text: "気持ちを受け止めて落ち着かせる",             scores: { empathy:4, childcare:3 } },
      { text: "気をそらしてなんとかする",                   scores: { childcare:3, empathy:2 } },
      { text: "とりあえず様子を見る",                      scores: { childcare:1, stamina:1 } },
      { text: "ちょっとイライラしてしまう",                 scores: { stamina:1 } },
    ],
  },
  // 問13
  {
    icon: "🎯",
    text: "お出かけ前の準備、どんな感じ？",
    choices: [
      { text: "持ち物も時間も完璧に準備",                  scores: { planning:4, childcare:2 } },
      { text: "必要なものはだいたい揃える",                 scores: { planning:3, childcare:1 } },
      { text: "何かしら忘れがち",                          scores: { planning:1 } },
      { text: "子どもの着替えを車内でさせる羽目になる",     scores: { stamina:1 } },
    ],
  },
  // 問14
  {
    icon: "📣",
    text: "子どもが何かできたとき、どう声かける？",
    choices: [
      { text: "何ができたか言葉にして具体的に褒める",       scores: { empathy:4, childcare:3 } },
      { text: "「すごいね！よくできたね！」とリアクション", scores: { empathy:3, childcare:2 } },
      { text: "「よかったね〜」くらい",                     scores: { empathy:1, childcare:1 } },
      { text: "あまり反応できていない",                     scores: {} },
    ],
  },
  // 問15
  {
    icon: "💤",
    text: "休日の過ごし方、どんな感じ？",
    choices: [
      { text: "習い事送迎や外出計画も自分が立てて動く",     scores: { childcare:4, stamina:3, planning:2 } },
      { text: "一緒に遊びつつ適度に休む",                   scores: { childcare:3, stamina:2 } },
      { text: "疲れてゴロゴロ多め",                         scores: { stamina:2, childcare:1 } },
      { text: "ほぼ休み優先",                               scores: { stamina:1 } },
    ],
  },
];

// ============================================
// 【検証用】パターンB 質問リスト・ステータス・ランク定義
// ※ 正式運用時はこのブロックごと削除
// ============================================

const STATUS_CONFIG_B = {
  care:    { label: "ケア力",     line1: "ケア力",     icon: "🍼", color: "#3D7EAA" },
  kizuna:  { label: "きずな力",   line1: "きずな力",   icon: "🤝", color: "#E91E8C" },
  team:    { label: "チーム力",   line1: "チーム力",   icon: "🏠", color: "#27AE60" },
  asobi:   { label: "あそび力",   line1: "あそび力",   icon: "🎮", color: "#FF6B35" },
  growth:  { label: "パパ成長力", line1: "パパ成長力", icon: "🌱", color: "#7B5EA7" },
};

const RANKS_B = [
  { rank: "10", lv: 10, cssClass: "rank-lv10", name: "👑 伝説のパパ神",      tagline: "もはや人間じゃない",          minScore: 92 },
  { rank: "9",  lv: 9,  cssClass: "rank-lv9",  name: "🌟 レジェンドパパ",    tagline: "家族の誰より頼られてる",       minScore: 82 },
  { rank: "8",  lv: 8,  cssClass: "rank-lv8",  name: "🦸 スーパーパパ",      tagline: "妻の株爆上がり確定",           minScore: 71 },
  { rank: "7",  lv: 7,  cssClass: "rank-lv7",  name: "💪 頼れるパパ",        tagline: "言えばちゃんとやる",           minScore: 61 },
  { rank: "6",  lv: 6,  cssClass: "rank-lv6",  name: "🌱 育ちざかりパパ",    tagline: "伸びしろしかない",             minScore: 51 },
  { rank: "5",  lv: 5,  cssClass: "rank-lv5",  name: "😅 そこそこパパ",      tagline: "平均点は超えてる…たぶん",      minScore: 41 },
  { rank: "4",  lv: 4,  cssClass: "rank-lv4",  name: "🛋️ ソファの主",        tagline: "休日の定位置、知ってる",        minScore: 31 },
  { rank: "3",  lv: 3,  cssClass: "rank-lv3",  name: "😴 いるだけパパ",      tagline: "存在は確認されている",         minScore: 20 },
  { rank: "2",  lv: 2,  cssClass: "rank-lv2",  name: "🌙 パパ覚醒待ち",      tagline: "まだ眠っている才能がある（はず）", minScore: 10 },
  { rank: "1",  lv: 1,  cssClass: "rank-lv1",  name: "🥚 パパの卵",          tagline: "ここから始まる物語",           minScore: 0  },
];

const QUESTIONS_B = [
  // Q1
  {
    icon: "🍼",
    text: "子どもが泣いたりぐずったりして、どうにもならなくなってきたとき、最初に動くのは？",
    choices: [
      { text: "自分から率先して対応する",              scores: { care:4, kizuna:2 } },
      { text: "パートナーと同時に動く",                scores: { care:3, team:2 } },
      { text: "パートナーが動くのを見てから手伝う",    scores: { care:2 } },
      { text: "基本的にパートナーに任せている",        scores: {} },
    ],
  },
  // Q2
  {
    icon: "👶",
    text: "歯磨き・トイレ介助・着替え・食事の補助など、毎日のお世話をどれくらいしている？",
    choices: [
      { text: "自分も主体的に担っている（週5日以上）", scores: { care:4, team:2 } },
      { text: "週3〜4日程度はやっている",              scores: { care:3, team:1 } },
      { text: "週1〜2日程度、たまにやる",              scores: { care:2 } },
      { text: "ほとんどパートナーに任せている",        scores: {} },
    ],
  },
  // Q3
  {
    icon: "🚨",
    text: "子どもが体調を崩したとき、仕事をどう対応している？",
    choices: [
      { text: "積極的に調整して対応している",          scores: { care:4, team:3 } },
      { text: "状況によっては対応している",            scores: { care:3, team:2 } },
      { text: "なかなか難しいが、気持ちはある",        scores: { care:1 } },
      { text: "仕事優先でほぼ対応できていない",        scores: {} },
    ],
  },
  // Q4
  {
    icon: "🎯",
    text: "子どもと遊んでいるとき、どちらが主導になることが多い？",
    choices: [
      { text: "子どもがやりたいことに自分が付き合う",        scores: { kizuna:4, asobi:2 } },
      { text: "子どもの流れに乗りつつ、一緒に考える",        scores: { kizuna:3, asobi:2 } },
      { text: "自分が面白いと思う遊びに誘うことが多い",      scores: { asobi:2 } },
      { text: "正直、遊びに付き合うのが苦手",                scores: {} },
    ],
  },
  // Q5
  {
    icon: "😢",
    text: "子どもが失敗したり泣いているとき、どう接する？",
    choices: [
      { text: "まず気持ちに寄り添い、「大丈夫だよ」と声をかける",    scores: { kizuna:4, care:2 } },
      { text: "とりあえず抱きしめて、少し落ち着いてから話を聞く",    scores: { kizuna:3, care:1 } },
      { text: "「次はうまくやろう」と前向きな言葉をかける",          scores: { kizuna:2 } },
      { text: "「泣かない！」「しっかりしなさい」と言ってしまいがち", scores: {} },
    ],
  },
  // Q6
  {
    icon: "👀",
    text: "子どもと最後に、ちゃんと目を見て向き合ったのはいつ？",
    choices: [
      { text: "今日・昨日",           scores: { kizuna:4, growth:2 } },
      { text: "2〜3日前",            scores: { kizuna:3, growth:1 } },
      { text: "1週間以内",            scores: { kizuna:1 } },
      { text: "最近あまり記憶がない", scores: {} },
    ],
  },
  // Q7
  {
    icon: "🏠",
    text: "家事（料理・洗濯・掃除など）の分担は？",
    choices: [
      { text: "ほぼ半々か、自分の方が多いくらい",    scores: { team:4, care:1 } },
      { text: "3〜4割は自分が担っている",            scores: { team:3 } },
      { text: "頼まれたらやるが、自分からは動かない", scores: { team:1 } },
      { text: "言われても後回しにしてしまいがち",    scores: {} },
    ],
  },
  // Q8
  {
    icon: "💬",
    text: "パートナーが「疲れた」「しんどい」と言ったとき、実際にどう動いている？",
    choices: [
      { text: "言われる前に気づいて動いている",                scores: { team:4, kizuna:2 } },
      { text: "「任せて、休んで」と家事・育児を引き受ける",    scores: { team:3, kizuna:1 } },
      { text: "「何か手伝おうか？」と聞く",                    scores: { team:2 } },
      { text: "「自分も疲れてる」と返してしまいがち",          scores: {} },
    ],
  },
  // Q9
  {
    icon: "🗣️",
    text: "子どもの発達や教育・しつけについて、パートナーと話し合うことはある？",
    choices: [
      { text: "よく話し合っている（月に複数回以上）",    scores: { team:4, growth:2 } },
      { text: "何かあったときは一緒に考えている",        scores: { team:3, growth:1 } },
      { text: "パートナーが言い出したときだけ聞く",      scores: { team:1 } },
      { text: "ほとんど話し合ったことがない",            scores: {} },
    ],
  },
  // Q10
  {
    icon: "🎠",
    text: "子どもの好きなキャラクター・遊び・最近ハマってることをいくつ言える？",
    choices: [
      { text: "5つ以上すぐ言える",    scores: { asobi:4, kizuna:3 } },
      { text: "3〜4つ言える",        scores: { asobi:3, kizuna:2 } },
      { text: "1〜2つなら言える",     scores: { asobi:1, kizuna:1 } },
      { text: "正直あまりわからない", scores: {} },
    ],
  },
  // Q11
  {
    icon: "🌳",
    text: "外遊び・おうち遊びにかかわらず、子どもと向き合って一緒に遊ぶのは週どれくらい？",
    choices: [
      { text: "週4回以上",          scores: { asobi:4, kizuna:1 } },
      { text: "週2〜3回程度",      scores: { asobi:3 } },
      { text: "週1回程度",          scores: { asobi:2 } },
      { text: "ほとんどできていない", scores: {} },
    ],
  },
  // Q12
  {
    icon: "🔍",
    text: "子どもの「なんで？」「どうして？」に、どう答える？",
    choices: [
      { text: "一緒に考えたり、調べたりする",              scores: { asobi:4, growth:2 } },
      { text: "できる範囲で丁寧に答える",                  scores: { asobi:3, growth:1 } },
      { text: "「あとでね」が多い",                        scores: { asobi:1 } },
      { text: "正直面倒で、ちゃんと向き合えていない",      scores: {} },
    ],
  },
  // Q13
  {
    icon: "📚",
    text: "この診断以外で、「良いパパになりたい」と思って何か行動したことがある？",
    choices: [
      { text: "育児本・記事・動画を見る、パパ友と話すなど積極的にしている", scores: { growth:4, team:1 } },
      { text: "たまに記事や動画を見たり、考えたりしている",                  scores: { growth:3 } },
      { text: "思うことはあるが、特に行動はしていない",                      scores: { growth:1 } },
      { text: "あまり考えたことがない",                                      scores: {} },
    ],
  },
  // Q14
  {
    icon: "💛",
    text: "「大好き」「愛してるよ」など、気持ちを言葉にして子どもに伝えている？",
    choices: [
      { text: "自然に毎日伝えている",        scores: { kizuna:4, growth:2 } },
      { text: "意識すれば言える",            scores: { kizuna:3, growth:1 } },
      { text: "照れくさくてあまり言えない",  scores: { kizuna:1 } },
      { text: "ほとんど言ったことがない",    scores: {} },
    ],
  },
  // Q15
  {
    icon: "🔮",
    text: "10年後の子どもに「パパのここが好きだった」と言ってもらいたいのは？",
    choices: [
      { text: "「一緒に遊んでくれたこと」→ 毎週ちゃんと遊んでいる",                  scores: { asobi:4, growth:3 } },
      { text: "「話を聞いてくれたこと」→ 心がけてはいるが、できていない日もある",    scores: { kizuna:3, growth:3 } },
      { text: "「頑張って働いてくれたこと」→ それが自分にできる精一杯",              scores: { growth:1 } },
      { text: "子どもが何を思うか、あまり想像したことがない",                        scores: {} },
    ],
  },
];

/**
 * 総合スコアによるランク定義（10段階 Lv.1〜10）
 * パターンA：最大104pt基準
 */
const RANKS = [
  { rank: "10", lv: 10, cssClass: "rank-lv10", name: "👑 伝説のパパ神",      tagline: "もはや人間じゃない",          minScore: 92 },
  { rank: "9",  lv: 9,  cssClass: "rank-lv9",  name: "🌟 レジェンドパパ",    tagline: "家族の誰より頼られてる",       minScore: 82 },
  { rank: "8",  lv: 8,  cssClass: "rank-lv8",  name: "🦸 スーパーパパ",      tagline: "妻の株爆上がり確定",           minScore: 71 },
  { rank: "7",  lv: 7,  cssClass: "rank-lv7",  name: "💪 頼れるパパ",        tagline: "言えばちゃんとやる",           minScore: 61 },
  { rank: "6",  lv: 6,  cssClass: "rank-lv6",  name: "🌱 育ちざかりパパ",    tagline: "伸びしろしかない",             minScore: 51 },
  { rank: "5",  lv: 5,  cssClass: "rank-lv5",  name: "😅 そこそこパパ",      tagline: "平均点は超えてる…たぶん",      minScore: 41 },
  { rank: "4",  lv: 4,  cssClass: "rank-lv4",  name: "🛋️ ソファの主",        tagline: "休日の定位置、知ってる",        minScore: 31 },
  { rank: "3",  lv: 3,  cssClass: "rank-lv3",  name: "😴 いるだけパパ",      tagline: "存在は確認されている",         minScore: 20 },
  { rank: "2",  lv: 2,  cssClass: "rank-lv2",  name: "🌙 パパ覚醒待ち",      tagline: "まだ眠っている才能がある（はず）", minScore: 10 },
  { rank: "1",  lv: 1,  cssClass: "rank-lv1",  name: "🥚 パパの卵",          tagline: "ここから始まる物語",           minScore: 0  },
];

/**
 * ランク別SVGイラスト
 */
const RANK_ILLUSTRATIONS = {
  /* ── S：外部PNG画像 ── */
  S: `<img src="images/s_rank.png" alt="Sランク" style="width:150px;height:150px;object-fit:cover;display:block;" />`,

  /* ── A：マント翻るヒーローパパ ── */
  A: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="14" fill="#FFF1F5"/>
  <!-- 動きの線 -->
  <path d="M8 42 Q14 40 18 44" stroke="#FBCFE8" stroke-width="2" stroke-linecap="round"/>
  <path d="M6 50 Q11 48 15 52" stroke="#FBCFE8" stroke-width="1.5" stroke-linecap="round"/>
  <!-- マント -->
  <path d="M26 62 Q40 72 54 62 L50 40 Q40 52 30 40 Z" fill="#EC4899" opacity="0.9"/>
  <path d="M30 40 Q40 52 50 40 L48 34 Q40 44 32 34 Z" fill="#BE185D" opacity="0.7"/>
  <!-- 体 -->
  <rect x="30" y="38" width="20" height="22" rx="7" fill="#3B82F6"/>
  <!-- 胸のヒーローマーク -->
  <path d="M36 44 L40 52 L44 44" stroke="#FCD34D" stroke-width="2.2" stroke-linejoin="round" fill="none"/>
  <circle cx="40" cy="43" r="2" fill="#FCD34D"/>
  <!-- 頭 -->
  <circle cx="40" cy="28" r="12" fill="#FDE68A"/>
  <!-- 耳 -->
  <ellipse cx="28.5" cy="28" rx="2.5" ry="3.5" fill="#FCD34D"/>
  <ellipse cx="51.5" cy="28" rx="2.5" ry="3.5" fill="#FCD34D"/>
  <!-- 目 -->
  <ellipse cx="36" cy="26.5" rx="2.5" ry="2.8" fill="#1E293B"/>
  <ellipse cx="44" cy="26.5" rx="2.5" ry="2.8" fill="#1E293B"/>
  <circle cx="36.8" cy="25.6" r="1" fill="white"/>
  <circle cx="44.8" cy="25.6" r="1" fill="white"/>
  <!-- ヒーローマスク -->
  <path d="M28.5 22.5 Q40 16 51.5 22.5 L50 28 Q40 23 30 28 Z" fill="#EC4899" opacity="0.85"/>
  <!-- 眉（つり眉・凛々しい） -->
  <path d="M32 21 Q34 19.5 37 20.5" stroke="#9D174D" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M43 20.5 Q46 19.5 48 21" stroke="#9D174D" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- 口 -->
  <path d="M37 32 Q40 35.5 43 32" stroke="#92400E" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- 腕 -->
  <rect x="18" y="40" width="12" height="8" rx="5" fill="#3B82F6"/>
  <rect x="50" y="40" width="12" height="8" rx="5" fill="#3B82F6"/>
  <!-- 拳（右手を前に） -->
  <circle cx="62" cy="38" r="5.5" fill="#FDE68A" stroke="#FCD34D" stroke-width="1"/>
  <!-- エフェクト星 -->
  <path d="M66 22 l1.2 3.5 3.5 0 -2.8 2 1 3.5 -2.9-2.1 -2.9 2.1 1-3.5 -2.8-2 3.5 0 Z" fill="#FCD34D"/>
  <circle cx="12" cy="32" r="3" fill="#FBCFE8" opacity="0.7"/>
</svg>`,

  /* ── B：水やり中の成長パパ ── */
  B: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="14" fill="#F0FDF4"/>
  <!-- 土台・芝 -->
  <ellipse cx="40" cy="70" rx="28" ry="5" fill="#BBF7D0" opacity="0.6"/>
  <!-- 植木鉢 -->
  <path d="M28 65 L32 50 L48 50 L52 65 Z" fill="#D97706"/>
  <path d="M29 65 L51 65" stroke="#B45309" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="26" y="46" width="28" height="6" rx="3" fill="#F59E0B"/>
  <!-- 茎 -->
  <path d="M40 46 C40 38 38 28 40 18" stroke="#16A34A" stroke-width="3" stroke-linecap="round"/>
  <!-- 葉っぱ右（大） -->
  <path d="M40 30 C50 26 58 18 55 10 C46 12 38 22 40 30" fill="#22C55E"/>
  <path d="M40 30 C50 26 58 18 55 10" stroke="#15803D" stroke-width="1" fill="none" stroke-linecap="round"/>
  <!-- 葉っぱ左 -->
  <path d="M40 38 C30 34 22 26 25 18 C34 20 42 30 40 38" fill="#16A34A"/>
  <path d="M40 38 C30 34 22 26 25 18" stroke="#14532D" stroke-width="1" fill="none" stroke-linecap="round"/>
  <!-- 花（つぼみ→開花） -->
  <circle cx="40" cy="16" r="6" fill="#FCD34D"/>
  <circle cx="40" cy="16" r="3.5" fill="#F59E0B"/>
  <ellipse cx="34" cy="13" rx="3" ry="4.5" fill="#FDE68A" opacity="0.8" transform="rotate(-30 34 13)"/>
  <ellipse cx="46" cy="13" rx="3" ry="4.5" fill="#FDE68A" opacity="0.8" transform="rotate(30 46 13)"/>
  <ellipse cx="40" cy="10" rx="3" ry="4.5" fill="#FEF08A" opacity="0.9"/>
  <!-- じょうろ -->
  <path d="M58 28 L64 38 L56 42 L52 32 Z" fill="#60A5FA" stroke="#3B82F6" stroke-width="1"/>
  <path d="M64 38 Q68 36 66 44 Q63 48 58 46" stroke="#60A5FA" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- 水滴 -->
  <path d="M57 47 Q58 44 57 41 Q56 44 57 47" fill="#93C5FD"/>
  <path d="M60 49 Q61 46 60 43 Q59 46 60 49" fill="#93C5FD" opacity="0.7"/>
  <path d="M54 48 Q55 45.5 54 43 Q53 45.5 54 48" fill="#BAE6FD" opacity="0.6"/>
  <!-- 蝶 -->
  <path d="M14 22 Q10 16 16 14 Q20 20 14 22" fill="#FB7185" opacity="0.8"/>
  <path d="M14 22 Q18 16 16 14 Q12 20 14 22" fill="#FCA5A5" opacity="0.7"/>
  <circle cx="14" cy="22" r="1.2" fill="#9F1239"/>
</svg>`,

  /* ── C：ダンベルで特訓中のパパ ── */
  C: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="14" fill="#FFF7ED"/>
  <!-- 床 -->
  <rect x="8" y="66" width="64" height="4" rx="2" fill="#FED7AA" opacity="0.6"/>
  <!-- ダンベル -->
  <rect x="8"  y="42" width="7"  height="18" rx="3.5" fill="#94A3B8"/>
  <rect x="6"  y="40" width="11" height="7"  rx="3"   fill="#64748B"/>
  <rect x="6"  y="55" width="11" height="7"  rx="3"   fill="#64748B"/>
  <rect x="65" y="42" width="7"  height="18" rx="3.5" fill="#94A3B8"/>
  <rect x="63" y="40" width="11" height="7"  rx="3"   fill="#64748B"/>
  <rect x="63" y="55" width="11" height="7"  rx="3"   fill="#64748B"/>
  <!-- バー -->
  <rect x="15" y="48" width="50" height="5" rx="2.5" fill="#CBD5E1"/>
  <!-- 体 -->
  <rect x="30" y="44" width="20" height="22" rx="7" fill="#3B82F6"/>
  <!-- 筋肉ライン -->
  <path d="M34 48 Q37 52 34 56" stroke="#93C5FD" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  <path d="M46 48 Q43 52 46 56" stroke="#93C5FD" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  <!-- 頭 -->
  <circle cx="40" cy="29" r="12" fill="#FDE68A"/>
  <!-- 耳 -->
  <ellipse cx="28.5" cy="29" rx="2.5" ry="3.5" fill="#FCD34D"/>
  <ellipse cx="51.5" cy="29" rx="2.5" ry="3.5" fill="#FCD34D"/>
  <!-- 頑張り顔・つり眉 -->
  <path d="M32 24.5 Q34.5 22.5 37.5 24" stroke="#92400E" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M42.5 24 Q45.5 22.5 48 24.5" stroke="#92400E" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- 歯を食いしばる口 -->
  <path d="M35 33 L45 33" stroke="#92400E" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M36 33 Q36 36 40 36 Q44 36 44 33" stroke="#92400E" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <!-- 腕（力こぶ） -->
  <path d="M30 50 Q20 46 17 51" stroke="#FDE68A" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M50 50 Q60 46 63 51" stroke="#FDE68A" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- 力こぶ -->
  <circle cx="23" cy="47" r="4" fill="#FCD34D" stroke="#F59E0B" stroke-width="1"/>
  <circle cx="57" cy="47" r="4" fill="#FCD34D" stroke="#F59E0B" stroke-width="1"/>
  <!-- 汗 -->
  <path d="M52 18 Q54 13 52 9  Q50 13 52 18" fill="#60A5FA"/>
  <path d="M58 26 Q60 22 58 18 Q56 22 58 26" fill="#93C5FD" opacity="0.8"/>
  <!-- 炎 -->
  <path d="M10 24 Q12 18 10 12 Q8 16 7 20 Q5 15 8 10 Q14 8 13 18 Q16 14 15 10 Q20 14 16 24 Q14 28 10 24" fill="#FB923C"/>
  <path d="M12 24 Q13 20 12 16 Q11 19 10 22 Q9 18 11 15 Q14 13 13 20 Q15 17 14 15 Q17 18 14 24 Q13 26 12 24" fill="#FCD34D"/>
</svg>`,
};

/**
 * 特殊能力マスターデータ
 * rarity: "SSR" / "SR" / "R" / "N" / "NEG"（ネガティブ）
 * trigger: 関連ステータスキー（上位になりやすい項目）
 */
const SKILLS_POSITIVE = [
  // SSR（8個）
  { rarity:"SSR", icon:"💪", name:"無限体力",           trigger:"stamina"   },
  { rarity:"SSR", icon:"🔮", name:"先読み神",            trigger:"planning"  },
  { rarity:"SSR", icon:"💞", name:"ママ完全理解",         trigger:"empathy"   },
  { rarity:"SSR", icon:"🌙", name:"夜泣き完全対応",       trigger:"childcare" },
  { rarity:"SSR", icon:"🧠", name:"感情翻訳機",           trigger:"empathy"   },
  { rarity:"SSR", icon:"🎪", name:"全力遊び王",           trigger:"stamina"   },
  { rarity:"SSR", icon:"⚖️", name:"家庭バランサー",       trigger:"planning"  },
  { rarity:"SSR", icon:"⏱️", name:"時間創造者",           trigger:"planning"  },
  // SR（9個）
  { rarity:"SR",  icon:"😴", name:"寝かしつけ職人",       trigger:"childcare" },
  { rarity:"SR",  icon:"🏃", name:"公園マスター",          trigger:"stamina"   },
  { rarity:"SR",  icon:"🔄", name:"切り替え上手",          trigger:"empathy"   },
  { rarity:"SR",  icon:"💬", name:"共感マスター",           trigger:"empathy"   },
  { rarity:"SR",  icon:"📋", name:"段取り神",              trigger:"planning"  },
  { rarity:"SR",  icon:"🎨", name:"遊びクリエイター",       trigger:"childcare" },
  { rarity:"SR",  icon:"🧘", name:"忍耐の達人",            trigger:"stamina"   },
  { rarity:"SR",  icon:"🧹", name:"片付け誘導士",           trigger:"housework" },
  { rarity:"SR",  icon:"🚗", name:"外出スムーズ",           trigger:"planning"  },
  // R（8個）
  { rarity:"R",   icon:"📖", name:"絵本読み名人",           trigger:"childcare" },
  { rarity:"R",   icon:"🤗", name:"抱っこエース",            trigger:"childcare" },
  { rarity:"R",   icon:"🌅", name:"朝支度スムーズ",          trigger:"housework" },
  { rarity:"R",   icon:"🍽️", name:"ごはんサポーター",        trigger:"housework" },
  { rarity:"R",   icon:"🛁", name:"お風呂リーダー",           trigger:"childcare" },
  { rarity:"R",   icon:"👕", name:"お着替え誘導",             trigger:"childcare" },
  { rarity:"R",   icon:"😤", name:"ぐずり耐性",              trigger:"stamina"   },
  { rarity:"R",   icon:"🍬", name:"おやつコントロール",        trigger:"planning"  },
  // N（5個）
  { rarity:"N",   icon:"👀", name:"見守り安定",              trigger:"stamina"   },
  { rarity:"N",   icon:"🗣️", name:"声かけ丁寧",              trigger:"empathy"   },
  { rarity:"N",   icon:"🐢", name:"マイペース対応",           trigger:"stamina"   },
  { rarity:"N",   icon:"🛡️", name:"安全第一",                trigger:"childcare" },
  { rarity:"N",   icon:"🙂", name:"ほどほど参加",             trigger:"stamina"   },
];

const SKILLS_NEGATIVE = [
  // 軽め（8個）
  { icon:"😅", name:"指示待ちパパ"       },
  { icon:"📱", name:"とりあえずスマホ"    },
  { icon:"⏰", name:"5分だけの人"         },
  { icon:"😶", name:"気づかない系男子"    },
  { icon:"💬", name:"今やろうと思ってた"  },
  { icon:"🚶", name:"途中離脱マン"        },
  { icon:"🔄", name:"なぜか逆効果"        },
  { icon:"⏱️", name:"タイミング悪い職人"  },
  // 中くらい（8個）
  { icon:"😂", name:"詰めが甘い王"        },
  { icon:"📊", name:"やる気ムラあり"      },
  { icon:"😪", name:"すぐ疲れた言う"      },
  { icon:"🔥", name:"最初だけ本気"        },
  { icon:"💨", name:"だいたい空回り"      },
  { icon:"😓", name:"なぜか怒られる"      },
  { icon:"🤔", name:"手伝った気でいる"    },
  { icon:"✂️", name:"ちょい雑プレイ"      },
  // 強め（8個）
  { icon:"📋", name:"存在がイベント"      },
  { icon:"💥", name:"触ると散らかる"      },
  { icon:"🎮", name:"指示で動くタイプ"    },
  { icon:"🏃", name:"ワンオペ回避マン"    },
  { icon:"🤷", name:"役に立ちそうで立たない" },
  { icon:"📈", name:"なぜか仕事増やす"    },
  { icon:"💨", name:"空気クラッシャー"    },
  // ※「戦力外通告」は演出が難しいため今回は除外
];

/**
 * 特殊能力選出ロジック
 * - 総合スコアに応じてポジティブのレアリティを制御
 * - 下位ステータスが低い場合、ネガティブを最大1個混入
 * @param {Object} scores   各ステータスのptオブジェクト
 * @param {number} total    総合スコア
 * @returns {Array}         最大3個のskillオブジェクト（type付き）
 */
function pickSkills(scores, total, activeRanks) {
  activeRanks = activeRanks || RANKS;
  const result = [];
  const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ── ポジティブ3個を選出 ──
  // Lvに応じてレアリティプールを決定
  const lv = (activeRanks || RANKS).find(r => total >= r.minScore)?.lv || 1;
  let rarityPool;
  if      (lv >= 9) rarityPool = ["SSR","SSR","SR"];  // Lv9〜10
  else if (lv >= 7) rarityPool = ["SSR","SR","SR"];   // Lv7〜8
  else if (lv >= 5) rarityPool = ["SR","SR","R"];     // Lv5〜6
  else if (lv >= 3) rarityPool = ["R","R","N"];       // Lv3〜4
  else              rarityPool = ["N","N","N"];        // Lv1〜2

  // 上位3ステータスを特定
  const topKeys = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);

  topKeys.forEach((key, i) => {
    const rarity    = rarityPool[i];
    // trigger一致＆レアリティ一致を優先、なければレアリティのみで選出
    const preferred = SKILLS_POSITIVE.filter(s => s.rarity === rarity && s.trigger === key);
    const fallback  = SKILLS_POSITIVE.filter(s => s.rarity === rarity);
    const pool      = preferred.length > 0 ? preferred : fallback;
    result.push({ ...pick(pool), type: "positive" });
  });

  // ── ネガティブ判定：最下位ステータスのptが3未満なら1個追加 ──
  const minPt = Math.min(...Object.values(scores));
  if (minPt <= 2) {
    result.push({ ...pick(SKILLS_NEGATIVE), type: "negative" });
  }

  return result;
}


/**
 * ランク別コメント（妻・子どもそれぞれランダム選択）
 */
const COMMENTS = {
  "10": { wife: [ "完璧すぎて、たまに怖い。", "このパパがいれば、何も怖くない。", "頼りすぎてごめん。でも頼りたくなる。" ] },
  "9":  { wife: [ "ほぼ満点。あとは続けるだけ。", "このパパ、隠れた逸材だと思う。", "もうちょっとで伝説になれる。" ] },
  "8":  { wife: [ "だいたい頑張ってる。でも詰めが甘い。", "頼れるけど、たまに雑。", "80点パパ。残り20点は愛嬌で補ってる。" ] },
  "7":  { wife: [ "言えばやってくれる。言わないとやらない。", "頼れる。でも自発的じゃない。", "声かけ必須だけど、動いてくれるのは助かる。" ] },
  "6":  { wife: [ "伸びしろを感じる。育てがいがある。", "やる気はある。あとは行動だけ。", "もう少しで頼れるパパになれそう。" ] },
  "5":  { wife: [ "戦力にはなる。安定はしない。", "やる気はある。でも空回りしがち。", "平均点は超えてる…たぶん。" ] },
  "4":  { wife: [ "ソファとの絆が深すぎる。", "休日の存在感が薄い。", "いるのにいない感じがする。" ] },
  "3":  { wife: [ "存在感は薄め。でもいないと困る。", "家族というより、同居人に近い。", "子どもより自由に生きてる。" ] },
  "2":  { wife: [ "まず、気づくところから始めよう。", "才能はあると信じてる。たぶん。", "眠れる獅子、早く目覚めて。" ] },
  "1":  { wife: [ "ここから始まる物語に期待してる。", "いるだけでいい…とは言えない段階。", "これ、診断じゃなくて現実だよ。" ] },
};


// ============================================
// 2. 状態管理変数
// ============================================

let currentQuestion = 0;
let scores = {};
let answerHistory = []; // 戻るボタン用：各問の選択スコアを記録
let currentQuestions = QUESTIONS_A; // 使用中の質問セット
let currentPattern = 'A';           // 使用中のパターン


// ============================================
// 3. 画面切り替え関数
// ============================================

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// ============================================
// 4. クイズ進行関数
// ============================================

function startQuiz(pattern) {
  // パターンB固定
  // 【再検証時】この行をコメントアウトし、下の検証用コードを有効にする
  currentPattern   = 'B';
  currentQuestions = QUESTIONS_B;

  // 【検証用】パターン切り替え（再検証時はこのブロックのコメントを外す）
  // currentPattern   = pattern || 'B';
  // currentQuestions = (currentPattern === 'B') ? QUESTIONS_B : QUESTIONS_A;

  currentQuestion = 0;
  answerHistory = [];
  scores = {};
  const config = (currentPattern === 'B') ? STATUS_CONFIG_B : STATUS_CONFIG;
  Object.keys(config).forEach(key => { scores[key] = 0; });
  showScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = currentQuestions[currentQuestion];
  const total = currentQuestions.length;
  const remain = total - currentQuestion;

  // 問番号・残り問数
  document.getElementById("quiz-num").textContent = `${currentQuestion + 1} / ${total}`;
  document.getElementById("progress-remain").textContent =
    remain === 1 ? "最後の1問！" : `あと${remain}問！`;

  // アイコン・テキスト
  document.getElementById("question-icon").textContent = q.icon;
  document.getElementById("question-text").textContent = q.text;

  // プログレスバー
  const percent = ((currentQuestion + 1) / total) * 100;
  document.getElementById("progress-fill").style.width = percent + "%";

  // 戻るボタン：問1では非表示
  const btnBack = document.getElementById("btn-back");
  btnBack.style.visibility = currentQuestion === 0 ? "hidden" : "visible";

  // 選択肢ボタン生成
  const letters = ["A", "B", "C", "D", "E"];
  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerHTML = `
      <span class="choice-letter">${letters[index]}</span>
      <span>${choice.text}</span>
    `;
    btn.addEventListener("click", () => selectChoice(btn, choice.scores, choice.text));
    choicesEl.appendChild(btn);
  });
}

/**
 * 選択肢をタップ → ハイライト0.25秒 → 次の問へ
 */
function selectChoice(btn, selectedScores, choiceText) {
  // 連打防止
  document.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);

  // ハイライト演出
  btn.classList.add("choice-selected");

  // 今回の回答をスタックに積む（戻るボタン・回答確認用）
  answerHistory.push({ scores: selectedScores, text: choiceText });

  // スコア加算
  Object.entries(selectedScores).forEach(([key, value]) => {
    scores[key] = (scores[key] || 0) + value;
  });

  currentQuestion++;

  if (currentQuestion < currentQuestions.length) {
    setTimeout(renderQuestion, 280);
  } else {
    // ローディング画面を表示してから集計
    setTimeout(() => {
      showScreen("screen-loading");
      setTimeout(showResult, 900);
    }, 280);
  }
}

/**
 * 1問前に戻る（A案）
 */
function goBack() {
  if (currentQuestion === 0) return;

  // 直前の回答を取り消し
  const prev = answerHistory.pop();
  Object.entries(prev.scores).forEach(([key, value]) => {
    scores[key] = (scores[key] || 0) - value;
  });

  currentQuestion--;
  renderQuestion();
}


// ============================================
// 5. 結果集計・表示関数
// ============================================

/**
 * 結果画面を組み立てて表示する
 */
function showResult() {
  // ── パターンに応じた設定を選択 ──────
  const activeStatusConfig = (currentPattern === 'B') ? STATUS_CONFIG_B : STATUS_CONFIG;
  const activeRanks        = (currentPattern === 'B') ? RANKS_B : RANKS;

  // ── 総合スコア計算 ──────────────────
  const totalScore = Object.values(scores).reduce((sum, v) => sum + v, 0);

  // ── ランク判定 ──────────────────────
  const rankData = activeRanks.find(r => totalScore >= r.minScore);

  // Lvに応じたイラスト画像を設定
  const RANK_ILLUST_MAP = {
    1:  "images/Lv-1.png",
    2:  "images/Lv-2.png",
    3:  "images/Lv-3.png",
    4:  "images/Lv-4.png",
    5:  "images/Lv-5.png",
    6:  "images/Lv-6.png",
    7:  "images/Lv-7.png",
    8:  "images/Lv-8.png",
    9:  "images/Lv-9.png",
    10: "images/Lv-10.png",
  };
  const illustImg = document.getElementById("rank-illust-img");
  illustImg.src = RANK_ILLUST_MAP[rankData.lv];

  // Lv番号・オーバーレイのクラスを更新
  const lvOverlay = document.getElementById("rank-lv-overlay");
  lvOverlay.className = "rank-lv-overlay " + rankData.cssClass;
  document.getElementById("rank-letter").textContent = rankData.rank;
  document.getElementById("rank-name").textContent   = rankData.name;

  // tagline（ひとこと）をrank-nameの下に表示
  let taglineEl = document.getElementById("rank-tagline");
  if (!taglineEl) {
    taglineEl = document.createElement("p");
    taglineEl.id = "rank-tagline";
    taglineEl.className = "rank-tagline";
    document.getElementById("rank-name").insertAdjacentElement("afterend", taglineEl);
  }
  taglineEl.textContent = rankData.tagline;

  // ── ステータスランク描画 ─────────────
  const statusList = document.getElementById("status-list");
  statusList.innerHTML = "";

  // ── ステータス最大値定義（パーセンテージ判定用） ──
  const STATUS_MAX_A = { childcare:34, stamina:10, housework:14, empathy:22, planning:24 };
  const STATUS_MAX_B = { care:15, kizuna:24, team:18, asobi:18, growth:15 };
  const activeStatusMax = (currentPattern === 'B') ? STATUS_MAX_B : STATUS_MAX_A;

  // スコア → ランク変換（パーセンテージ方式）
  // S: 80%以上 / A: 60%以上 / B: 35%以上 / C: 15%以上 / D: 15%未満
  function scoreToRank(val, maxVal) {
    const pct = maxVal > 0 ? val / maxVal : 0;
    if (pct >= 0.80) return { rank: "S", cssClass: "sr-s" };
    if (pct >= 0.60) return { rank: "A", cssClass: "sr-a" };
    if (pct >= 0.35) return { rank: "B", cssClass: "sr-b" };
    if (pct >= 0.15) return { rank: "C", cssClass: "sr-c" };
    return                  { rank: "D", cssClass: "sr-d" };
  }

  Object.entries(activeStatusConfig).forEach(([key, config]) => {
    const val      = scores[key] || 0;
    const maxVal   = activeStatusMax[key] || 1;
    const rankInfo = scoreToRank(val, maxVal);

    const item = document.createElement("div");
    item.className = "status-item";
    item.innerHTML = `
      <div class="status-name">
        <span class="status-icon">${config.icon}</span>
        <span class="status-label-text">${config.line1}</span>
      </div>
      <span class="status-rank-badge ${rankInfo.cssClass}">${rankInfo.rank}</span>
    `;
    statusList.appendChild(item);
  });

  // ── 特殊能力選出＆描画 ──────────────
  const skillsList = document.getElementById("skills-list");
  skillsList.innerHTML = "";

  const selectedSkills = pickSkills(scores, totalScore, activeRanks);

  // レアリティ表示テキスト
  const rarityLabel = { SSR:"👑 SSR", SR:"🌟 SR", R:"✨ R", N:"🙂 N" };

  selectedSkills.forEach((skill, i) => {
    const item = document.createElement("div");
    item.className = "skill-item" + (skill.type === "negative" ? " skill-negative" : "");
    item.style.animationDelay = (i * 0.08) + "s";
    item.innerHTML = skill.type === "negative"
      ? `<div class="skill-icon-wrap skill-icon-neg">${skill.icon}</div>
         <div class="skill-name">${skill.name}</div>`
      : `<div class="skill-icon-wrap">${skill.icon}</div>
         <div class="skill-name">${skill.name}</div>`;
    skillsList.appendChild(item);
  });

  // ── シェアテキスト組み立て ────────────
  const skillNames = selectedSkills.map(s => s.name).join(" / ");
  shareText =
    `【パパ力診断】\n` +
    `Lv.${rankData.rank} ${rankData.name}\n` +
    `特殊能力：${skillNames}\n` +
    `#パパ力診断 #パパ`;

  // ── コメント（ランダム選択） ─────────
  const rankComments = COMMENTS[rankData.rank];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  document.getElementById("wife-comment").textContent = pick(rankComments.wife);

  // ── 画面を表示 ──────────────────────
  showScreen("screen-result");
}

let shareText = ""; // シェア用テキストを保持

/**
 * 回答確認画面を表示
 */
function showAnswers() {
  const list = document.getElementById("answers-list");
  list.innerHTML = "";

  const letters = ["A", "B", "C", "D", "E"];

  currentQuestions.forEach((q, qi) => {
    const answered = answerHistory[qi];

    const block = document.createElement("div");
    block.className = "answer-block";

    // 質問ヘッダー
    const header = document.createElement("div");
    header.className = "answer-q-header";
    header.innerHTML = `<span class="answer-q-num">Q${qi + 1}</span><span class="answer-q-icon">${q.icon}</span><span class="answer-q-text">${q.text}</span>`;
    block.appendChild(header);

    // 選択肢リスト
    q.choices.forEach((choice, ci) => {
      const isSelected = answered && answered.text === choice.text;
      const row = document.createElement("div");
      row.className = "answer-choice-row" + (isSelected ? " answer-selected" : "");
      row.innerHTML = `
        <span class="answer-choice-letter ${isSelected ? "answer-letter-selected" : ""}">${letters[ci]}</span>
        <span class="answer-choice-text">${choice.text}</span>
        ${isSelected ? '<span class="answer-check">✓</span>' : ""}
      `;
      block.appendChild(row);
    });

    list.appendChild(block);
  });

  showScreen("screen-answers");
}

/**
 * もう一度診断ボタン → トップ画面へ戻る
 */
function retryQuiz() {
  showScreen("screen-top");
}

/**
 * Xへシェア
 */
function shareToX() {
  const url  = encodeURIComponent(location.href);
  const text = encodeURIComponent(shareText);
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    "_blank", "noopener,noreferrer"
  );
}

/**
 * Threadsへシェア
 */
function shareToThreads() {
  const url  = encodeURIComponent(location.href);
  const text = encodeURIComponent(shareText);
  window.open(
    `https://www.threads.net/intent/post?text=${text}&url=${url}`,
    "_blank", "noopener,noreferrer"
  );
}

/**
 * ネイティブ共有シート（iOS Safari / Android Chrome）
 * 非対応の場合はXシェアにフォールバック
 */
async function shareNative() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "パパ力診断",
        text: shareText,
        url: location.href,
      });
    } catch (e) {
      // キャンセル時は何もしない
    }
  } else {
    // 非対応端末はXにフォールバック
    shareToX();
  }
}

/**
 * ページ読み込み時：常にシェアボタンを表示
 */
function initShareButtons() {
  const btn = document.getElementById("btn-native-share");
  if (btn) btn.style.display = "flex";
}

// ページ読み込み時に実行
initShareButtons();
