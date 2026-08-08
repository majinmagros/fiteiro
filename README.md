# Fiteiro-2026 · Fiteiro Cultural

Site do projeto **Fiteiro Cultural © Fabiana de Barros** — rede de exposições de arte que acontece em dois "mundos": o físico (**Real Life**) e o virtual (**Second Life**). Esta versão é uma modernização da home com animações 3D em **Three.js**, mantendo a identidade visual original (fundo preto e laranja `#F90`).

> Refactor/migração do repositório público original `majinmagros/fiteiro`. Novo repositório: `majinmagros/fiteiro-2026`.

---

## 🔗 Acesse

| | URL |
|---|---|
| **Site (GitHub Pages)** | https://majinmagros.github.io/fiteiro-2026/ |
| **Página inicial** | [`index.html`](index.html) |
| **Mundos** | [`RL/`](RL/) (Real Life) · [`SL/`](SL/) (Second Life) |

---

## ✨ O que mudou nesta versão

### Animações three.js (dark + laranja #F90)
- **Hero 3D na home**: as imagens reais do site (`ini-rl06.jpg`, `ini-sl03.jpg`, `news-*.jpg`, `ini-tit2.jpg`, `logoFiteiro.png`) orbitam em um carrossel 3D com loop infinito, fade dinâmico conforme a rotação e partículas laranja ao fundo. **OrbitControls** (arrastar para orbitar, scroll para zoom, câmera com rotação automática).
- **Destaques em 3D**: faixa de notícias (`news-01..04`) em carrossel rotativo.
- **Sem dependência de CDN**: three.js r160 vendored em `js/build/`.

### Modernização da home
- `inicio.html` (XHTML/2006, tabelas `DWLayoutTable` de 800px) → **`index.html`** em HTML5 semântico, responsivo (mobile).
- Removidos widget extinto (`tweetboard.com`) e logo externa de CDN (`dropbox`) que falhavam.
- Links quebrados do home (4 "news" cujos HTML nunca existiram) → viram seção **Destaques** com as imagens reais.
- `alt` em todas as imagens, `lang="pt-br"`, meta viewport, favicon.

### Limpeza do repositório (~125 arquivos removidos)
- Players e CDN irrelevantes ao site: `video/`, `s/`, `p/`, `js/`, `js_opt/`, `cv/`, `ytc/`, `rsrc.php/`, `flowplayers.min.js`.
- **PDFs pessoais commitados por engano** (`vi/boleto.pdf`, `vi/SuaContaClaro_Abr-21.pdf`) — removidos por privacidade.
- Páginas internas `RL/` e `SL/` (galerias estáticas) foram **mantidas intactas**.

---

## 🚀 Como rodar

O site usa **ES modules + importmap**, então sirva via HTTP (não funciona abrindo o arquivo direto):

```powershell
# opção 1: Python
python -m http.server 8123
# abrir http://127.0.0.1:8123/index.html
```

Ou acesse a versão publicada: https://majinmagros.github.io/fiteiro-2026/

## 📁 Estrutura

```
.
├── index.html            # Home modernizada (hero 3D + mundos + destaques)
├── style.css             # CSS unificado (dark theme, variáveis, responsivo)
├── ini-tit2.jpg          # Título do site (header)
├── ini-rl05/06.jpg       # Card "Real Life" (hover/imagem)
├── ini-sl03/04.jpg       # Card "Second Life" (hover/imagem)
├── news-01..04-*.jpg     # Destaques / notícias
├── logoFiteiro.png       # Logo / favicon
├── sep.jpg               # Separador (mantido para páginas RL/SL)
├── bumpbox.js · mootools.js  # Legado usado pela home original (mantido)
├── RL/                   # Real Life — galerias por local (mantidas)
├── SL/                   # Second Life — artistas e ilha virtual (mantidas)
├── scripts/jquery-1.2.6.min.js  # Usado nos slideshows SL (mantido)
└── js/
    ├── core.js           # Utilitários three.js (renderer, resize, texturas, estrelas)
    ├── index.js          # Animações da home (hero 3D + carrossel destaques)
    └── build/            # three.js r160 vendored (sem CDN)
        ├── three.module.js
        └── OrbitControls.js
```

## 🛠 Referências

- **Three.js r160** — https://threejs.org/ (`TextureLoader`, `MeshBasicMaterial`, `OrbitControls`, loop com `requestAnimationFrame`).
- Fonte **Montserrat** — Google Fonts.

## ✅ Boas práticas aplicadas

- HTML5 semântico e responsivo (era XHTML/2006 com tabelas fixas).
- `alt`/`title` acessíveis em todas as imagens.
- Remoção de dados pessoais (PDFs) e de dezenas de MB de assets de player/CDN.
- Remoção de serviços extintos (widget tweetboard) e URLs externas quebradas.
- Reuso de código validado (módulos `core.js`/`index.js` idênticos ao padrão do projeto irmão `dna-2026`).

## 🚢 Implantação

Publicado via **GitHub Pages** a partir da branch `main`:

- Repo: `majinmagros/fiteiro-2026`
- Deploy: https://majinmagros.github.io/fiteiro-2026/

Qualquer `git push` para `main` atualiza o Pages automaticamente.

---

FITEIRO CULTURAL © Fabiana de Barros. All art works reproduced with courtesy of the artists.
Second Life® is trademark or registered trademark of Linden Research, Inc. No infringement is intended.
© 2026 Fiteiro Cultural.