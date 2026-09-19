import { getPokemonList } from "@/lib/pokedex";

export async function GET() {
  try {
    const list = await getPokemonList();
    return Response.json({ data: list, total: list.length });
  } catch {
    return Response.json({ error: "No se pudo cargar la lista de Pokémon." }, { status: 500 });
  }
}