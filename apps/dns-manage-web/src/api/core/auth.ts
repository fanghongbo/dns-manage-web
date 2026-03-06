import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
    rememberMe?: string;
  }

  export interface SecretKeyResult {
    data: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    // 登录接口返回的 data 为空字符串，token 需要从用户信息接口获取
    data: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 获取密钥
 */
export async function getSecretKey() {
  return requestClient.get<string>('/api/v1/secret/key');
}

/**
 * 登录
 */
export async function loginApi(params: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    '/api/v1/user/login',
    {},
    { params },
  );
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/api/v1/user/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/api/v1/auth/codes');
}
