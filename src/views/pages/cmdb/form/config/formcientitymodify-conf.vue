<template>
  <div>
    <TsFormItem :label="$t('page.model')" labelPosition="top" :required="true">
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
    <TsFormItem :label="$t('page.actions')" labelPosition="top" :required="true">
      <div class="radius-sm padding-md" :class="validClass('dataConfig')">
        <div class="tstable-container boxAction border-color">
          <Checkbox v-model="config.actionAdd" :disabled="disabled" class="actionItem">{{ $t('page.new') }}</Checkbox>
          <Checkbox v-model="config.actionEdit" :disabled="disabled" class="actionItem">{{ $t('page.edit') }}</Checkbox>
          <Checkbox v-model="config.actionDel" :disabled="disabled" class="actionItem">{{ $t('page.delete') }}</Checkbox>
        </div>
        <div class="tstable-container">
          <table class="dynamic-table tstable-body">
            <thead>
              <tr>
                <th v-if="!disabled"></th>
                <th class="first-td">{{ $t('term.cmdb.attrrelation') }}</th>
                <th>
                  <span><Checkbox :value="isAllSelectionShow" :disabled="disabled || $utils.isEmpty(config.dataConfig)" @click.prevent.native="handleCheckAll('isShow')">{{ $t('term.cmdb.display') }}</Checkbox></span>
                  <span>
                    <Poptip
                      trigger="hover"
                      :content="$t('term.cmdb.displayattrtip')"
                      width="200"
                      transfer
                      word-wrap
                    >
                      <i class="tsfont-info-o text-href" style="padding-left:3px;"></i>
                    </Poptip>
                  </span>
                </th>
                <th>
                  <span><Checkbox :value="isAllSelectionEdit" :disabled="disabled || $utils.isEmpty(config.dataConfig)" @click.prevent.native="handleCheckAll('isEdit')">{{ $t('page.edit') }}</Checkbox></span>
                  <span>
                    <Poptip
                      trigger="hover"
                      :content="$t('term.cmdb.editattrtip')"
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
                <td v-if="!disabled"><i class="tsfont-bar" style="cursor:move" :title="$t('term.cmdb.dragtosort')"></i></td>
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
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
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
    },
    handleCheckAll(type) {
      const selection = type === 'isShow' ? this.$utils.deepClone(this.isAllSelectionShow) : this.$utils.deepClone(this.isAllSelectionEdit);
      if (!this.$utils.isEmpty(this.config.dataConfig)) {
        this.config.dataConfig.forEach((item) => {
          item[type] = !selection;
        });
      }
    }
  },
  filter: {},
  computed: {
    isAllSelectionShow() {
      let selection = true;
      if (this.$utils.isEmpty(this.config.dataConfig)) {
        selection = false;
      } else {
        for (let i = 0; i < this.config.dataConfig.length; i++) {
          if (!this.config.dataConfig[i].isShow) {
            selection = false;
            break;
          }
        }
      }
      return selection;
    },
    isAllSelectionEdit() {
      let selection = true;
      if (this.$utils.isEmpty(this.config.dataConfig)) {
        selection = false;
      } else {
        for (let i = 0; i < this.config.dataConfig.length; i++) {
          if (!this.config.dataConfig[i].isEdit) {
            selection = false;
            break;
          }
        }
      }
      return selection;
    }
  },
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
