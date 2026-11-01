# Bildoptimierung

Neue Uploads werden automatisch nach WebP umgewandelt, anhand der EXIF-Ausrichtung gedreht und ohne Hochskalieren auf maximal 1600 × 1600 Pixel begrenzt (Seitenverhältnis bleibt erhalten). Qualitätsstufe: 82. Für Tabellen gibt es Vorschaubilder mit maximal 240 × 240 Pixeln und Qualität 75.

Die bestehenden `/uploads/items/<dateiname>`-Adressen bleiben erreichbar. Das Backend liefert ältere Bilder als zwischengespeicherte WebP-Ansichten aus; `?size=thumbnail` liefert die kleine Vorschau. `.image-cache` enthält abgeleitete Dateien und muss nicht gesichert werden. Ein Upload wird erst nach erfolgreicher Verarbeitung in der Datenbank referenziert. Fehlerhafte Uploads und ersetzte Bilder einschließlich ihrer Vorschaudateien werden aufgeräumt.

## Installation und Prüfung

Im Backend-Verzeichnis mit der vorhandenen `.env`:

```sh
npm ci
node --test test/image-storage.test.mjs test/image-migration.test.mjs
```

Danach das Backend mit dem bisherigen Prozessmanager neu starten und das neu gebaute Admin-Frontend bereitstellen. Die Sharp-Abhängigkeit muss auf dem Zielsystem installiert werden; keine Windows-node_modules nach Linux kopieren. Bei einem vorgeschalteten Nginx muss `/uploads/items/` an das Backend gehen, damit die Bildoptimierung und `?size=thumbnail` greifen. Eine bisherige direkte `alias`-Auslieferung dieses Pfads würde sie umgehen.

## Bestehende Dateien verkleinern

Während der Umwandlung keine neuen Uploads vornehmen. Zuerst Datenbank und Upload-Verzeichnis extern sichern. Die folgenden Befehle im Backend-Verzeichnis prüfen die Datenbank aus `.env`; die Zieladresse wird angezeigt, niemals das Passwort.

```sh
df -h .
du -sh uploads/items
node scripts/optimize-existing-images.js
```

Ohne `--apply` werden keine Bilder oder Datenbankwerte verändert. Fehlende Originaldateien werden gemeldet und übersprungen. Erst nach Prüfung des Ziels und der Vorschau:

```sh
node scripts/optimize-existing-images.js --apply --backup-dir /absoluter/pfad/zu/neuer-bildsicherung
```

Der Sicherungsordner darf noch nicht existieren und muss außerhalb des öffentlichen `uploads`-Verzeichnisses liegen; sein übergeordneter Ordner muss existieren. Pro Bild werden zuerst das Original und seine SHA-256-Prüfsumme gesichert. Vor dem Umschalten der Datenbankadresse wird der neue Dateipfad im Rücksetzprotokoll vermerkt. Das Original wird erst nach erfolgreicher Datenbankänderung entfernt und nur, wenn kein weiterer Artikel es verwendet. Bereits optimierte Bilder werden bei späteren Läufen übersprungen. Bei Abbruch kann der Lauf mit einem anderen Sicherungsordner fortgesetzt werden; alle bisherigen Sicherungen behalten.

Die Sicherung belegt weiter Speicher. Erst nach Kontrolle der Bilder und erfolgreicher Übertragung der Sicherung auf einen anderen Datenträger den lokalen Sicherungsordner entfernen. Ein vollständiger Plattenausfall kann nicht durch eine Sicherung auf derselben Platte abgesichert werden.

Rücksetzen eines Umwandlungslaufs:

```sh
node scripts/restore-image-backup.js /absoluter/pfad/zu/neuer-bildsicherung
```

Das Skript überprüft die Sicherungen und stellt alte Dateien und die noch passenden Datenbankverweise wieder her. Später geänderte Bildverweise werden nicht überschrieben. Optimierte Dateien bleiben beim Rücksetzen vorsichtshalber erhalten.

## Speicher

`df -h` zeigt den freien Plattenplatz; `du -sh uploads/items` den Platzbedarf der Artikelbilder einschließlich Vorschaudateien. Die Vorschau der Umwandlung meldet ebenfalls freien Speicher und Quelldateigrößen. Auf Hetzner muss die Auslastung separat geprüft werden; lokaler freier Speicher sagt nichts über den Server aus. Für eine dauerhafte Warnung wäre ein zusätzlicher Speicher-Monitor erforderlich.
