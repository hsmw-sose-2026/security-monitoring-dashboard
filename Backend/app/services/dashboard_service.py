"""Dashboard aggregation logic.

Routes should call this service instead of building all dashboard SQL directly.
"""

# TODO(Jonas): Dashboard-Aggregationen fuer die Uebersichtsseite bauen.
# Ziel: Aus SecurityEvents und Alerts die Werte aus dem Anforderungskatalog berechnen:
# Events heute, kritische Alerts, Events pro Stunde und Verteilung nach Angriffstyp.
# Fertig, wenn /dashboard/stats alle Daten liefert, die Karten und Charts im Frontend brauchen.
