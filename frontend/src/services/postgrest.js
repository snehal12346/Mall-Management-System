import axios from 'axios';

const postgrest = axios.create({
  baseURL: import.meta.env.VITE_POSTGREST_URL || 'http://127.0.0.1:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getShops = async () => {
  const response = await postgrest.get('/shops');
  return response.data;
};

export const getProducts = async () => {
  const response = await postgrest.get('/products');
  return response.data;
};

export const getEvents = async () => {
  const response = await postgrest.get('/events');
  return response.data;
};

export const getOffers = async () => {
  const response = await postgrest.get('/offers');
  return response.data;
};

export const getParkingSlots = async () => {
  const response = await postgrest.get('/parking_slots');
  return response.data;
};

export default postgrest;
