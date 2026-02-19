import '../App.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
export default function Location({ latitude, longitude, emailAssociation, numAssociation, adresseAtelier, adressePostale }) {
    return (
        <div className="location-page">

            <div className="content location">
                <section className="location-hero">
                    <h1 className='section-title'>Nous trouver</h1>
                    <p>Nous somme situés au sein de la <a href="https://societedupartage.fr/la-partagerie/">Partagerie</a> un espace de partage dédié à la consommation responsable </p>
                </section>

                <section className="location-info">
                    <h2 className='section-subtitle'>Adresse atelier</h2>
                    <p>
                        <strong>{adresseAtelier[0]}</strong><br />
                        {adresseAtelier[1]}<br />
                        {adresseAtelier[2]}
                    </p>

                    <h2 className='section-subtitle'>Adresse postale</h2>
                    <p>
                        <strong>{adressePostale[0]}</strong><br />
                        {adressePostale[1]}<br />
                        {adressePostale[2]}
                    </p>
                    <h2 className='section-subtitle'>Horaires</h2>
                    <p>
                        Nous n'avons pas d'horaires fixe pour l'instant, contactez-nous par par <a href={`mailto:${emailAssociation}`}>email</a>, telephone (<a href={`tel:${numAssociation}`}>{numAssociation}</a>) ou <a href="https://www.instagram.com/lacave504/">instagram</a>.
                    </p>
                </section>

                <section className="location-map">
                    <h2 className='section-subtitle' >Plan d’accès atelier</h2>
                    {<MapContainer
                        center={[latitude, longitude]}
                        zoom={15}
                        className='map'
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                            icon={new L.Icon({
                                iconUrl: require('../assets/icons/Location2.png'),
                                iconAnchor: null, popupAnchor: null,
                                shadowUrl: null,
                                shadowSize: null,
                                shadowAnchor: null,
                                iconSize: new L.Point(50, 50),
                            })}
                            position={[latitude, longitude]}>
                        </Marker>
                    </MapContainer>}
                </section>
            </div>
        </div>
    );
}
