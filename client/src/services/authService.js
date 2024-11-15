import axios from 'axios';

export const loginUser = (username, password) => {
  return axios.post('http://localhost:5001/api/auth/login', {
    username,
    password,
  });
};
