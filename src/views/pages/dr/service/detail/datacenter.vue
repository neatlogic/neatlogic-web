<template>
  <div class="datacenter clearfix">
    <TsCard v-bind="cardData">
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addData">
          {{ $t('term.inspect.datacenter') }}
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="padding-sm">
          <div class="overflow pb-xs">
            {{ row.dataCenterName }}
          </div>
          <div v-if="row.config.filter">
            <span v-if="row.config.filter.resourceName">
              {{ row.config.filter.resourceName }}
            </span>
            <span v-else>
              {{ row.config.filter.appSystemName }}/{{ row.config.filter.appModuleName }}/{{ row.config.filter.envName }}
            </span>
          </div>
          <div class="pb-sm">
            <Divider orientation="start"><div class="text-title">{{ $t('page.node') }}</div></Divider>
            <div class="tag-style" :class="{'pr-lg':!$utils.isEmpty(row.config.nodeList) && row.config.nodeList.length > 1}">
              <div v-if="!$utils.isEmpty(row.config.nodeList)" class="overflow border-base radius-mi pl-xs pr-xs text-center">
                {{ row.config.nodeList[0].typeLabel }}
                <span v-if="row.config.nodeList[0].typeName">({{ row.config.nodeList[0].typeName }})</span>
                <span v-if="row.config.nodeList[0].ip">[{{ row.config.nodeList[0].ip }}{{ row.config.nodeList[0].port?':'+row.config.nodeList[0].port:'' }}]</span>
              </div>
              <div v-else>-</div>
              <div v-if="!$utils.isEmpty(row.config.nodeList) && row.config.nodeList.length > 1" class="tag-more">
                <Dropdown transfer>
                  <span class="tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(item,index) in row.config.nodeList" :key="index">
                      {{ item.typeLabel }}{{ item.typeName? '('+item.typeName+')':'' }}<span v-if="item.ip">[{{ item.ip }}{{ item.port?':'+item.port:'' }}]</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div class="pb-sm">
            <Divider orientation="start"><div class="text-title">{{ $t('term.dr.publicapplication') }}</div></Divider>
            <div class="tag-style" :class="{'pr-lg':!$utils.isEmpty(row.config.publicApplicationList) && row.config.publicApplicationList.length > 1}">
              <div v-if="!$utils.isEmpty(row.config.publicApplicationList)" class="overflow border-base radius-mi pl-xs pr-xs text-center">
                {{ row.config.publicApplicationList[0].typeLabel }}
                <span v-if="row.config.publicApplicationList[0].typeName">({{ row.config.publicApplicationList[0].typeName }})</span>
                <span v-if="row.config.publicApplicationList[0].ip">[{{ row.config.publicApplicationList[0].ip }}{{ row.config.publicApplicationList[0].port?':'+row.config.publicApplicationList[0].port:'' }}]</span>
              </div>
              <div v-else>-</div>
              <div v-if="!$utils.isEmpty(row.config.publicApplicationList) && row.config.publicApplicationList.length > 1" class="tag-more">
                <Dropdown transfer>
                  <span class="tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(item,index) in row.config.publicApplicationList" :key="index">
                      {{ item.typeLabel }}
                      <span v-if="item.typeName">({{ item.typeName }})</span>
                      <span v-if="item.ip">[{{ item.ip }}{{ item.port?':'+item.port:'' }}]</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div class="pb-sm">
            <Divider orientation="start"><div class="text-title">{{ $t('term.deploy.customparameter') }}</div></Divider>
            <div class="tag-style">
              <div v-if="!$utils.isEmpty(row.config.customParamList)" class="tag-text overflow border-base radius-mi pl-xs pr-xs">
                <span v-if="row.config.customParamList[0].key">  {{ row.config.customParamList[0].key }}:{{ row.config.customParamList[0].value }}</span>
              </div>
              <div v-else>-</div>
              <div v-if="!$utils.isEmpty(row.config.customParamList) && row.config.customParamList.length > 1" class="tag-more">
                <Dropdown transfer>
                  <span class="tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(item,index) in row.config.customParamList" :key="index">
                      <span v-if="item.key">{{ item.key }}:{{ item.value }}</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div>
            <Divider orientation="start"><div class="text-title">HA{{ $t('page.scene') }}</div></Divider>
            <div class="tag-style">
              <div v-if="!$utils.isEmpty(row.config.highAvailabilitySceneList)" class="tag-text overflow border-base radius-mi pl-xs pr-xs">
                {{ row.config.highAvailabilitySceneList[0].sceneName }}
              </div>
              <div v-else>-</div>
              <div v-if="!$utils.isEmpty(row.config.highAvailabilitySceneList) && row.config.highAvailabilitySceneList.length > 1" class="tag-more">
                <Dropdown transfer>
                  <span class="tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(item,index) in row.config.highAvailabilitySceneList" :key="index">
                      {{ item.sceneName }}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit" @click="editData(row)">{{ $t('page.edit') }}</div>
        <div class="pl-sm tsfont-trash-o" @click="deleteData(row)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
    <TsDialog
      v-if="isShowDialog"
      :title="$t('page.edit')"
      type="slider"
      :isShow.sync="isShowDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsFormItem v-if="type==='add'" :label="$t('term.dr.datacenterrel')" required>
            <TsFormSelect ref="dataCenterForm" v-model="dataCenterId" v-bind="dataCenterForm"></TsFormSelect>
          </TsFormItem>
          <DatacenterEdit
            ref="datacenter"
            :data="datacenterConfig"
            :applicationType="applicationType"
            :ciList="ciList"
          ></DatacenterEdit>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    DatacenterEdit: resolve => require(['./datacenter-edit.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    list: Array,
    applicationType: {
      type: String,
      default: ''
    },
    ciList: {
      type: Array,
      default: () => []
    },
    serviceId: Number
  },
  data() {
    return {
      cardData: {
        sm: 12,
        lg: 8,
        xl: 6,
        xxl: 4,
        headerPosition: 'right',
        padding: false,
        boxShadow: false,
        firstBtn: true,
        tbodyList: []
      },
      datacenterConfig: {},
      isShowDialog: false,
      type: 'add',
      dataCenterForm: {
        url: '/api/rest/dr/datacenter/list',
        dealDataByUrl: this.dealDataByUrl,
        valueName: 'id',
        textName: 'name',
        multiple: false,
        validateList: ['required'],
        border: 'border'
      },
      dataCenterId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) {
      let list = [];
      nodeList.forEach(item => {
        let findItem = this.list.find(d => d.dataCenterId === item.id);
        if (findItem) {
          this.$set(item, '_disabled', true);
        }
        list.push(item);
      });
      return list;
    },
    init() {
      if (!this.$utils.isEmpty(this.list)) {
        this.cardData.tbodyList = this.list;
      }
    },
    addData() {
      this.type = 'add';
      this.isShowDialog = true;
    },
    editData(row) {
      this.type = 'edit';
      this.datacenterConfig = row;
      this.isShowDialog = true;
    },
    deleteData(row) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.$api.dr.service.deleteServiceDatacenter({
            serviceId: row.serviceId,
            dataCenterId: row.dataCenterId
          }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$emit('update');
            }
          });
        }
      });
    },
    closeDialog() {
      this.isShowDialog = false;
      this.dataCenterId = null;
      this.datacenterConfig = {};
    },
    okDialog() {
      if (this.$refs.dataCenterForm && !this.$refs.dataCenterForm.valid()) {
        return;
      } else if (!this.$refs.datacenter.valid()) {
        return;
      }
      let data = this.$refs.datacenter.getData();
      this.$api.dr.service.saveServiceDatacenter({
        serviceId: this.serviceId,
        dataCenterId: this.datacenterConfig.dataCenterId || this.dataCenterId,
        config: data.config
      }).then((res) => {
        if (res.Status === 'OK') {
          this.$emit('update');
          this.closeDialog();
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.datacenter {
  /deep/.tscard-body {
    height: 360px !important;
  }
  .add {
    text-align: center;
    line-height: 360px;
  }
}
.tag-style {
  position: relative;
  height: 24px;
  .tag-more {
    position: absolute;
    right: 0px;
    top: 0px;
  }
  .tag-text {
    display: inline-block;
  }
}
</style>
