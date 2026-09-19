export const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const officialArt = (id: number) =>
  `${SPRITE_BASE}/other/official-artwork/${id}.png`;

export const officialArtShiny = (id: number) =>
  `${SPRITE_BASE}/other/official-artwork/shiny/${id}.png`;

export const animatedSprite = (id: number) =>
  `${SPRITE_BASE}/other/showdown/${id}.gif`;

export const animatedSpriteShiny = (id: number) =>
  `${SPRITE_BASE}/other/showdown/shiny/${id}.gif`;

export interface TypeMeta {
  label: string;
  hex: string;
}

export const TYPE_META: Record<string, TypeMeta> = {
  normal: { label: "Normal", hex: "#A8A77A" },
  fire: { label: "Fuego", hex: "#EE8130" },
  water: { label: "Agua", hex: "#6390F0" },
  electric: { label: "Eléctrico", hex: "#F7D02C" },
  grass: { label: "Planta", hex: "#7AC74C" },
  ice: { label: "Hielo", hex: "#96D9D6" },
  fighting: { label: "Lucha", hex: "#C22E28" },
  poison: { label: "Veneno", hex: "#A33EA1" },
  ground: { label: "Tierra", hex: "#E2BF65" },
  flying: { label: "Volador", hex: "#A98FF3" },
  psychic: { label: "Psíquico", hex: "#F95587" },
  bug: { label: "Bicho", hex: "#A6B91A" },
  rock: { label: "Roca", hex: "#B6A136" },
  ghost: { label: "Fantasma", hex: "#735797" },
  dragon: { label: "Dragón", hex: "#6F35FC" },
  dark: { label: "Siniestro", hex: "#705746" },
  steel: { label: "Acero", hex: "#B7B7CE" },
  fairy: { label: "Hada", hex: "#D685AD" },
};

export const TYPE_ORDER = Object.keys(TYPE_META);

export const GEN_RANGES: { min: number; max: number; label: string }[] = [
  { min: 1, max: 151, label: "I · Kanto" },
  { min: 152, max: 251, label: "II · Johto" },
  { min: 252, max: 386, label: "III · Hoenn" },
  { min: 387, max: 493, label: "IV · Sinnoh" },
  { min: 494, max: 649, label: "V · Teselia" },
  { min: 650, max: 721, label: "VI · Kalos" },
  { min: 722, max: 809, label: "VII · Alola" },
  { min: 810, max: 905, label: "VIII · Galar" },
  { min: 906, max: 1025, label: "IX · Paldea" },
  { min: 1026, max: Infinity, label: "X · Nueva" },
];

export const generationOf = (id: number) =>
  GEN_RANGES.find((g) => id >= g.min && id <= g.max)?.label ?? "???";

export const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Ataque Esp.",
  "special-defense": "Defensa Esp.",
  speed: "Velocidad",
};

export const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

export const HABITAT_META: Record<string, { label: string; emoji: string }> = {
  forest: { label: "Bosque", emoji: "🌲" },
  meadow: { label: "Pradera", emoji: "🌼" },
  grassland: { label: "Pasto", emoji: "🌾" },
  "waters-edge": { label: "Orilla del agua", emoji: "🏝️" },
  sea: { label: "Mar", emoji: "🌊" },
  cave: { label: "Cueva", emoji: "⛰️" },
  mountain: { label: "Montaña", emoji: "🏔️" },
  "rough-terrain": { label: "Terreno abrupto", emoji: "🪨" },
  urban: { label: "Zona urbana", emoji: "🏙️" },
  rare: { label: "Lugar raro", emoji: "🌀" },
};

export const GROWTH_LABELS: Record<string, string> = {
  slow: "Lenta",
  medium: "Media",
  fast: "Rápida",
  "medium-slow": "Media-lenta",
  "slow-then-very-fast": "Lenta, luego muy rápida",
  "fast-then-very-slow": "Rápida, luego muy lenta",
  erratic: "Errática",
  fluctuating: "Fluctuante",
};

export const EGG_GROUP_LABELS: Record<string, string> = {
  monster: "Monstruo",
  "water1": "Agua 1",
  "water2": "Agua 2",
  "water3": "Agua 3",
  bug: "Bicho",
  flying: "Volador",
  field: "Campo",
  fairy: "Hada",
  grass: "Planta",
  "human-like": "Humanoide",
  mineral: "Mineral",
  amorphous: "Amorfo",
  ditto: "Ditto",
  dragon: "Dragón",
  undiscovered: "Sin descubrir",
};

export const SHAPE_LABELS: Record<string, string> = {
  quadruped: "Cuadrúpedo",
  bipedal: "Bípedo",
  "bipedal-tailed": "Bípedo sin cola",
  fish: "Pez",
  wings: "Alado",
  arms: "Con brazos",
  "multiple-heads": "Multicéfalo",
  humanoid: "Humanoide",
  ball: "Esférico",
  squid: "Calamar",
  blob: "Amorfo",
  upright: "Erguido",
  legs: "Con patas",
  serpentine: "Serpiente",
  "bug-like": "Forma de bicho",
  heads: "Cabezas",
};

export const COLOR_META: Record<string, { label: string; hex: string }> = {
  black: { label: "Negro", hex: "#3B3B3B" },
  blue: { label: "Azul", hex: "#4460B8" },
  brown: { label: "Marrón", hex: "#98650F" },
  gray: { label: "Gris", hex: "#7B8794" },
  green: { label: "Verde", hex: "#4C9A2A" },
  pink: { label: "Rosa", hex: "#E97CA6" },
  purple: { label: "Púrpura", hex: "#9454C6" },
  red: { label: "Rojo", hex: "#D34F41" },
  white: { label: "Blanco", hex: "#E8E8E8" },
  yellow: { label: "Amarillo", hex: "#E6C83B" },
};

export const EVO_ITEMS_ES: Record<string, string> = {
  "fire-stone": "Piedra Fuego",
  "water-stone": "Piedra Agua",
  "thunder-stone": "Piedra Trueno",
  "leaf-stone": "Piedra Hoja",
  "moon-stone": "Piedra Lunar",
  "sun-stone": "Piedra Solar",
  "dusk-stone": "Piedra Crepuscular",
  "dawn-stone": "Piedra Alba",
  "shiny-stone": "Piedra Brillante",
  "ice-stone": "Piedra Helada",
  "kings-rock": "Roca del Rey",
  "metal-coat": "Revestimiento Metálico",
  "dragon-scale": "Escama de Dragón",
  upgrade: "Mejora",
  "dubious-disc": "Disco Extraño",
  electirizer: "Electrizador",
  magmarizer: "Magmatizador",
  protector: "Protector",
  "razor-claw": "Garra Afilada",
  "razor-fang": "Colmillo Agudo",
  "reaper-cloth": "Tela Fúnebre",
  "deep-sea-tooth": "Diente Marino",
  "deep-sea-scale": "Escama Marina",
  sachet: "Bolsita Fragante",
  "whipped-dream": "Nata Batida",
  "cracked-pot": "Tetera Agrietada",
  "chipped-pot": "Tetera Astillada",
  "sweet-apple": "Manzana Dulce",
  "tart-apple": "Manzana Ácida",
  "galarica-cuff": "Pulsera Galar",
  "galarica-wreath": "Corona Galar",
  "black-augurite": "Augurita Negra",
  "linking-cord": "Cordón Unión",
  "peat-block": "Bloque de Turba",
  "auspicious-armor": "Armadura Auspiciosa",
  "malicious-armor": "Armadura Hostil",
  "metal-alloy": "Aleación Metálica",
  "greavestone": "Lápida Grieta",
  "unremarkable-teacup": "Taza Corriente",
  "masterpiece-teacup": "Taza Obra Maestra",
  "syrupy-apple": "Manzana Almibarada",
  "berry-sweet": "Baya Dulce",
  "clover-sweet": "Dulce Trébol",
  "flower-sweet": "Dulce Flor",
  "love-sweet": "Dulce Corazón",
  "ribbon-sweet": "Dulce Cinta",
  "star-sweet": "Dulce Estrella",
  "prism-scale": "Escama Prisma",
  "oval-stone": "Piedra Oval",
  "everstone": "Piedra Eterna",
  "root-fossil": "Fósil Raíz",
  "claw-fossil": "Fósil Garra",
  "sweet-heart": "Corazón Dulce",
  "scattered-teacup": "Taza Rota",
  "music-disc": "Disco de Música",
  "satchet": "Bolsita Fragante",
};

export const EVO_LOCATION_ES: Record<string, string> = {
  "lush-jungle": "el Bosque Frondoso",
  "mount-lanakila": "el Monte Lanakila",
  "mount-coronet": "el Monte Corona",
  "eterna-forest": "el Bosque Eterno",
  "glaseado-mountain": "el Monte Glaseado",
  "unity-tower": "la Torre Unión",
  "crown-undra": "la Tundra Corona",
  "sotopolis-city": "Ciudad Arrecípolis",
  "special-rock": "una roca especial",
};

export const prettyName = (name: string) =>
  name
    .split("-")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

export const dexNumber = (id: number) => id.toString().padStart(3, "0");

export const hexToRgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const genderRatioText = (rate: number) => {
  if (rate === -1) return "Sin género";
  const female = Math.round((rate / 8) * 100);
  const male = 100 - female;
  if (female === 0) return "100% Macho";
  if (male === 0) return "100% Hembra";
  return `${male}% M · ${female}% H`;
};

export const hatchSteps = (hatchCounter: number) =>
  hatchCounter * 255;