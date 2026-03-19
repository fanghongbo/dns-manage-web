<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw, nextTick, onMounted, ref } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { getSliderCaptchaChallenge, verifySliderCaptcha } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const loginRef = ref<InstanceType<typeof AuthenticationLogin> | null>(null);

const captchaId = ref<string>('');
const captchaKey = ref(0);
const captchaRequired = ref(false);

async function refreshSliderChallenge() {
  try {
    const resp = await getSliderCaptchaChallenge();
    captchaId.value = resp.captchaId;
    captchaKey.value += 1;

    const formApi = loginRef.value?.getFormApi?.();
    formApi?.setFieldValue('captcha', false);
    formApi?.setFieldValue('passToken', '');
  } catch (error) {
    console.error('获取滑块 challenge 失败', error);
  }
}

async function handleSliderSuccess(payload: any) {
  const timeSeconds = Number(payload?.time ?? 0);
  const durationMs = Number.isFinite(timeSeconds)
    ? Math.max(0, Math.round(timeSeconds * 1000))
    : 0;

  let currentCaptchaId = captchaId.value;
  if (!currentCaptchaId) {
    await refreshSliderChallenge();
    currentCaptchaId = captchaId.value;
  }
  if (!currentCaptchaId) {
    message.error('验证码初始化失败，请刷新页面后重试');
    return;
  }

  try {
    const clientTs = Math.floor(Date.now() / 1000);
    const resp = await verifySliderCaptcha({
      captchaId: currentCaptchaId,
      clientTs,
      durationMs,
    });

    const passToken = resp?.passToken;
    if (!passToken) {
      throw new Error('passToken 为空');
    }

    const formApi = loginRef.value?.getFormApi?.();
    formApi?.setFieldValue('passToken', passToken);
  } catch {
    await refreshSliderChallenge();
  }
}

onMounted(async () => {
  await refreshSliderChallenge();
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      componentProps: {
        key: captchaKey.value,
        onSuccess: handleSliderSuccess,
      },
      fieldName: 'captcha',
      rules: captchaRequired.value
        ? z.boolean().refine((value) => value, {
            message: $t('authentication.verifyRequiredTip'),
          })
        : z.boolean().optional(),
    },
    {
      component: 'VbenInput',
      componentProps: {
        type: 'hidden',
      },
      fieldName: 'passToken',
      hide: true,
    },
  ];
});

async function handleLoginSubmit(values: Record<string, any>) {
  if (!values?.passToken) {
    captchaRequired.value = true;
    await nextTick();
    await loginRef.value?.getFormApi?.().validateField('captcha');
    return;
  }
  await authStore.authLogin(values);
}
</script>

<template>
  <AuthenticationLogin
    ref="loginRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-code-login="false"
    :show-forget-password="false"
    :show-qrcode-login="false"
    :show-register="false"
    :show-remember-me="true"
    :show-third-party-login="false"
    @submit="handleLoginSubmit"
  />
</template>
