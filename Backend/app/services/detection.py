# Erkennungslogik ueber mehrere Requests hinweg. Also um ein Angriffsmuster zu bauen
# Die Middleware sieht immer nur den aktuellen Request.
# Hier koennen spaeter Muster erkannt werden wie:
# gleiche IP hat 5x den Login falsch eingegeben oder es laufen mehrere auffaellige Dinge parallel.
