# FocusFlow – Deine einfache To-do-App

Eine einfache und übersichtliche To-do-App für den Browser. Sie hilft dir, Aufgaben festzuhalten, den Überblick zu behalten und Erledigtes abzuhaken.

## Live Demo

[Try FocusFlow live](https://rut21a.github.io/fokusflow-todo-app/)

## Funktionen

- Aufgaben hinzufügen und erledigen
- Aufgaben in den Papierkorb verschieben
- Nach offenen, erledigten und gelöschten Aufgaben filtern
- Aufgaben lokal im Browser speichern
- Aufgaben exportieren und wieder importieren

## Geplante Verbesserungen

- Aufgaben mit einem Datum und einer Priorität versehen
- Suchfunktion für Aufgaben hinzufügen
- Ansicht für Mobilgeräte weiter verbessern
- Farben oder einen Dark Mode auswählbar machen

## Einrichtung

1. Lade das Projekt herunter oder kopiere den Projektordner auf deinen Computer.
2. Du brauchst keine zusätzlichen Programme oder Pakete: Die App besteht aus HTML, CSS und JavaScript.

## App starten

1. Öffne den Projektordner.
2. Mache einen Doppelklick auf `index.html`.
3. Die App öffnet sich in deinem Standardbrowser.

### Optional: Mit einem lokalen Server starten

Wenn Python installiert ist, öffne ein Terminal im Projektordner und führe diesen Befehl aus:

```powershell
py -3 -m http.server 5173
```

Öffne danach im Browser diese Adresse:

```text
http://127.0.0.1:5173/
```

## Testing notes

- The empty state is shown when there are no tasks.
- Empty task text is blocked with a clear message.
- Clearing task data keeps the app usable.
- Adding, editing, filtering, and deleting tasks were tested without console errors.

## Deploy with GitHub Pages

This app is ready for GitHub Pages because it uses only HTML, CSS, and JavaScript.

1. Open the repository on GitHub and choose **Settings**.
2. Open **Pages** in the left menu.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the branch **main**, the folder **/(root)**, then click **Save**.
5. GitHub will show the public app link after a short moment.
