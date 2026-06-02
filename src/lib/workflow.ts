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
  clientWeek: string;    // label externo (portal do cliente — bate com o que foi vendido)
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
  {
    id: "s0",
    week: "Setup",
    clientWeek: "Semana 1",
    clientTitle: "Reunião de Kick-Off",
    title: "Onboarding",
    objective: "Cadastrar cliente e configurar workspace",
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    skills: [
      {
        id: "ee-novo-cliente",
        name: "Novo Cliente",
        time: "30 min",
        dependencies: [],
        deliverables: ["client.json", "research.md", "Estrutura de pastas"],
        description: "Cadastra cliente, puxa dados V4MOS, cria briefing interativo",
      },
      {
        id: "ee-onboarding",
        name: "Setup Workspace",
        time: "15 min",
        dependencies: [],
        deliverables: ["Diretórios configurados", "Ambiente pronto"],
        description: "Configura diretórios e ensina o operador a usar o sistema",
      },
    ],
  },
  {
    id: "s1",
    week: "Semana 1",
    clientWeek: "Semana 2",
    clientTitle: "Diagnóstico de Marketing",
    title: "Diagnóstico Estratégico",
    objective: "Construir a base estratégica. Tudo downstream depende da S1 ser precisa.",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    skills: [
      {
        id: "ee-s1-diagnostico-maturidade",
        name: "Maturidade Digital",
        time: "30–45 min",
        dependencies: [],
        deliverables: ["Score 0-100 por pilar", "Benchmark vs setor", "Lista de prioridades"],
        description: "Diagnóstico de maturidade digital com score por pilar (Mídia, Criativos, CRO, CRM, SEO)",
      },
      {
        id: "ee-s1-persona-icp",
        name: "Persona & ICP",
        time: "45–60 min",
        dependencies: [],
        deliverables: ["Perfil ICP", "Persona completa", "3 opções de mensagem-chave"],
        description: "Cria o ICP e Persona usando framework JTBD",
      },
      {
        id: "ee-s1-swot",
        name: "Matriz SWOT",
        time: "30–45 min",
        dependencies: ["ee-s1-diagnostico-maturidade"],
        deliverables: ["4-6 itens por quadrante", "Síntese estratégica", "5-7 ações prioritárias"],
        description: "SWOT completa e acionável cruzando dados do diagnóstico",
      },
      {
        id: "ee-s1-auditoria-comunicacao",
        name: "Auditoria de Comunicação",
        time: "45–75 min",
        dependencies: ["ee-s1-persona-icp"],
        deliverables: ["Score por canal", "Matriz de gaps", "Top 3 problemas", "Quick wins"],
        description: "Audita todos os pontos de contato digitais (site, Instagram, anúncios, GMB, WhatsApp)",
      },
    ],
  },
  {
    id: "s2",
    week: "Semana 2",
    clientWeek: "Semana 3",
    clientTitle: "Diagnóstico Comercial",
    title: "Pesquisa & Posicionamento",
    objective: "Validar oportunidade de mercado e definir posição exata do cliente.",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    skills: [
      {
        id: "ee-s2-pesquisa-mercado",
        name: "Pesquisa de Mercado",
        time: "3h",
        dependencies: ["ee-s1-persona-icp"],
        deliverables: ["TAM/SAM/SOM", "Análise de 3-5 concorrentes", "Mapa 2x2", "Tendências"],
        description: "Pesquisa completa com TAM/SAM/SOM, análise competitiva e diferenciais reais",
      },
      {
        id: "ee-s2-posicionamento",
        name: "Canvas de Posicionamento",
        time: "2.5h",
        dependencies: ["ee-s2-pesquisa-mercado", "ee-s1-persona-icp", "ee-s1-swot"],
        deliverables: ["3 statements de posicionamento", "PUV final", "Canvas 4Ps", "3 taglines"],
        description: "Canvas estratégico completo: PUV, 4Ps, território de marca e taglines",
      },
      {
        id: "ee-s2-diagnostico-midia",
        name: "Diagnóstico de Mídia",
        time: "2h",
        dependencies: [],
        deliverables: ["Métricas vs benchmarks", "Top 3 problemas", "Plano de ação 30 dias"],
        description: "Diagnóstico de mídia paga com métricas atuais vs benchmarks",
      },
      {
        id: "ee-s2-diagnostico-criativos",
        name: "Diagnóstico de Criativos",
        time: "2h",
        dependencies: ["ee-s1-persona-icp"],
        deliverables: ["Análise multimodal", "Matriz de performance", "Padrões de concorrentes"],
        description: "Diagnóstico com análise multimodal de criativos e benchmarks",
      },
      {
        id: "ee-s2-diagnostico-cro",
        name: "Diagnóstico CRO",
        time: "2h",
        dependencies: [],
        deliverables: ["Auditoria do funil", "Stack tech", "Roadmap CRO", "Wireframes"],
        description: "Diagnóstico de CRO: análise técnica, auditoria de copy, hipóteses de teste",
      },
    ],
  },
  {
    id: "s3",
    week: "Semana 3",
    clientWeek: "Semana 4–5",
    clientTitle: "Planejamento de Marketing e Vendas + Materiais Criativos",
    title: "Produção de Marca & Marketing",
    objective: "Produzir todos os entregáveis de marketing prontos para execução.",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    skills: [
      {
        id: "ee-s3-identidade-visual",
        name: "Identidade Visual",
        time: "3h",
        dependencies: ["ee-s2-posicionamento"],
        deliverables: ["Paleta de cores", "Tipografia (H1-H6)", "Diretrizes de forma", "Regras de marca"],
        description: "Conceito estratégico de identidade visual: paleta, tipografia e diretrizes",
      },
      {
        id: "ee-s3-brandbook",
        name: "Brandbook",
        time: "4h",
        dependencies: ["ee-s2-posicionamento", "ee-s1-persona-icp"],
        deliverables: ["Propósito", "Identidade verbal", "Narrativa 3 atos", "30+ headlines", "5 CTAs"],
        description: "Brandbook completo: propósito, identidade verbal, narrativa e banco de copy",
      },
      {
        id: "ee-s3-landing-page",
        name: "Landing Page",
        time: "6h",
        dependencies: ["ee-s2-posicionamento", "ee-s3-brandbook", "ee-s2-diagnostico-cro"],
        deliverables: ["Copy completa por seção", "Código React+Tailwind", "Deploy no Vercel"],
        description: "Landing page de conversão: copy completa + código React + deploy no Vercel",
      },
      {
        id: "ee-s3-copy-anuncios",
        name: "Copy de Anúncios",
        time: "2h",
        dependencies: ["ee-s3-brandbook", "ee-s1-persona-icp", "ee-s2-posicionamento"],
        deliverables: ["30+ variações Meta + Google", "Por estágio do funil", "Google Sheets"],
        description: "Gera 30+ variações de copy para Meta Ads e Google Ads",
      },
      {
        id: "ee-s3-criativos-anuncios",
        name: "Brief de Criativos",
        time: "3h",
        dependencies: ["ee-s1-persona-icp", "ee-s2-posicionamento"],
        deliverables: ["5 variações com hooks", "Prompts Midjourney/Ideogram", "Direção visual"],
        description: "Briefing criativo para anúncios com 5 variações e prompts de IA",
      },
      {
        id: "ee-s3-crm-setup",
        name: "Setup CRM",
        time: "3h",
        dependencies: ["ee-s1-persona-icp"],
        deliverables: ["Pipeline Kommo", "Réguas de boas-vindas", "Scoring rules"],
        description: "Configura CRM Kommo com pipeline, réguas e testa com lead fictício",
      },
      {
        id: "ee-s3-forecast-midia",
        name: "Forecast de Mídia",
        time: "3h",
        dependencies: ["ee-s2-diagnostico-midia", "ee-s1-persona-icp"],
        deliverables: ["Budget 3 meses", "Distribuição por plataforma", "KPIs por etapa"],
        description: "Forecast de mídia de 3 meses: modelagem financeira e distribuição por plataforma",
      },
      {
        id: "ee-s3-gmb-otimizacao",
        name: "Otimização GMB",
        time: "2h",
        dependencies: ["ee-s1-persona-icp"],
        deliverables: ["Descrição SEO", "Categorias", "Posts", "Q&As"],
        description: "Otimiza perfil do Google Meu Negócio com descrição SEO e posts",
      },
    ],
  },
  {
    id: "s4",
    week: "Semana 4",
    clientWeek: "Semana 3",
    clientTitle: "Diagnóstico Comercial",
    title: "Operações de Vendas",
    objective: "Mapear o funil de vendas e testar o processo antes de automatizar com SDR IA.",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    requiresModuloVendas: true,
    skills: [
      {
        id: "ee-s4-diagnostico-comercial",
        name: "Diagnóstico Comercial",
        time: "2h",
        dependencies: ["ee-s1-persona-icp"],
        deliverables: ["Taxas do funil vs benchmarks", "Mapa de objeções", "Critérios de qualificação", "5 ações comerciais"],
        description: "Diagnóstico completo do funil de vendas com taxas, objeções e qualificação",
      },
      {
        id: "ee-s4-cliente-oculto",
        name: "Cliente Oculto",
        time: "3h",
        dependencies: ["ee-s4-diagnostico-comercial"],
        deliverables: ["Perfil de comprador fictício", "Análise da conversa real", "Recomendações de processo"],
        description: "Simulação de cliente oculto: testa o processo real de vendas e identifica fricções",
      },
    ],
  },
  {
    id: "s5",
    week: "Semana 5",
    clientWeek: "Semana 5",
    clientTitle: "Automação SDR IA — Próximo Passo",
    title: "Automação SDR IA",
    objective: "Implantar SDR IA no WhatsApp com qualificação inteligente e integração com CRM.",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    requiresModuloVendas: true,
    skills: [
      {
        id: "ee-s5-scripts-sdr",
        name: "Scripts do SDR",
        time: "3h",
        dependencies: ["ee-s4-diagnostico-comercial", "ee-s3-brandbook"],
        deliverables: ["Mensagens de boas-vindas", "Fluxo de qualificação", "Respostas por score", "Sequência de follow-up"],
        description: "Scripts completos do SDR IA para WhatsApp: qualificação, objeções e follow-up",
      },
      {
        id: "ee-s5-sdr-ia-config",
        name: "Config SDR IA",
        time: "4h",
        dependencies: ["ee-s5-scripts-sdr", "ee-s3-crm-setup"],
        deliverables: ["Agente Patagon configurado", "Integração Kommo live", "5 cenários testados", "Checklist de go-live"],
        description: "Configuração do SDR IA no Patagon + integração Kommo + testes e go-live",
      },
    ],
  },
];

export const ALL_SKILLS = STAGES.flatMap((s) => s.skills);

export function getStagesForClient(moduloVendas: boolean): Stage[] {
  return STAGES.filter((s) => !s.requiresModuloVendas || moduloVendas);
}
