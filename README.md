# Conferidor de Jogos - Quina & Mega-Sena

Aplicação web para conferir jogos de loteria (Quina e Mega-Sena) contra os resultados oficiais.

## Funcionalidades

- **Entrada de resultados oficiais** para Quina (5 números de 1-80) e Mega-Sena (6 números de 1-60)
- **Upload de jogos via CSV** com suporte a dois formatos:
  - `QUINA,N1,N2,N3,N4,N5` ou `MEGASENA,N1,N2,N3,N4,N5,N6`
  - `N1,N2,N3,N4,N5` (tipo inferido pela quantidade de números)
- **Verificação automática** de acertos para cada jogo
- **Exportação dos resultados** em PNG e PDF

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS (CDN)
- html2canvas + jsPDF (exportação)

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Formato do CSV

Cada linha deve conter um jogo:

```
QUINA,10,25,33,45,78
MEGASENA,5,12,23,34,45,56
10,25,33,45,78
5,12,23,34,45,56
```

Linhas com quantidade inválida de números ou valores fora do intervalo são ignoradas automaticamente.
