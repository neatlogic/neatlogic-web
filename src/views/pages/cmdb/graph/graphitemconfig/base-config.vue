<script>
export default {
  props: {
    error: { type: Array }, //异常列表
    data: { type: Object } //配置
  },
  methods: {
    //设置属性值
    setConfig(attrName, attrValue) {
      if (attrName.indexOf('.') == -1) {
        this.$set(this.data, attrName, attrValue);
      } else {
        const str = attrName.split('.');
        let obj = this.data;
        for (let i = 0; i < str.length - 1; i++) {
          if (obj[str[i]]) {
            obj = obj[str[i]];
          } else {
            this.$set(obj, str[i], {});
          }
        }
        this.$set(obj, str[str.length - 1], attrValue);
      }
      this.$forceUpdate();
    },
    //判断属性是否有异常
    hasError(attrName) {
      if (this.error && this.error.length > 0) {
        if (this.error.find(d => d.field === attrName)) {
          return true;
        }
      }
      return false;
    },
    //验证后的样式
    validClass(attrName) {
      const c = { 'bg-error-grey': this.hasError(attrName), 'bg-op': !this.hasError(attrName) };
      return c;
    }
  },
  computed: {},

  watch: {
    data: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
/*
.ivu-form-label-left {
  > .ivu-form-item-label {
    position: absolute;
    line-height: 32px;
    padding: 0px @space-normal 0px 0;
  }
}
.ivu-form-item {
  margin-bottom: @space-sm;
  width: 100%;
}
.label-align-center {
  position: relative;
  & > .ivu-form-item-label {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
}
.ivu-form-label-left .ivu-form-item-content {
  margin-left: 120px !important;
  text-align: right;
}
.ivu-form-item-label {
  width: 120px;
  > span {
    // display: inline-block;
  }
}*/
</style>
