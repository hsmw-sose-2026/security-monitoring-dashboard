# [Node.js](https://nodejs.org/) (NPM) + [Next.js](https://nextjs.org/docs) + [React](https://react.dev/learn) + [Tailwind CSS](https://tailwindcss.com) + [TypeScript](https://www.typescriptlang.org/docs)

[Node.js](https://nodejs.org/en/download) herunterladen und installieren. Node.js dient dazu JavaScript (und TypeScript) auszuführen. NPM wird automtisch mit installiert und dient dazu die Packages und Commands vom Projekt zu verwalten.

## Development

Um die benötigten Packages zu installieren `npm i` im `Frontend`-Ordner ausführen. Das erstellt den Ordner `node_modules` in dem alle benötigten Pakete für das Projekt liegen.

Der Next.js Dev Server hostet lokal die Website und aktualisiert sobald Änderungen vorgenommen werden.\
Dev-Server starten: `npm run dev`\
Website läuft unter: [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
Frontend
├─ public
└─ src
   ├── app
   │   ├── login
   │   │   └── page.tsx
   │   ├── page.tsx
   │   └── layout.tsx
   └── components
```

### `src/app`

Next.js nutzt einen "App-Router", was bedeutet, dass die Ordnerstruktur den Seiten entspricht. `page.tsx` ist die angezeigt Seite. Also gibt es oben im Beispiel die Seiten `localhost:3000` und `localhost:3000/login`. `layout.tsx` dient als Wrapper, mit der HTML Basisstruktur. Die finale Seite besteht somit aus der Basis `layout.tsx` und dem spezifischen Inhalt `page.tsx`.

### `src/components`

Hier werden Komponenten definiert, die im Projekt verwendet werden. Z.B. erstellt man ein `Input` Component, welches bereits ein bestimmtes Design oder spezielle Logik hat. Dieses Component kann an mehreren Stellen verwenden. Vorteil: Man spart sich Schreibarbeit und das Component kann für die Ganze Website angepasst werden.

### `public`

Enthält statische Dateien, z.B. Bilder, die beim Build 1:1 übernommen werden. Hier gilt wie bei `src/app`, dass die Ordnerstruktur den Seiten entspricht. Also `public/logo.png` würde zu `localhost:3000/logo.png` und `public/assets/image.png` zu `localhost:3000/assets/image.png` werden.
