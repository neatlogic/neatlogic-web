
<template>
  <TsDialog
    :isShow="isShow"
    :title="$t('term.autoexec.datasourcesetting')"
    @on-close="close()"
    @on-ok="saveSourc()"
  >
    <div class="main">
      <TsFormItem
        :label="$t('page.datasource')"
        :validateList="validateList"
        labelPosition="top"
      >
        <TsFormRadio
          v-model="dataSource"
          :dataList="dataSourceList"
          :validateList="validateList"
          @on-change="changeSource"
        ></TsFormRadio>
      </TsFormItem>
      <!-- 静态数据源/矩阵 -->
      <div
        :is="dataSource + 'Source'"
        ref="dataSource"
        :sourcConfig="config"
        :multiple="multiple"
        @update="update"
      ></div>
    </div>
  </TsDialog>
</template>
<script>
import item from './item/index.js';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    ...item
  },
  filters: {
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    sourcConfig: Object,
    multiple: Boolean
  },
  data() {
    return {
      validateList: ['required'],
      dataSourceList: [
        {
          text: this.$t('page.staticdatasource'),
          value: 'static'
        },
        {
          text: this.$t('page.matrix'),
          value: 'matrix'
        }
      ],
      dataSource: 'matrix',
      config: {}
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
    close() {
      this.$emit('close');
    },
    saveSourc() {
      if (!this.$refs.dataSource.valid()) {
        return;
      }
      this.config = this.$refs.dataSource.getData() || {};
      let data = {
        dataSource: this.dataSource
      };
      Object.assign(data, this.config);
      this.$emit('saveSourc', data);
      this.close();
    },
    update(obj) { //更新
      this.config = obj;
    },
    changeSource() {
      this.config = {};
    }
  },
  computed: {},
  watch: {
    sourcConfig: {
      handler(val) {
        if (val) {
          this.config = this.$utils.deepClone(val);
          this.config.dataSource && (this.dataSource = this.config.dataSource);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.main{
  max-height: 360px;
}

</style>
