<template>
  <div>
    <TsFormItem label="模型" labelPosition="top" :required="true">
      <TsFormSelect
        ref="entity"
        v-model="config.ciId"
        :validateList="['required']"
        :clearable="false"
        transfer
        :dataList="ciList"
        :disabled="disabled"
        @on-change="changeCiId"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem label="操作" labelPosition="top" :required="true">
      <div class="radius-sm padding-md" :class="validClass('dataConfig')">
        <div class="tstable-container boxAction border-color">
          <Checkbox v-model="config.actionAdd" :disabled="disabled" class="actionItem">新增</Checkbox>
          <Checkbox v-model="config.actionEdit" :disabled="disabled" class="actionItem">编辑</Checkbox>
          <Checkbox v-model="config.actionDel" :disabled="disabled" class="actionItem">删除</Checkbox>
        </div>
        <div class="tstable-container">
          <table class="dynamic-table tstable-body">
            <thead>
              <tr>
                <th v-if="!disabled"></th>
                <th class="first-td">属性/关系</th>
                <th>
                  <span>显示</span>
                  <span>
                    <Poptip
                      trigger="hover"
                      content="如不勾选任何属性则按照模型显示设置中的配置显示相关属性"
                      width="200"
                      transfer
                      word-wrap
                    >
                      <i class="tsfont-info-o text-href" style="padding-left:3px;"></i>
                    </Poptip>
                  </span>
                </th>
                <th>
                  <span>编辑</span>
                  <span>
                    <Poptip
                      trigger="hover"
                      content="如不勾选任何属性则代表所有属性都可以编辑"
                      width="200"
                      transfer
                      word-wrap
                    >
                      <i class="tsfont-info-o text-href" style="padding-left:3px;"></i>
                    </Poptip>
                  </span>
                </th>
              </tr>
            </thead>
            <draggable
              v-if="config.ciId && config.dataConfig && config.dataConfig.length > 0"
              tag="tbody"
              :list="config.dataConfig"
              handle=".tsfont-bar"
              ghost-class="li-active"
            >
              <tr v-for="(data, index) in config.dataConfig" :key="index">
                <td v-if="!disabled"><i class="tsfont-bar" style="cursor:move" title="拖动排序"></i></td>
                <td class="text-grey first-td">
                  <span class="attrName">{{ data.title }}</span>
                </td>
                <td>
                  <Checkbox v-model="data.isShow" :disabled="disabled"></Checkbox>
                </td>
                <td>
                  <Checkbox v-model="data.isEdit" :disabled="disabled"></Checkbox>
                </td>
              </tr>
            </draggable>
          </table>
        </div>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/config/base-config.vue';
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      ciList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getCiList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCiList() {
      this.$api.cmdb.ci.getCiList({ isAllColumn: 1 }).then(res => {
        this.ciList = res.Return;
      });
    },
    changeCiId() {
      if (this.config.ciId) {
        this.config.ciIdList = [];
        this.config.ciIdList = [this.config.ciId];
        this.isShow = false;
        this.$api.cmdb.ci.getCiViewByCiId(this.config.ciId).then(res => {
          if (res.Status == 'OK') {
            let resdata = res.Return;
            let newArr = [];
            resdata.forEach(v => {
              //排除掉所有常量，因为常量不能修改
              const data = {};
              if (v.type != 'const') {
                data.isShow = false;
                data.isEdit = false;
                data.key = v.type + '_' + v.itemId;
                data.title = v.itemLabel;
                data.fromCiId = v.itemId;
                newArr.push(data);
              }
            });
            this.config.actionEdit = false;
            this.config.actionDel = false;
            this.config.actionAdd = false;

            this.config.dataConfig = newArr;
            this.isShow = true;
          }
        });
      } else {
        this.config.ciIdList = [];
        this.config.dataConfig = [];
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.boxAction{
  display: flex;
  border-bottom: 1px solid;
  padding: 4px 0 10px;
  .actionItem{
    flex: 1;
  }
}
.dynamic-table {
  .first-td {
    padding-left: 0 !important;
  }
}
</style>
