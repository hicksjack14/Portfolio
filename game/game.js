// ── Constants ──────────────────────────────────────────────────────────────
const GAME_W = 480, GAME_H = 270;
const GROUND_Y = 230;
const JACK_GROUND_Y = GROUND_Y - 14; // sprite is 28 tall, center-origin → feet on ground line

// ── Song Config ────────────────────────────────────────────────────────────
const SONGS = [
  {
    idx: 0,
    label: 'BAKAR',
    sublabel: 'ALIVE',
    audioKey: 'bakar',
    audioFile: 'assets/audio/bakar-alive.mp3',
    env: 'rooftop',
    skyColors: [0xFF6B35, 0xFF8C42, 0xFFB347, 0xFFCF77],
    groundColor: 0xB5451B,
    groundTop: 0xCC5522,
    accentColor: 0xFF8C42,
    albumColor: 0xFF6B35,
    obstacleColors: { primary: 0xCC3300, secondary: 0x888888 },
    obstacles: ['skateboard', 'hydrant', 'vent'],
  },
  {
    idx: 1,
    label: 'DAFT PUNK',
    sublabel: 'LOSE YOURSELF TO DANCE',
    audioKey: 'daftpunk',
    audioFile: 'assets/audio/daft-punk-lose-yourself-to-dance.mp3',
    env: 'nightclub',
    skyColors: [0x050520, 0x0a0a3a, 0x100040, 0x1a006a],
    groundColor: 0x1a1a2e,
    groundTop: 0x00BFFF,
    accentColor: 0x00BFFF,
    albumColor: 0xFFD700,
    obstacleColors: { primary: 0xC0C0C0, secondary: 0x00BFFF },
    obstacles: ['disco', 'speaker', 'neon'],
  },
  {
    idx: 2,
    label: 'GLEN CAMPBELL',
    sublabel: 'WICHITA LINEMAN',
    audioKey: 'glen',
    audioFile: 'assets/audio/glen-campbell-wichita-lineman.mp3',
    env: 'prairie',
    skyColors: [0x87CEEB, 0xADD8E6, 0xD4E8F0, 0xF0E68C],
    groundColor: 0x8B7355,
    groundTop: 0xA0896A,
    accentColor: 0xDAA520,
    albumColor: 0xDAA520,
    obstacleColors: { primary: 0x8B4513, secondary: 0xA0896A },
    obstacles: ['pole', 'tumbleweed', 'haybale'],
  },
  {
    idx: 3,
    label: 'SOUL FOR REAL',
    sublabel: 'CANDY RAIN',
    audioKey: 'soulforreal',
    audioFile: 'assets/audio/soul-for-real-candy-rain.mp3',
    env: 'candy',
    skyColors: [0xFF9ECD, 0xFFB3D9, 0xFFC8E6, 0xFFDDF2],
    groundColor: 0xE75480,
    groundTop: 0xFF69B4,
    accentColor: 0xFF1493,
    albumColor: 0xDA70D6,
    obstacleColors: { primary: 0xFF1493, secondary: 0x9B59B6 },
    obstacles: ['lollipop', 'gumdrop', 'candycane'],
  },
  {
    idx: 4,
    label: 'TRAVIS SCOTT',
    sublabel: 'HELL OF A NIGHT',
    audioKey: 'travis',
    audioFile: 'assets/audio/travis-scott-hell-of-a-night.mp3',
    env: 'boulevard',
    skyColors: [0x12081f, 0x1f0d33, 0x2d1247, 0x3d1a5c],
    groundColor: 0x1c1c24,
    groundTop: 0x3a3a48,
    accentColor: 0xB266FF,
    albumColor: 0x6A0DAD,
    obstacleColors: { primary: 0xFF6600, secondary: 0xB266FF },
    obstacles: ['cone', 'police', 'sign'],
    duration: '4:38',
    secret: true,   // hidden until the player beats any run
  },
];

// ── Pixel Font (3×5 glyphs) ────────────────────────────────────────────────
// Crisp drawn lettering for in-world signage — canvas text blurs at this size
const PIXEL_FONT = {
  'A': [0b010,0b101,0b111,0b101,0b101], 'B': [0b110,0b101,0b110,0b101,0b110],
  'C': [0b011,0b100,0b100,0b100,0b011], 'D': [0b110,0b101,0b101,0b101,0b110],
  'E': [0b111,0b100,0b110,0b100,0b111], 'G': [0b011,0b100,0b101,0b101,0b011],
  'H': [0b101,0b101,0b111,0b101,0b101], 'I': [0b111,0b010,0b010,0b010,0b111],
  'K': [0b101,0b101,0b110,0b101,0b101], 'N': [0b101,0b111,0b111,0b101,0b101],
  'O': [0b010,0b101,0b101,0b101,0b010], 'R': [0b110,0b101,0b110,0b101,0b101],
  'S': [0b011,0b100,0b010,0b001,0b110], 'T': [0b111,0b010,0b010,0b010,0b010],
  'W': [0b101,0b101,0b111,0b111,0b101], 'X': [0b101,0b101,0b010,0b101,0b101],
  'Y': [0b101,0b101,0b010,0b010,0b010], ' ': [0, 0, 0, 0, 0],
};

function drawPixelText(g, centerX, y, str, color, px = 1) {
  const w = str.length * 4 * px - px;
  let x = Math.round(centerX - w / 2);
  g.fillStyle(color);
  for (const ch of str) {
    const glyph = PIXEL_FONT[ch];
    if (glyph) glyph.forEach((row, ry) => {
      for (let b = 0; b < 3; b++)
        if (row & (4 >> b)) g.fillRect(x + b * px, y + ry * px, px, px);
    });
    x += 4 * px;
  }
}

// ── BootScene ──────────────────────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // Loading bar — the 4 MP3s are ~30MB, so show progress instead of a black screen
    this.add.rectangle(GAME_W / 2, GAME_H / 2, 204, 12, 0x222222);
    const bar = this.add.rectangle(GAME_W / 2 - 100, GAME_H / 2, 1, 8, 0x1DB954).setOrigin(0, 0.5);
    this.add.text(GAME_W / 2, GAME_H / 2 + 16, 'LOADING TRACKS...', {
      fontSize: '6px', fontFamily: 'monospace', fill: '#888888'
    }).setOrigin(0.5);
    this.load.on('progress', p => { bar.width = Math.max(1, Math.floor(200 * p)); });
    SONGS.forEach(s => this.load.audio(s.audioKey, s.audioFile));
  }

  create() {
    this._buildJackTextures();
    this._buildWizardTexture();
    this._buildHeartTextures();
    this._buildObstacleTextures();
    this._buildUITextures();
    this.scene.start('CinematicScene');
  }

  // Texture is drawn at 2× the old grid (36×56) for finer detail, then the
  // sprite instances are scaled down 0.5 wherever they're placed — same
  // world-space footprint and physics, but each "pixel" reads half as
  // chunky once the camera zooms in during scene transitions.
  _buildJackTextures() {
    const W = 36, H = 56;
    const g = this.add.graphics();

    const drawJack = (frame) => {
      g.clear();
      // Hair — blond with darker fringe, center part shadow, strand highlight
      g.fillStyle(0xF4C430); g.fillRect(10, 0, 16, 8);
      g.fillStyle(0xDAA520); g.fillRect(10, 6, 4, 2); g.fillRect(18, 6, 4, 2); g.fillRect(24, 4, 2, 4);
      g.fillStyle(0xC98A10); g.fillRect(17, 0, 2, 3);
      g.fillStyle(0xFFD966); g.fillRect(14, 1, 3, 1);
      // Headphones — band over the hair, cups on the ears, mesh texture on cups
      g.fillStyle(0x1a1a1a); g.fillRect(8, 0, 20, 2);
      g.fillStyle(0x3a3a3a); g.fillRect(10, 1, 16, 1);
      g.fillStyle(0x1a1a1a); g.fillRect(6, 4, 4, 10); g.fillRect(26, 4, 4, 10);
      g.fillStyle(0x2d2d2d); g.fillRect(6, 6, 4, 6); g.fillRect(26, 6, 4, 6);
      g.fillStyle(0x505050);
      g.fillRect(7, 7, 1, 1); g.fillRect(7, 9, 1, 1); g.fillRect(9, 8, 1, 1);
      g.fillRect(27, 7, 1, 1); g.fillRect(27, 9, 1, 1); g.fillRect(29, 8, 1, 1);
      // Face with jaw shading, brows, blush
      g.fillStyle(0xFFCB9A); g.fillRect(10, 6, 16, 12);
      g.fillStyle(0xEEB88A); g.fillRect(10, 16, 16, 2);
      g.fillStyle(0x9C6A1E); g.fillRect(12, 7, 4, 1); g.fillRect(20, 7, 4, 1);
      g.fillStyle(0xFFB090, 0.35); g.fillRect(11, 12, 3, 2); g.fillRect(22, 12, 3, 2);
      // Eyes — whites with pupils and a glint
      g.fillStyle(0xFFFFFF); g.fillRect(12, 8, 4, 4); g.fillRect(20, 8, 4, 4);
      g.fillStyle(0x2a2a2a); g.fillRect(14, 10, 2, 2); g.fillRect(22, 10, 2, 2);
      g.fillStyle(0xFFFFFF); g.fillRect(15, 9, 1, 1); g.fillRect(23, 9, 1, 1);
      g.fillStyle(0xCC8866); g.fillRect(16, 14, 4, 2); // mouth
      g.fillStyle(0xB37155); g.fillRect(16, 15, 4, 1); // lower lip shade
      // Hoodie — white with bunched hood, drawstrings, kangaroo pocket
      g.fillStyle(0xEDEDED); g.fillRect(8, 18, 20, 18);
      g.fillStyle(0xFFFFFF); g.fillRect(10, 18, 16, 4);
      g.fillStyle(0xB0B0B0); g.fillRect(8, 18, 2, 18); g.fillRect(26, 18, 2, 18);
      // Drawstrings with aglet tips
      g.fillStyle(0x555555); g.fillRect(16, 22, 2, 7); g.fillRect(20, 22, 2, 7);
      g.fillStyle(0x333333); g.fillRect(15, 28, 4, 2); g.fillRect(19, 28, 4, 2);
      g.fillStyle(0xC8C8C8); g.fillRect(12, 28, 12, 6);
      g.fillStyle(0xA8A8A8); g.fillRect(12, 28, 12, 2);
      // Fabric fold shading under the arms for depth
      g.lineStyle(1, 0xC8C8C8, 0.7);
      g.lineBetween(9, 24, 12, 27); g.lineBetween(27, 24, 24, 27);
      // Arms with cuffs and hands
      g.fillStyle(0xEDEDED); g.fillRect(4, 18, 4, 14); g.fillRect(28, 18, 4, 14);
      g.fillStyle(0xB0B0B0); g.fillRect(4, 30, 4, 2); g.fillRect(28, 30, 4, 2);
      g.lineStyle(1, 0x8c8c8c, 0.8);
      g.lineBetween(4, 31, 8, 31); g.lineBetween(28, 31, 32, 31);
      g.fillStyle(0xFFCB9A); g.fillRect(4, 32, 4, 4); g.fillRect(28, 32, 4, 4);
      g.lineStyle(1, 0xE8A878, 0.8);
      g.lineBetween(6, 32, 6, 36); g.lineBetween(30, 32, 30, 36);
      // Legs
      g.fillStyle(0x3D6EA0);
      if (frame === 3) {
        // Jump: legs together
        g.fillRect(10, 36, 16, 16);
        g.fillStyle(0xF0F0F0); g.fillRect(10, 50, 16, 6);
        this._drawShoeDetail(g, 10, 50, 16);
      } else if (frame === 1) {
        // Passing pose — both legs straight under the body
        g.fillRect(10, 36, 8, 20); g.fillRect(18, 36, 8, 20);
        g.fillStyle(0x2E5585);
        g.fillRect(10, 44, 6, 12); g.fillRect(18, 44, 6, 12);
        g.fillStyle(0xF0F0F0);
        g.fillRect(8, 52, 10, 4); g.fillRect(16, 52, 10, 4);
        this._drawShoeDetail(g, 8, 52, 10); this._drawShoeDetail(g, 16, 52, 10);
      } else {
        // Stride poses — front leg planted, back leg bent and lifted.
        // Offsets stay within each leg's own column so the legs never
        // cross pixels (the old ±3 swap read as glitching).
        const fwd = frame === 0;
        const frontX = fwd ? 18 : 10, backX = fwd ? 10 : 18;
        const d = fwd ? 2 : -2;
        // Front leg: straight, shoe on the ground
        g.fillRect(frontX, 36, 8, 20);
        g.fillStyle(0x2E5585); g.fillRect(frontX + d, 44, 6, 12);
        g.fillStyle(0xF0F0F0); g.fillRect(frontX + d - 2, 52, 10, 4);
        this._drawShoeDetail(g, frontX + d - 2, 52, 10);
        // Back leg: bent, shoe lifted
        g.fillStyle(0x3D6EA0); g.fillRect(backX, 36, 8, 14);
        g.fillStyle(0x2E5585); g.fillRect(backX - d, 42, 6, 8);
        g.fillStyle(0xF0F0F0); g.fillRect(backX - d - 2, 48, 10, 4);
        this._drawShoeDetail(g, backX - d - 2, 48, 10);
      }
      g.generateTexture(`jack_${frame}`, W, H);
    };

    for (let i = 0; i < 4; i++) drawJack(i);
    g.destroy();
  }

  // Laces + sole line, shared by every shoe drawn above
  _drawShoeDetail(g, x, y, w) {
    g.lineStyle(1, 0x333333, 0.8);
    g.lineBetween(x + 2, y + 1, x + w - 3, y + 1);
    g.lineBetween(x + 3, y, x + w - 4, y + 2);
    g.fillStyle(0x0d0d0d, 0.5); g.fillRect(x, y + 3, w, 1);
  }

  _buildWizardTexture() {
    const W = 28, H = 42;
    const g = this.add.graphics();
    // Hat — tall crooked cone with brim, gold band, bent tip
    g.fillStyle(0x4a4a66); g.fillRect(2, 12, 20, 3);   // brim
    g.fillStyle(0x5b5b80); g.fillRect(5, 4, 12, 9);    // cone mid
    g.fillStyle(0x4a4a66); g.fillRect(8, 1, 7, 4);     // cone upper
    g.fillRect(12, 0, 5, 2);                             // bent tip
    g.fillStyle(0x6d6d96); g.fillRect(6, 5, 3, 7);     // highlight
    g.fillStyle(0xE6C200); g.fillRect(5, 11, 12, 2);   // gold band
    g.fillStyle(0xFFE066); g.fillRect(10, 11, 2, 2);   // buckle
    // Face
    g.fillStyle(0xFFCB9A); g.fillRect(6, 15, 12, 7);
    g.fillStyle(0xE8A878); g.fillRect(6, 15, 12, 1);   // brow shadow
    g.fillStyle(0xF0F0F0); g.fillRect(6, 16, 4, 1); g.fillRect(14, 16, 4, 1); // bushy brows
    g.fillStyle(0xFFFFFF); g.fillRect(7, 17, 3, 2); g.fillRect(14, 17, 3, 2); // eye whites
    g.fillStyle(0x3355AA); g.fillRect(8, 18, 2, 1); g.fillRect(15, 18, 2, 1); // blue eyes
    g.fillStyle(0xD09060); g.fillRect(11, 19, 2, 2);   // nose
    // Robe — deep purple with shading
    g.fillStyle(0x5B2C6F); g.fillRect(3, 23, 18, 19);
    g.fillStyle(0x6C3483); g.fillRect(3, 23, 3, 19);   // left light
    g.fillStyle(0x4A235A); g.fillRect(18, 23, 3, 19);  // right shade
    g.fillStyle(0x3B1A4A); g.fillRect(3, 40, 18, 2);   // hem shadow
    // Gold stars on robe
    g.fillStyle(0xE6C200);
    g.fillRect(5, 34, 2, 2); g.fillRect(17, 36, 2, 2); g.fillRect(8, 38, 2, 2);
    // Rope belt
    g.fillStyle(0xC8A84B); g.fillRect(3, 32, 18, 2);
    g.fillRect(13, 34, 2, 4); g.fillStyle(0xA8883B); g.fillRect(13, 37, 2, 1);
    // Beard — long, layered strands over the chest
    g.fillStyle(0xF0F0F0); g.fillRect(5, 21, 14, 8);
    g.fillRect(7, 29, 10, 3); g.fillRect(9, 32, 6, 2);
    g.fillStyle(0xD8D8D8);
    g.fillRect(7, 22, 1, 9); g.fillRect(11, 22, 1, 11); g.fillRect(15, 22, 1, 9);
    // Sleeve arm reaching to the staff
    g.fillStyle(0x5B2C6F); g.fillRect(18, 26, 6, 4);
    g.fillStyle(0x4A235A); g.fillRect(18, 29, 6, 1);
    g.fillStyle(0xFFCB9A); g.fillRect(23, 26, 3, 3);   // hand
    // Staff — gnarled wood with glowing crystal orb
    g.fillStyle(0x6B4226); g.fillRect(24, 10, 2, 32);
    g.fillStyle(0x8B5A2B); g.fillRect(24, 10, 1, 32);
    g.fillStyle(0x9B59B6); g.fillRect(22, 5, 6, 6);    // orb
    g.fillStyle(0xC39BD3); g.fillRect(23, 6, 3, 3);    // inner glow
    g.fillStyle(0xE8DAEF); g.fillRect(23, 6, 1, 1);    // glint
    g.generateTexture('wizard', W, H);
    g.destroy();
  }

  _buildHeartTextures() {
    const g = this.add.graphics();
    // Full heart
    g.fillStyle(0xFF2244);
    g.fillRect(1, 0, 3, 2); g.fillRect(6, 0, 3, 2);
    g.fillRect(0, 1, 10, 5);
    g.fillRect(1, 6, 8, 2); g.fillRect(2, 8, 6, 1);
    g.fillRect(3, 9, 4, 1); g.fillRect(4, 10, 2, 1);
    g.generateTexture('heart', 10, 11);
    // Empty heart
    g.clear();
    g.fillStyle(0x555555);
    g.fillRect(1, 0, 3, 2); g.fillRect(6, 0, 3, 2);
    g.fillRect(0, 1, 1, 5); g.fillRect(9, 1, 1, 5);
    g.fillRect(1, 6, 1, 2); g.fillRect(8, 6, 1, 2);
    g.fillRect(2, 8, 1, 1); g.fillRect(7, 8, 1, 1);
    g.fillRect(3, 9, 1, 1); g.fillRect(6, 9, 1, 1);
    g.fillRect(4, 10, 2, 1);
    g.generateTexture('heart_empty', 10, 11);
    g.destroy();
  }

  _buildObstacleTextures() {
    const g = this.add.graphics();

    // Skateboard (24×8) — short
    g.clear();
    g.fillStyle(0xCC3300); g.fillRect(0, 0, 24, 5);
    g.fillStyle(0xAA2200); g.fillRect(0, 0, 24, 1);
    g.fillStyle(0x333333); g.fillRect(3, 4, 4, 4); g.fillRect(17, 4, 4, 4);
    g.fillStyle(0x666666); g.fillRect(4, 5, 2, 2); g.fillRect(18, 5, 2, 2);
    g.generateTexture('obs_skateboard', 24, 8);

    // Fire hydrant (12×20) — tall
    g.clear();
    g.fillStyle(0xCC0000); g.fillRect(2, 0, 8, 4); g.fillRect(0, 4, 12, 14); g.fillRect(2, 18, 8, 2);
    g.fillStyle(0xFF4444); g.fillRect(1, 5, 2, 4); g.fillRect(9, 5, 2, 4);
    g.fillStyle(0xAA0000); g.fillRect(3, 2, 6, 2);
    g.generateTexture('obs_hydrant', 12, 20);

    // Disco ball (16×18) — tall-ish
    g.clear();
    g.fillStyle(0x888888); g.fillRect(7, 0, 2, 3);
    g.fillStyle(0xC0C0C0);
    g.fillRect(4, 3, 8, 2); g.fillRect(2, 5, 12, 2);
    g.fillRect(0, 7, 16, 6); g.fillRect(2, 13, 12, 2); g.fillRect(4, 15, 8, 2);
    const tileColors = [0x00BFFF, 0xFFFFFF, 0x00FFFF, 0xADD8E6];
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 4; col++) {
        g.fillStyle(tileColors[(row + col) % 4]);
        g.fillRect(2 + col * 3, 8 + row * 2, 2, 1);
      }
    g.generateTexture('obs_disco', 16, 17);

    // Speaker stack (14×26) — tall
    g.clear();
    g.fillStyle(0x1a1a1a); g.fillRect(0, 0, 14, 26);
    g.fillStyle(0x333333); g.fillRect(1, 1, 12, 11); g.fillRect(1, 14, 12, 11);
    g.fillStyle(0x555555); g.fillRect(3, 3, 8, 7); g.fillRect(3, 16, 8, 7);
    g.fillStyle(0x00BFFF); g.fillRect(6, 6, 2, 2); g.fillRect(6, 19, 2, 2);
    g.generateTexture('obs_speaker', 14, 26);

    // Telephone pole (10×30) — very tall
    g.clear();
    g.fillStyle(0x8B4513); g.fillRect(4, 0, 2, 30);
    g.fillRect(0, 7, 10, 2); g.fillRect(1, 15, 8, 2);
    g.fillStyle(0x4444CC); g.fillRect(0, 5, 2, 4); g.fillRect(8, 5, 2, 4);
    g.fillRect(1, 13, 2, 4); g.fillRect(7, 13, 2, 4);
    g.generateTexture('obs_pole', 10, 30);

    // Tumbleweed (16×16) — short rolling
    g.clear();
    g.fillStyle(0xA0896A);
    g.fillRect(4, 0, 8, 2); g.fillRect(2, 2, 12, 2);
    g.fillRect(0, 4, 16, 8); g.fillRect(2, 12, 12, 2); g.fillRect(4, 14, 8, 2);
    g.fillStyle(0x7A6348);
    g.fillRect(7, 0, 2, 16); g.fillRect(0, 7, 16, 2);
    g.fillRect(2, 2, 2, 2); g.fillRect(12, 2, 2, 2);
    g.fillRect(2, 12, 2, 2); g.fillRect(12, 12, 2, 2);
    g.generateTexture('obs_tumbleweed', 16, 16);

    // Lollipop (12×26) — tall
    g.clear();
    g.fillStyle(0xFF1493);
    g.fillRect(2, 0, 8, 2); g.fillRect(0, 2, 12, 8); g.fillRect(2, 10, 8, 2);
    g.fillStyle(0xFF69B4); g.fillRect(2, 1, 5, 4);
    g.fillStyle(0xFFFFFF); g.fillRect(2, 4, 2, 2); g.fillRect(7, 7, 2, 2);
    g.fillStyle(0xF5DEB3); g.fillRect(5, 12, 2, 14);
    g.generateTexture('obs_lollipop', 12, 26);

    // Gumdrop (14×14) — short
    g.clear();
    g.fillStyle(0x9B59B6);
    g.fillRect(4, 0, 6, 2); g.fillRect(2, 2, 10, 2);
    g.fillRect(0, 4, 14, 7); g.fillRect(2, 11, 10, 2); g.fillRect(0, 12, 14, 2);
    g.fillStyle(0xB067CE); g.fillRect(3, 1, 3, 3);
    g.fillStyle(0xFFFFFF); g.fillRect(4, 3, 1, 1); g.fillRect(9, 6, 1, 1);
    g.generateTexture('obs_gumdrop', 14, 14);

    // Rooftop AC vent (28×12) — wide, low  [Bakar - rooftop]
    g.clear();
    g.fillStyle(0x666666); g.fillRect(0, 2, 28, 10);
    g.fillStyle(0x888888); g.fillRect(0, 0, 28, 3);
    g.fillStyle(0x444444); g.fillRect(2, 4, 24, 6);
    g.fillStyle(0x777777);
    for (let x = 4; x < 26; x += 5) g.fillRect(x, 5, 2, 4); // slats
    g.fillStyle(0x555555); g.fillRect(8, 0, 12, 2); // top cap
    g.generateTexture('obs_vent', 28, 12);

    // Neon sign (24×18) — glowing bar  [Daft Punk - nightclub]
    g.clear();
    g.fillStyle(0x111133); g.fillRect(0, 4, 24, 10);
    g.fillStyle(0xFF00FF); g.fillRect(0, 4, 24, 2);  // top strip
    g.fillRect(0, 12, 24, 2);                          // bottom strip
    g.fillStyle(0x00FFFF); g.fillRect(0, 7, 24, 2);   // mid band
    g.fillStyle(0xFF44FF, 0.6); g.fillRect(2, 6, 20, 6); // glow fill
    g.fillStyle(0xFFFFFF); g.fillRect(6, 8, 2, 1); g.fillRect(11, 8, 2, 1); g.fillRect(16, 8, 2, 1); // dots
    g.fillStyle(0x444444); g.fillRect(10, 0, 4, 4);  // mount bracket
    g.fillStyle(0x444444); g.fillRect(10, 14, 4, 4);
    g.generateTexture('obs_neon', 24, 18);

    // Hay bale (22×16) — wide, medium  [Glen Campbell - prairie]
    g.clear();
    g.fillStyle(0xC8A84B); g.fillRect(0, 0, 22, 16);
    g.fillStyle(0xB8983B); g.fillRect(0, 0, 22, 3);  // top shadow
    g.fillStyle(0xD4B655); g.fillRect(1, 4, 20, 2);  // binding twine
    g.fillRect(1, 10, 20, 2);
    g.fillStyle(0xE0C460); g.fillRect(3, 1, 2, 3); g.fillRect(9, 0, 2, 4); g.fillRect(15, 1, 2, 3);
    g.fillStyle(0xA07830); g.fillRect(0, 14, 22, 2); // ground shadow
    g.generateTexture('obs_haybale', 22, 16);

    // Candy cane (10×28) — tall, curved  [Soul for Real - candy]
    g.clear();
    g.fillStyle(0xFF2222);
    g.fillRect(3, 0, 5, 5); g.fillRect(5, 0, 5, 10); // hook top
    g.fillRect(3, 5, 2, 3);
    g.fillStyle(0xFFFFFF);
    g.fillRect(5, 10, 4, 18); // shaft
    g.fillStyle(0xFF2222);
    g.fillRect(5, 10, 4, 3); g.fillRect(5, 16, 4, 3); g.fillRect(5, 22, 4, 3); // red stripes
    g.fillStyle(0xDD0000); g.fillRect(5, 28, 4, 2); // base
    g.generateTexture('obs_candycane', 10, 30);

    // Traffic cone (12×12) — short  [Travis Scott - boulevard]
    g.clear();
    g.fillStyle(0xFF6600); g.fillRect(4, 0, 4, 3); g.fillRect(3, 3, 6, 4); g.fillRect(2, 7, 8, 3);
    g.fillStyle(0xFFFFFF); g.fillRect(3, 4, 6, 2);   // reflective band
    g.fillStyle(0xCC4400); g.fillRect(0, 10, 12, 2); // base
    g.generateTexture('obs_cone', 12, 12);

    // LAPD police car (36×16), two frames so the light bar flashes red/blue
    const drawPolice = (redLit) => {
      g.clear();
      g.fillStyle(0x14141a); g.fillRect(2, 8, 32, 6);   // black body
      g.fillRect(8, 4, 20, 5);                            // cabin
      g.fillStyle(0xE8E8E8); g.fillRect(12, 8, 12, 6);  // white door panel
      g.fillStyle(0x2a2a44); g.fillRect(10, 5, 6, 3); g.fillRect(19, 5, 6, 3); // windows
      g.fillStyle(0x14141a); g.fillRect(6, 12, 7, 4); g.fillRect(24, 12, 7, 4); // wheels
      g.fillStyle(0x444444); g.fillRect(8, 13, 3, 2); g.fillRect(26, 13, 3, 2); // hubs
      g.fillStyle(0xFFEE88); g.fillRect(34, 9, 2, 2);   // headlight
      g.fillStyle(0xFF2222); g.fillRect(0, 9, 2, 2);    // taillight
      // Light bar — lit side pops taller and brighter
      g.fillStyle(0x222222); g.fillRect(13, 1, 12, 3);
      if (redLit) {
        g.fillStyle(0xFF2233); g.fillRect(13, 0, 6, 4);
        g.fillStyle(0x3344FF, 0.45); g.fillRect(19, 1, 6, 3);
      } else {
        g.fillStyle(0xFF2233, 0.45); g.fillRect(13, 1, 6, 3);
        g.fillStyle(0x3355FF); g.fillRect(19, 0, 6, 4);
      }
      g.generateTexture(redLit ? 'obs_police0' : 'obs_police1', 36, 16);
    };
    drawPolice(true); drawPolice(false);

    // Neon street sign (14×28) — tall  [Travis Scott - boulevard]
    g.clear();
    g.fillStyle(0x222230); g.fillRect(6, 8, 2, 20);   // pole
    g.fillStyle(0x16121f); g.fillRect(0, 0, 14, 10);  // sign box
    g.fillStyle(0xFF44CC); g.fillRect(1, 1, 12, 2);
    g.fillStyle(0x00EEFF); g.fillRect(1, 4, 12, 2);
    g.fillStyle(0xB266FF); g.fillRect(1, 7, 12, 2);
    g.generateTexture('obs_sign', 14, 28);

    // Background traffic car (30×11) — boulevard ambience, not an obstacle
    g.clear();
    g.fillStyle(0x0a0a14); g.fillRect(0, 4, 30, 5); g.fillRect(6, 0, 16, 5);
    g.fillStyle(0x2a2a44); g.fillRect(8, 1, 5, 3); g.fillRect(15, 1, 5, 3); // windows
    g.fillStyle(0x111118); g.fillRect(4, 8, 6, 3); g.fillRect(20, 8, 6, 3); // wheels
    g.fillStyle(0xFFEE99); g.fillRect(28, 5, 2, 2);  // headlight
    g.fillStyle(0xFF3344); g.fillRect(0, 5, 2, 2);   // taillight
    g.generateTexture('bgcar', 30, 11);

    g.destroy();
  }

  _buildUITextures() {
    const g = this.add.graphics();
    // Flag (16×10)
    g.fillStyle(0xFFD700); g.fillRect(0, 0, 16, 10);
    g.fillStyle(0x00AA00); g.fillRect(0, 3, 16, 4);
    g.generateTexture('flag', 16, 10);
    // Door (20×30)
    g.clear();
    g.fillStyle(0x6B3A1F); g.fillRect(0, 0, 20, 30);
    g.fillStyle(0x8B4513); g.fillRect(1, 1, 18, 28);
    g.fillStyle(0x6B3A1F); g.fillRect(3, 3, 14, 20);
    g.fillStyle(0xFFD700); g.fillRect(14, 14, 3, 3);
    g.generateTexture('door', 20, 30);
    // Flagpole (10×55) — tall metal pole with waving flag on top
    g.clear();
    g.fillStyle(0xAAAAAA); g.fillRect(4, 0, 3, 55);   // pole
    g.fillStyle(0xCCCCCC); g.fillRect(4, 0, 1, 55);   // pole highlight
    g.fillStyle(0x888888); g.fillRect(6, 0, 1, 55);   // pole shadow
    g.fillStyle(0xFFD700); g.fillRect(4, 0, 6, 5);    // flag body
    g.fillRect(4, 5, 5, 4);
    g.fillRect(4, 9, 4, 3);
    g.fillStyle(0xFFAA00); g.fillRect(5, 1, 4, 2);    // flag stripe
    g.fillStyle(0xFFFF88); g.fillRect(5, 4, 3, 1);    // flag shine
    g.fillStyle(0xFFCC00); g.fillRect(3, 54, 5, 1);   // base nub
    g.generateTexture('flagpole', 10, 55);
    g.destroy();
  }
}

class CinematicScene extends Phaser.Scene {
  constructor() { super('CinematicScene'); }

  create() {
    this._drawRoom();
    this._addTitle();
    this._addPlayButton();
  }

  _addTitle() {
    const title = this.add.text(GAME_W / 2, 16, 'TRACKZ', {
      fontSize: '18px', fontFamily: 'monospace', fill: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(2, 2, '#000000', 0, true, true);
    this.add.text(GAME_W / 2, 31, 'A JACK HICKS GAME', {
      fontSize: '7px', fontFamily: 'monospace', fill: '#1DB954', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(1, 1, '#000000', 0, true, true);
    this.tweens.add({ targets: title, alpha: 0.85, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _drawRoom() {
    const g = this.add.graphics();
    const W = GAME_W, H = GAME_H;

    // ─── WALL ──────────────────────────────────────────────────────────────
    g.fillStyle(0x0c1020); g.fillRect(0, 0, W, H);
    // Pixel dither texture on wall
    g.fillStyle(0x0f1428);
    for (let wy = 0; wy < 210; wy += 4) {
      for (let wx = 0; wx < W; wx += 8) {
        if ((wy / 4 + wx / 8) % 2 === 0) g.fillRect(wx, wy, 2, 2);
      }
    }
    g.fillStyle(0x090c18); g.fillRect(0, 0, W, 14); // dark ceiling band

    // ─── WINDOW GLOW (behind window frame) ────────────────────────────────
    g.fillStyle(0x1a2a4a, 0.35); g.fillRect(5, 3, 92, 100);

    // ─── WINDOW ────────────────────────────────────────────────────────────
    g.fillStyle(0x2e1c0a); g.fillRect(16, 6, 64, 84); // outer frame
    g.fillStyle(0x060b1c); g.fillRect(20, 10, 56, 76); // night sky
    // Moon (crescent)
    g.fillStyle(0xDDE4B8); g.fillRect(55, 14, 12, 12);
    g.fillStyle(0x060b1c); g.fillRect(58, 14, 9, 8);
    // Stars
    g.fillStyle(0xCCCCBB);
    [[24,16],[32,20],[40,13],[50,24],[27,32],[45,28],[36,40],[24,46]].forEach(([sx,sy]) => g.fillRect(sx,sy,1,1));
    // Window cross bars
    g.fillStyle(0x2e1c0a);
    g.fillRect(47, 10, 2, 76); // vertical
    g.fillRect(20, 48, 56, 2); // horizontal
    // Venetian blind slats
    g.fillStyle(0x7a7a7a);
    for (let bi = 0; bi < 10; bi++) {
      if (bi !== 3 && bi !== 7) g.fillRect(20, 10 + bi * 7, 56, 2);
    }
    // Window sill
    g.fillStyle(0x2e1c0a); g.fillRect(14, 90, 68, 5);
    g.fillStyle(0x4a3018); g.fillRect(15, 90, 66, 2);

    // ─── FLOOR (perspective — fills space behind desk and in front) ───────
    // Full floor fill first
    g.fillStyle(0x1a1208); g.fillRect(0, 95, W, H - 95);
    // Wall/floor seam
    g.fillStyle(0x2a2018); g.fillRect(0, 93, W, 4);
    // Perspective plank lines converging toward center vanishing point (240,95)
    g.fillStyle(0x140e06);
    for (let bx = -60; bx <= W + 60; bx += 38) {
      const vx = 240, vy = 95;
      for (let step = 0; step < 55; step++) {
        const t = step / 55;
        const px = Math.floor(bx + (vx - bx) * t);
        const py = Math.floor(H + (vy - H) * t);
        if (py >= 96 && py < H) g.fillRect(px, py, 1, 1);
      }
    }
    // Subtle cross-planks (horizontal) to complete the grid feel
    g.fillStyle(0x201408);
    for (let fy = 110; fy < H; fy += 22) g.fillRect(0, fy, W, 1);

    // ─── ALBUM ART POSTERS ────────────────────────────────────────────────
    this._drawCandyRain(g, 88, 14, 46, 64);
    this._drawWichitaLineman(g, 140, 20, 42, 58);
    this._drawRandomAccessMemories(g, 332, 8, 44, 58);
    this._drawAlive(g, 382, 8, 38, 54);

    // ─── BED (left, against back-left wall) ───────────────────────────────
    g.fillStyle(0x241808); g.fillRect(0, 100, 118, 55);
    g.fillStyle(0x3c2814); g.fillRect(0, 100, 118, 4);
    g.fillStyle(0x180e04); g.fillRect(0, 100, 4, 55); g.fillRect(114, 100, 4, 55);
    g.fillStyle(0x2a1a0c);
    for (let s = 12; s < 110; s += 16) g.fillRect(s, 106, 3, 46);
    // Mattress
    g.fillStyle(0xE8E2D8); g.fillRect(2, 122, 116, 32);
    g.fillStyle(0xD4CEC4); g.fillRect(2, 122, 116, 3);
    // Pillows
    g.fillStyle(0xF4F2EE); g.fillRect(5, 124, 50, 20);
    g.fillStyle(0xE8E6E2); g.fillRect(5, 124, 50, 3); g.fillRect(5, 124, 3, 20);
    g.fillStyle(0xF0EEE8); g.fillRect(62, 126, 48, 18);
    g.fillStyle(0xE4E2DC); g.fillRect(62, 126, 48, 3);
    // Duvet
    g.fillStyle(0x1a3c58); g.fillRect(2, 140, 116, 16);
    g.fillStyle(0x1e4870); g.fillRect(2, 140, 116, 3);
    g.fillStyle(0x162e46);
    for (let fold = 10; fold < 116; fold += 16) g.fillRect(fold, 143, 2, 11);
    // Bed front face (visible from above angle)
    g.fillStyle(0x180e04); g.fillRect(0, 156, 118, 8);
    g.fillStyle(0x100806); g.fillRect(0, 163, 118, 2);

    // ─── DESK (back against wall, top surface clearly visible) ────────────
    // deskY=148: desk top at y=148, front face ends at y=174
    // Chair at chY=215: 41px of visible floor gap between them
    const deskX = 118, deskY = 148, deskW = 276, deskH = 14;
    // Desk top surface (lighter — we're looking slightly down at it)
    g.fillStyle(0x3a2c1e); g.fillRect(deskX, deskY, deskW, deskH);
    g.fillStyle(0x4a3c2c); g.fillRect(deskX, deskY, deskW, 3);       // top highlight
    g.fillStyle(0x2e2016); g.fillRect(deskX, deskY + 10, deskW, 4);  // surface shadow
    // Front face (darker — faces the viewer)
    g.fillStyle(0x1a1008); g.fillRect(deskX, deskY + deskH, deskW, 12);
    g.fillStyle(0x100804); g.fillRect(deskX, deskY + deskH + 11, deskW, 2);
    // Desk legs
    g.fillStyle(0x140c04);
    g.fillRect(deskX + 6, deskY + deskH + 13, 10, 50);
    g.fillRect(deskX + deskW - 16, deskY + deskH + 13, 10, 50);
    g.fillStyle(0x0c0802);
    g.fillRect(deskX + 16, deskY + deskH + 13, 2, 50);
    g.fillRect(deskX + deskW - 6, deskY + deskH + 13, 2, 50);

    // ─── PC TOWER (on floor beside desk, same depth as desk back) ─────────
    g.fillStyle(0x181820); g.fillRect(392, 116, 24, 38);
    g.fillStyle(0x22222e); g.fillRect(392, 116, 24, 3); g.fillRect(392, 116, 3, 38);
    g.fillStyle(0x0a0a12); g.fillRect(416, 119, 4, 35);  // right face depth
    g.fillStyle(0x00EEFF); g.fillRect(395, 128, 17, 3);  // LED
    g.fillStyle(0x00FF88); g.fillRect(396, 119, 4, 4);   // power
    g.fillStyle(0x0c0c14); g.fillRect(394, 136, 18, 2);  // disc slot

    // ─── LEFT MONITOR (3D depth, sitting on desk) ──────────────────────────
    const lm = { x: 124, y: 96, w: 66, h: 52 };
    g.fillStyle(0x060610); g.fillRect(lm.x + lm.w, lm.y + 4, 5, lm.h);
    g.fillRect(lm.x + 4, lm.y + lm.h, lm.w + 1, 4);
    g.fillStyle(0x161622); g.fillRect(lm.x, lm.y, lm.w, lm.h);
    g.fillStyle(0x2a2a3c); g.fillRect(lm.x, lm.y, lm.w, 3);
    g.fillStyle(0x22222e); g.fillRect(lm.x, lm.y, 2, lm.h);
    g.fillStyle(0x0d1828); g.fillRect(lm.x + 3, lm.y + 3, lm.w - 6, lm.h - 10);
    g.fillStyle(0x1c2a3a); g.fillRect(lm.x + 5, lm.y + 7, 32, 24);
    g.fillStyle(0x2a3a4e); g.fillRect(lm.x + 5, lm.y + 7, 32, 4);
    g.fillStyle(0x1e1e2a); g.fillRect(lm.x + 30, lm.y + lm.h, 6, 4);
    g.fillRect(lm.x + 22, lm.y + lm.h + 4, 22, 3);

    // ─── RIGHT MONITOR (3D depth, sitting on desk) ─────────────────────────
    const rm = { x: 302, y: 96, w: 66, h: 52 };
    g.fillStyle(0x060610); g.fillRect(rm.x + rm.w, rm.y + 4, 5, rm.h);
    g.fillRect(rm.x + 4, rm.y + rm.h, rm.w + 1, 4);
    g.fillStyle(0x161622); g.fillRect(rm.x, rm.y, rm.w, rm.h);
    g.fillStyle(0x2a2a3c); g.fillRect(rm.x, rm.y, rm.w, 3);
    g.fillStyle(0x22222e); g.fillRect(rm.x, rm.y, 2, rm.h);
    g.fillStyle(0x0a0e14); g.fillRect(rm.x + 3, rm.y + 3, rm.w - 6, rm.h - 10);
    [[0x4488FF,0],[0x44CC88,6],[0xFFAA44,0],[0x4488FF,6],[0xCC88FF,0],[0x44CC88,6]].forEach(([col,ind],cl) => {
      g.fillStyle(col); g.fillRect(rm.x + 5 + ind, rm.y + 7 + cl * 6, 14 + (cl % 3) * 8, 2);
    });
    g.fillStyle(0x1e1e2a); g.fillRect(rm.x + 30, rm.y + rm.h, 6, 4);
    g.fillRect(rm.x + 22, rm.y + rm.h + 4, 22, 3);

    // ─── CENTER MONITOR (Spotify, 3D depth, sitting on desk) ───────────────
    const cm = { x: 196, y: 66, w: 100, h: 82 };
    g.fillStyle(0x040408); g.fillRect(cm.x + cm.w, cm.y + 5, 7, cm.h);
    g.fillRect(cm.x + 5, cm.y + cm.h, cm.w + 2, 7);
    g.fillStyle(0x1DB954, 0.07); g.fillRect(cm.x - 22, cm.y - 12, cm.w + 44, cm.h + 50);
    g.fillStyle(0x181824); g.fillRect(cm.x, cm.y, cm.w, cm.h);
    g.fillStyle(0x2e2e42); g.fillRect(cm.x, cm.y, cm.w, 3); g.fillRect(cm.x, cm.y, 3, cm.h);
    g.fillStyle(0x101018); g.fillRect(cm.x + cm.w - 2, cm.y, 2, cm.h);
    const scrX = cm.x + 4, scrY = cm.y + 4, scrW = cm.w - 8, scrH = cm.h - 14;
    g.fillStyle(0x121212); g.fillRect(scrX, scrY, scrW, scrH);
    g.fillStyle(0x000000); g.fillRect(scrX, scrY, scrW, 11);
    g.fillStyle(0x1DB954); g.fillRect(scrX + 3, scrY + 2, 6, 7);
    g.fillStyle(0x888888); g.fillRect(scrX + 12, scrY + 3, 30, 2);
    g.fillStyle(0x444444); g.fillRect(scrX + 12, scrY + 7, 20, 1);
    const albumCs = [0xDA70D6, 0xDAA520, 0xC0C0C0, 0xFF6B35];
    for (let i = 0; i < 4; i++) {
      const rowY = scrY + 13 + i * 14;
      g.fillStyle(albumCs[i]); g.fillRect(scrX + 3, rowY, 9, 10);
      g.fillStyle(0xFFFFFF, 0.14); g.fillRect(scrX + 3, rowY, 9, 2);
      g.fillStyle(0xDDDDDD); g.fillRect(scrX + 15, rowY + 2, 24, 2);
      g.fillStyle(0x666666); g.fillRect(scrX + 15, rowY + 7, 16, 1);
    }
    g.fillStyle(0x000000); g.fillRect(scrX, scrY + scrH - 8, scrW, 8);
    g.fillStyle(0x333333); g.fillRect(scrX + 3, scrY + scrH - 4, scrW - 6, 2);
    g.fillStyle(0x1DB954); g.fillRect(scrX + 3, scrY + scrH - 4, Math.floor((scrW - 6) * 0.35), 2);
    g.fillStyle(0x1DB954); g.fillRect(scrX + 3 + Math.floor((scrW - 6) * 0.35), scrY + scrH - 5, 2, 4);
    g.fillStyle(0x202030); g.fillRect(cm.x + 46, cm.y + cm.h, 8, 6);
    g.fillRect(cm.x + 32, cm.y + cm.h + 6, 36, 3);
    // Side monitor glow
    g.fillStyle(0x1a3a6a, 0.10); g.fillRect(lm.x - 8, lm.y - 4, lm.w + 18, lm.h + 20);
    g.fillStyle(0x1a4a3a, 0.10); g.fillRect(rm.x - 8, rm.y - 4, rm.w + 18, rm.h + 20);

    // ─── KEYBOARD & MOUSE (on desk top surface) ────────────────────────────
    g.fillStyle(0x1c1c2c); g.fillRect(192, deskY + 2, 56, 9);
    g.fillStyle(0x28283e); g.fillRect(193, deskY + 3, 54, 7);
    g.fillStyle(0x0c0c1c);
    for (let k = 0; k < 9; k++) g.fillRect(195 + k * 5, deskY + 4, 4, 5);
    g.fillStyle(0x1c1c2c); g.fillRect(252, deskY + 2, 13, 9);
    g.fillStyle(0x242434); g.fillRect(253, deskY + 3, 5, 8); g.fillRect(259, deskY + 3, 5, 8);
    g.fillStyle(0x00FF88); g.fillRect(256, deskY + 2, 2, 1);

    // ─── DESK MUG ─────────────────────────────────────────────────────────
    g.fillStyle(0x4a3820); g.fillRect(164, deskY - 12, 14, 12);
    g.fillStyle(0x3a2810); g.fillRect(164, deskY - 12, 14, 2);
    g.fillStyle(0x180c04); g.fillRect(165, deskY - 10, 12, 8);
    g.fillStyle(0xAA2200); g.fillRect(166, deskY - 6, 10, 2);
    g.fillStyle(0x4a3820); g.fillRect(178, deskY - 10, 4, 8);
    g.fillStyle(0x888899, 0.3);
    g.fillRect(167, deskY - 16, 1, 3); g.fillRect(170, deskY - 18, 1, 4); g.fillRect(173, deskY - 15, 1, 3);

    // ─── BOOKSHELF (far right, against back wall) ──────────────────────────
    const bsX = 418, bsY = 50, bsW = 62, bsH = 110;
    g.fillStyle(0x28180a); g.fillRect(bsX, bsY, bsW, bsH);
    g.fillStyle(0x382812); g.fillRect(bsX, bsY, bsW, 4);
    g.fillStyle(0x181006); g.fillRect(bsX, bsY, 4, bsH); g.fillRect(bsX + bsW - 4, bsY, 4, bsH);
    g.fillStyle(0x0a0a12); g.fillRect(bsX + bsW, bsY + 4, 5, bsH); // depth
    const bookPalette = [
      [0xCC2200, 0x2244CC, 0x22AA44, 0xFFAA00, 0x882288, 0xCC4422, 0x2288CC],
      [0x1122CC, 0xEE8800, 0x228822, 0xCC1144, 0x44AACC, 0x665522, 0x8822CC],
      [0x882200, 0x2244BB, 0xAACC22, 0xCC4400, 0x6622BB, 0xCC7722, 0x228866],
    ];
    for (let sh = 0; sh < 3; sh++) {
      const shelfY = bsY + 6 + sh * 34;
      g.fillStyle(0x201408); g.fillRect(bsX + 4, shelfY + 26, bsW - 8, 4);
      g.fillStyle(0x2e1e0e); g.fillRect(bsX + 4, shelfY + 26, bsW - 8, 2);
      let bx = bsX + 6;
      for (let b = 0; b < bookPalette[sh].length; b++) {
        const bw = 6 + (b % 4 === 0 ? 2 : b % 3 === 0 ? 3 : 0);
        if (bx + bw > bsX + bsW - 6) break;
        g.fillStyle(bookPalette[sh][b]); g.fillRect(bx, shelfY, bw, 26);
        g.fillStyle(0xFFFFFF, 0.1); g.fillRect(bx, shelfY, bw, 2);
        bx += bw + 1;
      }
    }

    // ─── GAMING CHAIR (smaller, center at x=239) ──────────────────────────
    // Back 38px wide (was 46), 48px tall (was 60). chX=220 keeps center=239.
    const chX = 220, chY = 215;
    g.fillStyle(0x000000, 0.18); g.fillRect(chX + 4, chY - 50, 44, 70); // shadow
    g.fillStyle(0x0a0a12); g.fillRect(chX + 38, chY - 48, 4, 56);        // back side depth
    g.fillStyle(0x16161e); g.fillRect(chX, chY - 48, 38, 52);             // back face
    g.fillStyle(0x22222e); g.fillRect(chX, chY - 48, 38, 3);
    g.fillStyle(0x0e0e16); g.fillRect(chX, chY - 48, 3, 52); g.fillRect(chX + 35, chY - 48, 3, 52);
    g.fillStyle(0xCC0020); g.fillRect(chX + 2, chY - 44, 4, 44);          // red stripe L
    g.fillRect(chX + 32, chY - 44, 4, 44);                                 // red stripe R
    g.fillStyle(0x1e1e2c); g.fillRect(chX + 6, chY - 44, 26, 44);        // inner padding
    g.fillStyle(0x0a0a18); g.fillRect(chX + 10, chY - 38, 18, 1);        // stitch top
    g.fillRect(chX + 10, chY - 8, 18, 1);                                  // stitch bottom
    g.fillStyle(0x0e0e16); g.fillRect(chX + 7, chY - 60, 24, 12);        // headrest outer
    g.fillStyle(0x1a1a28); g.fillRect(chX + 9, chY - 58, 20, 10);        // headrest inner
    g.fillStyle(0x080810); g.fillRect(chX + 29, chY - 58, 3, 10);        // headrest depth
    g.fillStyle(0x1c1c28); g.fillRect(chX - 5, chY, 48, 10);             // seat top
    g.fillStyle(0x26263a); g.fillRect(chX - 5, chY, 48, 3);
    g.fillStyle(0x0e0e18); g.fillRect(chX - 5, chY + 10, 50, 5);         // seat front face
    g.fillStyle(0x22223a); g.fillRect(chX - 9, chY - 18, 10, 20);        // armrest L
    g.fillRect(chX + 37, chY - 18, 10, 20);                                // armrest R
    g.fillStyle(0x2e2e4c); g.fillRect(chX - 9, chY + 1, 10, 3);
    g.fillRect(chX + 37, chY + 1, 10, 3);
    g.fillStyle(0x242430); g.fillRect(chX + 9, chY + 15, 22, 5);         // base
    g.fillStyle(0x18181e); g.fillRect(chX + 7, chY + 19, 26, 3);

    // ─── JACK (full body around chair, rear view) ─────────────────────────
    // Chair back: x=220-258, y=167-215. Headrest top: y=155. Desk top: y=148.
    // Seat edges: x=215 (L), x=263 (R). Seat bottom face: y=230.
    // Center x=239. Head hx=225, hy=124.
    const hx = 225, hy = 124;

    // WAIST — tiny hoodie sliver at the very bottom of the chair back sides only
    g.fillStyle(0xCCCCCC); g.fillRect(208, 204, 12, 11);   // left waist
    g.fillRect(258, 204, 12, 11);                            // right waist
    g.fillStyle(0xAAAAAA); g.fillRect(207, 204, 3, 11);    // waist shadow L
    g.fillRect(268, 204, 3, 11);                             // waist shadow R

    // LEGS — hanging straight down in front of chair, close together
    // Chair base center ≈ x=239. Legs close, forward-hanging.
    g.fillStyle(0x2a4a70);
    g.fillRect(228, 225, 10, 36);   // left leg
    g.fillRect(242, 225, 10, 36);   // right leg
    g.fillStyle(0x1a3a5e);
    g.fillRect(228, 236, 10, 4);    // jeans crease L
    g.fillRect(242, 236, 10, 4);    // jeans crease R
    // SHOES
    g.fillStyle(0x1c1c1c); g.fillRect(226, 259, 13, 5);   // left shoe
    g.fillRect(241, 259, 13, 5);                            // right shoe
    g.fillStyle(0x0d0d0d); g.fillRect(225, 263, 14, 2);   // left sole
    g.fillRect(240, 263, 14, 2);                            // right sole

    // HEAD (28px wide)
    g.fillStyle(0xF4C430); g.fillRect(hx, hy, 28, 12);              // hair top
    g.fillStyle(0xDAA520); g.fillRect(hx - 2, hy + 3, 4, 8); g.fillRect(hx + 26, hy + 3, 4, 8); // hair sides
    g.fillStyle(0xFFCB9A); g.fillRect(hx + 2, hy + 10, 24, 14);    // back of head
    g.fillStyle(0xE8A878); g.fillRect(hx + 2, hy + 21, 24, 3);     // neck base

    // HEADPHONES
    g.fillStyle(0x111111); g.fillRect(hx - 1, hy - 2, 30, 4);      // headband
    g.fillStyle(0x333333); g.fillRect(hx, hy - 1, 28, 2);           // band sheen
    g.fillStyle(0x1a1a1a); g.fillRect(hx - 5, hy + 5, 6, 12);      // left ear cup
    g.fillRect(hx + 27, hy + 5, 6, 12);                              // right ear cup
    g.fillStyle(0x2d2d2d); g.fillRect(hx - 4, hy + 6, 4, 10);      // cup face L
    g.fillRect(hx + 28, hy + 6, 4, 10);                              // cup face R
    g.fillStyle(0x444444); g.fillRect(hx - 3, hy + 9, 2, 4);       // cup detail L
    g.fillRect(hx + 29, hy + 9, 2, 4);                               // cup detail R

    // Store monitor center for zoom
    this.monCenterX = cm.x + cm.w / 2;
    this.monCenterY = scrY + scrH / 2;
  }

  // ── CANDY RAIN — Soul for Real (tan bg, 4 figures in black suits) ────────
  _drawCandyRain(g, x, y, w, h) {
    g.fillStyle(0x222233); g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(0x3a3a50); g.fillRect(x - 1, y - 1, w + 2, h + 2);
    // Cream/tan background
    g.fillStyle(0xD0BF9A); g.fillRect(x, y, w, h);
    // Lighter top strip (logo area)
    g.fillStyle(0xE8D8B8); g.fillRect(x, y, w, 18);
    // "Soul for Real" diamond heart logo (simplified)
    g.fillStyle(0xCC1100);
    g.fillRect(x + 18, y + 4, 3, 2); g.fillRect(x + 22, y + 4, 3, 2);
    g.fillRect(x + 17, y + 6, 9, 4); g.fillRect(x + 18, y + 10, 7, 2);
    g.fillRect(x + 19, y + 12, 5, 2); g.fillRect(x + 20, y + 14, 3, 1);
    // Text lines (Soul / for Real)
    g.fillStyle(0x222222);
    g.fillRect(x + 4, y + 5, 11, 2); g.fillRect(x + 4, y + 9, 11, 2);
    // 4 standing figures in black suits
    const figs = [x + 3, x + 14, x + 25, x + 35];
    for (const fx of figs) {
      const fy = y + 20;
      g.fillStyle(0x0d0d0d); g.fillRect(fx, fy + 5, 8, 36);       // suit body
      g.fillStyle(0x090909); g.fillRect(fx + 1, fy + 27, 6, 16);   // pants
      g.fillStyle(0x050505); g.fillRect(fx + 3, fy + 31, 2, 12);   // leg split
      g.fillStyle(0xBB9060); g.fillRect(fx + 2, fy, 5, 6);         // face
      g.fillStyle(0x110500); g.fillRect(fx + 1, fy - 2, 6, 4);     // hair
      g.fillStyle(0xF5F5F5); g.fillRect(fx + 2, fy + 5, 4, 3);     // collar
      g.fillStyle(0x0d0d0d); g.fillRect(fx + 3, fy + 5, 2, 3);     // tie
    }
    // "CandyRain" text line at bottom
    g.fillStyle(0x111122); g.fillRect(x + 2, y + h - 9, 26, 2);
    g.fillStyle(0x111122); g.fillRect(x + 2, y + h - 5, 18, 1);
  }

  // ── WICHITA LINEMAN — Glen Campbell (red bg, portrait) ────────────────────
  _drawWichitaLineman(g, x, y, w, h) {
    g.fillStyle(0x222233); g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(0x3a3a50); g.fillRect(x - 1, y - 1, w + 2, h + 2);
    // Red background
    g.fillStyle(0xCC2222); g.fillRect(x, y, w, h);
    g.fillStyle(0xAA1818); g.fillRect(x, y + h - 18, w, 18); // darker bottom
    // Cream text band at top
    g.fillStyle(0xF0E8D0); g.fillRect(x, y, w, 16);
    g.fillStyle(0x333333); g.fillRect(x + 3, y + 3, 32, 2); // WICHITA LINEMAN
    g.fillStyle(0x555555); g.fillRect(x + 3, y + 7, 26, 1);
    g.fillStyle(0xCC2222); g.fillRect(x + 3, y + 11, 24, 2); // GLEN CAMPBELL
    // Glen's face — centered portrait
    const fcx = x + Math.floor(w / 2);
    const fcy = y + 36;
    g.fillStyle(0xCC9944); g.fillRect(fcx - 9, fcy - 10, 18, 8);   // hair top
    g.fillStyle(0xBB8833); g.fillRect(fcx - 10, fcy - 6, 4, 10);   // hair left
    g.fillRect(fcx + 6, fcy - 6, 4, 10);                            // hair right
    g.fillStyle(0xFFCCA0); g.fillRect(fcx - 8, fcy - 2, 16, 14);   // face
    g.fillStyle(0x336688); g.fillRect(fcx - 5, fcy + 2, 3, 2);     // eye L
    g.fillRect(fcx + 2, fcy + 2, 3, 2);                             // eye R
    g.fillStyle(0xCC8870); g.fillRect(fcx - 3, fcy + 8, 6, 2);     // smile
    g.fillStyle(0xFFFFFF); g.fillRect(fcx - 2, fcy + 9, 4, 1);     // teeth
    g.fillStyle(0xAA3311); g.fillRect(fcx - 10, fcy + 12, 20, 16); // red jacket
    g.fillStyle(0x881100); g.fillRect(fcx - 10, fcy + 12, 3, 16);
    g.fillRect(fcx + 7, fcy + 12, 3, 16);
    g.fillStyle(0xF0E8D0); g.fillRect(fcx - 3, fcy + 12, 6, 6);    // shirt collar
    g.fillStyle(0xAA3311); g.fillRect(fcx - 1, fcy + 12, 2, 6);
    // Song list at bottom
    g.fillStyle(0xF0E8D0, 0.5);
    for (let i = 0; i < 5; i++) g.fillRect(x + 2, y + h - 16 + i * 3, 20, 1);
  }

  // ── RANDOM ACCESS MEMORIES — Daft Punk (black bg, split silver/gold helmet) ─
  _drawRandomAccessMemories(g, x, y, w, h) {
    g.fillStyle(0x222233); g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(0x3a3a50); g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0x000000); g.fillRect(x, y, w, h); // pure black
    const cx = x + Math.floor(w / 2); // center split
    const ty = y + 8;                 // helmet top
    // ─ LEFT (silver) ─
    g.fillStyle(0x999999); g.fillRect(cx - 14, ty, 14, 4);
    g.fillRect(cx - 18, ty + 4, 18, 6);
    g.fillStyle(0xBBBBBB); g.fillRect(cx - 20, ty + 6, 20, 8);
    g.fillStyle(0xDDDDDD); g.fillRect(cx - 18, ty + 7, 8, 3); // highlight
    g.fillStyle(0xEEEEEE); g.fillRect(cx - 17, ty + 8, 4, 1);
    g.fillStyle(0x888888); g.fillRect(cx - 20, ty + 28, 20, 6);
    g.fillStyle(0x777777); g.fillRect(cx - 18, ty + 34, 16, 4);
    g.fillStyle(0x666666); g.fillRect(cx - 14, ty + 38, 12, 4);
    g.fillStyle(0x9a9a9a); g.fillRect(cx - 10, ty + 42, 10, 2); // chin
    // ─ RIGHT (gold) ─
    g.fillStyle(0xEEBB00); g.fillRect(cx, ty, 14, 4);
    g.fillRect(cx, ty + 4, 18, 6);
    g.fillStyle(0xFFCC00); g.fillRect(cx, ty + 6, 20, 8);
    g.fillStyle(0xFFEE44); g.fillRect(cx + 2, ty + 7, 8, 3); // highlight
    g.fillStyle(0xFFFF66); g.fillRect(cx + 3, ty + 8, 4, 1);
    g.fillStyle(0xCC9900); g.fillRect(cx, ty + 28, 20, 6);
    g.fillStyle(0xBB8800); g.fillRect(cx + 2, ty + 34, 16, 4);
    g.fillStyle(0xAA7700); g.fillRect(cx + 2, ty + 38, 12, 4);
    g.fillStyle(0xCC9900); g.fillRect(cx, ty + 42, 10, 2); // chin
    g.fillStyle(0xFFAA00); g.fillRect(cx + 18, ty + 14, 4, 14); // gold ear piece
    // ─ VISOR (dark band across both sides) ─
    g.fillStyle(0x080810); g.fillRect(cx - 20, ty + 14, 40, 14);
    g.fillStyle(0x222244); g.fillRect(cx - 18, ty + 15, 10, 4); // visor L reflection
    g.fillStyle(0x221100); g.fillRect(cx + 2, ty + 15, 10, 4);  // visor R reflection
    // ─ center split ─
    g.fillStyle(0x000000); g.fillRect(cx - 1, ty, 2, 46);
    // "Random Access Memories" script text
    g.fillStyle(0xFFFFFF, 0.55);
    g.fillRect(x + 2, y + 2, 13, 1); g.fillRect(x + 2, y + 5, 11, 1); g.fillRect(x + 2, y + 8, 15, 1);
  }

  // ── ALIVE! — Bakar (off-white walls, red brick, figure on balcony) ─────────
  _drawAlive(g, x, y, w, h) {
    g.fillStyle(0x222233); g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(0x3a3a50); g.fillRect(x - 1, y - 1, w + 2, h + 2);
    // Off-white wall background
    g.fillStyle(0xF0EBE2); g.fillRect(x, y, w, h);
    // Dark ceiling strip
    g.fillStyle(0x4a4a48); g.fillRect(x, y, w, 11);
    // Ceiling light
    g.fillStyle(0xBBBBAA); g.fillRect(x + 12, y + 4, 12, 6);
    g.fillStyle(0xFFFFEE); g.fillRect(x + 14, y + 5, 8, 4);
    // Red brick tiles (right side)
    const bricks = [0xCC5544, 0xBB4433, 0xDD6655, 0xBB4433];
    for (let br = 0; br < 5; br++) {
      for (let bc = 0; bc < 2; bc++) {
        g.fillStyle(bricks[(br + bc) % 4]);
        g.fillRect(x + 20 + bc * 9, y + 11 + br * 8, 8, 7);
        g.fillStyle(0xD8CCC0); // mortar lines
        g.fillRect(x + 20 + bc * 9, y + 11 + br * 8, 8, 1);
        g.fillRect(x + 20 + bc * 9, y + 11 + br * 8, 1, 7);
      }
    }
    // White railing
    g.fillStyle(0xF5F5F5);
    g.fillRect(x + 1, y + h - 20, w - 2, 3); // top rail
    g.fillRect(x + 1, y + h - 9,  w - 2, 3); // bottom rail
    g.fillStyle(0xE5E5E5);
    for (let ri = 0; ri < 7; ri++) g.fillRect(x + 3 + ri * 5, y + h - 20, 2, 14);
    // Bakar — white tank, black beanie, light jeans
    const fx = x + 3, fy = y + 12;
    g.fillStyle(0xAABBCC); g.fillRect(fx + 2, fy + 28, 11, 14); // jeans
    g.fillStyle(0x9AABBC); g.fillRect(fx + 3, fy + 33, 4, 9); g.fillRect(fx + 7, fy + 33, 4, 9);
    g.fillStyle(0xF0F0F0); g.fillRect(fx + 2, fy + 13, 11, 15); // white tank
    g.fillStyle(0xDDDDDD); g.fillRect(fx + 2, fy + 13, 11, 2);
    g.fillStyle(0xBB9070); g.fillRect(fx, fy + 17, 3, 7);  // left arm
    g.fillRect(fx + 12, fy + 17, 3, 7);                     // right arm
    g.fillStyle(0xAA8060); g.fillRect(fx - 1, fy + 22, 4, 3); // hands on rail
    g.fillRect(fx + 12, fy + 22, 4, 3);
    g.fillStyle(0xBB9070); g.fillRect(fx + 4, fy + 7, 7, 7); // face
    g.fillRect(fx + 5, fy + 12, 5, 3);                       // neck
    g.fillStyle(0x1a1a1a); g.fillRect(fx + 3, fy, 9, 8);    // black beanie
    g.fillStyle(0x282828); g.fillRect(fx + 2, fy + 5, 11, 4);
    g.fillStyle(0xFFFFFF); g.fillRect(fx + 6, fy + 2, 3, 1); // logo on beanie
    g.fillStyle(0x221100); g.fillRect(fx + 5, fy + 9, 2, 1); // eyes
    g.fillRect(fx + 8, fy + 9, 2, 1);
    // "Alive!" text
    g.fillStyle(0x111111); g.fillRect(x + 2, y + h - 6, 18, 2);
    g.fillStyle(0xCC2200); g.fillRect(x + 2, y + h - 3, 5, 2);
  }

  _addPlayButton() {
    const btnX = GAME_W / 2;
    const btnY = GAME_H - 18;
    const btnBg = this.add.graphics();

    const drawBtn = (hover) => {
      btnBg.clear();
      btnBg.fillStyle(0x000000, 0.35); // shadow
      btnBg.fillRect(btnX - 48, btnY - 10, 96, 27);
      btnBg.fillStyle(hover ? 0x22DD66 : 0x1DB954); // body
      btnBg.fillRect(btnX - 48, btnY - 12, 96, 24);
      btnBg.fillStyle(hover ? 0x1ABB48 : 0x158A3E); // bottom shade
      btnBg.fillRect(btnX - 48, btnY + 8, 96, 4);
      btnBg.fillStyle(0xFFFFFF, 0.14); // top shine
      btnBg.fillRect(btnX - 48, btnY - 12, 96, 5);
    };
    drawBtn(false);

    const playTxt = this.add.text(btnX, btnY, '▶  PLAY', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tweens.add({ targets: playTxt, alpha: 0.75, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const hit = this.add.zone(btnX, btnY, 96, 24).setInteractive();
    hit.on('pointerover', () => { drawBtn(true); this.game.canvas.style.cursor = 'pointer'; });
    hit.on('pointerout',  () => { drawBtn(false); this.game.canvas.style.cursor = 'default'; });
    hit.on('pointerdown', () => { this.game.canvas.style.cursor = 'default'; this._doZoom(); });
  }

  _doZoom() {
    const cam = this.cameras.main;
    this.tweens.add({
      targets: cam,
      zoom: 14,
      duration: 3200,
      ease: 'Sine.easeInOut',
      onUpdate: () => cam.centerOn(this.monCenterX, this.monCenterY),
      onComplete: () => {
        // Fade to white and hand off — the next scene fades in from the
        // same white so the transition reads as one continuous motion
        cam.fade(600, 255, 255, 255);
        this.time.delayedCall(600, () => this.scene.start('SpotifyScene'));
      }
    });
  }
}

class SpotifyScene extends Phaser.Scene {
  constructor() { super('SpotifyScene'); }

  create() {
    this.cameras.main.fadeIn(600, 255, 255, 255);
    this.selectedSong = null;
    this._drawUI();
    this._buildSongRows();
  }

  _drawUI() {
    const g = this.add.graphics();
    // Background
    g.fillStyle(0x121212); g.fillRect(0, 0, GAME_W, GAME_H);
    // Header bar
    g.fillStyle(0x000000); g.fillRect(0, 0, GAME_W, 26);
    // Bottom player bar
    g.fillStyle(0x181818); g.fillRect(0, GAME_H - 24, GAME_W, 24);
    g.fillStyle(0x282828); g.fillRect(0, GAME_H - 24, GAME_W, 1);
    // Progress bar track
    g.fillStyle(0x3a3a3a); g.fillRect(12, GAME_H - 9, GAME_W - 24, 3);
    g.destroy();

    // Spotify dot + title
    this.add.circle(14, 13, 5, 0x1DB954);
    this.add.text(24, 13, "JACK'S ROTATION", {
      fontSize: '9px', fontFamily: 'monospace', fill: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // "select a track" hint
    this.add.text(GAME_W - 8, 13, 'SELECT A TRACK TO PLAY', {
      fontSize: '6px', fontFamily: 'monospace', fill: '#999999'
    }).setOrigin(1, 0.5);

    // Progress bar label
    this.progressBarLabel = this.add.text(GAME_W / 2, GAME_H - 12, '— PRESS A TRACK TO BEGIN —', {
      fontSize: '7px', fontFamily: 'monospace', fill: '#888888'
    }).setOrigin(0.5);
  }

  _buildSongRows() {
    const unlocked = localStorage.getItem('secret_unlocked') === '1';
    const visible = SONGS.filter(s => !s.secret || unlocked);
    const rowH = visible.length > 4 ? 43 : 52; // 5 rows have to share the same space
    const startY = 28;

    visible.forEach((song, i) => {
      const y = startY + i * rowH;
      const art = rowH - 16; // album art square scales with the row

      // Row bg (interactive area)
      const rowBg = this.add.graphics();
      const drawRow = (hover) => {
        rowBg.clear();
        rowBg.fillStyle(hover ? 0x282828 : 0x121212);
        rowBg.fillRect(0, y, GAME_W, rowH - 1);
        if (hover) {
          rowBg.fillStyle(song.secret ? 0xB266FF : 0x1DB954);
          rowBg.fillRect(0, y, 4, rowH - 1);
        }
      };
      drawRow(false);

      // Track number (star for the secret track)
      this.add.text(10, y + rowH / 2, song.secret ? '★' : `${i + 1}`, {
        fontSize: '8px', fontFamily: 'monospace',
        fill: song.secret ? '#B266FF' : '#777777'
      }).setOrigin(0.5);

      // Album art block
      const ab = this.add.graphics();
      if (song.secret) {
        // Glitched mystery cover — dark with purple static
        ab.fillStyle(0x0a0a12); ab.fillRect(22, y + 8, art, art);
        const staticCols = [0xB266FF, 0x6A0DAD, 0x3d1a5c, 0xFF44CC];
        for (let n = 0; n < 34; n++) {
          ab.fillStyle(staticCols[n % 4], 0.8);
          ab.fillRect(22 + Phaser.Math.Between(0, art - 2), y + 8 + Phaser.Math.Between(0, art - 2), 2, 2);
        }
      } else {
        ab.fillStyle(song.albumColor);
        ab.fillRect(22, y + 8, art, art);
        ab.fillStyle(0xFFFFFF, 0.12);
        ab.fillRect(22, y + 8, art, Math.floor(art * 0.28));
        ab.fillStyle(0x000000, 0.19);
        ab.fillRect(22, y + 8, 3, art); ab.fillRect(22, y + 8 + art - 3, art, 3);
      }

      // Track info
      this.add.text(66, y + Math.floor(rowH / 2) - 11, song.label, {
        fontSize: '7px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: song.secret ? '#B266FF' : '#FFFFFF'
      });
      this.add.text(66, y + Math.floor(rowH / 2), song.sublabel, {
        fontSize: '5px', fontFamily: 'monospace', fill: '#B3B3B3'
      });
      // Duration
      this.add.text(GAME_W - 14, y + rowH / 2, song.duration || '3:45', {
        fontSize: '5px', fontFamily: 'monospace', fill: '#777777'
      }).setOrigin(1, 0.5);

      // Hit zone
      const hit = this.add.zone(0, y, GAME_W, rowH).setOrigin(0, 0).setInteractive();
      hit.on('pointerover', () => drawRow(true));
      hit.on('pointerout', () => drawRow(false));
      hit.on('pointerdown', () => {
        if (this.selectedSong !== null) return;
        this.selectedSong = song;
        this._selectSong(song, y, rowH);
      });
    });
  }

  _selectSong(song, rowY, rowH) {
    // Green flash on row
    const flash = this.add.graphics();
    flash.fillStyle(0x1DB954, 0.3);
    flash.fillRect(0, rowY, GAME_W, rowH - 1);
    this.tweens.add({ targets: flash, alpha: 0, duration: 500 });

    // Animated progress bar fill
    const g = this.add.graphics();
    g.fillStyle(song.accentColor);
    const bar = { pct: 0 };
    this.tweens.add({
      targets: bar, pct: 1, duration: 600,
      onUpdate: () => {
        g.clear();
        g.fillStyle(song.accentColor);
        g.fillRect(12, GAME_H - 9, Math.floor((GAME_W - 24) * bar.pct), 3);
        // Playhead dot
        g.fillRect(12 + Math.floor((GAME_W - 24) * bar.pct) - 2, GAME_H - 10, 4, 5);
      }
    });

    // Update label
    this.progressBarLabel.setText(`NOW PLAYING: ${song.label} — ${song.sublabel}`);
    this.progressBarLabel.setFill('#FFFFFF');

    // Zoom into progress bar after fill
    this.time.delayedCall(700, () => {
      const cam = this.cameras.main;
      this.tweens.add({
        targets: cam,
        zoom: 16,
        duration: 2400,
        ease: 'Sine.easeInOut',
        onUpdate: () => cam.centerOn(GAME_W / 2, GAME_H - 8),
        onComplete: () => {
          cam.fade(550, 255, 255, 255);
          this.time.delayedCall(550, () =>
            this.scene.start('RunnerScene', { songIdx: song.idx })
          );
        }
      });
    });
  }
}

class RunnerScene extends Phaser.Scene {
  constructor() { super('RunnerScene'); }

  init(data) {
    this.songCfg = SONGS[data.songIdx ?? 0];
    this.lives = 3;
    this.score = 0;
    this.isInvincible = false;
    this.gameActive = false;
    this.music = null;
    this.obstacleTimer = null;
    this.flagSpawned = false;
    this.flagpole = null;
    this.spawnDelay = 1000;  // first obstacle fast so movement is obvious
  }

  create() {
    this.cameras.main.fadeIn(550, 255, 255, 255);
    this.runSpeed = 160; // px/s — A slows, D speeds
    this._buildEnvironment();
    this._buildJack();
    // One shared overlap for the whole group — per-obstacle colliders leak
    // when obstacles are destroyed during cleanup.
    this.physics.add.overlap(this.jack, this.obstacles, () => {
      if (!this.isInvincible) this._loseLife();
    });
    this._buildHUD();
    this._buildInput();
    this._startMusic();
    this.gameActive = true;
    this._scheduleNextObstacle();
    // Flagpole after 90 s (or when song ends, see _startMusic)
    this.flagTimer = this.time.delayedCall(90000, () => {
      if (this.gameActive && !this.flagSpawned) this._spawnFlagpole();
    });
    this.events.on('shutdown', () => {
      this.music?.stop();
      this.obstacleTimer?.remove();
      this.flagTimer?.remove();
    });
  }

  _buildEnvironment() {
    const cfg = this.songCfg;
    // Sky + ground visual — pinned to camera (setScrollFactor 0)
    const g = this.add.graphics().setScrollFactor(0);
    const bandH = Math.ceil(GROUND_Y / cfg.skyColors.length);
    cfg.skyColors.forEach((col, i) => {
      g.fillStyle(col); g.fillRect(0, i * bandH, GAME_W, bandH + 2);
    });
    g.fillStyle(cfg.groundColor);
    g.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
    g.fillStyle(cfg.groundTop);
    g.fillRect(0, GROUND_Y, GAME_W, 3);

    this._drawEnvDetails(cfg);

    // Scrolling ground dashes — one screen's worth in world space; update()
    // snaps the graphics x to a 48px grid so they cover the camera forever.
    this.groundMarks = this.add.graphics();
    this.groundMarks.fillStyle(0x000000, 0.3);
    for (let x = 0; x < GAME_W + 96; x += 48) {
      this.groundMarks.fillRect(x, GROUND_Y + 5, 24, 2);
    }

    // No static physics body needed — ground is handled by manual clamping in update()
    this.obstacles = this.physics.add.group();

    // Ambient traffic cruising the boulevard (visual only, behind the action)
    if (cfg.env === 'boulevard') {
      for (let i = 0; i < 3; i++) this._launchBgCar(i * 1300);
    }
  }

  _launchBgCar(delay) {
    this.time.delayedCall(delay, () => {
      if (!this.scene.isActive()) return;
      const ltr = Math.random() < 0.5;
      // Cars ride the elevated freeway deck (y=148) — smaller, dimmer, clearly
      // background scenery instead of something to dodge
      const car = this.add.image(ltr ? -30 : GAME_W + 30, 148, 'bgcar')
        .setScrollFactor(0).setDepth(1).setOrigin(0.5, 1)
        .setFlipX(!ltr).setScale(0.7).setAlpha(0.8);
      this.tweens.add({
        targets: car,
        x: ltr ? GAME_W + 30 : -30,
        duration: Phaser.Math.Between(2200, 3800),
        ease: 'Linear',
        onComplete: () => {
          car.destroy();
          this._launchBgCar(Phaser.Math.Between(600, 2200));
        }
      });
    });
  }

  _drawEnvDetails(cfg) {
    // Pinned to camera so background doesn't scroll
    const g = this.add.graphics().setScrollFactor(0);
    if (cfg.env === 'rooftop') {
      // City silhouette
      const buildings = [[0,90,45,130],[52,65,48,165],[108,95,38,135],[154,55,44,175],[210,80,42,150],[260,70,52,160],[325,88,32,142],[368,60,48,170]];
      g.fillStyle(0x1a0e05);
      buildings.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
      // Windows
      g.fillStyle(0xFFFF88, 0.13);
      buildings.forEach(([x, y, w]) => {
        for (let wy = y + 10; wy < GROUND_Y - 8; wy += 12) {
          for (let wx = x + 5; wx < x + w - 4; wx += 9) {
            if (Math.random() > 0.35) g.fillRect(wx, wy, 4, 5);
          }
        }
      });
      // Rooftop ground details (AC units, vents)
      g.fillStyle(0x8B3A10);
      for (let x = 30; x < GAME_W; x += 70) g.fillRect(x, GROUND_Y - 8, 12, 8);
      g.fillStyle(0x555555);
      for (let x = 60; x < GAME_W; x += 55) g.fillRect(x, GROUND_Y - 5, 6, 5);
    } else if (cfg.env === 'nightclub') {
      // Neon grid
      g.lineStyle(1, 0x00BFFF, 0.25);
      for (let x = 0; x < GAME_W; x += 32) g.lineBetween(x, 0, x, GROUND_Y);
      for (let y = 0; y < GROUND_Y; y += 20) g.lineBetween(0, y, GAME_W, y);
      // Disco lights on ceiling
      const colors = [0xFF00FF, 0x00FFFF, 0xFFFF00, 0xFF4500];
      for (let i = 0; i < 6; i++) {
        g.fillStyle(colors[i % colors.length], 0.3);
        g.fillTriangle(40 + i * 70, 0, 20 + i * 70, 60, 60 + i * 70, 60);
      }
      // Dance floor tiles
      for (let x = 0; x < GAME_W; x += 16) {
        g.fillStyle((Math.floor(x / 16)) % 2 === 0 ? 0x1a1a40 : 0x0d0d28);
        g.fillRect(x, GROUND_Y, 16, GAME_H - GROUND_Y);
      }
      // Tile grid lines
      g.lineStyle(1, 0x00BFFF, 0.4);
      for (let x = 0; x <= GAME_W; x += 16) g.lineBetween(x, GROUND_Y, x, GAME_H);
    } else if (cfg.env === 'prairie') {
      // Sky gradient already set; add horizon haze
      g.fillStyle(0xC8B860, 0.3);
      g.fillRect(0, GROUND_Y - 10, GAME_W, 10);
      // Rolling hills
      g.fillStyle(0x7CAE7C);
      g.fillEllipse(90, GROUND_Y + 4, 180, 30);
      g.fillEllipse(300, GROUND_Y + 4, 220, 24);
      g.fillEllipse(480, GROUND_Y + 4, 200, 28);
      // Sparse grass tufts
      g.fillStyle(0x5A8A5A);
      for (let x = 15; x < GAME_W; x += 28) {
        g.fillRect(x, GROUND_Y - 4, 2, 5);
        g.fillRect(x + 4, GROUND_Y - 3, 2, 4);
      }
      // Far telephone poles on horizon
      g.fillStyle(0x8B5A2B, 0.5);
      for (let x = 50; x < GAME_W; x += 90) {
        g.fillRect(x, GROUND_Y - 40, 2, 40);
        g.fillRect(x - 8, GROUND_Y - 35, 18, 2);
      }
    } else if (cfg.env === 'candy') {
      // Candy-stripe ground
      for (let x = 0; x < GAME_W; x += 12) {
        g.fillStyle(x % 24 === 0 ? 0xFF69B4 : 0xFF1493);
        g.fillRect(x, GROUND_Y, 12, 8);
      }
      // Candy clouds
      const cloudColors = [0xFFB6C1, 0xFFCCDD, 0xFFAACC];
      [[60, 38, 70, 28], [180, 22, 80, 26], [340, 42, 65, 22], [440, 28, 72, 24]].forEach(([x, y, w, h], ci) => {
        g.fillStyle(cloudColors[ci % 3]);
        g.fillEllipse(x, y, w, h);
        g.fillEllipse(x + 18, y - 8, w * 0.7, h * 0.8);
        g.fillEllipse(x - 15, y - 4, w * 0.6, h * 0.7);
      });
      // Lollipop trees on ground
      g.fillStyle(0xF5DEB3);
      [40, 130, 260, 400].forEach(x => {
        g.fillRect(x, GROUND_Y - 20, 3, 20);
        g.fillStyle(0xFF1493); g.fillEllipse(x + 1, GROUND_Y - 22, 18, 18);
        g.fillStyle(0xFFFFFF, 0.4); g.fillEllipse(x - 3, GROUND_Y - 26, 8, 8);
        g.fillStyle(0xF5DEB3);
      });
    } else if (cfg.env === 'boulevard') {
      // ─── SUNSET STRIP, LOS ANGELES ───
      // Stars
      g.fillStyle(0xCCBBFF, 0.8);
      for (let i = 0; i < 26; i++) g.fillRect((i * 97) % GAME_W, (i * 53) % 95, 1, 1);
      // Full moon with craters
      g.fillStyle(0xE8D8FF, 0.13); g.fillEllipse(404, 34, 44, 44);
      g.fillStyle(0xEFE6FF); g.fillCircle(404, 34, 9);
      g.fillStyle(0xD8C8E8); g.fillRect(401, 31, 3, 2); g.fillRect(406, 36, 2, 2); g.fillRect(402, 37, 2, 1);
      // Hollywood Hills on the horizon
      g.fillStyle(0x150a26);
      g.fillEllipse(80, 172, 280, 95); g.fillEllipse(280, 178, 320, 85); g.fillEllipse(460, 170, 230, 100);
      // HOLLYWOOD sign — tiny white letters up on the hill
      g.fillStyle(0xE8E8F0);
      for (let i = 0; i < 9; i++) g.fillRect(36 + i * 5, 136 + (i % 3), 3, 5);
      // Capitol Records tower (round stack + spire) far right
      g.fillStyle(0x0d0618);
      for (let s = 0; s < 7; s++) g.fillRect(424 - (s % 2), 134 + s * 9, 36 + (s % 2) * 2, 8);
      g.fillRect(438, 114, 3, 22); // spire
      g.fillStyle(0xFF4444); g.fillRect(438, 112, 3, 3); // aviation beacon
      g.fillStyle(0xB266FF, 0.35);
      for (let s = 0; s < 7; s++) g.fillRect(428, 136 + s * 9, 28, 2); // window slits
      // Background towers for depth
      const bgTowers = [[0, 100, 34, 130], [126, 92, 40, 138], [338, 80, 44, 150]];
      g.fillStyle(0x0d0618);
      bgTowers.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
      const winCols = [0xB266FF, 0xFF44CC, 0x00EEFF];
      bgTowers.forEach(([x, y, w], bi) => {
        for (let wy = y + 8; wy < 196; wy += 13)
          for (let wx = x + 4; wx < x + w - 4; wx += 9)
            if ((wx * 7 + wy * 13 + bi) % 4 === 0) {
              g.fillStyle(winCols[(wx + wy) % 3], 0.5);
              g.fillRect(wx, wy, 3, 4);
            }
      });

      // Elevated freeway deck behind the strip — background traffic rides it,
      // so anything driving at street level is clearly an obstacle
      g.fillStyle(0x241e32); g.fillRect(0, 144, GAME_W, 2);   // guardrail top
      g.fillStyle(0x3a3450, 0.8);
      for (let x = 4; x < GAME_W; x += 22) g.fillRect(x, 144, 2, 5); // guardrail posts
      g.fillStyle(0x2a2438); g.fillRect(0, 148, GAME_W, 3);   // road edge
      g.fillStyle(0x1a1426); g.fillRect(0, 151, GAME_W, 9);   // deck side
      g.fillStyle(0x0f0a1a); g.fillRect(0, 158, GAME_W, 2);   // underside shadow
      // Support pillars showing in the gaps between venues
      [44, 206, 376].forEach(x => {
        g.fillStyle(0x161020); g.fillRect(x, 160, 10, GROUND_Y - 160);
        g.fillStyle(0x0f0a18); g.fillRect(x + 8, 160, 2, GROUND_Y - 160);
      });

      // ── Storefront row (the famous strip) ──
      // WHISKY A GO GO — white walls, red marquee
      g.fillStyle(0xDDD8CC); g.fillRect(60, 168, 64, 62);
      g.fillStyle(0xBBB4A4); g.fillRect(60, 168, 64, 2); g.fillRect(60, 168, 2, 62);
      g.fillStyle(0xCC1122); g.fillRect(57, 176, 70, 15); // red marquee band
      g.fillStyle(0xEE3344); g.fillRect(57, 176, 70, 2);
      g.fillStyle(0x221a14); g.fillRect(86, 208, 14, 22); // door
      g.fillStyle(0x332218); g.fillRect(66, 200, 14, 14); g.fillRect(106, 200, 14, 14); // windows
      // THE ROXY — black box, white marquee
      g.fillStyle(0x16121c); g.fillRect(132, 180, 54, 50);
      g.fillStyle(0xF0F0F0); g.fillRect(134, 184, 50, 12); // white marquee
      g.fillStyle(0x221a14); g.fillRect(152, 210, 14, 20); // door
      g.fillStyle(0xFFD877, 0.35); g.fillRect(136, 198, 46, 2); // marquee underglow
      // Billboard on poles (Travis UTOPIA ad)
      g.fillStyle(0x222230); g.fillRect(198, 122, 3, 50); g.fillRect(230, 122, 3, 50);
      g.fillStyle(0x0a0a14); g.fillRect(188, 94, 56, 30);
      g.fillStyle(0x1f0d33); g.fillRect(190, 96, 52, 26);
      g.fillStyle(0xFFD877, 0.5); g.fillRect(193, 122, 8, 2); g.fillRect(231, 122, 8, 2); // board lights
      // TOWER RECORDS — yellow facade, red lettering
      g.fillStyle(0xF5C518); g.fillRect(240, 172, 70, 58);
      g.fillStyle(0xD4A800); g.fillRect(240, 172, 70, 3);
      g.fillStyle(0x332218); g.fillRect(248, 204, 16, 26); g.fillRect(286, 204, 16, 26); // windows
      g.fillStyle(0x221a14); g.fillRect(268, 202, 14, 28); // door
      g.fillStyle(0xCC1122); g.fillRect(240, 196, 70, 2);  // red trim line
      // RAINBOW BAR & GRILL — dark red brick
      g.fillStyle(0x2a1414); g.fillRect(316, 184, 52, 46);
      g.fillStyle(0x3a1c1c);
      for (let by = 188; by < 228; by += 8) g.fillRect(316, by, 52, 1); // brick courses
      g.fillStyle(0x221a14); g.fillRect(334, 210, 14, 20); // door
      g.fillStyle(0xFFD877, 0.25); g.fillRect(320, 204, 10, 8); g.fillRect(352, 204, 10, 8); // warm windows
      // Palm silhouettes between venues
      g.fillStyle(0x07030d);
      [48, 128, 312, 392].forEach(x => {
        g.fillRect(x, GROUND_Y - 34, 3, 34);
        [[-9, -40], [-3, -44], [3, -44], [9, -40]].forEach(([dx, dy]) =>
          g.fillRect(x + dx, GROUND_Y + dy, 8, 3));
      });
      // Street lamps with warm pools
      for (let x = 36; x < GAME_W; x += 110) {
        g.fillStyle(0x16121f); g.fillRect(x, GROUND_Y - 26, 2, 26);
        g.fillRect(x - 3, GROUND_Y - 28, 8, 3);
        g.fillStyle(0xFFD877); g.fillRect(x - 2, GROUND_Y - 26, 6, 2);
        g.fillStyle(0xFFD877, 0.07); g.fillEllipse(x + 1, GROUND_Y - 12, 26, 30);
      }
      // Yellow road center dashes
      g.fillStyle(0xC8A832, 0.5);
      for (let x = 0; x < GAME_W; x += 36) g.fillRect(x, GROUND_Y + 14, 16, 2);

      // ── Venue signage — crisp drawn pixel lettering ──
      drawPixelText(g, 92, 181, 'WHISKY A GO GO', 0xFFFFFF);
      drawPixelText(g, 159, 187, 'THE ROXY', 0x111111);
      drawPixelText(g, 275, 183, 'TOWER RECORDS', 0xCC1122);
      const rg = this.add.graphics().setScrollFactor(0).setDepth(3);
      drawPixelText(rg, 342, 189, 'RAINBOW', 0xFF5555);
      this.tweens.add({ targets: rg, alpha: 0.6, duration: 900, yoyo: true, repeat: -1 });
      const utopia = this.add.text(216, 109, 'UTOPIA', {
        fontSize: '8px', fontFamily: 'monospace', fill: '#B266FF', fontStyle: 'bold'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3);
      this.tweens.add({ targets: utopia, alpha: 0.55, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      const blvd = this.add.text(GAME_W - 12, 54, 'SUNSET BLVD', {
        fontSize: '8px', fontFamily: 'monospace', fill: '#FF44CC', fontStyle: 'bold'
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(3);
      this.tweens.add({ targets: blvd, alpha: 0.5, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    // Do NOT destroy — graphics must persist to render each frame
  }

  _buildJack() {
    this.jack = this.physics.add.image(70, JACK_GROUND_Y, 'jack_0');
    this.jack.setScale(0.5);
    this.jack.setCollideWorldBounds(false).setDepth(6);
    // setSize/setOffset are in source-texture pixels and get multiplied by
    // the current scale (0.5) — double the old 14×26/2,1 so the resulting
    // world-space hitbox is unchanged from before the texture was upsized.
    this.jack.body.setSize(28, 52).setOffset(4, 2);
    this.isGrounded = false;
    this.runFrame = 0;
    this.runTimer = 0;
    // Built-in camera follow runs after the physics sync each frame, so Jack
    // never jitters against the world (manual scrollX in update() lagged by
    // one frame). Offset keeps him at screen x=120; bounds lock Y and x>=0.
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, GAME_H);
    // roundPixels arg must be FALSE here: rounding the scroll while Jack's
    // position is fractional made him pop between screen x=120 and x=121.
    // Exact follow keeps him at precisely 120; global roundPixels handles crispness.
    this.cameras.main.startFollow(this.jack, false, 1, 0, -(GAME_W / 2 - 120), 0);
    // Ground marks snap on postupdate (after physics) so they match the camera
    this.events.on('postupdate', () => {
      const sx = Math.max(0, this.jack.x - 120);
      this.groundMarks.x = Math.floor(sx / 48) * 48;
    });
    // Ground collision handled manually in update() via position clamping
  }

  _buildHUD() {
    // Hearts
    this.heartIcons = [];
    for (let i = 0; i < 3; i++) {
      this.heartIcons.push(
        this.add.image(8 + i * 14, 8, 'heart').setOrigin(0, 0).setScrollFactor(0).setDepth(10)
      );
    }
    // Score
    this.scoreTxt = this.add.text(GAME_W - 8, 8, '0', {
      fontSize: '8px', fontFamily: 'monospace', fill: '#FFFFFF'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
    // Song name
    this.add.text(GAME_W / 2, 8, `${this.songCfg.label} — ${this.songCfg.sublabel}`, {
      fontSize: '5px', fontFamily: 'monospace', fill: '#AAAAAA'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10);
    // Controls hint (fades after 4s)
    this.jumpHint = this.add.text(GAME_W / 2, GAME_H - 18, 'D=FASTER  A=SLOWER  SPACE=JUMP', {
      fontSize: '5px', fontFamily: 'monospace', fill: '#FFFFFF', backgroundColor: '#00000066',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);
    this.time.delayedCall(4000, () =>
      this.tweens.add({ targets: this.jumpHint, alpha: 0, duration: 500 })
    );
  }

  _buildInput() {
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.aKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.input.on('pointerdown', () => this._tryJump());
  }

  _startMusic() {
    this.music = this.sound.add(this.songCfg.audioKey, { loop: false, volume: 0.75 });
    this.music.play();
    // When song ends spawn flagpole if not already done
    this.music.once('complete', () => {
      if (this.gameActive && !this.flagSpawned) this._spawnFlagpole();
    });
  }

  _scheduleNextObstacle() {
    // Jitter keeps patterns unpredictable; the 950ms floor guarantees gaps
    // stay clearable at default run speed (jump arc covers ~142px).
    const delay = this.spawnDelay + Phaser.Math.Between(0, 300);
    this.obstacleTimer = this.time.delayedCall(delay, () => {
      if (!this.gameActive) return;
      this._spawnObstacle();
      this.spawnDelay = Math.max(950, this.spawnDelay - 35);
      this._scheduleNextObstacle();
    });
  }

  _spawnObstacle() {
    const types = this.songCfg.obstacles;
    const type = types[Phaser.Math.Between(0, types.length - 1)];
    const key = type === 'police' ? 'obs_police0' : `obs_${type}`;
    // Place obstacle just past the right screen edge so it appears quickly
    const spawnX = this.jack.x + GAME_W - 80 + Phaser.Math.Between(0, 40);
    const obs = this.obstacles.create(spawnX, GROUND_Y, key);
    obs.setOrigin(0.5, 1).setDepth(5);
    obs.body.allowGravity = false;
    obs.body.immovable = true;
    // Forgiving hitbox — shave the transparent edges so grazes don't kill
    const bw = Math.max(6, obs.width - 6), bh = Math.max(6, obs.height - 5);
    obs.body.setSize(bw, bh).setOffset((obs.width - bw) / 2, obs.height - bh);
    // Per-type motion so obstacles feel alive
    if (type === 'tumbleweed') {
      obs.setOrigin(0.5, 0.5);
      obs.y = GROUND_Y - obs.height / 2;
      this.tweens.add({ targets: obs, angle: -360, duration: 900, repeat: -1 });
    } else if (type === 'disco') {
      this.tweens.add({ targets: obs, y: GROUND_Y - 4, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else if (type === 'neon') {
      this.tweens.add({ targets: obs, alpha: 0.65, duration: 320, yoyo: true, repeat: -1 });
    } else if (type === 'police') {
      // Flash the light bar by swapping the two pre-built frames
      let lit = false;
      const flash = this.time.addEvent({
        delay: 180, loop: true,
        callback: () => { lit = !lit; obs.setTexture(lit ? 'obs_police1' : 'obs_police0'); }
      });
      obs.once('destroy', () => flash.remove());
    }
  }

  _spawnFlagpole() {
    this.flagSpawned = true;
    // Stop new obstacles
    this.obstacleTimer?.remove();
    // Place flagpole ahead of player in world space
    const flagX = this.jack.x + GAME_W + 200;
    this.flagpole = this.physics.add.image(flagX, GROUND_Y, 'flagpole');
    this.flagpole.setOrigin(0.5, 1).setDepth(8);
    this.flagpole.body.allowGravity = false;
    this.flagpole.body.immovable = true;
    // Hint
    if (this.jumpHint) {
      this.jumpHint.setText('JUMP THE FLAGPOLE!').setAlpha(1);
      this.tweens.add({ targets: this.jumpHint, alpha: 0, delay: 2500, duration: 500 });
    }
    // Overlap: touching flagpole = win
    this.physics.add.overlap(this.jack, this.flagpole, () => {
      if (!this.gameActive) return;
      this.gameActive = false;
      // Jump onto pole — kill gravity so the tween isn't fighting physics
      this.jack.setVelocityX(0);
      this.jack.setVelocityY(0);
      this.jack.body.setAllowGravity(false);
      this.tweens.add({
        targets: this.jack,
        x: this.flagpole.x,
        y: this.flagpole.y - 50,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: this.jack, y: GROUND_Y - 14, duration: 400, ease: 'Bounce',
            onComplete: () => {
              this.music?.stop();
              this.time.delayedCall(600, () => this._triggerWin());
            }
          });
        }
      });
    });
  }

  _tryJump() {
    if (!this.gameActive || !this.isGrounded) return;
    this.jack.setVelocityY(-400);
    this.isGrounded = false;
    this.jack.setTexture('jack_3');
    this.jumpHint.setAlpha(0);
  }

  _loseLife() {
    this.lives--;
    this._updateHearts();
    this.isInvincible = true;
    this.tweens.add({
      targets: this.jack, alpha: 0.2, duration: 120,
      yoyo: true, repeat: 6,
      onComplete: () => { this.jack.setAlpha(1); this.isInvincible = false; }
    });
    if (this.lives <= 0) {
      this.gameActive = false;
      this.music?.stop();
      this.obstacleTimer?.remove();
      this.time.delayedCall(700, () =>
        this.scene.start('GameOverScene', { songIdx: this.songCfg.idx })
      );
    }
  }

  _updateHearts() {
    this.heartIcons.forEach((h, i) =>
      h.setTexture(i < this.lives ? 'heart' : 'heart_empty')
    );
  }

  _triggerWin() {
    this.gameActive = false;
    this.obstacleTimer?.remove();
    const key = `hs_${this.songCfg.idx}`;
    const prev = parseInt(localStorage.getItem(key) || '0');
    if (this.score > prev) localStorage.setItem(key, String(this.score));
    // Gold record for this song + unlock the secret track on any first win
    const firstUnlock = localStorage.getItem('secret_unlocked') !== '1';
    localStorage.setItem(`win_${this.songCfg.idx}`, '1');
    localStorage.setItem('secret_unlocked', '1');
    this.time.delayedCall(600, () =>
      this.scene.start('WinScene', { songIdx: this.songCfg.idx, firstUnlock })
    );
  }

  update(time, delta) {
    if (!this.gameActive) return;

    // Jump input
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) || Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this._tryJump();
    }

    // A/D — adjust run speed (treadmill pace control)
    if (this.dKey.isDown || this.rightKey.isDown) {
      this.runSpeed = 240;
    } else if (this.aKey.isDown || this.leftKey.isDown) {
      this.runSpeed = 70;
    } else {
      this.runSpeed = 160;
    }
    // Auto-run: player always moves right
    this.jack.setVelocityX(this.runSpeed);

    // ── Manual ground clamp (replaces static physics body) ──────────────────
    // Gravity pulls Jack down; when he reaches ground level, stop him there.
    if (this.jack.y >= JACK_GROUND_Y) {
      this.jack.y = JACK_GROUND_Y;
      if (this.jack.body.velocity.y > 0) this.jack.setVelocityY(0);
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Animate run frames when grounded
    if (this.isGrounded) {
      const frameDelay = Phaser.Math.Linear(160, 60, (this.runSpeed - 70) / 170);
      this.runTimer += delta;
      if (this.runTimer > frameDelay) {
        // 0,1,2,1 cycle — legs pass through neutral between extremes so the
        // animation strides instead of snapping back and forth
        const seq = [0, 1, 2, 1];
        this.runFrame = (this.runFrame + 1) % seq.length;
        this.jack.setTexture(`jack_${seq[this.runFrame]}`);
        this.runTimer = 0;
      }
    }

    // Score = distance run
    this.score = Math.floor(this.jack.x / 10);
    this.scoreTxt.setText(String(this.score));

    // Cleanup obstacles the player has already passed
    this.obstacles.getChildren().forEach(obs => {
      if (obs.x < this.jack.x - 100) {
        this.tweens.killTweensOf(obs);
        obs.destroy();
      }
    });
  }
}

class WinScene extends Phaser.Scene {
  constructor() { super('WinScene'); }

  init(data) {
    this.songCfg = SONGS[data.songIdx ?? 0];
    this.firstUnlock = data.firstUnlock ?? false;
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    const cfg = this.songCfg;
    const g = this.add.graphics();
    // Sky
    const bandH = Math.ceil(GROUND_Y / cfg.skyColors.length);
    cfg.skyColors.forEach((col, i) => {
      g.fillStyle(col); g.fillRect(0, i * bandH, GAME_W, bandH + 2);
    });
    // Ground
    g.fillStyle(cfg.groundColor); g.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
    g.fillStyle(cfg.groundTop); g.fillRect(0, GROUND_Y, GAME_W, 3);

    // YOU WIN header
    this.add.text(GAME_W / 2, 22, 'YOU WIN!', {
      fontSize: '20px', fontFamily: 'monospace', fill: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Flagpole
    const poleX = 320, poleTopY = GROUND_Y - 85;
    const gp = this.add.graphics();
    gp.fillStyle(0xAAAAAA); gp.fillRect(poleX - 1, poleTopY, 3, 85);
    this.flag = this.add.image(poleX + 2, poleTopY + 2, 'flag').setOrigin(0, 0.5);
    // Flag wave tween
    this.tweens.add({ targets: this.flag, x: poleX + 4, duration: 400, yoyo: true, repeat: -1 });

    // Jack sliding up pole
    this.jack = this.add.image(poleX, GROUND_Y - 14, 'jack_1').setScale(0.5);
    this.time.delayedCall(600, () => {
      this.tweens.add({
        targets: this.jack, y: poleTopY + 10,
        duration: 900, ease: 'Quad.easeOut',
        onComplete: () => this._enterWizard()
      });
    });
  }

  _enterWizard() {
    // Bottom origin + y=GROUND_Y plants his feet exactly on the ground line
    this.wizard = this.add.image(GAME_W + 24, GROUND_Y, 'wizard').setOrigin(0.5, 1);
    this.tweens.add({
      targets: this.wizard, x: GAME_W / 2 + 30,
      duration: 1100, ease: 'Linear',
      onComplete: () => this._wizardTap()
    });
    // Little shuffle-hop while he walks in
    this.tweens.add({
      targets: this.wizard, y: GROUND_Y - 2,
      duration: 140, yoyo: true, repeat: 3
    });
  }

  _wizardTap() {
    // Staff tap hop (upward — feet stay on the ground line)
    this.tweens.add({
      targets: this.wizard, y: GROUND_Y - 5,
      duration: 90, yoyo: true,
      onComplete: () => {
        // Sparkles
        for (let i = 0; i < 10; i++) {
          const star = this.add.text(
            this.wizard.x - 14 + Phaser.Math.Between(-24, 24),
            GROUND_Y - 8 + Phaser.Math.Between(-24, 8),
            '✦', { fontSize: '7px', fill: '#FFD700' }
          );
          this.tweens.add({ targets: star, y: star.y - 36, alpha: 0, duration: 700,
            onComplete: () => star.destroy() });
        }
        this._showDoor();
      }
    });
    // Dialogue bubble
    const bubble = this.add.text(GAME_W / 2 + 10, GROUND_Y - 82, 'FOLLOW ME...', {
      fontSize: '8px', fontFamily: 'monospace', fill: '#111111', fontStyle: 'bold',
      backgroundColor: '#FFFFFF', padding: { x: 7, y: 5 }
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: bubble, alpha: 1, duration: 400 });
  }

  _showDoor() {
    const doorX = 90;
    this.door = this.add.image(doorX, GROUND_Y, 'door').setOrigin(0.5, 1).setAlpha(0);
    this.tweens.add({
      targets: this.door, alpha: 1, duration: 500,
      onComplete: () => {
        this.door.setInteractive();
        this.door.on('pointerdown', () => {
          this.cameras.main.fade(350, 0, 0, 0);
          this.time.delayedCall(350, () =>
            this.scene.start('RecordRoomScene', { songIdx: this.songCfg.idx }));
        });
        // Pulsing glow
        this.tweens.add({ targets: this.door, alpha: 0.65, duration: 550, yoyo: true, repeat: -1 });
        this.add.text(doorX, GROUND_Y - 34, 'CLICK TO ENTER', {
          fontSize: '5px', fontFamily: 'monospace', fill: '#FFFFFF'
        }).setOrigin(0.5);
        if (this.firstUnlock) {
          const unlockTxt = this.add.text(doorX, GROUND_Y - 46, '★ SECRET TRACK UNLOCKED', {
            fontSize: '5px', fontFamily: 'monospace', fill: '#B266FF',
            backgroundColor: '#00000099', padding: { x: 4, y: 2 }
          }).setOrigin(0.5);
          this.tweens.add({ targets: unlockTxt, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
        }
      }
    });
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) { this.songIdx = data.songIdx ?? 0; }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);
    const g = this.add.graphics();
    g.fillStyle(0x080808); g.fillRect(0, 0, GAME_W, GAME_H);
    // Red scanlines
    for (let y = 0; y < GAME_H; y += 4) {
      g.fillStyle(0xFF0000, 0.09); g.fillRect(0, y, GAME_W, 2);
    }

    // YOU DIED — double-layered for glow effect
    this.add.text(GAME_W / 2, GAME_H / 2 - 44, 'YOU DIED', {
      fontSize: '26px', fontFamily: 'monospace', fill: '#FF2244', fontStyle: 'bold'
    }).setOrigin(0.5);
    const flicker = this.add.text(GAME_W / 2, GAME_H / 2 - 44, 'YOU DIED', {
      fontSize: '26px', fontFamily: 'monospace', fill: '#FF8899'
    }).setOrigin(0.5).setAlpha(0.35);
    this.tweens.add({ targets: flicker, alpha: 0, duration: 90, yoyo: true, repeat: -1 });

    // Best score
    const hs = localStorage.getItem(`hs_${this.songIdx}`) || '0';
    this.add.text(GAME_W / 2, GAME_H / 2 - 14, `BEST: ${hs}`, {
      fontSize: '7px', fontFamily: 'monospace', fill: '#777777'
    }).setOrigin(0.5);

    // RETRY
    const retry = this.add.text(GAME_W / 2 - 52, GAME_H / 2 + 16, '[ RETRY ]', {
      fontSize: '8px', fontFamily: 'monospace', fill: '#FFFFFF'
    }).setOrigin(0.5).setInteractive();
    retry.on('pointerover', () => retry.setFill('#FFD700'));
    retry.on('pointerout', () => retry.setFill('#FFFFFF'));
    retry.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('RunnerScene', { songIdx: this.songIdx }));
    });

    // MENU
    const menu = this.add.text(GAME_W / 2 + 52, GAME_H / 2 + 16, '[ MENU ]', {
      fontSize: '8px', fontFamily: 'monospace', fill: '#AAAAAA'
    }).setOrigin(0.5).setInteractive();
    menu.on('pointerover', () => menu.setFill('#FFD700'));
    menu.on('pointerout', () => menu.setFill('#AAAAAA'));
    menu.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('SpotifyScene'));
    });

    // Space to retry
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('RunnerScene', { songIdx: this.songIdx });
    });
  }
}

class RecordRoomScene extends Phaser.Scene {
  constructor() { super('RecordRoomScene'); }

  init(data) {
    // The turntable spins whatever you just conquered (defaults to the secret track)
    this.lastSong = SONGS[data?.songIdx ?? 4];
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    const g = this.add.graphics();
    // Dim listening room
    g.fillStyle(0x120c14); g.fillRect(0, 0, GAME_W, GAME_H);
    g.fillStyle(0x1a1220);
    for (let x = 0; x < GAME_W; x += 40) g.fillRect(x, 0, 1, 188); // wall panels
    // Floor
    g.fillStyle(0x241409); g.fillRect(0, 190, GAME_W, GAME_H - 190);
    g.fillStyle(0x180d05);
    for (let x = 17; x < GAME_W; x += 34) g.fillRect(x, 190, 1, GAME_H - 190);
    g.fillStyle(0x2e1c0c); g.fillRect(0, 188, GAME_W, 3); // baseboard
    // Warm lamp glow
    g.fillStyle(0xFFB347, 0.05); g.fillEllipse(GAME_W / 2, 120, 320, 210);

    this.add.text(GAME_W / 2, 16, '— THE RECORD ROOM —', {
      fontSize: '8px', fontFamily: 'monospace', fill: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Gold record wall — one frame per main song
    const mains = SONGS.filter(s => !s.secret);
    const wins = mains.map(s => localStorage.getItem(`win_${s.idx}`) === '1');
    mains.forEach((song, i) => {
      const x = 66 + i * 96, y = 68;
      const fg = this.add.graphics();
      // Frame
      fg.fillStyle(0x3a2c14); fg.fillRect(x - 25, y - 25, 50, 50);
      fg.fillStyle(0x52401e); fg.fillRect(x - 25, y - 25, 50, 2);
      fg.fillStyle(0x0d0a08); fg.fillRect(x - 21, y - 21, 42, 42);
      if (wins[i]) {
        // Gold record with the song's label color in the center
        fg.fillStyle(0xE6C200); fg.fillCircle(x, y, 17);
        fg.fillStyle(0xC8A500); fg.fillCircle(x + 2, y + 2, 15);
        fg.fillStyle(0xE6C200); fg.fillCircle(x, y, 14);
        fg.fillStyle(0xF6E27A); fg.fillRect(x - 8, y - 9, 5, 2); // glint
        fg.fillStyle(song.albumColor); fg.fillCircle(x, y, 6);
        fg.fillStyle(0x0d0a08); fg.fillCircle(x, y, 2);
      } else {
        // Empty dusty silhouette
        fg.fillStyle(0x26222a); fg.fillCircle(x, y, 17);
        this.add.text(x, y, '?', {
          fontSize: '10px', fontFamily: 'monospace', fill: '#4a4456'
        }).setOrigin(0.5);
      }
      this.add.text(x, y + 33, song.label, {
        fontSize: '4px', fontFamily: 'monospace', fill: wins[i] ? '#D8B84A' : '#555555'
      }).setOrigin(0.5);
    });

    const wonCount = wins.filter(Boolean).length;
    this.add.text(GAME_W / 2, 116, wonCount === 4 ? '★ FULL ROTATION CONQUERED ★' : `${wonCount}/4 GOLD RECORDS EARNED`, {
      fontSize: '5px', fontFamily: 'monospace', fill: wonCount === 4 ? '#FFD700' : '#888888'
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 126, '★ SECRET TRACK ADDED TO YOUR ROTATION', {
      fontSize: '5px', fontFamily: 'monospace', fill: '#B266FF'
    }).setOrigin(0.5);

    this._buildTurntable();

    // The door you came through, set into the left wall
    this.roomDoor = this.add.image(26, 190, 'door').setOrigin(0.5, 1);

    // Nav buttons
    const menu = this.add.text(28, GAME_H - 12, '← MENU', {
      fontSize: '6px', fontFamily: 'monospace', fill: '#AAAAAA'
    }).setOrigin(0.5).setInteractive();
    menu.on('pointerover', () => menu.setFill('#FFD700'));
    menu.on('pointerout', () => menu.setFill('#AAAAAA'));
    menu.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('SpotifyScene'));
    });
    const sheet = this.add.text(GAME_W - 52, GAME_H - 12, 'CHARACTER SHEET →', {
      fontSize: '6px', fontFamily: 'monospace', fill: '#1DB954'
    }).setOrigin(0.5).setInteractive();
    sheet.on('pointerover', () => sheet.setFill('#00FF7F'));
    sheet.on('pointerout', () => sheet.setFill('#1DB954'));
    sheet.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('EasterEggScene'));
    });
    this.uiBits = [menu, sheet, this.ttBtn];

    // Wizard intro cutscene on first visit; he just hangs out after that
    if (localStorage.getItem('rr_cutscene_seen') !== '1') {
      this._playCutscene();
    } else {
      this.wizard = this.add.image(304, 216, 'wizard').setOrigin(0.5, 1);
      this.jackChar = this.add.image(46, 216, 'jack_1').setOrigin(0.5, 1).setScale(0.5);
    }

    // Stop the needle when leaving the room
    this.events.on('shutdown', () => { this.nowPlaying?.stop(); });
  }

  _playCutscene() {
    this.cutsceneDone = false;
    this.uiBits.forEach(b => b.setAlpha(0).disableInteractive());
    this.csTimers = [];
    this.csBubble = null;

    // Light spills from the door as it opens
    const spill = this.add.rectangle(26, 190, 26, 34, 0xFFE9A0, 0).setOrigin(0.5, 1);
    this.tweens.add({ targets: spill, fillAlpha: 0.4, duration: 350, yoyo: true });

    // Wizard steps out, then Jack follows him in
    this.wizard = this.add.image(26, 200, 'wizard').setOrigin(0.5, 1).setAlpha(0);
    this.tweens.add({ targets: this.wizard, alpha: 1, x: 80, y: 216, duration: 1000, ease: 'Quad.easeOut' });
    this.jackChar = this.add.image(26, 204, 'jack_1').setOrigin(0.5, 1).setAlpha(0).setScale(0.5);
    this.csTimers.push(this.time.delayedCall(900, () => {
      this.tweens.add({ targets: this.jackChar, alpha: 1, x: 44, y: 216, duration: 800, ease: 'Quad.easeOut' });
    }));

    // Dialogue beats — bubble appears near whoever is talking
    const beats = [
      [2000,  () => this._say(this.wizard, 'WELCOME TO THE GOLD RECORD ROOM.')],
      [4700,  () => this._say(this.wizard, 'EVERY TRACK YOU CONQUER HANGS HERE IN GOLD. FILL THE WALL.')],
      [7900,  () => this._say(this.jackChar, "...WHY'S THE RECORD ON THE PLAYER CRACKED?")],
      [10800, () => this._say(this.wizard, 'ONE HELL OF A NIGHT DID THAT. SPIN IT AND FIND OUT.')],
      [13600, () => this._endCutscene()],
    ];
    beats.forEach(([t, fn]) => this.csTimers.push(this.time.delayedCall(t, fn)));

    // Any click skips
    this.skipHint = this.add.text(GAME_W - 8, 6, 'CLICK TO SKIP', {
      fontSize: '4px', fontFamily: 'monospace', fill: '#555566'
    }).setOrigin(1, 0);
    this.input.on('pointerdown', this._skipCutscene, this);
  }

  _say(target, text) {
    this.csBubble?.destroy();
    this.csBubble = this.add.text(
      Math.min(Math.max(target.x + 40, 100), GAME_W - 104),
      target.y - target.displayHeight - 6,
      text,
      {
        fontSize: '7px', fontFamily: 'monospace', fill: '#111111', align: 'center',
        fontStyle: 'bold', backgroundColor: '#FFFFFF', padding: { x: 7, y: 5 },
        wordWrap: { width: 180 }
      }
    ).setOrigin(0.5, 1).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: this.csBubble, alpha: 1, duration: 250 });
  }

  _skipCutscene() {
    if (this.cutsceneDone) return;
    this.csTimers.forEach(t => t.remove());
    this.tweens.killTweensOf([this.wizard, this.jackChar]);
    this.wizard.setAlpha(1).setPosition(80, 216);
    this.jackChar.setAlpha(1).setPosition(44, 216);
    this._endCutscene();
  }

  _endCutscene() {
    this.cutsceneDone = true;
    this.input.off('pointerdown', this._skipCutscene, this);
    this.csBubble?.destroy();
    this.skipHint?.destroy();
    this.uiBits.forEach(b => { b.setAlpha(1); b.setInteractive(); });
    localStorage.setItem('rr_cutscene_seen', '1');
    // Wizard wanders over to keep the turntable company
    this.tweens.add({ targets: this.wizard, x: 304, duration: 1400, ease: 'Sine.easeInOut' });
  }

  _buildTurntable() {
    const tx = GAME_W / 2, ty = 160;
    const g = this.add.graphics();
    // Table
    g.fillStyle(0x2c1c0e); g.fillRect(tx - 56, ty + 20, 112, 7);
    g.fillStyle(0x3c2814); g.fillRect(tx - 56, ty + 20, 112, 2);
    g.fillStyle(0x1c1208); g.fillRect(tx - 50, ty + 27, 7, 26); g.fillRect(tx + 43, ty + 27, 7, 26);
    // Deck
    g.fillStyle(0x1c1c26); g.fillRect(tx - 46, ty - 2, 92, 22);
    g.fillStyle(0x2a2a38); g.fillRect(tx - 46, ty - 2, 92, 3);
    // Spinning record — its own graphics object so it can rotate
    this.disc = this.add.graphics({ x: tx - 14, y: ty + 9 });
    this.disc.fillStyle(0x0a0a0c); this.disc.fillCircle(0, 0, 12);
    this.disc.fillStyle(0x222228); this.disc.fillCircle(0, 0, 10);
    this.disc.fillStyle(0x0a0a0c); this.disc.fillCircle(0, 0, 8);
    this.disc.fillStyle(this.lastSong.albumColor); this.disc.fillCircle(0, 0, 4); // label matches the song
    this.disc.fillStyle(0x44444c); this.disc.fillRect(4, -1, 7, 1); // glint so spin reads
    // The crack — jagged line from the rim toward the label
    this.disc.fillStyle(0xC8C8D2);
    this.disc.fillRect(-3, -12, 2, 4); this.disc.fillRect(-2, -8, 2, 3);
    this.disc.fillRect(-4, -5, 2, 3); this.disc.fillRect(-2, -3, 2, 2);
    this.disc.fillStyle(0xE8E8F0); this.disc.fillRect(-3, -11, 1, 3); // bright seam
    // Tonearm
    g.fillStyle(0xAAAAAA); g.fillRect(tx + 22, ty, 2, 13); g.fillRect(tx + 14, ty + 11, 10, 2);
    g.fillStyle(0xCCCCCC); g.fillRect(tx + 21, ty - 2, 4, 3);

    this.nowPlaying = null;
    this.ttBtn = this.add.text(tx, ty + 40, `▶ SPIN: ${this.lastSong.sublabel}`, {
      fontSize: '7px', fontFamily: 'monospace', fill: '#B266FF', fontStyle: 'bold',
      backgroundColor: '#1a1024', padding: { x: 6, y: 4 }
    }).setOrigin(0.5).setInteractive();
    this.ttBtn.on('pointerover', () => this.ttBtn.setFill('#E0AAFF'));
    this.ttBtn.on('pointerout', () => this.ttBtn.setFill('#B266FF'));
    this.ttBtn.on('pointerdown', () => this._toggleSpin());
  }

  _toggleSpin() {
    if (this.nowPlaying) {
      this.nowPlaying.stop();
      this.nowPlaying = null;
      this.spinTween?.stop();
      this.ttBtn.setText(`▶ SPIN: ${this.lastSong.sublabel}`);
      return;
    }
    this.nowPlaying = this.sound.add(this.lastSong.audioKey, { volume: 0.7 });
    this.nowPlaying.play();
    this.spinTween = this.tweens.add({ targets: this.disc, angle: 360, duration: 1800, repeat: -1 });
    this.ttBtn.setText('◼ STOP THE RECORD');
  }
}

class EasterEggScene extends Phaser.Scene {
  constructor() { super('EasterEggScene'); }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    const g = this.add.graphics();
    // Dark stone bg
    g.fillStyle(0x0d0d1a); g.fillRect(0, 0, GAME_W, GAME_H);
    // Outer border
    g.fillStyle(0x2a2a3a); g.fillRect(16, 14, GAME_W - 32, GAME_H - 28);
    g.fillStyle(0x1a1a28); g.fillRect(20, 18, GAME_W - 40, GAME_H - 36);
    // Corner gems
    [[18, 16], [GAME_W - 26, 16], [18, GAME_H - 24], [GAME_W - 26, GAME_H - 24]].forEach(([x, y]) => {
      g.fillStyle(0x1DB954); g.fillRect(x, y, 8, 8);
      g.fillStyle(0x00FF7F); g.fillRect(x + 1, y + 1, 3, 3);
    });

    // Header
    this.add.text(GAME_W / 2, 32, '— CHARACTER SHEET —', {
      fontSize: '6px', fontFamily: 'monospace', fill: '#FFD700', letterSpacing: 3
    }).setOrigin(0.5);

    // Divider
    const gd = this.add.graphics();
    gd.fillStyle(0x444455); gd.fillRect(36, 42, GAME_W - 72, 1);

    // Name + class
    this.add.text(GAME_W / 2, 54, 'JACK HICKS', {
      fontSize: '13px', fontFamily: 'monospace', fill: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 68, 'CLASS: Media Strategist + AI Builder', {
      fontSize: '5px', fontFamily: 'monospace', fill: '#B3B3B3'
    }).setOrigin(0.5);

    const gd2 = this.add.graphics();
    gd2.fillStyle(0x333344); gd2.fillRect(36, 76, GAME_W - 72, 1);

    // Stats
    const stats = [
      { label: 'STR', name: 'Media Ops',    val: 4, color: 0xFF6B35 },
      { label: 'INT', name: 'AI Tools',     val: 5, color: 0x00BFFF },
      { label: 'DEX', name: 'Film/Video',   val: 4, color: 0xFFD700 },
      { label: 'CHA', name: 'Brand Voice',  val: 5, color: 0xFF69B4 },
      { label: 'WIS', name: 'MMA IQ',       val: 4, color: 0x9B59B6 },
    ];

    const gs = this.add.graphics();
    stats.forEach((stat, i) => {
      const y = 86 + i * 24;
      // Stat label
      this.add.text(36, y, stat.label, {
        fontSize: '6px', fontFamily: 'monospace', fill: '#FFD700', fontStyle: 'bold'
      });
      this.add.text(56, y, stat.name, {
        fontSize: '6px', fontFamily: 'monospace', fill: '#AAAAAA'
      });
      // Pip bar (5 pips)
      for (let p = 0; p < 5; p++) {
        gs.fillStyle(p < stat.val ? stat.color : 0x2a2a3a);
        gs.fillRect(GAME_W - 90 + p * 17, y, 14, 6);
        if (p < 4) { gs.fillStyle(0x0d0d1a); gs.fillRect(GAME_W - 90 + p * 17 + 14, y, 3, 6); }
      }
    });

    // Enter Portfolio button
    const btn = this.add.text(GAME_W / 2, GAME_H - 40, '[ ENTER PORTFOLIO → ]', {
      fontSize: '7px', fontFamily: 'monospace', fill: '#1DB954',
      backgroundColor: '#0a1f0a', padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setInteractive();
    btn.on('pointerover', () => btn.setFill('#00FF7F'));
    btn.on('pointerout', () => btn.setFill('#1DB954'));
    btn.on('pointerdown', () => window.open('https://hicksjack14.github.io/Portfolio/', '_blank'));

    // Back to menu
    const back = this.add.text(GAME_W / 2, GAME_H - 22, '← back to menu', {
      fontSize: '5px', fontFamily: 'monospace', fill: '#555566'
    }).setOrigin(0.5).setInteractive();
    back.on('pointerover', () => back.setFill('#AAAAAA'));
    back.on('pointerout', () => back.setFill('#555566'));
    back.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('SpotifyScene'));
    });
  }
}

// ── Phaser Config ──────────────────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false }
  },
  scene: [BootScene, CinematicScene, SpotifyScene, RunnerScene, WinScene, GameOverScene, RecordRoomScene, EasterEggScene]
};

window.__game = new Phaser.Game(config);
