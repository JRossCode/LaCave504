/**
 * Endpoint agenda : télécharge le flux iCal public (Infomaniak), le parse côté
 * serveur et renvoie les événements à venir en JSON.
 *
 * Pourquoi côté serveur :
 *  - Infomaniak ne renvoie pas d'en-tête CORS : un fetch direct depuis le
 *    navigateur échouerait.
 *  - L'URL du flux (non devinable) reste dans les variables d'environnement et
 *    n'est jamais exposée au client.
 *
 * Fonctionne tel quel comme fonction serverless Vercel (dossier `api/`) et comme
 * middleware du serveur de dev Vite (voir vite.config.js) : on n'utilise que les
 * APIs Node natives de `req`/`res`, pas les helpers spécifiques à Vercel.
 */
import ICAL from 'ical.js';

/** Flux .ics à lire. Variable NON préfixée VITE_ : elle reste côté serveur. */
const FEED_URL =
    process.env.ICAL_FEED_URL ||
    'https://sync.infomaniak.com/calendars/JR10673/72ddd549-d9aa-46af-9a06-d070680a6ef0?export';

/** En dev, on veut voir immédiatement un événement qui vient d'être ajouté au
 *  calendrier : le cache n'a de sens qu'en production. */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
/** Durée de vie du cache (1 h en prod), alignée sur le s-maxage envoyé au CDN. */
const CACHE_TTL_MS = IS_PRODUCTION ? 60 * 60 * 1000 : 0;
/** En-tête de cache des réponses fraîches : le CDN sert la réponse pendant 1 h
 *  puis la rafraîchit en tâche de fond au premier visiteur suivant. */
const CACHE_HEADER = IS_PRODUCTION ? 's-maxage=3600, stale-while-revalidate=86400' : 'no-store';
/** On ne développe les récurrences que sur les 12 prochains mois. */
const HORIZON_MONTHS = 12;
/** Garde-fous : un RRULE sans UNTIL/COUNT est infini par nature. */
const MAX_EVENTS = 200;
/** Plafond par série, pour qu'une récurrence quotidienne ne masque pas le reste. */
const MAX_PER_SERIES = 30;
const MAX_ITERATIONS = 5000;
/** Au-delà, on considère Infomaniak injoignable et on sert le cache périmé. */
const FETCH_TIMEOUT_MS = 8000;

/**
 * Cache mémoire, au niveau du module : partagé par toutes les requêtes servies
 * par une même instance « chaude ». Le vrai cache est celui du CDN (voir les
 * en-têtes plus bas) ; celui-ci évite juste de retélécharger le .ics quand
 * plusieurs requêtes tombent sur la même instance.
 * `lastGood` sert de filet de sécurité si le flux devient inaccessible.
 */
let cache = null;
let lastGood = null;

/** Une ICAL.Time « date seule » (événement journée entière) -> "2026-09-10". */
function toDateKey(icalTime) {
    const p = (n) => String(n).padStart(2, '0');
    return `${icalTime.year}-${p(icalTime.month)}-${p(icalTime.day)}`;
}

/**
 * Normalise une occurrence en objet JSON simple.
 * Les événements « journée entière » sont renvoyés en date nue (YYYY-MM-DD)
 * plutôt qu'en ISO : sinon le fuseau du navigateur peut les décaler d'un jour.
 */
function toEvent(event, startDate, endDate) {
    const allDay = startDate.isDate;
    return {
        uid: event.uid || null,
        title: (event.summary || '').trim() || 'Atelier',
        start: allDay ? toDateKey(startDate) : startDate.toJSDate().toISOString(),
        end: endDate ? (allDay ? toDateKey(endDate) : endDate.toJSDate().toISOString()) : null,
        allDay,
        location: (event.location || '').trim() || null,
        description: (event.description || '').trim() || null,
    };
}

/**
 * Parse le .ics et renvoie les occurrences à venir, triées chronologiquement.
 * Gère les événements récurrents (RRULE), leurs exclusions (EXDATE) et leurs
 * exceptions (RECURRENCE-ID).
 */
export function parseIcs(icsText, now = new Date()) {
    const root = new ICAL.Component(ICAL.parse(icsText));

    // Les VTIMEZONE embarqués doivent être enregistrés pour que les heures
    // locales (ex. Europe/Paris) soient converties correctement.
    for (const vtimezone of root.getAllSubcomponents('vtimezone')) {
        const tz = new ICAL.Timezone(vtimezone);
        if (!ICAL.TimezoneService.has(tz.tzid)) {
            ICAL.TimezoneService.register(tz.tzid, tz);
        }
    }

    const horizon = new Date(now);
    horizon.setMonth(horizon.getMonth() + HORIZON_MONTHS);

    // Un événement « journée entière » reste à l'affiche toute sa journée : on
    // compare donc au début du jour courant, pas à l'heure courante.
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Les exceptions (même UID + RECURRENCE-ID) doivent être rattachées à leur
    // événement maître avant de développer la récurrence.
    const masters = [];
    const exceptions = [];
    for (const component of root.getAllSubcomponents('vevent')) {
        let event;
        try {
            event = new ICAL.Event(component);
        } catch {
            continue; // VEVENT malformé : on l'ignore plutôt que de tout perdre
        }
        if (event.isRecurrenceException()) exceptions.push(event);
        else masters.push(event);
    }
    for (const exception of exceptions) {
        const master = masters.find((m) => m.uid === exception.uid && m.isRecurring());
        if (master) {
            try {
                master.relateException(exception);
                continue;
            } catch {
                /* rattachement impossible : on l'affiche comme événement isolé */
            }
        }
        masters.push(exception);
    }

    const occurrences = [];
    for (const event of masters) {
        try {
            if (event.isRecurring()) {
                const iterator = event.iterator();
                let iterations = 0;
                let kept = 0;
                let next;
                while ((next = iterator.next()) && iterations++ < MAX_ITERATIONS) {
                    if (next.toJSDate() > horizon) break;
                    const details = event.getOccurrenceDetails(next);
                    const ends = (details.endDate || details.startDate).toJSDate();
                    const floor = details.startDate.isDate ? startOfToday : now;
                    if (ends < floor) continue;
                    occurrences.push(toEvent(details.item || event, details.startDate, details.endDate));
                    if (++kept >= MAX_PER_SERIES) break;
                }
            } else {
                if (!event.startDate) continue;
                const ends = (event.endDate || event.startDate).toJSDate();
                const floor = event.startDate.isDate ? startOfToday : now;
                if (ends < floor) continue;
                occurrences.push(toEvent(event, event.startDate, event.endDate));
            }
        } catch {
            continue; // un événement cassé ne doit pas faire tomber tout l'agenda
        }
    }

    occurrences.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    return occurrences.slice(0, MAX_EVENTS);
}

/** Télécharge le .ics, avec timeout pour ne pas bloquer la requête. */
async function fetchIcs(url) {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { Accept: 'text/calendar, text/plain;q=0.9, */*;q=0.8' },
        redirect: 'follow',
    });
    if (!response.ok) {
        throw new Error(`Flux iCal indisponible (HTTP ${response.status})`);
    }
    const text = await response.text();
    if (!text.includes('BEGIN:VCALENDAR')) {
        throw new Error('Réponse inattendue : ce n’est pas un flux iCal');
    }
    return text;
}

function send(res, status, body, cacheControl) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', cacheControl);
    res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        return send(res, 405, { error: 'Méthode non autorisée' }, 'no-store');
    }

    // `/api/agenda?refresh=1` : on ignore le cache mémoire et on répond sans
    // cache CDN, pour vérifier immédiatement qu'un événement tout juste ajouté
    // au calendrier remonte bien. Le CDN inclut la query string dans sa clé de
    // cache : cette URL n'est donc jamais servie depuis le cache d'1 h.
    const forceRefresh = new URL(req.url, 'http://localhost').searchParams.has('refresh');

    // Cache mémoire encore valide : réponse immédiate, aucun appel réseau.
    if (!forceRefresh && cache && cache.expiresAt > Date.now()) {
        return send(res, 200, cache.payload, CACHE_HEADER);
    }

    try {
        const events = parseIcs(await fetchIcs(FEED_URL));
        const payload = { events, count: events.length, updatedAt: new Date().toISOString(), stale: false };
        // Le rafraîchissement forcé met aussi à jour le cache de l'instance.
        cache = { payload, expiresAt: Date.now() + CACHE_TTL_MS };
        lastGood = payload;
        return send(res, 200, payload, forceRefresh ? 'no-store' : CACHE_HEADER);
    } catch (error) {
        // Flux injoignable : on préfère servir des données un peu vieilles
        // plutôt qu'une page en erreur, avec un cache court pour réessayer vite.
        console.error('[api/agenda] échec de récupération du flux :', error);
        if (lastGood) {
            return send(res, 200, { ...lastGood, stale: true }, IS_PRODUCTION ? 's-maxage=60' : 'no-store');
        }
        // Message générique : le détail (URL, erreur réseau) reste dans les logs.
        return send(
            res,
            503,
            { events: [], count: 0, updatedAt: null, stale: false, error: 'Agenda momentanément indisponible' },
            'no-store'
        );
    }
}
