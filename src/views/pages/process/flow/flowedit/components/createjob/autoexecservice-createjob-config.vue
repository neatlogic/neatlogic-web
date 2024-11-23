<template>
  <div class="detail">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsFormItem
      label="自动化服务表单组件"
      labelPosition="left"
      required
    >
      <TsFormSelect
        ref="formAttributeUuid"
        v-model="createjobConfig.formAttributeUuid"
        :dataList="autoexecServiceComponent"
        @change-label="changeLabel"
      ></TsFormSelect>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  filters: {},
  props: {
    formUuid: String,
    defaultAllFormitemList: Array, //默认表单项列表
    config: Object,
    configList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      loadingShow: true,
      isFirst: true,
      allFormitemList: [], //根据表单标签获取表单项列表，表单标签为空时使用默认表单项列表
      createjobConfig: {
        formAttributeUuid: '',
        jobName: ''
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.allFormitemList = this.$utils.deepClone(this.defaultAllFormitemList) || [];
      if (!this.$utils.isEmpty(this.config)) {
        this.changeFormTag(this.config['formTag']);
        this.createjobConfig.formAttributeUuid = this.config.formAttributeUuid;
      }
      this.$nextTick(() => {
        this.isFirst = false;
        this.loadingShow = false;
        this.$emit('update', this.createjobConfig);
      });
    },
    changeFormTag(tag) {
      this.$set(this.createjobConfig, 'formTag', tag);
      this.allFormitemList = this.$utils.deepClone(this.defaultAllFormitemList) || [];
      if (!this.formUuid || !tag) {
        return;
      }
      let data = {
        formUuid: this.formUuid,
        tag: tag
      };
      this.$api.framework.form.getFormItemList(data).then(res => {
        if (res.Status == 'OK') {
          this.allFormitemList = res.Return || [];
        }
      });
    },
    changeLabel(label) {
      this.createjobConfig.jobName = label;
    },
    valid() {
      let isValid = true;
      for (let key in this.$refs) {
        let item = this.$refs[key];
        if (Array.isArray(item)) {
          item.forEach(v => {
            if (v && v.valid) {
              !v.valid() && (isValid = false);
            }
          });
        } else {
          if (item && item.valid) {
            !item.valid() && (isValid = false);
          }
        }
      }
      return isValid;
    }
  },
  computed: {
    autoexecServiceComponent() {
      let dataList = this.allFormitemList.filter((v) => v.handler == 'formautoexecservice').map((a) => {
        return {
          text: a.label,
          value: a.uuid
        };
      });
      let existList = this.configList && this.configList.length > 0 ? this.configList.filter((v) => v.formAttributeUuid).map((a) => a.formAttributeUuid) : [];
      dataList.forEach((v) => {
        if (existList.includes(v.value)) {
          v._disabled = true;
        } else {
          v._disabled = false;
        }
      });
      return dataList; 
    }
  },
  watch: {
    createjobConfig: {
      handler(val) {
        if (!this.isFirst) {
          this.$emit('update', val);
        }
      },
      deep: true
    }
  }
};
</script>
