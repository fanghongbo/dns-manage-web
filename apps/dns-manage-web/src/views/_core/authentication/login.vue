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
const sliderStartAt = ref(0);

async function refreshSliderChallenge() {
  try {
    const resp = await getSliderCaptchaChallenge();
    captchaId.value = resp.captchaId;
    captchaKey.value += 1;
    sliderStartAt.value = 0;
    captchaRequired.value = false;

    const formApi = loginRef.value?.getFormApi?.();
    formApi?.setFieldValue('captcha', false);
    formApi?.setFieldValue('passToken', '');
    await formApi?.resetValidate();
  } catch (error) {
    console.error('获取滑块 challenge 失败', error);
  }
}

function handleSliderStart() {
  sliderStartAt.value = Date.now();
}

async function handleSliderSuccess(_payload: any) {
  const now = Date.now();
  if (sliderStartAt.value <= 0) {
    // 重置后的伪 success 事件，直接忽略，避免触发重复 challenge 请求
    return;
  }
  const durationMs = Math.max(1, now - sliderStartAt.value);

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
    // 验证通过后清理“请先完成验证”的错误态
    captchaRequired.value = false;
    sliderStartAt.value = 0;
  } catch {
    sliderStartAt.value = 0;
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
        onStart: handleSliderStart,
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
  try {
    await authStore.authLogin(values);
  } catch {
    // 登录失败后重置滑块与 challenge，避免沿用已消费的 passToken
    captchaRequired.value = true;
    await refreshSliderChallenge();
  }
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
