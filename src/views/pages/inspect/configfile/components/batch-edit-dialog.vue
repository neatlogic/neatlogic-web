<template>
  <div>
    <TsDialog
      :title="title"
      type="modal"
      :isShow="true"
      :okText="editType == 'clear'?$t('page.clearup'):$t('page.confirm')"
      :btnType="editType == 'clear'?'error':'primary'"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="pb-nm">
          <TsFormRadio
            v-model="type"
            :dataList="dataList"
            :vertical="true"
          ></TsFormRadio>
        </div>
        <div v-if="conditionList && conditionList.length" class="condition-list">
          <div v-for="(item,index) in conditionList" :key="index" class="pr-lg pb-sm">
            <div class="item ivu-tag-default">
              <span class="text-tip">{{ item.label }}：</span>
              <span>{{ item.text }}</span>
            </div>
          </div>
        </div>
        <div v-if="editType != 'clear'" class="pt-xs">
          <TsCodemirror ref="filePath" v-model="filePath" :placeholder="$t('term.inspect.inputreturn')"></TsCodemirror>
        </div>
      </template>
      <template>

      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve)
  },
  props: {
    editType: String,
    title: String,
    selectList: Array,
    searchParam: Object,
    conditionConfig: Object,
    conditionConfigText: Object
  },
  data() {
    return {
      type: 'condition',
      dataList: [
        {
          text: this.$t('term.inspect.selectedasset'),
          value: 'select'
        },
        {
          text: this.$t('term.inspect.assetfilter'),
          value: 'condition'
        }
      ],
      searchConfigText: {
        protocolIdList: this.$t('page.protocol'),
        stateIdList: this.$t('term.autoexec.assetstatus'),
        inspectJobPhaseNodeStatusList: this.$t('page.jobstatus'),
        envIdList: this.$t('page.environment'),
        appSystemIdList: this.$t('page.system'),
        appModuleIdList: this.$t('page.module'),
        tagIdList: this.$t('page.tag'),
        keyword: this.$t('page.keyword'),
        typeId: this.$t('page.model')
      },
      conditionList: [],
      filePath: null
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
    okDialog() {
      let data = {};
      let pathList = [];
      if (this.$refs.filePath) {
        let list = this.$refs.filePath.codemirror.getValue().split('\n');
        if (list && list.length) {
          list.forEach(i => {
            if (i.trim()) {
              pathList.push(i.trim());
            }
          });
        }
      }
      if (!this.$utils.isEmpty(pathList)) {
        this.$set(data, 'pathList', pathList);
      }
      if (this.type == 'select') {
        this.$set(data, 'typeId', this.conditionConfig.typeId);
        this.$set(data, 'defaultValue', this.selectList);
      } else if (this.type == 'condition') {
        Object.assign(data, this.conditionConfig);
      }
      if (this.editType == 'add') {
        this.batchAddPath(data);
      } else if (this.editType == 'delete') {
        this.batchDeletePath(data);
      } else if (this.editType == 'clear') {
        this.batchDeleteFile(data);
      }
      this.$emit('close');
    },
    closeDialog() {
      this.$emit('close');
    },
    batchAddPath(data) { //批量添加路径
      this.$api.inspect.configfile.batchAddPath(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$Notice.success({
            title: this.$t('message.addsuccess')
          });
        }
      });
    },
    batchDeletePath(data) { //批量删除路径
      this.$api.inspect.configfile.batchDeletePath(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$Notice.success({
            title: this.$t('message.deletesuccess')
          });
        }
      });
    },
    batchDeleteFile(data) { //批量清除
      this.$api.inspect.configfile.batchDeleteFile(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$Notice.success({
            title: this.$t('message.clearsuccess')
          });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    selectList: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.type = 'select';
        } else {
          this.dataList[0].disabled = true;
          this.dataList[0].description = this.$t('term.inspect.unselectedasset');
          this.type = 'condition';
        }
      },
      deep: true,
      immediate: true
    },
    conditionConfigText: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          Object.keys(val).forEach(key => {
            if (this.searchConfigText[key]) {
              this.conditionList.push({
                label: this.searchConfigText[key],
                text: Array.isArray(val[key]) ? val[key].join('|') : val[key] 
              });
            }
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
.condition-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .item {
    padding: 4px 10px;
    border-radius: 4px;
  }
}
</style>
