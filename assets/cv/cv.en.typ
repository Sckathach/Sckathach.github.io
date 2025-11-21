#set text(font: "Inria Sans", size: 10pt)
#show link: X => underline(text(X, fill: orange))
#show regex("\[([^\]]*)\]\(([^)]*)\)"): x => x
#show heading: X => {
  v(0.3em)
  X
  v(0.5em)
}

#align(
  center,
  text([*Thomas Winninger*], size: 2em),
)
#align(
  center,
  text(
    [M2 mathematics student at Télécom SudParis - ENS Paris-Saclay.

      I'm looking for an intership starting April 2026, on diffusion, LLM alignement, GNNs, or more generally fundamental AI that would lead to a PhD.],
    size: 1.3em,
  ),
)
#v(1em)
// #show strong: set text(purple)

*Mail:* thomas.winninger\@telecom-sudparis.eu  *- Website:* #link("https://le-magicien-quantique.github.io")
*LinkedIN:* #link("https://linkedin.com/in/thomas-winninger", [thomas-winninger])


= Education

- 2025 - 2026 *Master MVA, ENS Paris-Saclay* \
  Topology, optimal transport, reinforcement learning, training and deploying large-scale models, LLM, graph neural networks, learning for protein science, convex optimization.

- 2022 - 2026 *Engineering Degree, Télécom SudParis* \
  Telecommunications, cyber security, cloud, information theory, probability, optimization, graph theory, graph neural networks, signal processing.


= Experience

- Jul - Sep 2025 - *Research internship in LLM security - NICT* \
  Research on the security and jailbreak interpretability of Large Reasoning Models (LRMs).

- Mar - May 2025 - *Research internship in AI explanability - INRIA* \
  Verified robust explanation for language models.

- Jul - Dec 2024 - *Research internship in AI security - Thales* \
  Implementations and improvements of state-of-the-art attacks on LLMs.

- 2022 - 2024 - *Teaching and infrastructure - HackademINT* \
  Teaching (cloud and AI security), cloud management (Kubernetes), creation of challenges (AI & quantum physics), and organization of 404CTF 2023 & 2024 (largest cyber security competition in France).


= Miscellaneous

- Spoken languages: *French (native), English (TOEIC)*, Japanese (JLPT 4)

- Programming languages: *Python, OCaml*, Typst, TypeScript, Lua, Rust, C, Bash, Lean

= Papers

- Scaling Hybrid Constrined Zonotopes with optimisation - _Winninger T., Urban C., Wei G., Jun 25_. #link("https://sckathach.github.io/assets/papers/winninger_scaling_2025.pdf", [Paper])

- Using Mechanistic Interpretability to Craft Adversarial Attacks against Large Language Models - _Winninger T., Addad B., Kapusta K., Mar 25_. #link("https://arxiv.org/abs/2503.06269", [ArXiv]) / #link("https://sckathach.github.io/mech-interp/subspace-rerouting/", [Webpage])

= Selected Talks

- Mechanistic interpretability for LLM attack and defense, _École Polytechnique, CeSIA, Apr 25_. #link("https://sckathach.github.io/talks/slides/cesia-ssr.pdf", [Slides])

- Introduction to AI security and reverse engineering, _Télécom SudParis, HackademINT, Apr 25_. #link("https://sckathach.github.io/talks/hackademint-causapscal/assets/main.pdf", [Slides]) / #link("https://sckathach.github.io/talks/hackademint-causapscal/", [Webpage])

- Model Poisoning, _Station F, CeSIA, Jun 24_. #link("https://sckathach.github.io/talks/slides/cesia-poison.pdf", [Slides])

