import axios from "axios";

const instance = axios.create();

instance.defaults.headers.common = {
  "Content-Type": "application/json",
};

export { instance };
