import apiClient from '../apiClient';

// Fetch all speakers
export const fetchSpeakers = async () => {
  const response = await apiClient.get('/speakers');
  return response.data;
};

// Get a single speaker
export const fetchSpeakerById = async (speakerId: string) => {
  const response = await apiClient.get(`/speakers/${speakerId}`);
  return response.data;
};

// Create a new speaker
export const createSpeaker = async (speakerData: any) => {
  const response = await apiClient.post('/speakers', speakerData);
  return response.data;
};

// Update a speaker
export const updateSpeaker = async (speakerId: string, speakerData: any) => {
  const response = await apiClient.put(`/speakers/${speakerId}`, speakerData);
  return response.data;
};

// Delete a speaker
export const deleteSpeaker = async (speakerId: string) => {
  await apiClient.delete(`/speakers/${speakerId}`);
};
