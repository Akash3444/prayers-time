import axios from 'axios';

export const axiosInstance = axios.create({
  auth: {
    username: process.env.REACT_APP_API_USERNAME,
    password: process.env.REACT_APP_API_PASSWORD,
  },
});

export const getYears = () => {
  const startYear = 2010;
  const endYear = 2030;
  const years = [];

  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return years;
};
