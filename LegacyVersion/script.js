//Grab Elements 
const generateBtn = document.getElementById('generate')
const clearFavorites = document.getElementById('clear-favorites')
const pokemonCardContainer = document.getElementById('pokemon-card')
const favoriteCardsContainer = document.getElementById('favorite-cards')

//Event Listeners 
generateBtn.addEventListener('click', function () {
  // Get a random Pokemon ID
  const randomId = randomPokemon();
  // Pass it to the fetch function
  fetchPokeData(randomId);
})

// Add event listener for Clear Favorites button
clearFavorites.addEventListener('click', clearAllFavorites);

// Add event listener for favorite cards
favoriteCardsContainer.addEventListener('dblclick', function (e) {
  const favoriteCard = e.target.closest('.favorite-card');
  if (favoriteCard) {
    const pokemonId = favoriteCard.dataset.id;
    const favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
    const pokemon = favorites.find(p => p.id.toString() === pokemonId);

    if (pokemon) {
      showPokemonOverlay(pokemon);
    }
  }
});

// Current Pokemon Data
let currentPokemon = ''

// Save to local storage
pokemonCardContainer.addEventListener('click', function (e) {
  if (e.target.closest('.favorite-btn')) {
    const pokemonToSave = {
      id: currentPokemon.id,
      name: currentPokemon.name,
      sprite: currentPokemon.sprites.front_default,
      types: currentPokemon.types,
      stats: currentPokemon.stats
    }

    // Get existing favorites array or create empty array if none exists
    const favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];

    // Check if this Pokemon already exists in favorites
    const isDuplicate = favorites.some(pokemon => pokemon.id === currentPokemon.id);

    if (!isDuplicate) {
      // Add new Pokemon to favorites array
      favorites.push(pokemonToSave);

      // Save back to localStorage (stringify the array)
      localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));

      console.log(`Added ${pokemonToSave.name} to favorites!`);
      // Update the favorites display
      displayFavorites();
    } else {
      console.log(`${pokemonToSave.name} is already in your favorites!`);
    }
  }
})

//Generate Random ID
function randomPokemon() {
  let max = 152;
  let min = 1;
  let pokemonId = Math.floor(Math.random() * (max - min) + min);
  console.log("Random Pokemon ID:", pokemonId);
  return pokemonId
}

// fetch API Data
async function fetchPokeData(pokemonId) {
  // Default to ID 25 (Pikachu) if no ID is provided
  const id = pokemonId || 25;
  const url = `https://pokeapi.co/api/v2/pokemon/${id}/`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Response statues: ${response.status}`)
    }
    const pokemon = await response.json();
    // console.log(pokemon)
    displayPokemon(pokemon)
  } catch (error) {
    console.error("API failed to find data", error.message)
  }
}

//Display PokemonData
function displayPokemon(pokemon) {
  // Format the ID with leading zeros
  const formattedId = String(pokemon.id).padStart(3, '0');

  // Get primary type for theming
  const primaryType = pokemon.types[0].type.name;
  const typeColor = getTypeColor(primaryType);
  const gradientColors = getTypeGradient(primaryType);

  // Create HTML for the pokemon card
  const pokemonCard = `
    <article class="pokemon-card relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-${typeColor}/50 transform hover:-translate-y-1">
      <!-- Card Background with Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br ${gradientColors} opacity-90"></div>
      
      <!-- Card Content -->
      <div class="relative p-6 z-10">
        <!-- Card Header with Name and ID -->
        <header class="card-header flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold capitalize text-white">${pokemon.name}</h2>
          <span class="text-white/70 font-mono bg-black/20 px-2 py-1 rounded-md text-sm">#${formattedId}</span>
        </header>
        
        <!-- Pokemon Image -->
        <figure class="card-image bg-white/10 backdrop-blur-sm rounded-xl flex justify-center items-center p-4 mb-6 border border-white/20">
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="w-40 h-40 object-contain drop-shadow-lg">
        </figure>
        
        <!-- Type Badges -->
        <ul class="type-badges flex gap-2 mb-6">
          ${pokemon.types.map(typeInfo =>
    `<li class="type-badge px-4 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/10 shadow-md">${typeInfo.type.name}</li>`
  ).join('')}
        </ul>
        
        <!-- Stats -->
        <section class="stats-container bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
          <h3 class="text-lg font-semibold mb-3 text-white">Stats</h3>
          <dl class="stats space-y-2">
            ${pokemon.stats.map(stat => {
    const percentage = (stat.base_stat / 255) * 100;
    return `
              <div class="stat">
                <div class="flex justify-between items-center mb-1">
                  <dt class="stat-name text-white/70 text-sm">${formatStatName(stat.stat.name)}</dt>
                  <dd class="stat-value text-white font-medium">${stat.base_stat}</dd>
                </div>
                <div class="w-full bg-black/30 rounded-full h-2">
                  <div class="bg-white/80 h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
              </div>`;
  }).join('')}
          </dl>
        </section>
        
        <!-- Physical Attributes -->
        <section class="physical-attrs grid grid-cols-2 gap-4 mb-6">
          <dl class="attr bg-black/20 backdrop-blur-sm p-3 rounded-xl text-center border border-white/10">
            <dt class="text-white/70 text-xs mb-1">Height</dt>
            <dd class="text-white font-medium">${(pokemon.height / 10).toFixed(1)}m</dd>
          </dl>
          <dl class="attr bg-black/20 backdrop-blur-sm p-3 rounded-xl text-center border border-white/10">
            <dt class="text-white/70 text-xs mb-1">Weight</dt>
            <dd class="text-white font-medium">${(pokemon.weight / 10).toFixed(1)}kg</dd>
          </dl>
        </section>
        
        <!-- Save Button -->
        <footer>
          <button id="save-btn" class="favorite-btn w-full bg-white/90 text-gray-800 py-3 px-4 rounded-xl font-semibold shadow-lg hover:bg-white transition-all duration-300 flex justify-center items-center gap-2" data-id="${pokemon.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            Save to Favorites
          </button>
        </footer>
      </div>
    </article>
  `;

  // Insert the card into the container
  pokemonCardContainer.innerHTML = pokemonCard;

  //store current Pokemon
  currentPokemon = pokemon
}

// Helper function to format stat names
function formatStatName(statName) {
  switch (statName) {
    case 'hp': return 'HP';
    case 'attack': return 'Attack';
    case 'defense': return 'Defense';
    case 'special-attack': return 'Sp. Attack';
    case 'special-defense': return 'Sp. Defense';
    case 'speed': return 'Speed';
    default: return statName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Helper function to get color class based on Pokémon type
function getTypeColor(type) {
  const typeColors = {
    normal: 'slate-500',
    fire: 'orange-500',
    water: 'blue-500',
    electric: 'amber-400',
    grass: 'emerald-500',
    ice: 'cyan-400',
    fighting: 'rose-600',
    poison: 'violet-500',
    ground: 'amber-700',
    flying: 'sky-400',
    psychic: 'fuchsia-500',
    bug: 'lime-500',
    rock: 'stone-600',
    ghost: 'indigo-600',
    dragon: 'indigo-500',
    dark: 'slate-800',
    steel: 'slate-400',
    fairy: 'pink-400'
  };

  return typeColors[type] || 'slate-500';
}

// New helper function to get gradient colors for each type
function getTypeGradient(type) {
  const typeGradients = {
    normal: 'from-slate-500 to-slate-700',
    fire: 'from-orange-500 to-red-700',
    water: 'from-blue-400 to-blue-700',
    electric: 'from-amber-300 to-amber-600',
    grass: 'from-emerald-400 to-emerald-700',
    ice: 'from-cyan-300 to-cyan-600',
    fighting: 'from-rose-500 to-rose-800',
    poison: 'from-violet-400 to-violet-700',
    ground: 'from-amber-600 to-amber-900',
    flying: 'from-sky-300 to-sky-600',
    psychic: 'from-fuchsia-400 to-fuchsia-700',
    bug: 'from-lime-400 to-lime-700',
    rock: 'from-stone-500 to-stone-800',
    ghost: 'from-indigo-500 to-indigo-800',
    dragon: 'from-indigo-400 to-purple-800',
    dark: 'from-slate-700 to-slate-900',
    steel: 'from-slate-300 to-slate-600',
    fairy: 'from-pink-300 to-pink-600'
  };

  return typeGradients[type] || 'from-slate-500 to-slate-700';
}

// Function to display all favorites
function displayFavorites() {
  // Get favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];

  // Clear the favorites container
  favoriteCardsContainer.innerHTML = '';

  if (favorites.length === 0) {
    // Show empty state
    favoriteCardsContainer.innerHTML = `
      <div class="empty-state text-center p-8 col-span-2 text-slate-500 italic">
        Generate and save Pokémon to see them here
      </div>
    `;
    return;
  }

  // Create HTML for each favorite
  favorites.forEach(pokemon => {
    const primaryType = pokemon.types[0].type.name;
    const gradientColors = getTypeGradient(primaryType);

    const miniCard = `
      <article class="favorite-card relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" data-id="${pokemon.id}">
        <!-- Card Background -->
        <div class="absolute inset-0 bg-gradient-to-br ${gradientColors} opacity-90"></div>
        
        <!-- Card Content -->
        <div class="relative p-3 z-10 flex items-center gap-3">
          <figure class="rounded-full bg-white/10 p-2 backdrop-blur-sm">
            <img src="${pokemon.sprite}" alt="${pokemon.name}" class="w-16 h-16">
          </figure>
          <div>
            <h3 class="text-lg font-semibold capitalize text-white">${pokemon.name}</h3>
            <ul class="flex gap-1 mt-1">
              ${pokemon.types.map(typeInfo =>
      `<li class="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">${typeInfo.type.name}</li>`
    ).join('')}
            </ul>
          </div>
        </div>
      </article>
    `;

    favoriteCardsContainer.innerHTML += miniCard;
  });
}

// Function to show Pokemon overlay
function showPokemonOverlay(pokemon) {
  // Format the ID with leading zeros
  const formattedId = String(pokemon.id).padStart(3, '0');

  // Get primary type for theming
  const primaryType = pokemon.types[0].type.name;
  const typeColor = getTypeColor(primaryType);
  const gradientColors = getTypeGradient(primaryType);

  // Create the overlay HTML
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4';
  overlay.id = 'pokemon-overlay';

  // Create the overlay content using the same card structure
  overlay.innerHTML = `
    <article class="pokemon-card relative overflow-hidden rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
      <!-- Close button -->
      <button id="close-overlay" class="absolute top-3 right-3 z-20 bg-black/20 hover:bg-black/30 text-white rounded-full p-1 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Card Background with Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br ${gradientColors} opacity-90"></div>
      
      <!-- Card Content -->
      <div class="relative p-6 z-10">
        <!-- Card Header with Name and ID -->
        <header class="card-header flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold capitalize text-white">${pokemon.name}</h2>
          <span class="text-white/70 font-mono bg-black/20 px-2 py-1 rounded-md text-sm">#${formattedId}</span>
        </header>
        
        <!-- Pokemon Image -->
        <figure class="card-image bg-white/10 backdrop-blur-sm rounded-xl flex justify-center items-center p-4 mb-6 border border-white/20">
          <img src="${pokemon.sprite}" alt="${pokemon.name}" class="w-40 h-40 object-contain drop-shadow-lg">
        </figure>
        
        <!-- Type Badges -->
        <ul class="type-badges flex gap-2 mb-6">
          ${pokemon.types.map(typeInfo =>
    `<li class="type-badge px-4 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/10 shadow-md">${typeInfo.type.name}</li>`
  ).join('')}
        </ul>
        
        <!-- Stats -->
        <section class="stats-container bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
          <h3 class="text-lg font-semibold mb-3 text-white">Stats</h3>
          <dl class="stats space-y-2">
            ${pokemon.stats.map(stat => {
    const percentage = (stat.base_stat / 255) * 100;
    return `
              <div class="stat">
                <div class="flex justify-between items-center mb-1">
                  <dt class="stat-name text-white/70 text-sm">${formatStatName(stat.stat.name)}</dt>
                  <dd class="stat-value text-white font-medium">${stat.base_stat}</dd>
                </div>
                <div class="w-full bg-black/30 rounded-full h-2">
                  <div class="bg-white/80 h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
              </div>`;
  }).join('')}
          </dl>
        </section>
      </div>
    </article>
  `;

  // Add to the body
  document.body.appendChild(overlay);

  // Add event listener to close the overlay
  document.getElementById('close-overlay').addEventListener('click', () => {
    overlay.classList.add('animate-fadeOut');
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 300);
  });

  // Allow clicking outside the card to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('animate-fadeOut');
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    }
  });
}

// Function to clear all favorites
function clearAllFavorites() {
  // Clear localStorage
  localStorage.removeItem('pokemonFavorites');

  // Update display
  displayFavorites();
}

// Initialize the favorites display on page load
window.addEventListener('DOMContentLoaded', displayFavorites);

