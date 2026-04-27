import React from 'react';
import StubScreenTemplate from './StubScreenTemplate';

export const DetailedAnalysisScreen: React.FC = () => (
  <StubScreenTemplate
    icon="chart"
    title="Análise detalhada"
    description="Visualização aprofundada de padrões, variações e fatores que afetam seu sono."
  />
);

export const InsightsScreen: React.FC = () => (
  <StubScreenTemplate
    icon="brain"
    title="Insights personalizados"
    description="Recomendações orientadas por dados para melhorar consistência e recuperação."
  />
);

export const ExperimentsScreen: React.FC = () => (
  <StubScreenTemplate
    icon="flame"
    title="Experimentos"
    description="Teste hipóteses de rotina e compare impacto ao longo das semanas."
  />
);

export const SleepPredictionScreen: React.FC = () => (
  <StubScreenTemplate
    icon="trendUp"
    title="Previsão de sono"
    description="Estimativa da próxima noite com base no histórico recente e tendências atuais."
  />
);
