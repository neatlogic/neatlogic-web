<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
        <span v-else class="tsfont-left text-action" @click="back()">{{ $t('page.back') }}</span>
      </template>
      <template v-slot:topLeft>
        <div v-if="!$utils.isEmpty(eoaConfig)" class="text-title">
          <span class="pr-xs">
            <UserCard :uuid="eoaConfig.fcu" :hideAvatar="true"></UserCard>
          </span>
          <span>{{ eoaConfig.fcd | formatDate }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div v-if="id" class="action-item" @click="deleteTemplate()">
            <span class="tsfont-trash-o">{{ $t('page.delete') }}</span>
          </div>
          <div class="action-item last" @click="saveTemplate()">
            <Button type="primary" :disabled="saving">{{ $t('page.save') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsForm
            ref="eoaForm"
            :itemList="formConfig"
          >
            <template v-slot:stepList>
              <div class="eoa-flow">
                <div class="step-list bg-op radius-sm mb-nm">
                  <div class="pl-nm pr-nm flex-between">
                    <div>#1</div>
                    <div class="action-icon text-action" :class="isShow?'tsfont-down':'tsfont-up'" @click="isShow = !isShow"></div>
                  </div>
                  <div v-show="isShow" class="step-content border-color">
                    <TsFormItem :label="$t('term.process.stepname')" required>
                      <div>{{ $t('dialog.title.createtarget',{'target':$t('term.process.signreport')}) }}</div>
                      <div class="text-tip">
                        {{ $t('term.process.signreporttip') }}
                      </div>
                    </TsFormItem>
                  </div>
                </div>
                <Draggable
                  tag="ul"
                  :list="stepList"
                  handle=".item-sort"
                >
                  <li
                    v-for="(item,index) in stepList"
                    :key="index"
                    class="bg-op radius-sm mb-nm step-list"
                    style="position: relative"
                  >
                    <div class="pl-nm pr-nm flex-between">
                      <div>
                        <span class="tsfont-bar item-sort"></span>
                        <span class="item-index">#{{ index + 2 }}</span>
                      </div>
                      <div class="action-icon">
                        <span class="tsfont-trash-o text-action pr-sm" @click="deleteStep(index)"></span>
                        <span class="text-action" :class="item.isShow?'tsfont-up':'tsfont-down'" @click="toggleshow(item)"></span>
                      </div>
                    </div>
                    <div v-show="item.isShow" class="step-content border-color">
                      <TsRow>
                        <Col span="12">
                          <TsFormItem :label="$t('term.process.stepname')" required>
                            <TsFormInput
                              ref="name"
                              v-model="item.name"
                              :validateList="validateList"
                              :errorMessage="item.errorMessage"
                              @on-change="changeName(item)"
                            ></TsFormInput>
                          </TsFormItem>
                        </Col>
                        <Col span="12">
                          <TsFormItem :label="$t('term.process.approvalpolicy')" required>
                            <PoptipSelect
                              ref="policy"
                              v-model="item.policy"
                              :list="policyList"
                              placement="bottom-end"
                              isRequired
                              transfer
                              @change="changePolicy(item)"
                            ></PoptipSelect>
                          </TsFormItem>
                        </Col>
                        <Col span="12">
                          <TsFormItem :label="$t('term.process.dealwithuser')" :tooltip="$t('term.process.eoadealwithusertip')">
                            <UserSelect
                              v-model="item.userList"
                              :transfer="true"
                              :groupList="['user']"
                              :multiple="item.policy !== 'onePerson'"
                            ></UserSelect>
                          </TsFormItem>
                        </Col>
                        <Col span="12">
                          <TsFormItem :label="$t('page.replytemplate')">
                            <TsFormInput v-model="item.commentTemplate"></TsFormInput>
                          </TsFormItem>
                        </Col>
                      </TsRow>
                    </div>
                  </li>
                </Draggable>
                <Button
                  type="primary"
                  icon="tsfont tsfont-plus"
                  ghost
                  @click="addStep()"
                >{{ $t('term.process.approvalstep') }}</Button>
              </div>
            </template>
          </TsForm>
        </div>  
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Draggable: resolve => require(['vuedraggable'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    PoptipSelect: resolve => require(['@/resources/components/PoptipSelect/PoptipSelect.vue'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      id: null,
      isShow: true,
      saving: false,
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [
            'required',
            { name: 'searchUrl',
              url: '/api/rest/eoa/template/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
              params: { id: null}
            }
          ]
        },
        description: {
          type: 'ckeditor',
          label: this.$t('page.description')
        },
        stepList: {
          type: 'slot',
          label: this.$t('term.process.approvalprocess')
        }
      },
      stepList: [],
      policyList: [],
      validateList: ['required'],
      eoaConfig: {}
    };
  },
  beforeCreate() {},
  created() {
    this.getTypeLit();
    if (this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);
      this.init();
    } else {
      this.loadingShow = false;
    }
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
    init() {
      this.loadingShow = true;
      this.stepList = [];
      this.validName(this.id);
      this.$api.process.eoa.getEoaTemplate({id: this.id}).then(res => {
        if (res.Status === 'OK') {
          this.eoaConfig = res.Return || {};
          Object.keys(this.formConfig).forEach(key => {
            if (this.eoaConfig[key]) {
              this.$set(this.formConfig[key], 'value', this.eoaConfig[key]);
            }
          });
          if (this.eoaConfig.config && !this.$utils.isEmpty(this.eoaConfig.config.stepList)) {
            this.eoaConfig.config.stepList.forEach(item => {
              this.$set(item, 'isShow', true);
              this.stepList.push(item);
            });
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    validName(id = null) {
      // 编辑名称时，名称改回自身，不需要校验
      this.formConfig['name'].validateList.forEach((item) => {
        if (item && item.hasOwnProperty('params')) {
          item.params.id = id || '';
        }
      });
    },
    getTypeLit() {
      let data = { enumClass: 'ApprovalPolicy' };
      this.$api.common.getSelectList(data).then(res => {
        if (res.Status == 'OK') {
          this.policyList = res.Return;
        }
      });
    },
    back() {
      this.$router.push({
        path: '/eoa-template-manage'
      });
    },
    deleteStep(index) {
      this.stepList.splice(index, 1);
    },
    addStep() {
      this.stepList.push({
        name: '',
        policy: '',
        userList: [],
        commentTemplate: '',
        isShow: true
      });
    },
    toggleshow(item) {
      this.$set(item, 'isShow', !item.isShow);
    },
    changeName(item) {
      let findNameList = this.stepList.filter(s => {
        return s.name && s.name === item.name;
      });
      if (findNameList.length > 1) {
        this.$set(item, 'errorMessage', this.$t('message.cannotrepeat', {'target': this.$t('term.process.stepname')}));
      } else {
        this.stepList.forEach(p => {
          this.$set(p, 'errorMessage', '');
        });
      }
    },
    changePolicy(item) {
      this.$set(item, 'user', []);
    },
    valid() {
      let isValid = true;
      if (!this.$refs.eoaForm.valid()) {
        isValid = false;
      }
      if (this.$utils.isEmpty(this.stepList)) {
        isValid = false;
        this.$Notice.warning({
          title: this.$t('term.process.approvalprocess'),
          desc: this.$t('term.process.approvalprocesstip')
        });
      } else {
        //校验名称重复
        this.stepList.forEach(item => {
          if (item.name) {
            this.changeName(item);
          }
          if (item.errorMessage) {
            isValid = false;
          }
        });
        let nameList = this.$refs.name;
        let policyList = this.$refs.policy;
        nameList.forEach(item => {
          if (!item.valid()) {
            isValid = false;
          }
        });
        policyList.forEach(item => {
          if (!item.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    saveTemplate() {
      if (!this.valid()) {
        return;
      }
      let eoaFormData = this.$refs.eoaForm.getFormValue();
      let data = {
        name: eoaFormData.name,
        description: eoaFormData.description || '',
        config: {
          stepList: []
        }
      };
      if (this.id) {
        this.$set(data, 'id', this.id);
      }
      this.stepList.forEach(item => {
        data.config.stepList.push({
          name: item.name,
          policy: item.policy,
          userList: item.userList ? (Array.isArray(item.userList) ? item.userList : [item.userList]) : [],
          commentTemplate: item.commentTemplate || ''
        });
      });
      this.$api.process.eoa.saveEoaTemplate(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          if (!this.id) {
            this.id = res.Return;
          }
          this.init();
        }
      });
    },
    deleteTemplate() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.template')}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: this.id };
          this.$api.process.eoa.deleteEoaTemplate(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$router.push({
                path: './eoa-template-manage'
              });
            }
          });
          vnode.isShow = false;
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
.eoa-flow {
  .item-sort{
    display: none;
    cursor: move;
  }
  .step-list{
    &:hover{
      .item-sort{
        display: inline-block;
      }
      .item-index{
        display: none;
      }
      .action-icon {
        display: block;
      }
    }
  }
  .action-icon {
    display: none;
  }
  .step-content {
    border-top: 1px solid;
    padding: 16px;
  }
}
</style>
