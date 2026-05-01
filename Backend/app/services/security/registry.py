"""Run all configured security detectors for a request."""

# TODO(Jannis): Zentrale Liste aller Detektoren bauen.
# Ziel: Die Middleware soll nur noch diese Registry aufrufen. Die Registry ruft dann
# SQLi-, XSS-, Path-Traversal-, Bad-Upload-, Brute-Force- und Rate-Limit-Detektoren auf.
# Fertig, wenn ein neuer Detektor nur hier eingetragen werden muss und dann automatisch mitlaeuft.
