import './RunOfShow.css';

export function RunOfShow() {
  return (
    <div className="ros">
      <div className="ros__header">
        <div className="ros__badge">CLAUDE CODE FOR BUILDERS</div>
        <h1 className="ros__title">Barcelona</h1>
        <h2 className="ros__subtitle">Run of Show</h2>
        <span className="ros__version">14 May 2026 · #3</span>
      </div>

      <div className="ros__content">
        <h3 className="ros__h3">Information</h3>
        <div className="ros__info">
          <p><strong>Date:</strong> 14 May 2026</p>
          <p><strong>Venue:</strong> World Trade Center Barcelona, 1a planta Edif. Este, Moll de Barcelona, s/n, Ciutat Vella, 08039 Barcelona</p>
          <p><strong>Room:</strong> Agua (turn left after Ametller)</p>
          <p><strong>Event Manager:</strong> Olivier Legris</p>
          <p><strong>Format:</strong> Talks + Networking</p>
          <p><strong>Hosted by:</strong> AISummitBarcelona.com, with the support of World Trade Center Barcelona, The Tech Nation &amp; Happy Operators</p>
        </div>

        <h3 className="ros__h3">Schedule</h3>
        <table className="ros__table">
          <thead>
            <tr><th>Time</th><th>Activity</th></tr>
          </thead>
          <tbody>
            <tr><td>17:30</td><td>Speaker check-in</td></tr>
            <tr><td>18:00</td><td>Doors open &amp; networking</td></tr>
            <tr><td>18:30</td><td>Opening Remarks</td></tr>
            <tr className="ros__row--highlight"><td>18:40</td><td>Al Ste-Marie, The Unsold Group</td></tr>
            <tr><td>19:00</td><td>Q&amp;A</td></tr>
            <tr className="ros__row--highlight"><td>19:10</td><td>Heather Thacker, Gatling</td></tr>
            <tr><td>19:30</td><td>Q&amp;A</td></tr>
            <tr className="ros__row--highlight"><td>19:40</td><td>Sergey Cherepanov, Guass</td></tr>
            <tr><td>20:00</td><td>Q&amp;A</td></tr>
            <tr className="ros__row--highlight"><td>20:10</td><td>Sara Noureldin, Anda</td></tr>
            <tr><td>20:30</td><td>Q&amp;A</td></tr>
            <tr className="ros__row--hard"><td>20:40</td><td>Cheese, Wine &amp; Networking</td></tr>
          </tbody>
        </table>

        <div className="ros__terminal">
          <div className="ros__terminal-bar">
            <div className="ros__dot ros__dot--red" />
            <div className="ros__dot ros__dot--yellow" />
            <div className="ros__dot ros__dot--green" />
          </div>
          <div className="ros__terminal-body">
            <span className="ros__hl">$</span> <span className="ros__white">Welcome to the third Claude Code event in Barcelona</span><br />
            <span className="ros__hl">&gt;</span> Bienvenidos al tercer evento de Claude Code en Barcelona<br />
            <span className="ros__hl">&gt;</span> Benvinguts al tercer esdeveniment de Claude Code a Barcelona
          </div>
        </div>

        <h3 className="ros__h3">Speakers</h3>
        <table className="ros__table">
          <thead>
            <tr><th>Talk</th><th>Speaker</th><th>Role</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Hatching Flipper 🐧 with Claude Managed Agents</td>
              <td>Al Ste-Marie</td>
              <td>Founder, The Unsold Group</td>
            </tr>
            <tr>
              <td>Developer Content Flywheel: Using Claude to Turn Code Into Career Capital</td>
              <td>Heather Thacker</td>
              <td>Developer Advocate, Gatling</td>
            </tr>
            <tr>
              <td>Razzmatazzing and Recombobulating: A harness for testing</td>
              <td>Sergey Cherepanov</td>
              <td>CTO, Guass</td>
            </tr>
            <tr>
              <td>Decoding how an African city moves with Claude Code</td>
              <td>Sara Noureldin</td>
              <td>CTO, Anda</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="ros__footer">
        <span className="ros__hl">*</span> Claude Code for Builders Barcelona <span className="ros__hl">|</span> AISummitBarcelona.com
      </div>
    </div>
  );
}
