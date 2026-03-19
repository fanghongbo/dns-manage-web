import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    layout: 'header-sidebar-nav',
  },
  footer: {
    enable: true,
  },
  theme: {
    // builtinType: 'deep-blue',
    // colorPrimary: 'hsl(212 100% 45%)',
    // semiDarkHeader: true,
    // semiDarkSidebar: true,
    builtinType: 'sky-blue',
    colorPrimary: 'hsl(231 98% 65%)',
    // builtinType: 'default',
    semiDarkHeader: false,
    semiDarkSidebar: false,
    mode: 'light',
  },
  sidebar: {
    width: 220,
  },
  widget: {
    sidebarToggle: false,
    timezone: false,
    lockScreen: false,
  },
  navigation: {
    accordion: false,
  },
});
