import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const getDocuments = async (): Promise<Document[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getDocument = async (id: string): Promise<Document> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createDocument = async (data: { title: string; content: string }): Promise<Document> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateDocument = async (id: string, data: { title?: string; content?: string }): Promise<Document> => {
  const response = await axios.patch(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
