# FITEIRO-2026 — LOG DE PROGRESSO (anti-crush)

Data: 2026-08-08 · Sessão: opencode
Repo fonte: https://github.com/majinmagros/fiteiro.git (branch master)
Repo novo: majinmagros/fiteiro-2026 (branch main) — a criar/push
Conta GitHub: majinmagros (logada via gh, escopo repo)

## STATUS: CÓDIGO + DOCS CONCLUÍDOS E VERIFICADOS LOCALMENTE
FALTA: commit + push + Pages + abrir navegador.

## 1. Análise (realizada)
- Site cultural "Fiteiro Cultural © Fabiana de Barros" (2006, XHTML/Dreamweaver).
- ~70 páginas HTML: home + RL/ (16, Real Life) + SL/ (53, Second Life).
- ~190 imagens de conteúdo real; ~125 arquivos de lixo de players/CDN.
- Lixo: video/, s/, p/, js/, js_opt/, cv/, ytc/, rsrc.php/, vi/ (com PDFs
  pessoais boleto.pdf e SuaContaClaro_Abr-21.pdf), flowplayers.min.js órfão.
- Links quebrados: 4 "news" (medialab2010.html, artfortheworld.html, merco.html,
  n-utopics.html) não existiam; widget tweetboard.com extinto; logo dropbox.
- Escopo decidido com usuário: Home + limpeza; excluir PDFs; repo fiteiro-2026;
  tema original dark+laranja #F90.

## 2. Limpeza executada (125 arquivos removidos via git rm)
- video/ s/ p/ js/ js_opt/ cv/ ytc/ rsrc.php/ vi/ flowplayers.min.js
- Confirmado via grep: nenhum HTML referenciou esses arquivos (match "video/"
  era apenas iframe externo player.vimeo.com/video/...).

## 3. Refatoração executada
- inicio.html → index.html (HTML5 semântico + responsivo, remoto tabela 800px).
- Removidos widget tweetboard e logo dropbox.
- News quebradas → seção "Destaques" com as 4 imagens reais (sem link morto).
- alt em tudo, lang="pt-br", viewport, favicon, footer com créditos.

## 4. three.js r160 (tema dark + laranja #F90)
- Vendored: js/build/three.module.js + js/build/OrbitControls.js (jsdelivr).
- importmap: { "three": "./js/build/three.module.js" }.
- js/core.js: renderer alpha, resize (ResizeObserver), TextureLoader SRGB,
  addStars(laranja #ff9900).
- js/index.js: hero 3D (carrossel com ini-rl06, ini-sl03, news-*, ini-tit2,
  logoFiteiro.png + torus laranja/vermelho + OrbitControls autoRotate);
  destaques 3D (carrossel das 4 news).
- FIX IMPORTANTE: OrbitControls é named export — usar `new OrbitControls(...)`,
  NUNCA `new THREE.OrbitControls` (causa TypeError).

## 5. Verificação (local, server python :8124)
- node --check core.js/index.js: OK.
- Chrome headless (--enable-unsafe-swiftshader): index.html → 2 canvases,
  sem erros de console, sem 404.

## 5b. Documentação criada
- README.md (detalhado: sobre, acesso, mudanças, how-to-run, estrutura,
  bibliotecas, boas práticas, deploy) — criado, NÃO commitado ainda.
- PROGRESSO_FITEIRO2026.md (este arquivo).

## 6. PRÓXIMOS PASSOS (se houver travamento)
1. git switch -c main (a partir do clone em master).
2. git add + commit organizado (inclusive README.md e style.css novos).
   NOTA: PROGRESSO_FITEIRO2026.md fica SEM commit (local, anti-crush).
3. gh repo create fiteiro-2026 --public --source . --push.
4. Habilitar GitHub Pages (branch main, path /) via gh api.
5. Verificar https://majinmagros.github.io/fiteiro-2026/ (200 + headless).
6. Fechar e reabrir navegador na home nova.