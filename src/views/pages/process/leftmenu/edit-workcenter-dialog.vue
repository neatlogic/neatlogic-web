<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="save()"
      @on-close="close()"
    >
      <template v-slot>
        <div>
          <TsForm ref="nameForm" :itemList="formConfig">
            <template slot="theadList">
              <draggable
                :animation="150"
                handle=".handler"
                :list="theadList"
              ><Tag
                v-for="(thead, index) in theadList"
                :key="index"
                size="large"
              >
                <i class="handler tsfont-drag" style="cursor:move"></i>
                <Checkbox
                  v-model="thead.isShow"
                  :true-value="1"
                  :disabled="thead.name === 'title'"
                  :false-value="0"
                ></Checkbox>{{ thead.displayName }} 
                <div v-if="thead.name === 'title'" class="action-group">
                  <span class="action-item tsfont-setting" @click="showTheadSetting(thead)"></span>
                </div>
              </Tag>
              </draggable>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
    <WorkcenterTheadSetting
      v-if="isShowTheadSetting"
      :isShowTheadSetting="isShowTheadSetting"
      :currentSettingThead="currentSettingThead"
      @close="closeTheadSetting"
      @ok="saveTheadSetting"
    ></WorkcenterTheadSetting>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    WorkcenterTheadSetting: () => import('../task/workcenter-thead-setting.vue')
  },
  props: {
    workcenter: {type: Object}
  },
  data() {
    return {
      theadList: [],
      uuid: null,
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', {target: this.$t('page.name')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      workcenterData: {},
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', 'name-special']
        },
        {
          type: 'text',
          name: 'catalogName',
          label: this.$t('term.process.menutype'),
          maxlength: 50
        },
        {
          name: 'isShowTotal',
          type: 'switch',
          label: this.$t('page.showtotal'),
          trueValue: 1,
          falseValue: 0,
          tooltip: this.$t('term.process.workordertypenumdes')
        },
        {
          type: 'slot',
          name: 'theadList',
          label: this.$t('page.defaultthead'),
          tooltip: this.$t('term.process.workcentertheadppolicy')
        }
      ],
      isShowTheadSetting: false,
      currentSettingThead: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    this.uuid = this.workcenter.uuid;
    if (this.workcenter.type === 'factory') {
      this.formConfig.forEach((element, index) => {
        if (element.name === 'name') {
          this.$set(this.formConfig[index], 'readonly', 'readonly');
        }
      });
    }
    await this.getWorkcenterByUuid();
    await this.getWorkcenterTheadList();
  }, 
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    async getWorkcenterByUuid() {
      if (this.uuid) {
        await this.$api.process.processtask.getWorkcenterByUuid(this.uuid).then(res => {
          this.workcenterData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.workcenterData[element.name]);
          });
        });
      }
    },
    save() {
      if (this.$refs['nameForm'].valid()) {
        const data = this.$refs['nameForm'].getFormValue();
        data.uuid = this.uuid;
        data.theadList = this.theadList;
        data.theadList.forEach((item, index) => {
          item.sort = index + 1;
        });
        this.$api.process.processtask.editWorkcenter(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.$emit('refresh', this.uuid);
            this.close(true);
          }
        });
      }
    },
    async getWorkcenterTheadList() {
      await this.$api.process.processtask.listWorkcenterThead({uuid: this.uuid}).then(res => {
        if (res.Status == 'OK') {
          this.theadList = res.Return;
          if (!this.$utils.isEmpty(this.theadList)) {
            this.theadList.sort((a, b) => a.sort - b.sort);
          }
        }
      });
    },
    showTheadSetting(thead) {
      this.currentSettingThead = thead;
      this.isShowTheadSetting = true;
    },
    closeTheadSetting() {
      this.isShowTheadSetting = false;
    },
    saveTheadSetting(theadSettingFormData) {
      this.theadList.forEach(th => { 
        if (th.name === this.currentSettingThead.name) {
          th.config = theadSettingFormData;
        }
      });
      this.isShowTheadSetting = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
