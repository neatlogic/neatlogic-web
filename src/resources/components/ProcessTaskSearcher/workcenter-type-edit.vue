<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
      @on-ok="save"
    >
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="data" :item-list="formConfig">
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
              </Tag></draggable>
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
    WorkcenterTheadSetting: () => import('@/views/pages/process/task/workcenter-thead-setting.vue')
  },
  props: {},
  data() {
    return {
      theadList: [],
      data: {},
      dialogConfig: {
        title: this.$t('dialog.title.addtarget', {target: this.$t('page.classify')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.name') }]
        },
        catalogName: {
          type: 'text',
          label: this.$t('page.classifytarget', {target: this.$t('page.menu')}),
          maxlength: 50,
          desc: this.$t('term.process.workordercentertypedes')
        },
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          dataList: [
            {
              text: this.$t('page.classifytarget', {target: this.$t('page.personal')}),
              value: 'custom'
            },
            {
              text: this.$t('page.classifytarget', {target: this.$t('page.system')}),
              value: 'system'
            }
          ],
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.type')}) }],
          onChange: (val) => {
            if (val == 'system') {
              this.formConfig.support.isHidden = false; // 个人分类时，隐藏使用范围
              this.formConfig.authList.isHidden = false;
              this.formConfig.isShowTotal.isHidden = false;
            } else {
              this.formConfig.support.isHidden = true;
              this.formConfig.authList.isHidden = true;
              this.formConfig.isShowTotal.isHidden = true;
            }
          }
        },
        support: {
          type: 'select',
          label: this.$t('page.limituser'),
          transfer: true,
          defaultValueIsFirst: true,
          isHidden: true,
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.common.constvalue.DeviceType' }
        },
        authList: {
          type: 'userselect',
          isMultiple: true,
          isHidden: true,
          label: this.$t('page.auth'),
          transfer: true,
          validateList: [{ name: 'required', message: this.$t('page.authuserroleteam') }],
          groupList: ['user', 'role', 'common']
        },
        isShowTotal: {
          type: 'switch',
          label: this.$t('page.showtotal'),
          isHidden: true,
          trueValue: 1,
          falseValue: 0,
          tooltip: this.$t('term.process.workordertypenumdes')
        },
        theadList: {
          type: 'slot',
          label: this.$t('page.defaultthead'),
          tooltip: this.$t('term.process.workcentertheadppolicy')
        }
      },
      isShowTheadSetting: false,
      currentSettingThead: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getWorkcenterTheadList();
  },
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
    save() {
      if (this.$refs['form'].valid()) {
        this.data.theadList = this.theadList;
        this.data.theadList.forEach((item, index) => {
          item.sort = index + 1;
        });
        this.$emit('save', this.data);
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
<style lang="less"></style>
