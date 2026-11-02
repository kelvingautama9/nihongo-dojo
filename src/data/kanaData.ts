export interface KanaItem {
  id: string;
  kana: string;
  romaji: string;
  acceptedRomaji: string[];
  script: 'hiragana' | 'katakana';
  group: 'gojuuon' | 'dakuon' | 'youon';
  rowId: string;
  rowOrder: number;
  rowLabel: string;
  mnemonic: string;
  confusableKana: string[];
  confusableRomaji: string[];
}

export interface KanaRowMeta {
  rowId: string;
  order: number;
  title: string;
  shortLabel: string;
  group: 'gojuuon' | 'dakuon' | 'youon';
  previewHiragana: string;
  previewKatakana: string;
}

export const KANA_ROWS: KanaRowMeta[] = [
  { rowId: 'a', order: 1, title: 'Deret A (Vokal Dasar)', shortLabel: 'a · i · u · e · o', group: 'gojuuon', previewHiragana: 'あ い う え お', previewKatakana: 'ア イ ウ エ オ' },
  { rowId: 'ka', order: 2, title: 'Deret KA', shortLabel: 'ka · ki · ku · ke · ko', group: 'gojuuon', previewHiragana: 'か き く け こ', previewKatakana: 'カ キ ク ケ コ' },
  { rowId: 'sa', order: 3, title: 'Deret SA', shortLabel: 'sa · shi · su · se · so', group: 'gojuuon', previewHiragana: 'さ し す せ そ', previewKatakana: 'サ シ ス セ ソ' },
  { rowId: 'ta', order: 4, title: 'Deret TA', shortLabel: 'ta · chi · tsu · te · to', group: 'gojuuon', previewHiragana: 'た ち つ て と', previewKatakana: 'タ チ ツ テ ト' },
  { rowId: 'na', order: 5, title: 'Deret NA', shortLabel: 'na · ni · nu · ne · no', group: 'gojuuon', previewHiragana: 'な に ぬ ね の', previewKatakana: 'ナ ニ ヌ ネ ノ' },
  { rowId: 'ha', order: 6, title: 'Deret HA', shortLabel: 'ha · hi · fu · he · ho', group: 'gojuuon', previewHiragana: 'は ひ ふ へ ほ', previewKatakana: 'ハ ヒ フ ヘ ホ' },
  { rowId: 'ma', order: 7, title: 'Deret MA', shortLabel: 'ma · mi · mu · me · mo', group: 'gojuuon', previewHiragana: 'ま み む め も', previewKatakana: 'マ ミ ム メ モ' },
  { rowId: 'ya', order: 8, title: 'Deret YA', shortLabel: 'ya · yu · yo', group: 'gojuuon', previewHiragana: 'や ゆ よ', previewKatakana: 'ヤ ユ ヨ' },
  { rowId: 'ra', order: 9, title: 'Deret RA', shortLabel: 'ra · ri · ru · re · ro', group: 'gojuuon', previewHiragana: 'ら り る れ ろ', previewKatakana: 'ラ リ ル レ ロ' },
  { rowId: 'wa', order: 10, title: 'Deret WA & N', shortLabel: 'wa · wo · n', group: 'gojuuon', previewHiragana: 'わ を ん', previewKatakana: 'ワ ヲ ン' },
  { rowId: 'dakuon', order: 11, title: 'Dakuon & Handakuon (゛/ ゜)', shortLabel: 'ga · za · da · ba · pa', group: 'dakuon', previewHiragana: 'が ざ だ ば ぱ', previewKatakana: 'ガ ザ ダ バ パ' },
  { rowId: 'youon', order: 12, title: 'Youon (Gabungan ゃ・ゅ・ょ)', shortLabel: 'kya · sha · cha · nya · ja', group: 'youon', previewHiragana: 'きゃ しゃ ちゃ', previewKatakana: 'キャ シャ チャ' },
];

type RawKanaTuple = [
  string, // hira
  string, // kata
  string, // romaji
  string[], // accepted
  string, // rowId
  number, // rowOrder
  'gojuuon' | 'dakuon' | 'youon',
  string, // hiraMnemonic
  string, // kataMnemonic
  string[], // confusableRomaji
];

const RAW_KANA_DATA: RawKanaTuple[] = [
  // Row A
  ['あ', 'ア', 'a', ['a'], 'a', 1, 'gojuuon', 'Mirip huruf A dengan lengkungan bawah seperti apel', 'Sudut tajam mirip kapak (Axe)', ['o', 'me', 'nu']],
  ['い', 'イ', 'i', ['i'], 'a', 1, 'gojuuon', 'Dua garis vertikal berdampingan seperti dua huruf i', 'Sandaran tiang huruf I miring', ['ri', 'ko', 'te']],
  ['う', 'ウ', 'u', ['u'], 'a', 1, 'gojuuon', 'Lengkungannya menghadap kiri dengan titik di atas', 'Seperti atap rumah dengan tiang tengah', ['ra', 'wa', 'fu']],
  ['え', 'エ', 'e', ['e'], 'a', 1, 'gojuuon', 'Mirip burung eksotis sedang berlari', 'Persis bentuk balok besi huruf I kapital (Elevator)', ['n', 'so', 're']],
  ['お', 'オ', 'o', ['o'], 'a', 1, 'gojuuon', 'Mirip あ tetapi satu tiang dan ada titik di kanan', 'Garis silang dengan kaki miring ke kiri', ['a', 'su', 'mu']],

  // Row KA
  ['か', 'カ', 'ka', ['ka'], 'ka', 2, 'gojuuon', 'Bentuk sudut tajam ditambah satu goresan kanan', 'Sama seperti Hiragana か tanpa titik kanan', ['ki', 'ga', 'ya']],
  ['き', 'キ', 'ki', ['ki'], 'ka', 2, 'gojuuon', 'Bentuk kunci (Key) dengan dua palang horizontal', 'Dua garis horizontal dengan satu tiang miring', ['sa', 'chi', 'gi']],
  ['く', 'ク', 'ku', ['ku'], 'ka', 2, 'gojuuon', 'Paruh burung kukuk yang terbuka ke kiri (<)', 'Sudut atas tanpa garis tengah (bandingkan ケ)', ['ke', 'ta', 'he']],
  ['け', 'ケ', 'ke', ['ke'], 'ka', 2, 'gojuuon', 'Tiang kiri lengkung dan salib panjang di kanan', 'Mirip ク tetapi ada garis menembus ke bawah', ['ku', 'ni', 'ha']],
  ['こ', 'コ', 'ko', ['ko'], 'ka', 2, 'gojuuon', 'Dua garis horizontal atas dan bawah', 'Sudut kotak terbuka ke kiri', ['ni', 'yu', 'ro']],

  // Row SA
  ['さ', 'サ', 'sa', ['sa'], 'sa', 3, 'gojuuon', 'Satu palang horizontal, perut menghadap kiri (bandingkan ち)', 'Tiga tiang seperti pagar tanaman (Sawi)', ['chi', 'ki', 'za']],
  ['し', 'シ', 'shi', ['shi', 'si'], 'sa', 3, 'gojuuon', 'Kail pancing melengkung ke atas kanan', 'Tiga titik sejajar vertikal, ayun dari bawah ke atas', ['tsu', 'so', 'n']],
  ['す', 'ス', 'su', ['su'], 'sa', 3, 'gojuuon', 'Ada simpul melingkar di tengah yang turun ke bawah', 'Bentuk gantungan baju atau kaki berlari', ['mu', 'o', 'nu']],
  ['せ', 'セ', 'se', ['se'], 'sa', 3, 'gojuuon', 'Dua tiang yang dihubungkan garis horizontal', 'Sudut siku dengan kail di atas', ['sa', 'ya', 'te']],
  ['そ', 'ソ', 'so', ['so'], 'sa', 3, 'gojuuon', 'Zigzag Z di atas lalu melengkung C di bawah', 'Satu titik atas, goresan turun dari atas ke kiri bawah', ['n', 'shi', 'tsu']],

  // Row TA
  ['た', 'タ', 'ta', ['ta'], 'ta', 4, 'gojuuon', 'Bentuk t di kiri dan ко kecil di kanan', 'Mirip ク dengan satu titik pendek di tengah', ['ni', 'na', 'ku']],
  ['ち', 'チ', 'chi', ['chi', 'ti'], 'ta', 4, 'gojuuon', 'Mirip angka 5, perut melengkung ke kanan', 'Topi miring di atas dan tiang melengkung ke kiri', ['sa', 'ra', 'te']],
  ['つ', 'ツ', 'tsu', ['tsu', 'tu'], 'ta', 4, 'gojuuon', 'Gelombang besar tsunami melengkung ke kanan', 'Tiga titik sejajar horizontal di atas, turun ke kiri', ['shi', 'so', 'u']],
  ['て', 'テ', 'te', ['te'], 'ta', 4, 'gojuuon', 'Garis atas rata lalu melengkung seperti huruf T & C', 'Dua garis horizontal di atas dengan tiang melengkung', ['to', 'chi', 'so']],
  ['と', 'ト', 'to', ['to'], 'ta', 4, 'gojuuon', 'Duri miring masuk ke lingkaran bawah', 'Tiang lurus dengan cabang pendek ke kanan (Totem)', ['te', 'ko', 'do']],

  // Row NA
  ['な', 'ナ', 'na', ['na'], 'na', 5, 'gojuuon', 'Tanda tambah di kiri atas dan simpul ikan di bawah', 'Salib sederhana dengan kaki melengkung ke kiri', ['ta', 'ha', 'me']],
  ['に', 'ニ', 'ni', ['ni'], 'na', 5, 'gojuuon', 'Tiang kiri vertikal dengan dua garis ko di kanan', 'Dua garis horizontal sejajar (angka 2 = Ni)', ['ko', 'ta', 'ke']],
  ['ぬ', 'ヌ', 'nu', ['nu'], 'na', 5, 'gojuuon', 'Mirip め (me) tapi ada ekor melingkar (mie/noodle)', 'Sudut angka 7 yang disilang di tengah', ['me', 'ne', 'su']],
  ['ね', 'ネ', 'ne', ['ne'], 'na', 5, 'gojuuon', 'Tiang kiri lurus, bagian kanan melingkar di ujung (kucing neko)', 'Atap dengan tiang dan kaki bercabang', ['re', 'wa', 'nu']],
  ['の', 'ノ', 'no', ['no'], 'na', 5, 'gojuuon', 'Satu sapuan melingkar seperti rambu dilarang (No)', 'Satu garis miring dari kanan atas ke kiri bawah', ['me', 'nu', 'so']],

  // Row HA
  ['は', 'ハ', 'ha', ['ha', 'wa'], 'ha', 6, 'gojuuon', 'Tiang kiri lurus, kanan memiliki simpul bawah (partikel dibaca wa)', 'Dua garis miring membuka seperti atap tenda', ['ho', 'ma', 'na']],
  ['ひ', 'ヒ', 'hi', ['hi'], 'ha', 6, 'gojuuon', 'Senyum lebar atau kantung melengkung', 'Huruf L melengkung dengan garis tengah', ['bi', 'pi', 'te']],
  ['ふ', 'フ', 'fu', ['fu', 'hu'], 'ha', 6, 'gojuuon', 'Gunung Fuji dengan empat goresan lembut', 'Satu sudut lengkung sederhana seperti ujung paruh', ['wa', 'u', 'ra']],
  ['へ', 'ヘ', 'he', ['he', 'e'], 'ha', 6, 'gojuuon', 'Puncak bukit menanjak lalu turun (partikel arah dibaca e)', 'Identik dengan Hiragana へ', ['ku', 'ha', 'no']],
  ['ほ', 'ホ', 'ho', ['ho'], 'ha', 6, 'gojuuon', 'Mirip は tetapi ada dua garis horizontal di kanan atas', 'Salib pohon dengan dua titik di kiri dan kanan', ['ha', 'ma', 'mo']],

  // Row MA
  ['ま', 'マ', 'ma', ['ma'], 'ma', 7, 'gojuuon', 'Dua garis horizontal dan simpul di bawah', 'Sudut horizontal lalu miring berakhir di titik tengah', ['ha', 'ho', 'a']],
  ['み', 'ミ', 'mi', ['mi'], 'ma', 7, 'gojuuon', 'Mirip angka 21 yang digabung melengkung', 'Tiga garis miring sejajar (tiga = mittsu)', ['hi', 'ni', 'ra']],
  ['む', 'ム', 'mu', ['mu'], 'ma', 7, 'gojuuon', 'Simpul su yang berbelok ke kanan dengan titik', 'Bentuk segitiga terbuka dengan siku di bawah', ['su', 'ma', 'o']],
  ['め', 'メ', 'me', ['me'], 'ma', 7, 'gojuuon', 'Mirip ぬ tetapi TANPA ekor melingkar di ujung (mata = me)', 'Garis miring panjang disilang garis pendek (pedang)', ['nu', 'no', 'na']],
  ['も', 'モ', 'mo', ['mo'], 'ma', 7, 'gojuuon', 'Kail pancing し yang diberi dua garis horizontal', 'Dua garis horizontal ditembus kail L', ['ma', 'shi', 'ho']],

  // Row YA
  ['や', 'ヤ', 'ya', ['ya'], 'ya', 8, 'gojuuon', 'Lengkung kiri dengan tiang miring dan titik atas', 'Sama seperti Hiragana や tetapi bersudut tajam', ['ka', 'yu', 'ma']],
  ['ゆ', 'ユ', 'yu', ['yu'], 'ya', 8, 'gojuuon', 'Bentuk ikan melingkar ditembus satu tiang tengah', 'Kotak angka 1 yang duduk di atas garis dasar', ['ko', 'yo', 'nu']],
  ['よ', 'ヨ', 'yo', ['yo'], 'ya', 8, 'gojuuon', 'Satu tiang dengan cabang kecil kanan atas dan simpul bawah', 'Huruf E kapital yang menghadap ke kiri', ['ko', 'yu', 'ma']],

  // Row RA
  ['ら', 'ラ', 'ra', ['ra'], 'ra', 9, 'gojuuon', 'Titik di atas, lalu lengkungan mirip angka 5 tanpa topi lurus', 'Garis horizontal pendek di atas フ', ['chi', 'u', 'ro']],
  ['り', 'リ', 'ri', ['ri'], 'ra', 9, 'gojuuon', 'Dua goresan vertikal, yang kanan lebih panjang melengkung', 'Hampir identik dengan Hiragana り tetapi lebih tegas', ['i', 'ni', 'so']],
  ['る', 'ル', 'ru', ['ru'], 'ra', 9, 'gojuuon', 'Mirip angka 3 yang ujung bawahnya melingkar ke dalam', 'Dua kaki: kiri melengkung, kanan siku naik ke atas', ['ro', 're', 'so']],
  ['れ', 'レ', 're', ['re'], 'ra', 9, 'gojuuon', 'Tiang kiri, bagian kanan mencuat keluar di ujung kanan', 'Satu tiang lurus yang mencuat tajam ke kanan atas', ['ne', 'wa', 'ru']],
  ['ろ', 'ロ', 'ro', ['ro'], 'ra', 9, 'gojuuon', 'Mirip る (angka 3) tetapi TANPA simpul lingkaran di ujung', 'Bentuk persegi empat utuh seperti mulut', ['ru', 'ko', 'yo']],

  // Row WA & N
  ['わ', 'ワ', 'wa', ['wa'], 'wa', 10, 'gojuuon', 'Tiang kiri, perut kanan melengkung bulat ke dalam', 'Atap kotak di atas, turun melengkung ke kiri (tanpa titik ウ)', ['re', 'ne', 'u']],
  ['を', 'ヲ', 'wo', ['wo', 'o'], 'wa', 10, 'gojuuon', 'Partikel objek langsung: dibaca "o", diketik "wo"', 'Mirip ワ dengan garis tengah horizontal', ['o', 'to', 'wa']],
  ['ん', 'ン', 'n', ['n', 'nn'], 'wa', 10, 'gojuuon', 'Mirip huruf h miring atau huruf n kursif', 'Satu titik kiri, goresan mengayun dari bawah ke kanan atas', ['so', 'shi', 'e']],

  // Dakuon & Handakuon
  ['が', 'ガ', 'ga', ['ga'], 'dakuon', 11, 'dakuon', 'Huruf か + tanda kutip dua (dakuten)', 'Huruf カ + dakuten', ['ka', 'za', 'da']],
  ['ぎ', 'ギ', 'gi', ['gi'], 'dakuon', 11, 'dakuon', 'Huruf き + dakuten', 'Huruf キ + dakuten', ['ki', 'ji', 'bi']],
  ['ぐ', 'グ', 'gu', ['gu'], 'dakuon', 11, 'dakuon', 'Huruf く + dakuten', 'Huruf ク + dakuten', ['ku', 'zu', 'bu']],
  ['げ', 'ゲ', 'ge', ['ge'], 'dakuon', 11, 'dakuon', 'Huruf け + dakuten', 'Huruf ケ + dakuten', ['ke', 'ze', 'be']],
  ['ご', 'ゴ', 'go', ['go'], 'dakuon', 11, 'dakuon', 'Huruf こ + dakuten', 'Huruf コ + dakuten', ['ko', 'zo', 'bo']],
  ['ざ', 'ザ', 'za', ['za'], 'dakuon', 11, 'dakuon', 'Huruf さ + dakuten', 'Huruf サ + dakuten', ['sa', 'ga', 'da']],
  ['じ', 'ジ', 'ji', ['ji', 'zi'], 'dakuon', 11, 'dakuon', 'Huruf し + dakuten (dibaca ji)', 'Huruf シ + dakuten', ['shi', 'gi', 'zu']],
  ['ず', 'ズ', 'zu', ['zu'], 'dakuon', 11, 'dakuon', 'Huruf す + dakuten', 'Huruf ス + dakuten', ['su', 'gu', 'ji']],
  ['ぜ', 'ゼ', 'ze', ['ze'], 'dakuon', 11, 'dakuon', 'Huruf せ + dakuten', 'Huruf セ + dakuten', ['se', 'ge', 'de']],
  ['ぞ', 'ゾ', 'zo', ['zo'], 'dakuon', 11, 'dakuon', 'Huruf そ + dakuten', 'Huruf ソ + dakuten', ['so', 'go', 'do']],
  ['だ', 'ダ', 'da', ['da'], 'dakuon', 11, 'dakuon', 'Huruf た + dakuten', 'Huruf タ + dakuten', ['ta', 'ga', 'ba']],
  ['で', 'デ', 'de', ['de'], 'dakuon', 11, 'dakuon', 'Huruf て + dakuten', 'Huruf テ + dakuten', ['te', 'ze', 'be']],
  ['ど', 'ド', 'do', ['do'], 'dakuon', 11, 'dakuon', 'Huruf と + dakuten', 'Huruf ト + dakuten', ['to', 'go', 'bo']],
  ['ば', 'バ', 'ba', ['ba'], 'dakuon', 11, 'dakuon', 'Huruf は + dakuten (titik dua)', 'Huruf ハ + dakuten', ['pa', 'ha', 'ma']],
  ['び', 'ビ', 'bi', ['bi'], 'dakuon', 11, 'dakuon', 'Huruf ひ + dakuten', 'Huruf ヒ + dakuten', ['pi', 'hi', 'gi']],
  ['ぶ', 'ブ', 'bu', ['bu'], 'dakuon', 11, 'dakuon', 'Huruf ふ + dakuten', 'Huruf フ + dakuten', ['pu', 'fu', 'gu']],
  ['べ', 'ベ', 'be', ['be'], 'dakuon', 11, 'dakuon', 'Huruf へ + dakuten', 'Huruf ヘ + dakuten', ['pe', 'he', 'de']],
  ['ぼ', 'ボ', 'bo', ['bo'], 'dakuon', 11, 'dakuon', 'Huruf ほ + dakuten', 'Huruf ホ + dakuten', ['po', 'ho', 'go']],
  ['ぱ', 'パ', 'pa', ['pa'], 'dakuon', 11, 'dakuon', 'Huruf は + handakuten (bulatan kecil ゜)', 'Huruf ハ + handakuten (゜)', ['ba', 'ha', 'ta']],
  ['ぴ', 'ピ', 'pi', ['pi'], 'dakuon', 11, 'dakuon', 'Huruf ひ + handakuten (゜)', 'Huruf ヒ + handakuten (゜)', ['bi', 'hi', 'ki']],
  ['ぷ', 'プ', 'pu', ['pu'], 'dakuon', 11, 'dakuon', 'Huruf ふ + handakuten (゜)', 'Huruf フ + handakuten (゜)', ['bu', 'fu', 'ku']],
  ['ぺ', 'ペ', 'pe', ['pe'], 'dakuon', 11, 'dakuon', 'Huruf へ + handakuten (゜)', 'Huruf ヘ + handakuten (゜)', ['be', 'he', 'te']],
  ['ぽ', 'ポ', 'po', ['po'], 'dakuon', 11, 'dakuon', 'Huruf ほ + handakuten (゜)', 'Huruf ホ + handakuten (゜)', ['bo', 'ho', 'to']],

  // Youon
  ['きゃ', 'キャ', 'kya', ['kya'], 'youon', 12, 'youon', 'Gabungan き + ゃ kecil (1 ketukan kya, bukan kiya)', 'Gabungan キ + ャ kecil', ['kiya', 'kye', 'sha']],
  ['きゅ', 'キュ', 'kyu', ['kyu'], 'youon', 12, 'youon', 'Gabungan き + ゅ kecil', 'Gabungan キ + ュ kecil', ['kiyu', 'kyo', 'shu']],
  ['きょ', 'キョ', 'kyo', ['kyo'], 'youon', 12, 'youon', 'Gabungan き + ょ kecil', 'Gabungan キ + ョ kecil', ['kiyo', 'kyu', 'sho']],
  ['しゃ', 'シャ', 'sha', ['sha', 'sya'], 'youon', 12, 'youon', 'Gabungan し + ゃ kecil', 'Gabungan シ + ャ kecil', ['shiya', 'cha', 'ja']],
  ['しゅ', 'シュ', 'shu', ['shu', 'syu'], 'youon', 12, 'youon', 'Gabungan し + ゅ kecil', 'Gabungan シ + ュ kecil', ['shiyu', 'chu', 'ju']],
  ['しょ', 'ショ', 'sho', ['sho', 'syo'], 'youon', 12, 'youon', 'Gabungan し + ょ kecil', 'Gabungan シ + ョ kecil', ['shiyo', 'cho', 'jo']],
  ['ちゃ', 'チャ', 'cha', ['cha', 'tya'], 'youon', 12, 'youon', 'Gabungan ち + ゃ kecil', 'Gabungan チ + ャ kecil', ['chiya', 'sha', 'kya']],
  ['ちゅ', 'チュ', 'chu', ['chu', 'tyu'], 'youon', 12, 'youon', 'Gabungan ち + ゅ kecil', 'Gabungan チ + ュ kecil', ['chiyu', 'shu', 'kyu']],
  ['ちょ', 'チョ', 'cho', ['cho', 'tyo'], 'youon', 12, 'youon', 'Gabungan ち + ょ kecil', 'Gabungan チ + ョ kecil', ['chiyo', 'sho', 'kyo']],
  ['にゃ', 'ニャ', 'nya', ['nya'], 'youon', 12, 'youon', 'Gabungan に + ゃ kecil', 'Gabungan ニ + ャ kecil', ['niya', 'mya', 'hya']],
  ['にゅ', 'ニュ', 'nyu', ['nyu'], 'youon', 12, 'youon', 'Gabungan に + ゅ kecil', 'Gabungan ニ + ュ kecil', ['niyu', 'myu', 'hyu']],
  ['にょ', 'ニョ', 'nyo', ['nyo'], 'youon', 12, 'youon', 'Gabungan に + ょ kecil', 'Gabungan ニ + ョ kecil', ['niyo', 'myo', 'hyo']],
  ['ひゃ', 'ヒャ', 'hya', ['hya'], 'youon', 12, 'youon', 'Gabungan ひ + ゃ kecil', 'Gabungan ヒ + ャ kecil', ['hiya', 'bya', 'pya']],
  ['ひゅ', 'ヒュ', 'hyu', ['hyu'], 'youon', 12, 'youon', 'Gabungan ひ + ゅ kecil', 'Gabungan ヒ + ュ kecil', ['hiyu', 'byu', 'pyu']],
  ['ひょ', 'ヒョ', 'hyo', ['hyo'], 'youon', 12, 'youon', 'Gabungan ひ + ょ kecil', 'Gabungan ヒ + ョ kecil', ['hiyo', 'byo', 'pyo']],
  ['びゃ', 'ビャ', 'bya', ['bya'], 'youon', 12, 'youon', 'Gabungan び + ゃ kecil', 'Gabungan ビ + ャ kecil', ['biya', 'pya', 'hya']],
  ['びゅ', 'ビュ', 'byu', ['byu'], 'youon', 12, 'youon', 'Gabungan び + ゅ kecil', 'Gabungan ビ + ュ kecil', ['biyu', 'pyu', 'hyu']],
  ['びょ', 'ビョ', 'byo', ['byo'], 'youon', 12, 'youon', 'Gabungan び + ょ kecil (contoh: びょういん byouin)', 'Gabungan ビ + ョ kecil', ['biyo', 'pyo', 'hyo']],
  ['ぴゃ', 'ピャ', 'pya', ['pya'], 'youon', 12, 'youon', 'Gabungan ぴ + ゃ kecil', 'Gabungan ピ + ャ kecil', ['piya', 'bya', 'hya']],
  ['ぴゅ', 'ピュ', 'pyu', ['pyu'], 'youon', 12, 'youon', 'Gabungan ぴ + ゅ kecil', 'Gabungan ピ + ュ kecil', ['piyu', 'byu', 'hyu']],
  ['ぴょ', 'ピョ', 'pyo', ['pyo'], 'youon', 12, 'youon', 'Gabungan ぴ + ょ kecil', 'Gabungan ピ + ョ kecil', ['piyo', 'byo', 'hyo']],
  ['じゃ', 'ジャ', 'ja', ['ja', 'jya', 'zya'], 'youon', 12, 'youon', 'Gabungan じ + ゃ kecil', 'Gabungan ジ + ャ kecil', ['jiya', 'sha', 'cha']],
  ['じゅ', 'ジュ', 'ju', ['ju', 'jyu', 'zyu'], 'youon', 12, 'youon', 'Gabungan じ + ゅ kecil', 'Gabungan ジ + ュ kecil', ['jiyu', 'shu', 'chu']],
  ['じょ', 'ジョ', 'jo', ['jo', 'jyo', 'zyo'], 'youon', 12, 'youon', 'Gabungan じ + ょ kecil', 'Gabungan ジ + ョ kecil', ['jiyo', 'sho', 'cho']],
];

export const ALL_KANA_ITEMS: KanaItem[] = RAW_KANA_DATA.flatMap(([hira, kata, romaji, accepted, rowId, rowOrder, group, hiraMnem, kataMnem, confRomaji]) => {
  const rowMeta = KANA_ROWS.find((r) => r.rowId === rowId)!;
  return [
    {
      id: `hira_${romaji}`,
      kana: hira,
      romaji,
      acceptedRomaji: accepted,
      script: 'hiragana' as const,
      group,
      rowId,
      rowOrder,
      rowLabel: rowMeta.title,
      mnemonic: hiraMnem,
      confusableKana: [],
      confusableRomaji: confRomaji,
    },
    {
      id: `kata_${romaji}`,
      kana: kata,
      romaji,
      acceptedRomaji: accepted,
      script: 'katakana' as const,
      group,
      rowId,
      rowOrder,
      rowLabel: rowMeta.title,
      mnemonic: kataMnem,
      confusableKana: [],
      confusableRomaji: confRomaji,
    },
  ];
});

export interface MoraComparisonPair {
  id: string;
  category: 'sokuon' | 'chouon' | 'youon';
  title: string;
  shortWord: {
    kana: string;
    romaji: string;
    meaning: string;
    moraBeats: string[];
  };
  modifiedWord: {
    kana: string;
    romaji: string;
    meaning: string;
    moraBeats: string[];
  };
  senseiNote: string;
}

export const MORA_COMPARISON_PAIRS: MoraComparisonPair[] = [
  {
    id: 'kitte_kite',
    category: 'sokuon',
    title: 'Jeda Konsonan Ganda (Sokuon っ)',
    shortWord: {
      kana: 'きて',
      romaji: 'kite',
      meaning: 'Datanglah / Pakailah (2 Ketuk)',
      moraBeats: ['き (ki)', 'て (te)'],
    },
    modifiedWord: {
      kana: 'きって',
      romaji: 'kitte',
      meaning: 'Perangko (3 Ketuk — tahan 1 ketuk di っ)',
      moraBeats: ['き (ki)', 'っ [Tahan]', 'て (te)'],
    },
    senseiNote: 'Saat bertemu っ kecil, tahan napas selama 1 ketukan penuh sebelum mengucapkan konsonan berikutnya (t -> tt).',
  },
  {
    id: 'oto_otto',
    category: 'sokuon',
    title: 'Sokuon pada Kata Keluarga',
    shortWord: {
      kana: 'おと',
      romaji: 'oto',
      meaning: 'Suara / Bunyi (2 Ketuk)',
      moraBeats: ['お (o)', 'と (to)'],
    },
    modifiedWord: {
      kana: 'おっと',
      romaji: 'otto',
      meaning: 'Suami sendiri (3 Ketuk)',
      moraBeats: ['お (o)', 'っ [Tahan]', 'と (to)'],
    },
    senseiNote: 'Tanpa jeda 1 ketukan pada っ, kata "suami" (otto) akan terdengar sebagai "suara" (oto).',
  },
  {
    id: 'ojisan_ojiisan',
    category: 'chouon',
    title: 'Chouon Vokal Panjang I (い)',
    shortWord: {
      kana: 'おじさん',
      romaji: 'ojisan',
      meaning: 'Paman (4 Ketuk)',
      moraBeats: ['お (o)', 'じ (ji)', 'さ (sa)', 'ん (n)'],
    },
    modifiedWord: {
      kana: 'おじいさん',
      romaji: 'ojiisan',
      meaning: 'Kakek (5 Ketuk — panjangkan ji-i)',
      moraBeats: ['お (o)', 'じ (ji)', 'い (i)', 'さ (sa)', 'ん (n)'],
    },
    senseiNote: 'Kesalahan klasik pemula: memanggil paman dengan vokal panjang sehingga artinya berubah menjadi kakek.',
  },
  {
    id: 'obasan_obaasan',
    category: 'chouon',
    title: 'Chouon Vokal Panjang A (あ)',
    shortWord: {
      kana: 'おばさん',
      romaji: 'obasan',
      meaning: 'Bibi / Tante (4 Ketuk)',
      moraBeats: ['お (o)', 'ば (ba)', 'さ (sa)', 'ん (n)'],
    },
    modifiedWord: {
      kana: 'おばあさん',
      romaji: 'obaasan',
      meaning: 'Nenek (5 Ketuk — panjangkan ba-a)',
      moraBeats: ['お (o)', 'ば (ba)', 'あ (a)', 'さ (sa)', 'ん (n)'],
    },
    senseiNote: 'Ayunkan vokal あ selama 2 ketukan penuh untuk membedakan Nenek (obaasan) dari Bibi (obasan).',
  },
  {
    id: 'koko_koukou',
    category: 'chouon',
    title: 'Chouon Vokal Panjang O + U (おう)',
    shortWord: {
      kana: 'ここ',
      romaji: 'koko',
      meaning: 'Di sini (2 Ketuk)',
      moraBeats: ['こ (ko)', 'こ (ko)'],
    },
    modifiedWord: {
      kana: 'こうこう',
      romaji: 'koukou',
      meaning: 'SMA (4 Ketuk — ko-u-ko-u)',
      moraBeats: ['こ (ko)', 'う (u)', 'こ (ko)', 'う (u)'],
    },
    senseiNote: 'Dalam Hiragana, vokal panjang O umumnya ditulis dengan menambahkan huruf う (u) di belakangnya.',
  },
  {
    id: 'biru_biiru',
    category: 'chouon',
    title: 'Chouon Garis Panjang Katakana (ー)',
    shortWord: {
      kana: 'ビル',
      romaji: 'biru',
      meaning: 'Gedung Bertingkat (2 Ketuk)',
      moraBeats: ['ビ (bi)', 'ル (ru)'],
    },
    modifiedWord: {
      kana: 'ビール',
      romaji: 'biiru',
      meaning: 'Minuman Bir (3 Ketuk — bi-i-ru)',
      moraBeats: ['ビ (bi)', 'ー [Panjang]', 'ル (ru)'],
    },
    senseiNote: 'Dalam Katakana, semua vokal panjang ditulis menggunakan tanda garis panjang ー (Chouonpu) selama 1 ketukan ekstra.',
  },
  {
    id: 'biyouin_byouin',
    category: 'youon',
    title: 'Youon (ょ kecil) vs Huruf Biasa (よ besar)',
    shortWord: {
      kana: 'びよういん',
      romaji: 'biyouin',
      meaning: 'Salon Kecantikan (5 Ketuk: bi-yo-u-i-n)',
      moraBeats: ['び (bi)', 'よ (yo)', 'う (u)', 'い (i)', 'ん (n)'],
    },
    modifiedWord: {
      kana: 'びょういん',
      romaji: 'byouin',
      meaning: 'Rumah Sakit (4 Ketuk: byo-u-i-n)',
      moraBeats: ['びょ (byo)', 'う (u)', 'い (i)', 'ん (n)'],
    },
    senseiNote: 'Soal langganan JLPT N5/JFT: びょ (byo) dengan ょ kecil melebur menjadi 1 ketukan (Rumah Sakit).',
  },
];

export interface VisualTrapPair {
  id: string;
  title: string;
  items: Array<{
    kana: string;
    romaji: string;
    script: 'Hiragana' | 'Katakana';
    visualCue: string;
    exampleWord: string;
  }>;
}

export const VISUAL_TRAP_PAIRS: VisualTrapPair[] = [
  {
    id: 'shi_tsu',
    title: 'シ (shi) vs ツ (tsu) — Jebakan Arah Titik Katakana',
    items: [
      {
        kana: 'シ',
        romaji: 'shi',
        script: 'Katakana',
        visualCue: '2 titik berjejer VERTIKAL (kiri), goresan panjang mengayun dari BAWAH ke kanan atas (sama arah dengan し).',
        exampleWord: 'シャツ (shatsu - kemeja)',
      },
      {
        kana: 'ツ',
        romaji: 'tsu',
        script: 'Katakana',
        visualCue: '2 titik berjejer HORIZONTAL (atas), goresan panjang turun dari ATAS ke kiri bawah (sama arah dengan つ).',
        exampleWord: 'ツアー (tsuaa - tur)',
      },
    ],
  },
  {
    id: 'so_n',
    title: 'ソ (so) vs ン (n) — Jebakan Sudut Kemiringan',
    items: [
      {
        kana: 'ソ',
        romaji: 'so',
        script: 'Katakana',
        visualCue: 'Titik di atas tegak, goresan utama turun dari ATAS ke kiri bawah (searah dengan ツ).',
        exampleWord: 'パソコン (pasokon - PC)',
      },
      {
        kana: 'ン',
        romaji: 'n',
        script: 'Katakana',
        visualCue: 'Titik di kiri miring datar, goresan utama naik dari BAWAH ke kanan atas (searah dengan シ).',
        exampleWord: 'インドネシア (Indoneshia)',
      },
    ],
  },
  {
    id: 'sa_chi',
    title: 'さ (sa) vs ち (chi) — Arah Perut Lengkungan',
    items: [
      {
        kana: 'さ',
        romaji: 'sa',
        script: 'Hiragana',
        visualCue: 'Tiang miring ke kanan, perut bawah membuka ke KIRI.',
        exampleWord: 'さくら (sakura)',
      },
      {
        kana: 'ち',
        romaji: 'chi',
        script: 'Hiragana',
        visualCue: 'Mirip angka 5, perut bawah melengkung ke KANAN.',
        exampleWord: 'ちかてつ (chikatetsu - MRT)',
      },
    ],
  },
  {
    id: 're_ne_wa',
    title: 'れ (re) vs ね (ne) vs わ (wa) — Ekor Kanan Hiragana',
    items: [
      {
        kana: 'わ',
        romaji: 'wa',
        script: 'Hiragana',
        visualCue: 'Melengkung mulus masuk ke dalam tanpa simpul atau mencuat.',
        exampleWord: 'わたし (watashi - saya)',
      },
      {
        kana: 'れ',
        romaji: 're',
        script: 'Hiragana',
        visualCue: 'Ujung kanan bawah mencuat keluar ke kanan.',
        exampleWord: 'これ (kore - ini)',
      },
      {
        kana: 'ね',
        romaji: 'ne',
        script: 'Hiragana',
        visualCue: 'Ujung kanan bawah memiliki simpul melingkar seperti ekor kucing (neko).',
        exampleWord: 'ねこ (neko - kucing)',
      },
    ],
  },
  {
    id: 'ru_ro',
    title: 'る (ru) vs ろ (ro) — Simpul Ujung Bawah',
    items: [
      {
        kana: 'る',
        romaji: 'ru',
        script: 'Hiragana',
        visualCue: 'Memiliki lingkaran/simpul di bagian ujung bawah.',
        exampleWord: 'くるま (kuruma - mobil)',
      },
      {
        kana: 'ろ',
        romaji: 'ro',
        script: 'Hiragana',
        visualCue: 'Polos seperti angka 3 tanpa simpul di ujung bawah.',
        exampleWord: 'ろく (roku - enam)',
      },
    ],
  },
  {
    id: 'ku_ke_a_ma',
    title: 'ク (ku) vs ケ (ke) & ア (a) vs マ (ma)',
    items: [
      {
        kana: 'ク / ケ',
        romaji: 'ku / ke',
        script: 'Katakana',
        visualCue: 'ク (ku) tidak punya garis tembus atas; ケ (ke) memiliki garis horizontal yang menembus keluar.',
        exampleWord: 'クラス (kurasu) vs ケーキ (keeki)',
      },
      {
        kana: 'ア / マ',
        romaji: 'a / ma',
        script: 'Katakana',
        visualCue: 'ア (a) kakinya turun panjang melengkung ke kiri; マ (ma) berhenti di titik pendek tengah.',
        exampleWord: 'アメリカ (Amerika) vs マイク (maiku)',
      },
    ],
  },
];

export interface WordToken {
  kana: string;
  romaji: string;
  meaning: string;
  grammarRole?: string;
}

export interface MnnSentenceStudy {
  id: string;
  chapter: string;
  indonesian: string;
  japaneseKana: string;
  romajiFull: string;
  tokens: WordToken[];
  grammarTitle: string;
  grammarSummary: string;
}

export const MNN_STUDY_SENTENCES: MnnSentenceStudy[] = [
  {
    id: 'mnn_kelvin',
    chapter: 'Bab 1 · Perkenalan Diri',
    indonesian: 'Nama saya adalah Kelvin.',
    japaneseKana: 'わたし の なまえ は ケルビン です。',
    romajiFull: 'Watashi no namae wa Kerubin desu.',
    tokens: [
      { kana: 'わたし', romaji: 'watashi', meaning: 'saya', grammarRole: 'Kata Ganti' },
      { kana: 'の', romaji: 'no', meaning: 'milik / kepemilikan', grammarRole: 'Partikel Kepemilikan' },
      { kana: 'なまえ', romaji: 'namae', meaning: 'nama', grammarRole: 'Kata Benda (Subjek)' },
      { kana: 'は', romaji: 'wa', meaning: 'penanda topik kalimat', grammarRole: 'Partikel Topik (ditulis は, dibaca wa)' },
      { kana: 'ケルビン', romaji: 'Kerubin', meaning: 'Kelvin (nama asing pakai Katakana)', grammarRole: 'Kata Benda' },
      { kana: 'です', romaji: 'desu', meaning: 'kopula sopan positif', grammarRole: 'Kopula' },
    ],
    grammarTitle: 'Pola N1 の N2 は N3 です',
    grammarSummary: 'Partikel の (no) menghubungkan dua kata benda (わたし の なまえ = nama milik saya). Partikel は (dibaca wa) menandai topik kalimat, dan です menutup kalimat positif secara sopan.',
  },
  {
    id: 'mnn_kenshuusei',
    chapter: 'Bab 1 · Asal Negara & Status',
    indonesian: 'Saya berasal dari Indonesia. Saya adalah pemagang (kenshuusei).',
    japaneseKana: 'わたし は インドネシア から きました。けんしゅうせい です。',
    romajiFull: 'Watashi wa Indoneshia kara kimashita. Kenshuusei desu.',
    tokens: [
      { kana: 'わたし', romaji: 'watashi', meaning: 'saya', grammarRole: 'Subjek' },
      { kana: 'は', romaji: 'wa', meaning: 'topik kalimat', grammarRole: 'Partikel Topik' },
      { kana: 'インドネシア', romaji: 'Indoneshia', meaning: 'Indonesia', grammarRole: 'Kata Benda Negara (Katakana)' },
      { kana: 'から', romaji: 'kara', meaning: 'dari (asal)', grammarRole: 'Partikel Asal' },
      { kana: 'きました', romaji: 'kimashita', meaning: 'telah datang', grammarRole: 'Kata Kerja Lampau' },
      { kana: 'けんしゅうせい', romaji: 'kenshuusei', meaning: 'pemagang / trainee', grammarRole: 'Profesi (Youon + Chouon)' },
      { kana: 'です', romaji: 'desu', meaning: 'kopula sopan', grammarRole: 'Kopula' },
    ],
    grammarTitle: '[Negara] から きました (Datang dari...)',
    grammarSummary: 'Partikel から (kara) berarti "dari" (titik asal). Digabung dengan きました (kimashita) untuk menyatakan negara asal saat perkenalan diri (Jikoshoukai).',
  },
  {
    id: 'mnn_engineer_neg',
    chapter: 'Bab 1 · Kalimat Negatif',
    indonesian: 'Saudara Yamada bukan seorang dokter, melainkan insinyur.',
    japaneseKana: 'やまださん は いしゃ じゃ ありません。エンジニア です。',
    romajiFull: 'Yamada-san wa isha ja arimasen. Enjinia desu.',
    tokens: [
      { kana: 'やまださん', romaji: 'Yamada-san', meaning: 'Sdr. Yamada', grammarRole: 'Topik' },
      { kana: 'は', romaji: 'wa', meaning: 'penanda topik', grammarRole: 'Partikel Topik' },
      { kana: 'いしゃ', romaji: 'isha', meaning: 'dokter', grammarRole: 'Kata Benda (Youon しゃ)' },
      { kana: 'じゃ ありません', romaji: 'ja arimasen', meaning: 'bukan (negatif sopan)', grammarRole: 'Kopula Negatif' },
      { kana: 'エンジニア', romaji: 'enjinia', meaning: 'insinyur / engineer', grammarRole: 'Kata Serapan (Katakana)' },
      { kana: 'です', romaji: 'desu', meaning: 'adalah (positif)', grammarRole: 'Kopula' },
    ],
    grammarTitle: 'N1 は N2 じゃ ありません (atau では ありません)',
    grammarSummary: 'じゃ ありません (ja arimasen) adalah bentuk negatif dari です untuk menyangkal kata benda ("bukan..."). Jangan gunakan ます untuk menyangkal kata benda.',
  },
  {
    id: 'mnn_kore_wa',
    chapter: 'Bab 2 · Benda & Kepemilikan',
    indonesian: 'Apakah ini adalah buku catatan milik Sensei?',
    japaneseKana: 'これ は せんせい の ノート ですか。',
    romajiFull: 'Kore wa sensei no nooto desu ka.',
    tokens: [
      { kana: 'これ', romaji: 'kore', meaning: 'benda ini (dekat pembicara)', grammarRole: 'Kata Tunjuk Benda' },
      { kana: 'は', romaji: 'wa', meaning: 'topik kalimat', grammarRole: 'Partikel Topik' },
      { kana: 'せんせい', romaji: 'sensei', meaning: 'guru / sensei', grammarRole: 'Pemilik (Chouon えい)' },
      { kana: 'の', romaji: 'no', meaning: 'milik', grammarRole: 'Partikel Kepemilikan' },
      { kana: 'ノート', romaji: 'nooto', meaning: 'buku catatan (note)', grammarRole: 'Kata Benda (Chouon ー)' },
      { kana: 'ですか', romaji: 'desu ka', meaning: 'apakah...?', grammarRole: 'Kopula + Partikel Tanya か' },
    ],
    grammarTitle: 'これ / それ / あれ + Partikel Tanya か',
    grammarSummary: 'これ (ini, dekat pembicara), それ (itu, dekat lawan bicara), あれ (itu, jauh dari keduanya). Partikel か di akhir kalimat mengubah pernyataan menjadi kalimat tanya tanpa mengubah urutan kata.',
  },
  {
    id: 'mnn_byouin_doko',
    chapter: 'Bab 3 · Lokasi & Tempat',
    indonesian: 'Rumah sakit ada di sebelah mana?',
    japaneseKana: 'びょういん は どこ ですか。',
    romajiFull: 'Byouin wa doko desu ka.',
    tokens: [
      { kana: 'びょういん', romaji: 'byouin', meaning: 'rumah sakit', grammarRole: 'Subjek Tempat (Youon びょ + Chouon う)' },
      { kana: 'は', romaji: 'wa', meaning: 'topik kalimat', grammarRole: 'Partikel Topik' },
      { kana: 'どこ', romaji: 'doko', meaning: 'di mana', grammarRole: 'Kata Tanya Tempat' },
      { kana: 'ですか', romaji: 'desu ka', meaning: 'apakah berada?', grammarRole: 'Kopula Tanya' },
    ],
    grammarTitle: '[Tempat] は どこ ですか (Menanyakan Lokasi)',
    grammarSummary: 'Perhatikan ejaan びょういん (byouin = Rumah Sakit, ょ kecil) vs びよういん (biyouin = Salon Kecantikan, よ besar). Kata tanya どこ (doko) diletakkan sebelum ですか.',
  },
  {
    id: 'mnn_chikatetsu_ikimasu',
    chapter: 'Bab 5 · Pergerakan & Transportasi',
    indonesian: 'Setiap hari saya pergi ke pabrik menggunakan kereta bawah tanah.',
    japaneseKana: 'まいにち ちかてつ で こうじょう へ いきます。',
    romajiFull: 'Mainichi chikatetsu de koujou e ikimasu.',
    tokens: [
      { kana: 'まいにち', romaji: 'mainichi', meaning: 'setiap hari', grammarRole: 'Keterangan Waktu' },
      { kana: 'ちかてつ', romaji: 'chikatetsu', meaning: 'kereta bawah tanah (MRT)', grammarRole: 'Alat Transportasi' },
      { kana: 'で', romaji: 'de', meaning: 'dengan / menggunakan', grammarRole: 'Partikel Alat/Cara' },
      { kana: 'こうじょう', romaji: 'koujou', meaning: 'pabrik', grammarRole: 'Tujuan (Chouon + Youon)' },
      { kana: 'へ', romaji: 'e', meaning: 'ke (arah tujuan)', grammarRole: 'Partikel Arah (ditulis へ, dibaca e)' },
      { kana: 'いきます', romaji: 'ikimasu', meaning: 'pergi', grammarRole: 'Kata Kerja الحركة' },
    ],
    grammarTitle: '[Transportasi] で [Tujuan] へ いきます',
    grammarSummary: 'Partikel で (de) menandai kendaraan/alat yang digunakan. Partikel へ (ditulis へ, wajib dibaca "e") menandai arah tujuan sebelum kata kerja pergi (いきます), datang (きます), atau pulang (かえります).',
  },
];
