# TsGantt

项目内维护的 SVG 甘特图实现，入口为 `gantt.js`，通过 `new Gantt(wrapper, tasks, options)` 创建实例。支持任务时间轴、依赖箭头、进度展示、日期拖动与缩放、网格拖动、弹出提示和滚动联动。

当前目录提供的是 JavaScript 类，没有 Vue 组件入口、`props`、`v-model` 或 `Vue.use()` 注册方式。以下说明以本目录源码为准。

## 基本使用

在 DOM 挂载后创建实例，传入一个空的 HTML 容器。`gantt.js` 已导入 `gantt.less`，无需重复引入样式。

```vue
<template>
  <div>
    <button type="button" @click="changeView('Day')">日</button>
    <button type="button" @click="changeView('Week')">周</button>
    <button type="button" @click="changeView('Month')">月</button>
    <div ref="ganttContainer"></div>
  </div>
</template>

<script>
import Gantt from '@/resources/plugins/TsGantt/gantt.js';
import '@/resources/assets/font/tsfonts/tsfont.js';
import '@/resources/assets/font/tsIconfont.js';

export default {
  data() {
    return { gantt: null };
  },
  mounted() {
    const tasks = [
      {
        id: 'task_1',
        name: '需求分析',
        start: '2026-10-01',
        end: '2026-10-04',
        progress: 100
      },
      {
        id: 'task_2',
        name: '功能开发',
        start: '2026-10-04',
        end: '2026-10-10',
        progress: 40,
        dependencies: ['task_1']
      }
    ];

    this.gantt = new Gantt(this.$refs.ganttContainer, tasks, {
      view_mode: 'Day',
      language: 'zh',
      need_progress_handler: false,
      on_date_change: task => {
        // 按业务需要保存 task._start、task._end，并在成功后重新获取任务数据。
      },
      on_click: task => {
        // 当前实现中，双击有效任务条时触发。
      }
    });
    this.gantt.setHeight(400);
  },
  methods: {
    changeView(mode) {
      if (this.gantt) {
        this.gantt.change_view_mode(mode);
      }
    },
    updateTasks(tasks) {
      if (this.gantt) {
        // 传入新对象，避免将实例内部状态带入下一次刷新。
        this.gantt.refresh(tasks.map(task => ({ ...task })));
      }
    }
  }
};
</script>
```

样式依赖项目的 Less 变量及主题环境，弹出层使用 `ivu-poptip-*` 样式类。图标依赖项目中的 SVG symbol，包括 `#tsfont-plus-s`、`#tsfont-arrow-left`、`#tsfont-arrow-right`；示例沿用业务页面的字体资源导入方式。

## 构造参数

```js
const gantt = new Gantt(wrapper, tasks, options);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `wrapper` | String 或 HTMLElement | 容器选择器或 DOM 元素，必须在初始化前存在。建议传入空的 HTML 容器。 |
| `tasks` | Array | 任务列表，必传；可传入 `[]` 清空展示。任务按数组顺序逐行排列。 |
| `options` | Object | 可选配置及回调。 |

源码虽然包含 SVG 容器分支，但复用已有 SVG 时不会创建 `$header`，后续渲染会访问该属性，因此当前应使用不含 SVG 的 HTML 容器。同一个容器应复用实例，通过 `refresh()` 更新数据。

## 任务数据

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | String | 建议提供稳定且唯一的字符串标识。缺失时根据名称和随机数生成。依赖引用须与此标识一致。 |
| `name` | String | 任务名称，用于任务条标签及默认提示标题。 |
| `start` | String、Date 或 Number | 开始时间，支持的格式见下文。 |
| `end` | String、Date 或 Number | 结束时间，支持的格式见下文。 |
| `progress` | Number | 进度百分比，建议由业务保证在 `0` 到 `100` 之间。 |
| `dependencies` | String 或 Array | 前置任务 ID，可传逗号分隔的字符串或字符串数组；省略时按空数组处理。 |
| `custom_class` | String | 添加到当前任务 `.bar-wrapper` 上的自定义类名，可用于定制颜色等样式。 |

初始化和 `refresh()` 会直接修改传入的任务对象，添加 `_start`、`_end`、`_index` 等内部字段，并将字符串依赖转换为数组；缺失日期时还会设置 `invalid`。如需保留业务原始数据，应传入任务副本。

### 日期格式与处理

- 字符串使用 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`，按本地时间解析；当前解析器不按 `date_format` 配置解析，也不提供完整的 ISO 时区字符串解析。
- 支持 `Date` 对象，以及数字类型的 10 位秒时间戳、13 位毫秒时间戳。时间戳字符串不属于该数字解析分支。
- 开始时间晚于结束时间时，内部 `_end` 会修正为 `_start`，但不会同步改写原始 `end`。
- 缺少两端日期时，内部使用今天到三天后；只缺一端时，在另一端基础上补三天范围。此类任务标记为 `invalid`，不参与正常日期拖动和进度编辑，显示补充日期用的加号，点击触发 `on_add_task`。
- 持续时间超过 10 年的任务会将 `end` 置空，并按缺少结束时间的逻辑处理。
- 当前实现不会自动把仅有日期的结束时间扩展到当天末尾。起止为同一天零点时，计算出的持续时间为零；应由业务明确传入所需时间范围。

刷新缺失日期的任务后，即使补齐了 `start`、`end`，复用旧对象仍可能保留 `invalid` 标记。建议从业务数据重新构造任务对象后刷新。

### 任务依赖

```js
{ id: 'task_3', name: '联调', start: '2026-10-10', end: '2026-10-12',
  progress: 0, dependencies: ['task_1', 'task_2'] }
// 也支持 dependencies: 'task_1, task_2'
```

依赖用于绘制前置任务到当前任务的箭头，并参与日期拖动联动。应保证引用的任务存在、ID 类型一致且依赖关系无环；当前实现没有完整的依赖数据校验或自动排程能力。ID 还会用于 DOM 选择器，建议采用字母、数字、下划线等简单字符。

## 配置项

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `view_mode` | `'Day'` | 初始视图，取值见下方。 |
| `header_height` | `50` | 表头基础高度，实际表头 SVG 高度为此值加 `10`，单位 px。 |
| `bar_height` | `20` | 任务条高度，单位 px。 |
| `padding` | `18` | 行间距；每行总高度为 `bar_height + padding`。 |
| `bar_corner_radius` | `3` | 任务条圆角。 |
| `arrow_curve` | `5` | 依赖箭头的弯曲参数。 |
| `popup_trigger` | `'click'` | 显示任务提示的 DOM 事件，例如 `'mouseover'`；有效任务条获得焦点时也会尝试显示提示。 |
| `custom_popup_html` | `null` | 自定义提示内容函数，接收任务对象并返回 HTML 字符串。 |
| `language` | `'zh'` | 传给 `Intl.DateTimeFormat` 的语言标识，用于月份等日期文本，例如 `'zh'`、`'en'`。 |
| `need_progress_handler` | 未设置 | 设为 `true` 才显示进度拖动柄，且任务必须有效、进度大于 `0` 且小于 `100`。 |
| `column_width` | `30` | 初始化及切换视图时会被对应视图的固定列宽覆盖。 |
| `step` | `24` | 每列小时数，初始化及切换视图时会被覆盖。 |
| `view_modes` | 全部六种视图 | 当前仅保存配置，未用于限制视图切换，也不会生成视图切换按钮。 |
| `date_format` | `'YYYY-MM-DD'` | 当前仅保存配置，未用于任务日期解析或展示格式切换。 |

实例没有单独的配置更新方法。业务中常用的视图、数据和尺寸变化可通过下方实例方法处理。

### 视图模式

| 视图值 | 含义 | 每列小时数 | 列宽（px） |
| --- | --- | --- | --- |
| `'Quarter Day'` | 四分之一天 | `6` | `38` |
| `'Half Day'` | 半天 | `12` | `38` |
| `'Day'` | 日 | `24` | `38` |
| `'Week'` | 周 | `168` | `140` |
| `'Month'` | 月 | `720` | `120` |
| `'Year'` | 年 | `8760` | `120` |

也可使用静态常量，例如 `Gantt.VIEW_MODE.DAY`、`Gantt.VIEW_MODE.WEEK`。视图选择界面由业务页面提供，取值区分大小写；月、年视图中的小时数为源码使用的换算值。

## 回调事件

回调通过 `options.on_*` 传入，不是 Vue 的 `$emit` 事件。

| 回调 | 参数 | 触发时机 |
| --- | --- | --- |
| `on_click` | `task` | 双击有效任务条，刚完成拖动后的短时间内会忽略。 |
| `on_date_change` | `task, start, end` | 拖动任务条或调整左右边界后，计算出的日期发生变化时。`start`、`end` 为 Date 对象，结束时间语义见下文。 |
| `on_progress_change` | `task, progress` | 拖动进度柄后，返回整数百分比，并更新 `task.progress`。 |
| `on_view_change` | `mode` | 初始化、切换视图及 `refresh()` 重新渲染时。构造过程中即可能触发。 |
| `on_add_task` | `task` | 点击缺失日期任务旁的加号。名称虽为 add_task，实际业务可用来打开日期补充弹窗，不会自动新增任务。 |
| `on_scroll` | `scrollTop` | 容器滚动，返回垂直滚动位置，可与左侧表格联动。 |
| `on_drag_start` | 无 | 按下网格开始拖动视口。 |
| `on_dragging` | 无 | 拖动网格移动视口时。 |
| `on_drag_end` | 无 | 在网格上松开鼠标结束视口拖动。 |

`on_drag_*` 对应网格视口拖动，任务日期拖动通过 `on_date_change` 处理。

日期变化时，源码先更新 `task._start`、`task._end`，再调用 `on_date_change(task, newStart, newEnd - 1 秒)`。因此第三个参数比 `task._end` 少一秒，业务保存时应统一选择所需的结束时间语义。原始 `task.start`、`task.end` 不会自动同步更新，直接使用旧任务刷新可能恢复旧日期。现有研发业务页面使用 `task._start`、`task._end` 保存日期。

所有回调均由业务负责后续保存、重新查询或错误处理，甘特图本身不请求后端接口。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| `refresh(tasks)` | 重新处理任务并按当前视图绘制；会再次触发 `on_view_change`。 |
| `change_view_mode(mode)` | 切换视图并重新绘制，省略参数时使用当前视图。 |
| `setHeight(height)` | 设置滚动容器高度，传入数值，内部追加 `px`。 |
| `setWidth(width)` | 设置滚动容器宽度，传入数值，内部追加 `px`。 |
| `setScrollTop(scrollTop)` | 设置并记录垂直滚动位置，常用于表格与甘特图联动。 |
| `get_task(id)` | 按严格相等匹配任务 ID，返回内部任务对象。 |
| `get_bar(id)` | 返回对应的任务条实例，属于较底层的操作入口。 |
| `view_is(modeOrModes)` | 判断当前视图是否匹配字符串或字符串数组。 |
| `unselect_all()` | 取消任务条的激活样式。 |
| `hide_popup()` | 隐藏当前提示层。 |
| `clear()` | 清空表头和主体 SVG 内容，不会销毁实例、移除容器或解绑事件。 |

`refresh()` 会尝试恢复实例记录的非零 `scrollTop`、`scrollLeft`；普通滚动事件本身只触发回调，不会记录这两个字段。表格联动时可通过 `setScrollTop()` 记录垂直位置。

### 自定义提示内容

```js
const options = {
  custom_popup_html: task => `<div>进度：${Number(task.progress) || 0}%</div>`
};
```

返回内容写入现有提示层的正文区域，不会替换整个提示层结构；当前自定义分支不会自动填充标题。

## 接入与维护注意事项

- 在 `mounted` 或容器渲染后的 `$nextTick` 中初始化，容器应可见，以便 SVG 标签测量正常工作。
- 页面尺寸变化时由业务调用 `setHeight()`、`setWidth()`，实例没有自动监听窗口尺寸变化。
- 当前没有 `readonly` 或统一关闭日期拖动的配置；`need_progress_handler: false` 仅控制进度柄。
- 当前没有 `destroy()` 方法，并且在 `document` 上注册了匿名 `mouseup` 监听。移除容器、调用 `clear()` 或将实例置空均不等同于完整事件清理；需频繁挂载、销毁的场景应先补充销毁能力。
- 与外部表格联动时，保持任务顺序与表格行顺序一致，并匹配行高和表头高度。表头默认高度为 `60px`，提示层定位也使用了固定的 `60px` 偏移，调整表头高度时需一并核对提示位置。

## 文件与业务参考

| 文件 | 职责 |
| --- | --- |
| `gantt.js` | 实例入口、视图、布局、依赖关系及交互事件。 |
| `bar.js` | 任务条、标签、进度、日期计算及拖动柄。 |
| `arrow.js` | 依赖箭头路径。 |
| `popup.js` | 提示层内容与定位。 |
| `date_utils.js` | 日期解析、格式化与计算。 |
| `svg_utils.js` | SVG 创建、动画与 DOM 事件辅助方法。 |
| `gantt.less` | 甘特图主题和布局样式。 |

现有接入示例：[研发任务列表甘特图](../../../views/pages/rdm/project/viewtab/components/issue-list-gantt.vue)，包含任务数据转换、日期保存、视图切换、左右表格滚动联动及尺寸调整。
