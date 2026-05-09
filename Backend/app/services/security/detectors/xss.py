"""Cross-site scripting detector."""

# TODO(Jannis): XSS-Erkennung aus xss.json anbinden.
# Ziel: Muster wie <script>, javascript: und onerror= in Kontaktformular, Suche und
# anderen Eingabefeldern erkennen.
# Fertig, wenn ein Kontaktformular mit <script>alert(1)</script> ein xss-Event erzeugt.
