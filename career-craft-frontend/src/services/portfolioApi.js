import api from './api';

// Get portfolio summary
export const getPortfolioSummary = async () => {
  const response = await api.get('/portfolio/summary');
  return response.data;
};

// Get detailed portfolio
export const getDetailedPortfolio = async () => {
  console.log('Calling API: /portfolio/detailed');
  const response = await api.get('/portfolio/detailed');
  console.log('API Response:', response);
  return response.data;
};

// Update portfolio goals
export const updatePortfolioGoals = async (goals) => {
  console.log('Calling API: PUT /portfolio/goals');
  console.log('Goals payload:', { goals });
  const response = await api.put('/portfolio/goals', { goals });
  console.log('Update API Response:', response);
  return response.data;
};
