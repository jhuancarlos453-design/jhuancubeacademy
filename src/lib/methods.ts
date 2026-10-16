export interface AlgCase { id: string; name: string; desc: string; alg: string; pattern?: string; group?: "OLL" | "PLL" }
export interface Step { id: string; title: string; short: string; desc: string; face: string; cases: AlgCase[] }
export interface Method { id: "layers" | "cfop"; name: string; level: string; steps: Step[] }

// face: 9 chars top-view of the cube illustrating the step. w y r o b g, x = gray
export const METHODS: Method[] = [
  {
    id: "layers", name: "Método de Camadas", level: "Iniciante",
    steps: [
      { id: "l1", title: "Passo 1 · Margarida", short: "Arestas brancas ao redor do amarelo", desc: "Leve as 4 arestas brancas para a face amarela formando uma 'margarida'.", face: "xwxwywxwx",
        cases: [{ id: "l1a", name: "Aresta na camada do meio", desc: "Gire a face lateral para levar a aresta ao topo.", alg: "F" }] },
      { id: "l2", title: "Passo 2 · Cruz Branca", short: "Alinhe as arestas com os centros", desc: "Alinhe cada aresta da margarida com o centro da mesma cor e gire 180° para a face branca.", face: "xwxwwwxwx",
        cases: [{ id: "l2a", name: "Descer aresta", desc: "Com a aresta alinhada ao centro.", alg: "F2" }] },
      { id: "l3", title: "Passo 3 · Cantos Brancos", short: "Complete a primeira camada", desc: "Posicione o canto sob seu lugar e repita o 'sexy move' até encaixar.", face: "wwwwwwwww",
        cases: [{ id: "l3a", name: "Sexy move", desc: "Repita até o canto ficar orientado.", alg: "R U R' U'" }] },
      { id: "l4", title: "Passo 4 · Segunda Camada", short: "Arestas do meio", desc: "Insira as arestas sem amarelo na camada do meio, para a direita ou esquerda.", face: "xxxrrrxxx",
        cases: [
          { id: "l4a", name: "Aresta para a direita", desc: "Aresta precisa ir à direita.", alg: "U R U' R' U' F' U F" },
          { id: "l4b", name: "Aresta para a esquerda", desc: "Aresta precisa ir à esquerda.", alg: "U' L' U L U F U' F'" },
        ] },
      { id: "l5", title: "Passo 5 · Cruz Amarela", short: "Ponto → L → linha → cruz", desc: "Oriente as arestas amarelas do topo formando uma cruz.", face: "xyxyyyxyx",
        cases: [{ id: "l5a", name: "Cruz amarela", desc: "Repita conforme o padrão (ponto, L, linha).", alg: "F R U R' U' F'" }] },
      { id: "l6", title: "Passo 6 · Arestas Amarelas", short: "Permute as arestas", desc: "Alinhe as arestas da cruz com os centros laterais.", face: "xyxyyyxyx",
        cases: [{ id: "l6a", name: "Sune", desc: "Troca arestas adjacentes.", alg: "R U R' U R U2 R'" }] },
      { id: "l7", title: "Passo 7 · Posicionar Cantos", short: "Cantos no lugar certo", desc: "Coloque os cantos amarelos nas posições corretas (ainda que girados).", face: "oyryyybyg",
        cases: [{ id: "l7a", name: "Ciclo de cantos", desc: "Mantém o canto correto em frente-direita.", alg: "U R U' L' U R' U' L" }] },
      { id: "l8", title: "Passo 8 · Orientar Cantos", short: "Finalize o cubo!", desc: "Com o cubo branco para baixo, repita R' D' R D em cada canto até ficar amarelo.", face: "yyyyyyyyy",
        cases: [{ id: "l8a", name: "Orientar canto", desc: "Repita 2 ou 4 vezes por canto.", alg: "R' D' R D" }] },
    ],
  },
  {
    id: "cfop", name: "Método CFOP", level: "Avançado",
    steps: [
      { id: "c1", title: "Cross", short: "Cruz eficiente em até 8 movimentos", desc: "Resolva a cruz na face inferior planejando durante a inspeção.", face: "xwxwwwxwx",
        cases: [{ id: "c1a", name: "Aresta invertida", desc: "Aresta no lugar com orientação errada.", alg: "F' U' R U" }] },
      { id: "c2", title: "F2L", short: "Pares canto-aresta", desc: "Una canto e aresta e insira cada par simultaneamente nas 2 primeiras camadas.", face: "rrrrrrxxx",
        cases: [
          { id: "c2a", name: "F2L 1 · Básico direita", desc: "Par já formado no topo.", alg: "U R U' R'" },
          { id: "c2b", name: "F2L 2 · Básico esquerda", desc: "Par espelhado.", alg: "y' U' L' U L" },
          { id: "c2c", name: "F2L 3 · Separados", desc: "Canto e aresta separados no topo.", alg: "R U2 R' U' R U R'" },
          { id: "c2d", name: "F2L 4 · Canto branco em cima", desc: "Branco olhando para cima.", alg: "R U2 R' U' R U R' U' R U R'" },
        ] },
      { id: "c3", title: "OLL", short: "Oriente a última camada", desc: "Deixe toda a face superior amarela com um algoritmo.", face: "yyyyyyyyy",
        cases: [
          { id: "oll27", group: "OLL", name: "OLL 27 · Sune", desc: "Um canto amarelo, cruz pronta.", alg: "R U R' U R U2 R'", pattern: "010111110" },
          { id: "oll26", group: "OLL", name: "OLL 26 · Antisune", desc: "Espelho do Sune.", alg: "R U2 R' U' R U' R'", pattern: "011111010" },
          { id: "oll21", group: "OLL", name: "OLL 21 · H", desc: "Cruz sem cantos, faróis duplos.", alg: "R U2 R' U' R U R' U' R U' R'", pattern: "010111010" },
          { id: "oll45", group: "OLL", name: "OLL 45 · T", desc: "Formato de T.", alg: "F R U R' U' F'", pattern: "110111110" },
          { id: "oll33", group: "OLL", name: "OLL 33 · Shoelaces", desc: "Formato de cadarço.", alg: "R U R' U' R' F R F'", pattern: "110111011" },
          { id: "oll44", group: "OLL", name: "OLL 44 · P", desc: "Formato de P.", alg: "f R U R' U' f'", pattern: "110110111" },
          { id: "oll2", group: "OLL", name: "OLL 2 · Ponto", desc: "Apenas o centro amarelo.", alg: "F R U R' U' F' f R U R' U' f'", pattern: "000010000" },
        ] },
      { id: "c4", title: "PLL", short: "Permute a última camada", desc: "Posicione as peças da última camada para concluir o cubo.", face: "rgobybgro",
        cases: [
          { id: "pllua", group: "PLL", name: "PLL Ua", desc: "Ciclo de 3 arestas (anti-horário).", alg: "R U' R U R U R U' R' U' R2" },
          { id: "pllub", group: "PLL", name: "PLL Ub", desc: "Ciclo de 3 arestas (horário).", alg: "R2 U R U R' U' R' U' R' U R'" },
          { id: "pllt", group: "PLL", name: "PLL T", desc: "Troca 2 cantos e 2 arestas.", alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: "pllh", group: "PLL", name: "PLL H", desc: "Troca arestas opostas.", alg: "M2 U M2 U2 M2 U M2" },
          { id: "pllz", group: "PLL", name: "PLL Z", desc: "Troca arestas adjacentes.", alg: "M' U M2 U M2 U M' U2 M2" },
          { id: "pllaa", group: "PLL", name: "PLL Aa", desc: "Ciclo de 3 cantos.", alg: "x R' U R' D2 R U' R' D2 R2 x'" },
          { id: "pllj", group: "PLL", name: "PLL Jb", desc: "Bloco 1x2x3 com troca.", alg: "R U R' F' R U R' U' R' F R2 U' R'" },
        ] },
    ],
  },
];

export const ALL_CASES = METHODS.flatMap((m) => m.steps.flatMap((s) => s.cases.map((c) => ({ ...c, method: m.name, step: s.title }))));
export const QUIZ_CASES = ALL_CASES.filter((c) => c.group);
