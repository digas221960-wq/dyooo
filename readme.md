# Dyo — Editor de Vídeos

Site de portfólio do Dyo, editor de vídeos e YouTuber: portfólio com vídeos do YouTube (com filtros Vídeos / Shorts / Motion Design), depoimentos em carrossel e contato.

## Tecnologias

- HTML, CSS e JavaScript puros — sem framework e sem etapa de build
- Netlify (hospedagem) e Netlify Image CDN (otimização das imagens no site publicado)
- Google Fonts: Montserrat Bold/Black (títulos e chamadas), Literata (ênfases editoriais e depoimentos) e DM Sans (textos)

## Rodando localmente

Abra o `index.html` no navegador ou use a extensão Live Server do VS Code. Pra ter o otimizador de imagens igual ao site publicado, rode `netlify dev --port 8889`.

## Onde fica cada coisa

| Quero mudar…              | Arquivo                          |
|---------------------------|----------------------------------|
| Cores, fontes, tamanhos   | `css/variables.css`              |
| Vídeos, depoimentos e links | `js/content.js` |
| Títulos e textos fixos    | `index.html`                     |
| Visual de uma seção       | `css/sections/<seção>.css`       |
| Botões, ícones, destaques | `css/base.css`                   |
| Menu e rodapé              | `css/layout.css`               |
| Imagens                   | `img/` (brand, backgrounds, sections, testimonials, social, icons) |

O guia completo em português, pensado pra quem não programa, está em `LEIA-ME.txt`.
