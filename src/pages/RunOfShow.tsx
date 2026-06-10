import { useEvent } from '../data/events/useEvent';
import './RunOfShow.css';

export function RunOfShow() {
  const { config } = useEvent();
  const ros = config.runOfShow;
  const speakers = config.speakers ?? [];

  return (
    <div className="ros">
      <div className="ros__header">
        <div className="ros__badge">{config.title.toUpperCase()}</div>
        <h1 className="ros__title">{config.edition}</h1>
        <h2 className="ros__subtitle">Run of Show</h2>
        <span className="ros__version">{config.date}</span>
      </div>

      <div className="ros__content">
        <h3 className="ros__h3">Information</h3>
        <div className="ros__info">
          <p><strong>Date:</strong> {config.date}</p>
          {ros?.venue && <p><strong>Venue:</strong> {ros.venue}</p>}
          {ros?.room && <p><strong>Room:</strong> {ros.room}</p>}
          {ros?.eventManager && <p><strong>Event Manager:</strong> {ros.eventManager}</p>}
          {ros?.format && <p><strong>Format:</strong> {ros.format}</p>}
          <p><strong>{config.hostedBy}</strong></p>
        </div>

        {ros?.schedule && ros.schedule.length > 0 && (
          <>
            <h3 className="ros__h3">Schedule</h3>
            <table className="ros__table">
              <thead>
                <tr><th>Time</th><th>Activity</th></tr>
              </thead>
              <tbody>
                {ros.schedule.map((row, i) => (
                  <tr
                    key={i}
                    className={
                      row.hard ? 'ros__row--hard' : row.highlight ? 'ros__row--highlight' : undefined
                    }
                  >
                    <td>{row.time}</td>
                    <td>{row.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {speakers.length > 0 && (
          <>
            <h3 className="ros__h3">Speakers</h3>
            <table className="ros__table">
              <thead>
                <tr><th>Talk</th><th>Speaker</th><th>Role</th></tr>
              </thead>
              <tbody>
                {speakers.map((s) => (
                  <tr key={s.name}>
                    <td>{s.talkTitle}</td>
                    <td>{s.name}</td>
                    <td>{s.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="ros__footer">
        <span className="ros__hl">*</span> {config.title} {config.edition}
      </div>
    </div>
  );
}
