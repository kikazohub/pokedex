import {
  TYPE_META,
  STAT_LABELS,
  STAT_ORDER,
  HABITAT_META,
  GROWTH_LABELS,
  EGG_GROUP_LABELS,
  SHAPE_LABELS,
  COLOR_META,
  EVO_ITEMS_ES,
  EVO_LOCATION_ES,
  generationOf,
  dexNumber,
  prettyName,
  genderRatioText,
  hatchSteps,
  officialArtShiny,
  animatedSprite,
  animatedSpriteShiny,
} from "./constants";

const API = "https://pokeapi.co/api/v2";
const TTL = 1000 * 60 * 60 * 24 * 30;

const cache = new Map<string, { t: number; v: unknown }>();

async function getJSON<T>(key: string, url: string): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.v as T;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PokeAPI ${url} -> ${res.status}`);
  const data = (await res.json()) as T;
  cache.set(key, { t: Date.now(), v: data });
  return data;
}

const poke = <T,>(path: string): Promise<T> => getJSON<T>(path, API + path);

interface RawNamed {
  name: string;
  url: string;
}

interface RawType {
  slot: number;
  type: RawNamed;
}

interface RawAbility {
  is_hidden: boolean;
  slot: number;
  ability: RawNamed;
}

interface RawStat {
  base_stat: number;
  stat: RawNamed;
}

interface RawSprites {
  front_default: string | null;
  other: {
    "official-artwork": { front_default: string | null; front_shiny: string | null };
  };
}

interface RawCries {
  latest: string | null;
  legacy: string | null;
}

interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: RawType[];
  abilities: RawAbility[];
  stats: RawStat[];
  sprites: RawSprites;
  cries?: RawCries;
}

interface RawSpecies {
  name: string;
  genera: { genus: string; language: { name: string } }[];
  flavor_text_entries: { flavor_text: string; language: { name: string }; version: { name: string } }[];
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  growth_rate: RawNamed;
  egg_groups: RawNamed[];
  habitat: { name: string } | null;
  color: RawNamed;
  shape: { name: string } | null;
  evolves_from_species: { name: string } | null;
  evolution_chain: { url: string };
  names: { name: string; language: { name: string } }[];
}

interface RawChain {
  chain: RawChainNode;
}

interface RawChainNode {
  is_baby: boolean;
  species: RawNamed;
  evolution_details: RawEvolutionDetail[];
  evolves_to: RawChainNode[];
}

interface RawEvolutionDetail {
  trigger: { name: string };
  min_level: number | null;
  item: RawNamed | null;
  held_item: RawNamed | null;
  known_move: RawNamed | null;
  known_move_type: RawNamed | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  gender: number | null;
  time_of_day: string;
  location: RawNamed | null;
  trade_species: RawNamed | null;
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
  relative_physical_stats: number | null;
  region: RawNamed | null;
  near_special_rock: boolean;
}

interface RawTypeData {
  damage_relations: {
    double_damage_from: RawNamed[];
    half_damage_from: RawNamed[];
    no_damage_from: RawNamed[];
  };
}

export interface PkmSummary {
  id: number;
  name: string;
}

export interface TypeChip {
  name: string;
  label: string;
  hex: string;
}

export interface StatRow {
  key: string;
  label: string;
  value: number;
}

export interface EvoNode {
  id: number;
  name: string;
  number: string;
  isBaby: boolean;
  types: TypeChip[];
  method: string | null;
  methodIcon: string;
  children: EvoNode[];
}

export interface EffectGroup {
  key: string;
  label: string;
  icon: string;
  items: TypeChip[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  displayName: string;
  number: string;
  genus: string;
  types: TypeChip[];
  height: { m: number; text: string };
  weight: { kg: number; text: string };
  abilities: { name: string; display: string; hidden: boolean }[];
  stats: StatRow[];
  bst: number;
  sprites: {
    official: string | null;
    officialShiny: string | null;
    animated: string | null;
    animatedShiny: string | null;
  };
  cry: string | null;
  cryLegacy: string | null;
  flavor: { text: string; version: string } | null;
  species: {
    habitat: string | null;
    habitatEmoji: string;
    eggGroups: string[];
    captureRate: number | null;
    baseHappiness: number | null;
    growthRate: string;
    gender: string;
    hatchSteps: number;
    color: { label: string; hex: string };
    shape: string;
  };
  chain: EvoNode;
  effectiveness: EffectGroup[];
  flags: { isBaby: boolean; isLegendary: boolean; isMythical: boolean };
  generation: string;
}

export async function getPokemonList(): Promise<PkmSummary[]> {
  const raw = await poke<{ results: RawNamed[] }>(`/pokemon?limit=100000`);
  return raw.results
    .map((r) => {
      const id = Number(r.url.split("/").filter(Boolean).pop());
      return { id, name: r.name };
    })
    .filter((p) => Number.isInteger(p.id))
    .sort((a, b) => a.id - b.id);
}

function idFromUrl(url: string): number {
  return Number(url.split("/").filter(Boolean).pop());
}

async function getTypeChips(names: string[]): Promise<TypeChip[]> {
  return names
    .map((n) => {
      const meta = TYPE_META[n];
      if (!meta) return null;
      return { name: n, label: meta.label, hex: meta.hex };
    })
    .filter(Boolean) as TypeChip[];
}

function spp(p: RawPokemon): PokemonDetail["sprites"] {
  return {
    official: p.sprites.other["official-artwork"].front_default ?? animatedSprite(p.id),
    officialShiny: p.sprites.other["official-artwork"].front_shiny ?? officialArtShiny(p.id),
    animated: animatedSprite(p.id),
    animatedShiny: animatedSpriteShiny(p.id),
  };
}

function evoMethod(details: RawEvolutionDetail[]): { method: string; icon: string } {
  const d = details[details.length - 1];
  if (!d) return { method: "", icon: "" };
  const withHappiness =
    (d.min_happiness !== null && d.min_happiness !== undefined) ||
    d.min_affection !== null;
  switch (d.trigger.name) {
    case "level-up":
      if (d.min_level != null) {
        const world = d.time_of_day === "day" ? " (de día)" : d.time_of_day === "night" ? " (de noche)" : "";
        const gender = d.gender ? (d.gender === 1 ? " (hembra)" : " (macho)") : "";
        return { method: `Nivel ${d.min_level}${world}${gender}`, icon: "⬆️" };
      }
      if (d.known_move_type)
        return { method: `Conociendo movimiento de tipo ${TYPE_META[d.known_move_type.name]?.label ?? d.known_move_type.name}`, icon: "💫" };
      if (d.known_move) return { method: `Conociendo ${prettyName(d.known_move.name)}`, icon: "💫" };
      if (withHappiness)
        return {
          method: "Gran amistad" + (d.time_of_day === "day" ? " (día)" : d.time_of_day === "night" ? " (noche)" : ""),
          icon: "💖",
        };
      if (d.min_beauty != null) return { method: "Gran belleza", icon: "✨" };
      if (d.location)
        return {
          method: `Bajo el efecto de ${EVO_LOCATION_ES[d.location.name] ?? prettyName(d.location.name)}`,
          icon: "📍",
        };
      if (d.near_special_rock)
        return { method: "Cerca de una roca especial", icon: "🪨" };
      if (d.held_item) return { method: `Subiendo con ${prettyName(d.held_item.name)}`, icon: "⬆️" };
      if (d.relative_physical_stats === 1) return { method: "Nivel con Ataque > Defensa", icon: "⚔️" };
      if (d.relative_physical_stats === -1) return { method: "Nivel con Defensa > Ataque", icon: "🛡️" };
      if (d.needs_overworld_rain) return { method: "Nivel bajo la lluvia", icon: "🌧️" };
      if (d.turn_upside_down) return { method: "Con la consola boca abajo", icon: "🔄" };
      return { method: "Subiendo de nivel", icon: "⬆️" };
    case "use-item":
      return {
        method: d.item ? `Con ${EVO_ITEMS_ES[d.item.name] ?? prettyName(d.item.name)}` : "Con un objeto",
        icon: "💎",
      };
    case "trade":
      return {
        method: d.trade_species ? `Intercambiando con ${prettyName(d.trade_species.name)}` : "Intercambio",
        icon: "🔄",
      };
    case "shed":
      return { method: "Dejando piel (evolución especial)", icon: "🖤" };
    case "three-critical-hits":
      return { method: "Tras tres golpes críticos", icon: "⚠️" };
    case "take-damage":
      return { method: "Recibiendo daño y subiendo", icon: "🤕" };
    case "recoil-damage":
      return { method: "Tras daño por retroceso", icon: "💥" };
    case "agile-style-move":
      return { method: "Moviéndose estilo ágil", icon: "⚡" };
    case "strong-style-move":
      return { method: "Moviéndose estilo fuerte", icon: "💪" };
    case "use-move":
      return { method: `Usando ${d.known_move ? prettyName(d.known_move.name) : "un movimiento"}`, icon: "💫" };
    case "use-item-when-rain":
      return { method: `Con ${d.item ? prettyName(d.item.name) : "objeto"} bajo la lluvia`, icon: "🌧️" };
    case "level-up-when-rain":
      return { method: "Nivel bajo la lluvia", icon: "🌧️" };
    case "spin":
      return { method: "Subiendo tras girar", icon: "🌀" };
    default:
      return { method: prettyName(d.trigger.name), icon: "✨" };
  }
}

async function buildChain(raw: RawChain): Promise<EvoNode> {
  async function walk(node: RawChainNode, method: { method: string; icon: string }): Promise<EvoNode> {
    const id = idFromUrl(node.species.url);
    let types: TypeChip[] = [];
    try {
      const p = await getPokemon(id);
      types = (await getTypeChips(p.types.map((t) => t.type.name))) || [];
    } catch {
      types = [];
    }
    const children = await Promise.all(
      node.evolves_to.map((child) => walk(child, evoMethod(child.evolution_details))),
    );
    return {
      id,
      name: prettyName(node.species.name),
      number: dexNumber(id),
      isBaby: node.is_baby,
      types,
      method: method.method || null,
      methodIcon: method.icon,
      children,
    };
  }
  return walk(raw.chain, { method: "", icon: "" });
}

const typeCache = new Map<string, TypeChip>();

export async function getTypeChip(name: string): Promise<TypeChip> {
  const meta = TYPE_META[name];
  if (!meta) throw new Error(`Tipo desconocido: ${name}`);
  return { name, label: meta.label, hex: meta.hex };
}

async function getTypesOf(p: RawPokemon): Promise<TypeChip[]> {
  const out: TypeChip[] = [];
  for (const t of p.types) {
    const chip = typeCache.get(t.type.name) ?? (await getTypeChip(t.type.name));
    typeCache.set(t.type.name, chip);
    out.push(chip);
  }
  return out;
}

async function buildEffectiveness(typeNames: string[]): Promise<EffectGroup[]> {
  const multipliers = new Map<string, number>();
  for (const t of typeNames) {
    const td = await poke<RawTypeData>(`/type/${t}`);
    for (const x of td.damage_relations.double_damage_from)
      multipliers.set(x.name, (multipliers.get(x.name) ?? 1) * 2);
    for (const x of td.damage_relations.half_damage_from)
      multipliers.set(x.name, (multipliers.get(x.name) ?? 1) * 0.5);
    for (const x of td.damage_relations.no_damage_from)
      multipliers.set(x.name, (multipliers.get(x.name) ?? 1) * 0);
  }
  const weak: TypeChip[] = [];
  const resist: TypeChip[] = [];
  const immune: TypeChip[] = [];
  for (const [name, m] of [...multipliers.entries()].sort((a, b) => b[1] - a[1])) {
    const chip = typeCache.get(name) ?? (await getTypeChip(name));
    if (m >= 2) weak.push(chip);
    else if (m > 0 && m < 1) resist.push(chip);
    else if (m === 0) immune.push(chip);
  }
  return [
    { key: "weak", label: "Débil contra", icon: "⚔️", items: weak },
    { key: "resist", label: "Resiste", icon: "🛡️", items: resist },
    { key: "immune", label: "Inmune a", icon: "❌", items: immune },
  ];
}

export async function getPokemon(identifier: string | number): Promise<RawPokemon> {
  return poke<RawPokemon>(`/pokemon/${identifier}`);
}

export async function getPokemonDetail(identifier: string | number): Promise<PokemonDetail> {
  const p = await getPokemon(identifier);
  const speciesId = identifier === p.id ? p.id : p.id;
  const species = await poke<RawSpecies>(`/pokemon-species/${speciesId}`);

  const chainRaw = await poke<RawChain>(species.evolution_chain.url.replace(API, ""));
  const [chain, types] = await Promise.all([
    buildChain(chainRaw),
    getTypesOf(p),
  ]);

  const names = p.stats.map((s) => ({
    key: s.stat.name,
    label: STAT_LABELS[s.stat.name] ?? prettyName(s.stat.name),
    value: s.base_stat,
  }));
  const ordered = STAT_ORDER.map((k) => names.find((n) => n.key === k)).filter(
    Boolean,
  ) as StatRow[];

  const esName =
    species.names.find((n) => n.language.name === "es")?.name ?? prettyName(p.name);

  const genus =
    species.genera.find((g) => g.language.name === "es")?.genus ??
    species.genera.find((g) => g.language.name === "en")?.genus ??
    "";

  const flavorEnt =
    [...species.flavor_text_entries]
      .reverse()
      .find((e) => e.language.name === "es") ??
    [...species.flavor_text_entries]
      .reverse()
      .find((e) => e.language.name === "en") ??
    null;

  const habitatMeta = species.habitat ? HABITAT_META[species.habitat.name] : null;

  return {
    id: p.id,
    name: p.name,
    displayName: esName,
    number: dexNumber(p.id),
    genus,
    types,
    height: { m: p.height / 10, text: `${(p.height / 10).toLocaleString("es")} m` },
    weight: { kg: p.weight / 10, text: `${(p.weight / 10).toLocaleString("es")} kg` },
    abilities: p.abilities
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({
        name: a.ability.name,
        display: prettyName(a.ability.name),
        hidden: a.is_hidden,
      })),
    stats: ordered,
    bst: p.stats.reduce((acc, s) => acc + s.base_stat, 0),
    sprites: spp(p),
    cry: p.cries?.latest ?? p.cries?.legacy ?? null,
    cryLegacy: p.cries?.legacy ?? null,
    flavor: flavorEnt
      ? { text: flavorEnt.flavor_text.replaceAll("\n", " ").trim(), version: flavorEnt.version.name }
      : null,
    species: {
      habitat: habitatMeta?.label ?? null,
      habitatEmoji: habitatMeta?.emoji ?? "❓",
      eggGroups: species.egg_groups.map((g) => EGG_GROUP_LABELS[g.name] ?? prettyName(g.name)),
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      growthRate: GROWTH_LABELS[species.growth_rate.name] ?? prettyName(species.growth_rate.name),
      gender: genderRatioText(species.gender_rate),
      hatchSteps: hatchSteps(species.hatch_counter),
      color: COLOR_META[species.color.name] ?? { label: prettyName(species.color.name), hex: "#888" },
      shape: species.shape ? SHAPE_LABELS[species.shape.name] ?? prettyName(species.shape.name) : "—",
    },
    chain,
    effectiveness: await buildEffectiveness(typeNamesOf(types)),
    flags: {
      isBaby: species.is_baby,
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    },
    generation: generationOf(p.id),
  };
}

function typeNamesOf(types: TypeChip[]): string[] {
  return types.map((t) => t.name);
}