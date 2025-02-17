import apiClient from '../apiClient';

interface ProgrammeType {
  name: string,
  day_number: number,
  date: string,
  start_datetime: string,
  end_datetime: string,
  venue: string,
}

// Fetch all programmes
export const fetchProgrammes = async () => {
  const response = await apiClient.get('/programmes');
  return response.data;
};

// Get a single programme
export const fetchProgrammeById = async (programmeId: string) => {
  const response = await apiClient.get(`/programmes/${programmeId}`);
  return response.data;
};

// Create a new programme
export const createProgramme = async (programmeData: ProgrammeType) => {
  const response = await apiClient.post('/programmes', programmeData);
  return response.data;
};

// Update a programme
export const updateProgramme = async ({ programmeId, programmeData }: { programmeId: string, programmeData: ProgrammeType }) => {
  const response = await apiClient.put(`/programmes/${programmeId}`, programmeData, {
    headers: { "Content-Type": "application/json" }, // Explicitly set Content-Type
  });
  return response.data;
};


// Delete a programme
export const deleteProgramme = async (programmeId: string) => {
  await apiClient.delete(`/programmes/${programmeId}`);
};
