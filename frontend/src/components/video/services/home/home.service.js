import { API } from "../../utils/interceptors";
// Services
const getJoinLink = (id) => {
  return API.get(`/api/join`);
};
// export all service here
export const homeService = {
  getJoinLink,
};
