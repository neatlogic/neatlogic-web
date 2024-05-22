<template>
  <div class="templateDialog">
    <div class="template-content">
      <div class="info-list">
        <div class="title text-grey">
          <div class="basic-top">{{ $t('page.basicinfo') }}</div>
          <div class="dividing-color line-top"></div>
          <div class="basic-top">
            <TsFormSwitch
              v-model="sopBasicData.isActive"
              :true-value="1"
              :false-value="0"
              :showStatus="true"
              :disabled="sopBasicData.changeTemplateList.length > 0 ? true: false"
            ></TsFormSwitch>
          </div>
        </div>
        <div>
          <div class="bg-block basic-main radius-lg">
            <TsRow>
              <Col span="24" class="sop-name">
                <TsForm
                  ref="changeName"
                  v-model="sopBasicData"
                  :itemList="nameForm"
                  labelPosition="top"
                ></TsForm>
              </Col>
              <Col span="12">
                <div class="change-tip">
                  <span class="text-grey">{{ $t('page.group') }}</span>
                  <Tooltip
                    placement="bottom"
                    max-width="300"
                    transfer
                    theme="light"
                  >
                    <i class="tsfont-info-o cursor-pointer text-title"></i>
                    <div slot="content">
                      <p>{{ $t('term.process.changegrouptip') }}</p>
                    </div>
                  </Tooltip>
                </div>
                <div class="change-text">
                  <UserSelect
                    v-model="sopBasicData.authority"
                    :groupList="groupList"
                    :multiple="false"
                    border="none"
                    class="text-input"
                    style="display: inline-block;"
                    transfer
                  ></UserSelect>
                </div>
              </Col>
              <Col span="12">
                <div class="change-tip">
                  <span class="text-grey">{{ $t('page.type') }}</span>
                  <Tooltip
                    placement="bottom"
                    max-width="300"
                    transfer
                    theme="light"
                  >
                    <i class="tsfont-info-o cursor-pointer text-title"></i>
                    <div slot="content">
                      <p>{{ $t('term.process.changetypetip') }}</p>
                    </div>
                  </Tooltip>
                </div>
                <div class="change-text">
                  <TsFormSelect
                    v-model="sopBasicData.type"
                    :dataList="typeList"
                    border="none"
                    :search="true"
                    :allowCreate="true"
                    class="text-input"
                    style="display: inline-block;width:auto;"
                    transfer
                    @on-create="typeListCreate"
                  ></TsFormSelect>
                </div>
              </Col>
            </TsRow>
          </div>
        </div>
      </div>
      <div class="info-list">
        <ChangeStepDetail ref="changeStepList" :changeStepList="changeSopStepList"></ChangeStepDetail>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'TemplateDialog',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    ChangeStepDetail: () => import('./changestep-edit.vue')
  },
  filters: {},
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      sopBasicData: {
        id: null,
        isActive: 1,
        name: null,
        authority: null,
        type: null,
        changeTemplateList: []
      },
      typeList: [],
      groupList: ['team'],
      changeSopStepList: [],
      nameForm: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.templatename'),
          validateList: [
            { name: 'required', message: this.$t('form.placeholder.name') },
            { name: 'searchUrl', url: 'api/rest/change/sop/save', key: 'name', params: () => ({id: this.config.id})}
          ]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getSopType();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    validSopData() {
      //校验
      let isValid = true;
      let changeName = this.$refs.changeName;
      if (!changeName.valid()) {
        isValid = false;
      }
      return isValid;
    },
    sopData() {
      let data = Object.assign({}, this.sopBasicData);
      let changeSopStepList = this.$refs.changeStepList.saveData();
      this.$set(data, 'changeSopStepList', changeSopStepList);
      return data;
    },
    getSopType() {
      let data = {};
      this.$api.process.change.changeSopTypeList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.typeList = obj.changeSopTypeList;
        }
      });
    },
    typeListCreate(val) {
      //类型创建
      this.typeList.push({
        value: val,
        text: val
      });
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        if (val) {
          Object.keys(this.sopBasicData).forEach(e => {
            if (JSON.stringify(val[e])) {
              this.sopBasicData[e] = val[e];
            }
          });
          this.changeSopStepList = val.changeSopStepList || [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.templateDialog {
  .basic-main {
    padding: 10px 20px;
    .change-tip {
      padding-bottom: 8px;
      .text-grey{
        padding-right: 4px;
      }
    }
  }
  .title {
    display: flex;
    padding-bottom: 10px;
  }
  .line-top {
    width: 1px;
    margin: 0 10px;
    border-left: 1px solid;
  }
  .sop-name {
    margin-bottom: 16px;
  }
  .text-input {
    display: inline-block;
  }

  /deep/ .select-top.ivu-input {
    padding-right: 30px;
  }
  .info-list {
    margin-bottom: 12px;
  }
}
</style>
