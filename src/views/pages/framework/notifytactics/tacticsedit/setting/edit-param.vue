<template>
  <div class="pop-box" @click.stop>
    <div class="tooltip-box">
      <div class="tooltip tipbottom">
        <div class="tooltip-content input-border">
          <div class="content">
            <TsForm ref="parameterFormConfig" :labelWidth="80" :itemList="parameterFormConfig"></TsForm>
          </div>
          <div class="btn-list">
            <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
            <Button type="primary" @click="saveParame">{{ $t('page.confirm') }}</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';

export default {
  name: '',
  components: {
    TsForm
  },
  filters: {},
  props: {
    id: {
      //策略id
      type: Number,
      default: null
    },
    isEdit: {
      //参数编辑的时候不能修改名称
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: null
    },
    paramTypeList: Array,
    uuid: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    let _this = this;
    return {
      parameterFormConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          width: '100%',
          validateList: ['required', 'char', {
            name: 'searchUrl', url: 'api/rest/notify/policy/param/save', 
            params: () => ({policyId: this.id, uuid: this.uuid })
          }]
        },
        {
          type: 'select',
          name: 'paramType',
          label: this.$t('page.type'),
          validateList: ['required'],
          transfer: true,
          width: '100%'
        },
        {
          type: 'textarea',
          name: 'label',
          label: this.$t('page.explain'),
          width: '100%',
          validateList: ['required']
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //保存
    saveParame() {
      if (this.$refs.parameterFormConfig.valid()) {
        let formData = this.$refs.parameterFormConfig.getFormValue();
        let data = Object.assign({ policyId: this.id }, formData);
        let uuid = null;
        if (this.config && this.config.uuid) {
          uuid = this.config.uuid;
        } else {
          uuid = this.$utils.setUuid();
        }
        this.$set(data, 'uuid', uuid);
        this.$api.framework.tactics.paramSave(data).then(res => {
          if (res.Status == 'OK') {
            let config = res.Return;
            this.$Message.success(this.$t('message.savesuccess'));
            this.$emit('updateParam', config);
            this.close();
          }
        });
      }
    },
    close() {
      if (this.isEdit) {
        this.$emit('close', this.config);
      } else {
        this.$emit('close');
      }
    }
  },
  computed: {},
  watch: {
    paramTypeList: {
      handler(val) {
        if (val.length > 0) {
          this.$set(this.parameterFormConfig[1], 'dataList', val);
        }
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        if (val) {
          this.$set(this.parameterFormConfig[0], 'disabled', true);
          this.parameterFormConfig.forEach(item => {
            item.value = val[item.name];
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.pop-box {
  width: 100%;
  .tooltip-box {
    width: 100%;
    .tooltip {
      position: relative;
      display: block;
      opacity: 1;
      width: 100%;
      .tooltip-title {
        line-height: 40px;
        border-bottom: 1px solid;
      }
    }
  }
  .tooltip-content {
    padding: 16px 0;
    .content {
      padding-right: 16px;
    }
  }
  .btn-list {
    text-align: right;
    padding-right: 16px;
    margin-top: 12px;
    > button {
      margin-left: 8px;
    }
  }
}
</style>
