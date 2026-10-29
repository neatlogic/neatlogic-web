# 跨模块路由接入

给已有模块增加页面时，在自己业务模块的 `import.js` 中注册路由即可，无需修改目标模块的 `router.js`。

例如，将商业模块 `example` 的页面注册到 `process`：

```js
// src/commercial-module/example/import.js
import ComponentManager from '@/resources/import/component-manager.js';

ComponentManager.registerRouterComponent({
  process: [
    {
      path: '/example-detail',
      name: 'example-detail',
      component: () => import('./pages/example-detail.vue'),
      meta: { ismenu: false }
    }
  ]
});
```

1. 创建对应页面 `pages/example-detail.vue`。
2. 在业务 `import.js` 中添加上述注册代码。`process` 是目标模块 ID，替换为需要接入的模块；`component` 指向自己的页面。
3. 正常构建、启动后，通过 `process.html#/example-detail` 访问（前面沿用当前环境的地址前缀）。

社区模块在 `src/community-module/<业务目录>/import.js` 中使用相同写法。路由数组也可以放在单独文件中，再由 `import.js` 导入并注册。

注意：`name`、`path` 应保持唯一，与目标模块基础路由冲突的扩展会被过滤。示例不增加菜单；需要菜单时，配置方法见 [router-config.md](./router-config.md)。
