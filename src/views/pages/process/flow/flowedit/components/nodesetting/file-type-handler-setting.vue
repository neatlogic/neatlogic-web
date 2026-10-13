<template>
  <div class="pt-sm pb-sm pl-nm pr-nm">
    <!-- 注释放在根标签内以兼容路径注入；沿用通知设置的间距及左右开关布局。 -->
    <div class="flex-between">
      <span class="text-grey">{{ $t('term.process.filetypehandler') }}</span>
      <div class="flex-start">
        <span v-if="!isActive" class="text-tip pr-xs">{{ $t('page.default') }}</span>
        <TsFormSwitch
          v-model="isActive"
          :true-value="1"
          :false-value="0"
          width="auto"
          @on-change="changeSwitch"
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="isActive" class="pt-sm">
      <TsFormInput
        v-model="handlerValue"
        type="text"
        border="border"
        :clearable="true"
      ></TsFormInput>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileTypeHandlerSetting',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    value: {type: String, default: ''}
  },
  data() {
    return {
      isActive: (this.value || '').trim() ? 1 : 0, // 有已保存的处理器时自动展开，不额外持久化开关状态。
      pendingValue: null // 区分本地输入回写和外部配置更新，避免清空输入时自动折叠。
    };
  },
  methods: {
    changeSwitch(value) {
      // 关闭即清除自定义值，上传继续使用节点原有默认类型；开启时只展开空文本框。
      if (!value) {
        this.updateValue('');
      }
    },
    updateValue(value) {
      // 仅记录会触发父级回写的变更；相同值不留下待处理标记。
      this.pendingValue = value !== this.value ? value : null;
      this.$emit('input', value);
    }
  },
  computed: {
    handlerValue: {
      get() {
        // 兼容旧节点缺少字段或导入配置带空白，不在初始化时补写默认值。
        return (this.value || '').trim();
      },
      set(value) {
        // 保留处理器名称大小写；清空时保存空字符串以恢复节点默认类型。
        this.updateValue((value || '').trim());
      }
    }
  },
  watch: {
    value(value) {
      // 输入框清空后保持展开；外部回填或清空配置时同步开关，避免沿用其他节点状态。
      const isLocalChange = this.pendingValue !== null && value === this.pendingValue;
      this.pendingValue = null;
      if (!isLocalChange) {
        this.isActive = (value || '').trim() ? 1 : 0;
      }
    }
  }
};
</script>
