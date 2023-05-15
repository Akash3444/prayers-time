import axios from 'axios';

export const axiosInstance = axios.create({
  auth: {
    username: process.env.REACT_APP_API_USERNAME,
    password: process.env.REACT_APP_API_PASSWORD,
  },
});
