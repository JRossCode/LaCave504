import '../App.css';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/** Les ateliers ont lieu à Paris : on affiche toujours l'heure locale parisienne,
 *  quel que soit le fuseau du visiteur. */
const PARIS_TZ = 'Europe/Paris';

/**
 * Les dates arrivent de /api/agenda soit en ISO 8601 (événement horaire), soit
 * en date nue "YYYY-MM-DD" (journée entière). Une journée entière n'a pas
 * d'heure : on la place à minuit UTC et on la formate en UTC, sinon le fuseau
 * du navigateur peut la décaler d'un jour.
 */
function toDate(value, allDay) {
    if (!value) return null;
    if (allDay) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
    return new Date(value);
}

/** Les Intl.DateTimeFormat sont coûteux à construire : on les mémorise. */
const formatterCache = new Map();
function formatter(options, allDay) {
    const timeZone = allDay ? 'UTC' : PARIS_TZ;
    const key = timeZone + JSON.stringify(options);
    let instance = formatterCache.get(key);
    if (!instance) {
        instance = new Intl.DateTimeFormat('fr-FR', { ...options, timeZone });
        formatterCache.set(key, instance);
    }
    return instance;
}

const DAY_OPTIONS = { weekday: 'long', day: 'numeric', month: 'long' };
const DAY_YEAR_OPTIONS = { ...DAY_OPTIONS, year: 'numeric' };
const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit' };

/** "mercredi 16 septembre" — l'année n'apparaît que si l'événement change d'année. */
function formatDay(date, allDay) {
    const isThisYear = formatter({ year: 'numeric' }, allDay).format(date)
        === formatter({ year: 'numeric' }, allDay).format(new Date());
    return formatter(isThisYear ? DAY_OPTIONS : DAY_YEAR_OPTIONS, allDay).format(date);
}

/** "18:00 – 20:00", "18:00" si pas de fin, "Toute la journée" si journée entière. */
function formatTimeRange(event, start, end) {
    if (event.allDay) return 'Toute la journée';
    const time = formatter(TIME_OPTIONS, false);
    if (!end || end.getTime() === start.getTime()) return time.format(start);
    const day = formatter(DAY_OPTIONS, false);
    if (day.format(start) === day.format(end)) return `${time.format(start)} – ${time.format(end)}`;
    return `${time.format(start)} → ${formatDay(end, false)} ${time.format(end)}`;
}

function EventCard({ event }) {
    const start = toDate(event.start, event.allDay);
    const end = toDate(event.end, event.allDay);
    if (!start) return null;

    return (
        <li className="agenda-event">
            <div className="agenda-date" aria-hidden="true">
                <span className="agenda-date-day">{formatter({ day: 'numeric' }, event.allDay).format(start)}</span>
                <span className="agenda-date-month">{formatter({ month: 'short' }, event.allDay).format(start).replace('.', '')}</span>
            </div>

            <div className="agenda-event-body">
                <h2 className="agenda-event-title">{event.title}</h2>

                <p className="agenda-event-when">
                    <time dateTime={event.start}>{formatDay(start, event.allDay)}</time>
                    {' · '}
                    {formatTimeRange(event, start, end)}
                </p>

                {event.location && <p className="agenda-event-location">{event.location}</p>}
                {event.description && <p className="agenda-event-description">{event.description}</p>}
            </div>
        </li>
    );
}

export default function Agenda({ emailAssociation }) {
    // 'loading' | 'ready' | 'error' — un seul état pour éviter les rendus incohérents.
    const [status, setStatus] = useState('loading');
    const [events, setEvents] = useState([]);
    const [stale, setStale] = useState(false);
    // `/agenda?refresh` : contourne le cache (CDN + serveur) pour voir tout de
    // suite un événement qui vient d'être ajouté au calendrier.
    const forceRefresh = new URLSearchParams(useLocation().search).has('refresh');

    useEffect(() => {
        // Évite de mettre à jour l'état si le composant est démonté entre-temps.
        const controller = new AbortController();

        fetch(forceRefresh ? '/api/agenda?refresh=1' : '/api/agenda', {
            signal: controller.signal,
            cache: forceRefresh ? 'no-store' : 'default',
        })
            .then(async (response) => {
                const data = await response.json().catch(() => null);
                if (!response.ok || !data) throw new Error('Agenda indisponible');
                return data;
            })
            .then((data) => {
                setEvents(Array.isArray(data.events) ? data.events : []);
                setStale(Boolean(data.stale));
                setStatus('ready');
            })
            .catch((error) => {
                if (error.name !== 'AbortError') setStatus('error');
            });

        return () => controller.abort();
    }, [forceRefresh]);

    return (
        <div className="location-page agenda-page">
            {/* Métadonnées propres à la page (hoistées dans <head> par React 19) */}
            <title>Agenda | La Cave 504 — Ateliers vélo hors les murs à Paris</title>
            <meta name="description"
                content="Les prochains ateliers et animations de La Cave 504 : ateliers vélo hors les murs, auto-réparation et événements à Paris et en proche banlieue." />
            <link rel="canonical" href="https://lacave504.fr/agenda" />

            <div className="content location agenda-content">
                <section className="agenda-hero">
                    <Link to="/" className="agenda-back">← Retour à l’accueil</Link>
                    <h1 className="section-title">Nos prochains ateliers / animations</h1>
                    <p>
                        Retrouvez-nous lors de nos ateliers d’auto-réparation et de nos interventions
                        « hors les murs ». Une question sur un événement ?{' '}
                        <a href={`mailto:${emailAssociation}`}>Écrivez-nous</a>.
                    </p>
                </section>

                <section className="agenda-list-section" aria-busy={status === 'loading'}>
                    {status === 'loading' && (
                        <p className="agenda-message">Chargement de l’agenda…</p>
                    )}

                    {status === 'error' && (
                        <p className="agenda-message agenda-message-error">
                            L’agenda est momentanément indisponible. Réessayez dans quelques minutes,
                            ou contactez-nous par <a href={`mailto:${emailAssociation}`}>email</a> ou sur{' '}
                            <a href="https://www.instagram.com/lacave504/">Instagram</a>.
                        </p>
                    )}

                    {status === 'ready' && events.length === 0 && (
                        <p className="agenda-message">
                            Aucun atelier n’est programmé pour le moment. Suivez-nous sur{' '}
                            <a href="https://www.instagram.com/lacave504/">Instagram</a> pour être
                            prévenu·e des prochaines dates.
                        </p>
                    )}

                    {status === 'ready' && events.length > 0 && (
                        <>
                            {stale && (
                                <p className="agenda-notice">
                                    Agenda affiché depuis notre cache : la dernière synchronisation n’a pas abouti.
                                </p>
                            )}
                            <ul className="agenda-list">
                                {events.map((event, index) => (
                                    <EventCard key={`${event.uid || 'event'}-${event.start}-${index}`} event={event} />
                                ))}
                            </ul>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
