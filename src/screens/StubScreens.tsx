import React from 'react';
import StubScreenTemplate from './StubScreenTemplate';

export const DetailedAnalysisScreen: React.FC = () => (
    <StubScreenTemplate
        icon="📊"
        title="Detailed Analysis"
        description="Comprehensive sleep metrics and trends will appear here"
    />
);

export const InsightsScreen: React.FC = () => (
    <StubScreenTemplate
        icon="💡"
        title="Insights"
        description="Personalized sleep recommendations and tips"
    />
);

export const WeeklyReportScreen: React.FC = () => (
    <StubScreenTemplate
        icon="📈"
        title="Weekly Report"
        description="Your sleep trends and patterns for the week"
    />
);

export const ExperimentsScreen: React.FC = () => (
    <StubScreenTemplate
        icon="🧪"
        title="Experiments"
        description="Track sleep experiments and interventions"
    />
);

export const SleepPredictionScreen: React.FC = () => (
    <StubScreenTemplate
        icon="🔮"
        title="Sleep Prediction"
        description="AI-powered sleep quality forecasting"
    />
);

export const ProfileScreen: React.FC = () => (
    <StubScreenTemplate
        icon="👤"
        title="Profile"
        description="Edit your personal information and preferences"
    />
);
