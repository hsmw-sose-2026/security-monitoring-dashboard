"""SQL injection detector."""

# TODO(Tim/Jannis): SQL-Injection-Erkennung aus sqli.json anbinden.
# Ziel: Muster wie "' OR 1=1", "UNION SELECT" und "DROP TABLE" aus der JSON-Datei
# gegen URL, Query und Formularfelder pruefen.
# Fertig, wenn ein Login-Versuch mit "' OR 1=1 --" ein sql_injection-Event erzeugt.
