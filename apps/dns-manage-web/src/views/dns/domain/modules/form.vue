<script lang="ts" setup>
import type { DnsDomainApi } from '#/api/dns/domain';
import type { DnsProviderApi } from '#/api/dns/provider';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createDnsDomain, updateDnsDomain } from '#/api/dns/domain';
import { getDnsProviders } from '#/api/dns/provider';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<DnsDomainApi.DnsDomain>();
const providerOptions = ref<Array<{ label: string; value: string }>>([]);
const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateDnsDomain(id.value, values) : createDnsDomain(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<DnsDomainApi.DnsDomain>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      // 加载服务商选项
      if (providerOptions.value.length === 0) {
        await loadProviders();
      }

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('dns.domain.domainName'))
    : $t('common.create', $t('dns.domain.domainName'));
});

async function loadProviders() {
  try {
    const providers = await getDnsProviders();
    providerOptions.value = providers.map(
      (provider: DnsProviderApi.DnsProvider) => ({
        label: provider.name,
        value: provider.id,
      }),
    );
    // 更新表单 schema 中的服务商选项
    formApi.updateSchema([
      {
        fieldName: 'providers',
        componentProps: {
          allowClear: true,
          mode: 'multiple',
          options: providerOptions.value,
          style: { width: '100%' },
        },
      },
    ]);
  } catch (error) {
    console.error('Failed to load providers:', error);
  }
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
