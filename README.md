# Controle de Terço de Validade

Ferramenta para o recebimento de mercadorias: confere se o produto chega com **no mínimo 1/3 do prazo total de validade** (percentual configurável). React + Vite, sem backend; os registros ficam no LocalStorage do navegador.

## Regra
- Prazo total = validade − fabricação · Prazo restante = validade − recebimento
- % restante = restante ÷ total × 100
- **Aprovado** com ≥ 1/3 restante (exatamente 1/3 é aprovado); **Reprovado** abaixo; **Vencido** se o recebimento passa da validade.
- A decisão usa dias inteiros, sem arredondar o percentual, e datas civis (sem erro de fuso).

## Instalar no celular (offline)
Abra o link publicado no Chrome do Android, com internet, e toque em ⋮ → **Instalar app** (ou **Adicionar à tela inicial**). Depois da primeira abertura, o app funciona sem internet e os registros ficam salvos no aparelho.

## Rodar localmente
Requer Node 18+.
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # testes da regra
npm run build    # gera a pasta dist
```

## Publicar no GitHub
1. Crie um repositório vazio em github.com (botão **New**).
2. Na pasta do projeto:
```bash
git init && git add . && git commit -m "Primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```
(Sem terminal: no repositório, **Add file → Upload files** e envie todos os arquivos, exceto `node_modules` e `dist`.)

## Publicar na Netlify
1. Em app.netlify.com: **Add new site → Import an existing project → GitHub** e escolha o repositório.
2. Build command: `npm run build` · Publish directory: `dist` (o `netlify.toml` já define isso).
3. **Deploy**. A cada `git push`, o site é atualizado sozinho.

## PIN de administrador (único, definido por você)
Excluir registros, exportar (Excel/CSV/PDF) e limpar o relatório podem pedir um PIN. Usuários **não conseguem criar nem trocar** o PIN pelo app.
1. No computador, abra `gerar-pin.html` no Chrome, digite o PIN e clique em **Gerar**.
2. Edite `src/config/admin.js` (no GitHub: abra o arquivo → lápis ✏️) e substitua `export const ADMIN = null;` pela linha gerada.
3. Salve (Commit). A Netlify publica sozinha e o mesmo PIN passa a valer em todos os celulares.

Para trocar o PIN, repita os passos. Importante: é uma trava local; o código do app é público no navegador, então use um PIN longo (6+ caracteres, letras e números). Para segurança forte seria preciso login com servidor.

## Estrutura
`src/utils/terco.js` (cálculo + testes) · `src/utils/exportar.js` (CSV/Excel/PDF) · `src/pages` · `src/hooks` · `src/styles`
