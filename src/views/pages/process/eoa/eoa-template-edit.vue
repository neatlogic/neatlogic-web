<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="gotoManage()">{{ $t('page.back') }}</span>
      </template>
      <template v-slot:topLeft>
        <div>
          <span>修改人</span>
          <span>时间</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item" @click="deleteTemplate()">
            <span class="tsfont-trash-o">{{ $t('page.delete') }}</span>
          </div>
          <div class="action-item" @click="saveTemplate()">
            <Button type="primary" :disabled="saving">{{ $t('page.save') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsForm
            :itemList="formConfig"
          >
            <template v-slot:flow>
              <div class="eoa-flow">
                <div class="step-list bg-op radius-sm mb-nm">
                  <div class="pl-nm pr-nm flex-between">
                    <div>#1</div>
                    <div class="action-icon text-action" :class="isShow?'tsfont-down':'tsfont-up'" @click="isShow = !isShow"></div>
                  </div>
                  <div v-show="isShow" class="step-content border-color">
                    <TsFormItem label="步骤名称" required>
                      <div>创建签报</div>
                      <div class="text-tip">
                        所有审批流第1个步骤，均为创建签报步骤，不支持修改。创建签报的处理人，为流程中EOA节点的处理人，在流程管理中设置。
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
                        <span class="tsfont-trash-o text-action pr-sm"></span>
                        <span class="text-action" :class="item.isShow?'tsfont-up':'tsfont-down'" @click="toggleshow(item)"></span>
                      </div>
                    </div>
                    <div v-show="item.isShow" class="step-content border-color">
                      <TsRow>
                        <Col span="12">
                          <TsFormItem label="步骤名称" required>
                            <TsFormInput v-model="item.name"></TsFormInput>
                          </TsFormItem>
                        </Col>
                        <Col span="12">
                          <TsFormItem label="审批策略" required>
                            <PoptipSelect
                              ref="policy"
                              v-model="item.policy"
                              :list="policyList"
                              placement="bottom-end"
                              isRequired
                              transfer
                            ></PoptipSelect>
                          </TsFormItem>
                        </Col>
                        <Col span="12">
                          <TsFormItem label="处理人" tooltip="模板设置处理人后，编辑流程时中不可修改处理人">
                            <UserSelect
                              v-model="item.user"
                              :transfer="true"
                              :groupList="['user']"
                            ></UserSelect>
                          </TsFormItem>
                        </Col>
                        <Col span="12">
                          <TsFormItem label="回复模板">
                            <TsFormInput v-model="item.content"></TsFormInput>
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
                >审批步骤</Button>
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
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isShow: true,
      saving: false,
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required']
        },
        desc: {
          type: 'ckeditor',
          label: this.$t('page.description')
        },
        flow: {
          type: 'slot',
          label: '审批流'
        }
      },
      stepList: [
        {
          name: 'ooo',
          isShow: true
        },
        {
          name: 'sad',
          isShow: true
        }
      ],
      policyList: [
        {
          value: '1',
          text: '单人',
          description: '设置唯一审批人，同意后通过'
        },
        {
          value: '2',
          text: '会签',
          description: '设置多位审批人，所有人同意后审批通过'
        },
        {
          value: '3',
          text: '或签',
          description: '设置多位审批人，任意一人同意后审批通过'
        },
        {
          value: '4',
          text: '投票',
          description: '设置多位审批人，超过半数同意后审批通过'
        },
        {
          value: '5',
          text: '传阅',
          description: '审批人传阅审批流程，不参与否决，仅查看'
        }
      ]
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
    gotoManage() {},
    deleteTemplate() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.template')}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: this.id };
          // this.$api.process.eoa.deleteEoaTemplate(data).then(res => {
          //   if (res.Status == 'OK') {
          //     this.$Message.success(this.$t('message.deletesuccess'));
          //     this.$router.push({
          //       path: './eoa-template-manage'
          //     });
          //   }
          // });
          vnode.isShow = false;
        }
      });
    },
    saveTemplate() {
      let data = {};
      // this.$api.process.eoa.saveEoaTemplate(data).then(res => {
      //   if (res.Status == 'OK') {
      //     this.$Message.success(this.$t('message.savesuccess'));
      //   }
      // });
    },
    addStep() {
      this.stepList.push({
        name: 'sad11',
        isShow: true
      });
    },
    toggleshow(item) {
      this.$set(item, 'isShow', !item.isShow);
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
