/**
 * 预加载路由使用的 Iconify 图标集，实现内网离线部署时图标正常显示。
 * 默认情况下 Iconify 会从 api.iconify.design 在线加载图标，内网环境无法访问。
 *
 * 路由图标使用的前缀: lucide, carbon, ion, mdi, charm
 */
import { addCollection } from '@iconify/vue';

import lucide from '@iconify/json/json/lucide.json';
import carbon from '@iconify/json/json/carbon.json';
import ion from '@iconify/json/json/ion.json';
import mdi from '@iconify/json/json/mdi.json';
import charm from '@iconify/json/json/charm.json';

const ICON_SETS = [lucide, carbon, ion, mdi, charm] as const;

export function initIconifyOffline() {
  ICON_SETS.forEach((iconSet) => {
    addCollection(iconSet as any);
  });
}
