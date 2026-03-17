import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';
import { encryptDes } from '@vben/utils';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getSecretKey, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    let secretKey: string = '';
    try {
      secretKey = await getSecretKey();
    } catch (error) {
      console.error('获取密钥失败', error);
    }

    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;

      const args = {
        name: params.username,
        password: encryptDes(params.password, secretKey),
        rememberMe: 'false',
      };

      // 先调用登录接口（返回 data 为空字符串）
      await loginApi(args);

      const fetchUserInfoResult = await fetchUserInfo();

      userInfo = fetchUserInfoResult;

      userStore.setUserInfo(userInfo);
      accessStore.setAccessCodes(userInfo.accessCodes);

      // 使用 cookie 认证，设置虚拟 token 标识已登录状态
      // 实际认证通过 cookie 完成，这里只是作为登录状态的标志
      accessStore.setAccessToken('cookie-auth');
      accessStore.setIsAccessChecked(false); // 重置权限检查状态，让路由守卫重新生成路由

      if (accessStore.loginExpired) {
        accessStore.setLoginExpired(false);
      } else {
        onSuccess
          ? await onSuccess?.()
          : await router.push(
              userInfo?.homePath || preferences.app.defaultHomePath,
            );
      }

      if (userInfo?.username) {
        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realUsername}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch (error) {
      console.error('退出登录失败', error);
    }

    // 重置登录状态
    accessStore.setLoginExpired(false);
    accessStore.setAccessToken(null);
    accessStore.setIsAccessChecked(true);
    resetAllStores();

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
