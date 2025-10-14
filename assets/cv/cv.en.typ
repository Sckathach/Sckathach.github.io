#set text(font: "Inria Sans", size: 10pt)
#show link: X => underline(text(X, fill: orange))
#show regex("\[([^\]]*)\]\(([^)]*)\)"): x => x

#align(
  center,
  text([*Thomas Winninger*], size: 2em),
)
#align(
  center,
  text([M2 mathematics student at Télécom SudParis - ENS Paris-Saclay], size: 1.5em),
)
#show heading: X => {
  v(1em)
  X
  v(0.7em)
}

*Mail:* thomas [dot] winninger [at] telecom-sudparis [dot] eu  *- LinkedIN:* #link("https://linkedin.com/in/thomas-winninger", [thomas-winninger]) \
*Website:* #link("https://le-magicien-quantique.github.io") *- GitHub:* #link("https://github.com/Sckathach", [Sckathach])


= Education

- 2025 - 2026 *Master MVA, ENS Paris-Saclay* \
  Topology, optimal transport, reinforcement learning, training and deploying large-scale models, LLM, graph neural networks, learning for protein science, convex optimization.

- 2022 - 2026 *Engineering Degree, Télécom SudParis* \
  Telecommunications, cyber security, cloud, information theory, probability, optimization, graph theory, graph neural networks, signal processing.


= Experience
- Sep 2025 - _now_ - *Teaching and research sprints - PIAF* \
  Teaching (interpretability, LLM training and fine-tuning) and organizing short research sprints (teams of ~5 people, lasting under four days).

- Jul - Sep 2025 - *Research internship in LLM security - NICT* \
  Research on the security and jailbreak interpretability of Large Reasoning Models (LRMs). _I studied LRM robustness, adapted state-of-the-art black-box and white-box attack from LLMs, and started studying jailbreaks with interpretability methods on LRMs._

- Mar - May 2025 - *Research internship in AI explanability - INRIA* \ 
  Verified robust explanation for language models. _I explored scaling Hybrid Constrained Zonotopes (HCZs) to language models using convex relaxation and optimization. However, the relaxation error proved too large for practical use._

- Jul - Dec 2024 - *Research internship in AI security - Thales* \
  Implementations and improvements of state-of-the-art attacks on LLMs. _I improved state-of-the-art white-box adversarial attacks on LLMs and published the results on ArXiv._

- 2022 - 2024 - *Teaching and infrastructure - HackademINT* \
  Teaching (cloud and AI security), cloud management (Kubernetes), creation of challenges (AI & quantum physics), and organization of 404CTF 2023 & 2024 (largest cyber security competition in France).


= Miscellaneous

- Languages: *Python, #link("https://fr.wikipedia.org/wiki/Baguette_(pain)", [French]), OCaml, English*, Typst, TypeScript, Lua, Rust, C, Bash, Japanese (JLPT 4), Lean

- Tools/ Frameworks: *PyTorch, nnsight*, Docker (Podman), Kubernetes, React, Qiskit, Archlinux
- Other interests: Piano, guitar, teaching, reading, geopolitics, particle physics, sports, video game (playing & development), meditation
- I completed the Alignment Research Engineer Accelerator (ARENA) and the AI Safety Fundamental (AISF) curriculums.

= Papers
- Scaling Hybrid Constrined Zonotopes with optimisation - _Winninger T., Urban C., Wei G., Jun 25_. #link("https://sckathach.github.io/assets/papers/winninger_scaling_2025.pdf", [Paper])

- Using Mechanistic Interpretability to Craft Adversarial Attacks against Large Language Models - _Winninger T., Addad B., Kapusta K., Mar 25_. #link("https://arxiv.org/abs/2503.06269", [ArXiv]) / #link("https://sckathach.github.io/mech-interp/subspace-rerouting/", [Webpage])

= Talks

- Adversarial attacks against reasoning LLMs, _Tokyo, NICT, Sep 25_.

- Scaling abstract domains to Large Language Models with Hybrid Constrained Zonotopes, _ENS Ulm, INRIA, Jun 25_.

- Mechanistic interpretability for LLM attack and defense, _École Polytechnique, CeSIA, Apr 25_. #link("https://sckathach.github.io/talks/slides/cesia-ssr.pdf", [Slides])

- Introduction to AI security and reverse engineering, _Télécom SudParis, HackademINT, Apr 25_. #link("https://sckathach.github.io/talks/hackademint-causapscal/assets/main.pdf", [Slides]) / #link("https://sckathach.github.io/talks/hackademint-causapscal/index.qmd", [Webpage])

- Model Poisoning, _Station F, CeSIA, Jun 24_. #link("https://sckathach.github.io/talks/slides/cesia-poison.pdf", [Slides])

- GNN based IDS and its robustness against adversarial attacks, _Télécom SudParis, HackademINT, Jun 24_. #link("https://sckathach.github.io/talks/slides/hackademint-gnn-based-ids.pdf", [Slides])

- Cheating Detection in the 404 CTF, _Rendez-vous de la Recherche et de l'Enseignement de la Sécurité des Systèmes d'Information (RESSI), May 24_.

- Introduction to prompt hacking, _Télécom SudParis, HackademINT, Nov 23_. #link("https://sckathach.github.io/talks/slides/hackademint-prompt-hacking.pdf", [Slides])

- How to backdoor federated learning, _Télécom SudParis, HackademINT, May 23_. #link("https://sckathach.github.io/talks/slides/hackademint-federated-poison.pdf", [Slides])

- Introduction to AI & cyber security, _Télécom SudParis, HackademINT, May 23_. #link("https://sckathach.github.io/talks/slides/hackademint-ai-in-cybersecurity.pdf", [Slides])

= Research reports

- Graph Neural Network based Intrusion Detection and its Robustness against Adversarial Attacks, _Moreau R., Winninger T., Blanc G., Jun 24_. #link("https://sckathach.github.io/assets/papers/moreau_graph_2024.pdf", [Paper])

= Hackathons

- ZaMark: Intellectual Property protection with Homomorphic Watermarking, _Privacy Preserving Hackathon, Zama, Sep 24, (finished 2nd)_. #link("https://sckathach.github.io/talks/slides/misc/zamark.pdf", [Slides])

