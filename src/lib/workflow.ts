export type SkillStatus = "pending" | "in_progress" | "done" | "blocked";

export interface Skill {
  id: string;
  name: string;
  time: string;
  dependencies: string[];
  deliverables: string[];
  description: string;
}

export interface Stage {
  id: string;
  week: string;          // label interno (operacional)
  clientWeek: string;    // label externo (portal do cliente)
  clientTitle: string;   // título externo
  title: string;
  objective: string;
  color: string;
  bg: string;
  border: string;
  skills: Skill[];
  requiresModuloVendas?: boolean;
}

export const STAGES: Stage[] = [
  // ─────────────────────────────────────────────────────────────
  // SEMANA 1 — GC + Kickoff
  // ─────────────────────────────────────────────────────────────
  {
    id: "s1",
    week: "Semana 1",
    clientWeek: "Semana 1",
    clientTitle: "GC + Kickoff",
    title: "GC + Kickoff",
    objective: "Alinhar expectativas, coletar briefing completo e preparar o time para a execução.",
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    skills: [
      {
        id: "ee-s1-gc",
        name: "Reunião de GC",
        time: "1h",
        dependencies: [],
        deliverables: ["Briefing preenchido", "Acesso às plataformas", "Cronograma confirmado"],
        description: "Reunião de alinhamento com o cliente (Gerência de Conta) — define expectativas, coleta acessos e valida o escopo contratado.",
      },
      {
        id: "ee-s1-kickoff",
        name: "Kickoff",
        time: "1h",
        dependencies: ["ee-s1-gc"],
        deliverables: ["Apresentação de kickoff", "Times alinhados", "Plano de 45 dias"],
        description: "Reunião de kick-off com o cliente: apresenta a metodologia, o cronograma das 5 semanas e os entregáveis.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // SEMANA 2 — Diagnóstico de Marketing
  // ─────────────────────────────────────────────────────────────
  {
    id: "s2",
    week: "Semana 2",
    clientWeek: "Semana 2",
    clientTitle: "Diagnóstico de Marketing",
    title: "Diagnóstico de Marketing",
    objective: "Mapear a situação atual de marketing, branding, criativos, social media e site do cliente.",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    skills: [
      {
        id: "ee-s2-diagnostico-branding",
        name: "Diagnóstico de Branding",
        time: "2h",
        dependencies: [],
        deliverables: ["Score de brand equity", "Gaps de identidade", "Recomendações visuais"],
        description: "Avalia posicionamento de marca, identidade visual, tom de voz e consistência de branding.",
      },
      {
        id: "ee-s2-diagnostico-criativos",
        name: "Diagnóstico de Criativos",
        time: "2h",
        dependencies: ["ee-s2-diagnostico-branding"],
        deliverables: ["Análise multimodal", "Matriz de performance", "Padrões dos concorrentes"],
        description: "Diagnóstico com análise dos criativos atuais — qualidade, consistência, performance e benchmarks.",
      },
      {
        id: "ee-s2-benchmarking-criativos",
        name: "Benchmarking",
        time: "2h",
        dependencies: ["ee-s2-diagnostico-criativos"],
        deliverables: ["Top 3 referências do setor", "Gap analysis criativo", "Oportunidades identificadas"],
        description: "Benchmarking de criativos vs. 3 principais concorrentes do setor.",
      },
      {
        id: "ee-s2-diagnostico-social-media",
        name: "Diagnóstico de Social Media",
        time: "2h",
        dependencies: [],
        deliverables: ["Score por canal", "Frequência x engajamento", "Lacunas de conteúdo"],
        description: "Audita todos os canais orgânicos: Instagram, LinkedIn, Facebook, TikTok — frequência, engajamento e qualidade.",
      },
      {
        id: "ee-s2-benchmarking-social-media",
        name: "Benchmarking de Social Media",
        time: "2h",
        dependencies: ["ee-s2-diagnostico-social-media"],
        deliverables: ["Comparativo com 3 concorrentes", "Melhores práticas", "Conteúdos de referência"],
        description: "Compara os canais orgânicos do cliente com os 3 principais concorrentes.",
      },
      {
        id: "ee-s2-analise-site",
        name: "Análise de Site / LP",
        time: "3h",
        dependencies: [],
        deliverables: ["Auditoria técnica + UX", "Mapa de calor (estimado)", "Top 5 pontos de fricção"],
        description: "Análise completa do site ou landing page: copy, CRO, velocidade, mobile, SEO on-page e UX.",
      },
      {
        id: "ee-s2-benchmarking-site",
        name: "Benchmarking de Site",
        time: "2h",
        dependencies: ["ee-s2-analise-site"],
        deliverables: ["Análise de 3 sites concorrentes", "Comparativo de CRO", "Quick wins"],
        description: "Compara o site do cliente com os 3 principais concorrentes: copy, conversão e UX.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // SEMANA 3 — Diagnóstico Comercial
  // ─────────────────────────────────────────────────────────────
  {
    id: "s3",
    week: "Semana 3",
    clientWeek: "Semana 3",
    clientTitle: "Diagnóstico Comercial",
    title: "Diagnóstico Comercial",
    objective: "Mapear o processo comercial completo — funil, jornada, métricas, ferramentas e pontos de fricção.",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    skills: [
      {
        id: "ee-s3-cliente-oculto",
        name: "Cliente Oculto",
        time: "3h",
        dependencies: [],
        deliverables: ["Perfil de comprador fictício", "Análise da conversa real", "Recomendações de processo"],
        description: "Simulação de cliente oculto: testa o processo real de vendas e identifica fricções.",
      },
      {
        id: "ee-s3-estrutura-topologica",
        name: "Estrutura Topológica",
        time: "2h",
        dependencies: [],
        deliverables: ["Mapa do processo comercial", "Times e responsabilidades", "Gargalos identificados"],
        description: "Mapeia a estrutura do time comercial: quem faz o quê, como se comunica e onde há gargalos.",
      },
      {
        id: "ee-s3-escopo-comercial",
        name: "Escopo Comercial",
        time: "1.5h",
        dependencies: ["ee-s3-estrutura-topologica"],
        deliverables: ["Definição do escopo de vendas", "Produtos/serviços priorizados", "Metas e contexto"],
        description: "Define o escopo comercial: produtos foco, metas de vendas e contexto competitivo.",
      },
      {
        id: "ee-s3-jornada-cliente",
        name: "Etapas da Jornada do Cliente",
        time: "2h",
        dependencies: ["ee-s3-escopo-comercial"],
        deliverables: ["Mapa da jornada completo", "Touchpoints por etapa", "Objeções por fase"],
        description: "Mapeia todas as etapas da jornada do cliente: da consciência à recompra.",
      },
      {
        id: "ee-s3-metricas-comercial",
        name: "Métricas do Comercial",
        time: "2h",
        dependencies: ["ee-s3-jornada-cliente"],
        deliverables: ["Taxas do funil vs benchmarks", "KPIs prioritários", "Mapa de objeções"],
        description: "Levanta e analisa as métricas do funil comercial: conversão, ciclo, ticket, CAC e LTV.",
      },
      {
        id: "ee-s3-stack-ferramentas",
        name: "Stack de Ferramentas",
        time: "1.5h",
        dependencies: [],
        deliverables: ["Inventário de ferramentas", "Gaps de stack", "Recomendações"],
        description: "Inventaria o stack comercial atual (CRM, WhatsApp, automações) e identifica gaps.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // SEMANA 4 — Planejamento de Marketing e Vendas
  // ─────────────────────────────────────────────────────────────
  {
    id: "s4",
    week: "Semana 4",
    clientWeek: "Semana 4",
    clientTitle: "Planejamento de Marketing e Vendas",
    title: "Planejamento de Marketing e Vendas",
    objective: "Construir o planejamento estratégico completo: mercado, posicionamento, estratégias de aquisição e plano de mídia.",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    skills: [
      {
        id: "ee-s4-analise-submercados",
        name: "Análise de Submercados",
        time: "2h",
        dependencies: [],
        deliverables: ["Mapa de submercados", "Priorização de nichos", "Oportunidades por segmento"],
        description: "Identifica e analisa submercados relevantes para o cliente — nichos, sazonalidade e potencial.",
      },
      {
        id: "ee-s4-tam-sam-som",
        name: "Dimensionamento TAM/SAM/SOM",
        time: "3h",
        dependencies: ["ee-s4-analise-submercados"],
        deliverables: ["TAM, SAM, SOM calculados", "Metodologia documentada", "Potencial de receita"],
        description: "Dimensiona o mercado endereçável: Total (TAM), Disponível (SAM) e Obtível (SOM).",
      },
      {
        id: "ee-s4-swot",
        name: "Análise SWOT",
        time: "2h",
        dependencies: ["ee-s4-tam-sam-som"],
        deliverables: ["4-6 itens por quadrante", "Síntese estratégica", "5-7 ações prioritárias"],
        description: "SWOT completa e acionável cruzando diagnósticos de marketing, comercial e mercado.",
      },
      {
        id: "ee-s4-comparacao-concorrentes",
        name: "Comparação com o Mercado",
        time: "3h",
        dependencies: ["ee-s4-swot"],
        deliverables: ["Análise de 4 concorrentes", "Matriz comparativa", "Gaps e oportunidades"],
        description: "Análise detalhada dos 4 principais concorrentes: posicionamento, preço, canal e comunicação.",
      },
      {
        id: "ee-s4-posicionamento-puv",
        name: "Posicionamento Estratégico + PUV",
        time: "3h",
        dependencies: ["ee-s4-comparacao-concorrentes", "ee-s4-swot"],
        deliverables: ["3 statements de posicionamento", "PUV final", "Território de marca", "3 taglines"],
        description: "Define o posicionamento estratégico e cria a Proposta Única de Valor (PUV).",
      },
      {
        id: "ee-s4-estrategias-aquisicao",
        name: "3 Estratégias de Aquisição",
        time: "2h",
        dependencies: ["ee-s4-posicionamento-puv"],
        deliverables: ["3 estratégias ranqueadas", "Canal, investimento e meta por estratégia"],
        description: "Define 3 estratégias de aquisição de novos clientes com canal, investimento e projeção.",
      },
      {
        id: "ee-s4-estrategias-engajamento",
        name: "3 Estratégias de Engajamento",
        time: "2h",
        dependencies: ["ee-s4-posicionamento-puv"],
        deliverables: ["3 estratégias de engajamento", "Mecânicas e KPIs"],
        description: "Define 3 estratégias de engajamento de leads e clientes ativos.",
      },
      {
        id: "ee-s4-estrategias-monetizacao",
        name: "3 Estratégias de Monetização",
        time: "2h",
        dependencies: ["ee-s4-posicionamento-puv"],
        deliverables: ["3 estratégias de monetização", "Projeção de receita incremental"],
        description: "Define 3 estratégias para aumentar o ticket médio e receita por cliente.",
      },
      {
        id: "ee-s4-estrategias-retencao",
        name: "3 Estratégias de Retenção",
        time: "2h",
        dependencies: ["ee-s4-posicionamento-puv"],
        deliverables: ["3 estratégias de retenção", "Régua de relacionamento", "Métricas de churn"],
        description: "Define 3 estratégias para reduzir churn e aumentar o LTV dos clientes.",
      },
      {
        id: "ee-s4-drawflow",
        name: "Drawflow",
        time: "3h",
        dependencies: [
          "ee-s4-estrategias-aquisicao",
          "ee-s4-estrategias-engajamento",
          "ee-s4-estrategias-monetizacao",
          "ee-s4-estrategias-retencao",
        ],
        deliverables: ["Fluxograma completo do funil", "Automações mapeadas", "Integrações necessárias"],
        description: "Mapeia o fluxo completo de marketing e vendas: do lead ao cliente fidelizado (Drawflow/Miro).",
      },
      {
        id: "ee-s4-diagnostico-midia-paga",
        name: "Diagnóstico de Mídia Paga",
        time: "2h",
        dependencies: [],
        deliverables: ["Métricas vs benchmarks", "Top 3 problemas", "Plano de ação 30 dias"],
        description: "Diagnóstico de mídia paga com métricas atuais vs benchmarks do setor.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // SEMANA 5 — Entregáveis
  // ─────────────────────────────────────────────────────────────
  {
    id: "s5",
    week: "Semana 5",
    clientWeek: "Semana 5",
    clientTitle: "Entregáveis",
    title: "Entregáveis",
    objective: "Apresentar todos os materiais finais, coletar feedback e definir os próximos passos.",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    skills: [
      {
        id: "ee-s5-identidade-visual",
        name: "Manual de Identidade Visual",
        time: "4h",
        dependencies: ["ee-s4-posicionamento-puv"],
        deliverables: ["Paleta de cores", "Tipografia", "Diretrizes de uso", "Exemplos aplicados"],
        description: "Apresentação do Manual de Identidade Visual: paleta, tipografia, logotipo e diretrizes.",
      },
      {
        id: "ee-s5-manual-copy",
        name: "Manual de Copy",
        time: "3h",
        dependencies: ["ee-s4-posicionamento-puv"],
        deliverables: ["Identidade verbal", "Banco de headlines", "Mensagem-chave", "Tom de voz"],
        description: "Apresentação do Manual de Copy: identidade verbal, mensagens-chave e banco de textos.",
      },
      {
        id: "ee-s5-criativos",
        name: "3 Criativos (2 Estáticos + 1 Carrossel)",
        time: "4h",
        dependencies: ["ee-s5-identidade-visual", "ee-s5-manual-copy"],
        deliverables: ["2 criativos estáticos", "1 carrossel", "Brief para o time de design"],
        description: "Apresentação de 3 criativos para anúncios: 2 estáticos e 1 carrossel com direção visual.",
      },
      {
        id: "ee-s5-landing-page",
        name: "Landing Page",
        time: "6h",
        dependencies: ["ee-s5-identidade-visual", "ee-s5-manual-copy"],
        deliverables: ["Copy completa por seção", "Código React + Tailwind", "Deploy no Vercel"],
        description: "Apresentação da landing page de conversão: copy + código React + deploy.",
      },
      {
        id: "ee-s5-proximos-passos",
        name: "Próximos Passos",
        time: "1h",
        dependencies: [],
        deliverables: ["Plano de ação 90 dias", "Responsáveis", "KPIs de acompanhamento"],
        description: "Apresentação dos próximos passos: plano de ação 90 dias, responsáveis e KPIs.",
      },
      {
        id: "ee-s5-feedback",
        name: "Coleta de Feedback / Análise",
        time: "1h",
        dependencies: ["ee-s5-proximos-passos"],
        deliverables: ["Formulário de NPS", "Resumo de feedbacks", "Ajustes identificados"],
        description: "Coleta e analisa o feedback do cliente sobre os entregáveis e o processo.",
      },
      {
        id: "ee-s5-proposta-comercial",
        name: "Proposta Comercial",
        time: "2h",
        dependencies: ["ee-s5-feedback"],
        deliverables: ["Proposta de continuidade", "Escopo e investimento", "Projeção de resultados"],
        description: "Apresentação da proposta comercial de continuidade: escopo, investimento e ROI projetado.",
      },
    ],
  },
];

export const ALL_SKILLS = STAGES.flatMap((s) => s.skills);

export function getStagesForClient(moduloVendas: boolean): Stage[] {
  return STAGES.filter((s) => !s.requiresModuloVendas || moduloVendas);
}
