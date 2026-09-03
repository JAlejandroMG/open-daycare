import { PokemonViewer } from "@/components/pokemon/PokemonViewer";

export default function PokemonPage() {
  return (
    <div className="min-h-screen bg-[#FBF4EC] p-8">
      <h1 className="text-3xl font-fredoka text-center mb-8">
        Pokémon Viewer
      </h1>
      <PokemonViewer />
    </div>
  );
}
