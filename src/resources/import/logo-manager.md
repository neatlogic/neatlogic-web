# logo-manager 定制 Logo 配置

[logo-manager.js](./logo-manager.js) 用于从商业模块目录收集定制 Logo，统一提供明亮主题和暗黑主题的图片资源。业务定制包只需放入约定名称的图片，导航组件即可通过现有逻辑使用，无需修改公共导航代码或手动注册。

该文件只负责收集图片并默认导出配置；根据主题选择图片、优先使用用户上传的 Logo、回退到项目预设图片，由 [navigation-logo-mixin.js](../../views/components/topnav/navigation-logo-mixin.js) 处理。

## 1. 如何提供定制 Logo

在商业模块目录中放入以下文件，例如：

```text
src/commercial-module/<定制模块>/images/
├── logo_white.png
└── logo_dark.png
```

| 文件 | 对应导出字段 | 使用场景 |
| --- | --- | --- |
| `logo_white.png` | `logoWhiteIcon` | `theme-default` 明亮主题。 |
| `logo_dark.png` | `logoDarkIcon` | `theme-dark` 暗黑主题。 |

扫描是递归的，不要求一定放在 `images` 目录，但需要位于 `src/commercial-module/` 下，文件路径分别匹配 `/logo_white\.png$/`、`/logo_dark\.png$/`。推荐按示例命名，保持大小写一致。

图片放好后随项目正常构建加载，无需在 `import.js`、Vuex 或 `ComponentManager` 中注册。仓库中的现有资源可参考 [szbank 明亮主题 Logo](../../commercial-module/szbank/images/logo_white.png) 和 [tlcbbank 明亮主题 Logo](../../commercial-module/tlcbbank/images/logo_white.png)。

当前实现只扫描商业目录。将同名图片放到 `src/community-module/` 或 `public/` 中，不会通过此文件导出；`logo_big_white.png`、`logo_big_dark.png` 也不匹配上述文件名规则。

## 2. 导出的内容与直接使用方式

```js
import logoConfig from '@/resources/import/logo-manager.js';

const { logoWhiteIcon, logoDarkIcon } = logoConfig;
```

默认导出一个对象，不是函数或 Vue 插件：

```js
{
  logoWhiteIcon: '',
  logoDarkIcon: ''
}
```

上面为空的字段会在找到对应图片后被替换为构建工具加载的图片资源引用，可供 `<img>` 的 `src` 使用。未找到对应图片时，该字段保持 `''`。两种图片分别扫描，只提供其中一种不会自动复用为另一种。

直接读取适合只需要定制包图片的场景。需要与项目导航保持一致的主题选择、上传 Logo 和默认图片逻辑时，应使用下一节的 mixin。

## 3. 导航中如何使用

已有的公共导航 [topnav.vue](../../views/components/topnav/topnav.vue) 和 [在线文档导航](../../views/pages/documentonline/topnav/topnav.vue) 都使用 `NavigationLogoMixin`：

```vue
<template>
  <img :src="getNavigationLogo" />
</template>

<script>
import NavigationLogoMixin from '@/views/components/topnav/navigation-logo-mixin.js';

export default {
  mixins: [NavigationLogoMixin]
};
</script>
```

此示例依赖项目已有的主题初始化和全局 `HOME` 等运行环境。`getNavigationLogo` 的选择顺序如下：

1. 读取 `ThemeUtils.getValueByType('logo')`；值为真值且类型为 Number 时，使用上传图片地址 `HOME + '/api/binary/image/download?id=' + uploadLogo`。
2. 没有命中上传 Logo 时，按 `localStorage.themeClass` 选择定制包图片；没有主题值时使用 `theme-default`。
3. 对应定制图片字段为空时，使用项目预设图片。

| 主题 | 定制包图片字段 | 预设图片 |
| --- | --- | --- |
| `theme-default` | `logoWhiteIcon` | `src/resources/assets/images/logo_big_white.png` |
| `theme-dark` | `logoDarkIcon` | `src/resources/assets/images/logo_big_dark.png` |

上传值的判断包含类型检查，字符串形式的图片 ID 不会进入上传 Logo 分支。若没有有效上传 Logo，且主题值不是上述两种，当前 mixin 返回空字符串。

mixin 中对主题状态 `store.logo` 的读取用于建立响应式依赖，使主题 Logo 状态变化后能够重新计算；图片实际取值仍通过 `ThemeUtils` 读取。

## 4. 扫描与覆盖规则

文件被导入时，会执行两次 `require.context()`：分别查找商业目录中的明亮、暗黑 Logo，再遍历匹配资源并赋值。

- 同一主题有多张匹配图片时，后遍历到的有效资源覆盖前面的值。实现没有按当前 `MODULEID`、租户或定制模块名选择图片。
- 明亮和暗黑图片独立选择，多个定制包同时存在时，两种图片可能来自不同目录。构建中应明确保留目标定制资源，避免依赖遍历顺序选择品牌。
- 扫描在模块加载时执行，没有提供运行时重新扫描、设置配置或异步加载接口；更换定制包资源后需要通过正常开发编译或重新构建使变更生效。
- 预设图片回退发生在对应配置字段为空时。当前导航没有在定制图片请求失败后自动换图的处理，也没有在此处调整图片尺寸，展示样式由使用它的组件负责。

如果定制图片未显示，可先检查是否存在用户上传的 Logo，再核对当前主题、图片路径和命名，以及是否有其他商业模块的同名资源覆盖了配置。
