<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
          <template v-slot:phase>
            <div v-if="phaseList && phaseList.length > 0">
              <div>
                <div
                  v-for="phase in phaseList.filter(d => !activedPhaseList.find(dd => dd.phase == d.phase))"
                  :key="phase.phase"
                  class="pl-md pr-md mr-md cursor"
                  style="display: inline-block"
                >
                  <span class="tsfont-plus" @click="addPhase(phase)">{{ phase.name }}</span>
                </div>
              </div>
              <Divider v-if="activedPhaseList.length > 0" orientation="start" class="mt-md mb-md">{{ $t('term.rdm.selectedphase') }}（{{ $t('page.dragsort') }}）</Divider>
              <div v-if="activedPhaseList.length > 0">
                <draggable
                  v-model="activedPhaseList"
                  filter=".forbid"
                  group="phaseGroup"
                  animation="300"
                >
                  <transition-group>
                    <div
                      v-for="(phase, index) in activedPhaseList"
                      :key="phase.phase"
                      style="display: inline-block;"
                    >
                      <div class="pl-md pr-md mr-md mb-md radius-mi phase-item bg-selected border-primary text-primary"><span class="cursor tsfont-trash-o" @click="removePhase(phase)">{{ phase.name }}</span>
                        <i v-if="phase.configTemplate" :class="hasConfig(phase.phase)" @click.stop="openConfig(phase)"></i>
                      </div>
                      <div v-if="index<activedPhaseList.length - 1" class="forbid mr-md mb-md text-grey" style="display: inline-block;"><span class="tsfont-arrow-right"></span></div>
                    </div>
                  </transition-group>
                </draggable>
              </div>
            </div>
          </template>
          <template v-slot:cronExpression>
            <TsQuartz v-model="policyData.cronExpression" :transfer="true"></TsQuartz>
          </template>
          <template v-slot:interfaceList>
            <div>
              <div class="mb-md" style="text-align: rigth; width: 50%"><TsFormInput
                v-model="searchParam.keyword"
                :placeholder="$t('form.placeholder.keyword')"
                suffix="tsfont-search"
                @on-enter="searchInterface"
              ></TsFormInput></div>
              <div v-if="policyData.interfaceList && policyData.interfaceList.length > 0" class="mb-sm">
                {{ $t('term.pbc.selectedinterface') }}：
                <Tag
                  v-for="inter in policyData.interfaceList"
                  :key="inter"
                  closable
                  @on-close="delInterface(inter)"
                >{{ inter }}</Tag>
              </div>
              <div>
                <TsTable
                  v-if="interfaceData"
                  v-model="policyData.interfaceList"
                  :showSizer="false"
                  :fixedHeader="false"
                  v-bind="interfaceData"
                  :selectedRemain="true"
                  keyName="id"
                  @changeCurrent="changePage"
                  @getSelected="getSelected"
                ></TsTable>
              </div>
            </div>
          </template>
        </TsForm>
      </template>
    </TsDialog>
    <PolicyConfig
      v-if="isConfigDialogShow"
      :phase="currentPhase"
      :config="policyData.config"
      @close="closeConfig"
      @setConfig="setPhaseConfig"
    ></PolicyConfig>
  </div>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    PolicyConfig: resolve => require(['./policy-config.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      isConfigDialogShow: false,
      currentPhase: {},
      policyData: { phase: '' },
      interfaceData: {},
      searchParam: { pageSize: 10, hasCi: 1, hasCustomView: 1 },
      selectedInterfaceList: [],
      phaseList: [],
      theadList: [
        { key: 'selection', multiple: true },
        { key: 'id', title: this.$t('term.pbc.datatransferid') },
        { key: 'name', title: this.$t('term.pbc.gatherinterface') },
        { key: 'category', title: this.$t('term.pbc.classidentifier') },
        { key: 'error', title: this.$t('page.exception') }
      ],
      activedPhaseList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large',
        title: this.id ? this.$t('term.pbc.editpolicy') : this.$t('term.pbc.addpolicy')
      },
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 30,
          validateList: ['required'],
          onChange: val => {
            this.policyData.name = val;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: this.$t('page.enable'),
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          validateList: ['required'],
          onChange: val => {
            this.policyData.isActive = val;
          }
        },
        {
          type: 'select',
          name: 'corporationId',
          label: this.$t('term.pbc.organization'),
          valueName: 'id',
          textName: 'name',
          transfer: true,
          url: '/api/rest/pbc/corporation/search',
          validateList: ['required'],
          onChange: val => {
            this.policyData.corporationId = val;
          }
        },
        {
          type: 'slot',
          name: 'cronExpression',
          label: this.$t('term.pbc.timeplan')
        },
        {
          type: 'slot',
          name: 'phase',
          label: this.$t('term.autoexec.executephase')
        },
        {
          type: 'slot',
          name: 'interfaceList',
          label: this.$t('term.pbc.relevanceinterface')
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.explain'),
          maxlength: 500,
          onChange: val => {
            this.policyData.description = val;
          }
        }
      ]
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
    async init() {
      this.searchInterface();
      await this.getPhaseList();
      await this.getPolicyById();
      if (this.policyData && this.policyData.phase && this.phaseList && this.phaseList.length > 0) {
        const phases = this.policyData.phase.split(',');
        const list = this.phaseList.filter(d => phases.includes(d.phase));
        this.activedPhaseList.push(...list);
      }
    },
    async getPhaseList() {
      await this.$api.pbc.policy.getPhaseList().then(res => {
        this.phaseList = res.Return;
      });
    },
    async getPolicyById() {
      if (this.id) {
        await this.$api.pbc.policy.getPolicyById(this.id).then(res => {
          this.policyData = res.Return;
          this.formConfig.forEach(element => {
            element.value = this.policyData[element.name];
          });
          if (!this.policyData.phase) {
            if (this.phaseList && this.phaseList.length > 0) {
              this.policyData.phase = this.phaseList[0].sort + '-' + this.phaseList[this.phaseList.length - 1].sort;
            }
          }
        });
      } 
    },
    removePhase(phase) {
      const index = this.activedPhaseList.findIndex(d => d === phase);
      if (index > -1) {
        this.activedPhaseList.splice(index, 1);
      }
    },
    addPhase(phase) {
      this.activedPhaseList.push(phase);
    },
    openConfig(phase) {
      this.currentPhase = phase;
      this.isConfigDialogShow = true;
    },
    closeConfig() {
      this.currentPhase = null;
      this.isConfigDialogShow = false;
    },
    setPhaseConfig(phase, phaseConfig) {
      const config = { phaseConfig: {} };
      config.phaseConfig[phase] = phaseConfig;
      if (!this.policyData.config) {
        this.policyData.config = {};
      }
      Object.assign(this.policyData.config, config);
    },
    delInterface(interfaceId) {
      if (this.policyData && this.policyData.interfaceList) {
        const index = this.policyData.interfaceList.findIndex(d => d == interfaceId);
        if (index > -1) {
          this.policyData.interfaceList.splice(index, 1);
        }
      }
    },
    getPhaseIndex(phase) {
      if (this.phaseList && this.phaseList.length > 0) {
        return this.phaseList.findIndex(d => d.phase === phase);
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    searchInterface(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.pbc.interfaces.searchInterface(this.searchParam).then(res => {
        this.interfaceData = res.Return;
        this.interfaceData.theadList = this.theadList;
      });
    },
    save() {
      const form = this.$refs['form'];
      this.policyData.phase = this.activedPhaseList.map(d => d.phase).join(',');
      if (form.valid()) {
        if (this.policyData.interfaceList.length == 0) {
          this.$Message.info(this.$t('term.pbc.chooserelevanceinterface'));
          return;
        }
        this.$api.pbc.policy.savePolicy(this.policyData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    getSelected(indexList, itemList) {
      this.policyData.interfaceList = indexList;
    },
    changePage(page) {
      this.searchInterface(page);
    },
    getActiveClass(phaseObj) {
      if (this.policyData && this.policyData.phase) {
        const selectedPhases = this.policyData.phase.split(',');
        if (selectedPhases.includes(phaseObj.phase)) {
          return 'bg-selected border-primary text-primary';
        }
      }
      return 'border-color bg-op';
    },
    hasConfig(phase) {
      if (this.policyData?.config?.phaseConfig[phase]) {
        return 'tsfont-os';
      } else {
        return 'tsfont-setting';
      }
    }
  },
  filter: {},
  computed: {
    activedPhase() {
      if (this.policyData && this.policyData.phase && this.phaseList && this.phaseList.length > 0) {
        const phases = this.policyData.phase.split(',');
        return this.phaseList.filter(d => phases.includes(d.phase));
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.divInterface {
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  grid-gap: 10px;
}

.divPhase {
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-gap: 10px;
  div {
    border-width: 1px;
    border-style: solid;
  }
}

.phase-item {
  border-width: 1px;
  border-style: solid;
  display: inline-block;
}
</style>
