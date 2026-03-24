## 自定义模板查看器组件

### 组件描述

CustomtemplateViewer 是一个动态模板渲染组件，支持通过配置动态渲染自定义的 Vue 模板。组件可以从后端获取模板配置，或者直接传入模板内容和配置信息，实现灵活的界面定制。

### 功能特性

1. **动态模板渲染**：支持动态渲染自定义的 Vue 模板内容
2. **多种数据源**：
   - 通过 `id` 从后端获取自定义模板
   - 直接传入 `template` 和 `config` 配置
3. **资源文件支持**：支持在模板中使用资源文件，自动替换文件路径
4. **内置组件库**：内置常用的表单和展示组件
5. **配置灵活**：支持配置 data、methods、computed 等 Vue 选项
6. **数据监听**：自动监听 data 变化并重新渲染模板
7. **错误处理**：提供友好的错误提示

### Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| id | 自定义模板的 ID，用于从后端获取模板 | Number | - | 否（与 template/config 二选一） |
| template | 模板内容，Vue 模板字符串 | String | - | 否（与 id 二选一） |
| config | Vue 组件配置信息，可以是对象或字符串 | Object/String | - | 否 |
| data | 模板数据，可以是对象或数组 | Object/Array | - | 否 |
| fileList | 资源文件列表，包含附件 id 和附件名称 | Array | [] | 否 |

### 内置组件

组件内置了以下常用组件，可在模板中直接使用：

| 组件名 | 说明 |
|--------|------|
| ViewUI | ViewUI 组件库 |
| TsFormInput | 文本输入框 |
| TsFormCheckbox | 复选框 |
| TsFormRadio | 单选框 |
| TsFormSelect | 下拉选择框 |
| TsFormSwitch | 开关 |
| TsFormDatePicker | 日期选择器 |
| TsTable | 表格组件 |
| NoData | 无数据提示组件 |

### 使用方式

#### 方式一：通过 ID 从后端获取模板

```vue
<template>
  <div>
    <CustomtemplateViewer 
      :id="templateId"
      :data="templateData"
      :fileList="fileList"
    />
  </div>
</template>

<script>
export default {
  components: {
    CustomTemplateViewer: () => import('@/resources/components/customtemplate/customtemplate-viewer.vue')
  },
  data() {
    return {
      templateId: 123,
      templateData: {
        username: '张三',
        age: 25,
        status: 1
      },
      fileList: [
        { id: 'file001', name: 'logo.png' },
        { id: 'file002', name: 'background.jpg' }
      ]
    };
  }
};
</script>
```

#### 方式二：直接传入模板和配置

```vue
<template>
  <div>
    <CustomtemplateViewer 
      :template="customTemplate"
      :config="customConfig"
      :data="templateData"
    />
  </div>
</template>

<script>
export default {
  components: {
    CustomTemplateViewer: () => import('@/resources/components/customtemplate/customtemplate-viewer.vue')
  },
  data() {
    return {
      templateData: {
        title: '用户信息',
        userList: [
          { name: '张三', age: 25 },
          { name: '李四', age: 30 }
        ]
      },
      customTemplate: `
        <div class="custom-container">
          <h2>{{ title }}</h2>
          <TsTable :value="userList">
            <TsTableColumn title="姓名" key="name"></TsTableColumn>
            <TsTableColumn title="年龄" key="age"></TsTableColumn>
          </TsTable>
          <TsFormInput v-model="inputValue" label="输入内容"></TsFormInput>
          <Button @click="handleClick">点击我</Button>
        </div>
      `,
      customConfig: {
        data() {
          return {
            inputValue: ''
          };
        },
        methods: {
          handleClick() {
            this.$Message.success('按钮被点击了！');
          }
        }
      }
    };
  }
};
</script>
```

#### 方式三：使用字符串形式的 config

```vue
<template>
  <div>
    <CustomtemplateViewer 
      :template="customTemplate"
      :config="customConfigStr"
      :data="templateData"
    />
  </div>
</template>

<script>
export default {
  components: {
    CustomTemplateViewer: () => import('@/resources/components/customtemplate/customtemplate-viewer.vue')
  },
  data() {
    return {
      templateData: {
        count: 0
      },
      customTemplate: `
        <div>
          <p>计数器：{{ count }}</p>
          <Button @click="increment">增加</Button>
          <Button @click="decrement">减少</Button>
          <p>双倍值：{{ doubleCount }}</p>
        </div>
      `,
      customConfigStr: `({
        methods: {
          increment() {
            this.count++;
          },
          decrement() {
            this.count--;
          }
        },
        computed: {
          doubleCount() {
            return this.count * 2;
          }
        }
      })`
    };
  }
};
</script>
```

### 资源文件使用

在模板中可以使用 `{file:文件名}` 的语法引用资源文件，组件会自动替换为实际的下载地址。

```vue
<template>
  <div>
    <CustomtemplateViewer 
      :template="customTemplate"
      :data="templateData"
      :fileList="fileList"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      templateData: {},
      customTemplate: `
        <div class="header">
          <img src="{file:logo.png}" alt="Logo" />
          <h1>标题</h1>
        </div>
        <div class="content">
          <img src="{file:background.jpg}" alt="背景" />
        </div>
      `,
      fileList: [
        { id: 'file001', name: 'logo.png' },
        { id: 'file002', name: 'background.jpg' }
      ]
    };
  }
};
</script>
```

组件会将 `{file:logo.png}` 替换为 `/api/binary/file/download?id=file001`。

### Config 配置说明

config 参数支持配置 Vue 组件的常用选项：

#### data

```javascript
config: {
  data() {
    return {
      localValue: '',
      options: [
        { label: '选项1', value: 1 },
        { label: '选项2', value: 2 }
      ]
    };
  }
}
```

#### methods

```javascript
config: {
  methods: {
    handleSubmit() {
      console.log('表单提交', this.formData);
    },
    handleReset() {
      this.formData = {};
    }
  }
}
```

#### computed

```javascript
config: {
  computed: {
    fullName() {
      return this.firstName + ' ' + this.lastName;
    },
    isAdult() {
      return this.age >= 18;
    }
  }
}
```

### 完整示例

```vue
<template>
  <div class="page-container">
    <CustomtemplateViewer 
      :id="templateId"
      :data="pageData"
      :fileList="resourceList"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      templateId: null,
      pageData: {
        title: '用户管理',
        userCount: 100,
        tableData: []
      },
      resourceList: []
    };
  },
  created() {
    this.loadTemplate();
    this.loadData();
  },
  methods: {
    loadTemplate() {
      // 从后端获取模板 ID
      this.$api.autoexec.customtemplate.getCustomTemplateList().then(res => {
        if (res.Return && res.Return.length > 0) {
          this.templateId = res.Return[0].id;
        }
      });
    },
    loadData() {
      // 加载页面数据
      this.$api.user.getUserList().then(res => {
        this.pageData.tableData = res.Return;
      });
    }
  }
};
</script>
```

### 注意事项

1. **数据源选择**：`id` 和 `template/config` 两种方式二选一，如果同时传入，优先使用 `id`
2. **config 格式**：config 可以是对象或字符串，字符串格式需要符合 JavaScript 对象语法
3. **data 合并**：外部传入的 data 和 config.data 会合并，外部 data 优先级更高
4. **组件命名**：组件内部使用 UUID 生成唯一组件名，避免多个实例冲突
5. **错误处理**：如果模板创建失败，会显示错误信息
6. **性能考虑**：data 变化时会重新初始化组件，避免频繁修改 data
7. **国际化**：模板中可以使用 `$t()` 方法进行国际化，确保项目已配置国际化
8. **资源文件**：fileList 中的文件名必须与模板中 `{file:文件名}` 的文件名匹配
9. **安全性**：config 使用 `eval()` 解析，确保配置来源可信

### 后端接口说明

当使用 `id` 参数时，组件会调用以下接口获取模板信息：

**接口地址**：`/api/autoexec/customtemplate/getbyid`

**请求参数**：
```javascript
{
  id: 123 // 模板 ID
}
```

**返回数据**：
```javascript
{
  "Status": "OK",
  "Return": {
    "id": 123,
    "name": "模板名称",
    "template": "<div>模板内容</div>",
    "config": "({ data() { return {}; }, methods: {} })"
  }
}
```

### 适用场景

1. **自定义报表**：用户可以自定义报表的布局和样式
2. **仪表盘**：灵活配置仪表盘的展示内容
3. **表单生成器**：动态生成各种表单
4. **页面定制**：允许用户自定义页面内容
5. **模板引擎**：作为模板引擎使用，渲染动态内容

### 样式说明

组件本身不包含样式，样式由模板内容决定。建议在模板中使用 scoped 样式或全局样式类。
