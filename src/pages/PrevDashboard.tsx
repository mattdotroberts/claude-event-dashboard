import { useParams } from 'react-router-dom';
import { Dashboard } from './Dashboard';

/**
 * Read-only archive view at /prev/:archiveId/dashboard.
 * archiveId may be the raw event slug ("builders-3") or the date-prefixed
 * form ("14052026-builders-3"). We strip a leading ddmmyyyy- if present and
 * pass the remaining slug to the Dashboard, which renders the archived event's
 * data with interactions disabled.
 */
export function PrevDashboard() {
  const { archiveId } = useParams<{ archiveId: string }>();
  const slug = (archiveId ?? '').replace(/^\d{8}-/, '');
  return <Dashboard archiveSlug={slug} />;
}
