"use client";

import { useState, useEffect } from "react";

type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
};

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

export function PokemonViewer() {
  const [pokemonId, setPokemonId] = useState(1);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
        );

        if (!response.ok) {
          throw new Error("Pokemon no encontrado");
        }

        const data = await response.json();
        setPokemon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [pokemonId]);

  const handlePrevious = () => {
    if (pokemonId > 1) {
      setPokemonId((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (pokemonId < 1025) {
      setPokemonId((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC7E62]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => setPokemonId(1)}
          className="mt-4 px-4 py-2 bg-[#EC7E62] text-white rounded-lg"
        >
          Reiniciar
        </button>
      </div>
    );
  }

  if (!pokemon) return null;

  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-b from-[#FBF4EC] to-white p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-nunito text-gray-500">
            #{String(pokemon.id).padStart(3, "0")}
          </span>
          <div className="flex gap-2">
            {pokemon.types.map(({ type }) => (
              <span
                key={type.name}
                className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                  TYPE_COLORS[type.name] || "bg-gray-400"
                }`}
              >
                {type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src={imageUrl}
            alt={pokemon.name}
            className="w-48 h-48 object-contain drop-shadow-lg"
          />
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-fredoka text-center capitalize mb-4">
          {pokemon.name}
        </h2>

        <div className="space-y-2">
          {pokemon.stats.map(({ base_stat, stat }) => (
            <div key={stat.name} className="flex items-center gap-2">
              <span className="w-28 text-xs font-nunito text-gray-500 capitalize">
                {stat.name.replace("-", " ")}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#EC7E62] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(base_stat, 100)}%` }}
                />
              </div>
              <span className="w-8 text-xs font-nunito text-gray-700 text-right">
                {base_stat}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between p-4 bg-gray-50">
        <button
          onClick={handlePrevious}
          disabled={pokemonId <= 1}
          className="px-6 py-2 bg-[#F6A98E] text-white rounded-lg font-nunito font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EC7E62] transition-colors"
        >
          ← Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={pokemonId >= 1025}
          className="px-6 py-2 bg-[#F6A98E] text-white rounded-lg font-nunito font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EC7E62] transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
