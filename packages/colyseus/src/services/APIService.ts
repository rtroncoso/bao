import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
  interface AxiosResponse<T = any> extends Promise<T> {}
}

interface APIServiceOptions {
  authToken?: string;
  baseURL?: string;
}

export abstract class APIService {
  protected authToken: string | null = null;
  protected readonly instance: AxiosInstance;

  public constructor({ authToken, baseURL }: APIServiceOptions = {}) {
    this.authToken = authToken || process.env.JWT_TOKEN;
    this.instance = axios.create({
      baseURL: baseURL || process.env.BAO_API
    });

    this._initializeRequestInterceptor();
    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  };

  private _initializeRequestInterceptor = () => {
    this.instance.interceptors.request.use(
      this._handleRequest,
      this._handleError
    );
  };

  protected _handleRequest = (config: AxiosRequestConfig) => {
    if (this.authToken) {
      config.headers['x-auth'] = this.authToken;
    }

    return config;
  };

  protected _handleResponse = ({ data }: AxiosResponse) => data;
  protected _handleError = (error: any) => Promise.reject(error);
}
