# [Node.js](https://nodejs.org/) (NPM) + [Bun](https://bun.sh/) + [Next.js](https://nextjs.org/docs) + [React](https://react.dev/learn) + [Tailwind CSS](https://tailwindcss.com) + [TypeScript](https://www.typescriptlang.org/docs)

[Node.js](https://nodejs.org/en/download) & [Bun](https://bun.sh/) herunterladen und installieren. Node.js/Bun dient dazu JavaScript (und TypeScript) auszuführen.

- Icons: [Tabler Icons](https://tabler.io/icons)
- Empfohlene VSCode Extensions:
    - biome von biomejs
    - Tailwind CSS IntelliSense von Tailwind Labs
    - JavaScript and TypeScript Nightly von Microsoft
    - Pretty TypeScript Errors von yoavbls

## Development

Um die benötigten Packages zu installieren `bun i` im `Frontend`-Ordner ausführen. Das erstellt den Ordner `node_modules` in dem alle benötigten Pakete für das Projekt liegen.

Der Next.js Dev Server hostet lokal die Website und aktualisiert sobald Änderungen vorgenommen werden.\
Dev-Server starten: `bun run dev`\
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



<!---
This template uses parts from other sources:

- UA Research Data Repository Template: https://osf.io/4tgky/
- Make a README: https://www.makeareadme.com/

Examples are taken from published data sets from Thuringian Competence Network for Research Data Management:
https://zenodo.org/communities/tkfdm
--->

# Project Title

Title of the dataset for the project. It should be concise yet specific enough to ensure clarity and search engine discoverability, making the purpose and content of the dataset immediately apparent.


## Description

Description text of the project: Provide clear context about the project, including its purpose and scope. Add links to any references or resources that might help visitors understand the project better. Consider including a list of features or a background subsection to give more depth. If there are alternative solutions or similar projects, this is a great section to highlight what sets your project apart.

<!--- Example: This dataset consists of 65 stories about bad (research) data management based on true stories. The stories were collected and rewritten by the Thuringian Competence Network for Research Data Management. The text of the stories themselves are free to use under the CC0 license. This does not include the illustrations, which were used on the webpage or in the card game to visualize the stories. [source: https://zenodo.org/doi/10.5281/zenodo.4066679]
--->


## Contributor Roles

Descriptions of the contributors to the project or dataset: Include each personâ€™s role and specific contributions to the dataset or project. If individual contact details are unavailable or not provided, general contact information for the entire project can be included in the 'Contact' section at the end.

```
- [FirstName1 LastName1], [Institution (Appartment)], [Email]: [role1], [role2], [...]
- [FirstName2 LastName2], [Institution (Appartment)], [Email]: [role1], [role2], [...]
```

info: The roles are defined by the [CRediT taxonomy](https://credit.niso.org/)

<!--- Example:
- Kevin Lang, Bauhaus-UniversitÃ¤t Weimar (University Library), kevin.lang@uni-weimar.de: Project Administration, Visualization
--->


## Citation

Preferred citation (Style name):
```
[LastName1], [FirstName1]; [LastName2], [FirstName2]; [LastName3], [FirstName3]; etc. (YYYY). "[Title of Article or Dataset]". Journal name, and journal information (e.g., volume, issue, page numbers) [DOI link to publication]
```
DOI: https://doi.org/...

<!--- Example: 
Preferred citation (APA): Lang, K., Gerlach, R., Rex, J., Neute, N., Annett SchrÃ¶ter, Schwartze, V., Assmann, C., Lehmann, A., Boelter, S., & Meyer, R. (2023). Research Data ScaryTales (4.0) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.10061862                                            

DOI: https://doi.org//10.5281/zenodo.4066679
--->


## Structure of the dataset

Description of the dataset project folder structure. Provide an overview of the folder organization, files, and naming conventions, explaining how they relate to the workflow and how to interpret the data. If the project contains numerous files and folders, consider including a file tree diagram to enhance clarity and navigation.

```
- [Folder 1 Name]/[Subfolder 1 Name]: [Description of contents]
  - [file or set of related files]: [Purpose, contents, naming convention, etc.]
```

info: for visualization a file tree can be created in project folder with...
- windows console: "tree /f /a > tree.txt"
- linux console: "tree -f -a > tree.txt"

<!--- Example: general project
project_folder
â”œâ”€â”€ 0_project_management
â”‚   â”œâ”€â”€ 0_proposals
â”‚   â”œâ”€â”€ 1_finance
â”‚   â”œâ”€â”€ 2_reports
â”‚   â””â”€â”€ 3_approvals
â”œâ”€â”€ 1_empirical
â”‚   â”œâ”€â”€ 0_input
â”‚   â”œâ”€â”€ 1_code
â”‚   â”œâ”€â”€ 2_output
â”‚   â””â”€â”€ 3_data_analysis
â”œâ”€â”€ 2_paper
â”‚   â”œâ”€â”€ 0_literature
â”‚   â””â”€â”€ 1_main_text
â””â”€â”€ 3_dissemination
â”œâ”€â”€ 0_presentations
â”œâ”€â”€ 1_publications
â”œâ”€â”€ 2_posters
â””â”€â”€ 3_publicity

- 1_empirical/1_code: Scripts to collect and transform data in python 
  - crawler.py: collects meta content from websites
  - content2table.py: transforms and recodes description texts to CSV
--->

<!--- Example 2: data set
scary_tales_project
â”œâ”€â”€ txt
â”‚   â”œâ”€â”€ de
|   â”‚   â”œâ”€â”€ st_01_backup_is_key.txt
|   â”‚   â”œâ”€â”€ st_02_seltsam-preise_haben_geburtstag.txt
|   â”‚   â””â”€â”€ ...
â”‚   â””â”€â”€ en
|       â”œâ”€â”€ st_01_backup_is_key.txt
|       â”œâ”€â”€ st_02_costly_birthdays.txt
|       â””â”€â”€ ...
â”œâ”€â”€ scarytales_de.docx
â”œâ”€â”€ scarytales_en.docx
â”œâ”€â”€ sources.docx
â””â”€â”€ README.md

- txt/de: german stories as TXT with title, catch phrase, solution and sources 
  - st[number_of_story][german_title_of_story].txt: contains title, catch phrase, solution and sources, seperated by double break
--->


## Materials and methods

Description of the methods and applications used. Detail the tools, methods, and formats employed in the project, including both proprietary and open formats. Explain the rationale behind selecting specific tools and formats, highlighting their relevance to the project's goals. You may also include a list of applications and tools, for example:
```
- [Software program w/ version number], [URL, DOI, citation, etc.]. [Short description of why it's needed].
- [Instrument name/model], [manufacturer]. [Short description of why it's needed].
```

<!--- Example:
For the analysis and evaluation, XLS (Excel), IPYNB (Python with JuPyTer Notebook), MX24 (MAXQDA24), and DOCX (Word) were used. Excel data was exported to open formats such as CSV for reusability, and code segments were exported from MAXQDA into Word documents by category. Additional result graphics were saved as PNG files.

The results in documents and images can be opened and viewed with any application. The categorical data from the content analysis can be opened with MAXQDA or the free MAXQDA Reader software. The Python script for generating the result graphics from the collection of guidelines can be executed with JuPyTer Notebook and edited with any text editor.

list:
- MAXQDA24 v24.3.0, https://www.maxqda.com/de/produkte/maxqda, content analysis of documents
--->


## Getting started

Providing specific instructions for dependencies, installation, or usage of the scripts, software, and/or data.

<!--- Example:
### Installation

Install [Python 3](https://www.python.org/downloads/).

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install NumPy.

```bash
pip install numpy
```

### Usage

Use script to crawl meta information providing seed website.

```bash
python crawler.py 'title' 'https://de.wikipedia.org/wiki/Forschungsdaten' > 'titles.txt'
```

Use script to transform crawled meta information to table.

```bash
python crawler.py content2table.py 'titles.txt'
```
--->


## License

Indicates the dataset's license if it is open or specifies other legal or contractual regulations. Licenses should be explicitly stated or linked. A list of possible licenses is available from [SPDX](https://spdx.org/licenses/).

<!--- Example:
This project is published under the license 'GNU Affero General Public License v3.0'. More information can be found in the file 'LICENSE' file.
-->


## Acknowledgments

Express appreciation to those who contributed to the project.

<!--- Example:
Thanks for the financial support by the ThÃ¼ringer Ministerium fÃ¼r Wirtschaft, Wissenschaft und digitale Gesellschaft and the universities of Jena, Erfurt, Weimar and Ilmenau which created the Thuringian Competence Network for Research Data Management. Further thanks to all the rdm institutions and researchers who also provided us with stories.
--->


## Contact

Contact information for the project and dataset, valid even after the project is completed.

<!--- Example:
For questions about the dataset or the general project please contact the network via email: info@forschungsdaten-thueringen.de
--->


## Additional Notes

Adding additional notes about the project or dataset that didn't fit into the other sections.

<!--- Example:
Links:
- Poster: https://...
- Conference: https://...
- Follow-Up project: https://...
--->