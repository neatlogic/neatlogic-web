# TsBebouchSearch

带防抖请求的搜索输入框。用户停止输入后，组件将搜索词和附加参数通过 POST 提交到指定接口，成功后通过 `input` 事件返回接口数据。

## 基本用法

```vue
<template>
  <TsBebouchSearch
    url="/api/rest/example/search"
    search="keyword"
    :param="searchParam"
    :delay="500"
    clearable
    placeholder="请输入关键字"
    @input="handleSearchResult"
  />
</template>

<script>
import TsBebouchSearch from '@/resources/components/TsBebouchSearch/TsBebouchSearch.vue';

export default {
  components: { TsBebouchSearch },
  data() {
    return {
      searchParam: { currentPage: 1, pageSize: 20 },
      searchResult: null
    };
  },
  methods: {
    handleSearchResult(result) {
      this.searchResult = result;
    }
  }
};
</script>
```

示例中的接口地址仅作演示，使用时需替换为实际搜索接口。组件依赖项目中全局注册的 `Input`、`this.$https` 请求实例（含 `CancelToken`）和 `this.$t` 国际化方法。

也可以通过同目录的 `TsBebouchSearch.js` 安装入口注册组件：

```javascript
import TsBebouchSearch from '@/resources/components/TsBebouchSearch/TsBebouchSearch.js';

Vue.use(TsBebouchSearch);
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `String` | `undefined` | POST 请求地址。虽然未声明 `required`，使用时仍需提供有效接口地址。 |
| `search` | `String` | `'keyword'` | 请求体中搜索词对应的字段名。 |
| `param` | `Object` | `null` | 附加请求参数，与搜索词合并为请求体；同名字段以 `param` 的值为准。 |
| `delay` | `Number` | `500` | 防抖等待时间，单位为毫秒。每次输入都会重新计时。 |
| `placeholder` | `String` | `this.$t('form.validate.pleaseenterthecontent')` | 输入框占位文本。 |
| `clearable` | `Boolean` | `false` | 是否显示输入框的清除按钮。 |

## 事件

| 事件名 | 触发时机 | 回调参数 |
| --- | --- | --- |
| `input` | 请求返回且 `res.Status == 'OK'` 时 | `res.Return`，数据结构由接口决定，组件不进行列表提取或转换。 |

`input` 返回的是搜索结果，不是用户输入的关键字。组件没有声明 `value` prop，也未将外部值绑定到内部输入框，建议通过 `@input` 接收结果，不要将它作为支持关键字双向绑定的输入组件使用。

## 请求与返回约定

1. 输入变化时开始计时，等待 `delay` 毫秒后发送请求；连续输入会清除上一次待执行的计时器。
2. 搜索词通过 `trim()` 去除首尾空白，然后以 `search` 指定的字段名写入请求体。
3. 将 `param` 浅合并到请求体，并调用 `this.$https.post(url, data, { cancelToken })`。
4. 返回状态为 `OK` 时，将完整的 `Return` 作为 `input` 事件参数抛出。

例如，在上述示例中输入 `  server  `，请求体为：

```json
{
  "keyword": "server",
  "currentPage": 1,
  "pageSize": 20
}
```

接口返回示例：

```json
{
  "Status": "OK",
  "Return": {
    "tbodyList": [{ "id": 1, "name": "server" }],
    "rowNum": 1
  }
}
```

此时 `handleSearchResult` 接收整个 `Return` 对象；如需列表，应由父组件读取 `result.tbodyList`。

## 使用注意

- 组件挂载时不会自动请求；修改 `url`、`param` 或 `search` 也不会自动触发搜索，需要输入变化后才会请求。
- 空字符串也会提交请求。清空输入框后仍按防抖逻辑提交空搜索词，接口需支持相应查询行为。
- 点击搜索图标或按回车没有单独的立即搜索逻辑；组件仅监听内部 `Input` 的 `input` 事件。
- 组件没有提供插槽，也没有额外的加载状态、错误或完成事件；非 `OK` 返回不会触发 `input`。
- 当前实现的新请求取消逻辑存在短路问题，旧请求可能继续返回，因此防抖不保证并发请求的结果顺序。销毁时只取消当前保存的请求，尚未执行的防抖计时器不会被清理。
