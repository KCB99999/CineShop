// ============================================================
//  ⚙️ CONFIGURATION — TES VRAIES INFOS
// ============================================================
const CONFIG = {
    TMDB_API_KEY: "af41cc740d71d76eff8fb4fd53edd44a",
    MON_NUMERO:   "+226 45 57 42 17",
    WHATSAPP_NUM: "22645574217",
    MON_NOM:      "CinéShop",
    PAYS_DEVISE:  "FCFA",
};

// ============================================================
//  💰 TARIFS (4 CATÉGORIES)
// ============================================================
const TARIFS = {
    film_classique:  100,
    film_recent:     250,
    serie_classique: 400,
    serie_populaire: 800,
};

// ============================================================
//  🎬 CATALOGUE
// ============================================================
const CATALOGUE = [
    // FILMS CLASSIQUES
    {type: "Film", categorie: "classique", titre: "Le Parrain",           annee: 1972, genre: "Classique", prix: TARIFS.film_classique},
    {type: "Film", categorie: "classique", titre: "Scarface",             annee: 1983, genre: "Classique", prix: TARIFS.film_classique},
    {type: "Film", categorie: "classique", titre: "Le Transporteur",      annee: 2002, genre: "Action",    prix: TARIFS.film_classique},
    {type: "Film", categorie: "classique", titre: "Fast & Furious 1",     annee: 2001, genre: "Action",    prix: TARIFS.film_classique},
    {type: "Film", categorie: "classique", titre: "Titanic",              annee: 1997, genre: "Romance",   prix: TARIFS.film_classique},
    // FILMS RÉCENTS
    {type: "Film", categorie: "recent",    titre: "Inception",            annee: 2010, genre: "Sci-Fi",    prix: TARIFS.film_recent},
    {type: "Film", categorie: "recent",    titre: "The Dark Knight",      annee: 2008, genre: "Action",    prix: TARIFS.film_recent},
    {type: "Film", categorie: "recent",    titre: "Dune",                 annee: 2021, genre: "Sci-Fi",    prix: TARIFS.film_recent},
    {type: "Film", categorie: "recent",    titre: "Oppenheimer",          annee: 2023, genre: "Drame",     prix: TARIFS.film_recent},
    {type: "Film", categorie: "recent",    titre: "Deadpool & Wolverine", annee: 2024, genre: "Action",    prix: TARIFS.film_recent},
    // SÉRIES CLASSIQUES
    {type: "Série", categorie: "classique", titre: "Friends",             annee: 1994, genre: "Comédie",   prix: TARIFS.serie_classique},
    {type: "Série", categorie: "classique", titre: "Prison Break",        annee: 2005, genre: "Action",    prix: TARIFS.serie_classique},
    {type: "Série", categorie: "classique", titre: "Lost",                annee: 2004, genre: "Mystère",   prix: TARIFS.serie_classique},
    {type: "Série", categorie: "classique", titre: "The Sopranos",        annee: 1999, genre: "Drame",     prix: TARIFS.serie_classique},
    // SÉRIES POPULAIRES
    {type: "Série", categorie: "populaire", titre: "Breaking Bad",        annee: 2008, genre: "Drame",     prix: TARIFS.serie_populaire},
    {type: "Série", categorie: "populaire", titre: "Game of Thrones",     annee: 2011, genre: "Fantasy",   prix: TARIFS.serie_populaire},
    {type: "Série", categorie: "populaire", titre: "Stranger Things",     annee: 2016, genre: "Sci-Fi",    prix: TARIFS.serie_populaire},
    {type: "Série", categorie: "populaire", titre: "Shogun",              annee: 2024, genre: "Drame",     prix: TARIFS.serie_populaire},
    {type: "Série", categorie: "populaire", titre: "Money Heist",         annee: 2017, genre: "Action",    prix: TARIFS.serie_populaire},
];

// ============================================================
//  🧠 MODULE IA : TENDANCES VIA TMDb
// ============================================================
async function getTendances(mediaType = "all", limit = 10) {
    const url = `https://api.themoviedb.org/3/trending/${mediaType}/day?api_key=${CONFIG.TMDB_API_KEY}&language=fr-FR`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401) throw new Error("🔑 Clé API TMDb invalide.");
            throw new Error(`❌ Erreur API (${response.status}).`);
        }
        const data = await response.json();
        
        return (data.results || []).slice(0, limit).map(item => {
            const isFilm = "title" in item;
            const date = item.release_date || item.first_air_date || "";
            return {
                titre: item.title || item.name || "Inconnu",
                annee: date ? date.slice(0, 4) : "—",
                note: Math.round((item.vote_average || 0) * 10) / 10,
                type: isFilm ? "Film" : "Série",
            };
        });
    } catch (err) {
        return [{erreur: err.message.includes("Failed to fetch")
            ? "📡 Pas de connexion internet."
            : err.message}];
    }
}

// ============================================================
//  🧠 MOTEUR DE RÉPONSES
// ============================================================
async function repondre(question) {
    const q = question.toLowerCase().trim();
    const qNorm = q.replace(/[^\w\sàâäéèêëïîôöùûüç]/gi, " ");

    // --- Salutations ---
    if (/(bonjour|salut|bonsoir|coucou|hello)/.test(qNorm)) {
        return `👋 Bonjour et bienvenue chez ${CONFIG.MON_NOM} !

Je peux te renseigner sur :
  • 💰 Le prix des films et séries (classiques et récents)
  • 🔥 Les tendances du jour (films/séries les plus regardés)
  • 🎬 Un film précis (ex : « prix de Inception »)

Pose ta question 👇`;
    }

    // --- TENDANCES ---
    if (/(tendance|tendances|récent|récents|recent|recents|populaire|populaires|plus regardé|plus regardés|top|nouveau|nouveaux|trending|actuel|actuels|sortie|sorties)/.test(qNorm)) {
        let media = "all";
        let titreBloc = "🔥 TOP 10 DES TENDANCES DU JOUR 🔥";
        
        const veutFilm = qNorm.includes("film");
        const veutSerie = qNorm.includes("série") || qNorm.includes("serie") || qNorm.includes("series");
        
        if (veutFilm && !veutSerie) {
            media = "movie";
            titreBloc = "🔥 TOP 10 FILMS LES PLUS REGARDÉS (TENDANCES DU JOUR) 🔥";
        } else if (veutSerie && !veutFilm) {
            media = "tv";
            titreBloc = "🔥 TOP 10 SÉRIES LES PLUS REGARDÉES (TENDANCES DU JOUR) 🔥";
        }

        const items = await getTendances(media, 10);
        
        if (items[0] && items[0].erreur) return items[0].erreur;

        let lignes = [titreBloc, "━━━━━━━━━━━━━━━━━━━━━━", ""];
        items.forEach((it, i) => {
            const icone = it.type === "Film" ? "🎬" : "📺";
            const prix = it.type === "Film" ? TARIFS.film_recent : TARIFS.serie_populaire;
            lignes.push(`${i + 1}. ${icone} ${it.titre} (${it.annee})`);
            lignes.push(`    ${it.type} · ⭐ ${it.note}/10 · 💰 ${prix} ${CONFIG.PAYS_DEVISE}`);
            lignes.push("");
        });
        lignes.push("━━━━━━━━━━━━━━━━━━━━━━");
        lignes.push("✅ Si un titre t'intéresse, voici mon numéro :");
        lignes.push("");
        lignes.push(`📞 ${CONFIG.MON_NUMERO}`);
        lignes.push("");
        lignes.push("👉 Clique sur WhatsApp en bas pour me contacter.");
        return lignes.join("\n");
    }

    // --- PRIX DES FILMS ---
    if (/(film|films)/.test(qNorm) && /(prix|combien|coûte|coute|tarif|cout)/.test(qNorm)) {
        return `🎬 PRIX DES FILMS 🎬
━━━━━━━━━━━━━━━━━━━━━━

🎞️ Film classique
💰 Prix : ${TARIFS.film_classique} ${CONFIG.PAYS_DEVISE}
Ex : Le Parrain, Scarface, Titanic...

🔥 Film récent / populaire
💰 Prix : ${TARIFS.film_recent} ${CONFIG.PAYS_DEVISE}
Ex : Dune, Oppenheimer, Deadpool & Wolverine...

━━━━━━━━━━━━━━━━━━━━━━
✅ Si tu es intéressé, voici mon numéro :

📞 ${CONFIG.MON_NUMERO}

👉 Clique sur WhatsApp en bas pour me contacter.`;
    }

    // --- PRIX DES SÉRIES ---
    if (/(série|series|serie)/.test(qNorm) && /(prix|combien|coûte|coute|tarif|cout)/.test(qNorm)) {
        return `📺 PRIX DES SÉRIES 📺
━━━━━━━━━━━━━━━━━━━━━━

🎞️ Série classique
💰 Prix : ${TARIFS.serie_classique} ${CONFIG.PAYS_DEVISE}
Ex : Friends, Prison Break, Lost...

🔥 Série populaire
💰 Prix : ${TARIFS.serie_populaire} ${CONFIG.PAYS_DEVISE}
Ex : Breaking Bad, Game of Thrones, Shogun...

━━━━━━━━━━━━━━━━━━━━━━
✅ Si tu es intéressé, voici mon numéro :

📞 ${CONFIG.MON_NUMERO}

👉 Clique sur WhatsApp en bas pour me contacter.`;
    }

    // --- TARIFS GÉNÉRAUX ---
    if (/(tarif|tarifs)/.test(qNorm)) {
        return `💰 NOS TARIFS 💰
━━━━━━━━━━━━━━━━━━━━━━

🎬 FILMS
  🎞️ Classique ......... ${TARIFS.film_classique} ${CONFIG.PAYS_DEVISE}
  🔥 Récent / populaire . ${TARIFS.film_recent} ${CONFIG.PAYS_DEVISE}

📺 SÉRIES
  🎞️ Classique ......... ${TARIFS.serie_classique} ${CONFIG.PAYS_DEVISE}
  🔥 Populaire ......... ${TARIFS.serie_populaire} ${CONFIG.PAYS_DEVISE}

━━━━━━━━━━━━━━━━━━━━━━
✅ Si tu es intéressé, voici mon numéro :

📞 ${CONFIG.MON_NUMERO}`;
    }

    // --- RECHERCHE D'UN TITRE ---
    for (const item of CATALOGUE) {
        if (qNorm.includes(item.titre.toLowerCase())) {
            const catLabel = {
                classique: "🎞️ Classique",
                recent: "🔥 Récent / Populaire",
                populaire: "🔥 Populaire",
            }[item.categorie] || "";
            return `🎯 ${item.titre}
━━━━━━━━━━━━━━━━━━━━━━

📅 Année : ${item.annee}
🎭 Genre : ${item.genre}
📁 Type  : ${item.type} ${catLabel ? "· " + catLabel : ""}

💰 PRIX : ${item.prix} ${CONFIG.PAYS_DEVISE}

━━━━━━━━━━━━━━━━━━━━━━
✅ Si tu es intéressé, voici mon numéro :

📞 ${CONFIG.MON_NUMERO}

👉 Clique sur WhatsApp en bas pour me contacter.`;
        }
    }

    // --- AIDE ---
    if (/(aide|help|comment)/.test(qNorm)) {
        return `🤖 Je peux t'aider avec :

  • « prix des films »
  • « prix des séries »
  • « tendances » ou « top 10 »
  • « films récents » ou « séries populaires »
  • « prix de Inception »
  • « tarifs »

Essaie l'une de ces questions 👇`;
    }

    // --- PAR DÉFAUT ---
    return `🤔 Je n'ai pas bien compris ta question.

Essaie par exemple :
  • « prix des films »
  • « tendances du jour »
  • « tarifs »

Ou contacte-moi directement : 📞 ${CONFIG.MON_NUMERO}`;
}

// ============================================================
//  💬 GESTION DU CHAT
// ============================================================
const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.querySelector(".send-btn");
let isLoading = false;

function addBubble(texte, auteur) {
    const row = document.createElement("div");
    row.className = `bubble-row ${auteur}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = auteur === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = texte;

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatEl.appendChild(row);
    chatEl.scrollTop = chatEl.scrollHeight;
    return row;
}

async function envoyer(texteForce = null) {
    if (isLoading) return;

    const texte = texteForce || inputEl.value.trim();
    if (!texte) return;

    inputEl.value = "";
    addBubble(texte, "user");

    const q = texte.toLowerCase();
    const besoinApi = /(tendance|tendances|récent|récents|recent|recents|populaire|populaires|plus regardé|plus regardés|top|nouveau|nouveaux|trending|actuel|actuels|sortie|sorties)/.test(q);

    if (besoinApi) {
        isLoading = true;
        sendBtn.disabled = true;
        const loadingMsg = addBubble("⏳ Recherche des tendances en cours...", "bot");
        
        const reponse = await repondre(texte);
        
        loadingMsg.remove();
        addBubble(reponse, "bot");
        
        isLoading = false;
        sendBtn.disabled = false;
    } else {
        // Petit délai pour un effet naturel
        setTimeout(async () => {
            const reponse = await repondre(texte);
            addBubble(reponse, "bot");
        }, 300);
    }
}

// Entrée clavier
inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") envoyer();
});

// Message d'accueil
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        addBubble(`👋 Bonjour et bienvenue chez ${CONFIG.MON_NOM} !

Je peux te renseigner sur :
  • 🎬 Films classiques : ${TARIFS.film_classique} ${CONFIG.PAYS_DEVISE}
  • 🎬 Films récents : ${TARIFS.film_recent} ${CONFIG.PAYS_DEVISE}
  • 📺 Séries classiques : ${TARIFS.serie_classique} ${CONFIG.PAYS_DEVISE}
  • 📺 Séries populaires : ${TARIFS.serie_populaire} ${CONFIG.PAYS_DEVISE}
  • 🔥 Tendances du jour (en direct)

Pose ta question 👇`, "bot");
    }, 400);
});