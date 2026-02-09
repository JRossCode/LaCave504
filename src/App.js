import './App.css';
import { photoList } from "./assets/photos";
import PhotosSection from './components/PhotosSection';
import './assets/fonts.css';

function App() {
  return (
    <div className="content">

      <div className="home">
        <div className="header-section">
          <div className="header-background">
            {[...Array(41)].map((_, i) => (
              <div key={i} className={i % 2 === 0 ? 'stripe-purple' : 'stripe-light'}></div>
            ))}
          </div>

          <div className="header-content">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/19879ba2dcf516ebb6031342c5a517098e693099?width=226"
              alt="La Cave 504 Logo"
              className="logo"
            />
            <nav className="navigation">
              <div className="nav-item">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/ae90b6777ad39e65d2e78965870a5a510c0c907b?width=92"
                  alt="Instagram"
                  className="nav-icon"
                />
              </div>
              <div className="nav-item">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/b6bf1bb7db03c1bb434ff9a3b54e02c79bb76cda?width=94"
                  alt="Email"
                  className="nav-icon"
                />
              </div>
              <div className="nav-item">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/e68c6c1d7d2c02de1a3b6ea7e5fc52b2da73e93b?width=92"
                  alt="Menu"
                  className="nav-icon"
                />
              </div>
            </nav>
            <div className="hero-title-wrapper">
              <h1 className="hero-title">La cave 504</h1>
              <p className="hero-subtitle">Atelier cycles engagé et inclusif</p>
            </div>
          </div>
        </div>

        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-description-wrapper">
              <p className="hero-description">
                La Cave 504 est un projet associatif dédié au réemploi cycle, où des vélos et des pièces destinés au rebut sont curâtes, restaurés et remis en circulation. Ancrée dans le nord de Paris, l'association mêle mécanique, transmission et auto-réparation pour construire une mobilité plus durable, accessible et collective.
              </p>
            </div>
            <div className="hero-keywords">
              <span className="keyword">Réemploi</span>
              <span className="keyword">Transmission</span>
              <span className="keyword">Solidarité</span>
            </div>
          </div>
        </div>
      </div>

      <div className="body-content">
        <div className="body-section">
          <div className="section-header">
            <h2 className="section-title">Le projet</h2>
          </div>
          <div className="content-container">
            <p className="project-description">
              <span className="text-regular">Nous collectons des vélos destinés au rebut afin de les démonter, diagnostiquer et reconditionner à partir de pièces issues du </span>
              <span className="text-bold">réemploi</span>
              <span className="text-regular">. Ce travail minutieux de tri et de remise en état permet de structurer des processus durables et exigeants, pour proposer ensuite des </span>
              <span className="text-bold">vélos fiables à des tarifs accessibles</span>
              <span className="text-regular">. Parallèlement, nous menons des actions de formation ouvertes à tous les publics et animons des ateliers d'</span>
              <span className="text-bold">auto-réparation</span>
              <span className="text-regular"> participatifs afin de transmettre les savoir-faire de la mécanique vélo, favoriser l'autonomie et rendre chacun capable d'entretenir son propre matériel.</span>
              <br /><br />
              <span className="text-regular">La Cave 504 propose également des prestations de réparation, y compris « hors les murs », en intervenant dans des lieux variés (mairies, écoles, hôpitaux, associations, etc.). Ces actions de proximité permettent d'offrir un service adapté aux contextes, tarifé, à prix libre ou selon une grille solidaire, pour que des publics éloignés des ateliers puissent bénéficier de vélos réparés, révisés et prêts à rouler.</span>
            </p>
          </div>
        </div>
      </div>

      <PhotosSection photos={photoList} />


      <div className="contact-section">
        <div className="contact-stripes">
          {[...Array(41)].map((_, i) => (
            <div key={i} className={i % 2 === 0 ? 'stripe-purple' : 'stripe-light'}></div>
          ))}
        </div>
        <div className="contact-container">
          <h2 className="contact-title">Nous contacter</h2>
        </div>
      </div>

      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/59e0fe14766efeb8895dfc11c8bdb8f3d1d36c4c?width=1386"
        alt="Decorative illustration"
        className="decorative-image"
      />
    </div>
  );
}

export default App;
