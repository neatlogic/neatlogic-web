<template>
  <TsDialog
    v-bind="setting"
    :isShow="true"
    :loading="isSaveLoading"
    @on-close="close"
    @on-ok="save"
  >
    <div>
      <div>
        <Button class="mb-sm" @click="addData()">{{ $t('term.pbc.adddata') }}</Button>
      </div>
      <draggable
        v-if="tableSettingList && tableSettingList.length"
        class="clearfix"
        tag="div"
        :list="tableSettingList"
        handle=".move"
      >
        <div v-for="(item,index) in tableSettingList" :key="index" class="bg-op radius-sm mb-md">
          <div class="flex-between border-base-bottom padding-sm">
            <span
              class="move tsfont-bar pr-xs"
              :title="$t('term.deploy.dragtochangetheorder')"
              @click.stop
            ></span>
            <div>
              <span class="text-action tsfont-plus pr-xs" @click="addData(index+1)"></span>
              <span class="text-action tsfont-trash-o pr-xs" @click="deleteItem(index)"></span>
              <span class="text-action" :class="item._isShow?'tsfont-down':'tsfont-up'" @click="toggleshow(item)"></span>
            </div>
          </div>
          <div class="padding-sm">
            <TsFormItem label="资产清单" labelPosition="left">
              <TsFormSelect
                ref="formItem"
                v-model="item.viewName"
                v-bind="viewConfig"
                :dealDataByUrl="(nodeList)=>dealDataByViewList(nodeList, item.viewName)"
                @on-change="(val)=>changeViewName(val, item)"
              ></TsFormSelect>
            </TsFormItem>
            <div v-show="item._isShow">
              <TsFormItem label="表头属性" labelPosition="left">
                <div>
                  <Tag
                    v-for="(a,aindex) in assetTheadlist"
                    :key="aindex"
                    :checked="item.fieldList.includes(a.value)"
                    checkable
                    color="primary"
                    size="medium"
                    class="border-color tag"
                    @on-change="selectItem(a.value, item)"
                  >{{ a.text }}</Tag>
                </div>
                <div v-if="$utils.isEmpty(item.fieldList)" class="text-error">{{ $t('form.placeholder.pleaseselect',{'target':$t('page.attribute')}) }}</div>
              </TsFormItem>
              <template v-if="item.fieldList && item.fieldList.length > 0">
                <Divider orientation="left" style="font-size: 14px">{{ $t('term.process.attrdragtip') }}</Divider>
                <draggable
                  class="clearfix"
                  tag="div"
                  :list="item.fieldList"
                  handle=".move"
                >
                  <Tag
                    v-for="value in item.fieldList"
                    :key="value"
                    :name="value"
                    closable
                    size="medium"
                    @on-close="handleClose(value, item)"
                  ><span class="move tsfont-bar"></span> {{ getAssetTheadLabel(value) }}</Tag>
                </draggable>
              </template>
            </div>
          </div>
        </div>
      </draggable>
    </div>
  </TsDialog>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {},
  props: {
   
  },
  data() {
    return {
      id: null,
      config: {},
      tableSettingList: [],
      setting: {
        title: this.$t('page.setting'),
        type: 'slider',
        width: 'medium'
      },
      viewConfig: {
        dynamicUrl: '/api/rest/resourcecenter/application/assetlist/view/list',
        rootName: 'tbodyList',
        placeholder: '选择模型',
        transfer: true,
        showPath: true,
        search: true,
        border: 'border',
        validateList: ['required']
      },
      isSaveLoading: false,
      assetTheadlist: []
    };
  },
  beforeCreate() {},
  created() {
    this.getAppAssetTheadlist();
    this.getApplicationlistSetting();
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
    getApplicationlistSetting() {
      this.$api.cmdb.applicationManage.getApplicationlistSetting().then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.id = res.Return.id || null;
          this.config = res.Return.config || {};
          this.tableSettingList = this.config.tableSettingList || [];
          if (this.tableSettingList.length) {
            this.tableSettingList.forEach(item => {
              this.$set(item, '_isShow', true);
            }); 
          }
        }
      });
    },
    addData(index) {
      if (index) {
        this.tableSettingList.splice(index, 0, { viewName: '', fieldList: [], _isShow: true });
      } else {
        this.tableSettingList.push({ viewName: '', fieldList: [], _isShow: true });
      }
    },
    deleteItem(index) {
      this.tableSettingList.splice(index, 1);
    },
    close() {
      this.$emit('close');
    },
    save() {
      let formItems = this.$refs.formItem;
      let isValid = true;
      formItems.forEach(item => {
        if (item.valid && !item.valid()) {
          isValid = false;
        }
      });
      this.tableSettingList.forEach(item => {
        if (this.$utils.isEmpty(item.fieldList)) {
          isValid = false;
        } 
      });
      if (!isValid) {
        return;
      }
      this.isSaveLoading = true;
      let data = {
        config: {
          tableSettingList: this.tableSettingList
        }
      };
      if (this.id) {
        data.id = this.id;
      }
      this.$api.cmdb.applicationManage.saveApplicationlistSetting(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      }).finally(() => {
        this.isSaveLoading = false;
      });
    },
    dealDataByViewList(nodeList, viewName) {
      nodeList.forEach(item => {
        if (item.value !== viewName && this.tableSettingList.find(i => i.viewName == item.value)) {
          this.$set(item, '_disabled', true);
        } else {
          this.$set(item, '_disabled', false);
        }
      });
      return nodeList;
    },
    getAppAssetTheadlist() {
      this.$api.cmdb.applicationManage.getAppAssetTheadlist().then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.assetTheadlist = res.Return.tbodyList || [];
        }
      }); 
    },
    changeViewName(val, item) {
      if (val) {
        this.$set(item, 'fieldList', this.$utils.mapArray(this.assetTheadlist, 'value'));
      } else {
        this.$set(item, 'fieldList', []);
      }
    },
    selectItem(value, item) {
      if (item.fieldList.includes(value)) {
        item.fieldList.splice(item.fieldList.indexOf(value), 1);
      } else {
        item.fieldList.push(value);
      }
    },
    handleClose(value, item) {
      item.fieldList.splice(item.fieldList.indexOf(value), 1); 
    },
    toggleshow(item) {
      this.$set(item, '_isShow', !item._isShow); 
    }
  },
  computed: {
    getAssetTheadLabel() {
      return (value) => {
        let label = '';
        this.assetTheadlist.forEach(item => {
          if (item.value == value) {
            label = item.text;
          }
        }); 
        return label;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.tag {
  border-width: 1px !important;
  border-style: solid !important;
  cursor: pointer;
}
.move {
  cursor: move;
}
</style>
