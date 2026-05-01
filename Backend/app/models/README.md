# Geplante Model-Aufteilung

`Backend/app/models.py` ist aktuell noch das aktive Model-Modul.

Legt in diesem Ordner noch keine `__init__.py` an, solange Imports wie
`from app.models import User` noch nicht umgezogen wurden. Sonst kann Python
diesen Ordner statt der bestehenden Datei `models.py` importieren.

Die Dateien in diesem Ordner dienen erst einmal als Platzhalter und
Ownership-Markierungen fuer die geplante Aufteilung.
