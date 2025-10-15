// data.js - repositório de dados mockados para o protótipo do Portal do Cliente

export const mockUsers = [
  {
    id: 'titular-001',
    role: 'titular',
    nome: 'Marina Costa',
    codigoReserva: 'TRK-78421',
    senha: 'trek2024',
    roteiro: {
      nome: 'Travessia Serra do Mar',
      data: '2024-11-12',
      status: 'Confirmado',
      participantes: 6,
      resumo: 'Expedição de 4 dias atravessando trilhas históricas, com pernoites em abrigo e vivências culturais.',
      ebook: 'Guia completo da Travessia Serra do Mar'
    }
  },
  {
    id: 'acompanhante-002',
    role: 'acompanhante',
    nome: 'Lucas Prado',
    codigoReserva: 'TRK-78421',
    senha: 'amigo2024',
    roteiro: {
      nome: 'Travessia Serra do Mar',
      data: '2024-11-12',
      status: 'Confirmado',
      participantes: 6,
      resumo: 'Expedição compartilhada com foco em segurança, contemplação da natureza e desafios moderados.',
      ebook: 'Guia do participante convidado'
    }
  }
];

export const mockDocuments = {
  'TRK-78421': [
    { id: 'voucher', nome: 'Voucher de Embarque', tipo: 'PDF', disponivel: true },
    { id: 'contrato', nome: 'Contrato Digital', tipo: 'PDF', disponivel: true },
    { id: 'certificado', nome: 'Certificado de Conclusão', tipo: 'PDF', disponivel: false },
    { id: 'ebook', nome: 'E-book da Travessia', tipo: 'PDF', disponivel: true }
  ]
};

export const mockBoarding = {
  'TRK-78421': {
    local: 'Terminal Rodoviário Tietê',
    endereco: 'Av. Cruzeiro do Sul, 1800 - Santana, São Paulo - SP',
    referencia: 'Ponto de encontro ao lado da bilheteria 12',
    dataHora: '12/11/2024 - 05h30',
    observacoes: [
      'Chegar com 40 minutos de antecedência',
      'Trazer documento original com foto',
      'Bagagem etiquetada com nome e telefone'
    ]
  }
};

export const mockTrailControl = {
  rota: {
    nomeArquivo: 'Rota-Serra-do-Mar.gpx',
    distanciaTotalKm: 48,
    alertaDistanciaMetros: 250
  },
  participantes: [
    { id: 'g1', nome: 'Marina Costa', papel: 'Guia Principal', status: 'movimento', distancia: 0, tempoEstimado: '—', ultimaPosicao: 'KM 0, base' },
    { id: 'g2', nome: 'Joana Nogueira', papel: 'Guia Auxiliar', status: 'movimento', distancia: 0.1, tempoEstimado: '—', ultimaPosicao: 'KM 0, base' },
    { id: 'p1', nome: 'Lucas Prado', papel: 'Participante', status: 'movimento', distancia: 0.2, tempoEstimado: '5 min', ultimaPosicao: 'KM 0, base' },
    { id: 'p2', nome: 'Renata Souza', papel: 'Participante', status: 'parado', distancia: 0.25, tempoEstimado: '8 min', ultimaPosicao: 'KM 0, base' },
    { id: 'p3', nome: 'Eduardo Silva', papel: 'Participante', status: 'fora-rota', distancia: 0.35, tempoEstimado: '12 min', ultimaPosicao: 'KM 0, base' }
  ],
  historicoAlertas: [
    { id: 'alert-1', tipo: 'distancia', descricao: 'Eduardo está a 280m do grupo', severidade: 'alto', horario: '05:05' },
    { id: 'alert-2', tipo: 'ritmo', descricao: 'Renata sinalizou cansaço', severidade: 'moderado', horario: '05:12' }
  ]
};

export const mockWeather = {
  destino: 'Parque Estadual Serra do Mar',
  previsao: {
    maxima: 24,
    minima: 12,
    umidade: 82,
    vento: 18,
    probabilidadeChuva: 60,
    faseLua: 'Quarto Crescente'
  },
  tendenciaHoras: [
    { hora: '06h', temp: 13 },
    { hora: '09h', temp: 18 },
    { hora: '12h', temp: 22 },
    { hora: '15h', temp: 24 },
    { hora: '18h', temp: 20 },
    { hora: '21h', temp: 16 }
  ],
  comentarioGuia: 'A serra amanhece úmida e fresca. Mantenha camadas leves, capa de chuva acessível e atenção ao vento constante nos cumes.'
};

export const chatKnowledgeBase = {
  portal: [
    {
      pergunta: /documentos|voucher|contrato/i,
      resposta: 'Seus documentos estão na aba Documentos. Toque em "Voucher", "Contrato" ou "E-book" para simular o download. O certificado fica disponível após o evento finalizado.'
    },
    {
      pergunta: /embarque|onde encontro/i,
      resposta: 'O embarque acontece no Terminal Tietê, ao lado da bilheteria 12. Use o botão "Ver mapa" para visualizar o ponto de encontro.'
    },
    {
      pergunta: /horário|partida/i,
      resposta: 'O horário de encontro é às 05h30. Chegue com 40 minutos de antecedência para briefing e conferência de equipamentos.'
    }
  ],
  trivial: [
    {
      pergunta: /clima|tempo/i,
      resposta: 'Acesse o módulo "Clima" para ver a previsão completa, incluindo temperatura, umidade e ventos. Lá também há interpretação do guia.'
    },
    {
      pergunta: /ebook|materiais/i,
      resposta: 'O e-book com checklist e dicas está disponível em Documentos. Recomendamos baixar e salvar offline antes da viagem.'
    }
  ],
  critico: [
    {
      pergunta: /ajuda|socorro|perdido/i,
      resposta: 'Fique onde está, acione o alerta no módulo de Trilha e mantenha contato visual ou sonoro com a equipe. Enviamos um alerta ao time de apoio.'
    },
    {
      pergunta: /acidente|machuquei/i,
      resposta: 'Sente-se em local seguro, sinalize a equipe com o botão vermelho e aguarde orientação. Nossa equipe de apoio foi alertada.'
    }
  ]
};

export const quickResponses = [
  { id: 'ok', label: '🟢 Estou bem', descricao: 'Confirma que está tudo bem e mantém ritmo atual.' },
  { id: 'tired', label: '🟠 Estou cansado', descricao: 'Sugere reduzir ritmo e avaliar pausa estratégica.' },
  { id: 'help', label: '🔴 Preciso de ajuda', descricao: 'Envia alerta imediato para o guia e equipe de suporte.' }
];