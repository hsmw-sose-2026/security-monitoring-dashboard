"""Create SecurityEvent rows from detector findings."""

# TODO(Tim/Jonas): SecurityEvent-Erstellung an einer Stelle buendeln.
# Ziel: Detektoren sollen nur melden, was gefunden wurde. Diese Datei speichert daraus
# SecurityEvent-Eintraege in der Datenbank und startet danach die Alert-Korrelation.
# Fertig, wenn Middleware, Auth und Upload nicht mehr jeweils eigene Event-Speicherlogik brauchen.
