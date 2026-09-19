import { getPokemonDetail } from "@/lib/pokedex";

export async function GET(_req: Request, ctx: RouteContext<"/api/pkm/[id]">) {
  const { id } = await ctx.params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric < 1) {
    return Response.json({ error: "Identificador inválido." }, { status: 400 });
  }
  try {
    const detail = await getPokemonDetail(numeric);
    return Response.json(detail);
  } catch {
    return Response.json(
      { error: "No se encontró ningún Pokémon con ese número." },
      { status: 404 },
    );
  }
}