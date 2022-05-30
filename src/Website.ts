import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export class Website {
  axiosInstance = axios.create();

  getPage(config: AxiosRequestConfig): Promise<AxiosResponse<any, any>> {
    return this.axiosInstance
      .request(config)
      .then((response: AxiosResponse) => {
        return response;
      })
      .catch((error) => {
        throw error;
      });
  }
}
