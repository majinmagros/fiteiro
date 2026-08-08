# PROGRESSO FITEIRO 2026 — 2026-08-08

## Onde paramos

**Site funcional no ar:** https://majinmagros.github.io/fiteiro/ ✅

**Repo secundário (fiteiro-2026) com deploy travado:** https://majinmagros.github.io/fiteiro-2026/

### Estado do código (commit atual: `1282bcf` / `gh-pages`)
- `js/index.js` — versão async com `createTextureAtlas` + `createCarouselInstancedMesh` (InstancedMesh para hero + destaques)
- `js/core.js` — exports: `createTextureAtlas`, `createCarouselInstancedMesh`, `loopWhenVisible`, etc.
- `.github/workflows/fetch-and-deploy.yml` — workflow com `fetch-content` + `deploy-pages` (precisa Pages configurado como "GitHub Actions")
- `scripts/fetch-content.js` — busca conteúdo via 9Router web/fetch
- `data/exhibitions.json`, `data/artists.json` — gerados pelo script
- `.nojekyll` — desabilita Jekyll

### O que funciona
- Site principal (fiteiro): hero 3D (carrossel InstancedMesh), ticker vertical "Destaques", modal de exposições, responsivo
- 9Router local ok (health check), mas **provedores web não configurados** (tavily/firecrawl/jina/exa)

### Pendências CRÍTICAS (fiteiro-2026)
1. **GitHub Pages → Settings → Pages → Source: "GitHub Actions"** (ou branch `gh-pages` / root)
   - O workflow roda mas deploy não atualiza JS porque Pages não está no modo Actions
2. **GitHub Secrets**: `NINEROUTER_URL`, `NINEROUTER_KEY` (para workflow rodar fetch)
3. **Provedores web no 9Router Dashboard** (para fetch funcionar)
4. **URLs reais** em `scripts/fetch-content.js:SOURCES`

### Melhorias opcionais
- Breakpoint CSS `< 480px` (hero menor, nav touch-friendly)
- `touch-action: none` nos canvases 3D

### Cópias locais
- `C:\projetos\fiteiro` — sincronizado com GitHub
- Branch `master` = código atual
- Branch `gh-pages` = mesma base (deploy target)

### Próximos comandos sugeridos
```bash
cd C:\projetos\fiteiro
# Após configurar Pages no GitHub:
git push fiteiro-2026 gh-pages --force  # forçar rebuild
# Verificar Actions: https://github.com/majinmagros/fiteiro-2026/actions
```