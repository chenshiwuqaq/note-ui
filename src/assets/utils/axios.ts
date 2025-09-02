import axios from 'axios';

const instance = axios.create({
  baseURL: "http://localhost:8080/",
  //请求超过时间
  timeout: 3000,
});

export default instance;
