#import "lib.typ": *

#show: resume.with(
  author: (
    firstname: "Thomas",
    lastname: "Winninger",
    email: "thomas.winninger@telecom-sudparis.eu",
    homepage: "https://le-magicien-quantique.github.io",
    // phone: "(+33) 695507673",
    github: "Sckathach",
    // twitter: "typstapp",
    // scholar: "",
    orcid: "0009-0000-2783-3086",
    linkedin: "thomas-winninger",
    positions: (
      "Étudiant à Télécom SudParis en année de césure",
    ),
  ),
  date: datetime.today().display(),
  language: "en",
  colored-headers: true,
  show-footer: false,
)
//#v(0.7em)
//$->$ #emph(text(gray)[
//  English version here: https://le-magicien-quantique.github.io/assets/cv.pdf 
//])

= Rapidement
Fan de mathématiques et de physique, j'ai commencé un cursus de cybersécurité à Télécom SudParis et me suis très vite intéressé à la sécurité de l'IA. J'ai donc décidé de prendre une année de césure pour me mettre à niveau sur le sujet : recherche en sécurité de l'IA, interprétabilité, outils, statistiques; et comme c'est ce qui me plaît le plus, je compte continuer avec un master et une thèse, très certainement dans le même domaine.

= Formation

#resume-entry(
  title: "Master en ?",
  description: "Télécom SudParis - Institut polytechnique de Paris (IPP)",
  date: "2024 - 2026",
 title-link: "https://www.ip-paris.fr/education/masters/"
)
#resume-entry(
  title: "Diplôme d'ingénieur - Spécialisation Cyber",
  description: "Télécom SudParis",
  date: "2022 - 2026",
 title-link: "https://www.telecom-sudparis.eu/", 
)
#resume-item[
  Télécommunications, sécurité des réseaux et applications web, théorie des graphes (application à l'IA et à la 6G). Théorie de l'informatique et bases de données. Traitement du signal et probabilités. 
]

= Expériences
#resume-entry(
  title: "Stage de recherche en explicabilité des modèles de language",
  description: "INRIA - ANTIQUE",
  date: "mars - mai 2025",
  title-link: "https://www.inria.fr/fr/antique"
)
#resume-item[
  Explicabilité de modèles de langage par interprétation abstraite.
]

#resume-entry(
  title: "Stage de recherche en sécurité de l'IA",
  description: "Thales - ThereSIS",
  date: "juillet - décembre 2024",
  title-link: "https://www.thalesgroup.com/fr",
)
#resume-item[
  Implémentations et améliorations des attaques état de l'art sur les LLM.
]

#resume-entry(
  title: "Responsable formation / infrastructure",
  description: "HackademINT",
  date: "2023 - 2024",
  title-link: "https://www.hackademint.org/"
)
#resume-item[
  Création de challenges (IA & physique quantique), et organisation du 404CTF 2023 & 2024.
]

= Présentations
- *Mechanistic interpretability for LLM attack and defense* - _École Polytechnique, CeSIA (avril 2025)_
- *Introduction to AI security and reverse engineering* - _HackademINT (avril 2025)_
- *Model Poisoning* - _AI Safety Meetup | Centre pour la sécurité de l'IA (CeSIA) (juin 2024)_
- *Détection de la triche dans le 404 CTF* - _Rendez-vous de la Recherche et de l'Enseignement de la Sécurité des Systèmes d'Information_ (mai 2024)

= Papiers 
- #link("https://arxiv.org/abs/2503.06269", [*Using Mechanistic Interpretability to craft Adversarial Attacks against Large Language Models*]) - _Winninger T., Addad B., Kapusta K._ (mars 2025)

= Compétences
#resume-skill-item(
  "Langages",
  (strong("Python"), strong("Ocaml"), "TypeScript", "Typst", "Rust", "Lua", "C", "Bash"),
)
#resume-skill-item("Langages parlés", (strong("Français"), strong("Anglais"), "Coréen", "Japonais"))
#resume-skill-item(
  "Outils",
  (strong("PyTorch"), "PyG", "Docker (Podman)", "Kubernetes", "React", "Qiskit", "Sage", "Archlinux :)"),
)

= Autres intérêts
Piano, guitare, enseignement, lecture, géopolitique, physique des particules :), sport, création de jeux vidéos, méditation.
