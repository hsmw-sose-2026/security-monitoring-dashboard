"""Dashboard aggregation logic.

Routes should call this service instead of building all dashboard SQL directly.
"""


from sqlmodel import Session

from app.repositories.event_repository import count_events_today, count_events_by_type, count_events_per_hour, average_events_per_hour
from app.repositories.alert_repository import count_critical_alerts, count_total_alerts, count_alerts_today

from app.schemas.dashboard import StatsResponse

from app.repositories.contact_repository import count_contacts_today
from app.repositories.upload_repository import count_uploads_today


def build_dashboard_stats(session: Session) -> StatsResponse:
    events_per_hour = count_events_per_hour(session)
    average_events = average_events_per_hour(session)
    events_today = count_events_today(session)
    events_by_type = count_events_by_type(session)
    critical_alerts = count_critical_alerts(session)
    alerts_today = count_alerts_today(session)
    total_alerts = count_total_alerts(session)
    contact_messages_today = count_contacts_today(session)
    uploads_today = count_uploads_today(session)
    # Nur Kennzahlen returnen, recent events und alerts erstmal raus lassen

    return StatsResponse(
        events_per_hour=events_per_hour,
        average_events=average_events,
        events_today=events_today,
        events_by_type=events_by_type,
        critical_alerts=critical_alerts,
        alerts_today=alerts_today,
        total_alerts=total_alerts,
<<<<<<< HEAD
    )
=======
        contact_messages_today=contact_messages_today,
        uploads_today=uploads_today,
    )
>>>>>>> origin/integration-test
