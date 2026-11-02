import { ALL_KANA_ITEMS, WordToken } from './kanaData';
import { fisherYatesShuffle } from '../utils/shuffle';

export type QuestionCategory = 'hiragana' | 'katakana' | 'modifikasi' | 'kalimat';
export type QuestionLevel = 1 | 2 | 3 | 4 | 5;
export type QuestionSubType =
  | 'kana_recognition'
  | 'vocab_reading'
  | 'sentence_translation'
  | 'spelling_trap'
  | 'dokkai_micro';

export interface QuestionOption {
  id: string;
  text: string;
  romajiHelper?: string; // Shown in Level 1-3, automatically hidden in High Level (4-5)
  diagnosticReason?: string; // Explains why this option is right or wrong (e.g., "Salah partikel", "Salah huruf Katakana ケ vs ク")
}

export interface SimulatorQuestion {
  id: string;
  level: 1 | 2 | 3 | 4;
  category: QuestionCategory;
  subType: QuestionSubType;
  promptInstruction: string;
  stimulusJapanese: string; // Large Japanese Kana / Sentence or Indonesian target
  stimulusRomaji?: string; // Hidden when high-level / no-romaji mode is active
  audioText?: string; // Text to play via ja-JP Web Speech API
  options: QuestionOption[]; // 4 smart distractors (shuffled via Fisher-Yates when test starts)
  correctOptionId: string;
  acceptedEssayAnswers: string[]; // Accepted strings when answered in Essay / Active Recall mode
  essayPlaceholder: string;
  explanation: string;
  grammarStructure?: string; // Concise grammar rule explanation for sentence/context questions
  wordBreakdown?: WordToken[]; // Word-by-word Kana + Romaji + Indonesian breakdown
}

// Curated High-Precision Question Pool (Modifikasi, Kosakata MNN, Kalimat Kontekstual, & Dokkai Mikro)
const CURATED_QUESTIONS: SimulatorQuestion[] = [
  // ==========================================
  // TIPE 2: TERJEMAHAN KALIMAT NYATA (GAYA JLPT/JFT)
  // ==========================================
  {
    id: 'q_sentence_kelvin',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Nama saya adalah Kelvin",
    stimulusRomaji: "Watashi no namae wa Kerubin desu",
    audioText: 'わたしのなまえはケルビンです',
    options: [
      {
        id: 'opt_a',
        text: 'わたし の なまえ は ケルビン です',
        romajiHelper: 'watashi no namae wa Kerubin desu',
        diagnosticReason: 'Benar — Kepemilikan の (no) dan partikel topik は (wa) tepat.',
      },
      {
        id: 'opt_b',
        text: 'わたし は なまえ の ケルビン です',
        romajiHelper: 'watashi wa namae no Kerubin desu',
        diagnosticReason: 'Salah partikel — Posisi は (wa) dan の (no) terbalik.',
      },
      {
        id: 'opt_c',
        text: 'わたし の なまえ は クルビン です',
        romajiHelper: 'watashi no namae wa Kurubin desu',
        diagnosticReason: 'Salah huruf Katakana — Tertukar antara ケ (ke) dan ク (ku).',
      },
      {
        id: 'opt_d',
        text: 'わたくし を なまえ は ケルビン ます',
        romajiHelper: 'watakushi wo namae wa Kerubin masu',
        diagnosticReason: 'Salah tata bahasa — Partikel objek を dan akhiran kerja ます tidak dipakai untuk nomina.',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'watashi no namae wa kerubin desu',
      'watashi no namae wa kelvin desu',
      'わたしのなまえはケルビンです',
      'わたし の なまえ は ケルビン です',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'Susunan kepemilikan subjek menggunakan [わたし の なまえ = nama saya], diikuti partikel topik [は (dibaca wa)], nama asing dalam Katakana [ケルビン (Kerubin)], dan ditutup kopula sopan [です].',
    grammarStructure: 'Pola: [Pemilik] の [ Kata Benda ] は [ Predikat Nomina ] です。 Partikel の menghubungkan dua kata benda (saya -> nama), sedangkan は menandai topik utama kalimat.',
    wordBreakdown: [
      { kana: 'わたし', romaji: 'watashi', meaning: 'saya', grammarRole: 'Kata Ganti' },
      { kana: 'の', romaji: 'no', meaning: 'milik (kepemilikan)', grammarRole: 'Partikel の' },
      { kana: 'なまえ', romaji: 'namae', meaning: 'nama', grammarRole: 'Kata Benda' },
      { kana: 'は', romaji: 'wa', meaning: 'adalah (penanda topik)', grammarRole: 'Partikel Topik は' },
      { kana: 'ケルビン', romaji: 'Kerubin', meaning: 'Kelvin', grammarRole: 'Nama Diri (Katakana)' },
      { kana: 'です', romaji: 'desu', meaning: 'kopula sopan positif', grammarRole: 'Kopula' },
    ],
  },
  {
    id: 'q_sentence_indonesia_kara',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Saya datang dari Indonesia",
    stimulusRomaji: "Watashi wa Indoneshia kara kimashita",
    audioText: 'わたしはインドネシアからきました',
    options: [
      {
        id: 'opt_a',
        text: 'わたし は インドネシア から きました',
        romajiHelper: 'watashi wa Indoneshia kara kimashita',
        diagnosticReason: 'Benar — Partikel asal から (dari) + きました (datang) tepat.',
      },
      {
        id: 'opt_b',
        text: 'わたし は インドネツア から きました',
        romajiHelper: 'watashi wa Indonetsua kara kimashita',
        diagnosticReason: 'Salah huruf Katakana — Tertukar シ (shi) dengan ツ (tsu).',
      },
      {
        id: 'opt_c',
        text: 'わたし の インドネシア まで きました',
        romajiHelper: 'watashi no Indoneshia made kimashita',
        diagnosticReason: 'Salah partikel — まで berarti "sampai", bukan "dari" (から).',
      },
      {
        id: 'opt_d',
        text: 'わたし は イソドネシア から きます',
        romajiHelper: 'watashi wa Isodoneshia kara kimasu',
        diagnosticReason: 'Salah huruf Katakana — Tertukar ン (n) dengan ソ (so).',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'watashi wa indoneshia kara kimashita',
      'watashi wa indonesia kara kimashita',
      'わたしはインドネシアからきました',
      'わたし は インドネシア から きました',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'Untuk menyatakan negara asal dalam Jikoshoukai, gunakan [Negara + から (dari) + きました (telah datang)]. Perhatikan penulisan インドネシア menggunakan ン (n) dan シ (shi).',
    grammarStructure: 'Pola: [Subjek] は [Negara Asal] から きました。 Partikel から menunjukkan titik awal/asal, dan きました adalah bentuk lampau sopan dari きます (datang).',
    wordBreakdown: [
      { kana: 'わたし', romaji: 'watashi', meaning: 'saya', grammarRole: 'Subjek' },
      { kana: 'は', romaji: 'wa', meaning: 'penanda topik', grammarRole: 'Partikel は' },
      { kana: 'インドネシア', romaji: 'Indoneshia', meaning: 'Indonesia', grammarRole: 'Kata Benda Negara' },
      { kana: 'から', romaji: 'kara', meaning: 'dari', grammarRole: 'Partikel Asal' },
      { kana: 'きました', romaji: 'kimashita', meaning: 'telah datang', grammarRole: 'Kata Kerja Lampau' },
    ],
  },
  {
    id: 'q_sentence_not_doctor',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Saudara Tanaka bukan seorang dokter",
    stimulusRomaji: "Tanaka-san wa isha ja arimasen",
    audioText: 'たなかさんはいしゃじゃありません',
    options: [
      {
        id: 'opt_a',
        text: 'たなかさん は いしゃ じゃ ありません',
        romajiHelper: 'Tanaka-san wa isha ja arimasen',
        diagnosticReason: 'Benar — いしゃ (dokter) dengan しゃ kecil dan negatif じゃ ありません.',
      },
      {
        id: 'opt_b',
        text: 'たなかさん は いしや じゃ ありません',
        romajiHelper: 'Tanaka-san wa ishiya ja arimasen',
        diagnosticReason: 'Salah Youon — いしや (ishiya = tukang batu) memakai や besar, bukan ゃ kecil.',
      },
      {
        id: 'opt_c',
        text: 'たなかさん の いしゃ ません です',
        romajiHelper: 'Tanaka-san no isha masen desu',
        diagnosticReason: 'Salah tata bahasa — Kata benda tidak disangkal dengan ません.',
      },
      {
        id: 'opt_d',
        text: 'たなかさん は いしゃ を ありません',
        romajiHelper: 'Tanaka-san wa isha wo arimasen',
        diagnosticReason: 'Salah partikel — Menggunakan を pada predikat kata benda.',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'tanaka san wa isha ja arimasen',
      'tanakasan wa isha ja arimasen',
      'tanaka-san wa isha ja arimasen',
      'tanaka san wa isha dewa arimasen',
      'たなかさんはいしゃじゃありません',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'Kata "dokter" adalah いしゃ (isha) dengan huruf ゃ kecil (Youon). Bentuk negatif sopan dari です untuk kata benda adalah じゃ ありません (atau では ありません).',
    grammarStructure: 'Pola: [Subjek] は [Kata Benda] じゃ ありません。 Digunakan untuk menyangkal status/profesi ("bukan...").',
    wordBreakdown: [
      { kana: 'たなかさん', romaji: 'Tanaka-san', meaning: 'Sdr. Tanaka', grammarRole: 'Subjek' },
      { kana: 'は', romaji: 'wa', meaning: 'topik kalimat', grammarRole: 'Partikel は' },
      { kana: 'いしゃ', romaji: 'isha', meaning: 'dokter', grammarRole: 'Kata Benda (Youon)' },
      { kana: 'じゃ ありません', romaji: 'ja arimasen', meaning: 'bukan (negatif sopan)', grammarRole: 'Kopula Negatif' },
    ],
  },
  {
    id: 'q_sentence_dictionary_kore',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Ini adalah kamus bahasa Jepang",
    stimulusRomaji: "Kore wa nihongo no jisho desu",
    audioText: 'これはにほんごのじしょです',
    options: [
      {
        id: 'opt_a',
        text: 'これ は にほんご の じしょ です',
        romajiHelper: 'kore wa nihongo no jisho desu',
        diagnosticReason: 'Benar — にほんご の じしょ (kamus tentang bahasa Jepang) tepat.',
      },
      {
        id: 'opt_b',
        text: 'これ は にほんご は じしよ です',
        romajiHelper: 'kore wa nihongo wa jishiyo desu',
        diagnosticReason: 'Salah Youon & partikel — じしよ memakai よ besar (seharusnya じしょ).',
      },
      {
        id: 'opt_c',
        text: 'この は にほんご の じしょ です',
        romajiHelper: 'kono wa nihongo no jisho desu',
        diagnosticReason: 'Salah kata tunjuk — この harus diikuti kata benda langsung, tidak boleh langsung diikuti は.',
      },
      {
        id: 'opt_d',
        text: 'これ の にほんご は じしょ です',
        romajiHelper: 'kore no nihongo wa jisho desu',
        diagnosticReason: 'Salah struktur partikel — Topik benda tunjuk harus ditandai は.',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'kore wa nihongo no jisho desu',
      'これはにほんごのじしょです',
      'これ は にほんご の じしょ です',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'これ (ini) berdiri sendiri sebagai subjek sebelum は. Hubungan "kamus bahasa Jepang" diterjemahkan terbalik menjadi [にほんご (bahasa Jepang) の (tentang) じしょ (kamus)].',
    grammarStructure: 'Pola: これ は [N1: Kategori/Bahasa] の [N2: Benda Utama] です。 Ingat bahwa これ dapat langsung diikuti は, sedangkan この wajib diikuti kata benda.',
    wordBreakdown: [
      { kana: 'これ', romaji: 'kore', meaning: 'ini (benda dekat pembicara)', grammarRole: 'Kata Tunjuk' },
      { kana: 'は', romaji: 'wa', meaning: 'penanda topik', grammarRole: 'Partikel は' },
      { kana: 'にほんご', romaji: 'nihongo', meaning: 'bahasa Jepang', grammarRole: 'Kata Benda Penjelas' },
      { kana: 'の', romaji: 'no', meaning: 'penghubung menerangkan-diterangkan', grammarRole: 'Partikel の' },
      { kana: 'じしょ', romaji: 'jisho', meaning: 'kamus', grammarRole: 'Kata Benda Inti (Youon しょ)' },
      { kana: 'です', romaji: 'desu', meaning: 'adalah', grammarRole: 'Kopula' },
    ],
  },
  {
    id: 'q_sentence_go_factory',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Pergi ke pabrik dengan kereta listrik",
    stimulusRomaji: "Densha de koujou e ikimasu",
    audioText: 'でんしゃでこうじょうへいきます',
    options: [
      {
        id: 'opt_a',
        text: 'でんしゃ で こうじょう へ いきます',
        romajiHelper: 'densha de koujou e ikimasu',
        diagnosticReason: 'Benar — Alat transportasi で + tujuan へ + いきます tepat.',
      },
      {
        id: 'opt_b',
        text: 'でんしゃ へ こうじょう で いきます',
        romajiHelper: 'densha e koujou de ikimasu',
        diagnosticReason: 'Salah partikel — Partikel alat (で) dan arah tujuan (へ) tertukar.',
      },
      {
        id: 'opt_c',
        text: 'でんしゃ で こじょ へ いきます',
        romajiHelper: 'densha de kojo e ikimasu',
        diagnosticReason: 'Salah Chouon — Pabrik adalah こうじょう (koujou, vokal panjang ganda), bukan こじょ.',
      },
      {
        id: 'opt_d',
        text: 'てんしゃ で こうじょう を いきます',
        romajiHelper: 'tensha de koujou wo ikimasu',
        diagnosticReason: 'Salah Dakuon & partikel — Kereta listrik adalah でんしゃ (densha), bukan てんしゃ.',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'densha de koujou e ikimasu',
      'densha de koujou he ikimasu',
      'でんしゃでこうじょうへいきます',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'Kendaraan ditandai partikel で (でんしゃ で = dengan kereta listrik). Tempat tujuan ditandai partikel arah へ (dibaca e) sebelum kata kerja いきます (pergi).',
    grammarStructure: 'Pola: [Kendaraan] で [Tempat Tujuan] へ いきます。 Partikel へ ditulis dengan huruf Hiragana "he" namun dalam tata bahasa wajib dibaca "e".',
    wordBreakdown: [
      { kana: 'でんしゃ', romaji: 'densha', meaning: 'kereta listrik', grammarRole: 'Kata Benda Transportasi' },
      { kana: 'で', romaji: 'de', meaning: 'dengan / naik', grammarRole: 'Partikel Alat' },
      { kana: 'こうじょう', romaji: 'koujou', meaning: 'pabrik', grammarRole: 'Kata Benda Tempat (Chouon)' },
      { kana: 'へ', romaji: 'e', meaning: 'ke (arah tujuan)', grammarRole: 'Partikel Arah' },
      { kana: 'いきます', romaji: 'ikimasu', meaning: 'pergi', grammarRole: 'Kata Kerja' },
    ],
  },
  {
    id: 'q_sentence_wake_up_6',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Setiap pagi saya bangun pada jam 6",
    stimulusRomaji: "Maiasa roku-ji ni okimasu",
    audioText: 'まいあさろくじにおきます',
    options: [
      {
        id: 'opt_a',
        text: 'まいあさ ろくじ に おきます',
        romajiHelper: 'maiasa roku-ji ni okimasu',
        diagnosticReason: 'Benar — Waktu spesifik angka jam wajib diikuti partikel に.',
      },
      {
        id: 'opt_b',
        text: 'まいあさ に ろくじ を おきます',
        romajiHelper: 'maiasa ni roku-ji wo okimasu',
        diagnosticReason: 'Salah partikel — まいあさ (setiap pagi) tidak memakai に, sedangkan jam memakai に.',
      },
      {
        id: 'opt_c',
        text: 'まいあさ るくじ に おきます',
        romajiHelper: 'maiasa ruku-ji ni okimasu',
        diagnosticReason: 'Salah huruf Hiragana — Tertukar ろ (ro) dengan る (ru).',
      },
      {
        id: 'opt_d',
        text: 'まいにち ろくじ で おきます',
        romajiHelper: 'mainichi roku-ji de okimasu',
        diagnosticReason: 'Salah partikel waktu — Jam spesifik menggunakan に, bukan で.',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'maiasa rokuji ni okimasu',
      'maiasa roku-ji ni okimasu',
      'まいあさろくじにおきます',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'Keterangan waktu yang mengandung angka spesifik (seperti ろくじ = jam 6) wajib diikuti partikel に. Keterangan waktu relatif seperti まいあさ (setiap pagi) tidak memakai に.',
    grammarStructure: 'Pola: [Waktu Relatif] [Jam Angka] に [Kata Kerja] ます。 Partikel に menandai titik waktu terjadinya aksi.',
    wordBreakdown: [
      { kana: 'まいあさ', romaji: 'maiasa', meaning: 'setiap pagi', grammarRole: 'Waktu Relatif (Tanpa に)' },
      { kana: 'ろくじ', romaji: 'roku-ji', meaning: 'jam 6', grammarRole: 'Waktu Angka Spesifik' },
      { kana: 'に', romaji: 'ni', meaning: 'pada (penanda waktu)', grammarRole: 'Partikel Waktu に' },
      { kana: 'おきます', romaji: 'okimasu', meaning: 'bangun tidur', grammarRole: 'Kata Kerja' },
    ],
  },
  {
    id: 'q_sentence_eat_bread',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Makan roti dan minum kopi",
    stimulusRomaji: "Pan wo tabemasu, soshite koohii wo nomimasu",
    audioText: 'パンをたべます。そしてコーヒーをのみます',
    options: [
      {
        id: 'opt_a',
        text: 'パン を たべます。そして コーヒー を のみます',
        romajiHelper: 'pan wo tabemasu. soshite koohii wo nomimasu',
        diagnosticReason: 'Benar — Handakuon パン (pan), Chouon コーヒー (koohii), dan partikel objek を tepat.',
      },
      {
        id: 'opt_b',
        text: 'バン を たべます。そして コヒ を のみます',
        romajiHelper: 'ban wo tabemasu. soshite kohi wo nomimasu',
        diagnosticReason: 'Salah Handakuon & Chouon — Tertukar パ (pa) dengan バ (ba) serta コーヒー tanpa vokal panjang.',
      },
      {
        id: 'opt_c',
        text: 'パン で たべます。そして コーヒー に のみます',
        romajiHelper: 'pan de tabemasu. soshite koohii ni nomimasu',
        diagnosticReason: 'Salah partikel — Objek dari kata kerja makan/minum wajib menggunakan を.',
      },
      {
        id: 'opt_d',
        text: 'パン を たべます。そして ユーヒー を のみます',
        romajiHelper: 'pan wo tabemasu. soshite yuuhii wo nomimasu',
        diagnosticReason: 'Salah huruf Katakana — Tertukar コ (ko) dengan ユ (yu).',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'pan wo tabemasu soshite koohii wo nomimasu',
      'pan o tabemasu soshite koohii o nomimasu',
      'パンをたべますそしてコーヒーをのみます',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'Kata benda yang dikenai tindakan langsung (objek dari makan/minum) ditandai partikel を (ditulis を, dibaca o). Perhatikan ejaan パン (pan, bulatan handakuon) dan コーヒー (koohii, 2 tanda panjang ー).',
    grammarStructure: 'Pola: [Kata Benda Objek] を [Kata Kerja Transitif] ます。 Partikel を menghubungkan objek langsung dengan kata kerja.',
    wordBreakdown: [
      { kana: 'パン', romaji: 'pan', meaning: 'roti', grammarRole: 'Objek (Handakuon パ)' },
      { kana: 'を', romaji: 'o (wo)', meaning: 'penanda objek langsung', grammarRole: 'Partikel Objek を' },
      { kana: 'たべます', romaji: 'tabemasu', meaning: 'makan', grammarRole: 'Kata Kerja' },
      { kana: 'そして', romaji: 'soshite', meaning: 'lalu / dan kemudian', grammarRole: 'Kata Hubung' },
      { kana: 'コーヒー', romaji: 'koohii', meaning: 'kopi', grammarRole: 'Objek (Chouon ganda)' },
      { kana: 'のみます', romaji: 'nomimasu', meaning: 'minum', grammarRole: 'Kata Kerja' },
    ],
  },
  {
    id: 'q_sentence_also_student',
    level: 4,
    category: 'kalimat',
    subType: 'sentence_translation',
    promptInstruction: "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat:",
    stimulusJapanese: "Saudara Karina juga seorang mahasiswa",
    stimulusRomaji: "Karina-san mo gakusei desu",
    audioText: 'カリナさんもがくせいです',
    options: [
      {
        id: 'opt_a',
        text: 'カリナさん も がくせい です',
        romajiHelper: 'Karina-san mo gakusei desu',
        diagnosticReason: 'Benar — Partikel も ("juga") menggantikan posisi partikel は.',
      },
      {
        id: 'opt_b',
        text: 'カリナさん は も がくせい です',
        romajiHelper: 'Karina-san wa mo gakusei desu',
        diagnosticReason: 'Salah tata bahasa — Partikel は dan も tidak boleh ditumpuk berdampingan.',
      },
      {
        id: 'opt_c',
        text: 'カリナさん も かくせい です',
        romajiHelper: 'Karina-san mo kakusei desu',
        diagnosticReason: 'Salah Dakuon — Mahasiswa adalah がくせい (gakusei dengan dakuten が), bukan かくせい.',
      },
      {
        id: 'opt_d',
        text: 'カソナさん も がくせい です',
        romajiHelper: 'Kasona-san mo gakusei desu',
        diagnosticReason: 'Salah Katakana — Tertukar リ (ri) dengan ソ (so).',
      },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: [
      'karina san mo gakusei desu',
      'karinasan mo gakusei desu',
      'karina-san mo gakusei desu',
      'カリナさんもがくせいです',
    ],
    essayPlaceholder: 'Ketik romaji/kana kalimat bahasa Jepang...',
    explanation: 'Partikel も (mo) berarti "juga" dan langsung menggantikan partikel は ketika predikat suatu subjek sama dengan kalimat sebelumnya.',
    grammarStructure: 'Pola: [Subjek] も [Predikat Kata Benda] です。 Jangan pernah menggabungkan は も secara bersamaan.',
    wordBreakdown: [
      { kana: 'カリナさん', romaji: 'Karina-san', meaning: 'Sdr. Karina', grammarRole: 'Subjek' },
      { kana: 'も', romaji: 'mo', meaning: 'juga (menggantikan は)', grammarRole: 'Partikel Inklusi も' },
      { kana: 'がくせい', romaji: 'gakusei', meaning: 'pelajar / mahasiswa', grammarRole: 'Kata Benda (Dakuon + Chouon)' },
      { kana: 'です', romaji: 'desu', meaning: 'adalah', grammarRole: 'Kopula' },
    ],
  },

  // ==========================================
  // TIPE 1: BACAAN & ARTI (MODIFIKASI SOKUON, CHOUON, YOUON)
  // ==========================================
  {
    id: 'q_mod_byouin',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kata berikut?',
    stimulusJapanese: 'びょういん',
    stimulusRomaji: 'byouin',
    audioText: 'びょういん',
    options: [
      { id: 'opt_a', text: 'byouin (Rumah Sakit)', diagnosticReason: 'Benar — びょ (byo, ょ kecil) + う (vokal panjang) = Rumah Sakit.' },
      { id: 'opt_b', text: 'biyouin (Salon Kecantikan)', diagnosticReason: 'Salah Youon — Salon kecantikan ditulis びよういん dengan よ besar.' },
      { id: 'opt_c', text: 'byoin (Rumah Sakit - tanpa vokal panjang)', diagnosticReason: 'Salah Chouon — Kurang vokal panjang u (う) setelah byo.' },
      { id: 'opt_d', text: 'pyouin (Klinik)', diagnosticReason: 'Salah Dakuon — び memakai titik dua (b), bukan bulatan ぴ (p).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['byouin', 'rumah sakit', 'byouin rumah sakit'],
    essayPlaceholder: 'Ketik cara baca romaji (contoh: byouin)...',
    explanation: 'Perhatikan ukuran huruf ょ kecil pada びょ (byo) dan huruf う sebagai pemanjang vokal o: びょういん (byouin = Rumah Sakit, 4 ketukan). Bandingkan dengan びよういん (biyouin = Salon Kecantikan, 5 ketukan).',
    wordBreakdown: [
      { kana: 'びょ', romaji: 'byo', meaning: '1 ketukan Youon (bi + yo kecil)' },
      { kana: 'う', romaji: 'u', meaning: '1 ketukan Chouon (pemanjang vokal o)' },
      { kana: 'い', romaji: 'i', meaning: '1 ketukan vokal i' },
      { kana: 'ん', romaji: 'n', meaning: '1 ketukan konsonan sengau n' },
    ],
  },
  {
    id: 'q_mod_biyouin',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kata berikut?',
    stimulusJapanese: 'びよういん',
    stimulusRomaji: 'biyouin',
    audioText: 'びよういん',
    options: [
      { id: 'opt_a', text: 'biyouin (Salon Kecantikan)', diagnosticReason: 'Benar — Huruf よ berukuran besar penuh sehingga dibaca bi-yo-u-i-n.' },
      { id: 'opt_b', text: 'byouin (Rumah Sakit)', diagnosticReason: 'Salah ukuran huruf — Rumah sakit menggunakan ょ kecil (びょういん).' },
      { id: 'opt_c', text: 'biyooin (Apotek)', diagnosticReason: 'Salah arti dan ejaan.' },
      { id: 'opt_d', text: 'piyouin (Salon Kecantikan)', diagnosticReason: 'Salah Dakuon — び adalah bunyi b, bukan p.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['biyouin', 'salon kecantikan'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'Pada kata びよういん, huruf よ berukuran normal (bukan ょ kecil), sehingga dibaca terpisah menjadi 5 ketukan: bi-yo-u-i-n yang berarti Salon Kecantikan.',
  },
  {
    id: 'q_mod_kitte',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kata dengan Sokuon (っ kecil) berikut?',
    stimulusJapanese: 'きって',
    stimulusRomaji: 'kitte',
    audioText: 'きって',
    options: [
      { id: 'opt_a', text: 'kitte (Perangko)', diagnosticReason: 'Benar — っ kecil menggandakan konsonan berikutnya menjadi tt (kitte).' },
      { id: 'opt_b', text: 'kitsute (Tiket)', diagnosticReason: 'Salah Sokuon — っ kecil tidak dibaca "tsu", melainkan jeda 1 ketukan.' },
      { id: 'opt_c', text: 'kite (Datanglah)', diagnosticReason: 'Salah ketukan — Mengabaikan っ kecil mengubah arti menjadi "datanglah".' },
      { id: 'opt_d', text: 'chitte (Perangko)', diagnosticReason: 'Salah huruf awal — Huruf pertama adalah き (ki), bukan ち (chi).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['kitte', 'perangko'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'Huruf っ kecil (Sokuon) menahan suara selama 1 ketukan penuh dan menggandakan konsonan huruf di depannya (て te -> tte), menghasilkan きって (kitte = Perangko).',
  },
  {
    id: 'q_mod_ojiisan',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Perhatikan panjang vokal (Chouon). Apa bacaan dan arti yang tepat dari kata berikut?',
    stimulusJapanese: 'おじいさん',
    stimulusRomaji: 'ojiisan',
    audioText: 'おじいさん',
    options: [
      { id: 'opt_a', text: 'ojiisan (Kakek)', diagnosticReason: 'Benar — Vokal い ganda (ji-i) berdurasi 5 ketukan berarti Kakek.' },
      { id: 'opt_b', text: 'ojisan (Paman)', diagnosticReason: 'Salah Chouon — Paman ditulis pendek おじさん tanpa い tambahan.' },
      { id: 'opt_c', text: 'obaasan (Nenek)', diagnosticReason: 'Salah huruf — Ini adalah じ (ji), bukan ば (ba).' },
      { id: 'opt_d', text: 'oshii-san (Kakek)', diagnosticReason: 'Salah Dakuon — じ dibaca ji, bukan shi.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['ojiisan', 'kakek'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'Penambahan huruf い setelah じ memperpanjang vokal i menjadi 2 ketukan (おじいさん = ojiisan = Kakek). Tanpa い tambahan, おじさん (ojisan) berarti Paman.',
  },
  {
    id: 'q_mod_obaasan',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Perhatikan panjang vokal (Chouon). Apa bacaan dan arti yang tepat dari kata berikut?',
    stimulusJapanese: 'おばあさん',
    stimulusRomaji: 'obaasan',
    audioText: 'おばあさん',
    options: [
      { id: 'opt_a', text: 'obaasan (Nenek)', diagnosticReason: 'Benar — Vokal あ panjang setelah ば (ba-a) berarti Nenek.' },
      { id: 'opt_b', text: 'obasan (Bibi / Tante)', diagnosticReason: 'Salah Chouon — Bibi ditulis pendek おばさん (4 ketukan).' },
      { id: 'opt_c', text: 'opaasan (Nenek)', diagnosticReason: 'Salah Dakuon — ば menggunakan titik dua (ba), bukan bulatan (pa).' },
      { id: 'opt_d', text: 'ojiisan (Kakek)', diagnosticReason: 'Salah huruf — ばあ adalah baa, bukan jii.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['obaasan', 'nenek'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'おばあさん (obaasan) memiliki 5 ketukan mora karena vokal a diperpanjang oleh huruf あ, yang berarti Nenek.',
  },
  {
    id: 'q_mod_koukou',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kata bervokal panjang berikut?',
    stimulusJapanese: 'こうこう',
    stimulusRomaji: 'koukou',
    audioText: 'こうこう',
    options: [
      { id: 'opt_a', text: 'koukou (SMA / Sekolah Menengah Atas)', diagnosticReason: 'Benar — Dua kali vokal panjang o+u (ko-u-ko-u = SMA).' },
      { id: 'opt_b', text: 'koko (Di sini)', diagnosticReason: 'Salah Chouon — "Di sini" ditulis pendek ここ (2 ketukan).' },
      { id: 'opt_c', text: 'kuku (Perkalian)', diagnosticReason: 'Salah huruf — Huruf こ (ko) diikuti う (u), bukan く (ku).' },
      { id: 'opt_d', text: 'goukou (Pabrik)', diagnosticReason: 'Salah Dakuon — Tidak ada tanda dakuten pada こ.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['koukou', 'koko', 'sma'],
    essayPlaceholder: 'Ketik cara baca romaji (koukou)...',
    explanation: 'こうこう (koukou) terdiri dari 4 ketukan mora dan berarti SMA. Jangan tertukar dengan ここ (koko = di sini) yang hanya 2 ketukan.',
  },
  {
    id: 'q_mod_zasshi',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kata berikut?',
    stimulusJapanese: 'ざっし',
    stimulusRomaji: 'zasshi',
    audioText: 'ざっし',
    options: [
      { id: 'opt_a', text: 'zasshi (Majalah)', diagnosticReason: 'Benar — ざ (za) + っ kecil + し (shi) = zasshi (Majalah).' },
      { id: 'opt_b', text: 'zashi (Majalah)', diagnosticReason: 'Salah Sokuon — Mengabaikan っ kecil sebelum し.' },
      { id: 'opt_c', text: 'sasshi (Buku catatan)', diagnosticReason: 'Salah Dakuon — Huruf awal memiliki dakuten ざ (za), bukan さ (sa).' },
      { id: 'opt_d', text: 'zatsushi (Koran)', diagnosticReason: 'Salah Sokuon — っ kecil tidak dibaca tsu.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['zasshi', 'zassi', 'majalah'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'ざっし (zasshi) menggabungkan Dakuon ざ (za) dan Sokuon っ sebelum し (shi), menghasilkan konsonan ganda sshi yang berarti Majalah.',
  },
  {
    id: 'q_mod_kippu',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kata berikut?',
    stimulusJapanese: 'きっぷ',
    stimulusRomaji: 'kippu',
    audioText: 'きっぷ',
    options: [
      { id: 'opt_a', text: 'kippu (Karcis / Tiket)', diagnosticReason: 'Benar — き (ki) + っ kecil + ぷ (pu handakuon) = kippu.' },
      { id: 'opt_b', text: 'kibu (Karcis)', diagnosticReason: 'Salah Handakuon & Sokuon — ぷ memakai bulatan (p), bukan titik dua (b).' },
      { id: 'opt_c', text: 'kipu (Perangko)', diagnosticReason: 'Salah Sokuon — Kurang jeda konsonan ganda pp.' },
      { id: 'opt_d', text: 'kitsupu (Tiket)', diagnosticReason: 'Salah Sokuon — っ berukuran kecil, bukan つ besar.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['kippu', 'tiket', 'karcis'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'きっぷ (kippu) berarti karcis/tiket. Mengandung Sokuon っ yang menggandakan bunyi Handakuon ぷ (pu -> ppu).',
  },
  {
    id: 'q_mod_kenshuusei',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kosakata penting kerja di Jepang berikut?',
    stimulusJapanese: 'けんしゅうせい',
    stimulusRomaji: 'kenshuusei',
    audioText: 'けんしゅうせい',
    options: [
      { id: 'opt_a', text: 'kenshuusei (Pemagang / Trainee)', diagnosticReason: 'Benar — しゅ (shu) + う (panjang) + せい = kenshuusei.' },
      { id: 'opt_b', text: 'kenshusei (Pemagang - tanpa vokal panjang)', diagnosticReason: 'Salah Chouon — Kurang vokal panjang u pada shuu.' },
      { id: 'opt_c', text: 'kenshiyusei (Mahasiswa peneliti)', diagnosticReason: 'Salah Youon — しゅ menggunakan ゅ kecil, bukan ゆ besar.' },
      { id: 'opt_d', text: 'genshuusei (Karyawan tetap)', diagnosticReason: 'Salah Dakuon — け (ke) tidak memiliki tanda dakuten.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['kenshuusei', 'kensyusei', 'kensyuusei', 'pemagang', 'trainee'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'けんしゅうせい (kenshuusei = Pemagang/Trainee) menggabungkan konsonan ん (n), Youon しゅ (shu), Chouon う (u), dan せい (sei).',
  },
  {
    id: 'q_mod_kyoushi',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kata profesi berikut?',
    stimulusJapanese: 'きょうし',
    stimulusRomaji: 'kyoushi',
    audioText: 'きょうし',
    options: [
      { id: 'opt_a', text: 'kyoushi (Guru / Pengajar sebagai profesi)', diagnosticReason: 'Benar — きょ (kyo) + う (u) + し (shi) = kyoushi.' },
      { id: 'opt_b', text: 'kiyoushi (Guru)', diagnosticReason: 'Salah Youon — きょ memakai ょ kecil (1 ketukan), bukan よ besar.' },
      { id: 'opt_c', text: 'kyoshi (Ruang Kelas)', diagnosticReason: 'Salah Chouon — Tanpa vokal panjang う dan berbeda arti.' },
      { id: 'opt_d', text: 'gyoushi (Pengajar)', diagnosticReason: 'Salah Dakuon — き tidak memakai titik dua.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['kyoushi', 'kyosi', 'guru', 'pengajar'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'きょうし (kyoushi) digunakan untuk menyebut pekerjaan sendiri sebagai guru/pengajar (sedangkan せんせい digunakan untuk memanggil guru/orang lain).',
  },

  // ==========================================
  // TIPE 3: DETEKSI KESALAHAN KATKANA, SOKUON & CHOUON
  // ==========================================
  {
    id: 'q_trap_arubaito',
    level: 2,
    category: 'katakana',
    subType: 'spelling_trap',
    promptInstruction: "Manakah penulisan Katakana yang tepat untuk kata 'Pekerjaan Paruh Waktu (Arubaito)'?",
    stimulusJapanese: "Arubaito (Kerja Paruh Waktu)",
    stimulusRomaji: "arubaito",
    audioText: 'アルバイト',
    options: [
      { id: 'opt_a', text: 'アルバイト', romajiHelper: 'a-ru-ba-i-to', diagnosticReason: 'Benar — ア (a) ル (ru) バ (ba) イ (i) ト (to).' },
      { id: 'opt_b', text: 'アレバイト', romajiHelper: 'a-re-ba-i-to', diagnosticReason: 'Salah huruf Katakana — Tertukar ル (ru) dengan レ (re).' },
      { id: 'opt_c', text: 'アルパイト', romajiHelper: 'a-ru-pa-i-to', diagnosticReason: 'Salah Handakuon — Tertukar バ (ba) dengan パ (pa).' },
      { id: 'opt_d', text: 'アールバイト', romajiHelper: 'aa-ru-ba-i-to', diagnosticReason: 'Salah Chouon — Menambahkan garis panjang ー yang tidak perlu.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['arubaito', 'アルバイト'],
    essayPlaceholder: 'Ketik romaji atau Katakana...',
    explanation: 'Pekerjaan paruh waktu adalah アルバイト (arubaito). Perhatikan perbedaan ル (ru, dua kaki) vs レ (re, satu tiang), serta バ (ba, titik dua) vs パ (pa, bulatan).',
  },
  {
    id: 'q_trap_enjinia',
    level: 2,
    category: 'katakana',
    subType: 'spelling_trap',
    promptInstruction: "Manakah penulisan Katakana yang tepat untuk kata 'Insinyur / Teknisi (Enjinia)'?",
    stimulusJapanese: "Enjinia (Insinyur)",
    stimulusRomaji: "enjinia",
    audioText: 'エンジニア',
    options: [
      { id: 'opt_a', text: 'エンジニア', romajiHelper: 'e-n-ji-ni-a', diagnosticReason: 'Benar — エ (e) ン (n) ジ (ji) ニ (ni) ア (a).' },
      { id: 'opt_b', text: 'エソジニア', romajiHelper: 'e-so-ji-ni-a', diagnosticReason: 'Salah Katakana — Tertukar ン (n) dengan ソ (so).' },
      { id: 'opt_c', text: 'エンヅニア', romajiHelper: 'e-n-dzu-ni-a', diagnosticReason: 'Salah Katakana — Tertukar ジ (ji = シ+゛) dengan ヅ (dzu = ツ+゛).' },
      { id: 'opt_d', text: 'エンジニマ', romajiHelper: 'e-n-ji-ni-ma', diagnosticReason: 'Salah Katakana — Tertukar ア (a) dengan マ (ma).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['enjinia', 'エンジニア'],
    essayPlaceholder: 'Ketik romaji atau Katakana...',
    explanation: 'エンジニア (enjinia) menguji 3 jebakan utama Katakana sekaligus: ン (n) vs ソ (so), ジ (ji dari シ) vs ヅ (dzu dari ツ), serta ア (a) vs マ (ma).',
  },
  {
    id: 'q_trap_konpyuuta',
    level: 3,
    category: 'modifikasi',
    subType: 'spelling_trap',
    promptInstruction: "Manakah penulisan Katakana yang tepat untuk kata 'Komputer (Konpyuuta)'?",
    stimulusJapanese: "Konpyuuta (Komputer)",
    stimulusRomaji: "konpyuuta",
    audioText: 'コンピューター',
    options: [
      { id: 'opt_a', text: 'コンピュータ', romajiHelper: 'ko-n-pyu-u-ta', diagnosticReason: 'Benar — ピュ (pyu dengan ュ kecil) + ー (vokal panjang).' },
      { id: 'opt_b', text: 'コンピユタ', romajiHelper: 'ko-n-pi-yu-ta', diagnosticReason: 'Salah Youon & Chouon — Memakai ユ besar dan tanpa garis panjang ー.' },
      { id: 'opt_c', text: 'コソピュータ', romajiHelper: 'ko-so-pyu-u-ta', diagnosticReason: 'Salah Katakana — Tertukar ン (n) dengan ソ (so).' },
      { id: 'opt_d', text: 'コンビュータ', romajiHelper: 'ko-n-byu-u-ta', diagnosticReason: 'Salah Handakuon — Tertukar ピ (pi bulatan) dengan ビ (bi titik dua).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['konpyuuta', 'konpyuta', 'コンピュータ', 'コンピューター'],
    essayPlaceholder: 'Ketik romaji atau Katakana...',
    explanation: 'コンピュータ (konpyuuta) wajib menggunakan Handakuon ピ (pi) + ュ kecil (Youon pyu) + garis panjang ー (Chouon).',
  },
  {
    id: 'q_trap_erebeetaa',
    level: 2,
    category: 'katakana',
    subType: 'spelling_trap',
    promptInstruction: "Manakah penulisan Katakana yang tepat untuk 'Lift / Elevator (Erebeetaa)'?",
    stimulusJapanese: "Erebeetaa (Lift / Elevator)",
    stimulusRomaji: "erebeetaa",
    audioText: 'エレベーター',
    options: [
      { id: 'opt_a', text: 'エレベーター', romajiHelper: 'e-re-bee-taa', diagnosticReason: 'Benar — エ (e) レ (re) ベ (be) ー タ (ta) ー.' },
      { id: 'opt_b', text: 'エルベーター', romajiHelper: 'e-ru-bee-taa', diagnosticReason: 'Salah Katakana — Tertukar レ (re) dengan ル (ru).' },
      { id: 'opt_c', text: 'エレペーター', romajiHelper: 'e-re-pee-taa', diagnosticReason: 'Salah Dakuon — Tertukar ベ (be) dengan ペ (pe).' },
      { id: 'opt_d', text: 'エレベータ', romajiHelper: 'e-re-bee-ta', diagnosticReason: 'Kurang Chouon di akhir — Standar MNN menggunakan エレベーター.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['erebeetaa', 'erebeta', 'エレベーター'],
    essayPlaceholder: 'Ketik romaji atau Katakana...',
    explanation: 'Lift dalam bahasa Jepang adalah エレベーター (erebeetaa), memiliki dua garis vokal panjang (ー) setelah ベ dan setelah タ.',
  },
  {
    id: 'q_trap_indoneshia',
    level: 2,
    category: 'katakana',
    subType: 'spelling_trap',
    promptInstruction: "Manakah penulisan Katakana yang tepat untuk negara 'Indonesia (Indoneshia)'?",
    stimulusJapanese: "Indoneshia (Indonesia)",
    stimulusRomaji: "Indoneshia",
    audioText: 'インドネシア',
    options: [
      { id: 'opt_a', text: 'インドネシア', romajiHelper: 'I-n-do-ne-shi-a', diagnosticReason: 'Benar — イ・ン・ド・ネ・シ・ア.' },
      { id: 'opt_b', text: 'イソドネツア', romajiHelper: 'I-so-do-ne-tsu-a', diagnosticReason: 'Salah Katakana — Tertukar ン dengan ソ dan シ dengan ツ.' },
      { id: 'opt_c', text: 'インドネシマ', romajiHelper: 'I-n-do-ne-shi-ma', diagnosticReason: 'Salah Katakana — Tertukar ア (a) dengan マ (ma).' },
      { id: 'opt_d', text: 'イントネシア', romajiHelper: 'I-n-to-ne-shi-a', diagnosticReason: 'Salah Dakuon — Kurang tanda dakuten pada ド (do).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['indoneshia', 'indonesia', 'インドネシア'],
    essayPlaceholder: 'Ketik romaji atau Katakana...',
    explanation: 'Penulisan Индонеシア (Indoneshia) wajib diperhatikan setiap peserta JFT-Basic dari Indonesia: pastikan menguasai bedanya ン vs ソ dan シ vs ツ.',
  },

  // ==========================================
  // TIPE 4: SOAL CERITA PENDEK / DOKKAI MIKRO
  // ==========================================
  {
    id: 'q_dokkai_kenshuusei',
    level: 4,
    category: 'kalimat',
    subType: 'dokkai_micro',
    promptInstruction: "Bacalah teks perkenalan singkat berikut, lalu jawab pertanyaan di bawahnya: 'Apa pekerjaan/status orang tersebut?'",
    stimulusJapanese: "はじめまして。わたし は インドネシア から きました。あぐす です。けんしゅうせい です。どうぞ よろしく おねがいします。",
    stimulusRomaji: "Hajimemashite. Watashi wa Indoneshia kara kimashita. Agusu desu. Kenshuusei desu. Douzo yoroshiku onegaishimasu.",
    audioText: 'はじめまして。わたしはインドネシアからきました。あぐすです。けんしゅうせいです。どうぞよろしくおねがいします。',
    options: [
      { id: 'opt_a', text: 'Pemagang / Trainee (けんしゅうせい)', diagnosticReason: 'Benar — Kalimat ke-4 menyebutkan "けんしゅうせい です" (Saya adalah pemagang).' },
      { id: 'opt_b', text: 'Insinyur (エンジニア)', diagnosticReason: 'Salah — Tidak disebutkan kata エンジニア di dalam teks.' },
      { id: 'opt_c', text: 'Guru / Pengajar (きょうし)', diagnosticReason: 'Salah — Tidak ada kata きょうし maupun せんせい.' },
      { id: 'opt_d', text: 'Pegawai Bank (ぎんこういん)', diagnosticReason: 'Salah — Bukan pegawai bank.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['kenshuusei', 'pemagang', 'trainee'],
    essayPlaceholder: 'Ketik jawaban (pemagang / kenshuusei)...',
    explanation: 'Dalam wacana tertulis: "けんしゅうせい です" (Kenshuusei desu), yang berarti "Saya adalah seorang pemagang/trainee".',
    grammarStructure: 'Struktur Jikoshoukai (Perkenalan Diri): はじめまして (Salam pembuka) -> [Negara] から きました (Asal) -> [Nama] です -> [Status/Pekerjaan] です -> どうぞ よろしく おねがいします (Salam penutup).',
    wordBreakdown: [
      { kana: 'はじめまして', romaji: 'hajimemashite', meaning: 'perkenalkan (salam awal bertemu)' },
      { kana: 'インドネシア から きました', romaji: 'Indoneshia kara kimashita', meaning: 'datang dari Indonesia' },
      { kana: 'あぐす です', romaji: 'Agusu desu', meaning: 'saya Agus' },
      { kana: 'けんしゅうせい です', romaji: 'kenshuusei desu', meaning: 'adalah seorang pemagang' },
      { kana: 'どうぞ よろしく', romaji: 'douzo yoroshiku', meaning: 'mohon bimbingannya / senang berkenalan' },
    ],
  },
  {
    id: 'q_dokkai_hospital_schedule',
    level: 4,
    category: 'kalimat',
    subType: 'dokkai_micro',
    promptInstruction: "Bacalah teks pendek berikut: 'Pada jam berapa rumah sakit tersebut buka setiap pagi?'",
    stimulusJapanese: "さくら びょういん は まいあさ くじ から ごご ごじ まで です。にちようび は やすみ です。",
    stimulusRomaji: "Sakura byouin wa maiasa ku-ji kara gogo go-ji made desu. Nichiyoubi wa yasumi desu.",
    audioText: 'さくらびょういんはまいあさくじからごごごじまでです。にちようびはやすみです。',
    options: [
      { id: 'opt_a', text: 'Jam 09.00 Pagi (まいあさ くじ)', diagnosticReason: 'Benar — くじ (ku-ji) = jam 9, diikuti から (mulai dari).' },
      { id: 'opt_b', text: 'Jam 05.00 Sore (ごご ごじ)', diagnosticReason: 'Salah — ごご ごじ まで adalah jam tutup (sampai jam 5 sore).' },
      { id: 'opt_c', text: 'Jam 08.00 Pagi (はちじ)', diagnosticReason: 'Salah — Tidak disebut はちじ di dalam teks.' },
      { id: 'opt_d', text: 'Hari Minggu (にちようび)', diagnosticReason: 'Salah — Hari Minggu adalah hari libur (やすみ).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['jam 9', '9', 'kuji', 'ku-ji', '09.00', 'くじ'],
    essayPlaceholder: 'Ketik jam buka (contoh: jam 9 / kuji)...',
    explanation: 'Teks menyatakan "まいあさ くじ から" (maiasa ku-ji kara = setiap pagi mulai dari jam 9) hingga "ごご ごじ まで" (sampai jam 5 sore).',
    grammarStructure: 'Pola: [Waktu Mulai] から [Waktu Selesai] まで です (Dari ... sampai ...). Kata くじ berarti jam 9 (bukan きゅうじ).',
    wordBreakdown: [
      { kana: 'さくら びょういん', romaji: 'Sakura byouin', meaning: 'Rumah Sakit Sakura' },
      { kana: 'まいあさ', romaji: 'maiasa', meaning: 'setiap pagi' },
      { kana: 'くじ から', romaji: 'ku-ji kara', meaning: 'mulai dari jam 9' },
      { kana: 'ごご ごじ まで', romaji: 'gogo go-ji made', meaning: 'sampai jam 5 sore' },
      { kana: 'にちようび は やすみ', romaji: 'nichiyoubi wa yasumi', meaning: 'hari Minggu libur' },
    ],
  },
  {
    id: 'q_dokkai_shopping_price',
    level: 4,
    category: 'kalimat',
    subType: 'dokkai_micro',
    promptInstruction: "Bacalah percakapan toko berikut: 'Berapakah harga kamera buatan Jepang tersebut?'",
    stimulusJapanese: "これ は にほん の カメラ です。にまん ごせん えん です。とても いい カメラ です。",
    stimulusRomaji: "Kore wa Nihon no kamera desu. Ni-man gosen en desu. Totemo ii kamera desu.",
    audioText: 'これはにほんのカメラです。にまんごせんえんです。とてもいいカメラです。',
    options: [
      { id: 'opt_a', text: '25.000 Yen (にまん ごせん えん)', diagnosticReason: 'Benar — にまん (20.000) + ごせん (5.000) = 25.000 Yen.' },
      { id: 'opt_b', text: '2.500 Yen (にせん ごひゃく えん)', diagnosticReason: 'Salah satuan — まん (man) adalah puluhan ribu (10.000), bukan ribuan.' },
      { id: 'opt_c', text: '52.000 Yen (ごまん にせん えん)', diagnosticReason: 'Salah urutan angka — にまん (20.000) disebut lebih dulu.' },
      { id: 'opt_d', text: '15.000 Yen (いちまん ごせん えん)', diagnosticReason: 'Salah angka — に (ni) berarti 2, bukan 1.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['25000', '25.000', '25000 yen', 'niman gosen en', 'にまんごせんえん'],
    essayPlaceholder: 'Ketik nominal harga (contoh: 25000)...',
    explanation: 'Satuan まん (man) bernilai 10.000 dan せん (sen) bernilai 1.000. Maka にまん (2 x 10.000) + ごせん (5 x 1.000) = 25.000 Yen.',
    grammarStructure: 'Pola Harga & Asal Produk: [Negara] の [Benda] = Benda buatan negara tersebut. Satuan angka Jepang dikelompokkan per 10.000 (まん).',
    wordBreakdown: [
      { kana: 'にほん の カメラ', romaji: 'Nihon no kamera', meaning: 'kamera buatan Jepang' },
      { kana: 'にまん', romaji: 'ni-man', meaning: '20.000 (2 puluhan ribu)' },
      { kana: 'ごせん', romaji: 'go-sen', meaning: '5.000' },
      { kana: 'えん', romaji: 'en', meaning: 'Yen (mata uang Jepang)' },
      { kana: 'とても いい', romaji: 'totemo ii', meaning: 'sangat bagus' },
    ],
  },
  {
    id: 'q_dokkai_library_study',
    level: 4,
    category: 'kalimat',
    subType: 'dokkai_micro',
    promptInstruction: "Bacalah teks berikut: 'Di manakah Saudara Rina belajar bahasa Jepang setiap hari?'",
    stimulusJapanese: "リナさん は まいにち だいがく の としょかん で にほんご を べんきょうします。",
    stimulusRomaji: "Rina-san wa mainichi daigaku no toshokan de nihongo wo benkyoushimasu.",
    audioText: 'リナさんはまいにちだいがくのとしょかんでにほんごをべんきょうします。',
    options: [
      { id: 'opt_a', text: 'Perpustakaan Universitas (だいがく の としょかん)', diagnosticReason: 'Benar — Tempat berlangsungnya aksi ditandai partikel で setelah としょかん.' },
      { id: 'opt_b', text: 'Kantin Perusahaan (かいしゃ の しょくどう)', diagnosticReason: 'Salah kosakata — Tidak ada kata かいしゃ atau しょくどう.' },
      { id: 'opt_c', text: 'Kamar Asrama (りょう の へや)', diagnosticReason: 'Salah kosakata — Bukan di asrama.' },
      { id: 'opt_d', text: 'Ruang Kelas SMA (こうこう の きょうしつ)', diagnosticReason: 'Salah kosakata — だいがく berarti universitas, としょかん berarti perpustakaan.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['perpustakaan', 'perpustakaan universitas', 'daigaku no toshokan', 'toshokan'],
    essayPlaceholder: 'Ketik lokasi tempat belajar...',
    explanation: 'Partikel で setelah tempat (だいがく の としょかん で) menandai lokasi terjadinya suatu aktivitas aktif (べんきょうします = belajar).',
    grammarStructure: 'Pola: [Tempat Aktivitas] で [Objek] を [Kata Kerja] ます。 Partikel で menandai tempat aksi berlangsung.',
    wordBreakdown: [
      { kana: 'まいにち', romaji: 'mainichi', meaning: 'setiap hari' },
      { kana: 'だいがく の としょかん', romaji: 'daigaku no toshokan', meaning: 'perpustakaan universitas' },
      { kana: 'で', romaji: 'de', meaning: 'di (tempat beraktivitas)', grammarRole: 'Partikel Lokasi Aksi' },
      { kana: 'にほんご を', romaji: 'nihongo wo', meaning: 'bahasa Jepang (objek)' },
      { kana: 'べんきょうします', romaji: 'benkyoushimasu', meaning: 'belajar' },
    ],
  },

  // ==========================================
  // KOSAKATA TAMBAHAN HIRAGANA, KATAKANA & MODIFIKASI
  // ==========================================
  {
    id: 'q_vocab_sensei',
    level: 1,
    category: 'hiragana',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan arti kata Hiragana dasar berikut?',
    stimulusJapanese: 'せんせい',
    stimulusRomaji: 'sensei',
    audioText: 'せんせい',
    options: [
      { id: 'opt_a', text: 'sensei (Guru / Dokter / Pengajar)', diagnosticReason: 'Benar — せ-ん-せ-い dibaca sensei.' },
      { id: 'opt_b', text: 'shinsei (Murid baru)', diagnosticReason: 'Salah huruf — Huruf pertama adalah せ (se), bukan し (shi).' },
      { id: 'opt_c', text: 'sesei (Guru)', diagnosticReason: 'Salah huruf — Mengabaikan huruf ん (n) di tengah.' },
      { id: 'opt_d', text: 'zensei (Guru)', diagnosticReason: 'Salah Dakuon — Tidak ada dakuten pada せ.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['sensei', 'guru'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'せんせい (sensei) berarti guru atau panggilan hormat untuk pengajar/dokter. Perhatikan vokal panjang えい (ei) di akhir.',
  },
  {
    id: 'q_vocab_gakusei',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kosakata berikut?',
    stimulusJapanese: 'がくせい',
    stimulusRomaji: 'gakusei',
    audioText: 'がくせい',
    options: [
      { id: 'opt_a', text: 'gakusei (Pelajar / Mahasiswa)', diagnosticReason: 'Benar — が (ga) + く (ku) + せい (sei).' },
      { id: 'opt_b', text: 'kakusei (Pelajar)', diagnosticReason: 'Salah Dakuon — Huruf awal memiliki dakuten が (ga).' },
      { id: 'opt_c', text: 'gakuse (Sekolah)', diagnosticReason: 'Salah Chouon — Mengabaikan huruf い di akhir.' },
      { id: 'opt_d', text: 'gakkou (Sekolah)', diagnosticReason: 'Salah kosakata — Sekolah adalah がっこう (gakkou).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['gakusei', 'mahasiswa', 'pelajar'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'がくせい (gakusei) berarti pelajar atau mahasiswa. Jangan tertukar dengan がっこう (gakkou = sekolah).',
  },
  {
    id: 'q_vocab_gakkou',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Perhatikan Sokuon (っ) dan Chouon (う). Apa bacaan dan arti kata berikut?',
    stimulusJapanese: 'がっこう',
    stimulusRomaji: 'gakkou',
    audioText: 'がっこう',
    options: [
      { id: 'opt_a', text: 'gakkou (Sekolah)', diagnosticReason: 'Benar — Mengandung っ kecil (kk) dan vokal panjang う (ou).' },
      { id: 'opt_b', text: 'gakou (Sekolah)', diagnosticReason: 'Salah Sokuon & Chouon — Kurang konsonan ganda kk dan vokal panjang u.' },
      { id: 'opt_c', text: 'kakkou (Penampilan)', diagnosticReason: 'Salah Dakuon — Huruf pertama adalah が (ga), bukan か (ka).' },
      { id: 'opt_d', text: 'gakusei (Mahasiswa)', diagnosticReason: 'Salah kosakata — Ini adalah がっこう (Sekolah).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['gakkou', 'gakko', 'sekolah'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'がっこう (gakkou = Sekolah) memiliki 4 ketukan mora: が (ga) - っ (tahan 1 ketuk) - こ (ko) - う (u).',
  },
  {
    id: 'q_vocab_ginkou',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari tempat berikut?',
    stimulusJapanese: 'ぎんこう',
    stimulusRomaji: 'ginkou',
    audioText: 'ぎんこう',
    options: [
      { id: 'opt_a', text: 'ginkou (Bank)', diagnosticReason: 'Benar — ぎ (gi) + ん (n) + こ (ko) + う (u) = Bank.' },
      { id: 'opt_b', text: 'kinkou (Brankas)', diagnosticReason: 'Salah Dakuon — Huruf awal adalah ぎ (gi dengan dakuten).' },
      { id: 'opt_c', text: 'ginko (Bank - tanpa vokal panjang)', diagnosticReason: 'Salah Chouon — Kurang vokal panjang u di akhir.' },
      { id: 'opt_d', text: 'jinkou (Populasi)', diagnosticReason: 'Salah huruf — Huruf awal adalah ぎ (gi), bukan じ (ji).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['ginkou', 'bank'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'ぎんこう (ginkou) berarti Bank. Sedangkan pegawai bank adalah ぎんこういん (ginkouin).',
  },
  {
    id: 'q_vocab_shain',
    level: 3,
    category: 'modifikasi',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari kosakata Bab 1 MNN berikut?',
    stimulusJapanese: 'かいしゃいん',
    stimulusRomaji: 'kaishain',
    audioText: 'かいしゃいん',
    options: [
      { id: 'opt_a', text: 'kaishain (Karyawan Perusahaan)', diagnosticReason: 'Benar — かいしゃ (perusahaan) + いん (anggota/staf).' },
      { id: 'opt_b', text: 'kaishiyain (Karyawan)', diagnosticReason: 'Salah Youon — しゃ memakai ゃ kecil (sha), bukan や besar.' },
      { id: 'opt_c', text: 'kaisha (Perusahaan saja)', diagnosticReason: 'Kurang lengkap — Ada akhiran いん (in) yang berarti staf/karyawan.' },
      { id: 'opt_d', text: 'gaishain (Karyawan asing)', diagnosticReason: 'Salah Dakuon — か tidak memakai dakuten.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['kaishain', 'kaisyain', 'karyawan perusahaan', 'pegawai perusahaan'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'かいしゃ (kaisha = perusahaan) ditambah akhiran いん (in = anggota/pegawai) menjadi かいしゃいん (kaishain = karyawan perusahaan).',
  },
  {
    id: 'q_vocab_kamera',
    level: 2,
    category: 'katakana',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti kata Katakana berikut?',
    stimulusJapanese: 'カメラ',
    stimulusRomaji: 'kamera',
    audioText: 'カメラ',
    options: [
      { id: 'opt_a', text: 'kamera (Kamera)', diagnosticReason: 'Benar — カ (ka) + メ (me) + ラ (ra).' },
      { id: 'opt_b', text: 'kanura (Kamera)', diagnosticReason: 'Salah Katakana — Huruf tengah adalah メ (me), bukan ヌ (nu).' },
      { id: 'opt_c', text: 'kamero (Kamera)', diagnosticReason: 'Salah Katakana — Huruf akhir adalah ラ (ra), bukan ロ (ro).' },
      { id: 'opt_d', text: 'gamera (Kamera)', diagnosticReason: 'Salah Dakuon — Tidak ada dakuten pada カ.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['kamera'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'カメラ dibaca kamera. Perhatikan huruf tengah メ (me, dua goresan menyilang) vs ヌ (nu, bersudut seperti angka 7).',
  },
  {
    id: 'q_vocab_pasokon',
    level: 2,
    category: 'katakana',
    subType: 'vocab_reading',
    promptInstruction: 'Perhatikan perbedaan ソ (so) dan ン (n). Bagaimana cara membaca kata berikut?',
    stimulusJapanese: 'パソコン',
    stimulusRomaji: 'pasokon',
    audioText: 'パソコン',
    options: [
      { id: 'opt_a', text: 'pasokon (PC / Laptop Pribadi)', diagnosticReason: 'Benar — Huruf ke-2 adalah ソ (so, turun dari atas) dan huruf ke-4 adalah ン (n, naik dari bawah).' },
      { id: 'opt_b', text: 'pankoso (Roti)', diagnosticReason: 'Salah urutan ソ vs ン — Tertukar posisi ソ (so) dan ン (n).' },
      { id: 'opt_c', text: 'basokon (PC)', diagnosticReason: 'Salah Handakuon — パ memakai bulatan (pa), bukan titik dua (ba).' },
      { id: 'opt_d', text: 'pasokoso (PC)', diagnosticReason: 'Salah huruf terakhir — Huruf terakhir adalah ン (n).' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['pasokon', 'laptop', 'pc'],
    essayPlaceholder: 'Ketik cara baca romaji (pasokon)...',
    explanation: 'パソコン (pasokon = Personal Computer) adalah kata latihan terbaik untuk membedakan ソ (so, huruf ke-2) dan ン (n, huruf ke-4).',
  },
  {
    id: 'q_vocab_shatsu',
    level: 2,
    category: 'katakana',
    subType: 'vocab_reading',
    promptInstruction: 'Perhatikan perbedaan シ (shi) dan ツ (tsu). Apa bacaan dan arti kata berikut?',
    stimulusJapanese: 'シャツ',
    stimulusRomaji: 'shatsu',
    audioText: 'シャツ',
    options: [
      { id: 'opt_a', text: 'shatsu (Kemeja)', diagnosticReason: 'Benar — シャ (sha, dari シ + ャ kecil) diikuti ツ (tsu).' },
      { id: 'opt_b', text: 'tsiyashi (Kemeja)', diagnosticReason: 'Salah Katakana — Tertukar antara シ (shi) dan ツ (tsu).' },
      { id: 'opt_c', text: 'shiyatsu (Kaus)', diagnosticReason: 'Salah Youon — ャ berukuran kecil, sehingga melebur menjadi sha (bukan shiya).' },
      { id: 'opt_d', text: 'jatsu (Jaket)', diagnosticReason: 'Salah Dakuon — Tidak ada dakuten pada シ.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['shatsu', 'syatsu', 'kemeja'],
    essayPlaceholder: 'Ketik cara baca romaji (shatsu)...',
    explanation: 'シャツ (shatsu = Kemeja) memuat Си (shi) di awal (dengan ャ kecil menjadi sha) dan ツ (tsu) di akhir.',
  },
  {
    id: 'q_vocab_chikatetsu',
    level: 1,
    category: 'hiragana',
    subType: 'vocab_reading',
    promptInstruction: 'Bagaimana cara membaca dan apa arti dari alat transportasi berikut?',
    stimulusJapanese: 'ちかてつ',
    stimulusRomaji: 'chikatetsu',
    audioText: 'ちかてつ',
    options: [
      { id: 'opt_a', text: 'chikatetsu (Kereta Bawah Tanah / MRT)', diagnosticReason: 'Benar — ち (chi) - か (ka) - て (te) - つ (tsu).' },
      { id: 'opt_b', text: 'sakatetsu (Kereta Bawah Tanah)', diagnosticReason: 'Salah huruf — Huruf pertama adalah ち (perut ke kanan), bukan さ (perut ke kiri).' },
      { id: 'opt_c', text: 'chikatte (Tiket MRT)', diagnosticReason: 'Salah Sokuon — Huruf terakhir adalah つ besar (tsu), bukan っ kecil.' },
      { id: 'opt_d', text: 'chikadetsu (MRT)', diagnosticReason: 'Salah Dakuon — て tidak memiliki dakuten.' },
    ],
    correctOptionId: 'opt_a',
    acceptedEssayAnswers: ['chikatetsu', 'tikatetu', 'mrt', 'kereta bawah tanah'],
    essayPlaceholder: 'Ketik cara baca romaji...',
    explanation: 'ちかてつ (chikatetsu) berarti kereta bawah tanah (subway/MRT). Perhatikan つ di akhir berukuran besar penuh sehingga dibaca "tsu".',
  },
];

/**
 * Generates procedural single-character & compound questions from ALL_KANA_ITEMS
 * with visually/phonetically similar distractors so the bank has 180+ non-repeating items.
 */
function buildKanaPoolQuestions(): SimulatorQuestion[] {
  return ALL_KANA_ITEMS.map((item) => {
    const isMod = item.group === 'dakuon' || item.group === 'youon';
    const category: QuestionCategory = isMod
      ? 'modifikasi'
      : item.script === 'hiragana'
      ? 'hiragana'
      : 'katakana';

    const level: 1 | 2 | 3 = isMod ? 3 : item.script === 'hiragana' ? 1 : 2;
    const scriptName = item.script === 'hiragana' ? 'Hiragana' : 'Katakana';

    // Pick 3 smart distractors from item.confusableRomaji or same group
    const distractorRomajis = [...item.confusableRomaji];
    const sameGroupPool = ALL_KANA_ITEMS.filter(
      (k) => k.script === item.script && k.romaji !== item.romaji && !distractorRomajis.includes(k.romaji)
    );
    while (distractorRomajis.length < 3 && sameGroupPool.length > 0) {
      const candidate = sameGroupPool.shift()!;
      distractorRomajis.push(candidate.romaji);
    }

    const options: QuestionOption[] = [
      {
        id: 'opt_correct',
        text: item.romaji,
        diagnosticReason: `Benar — ${item.kana} adalah huruf ${scriptName} "${item.romaji}". ${item.mnemonic}.`,
      },
      ...distractorRomajis.slice(0, 3).map((dRomaji, idx) => {
        const matchKana = ALL_KANA_ITEMS.find((k) => k.script === item.script && k.romaji === dRomaji);
        return {
          id: `opt_dist_${idx}`,
          text: dRomaji,
          diagnosticReason: matchKana
            ? `Salah — "${dRomaji}" ditulis sebagai ${matchKana.kana}, bukan ${item.kana}.`
            : `Salah — Bukan bunyi yang tepat untuk huruf ${item.kana}.`,
        };
      }),
    ];

    return {
      id: `q_kana_${item.id}`,
      level,
      category,
      subType: 'kana_recognition',
      promptInstruction: `Pilih atau ketik bacaan Romaji yang tepat untuk huruf ${scriptName} berikut:`,
      stimulusJapanese: item.kana,
      stimulusRomaji: item.romaji,
      audioText: item.kana,
      options,
      correctOptionId: 'opt_correct',
      acceptedEssayAnswers: [...item.acceptedRomaji, item.kana],
      essayPlaceholder: 'Ketik bacaan romaji (contoh: ka, shi, tsu)...',
      explanation: `Huruf ${scriptName} 【 ${item.kana} 】 dibaca "${item.romaji}". Petunjuk bentuk: ${item.mnemonic}.`,
    };
  });
}

export const FULL_QUESTION_BANK: SimulatorQuestion[] = [
  ...CURATED_QUESTIONS,
  ...buildKanaPoolQuestions(),
];

export interface TestSessionConfig {
  questionCount: 15 | 50 | 100;
  selectedLevel: 1 | 2 | 3 | 4 | 5; // 5 = Campuran Total (20% Hira, 20% Kata, 30% Mod, 30% Kalimat)
  answerMode: 'multiple_choice' | 'essay' | 'hybrid';
  timerMode: 'normal' | 'strict_15s';
  romajiAssistMode: 'adaptive' | 'always_hide' | 'always_show';
  customPoolIds?: string[]; // Used when "Retry Mistakes Only" is triggered
}

export interface PreparedTestQuestion extends SimulatorQuestion {
  assignedMode: 'multiple_choice' | 'essay';
  shuffledOptions: QuestionOption[];
}

/**
 * Generates a randomized, non-repeating test session using pure Fisher-Yates Shuffle
 * for pool sampling, question ordering, and option ordering (A, B, C, D).
 */
export function generateTestSessionQuestions(config: TestSessionConfig): PreparedTestQuestion[] {
  // 1. If Retry Mistakes Only is active, pull those exact questions first
  if (config.customPoolIds && config.customPoolIds.length > 0) {
    const mistakePool = FULL_QUESTION_BANK.filter((q) => config.customPoolIds!.includes(q.id));
    const shuffledMistakes = fisherYatesShuffle(mistakePool);
    return shuffledMistakes.map((q, idx) => {
      const assignedMode =
        config.answerMode === 'hybrid'
          ? idx % 2 === 0
            ? 'multiple_choice'
            : 'essay'
          : config.answerMode;
      return {
        ...q,
        assignedMode,
        shuffledOptions: fisherYatesShuffle(q.options),
      };
    });
  }

  let selectedQuestions: SimulatorQuestion[] = [];

  if (config.selectedLevel === 5) {
    // Level 5: Campuran Total (20% Hiragana, 20% Katakana, 30% Modifikasi, 30% Kalimat & Kosakata)
    const hiraQuota = Math.round(config.questionCount * 0.2);
    const kataQuota = Math.round(config.questionCount * 0.2);
    const modQuota = Math.round(config.questionCount * 0.3);
    const kalimatQuota = config.questionCount - hiraQuota - kataQuota - modQuota;

    const hiraPool = fisherYatesShuffle(FULL_QUESTION_BANK.filter((q) => q.category === 'hiragana'));
    const kataPool = fisherYatesShuffle(FULL_QUESTION_BANK.filter((q) => q.category === 'katakana'));
    const modPool = fisherYatesShuffle(FULL_QUESTION_BANK.filter((q) => q.category === 'modifikasi'));
    const kalimatPool = fisherYatesShuffle(FULL_QUESTION_BANK.filter((q) => q.category === 'kalimat'));

    const pickedKalimat = kalimatPool.slice(0, kalimatQuota);
    const pickedMod = modPool.slice(0, modQuota);
    const pickedHira = hiraPool.slice(0, hiraQuota);
    const pickedKata = kataPool.slice(0, kataQuota);

    selectedQuestions = [...pickedKalimat, ...pickedMod, ...pickedHira, ...pickedKata];

    // Top up if any category had fewer items than quota (e.g., 100-question test)
    if (selectedQuestions.length < config.questionCount) {
      const usedIds = new Set(selectedQuestions.map((q) => q.id));
      const remainingPool = fisherYatesShuffle(FULL_QUESTION_BANK.filter((q) => !usedIds.has(q.id)));
      selectedQuestions.push(...remainingPool.slice(0, config.questionCount - selectedQuestions.length));
    }
  } else {
    const levelMap: Record<1 | 2 | 3 | 4, QuestionCategory> = {
      1: 'hiragana',
      2: 'katakana',
      3: 'modifikasi',
      4: 'kalimat',
    };
    const targetCategory = levelMap[config.selectedLevel as 1 | 2 | 3 | 4];
    const primaryPool = fisherYatesShuffle(FULL_QUESTION_BANK.filter((q) => q.category === targetCategory));
    selectedQuestions = primaryPool.slice(0, config.questionCount);

    // If user selected 50 or 100 questions for Level 4 (Kalimat), supplement with Level 3 vocab/modifikasi
    if (selectedQuestions.length < config.questionCount) {
      const usedIds = new Set(selectedQuestions.map((q) => q.id));
      const secondaryPool = fisherYatesShuffle(
        FULL_QUESTION_BANK.filter((q) => !usedIds.has(q.id) && (q.category === 'modifikasi' || q.subType === 'vocab_reading'))
      );
      const tertiaryPool = fisherYatesShuffle(FULL_QUESTION_BANK.filter((q) => !usedIds.has(q.id)));
      const combinedBackup = [...secondaryPool, ...tertiaryPool.filter((q) => !secondaryPool.includes(q))];
      selectedQuestions.push(...combinedBackup.slice(0, config.questionCount - selectedQuestions.length));
    }
  }

  // Final Fisher-Yates shuffle on the selected question sequence & each question's 4 options
  const finalSequence = fisherYatesShuffle(selectedQuestions).slice(0, config.questionCount);

  return finalSequence.map((q, idx) => {
    const assignedMode: 'multiple_choice' | 'essay' =
      config.answerMode === 'hybrid'
        ? idx % 2 === 0
          ? 'multiple_choice'
          : 'essay'
        : config.answerMode;

    return {
      ...q,
      assignedMode,
      shuffledOptions: fisherYatesShuffle(q.options),
    };
  });
}
