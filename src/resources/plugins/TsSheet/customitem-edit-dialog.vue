<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close()">
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="customItemData" :item-list="formConfig">
            <template v-slot:icon>
              <div class="logo bg-block border-color text-primary radius-sm" @click="isIconDialogShow = true">
                <i class="logo-icon" :class="customItemData.icon"></i>
              </div>
            </template>
            <template v-slot:viewTemplate>
              <Tabs v-model="viewTemplateTab">
                <TabPane label="模板" name="viewTemplate">
                  <div>
                    <Poptip
                      word-wrap
                      width="400"
                      trigger="hover"
                      placement="right"
                      :transfer="true"
                    >
                      <span class="text-href">帮助</span>
                      <div slot="content">
                        <div>模板需要符合vue模板语法规范，必须指定一个根标签，一般是div，支持所有iView组件，也支持以下内部组件：</div>
                        <div>
                          <Tag>TsFormItem</Tag>
                          <Tag>TsFormInput</Tag>
                          <Tag>TsFormCheckbox</Tag>
                          <Tag>TsFormRadio</Tag>
                          <Tag>TsFormSelect</Tag>
                          <Tag>TsFormSwitch</Tag>
                          <Tag>TsFormDatePicker</Tag>
                          <Tag>TsTable</Tag>
                        </div>
                      </div>
                    </Poptip>
                  </div>
                  <TsCodemirror
                    ref="viewTemplate"
                    v-model="customItemData.viewTemplate"
                    codeMode="htmlmixed"
                    :validateList="validateList"
                  ></TsCodemirror>
                </TabPane>
                <TabPane label="配置" name="viewTemplateConfig">
                  <div>
                    <Poptip
                      trigger="hover"
                      word-wrap
                      width="400"
                      placement="right"
                      :transfer="true"
                      @on-popper-show="isReady = true"
                    >
                      <span class="text-href">帮助</span>
                      <div slot="content">
                        <div>配置是一段javascript代码，需要定义包含methods等属性的对象，例如：</div>
                        <TsCodemirror
                          v-if="isReady"
                          :isReadOnly="true"
                          :value="configSample"
                          codeMode="json"
                        ></TsCodemirror>
                      </div>
                    </Poptip>
                  </div>
                  <TsCodemirror ref="viewTemplateConfig" v-model="customItemData.viewTemplateConfig" codeMode="javascript"></TsCodemirror>
                </TabPane>
                <TabPane label="测试" name="viewTemplateTest">
                  <div>
                    <FormItem
                      v-if="viewTemplateTab === 'viewTemplateTest'"
                      :customFormItem="customFormItem"
                      :formItem="formItem"
                      :formItemList="[formItem]"
                      mode="read"
                    ></FormItem>
                  </div>
                </TabPane>
              </Tabs>
            </template>
            <template v-slot:configTemplate>
              <Tabs v-model="configTemplateTab">
                <TabPane label="模板" name="configTemplate">
                  <div>
                    <Poptip
                      word-wrap
                      width="400"
                      trigger="hover"
                      placement="right"
                      :transfer="true"
                    >
                      <span class="text-href">帮助</span>
                      <div slot="content">
                        <div>模板需要符合vue模板语法规范，必须指定一个根标签，一般是div，支持所有iView组件，也支持以下内部组件：</div>
                        <div>
                          <Tag>TsFormItem</Tag>
                          <Tag>TsFormInput</Tag>
                          <Tag>TsFormCheckbox</Tag>
                          <Tag>TsFormRadio</Tag>
                          <Tag>TsFormSelect</Tag>
                          <Tag>TsFormSwitch</Tag>
                          <Tag>TsFormDatePicker</Tag>
                          <Tag>TsTable</Tag>
                        </div>
                      </div>
                    </Poptip>
                  </div>
                  <TsCodemirror
                    ref="configTemplate"
                    v-model="customItemData.configTemplate"
                    codeMode="htmlmixed"
                    :validateList="validateList"
                  ></TsCodemirror>
                </TabPane>
                <TabPane label="配置" name="configTemplateConfig">
                  <div>
                    <Poptip
                      trigger="hover"
                      word-wrap
                      width="400"
                      placement="right"
                      :transfer="true"
                      @on-popper-show="isReady = true"
                    >
                      <span class="text-href">帮助</span>
                      <div slot="content">
                        <div>配置是一段javascript代码，需要定义包含methods等属性的对象，例如：</div>
                        <TsCodemirror
                          v-if="isReady"
                          :isReadOnly="true"
                          :value="configSample"
                          codeMode="json"
                        ></TsCodemirror>
                      </div>
                    </Poptip>
                  </div>
                  <TsCodemirror ref="configTemplateConfig" v-model="customItemData.configTemplateConfig" codeMode="javascript"></TsCodemirror>
                </TabPane>
                <TabPane label="测试" name="configTemplateTest">
                  <FormItemConfig
                    v-if="configTemplateTab === 'configTemplateTest'"
                    :formItem="formItem"
                    :customFormItem="customFormItem"
                    :formItemList="[formItem]"
                    class="form-item-config bg-grey border-base-left"
                  ></FormItemConfig>
                </TabPane>
              </Tabs>
            </template>
            <template v-slot:hasValue>
              <TsFormSwitch
                :value="customItemData.config.hasValue || false"
                :trueValue="true"
                :falseValue="false"
                @on-change="
                  val => {
                    $set(customItemData.config, 'hasValue', val);
                  }
                "
              ></TsFormSwitch>
            </template>
            <template v-slot:config>
              <div>
                <div>
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.config.hasOwnProperty('isRequired')"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.config, 'isRequired', false);
                        } else {
                          $delete(customItemData.config.config, 'isRequired');
                        }
                      }
                    "
                  >
                    是否必填
                  </Checkbox>
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.config.hasOwnProperty('isReadOnly')"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.config, 'isReadOnly', false);
                        } else {
                          $delete(customItemData.config.config, 'isReadOnly');
                        }
                      }
                    "
                  >
                    是否只读
                  </Checkbox>
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.config.hasOwnProperty('isDisabled')"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.config, 'isDisabled', false);
                        } else {
                          $delete(customItemData.config.config, 'isDisabled');
                        }
                      }
                    "
                  >
                    是否禁用
                  </Checkbox>
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.config.hasOwnProperty('isMask')"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.config, 'isMask', false);
                        } else {
                          $delete(customItemData.config.config, 'isMask');
                        }
                      }
                    "
                  >
                    是否不可见
                  </Checkbox>
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.config.hasOwnProperty('isHide')"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.config, 'isHide', false);
                        } else {
                          $delete(customItemData.config.config, 'isHide');
                        }
                      }
                    "
                  >
                    是否隐藏
                  </Checkbox>
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.config.hasOwnProperty('width')"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.config, 'width', '100%');
                        } else {
                          $delete(customItemData.config.config, 'width');
                        }
                      }
                    "
                  >
                    宽度
                  </Checkbox>
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.config.hasOwnProperty('description')"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.config, 'description', '');
                        } else {
                          $delete(customItemData.config.config, 'description');
                        }
                      }
                    "
                  >
                    描述
                  </Checkbox>
                </div>
                <div class="text-grey">选择当前自定义组件可以使用的基本配置</div>
              </div>
            </template>
            <template v-slot:reaction>
              <div>
                <div>
                  <Checkbox
                    v-for="(reaction, index) in reactionList"
                    :key="index"
                    :true-value="true"
                    :false-value="false"
                    :value="!!customItemData.config.reaction.hasOwnProperty(reaction.value)"
                    @on-change="
                      val => {
                        if (val) {
                          $set(customItemData.config.reaction, reaction.value, {});
                        } else {
                          $delete(customItemData.config.reaction, reaction.value);
                        }
                      }
                    "
                  >
                    {{ reaction.text }}
                  </Checkbox>
                </div>
                <div class="text-grey">选择当前自定义组件可以使用的交互操作</div>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="customItemData.icon"
      @cancel="isIconDialogShow = false"
      @confirm="selectIcon"
    ></IconDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve),
    IconDialog: resolve => require(['@/views/pages/common/icon-dialog.vue'], resolve),
    FormItem: resolve => require(['@/resources/plugins/TsSheet/form-item.vue'], resolve),
    FormItemConfig: resolve => require(['@/resources/plugins/TsSheet/form-item-config.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      isReady: false,
      isIconDialogShow: false,
      configSample: '{\n\tmethods:{\n\t\tchangeName(newName){\n\t\t\tthis.name = newName;\/\/name是数据中的属性\n\t\t}\n\t}\n}',
      dialogConfig: {
        title: this.id ? '编辑自定义组件' : '添加自定义组件',
        type: 'slider',
        width: 'large',
        isShow: true
      },
      configTemplateTab: 'configTemplate',
      viewTemplateTab: 'viewTemplate',
      reactionList: [
        { value: 'mask', text: '不可见' },
        { value: 'hide', text: '隐藏' },
        { value: 'display', text: '显示' },
        { value: 'readonly', text: '只读' },
        { value: 'disable', text: '禁用' },
        { value: 'setvalue', text: '赋值' },
        { value: 'filter', text: '过滤' },
        { value: 'emit', text: '触发' }
      ],
      customItemData: {
        isActive: 1,
        icon: 'tsfont-block',
        config: { config: {}, reaction: {} }
      },
      testCustomItemData: {}, //用于测试的数据，从customItemData复制而来，避免保存时干扰customItemData的数据
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          validateList: ['required', 'char'],
          label: '唯一标识',
          maxlength: 50
        },
        label: {
          type: 'text',
          validateList: ['required'],
          label: '显示名',
          maxlength: 50
        },
        icon: {
          type: 'slot',
          label: '图标'
        },
        isActive: {
          type: 'switch',
          trueValue: 1,
          falseValue: 0,
          validateList: ['required'],
          label: '激活'
        },
        hasValue: {
          type: 'slot',
          label: '是否有返回值'
        },
        config: {
          type: 'slot',
          label: '配置'
        },
        reaction: {
          type: 'slot',
          label: '交互'
        },
        configTemplate: {
          type: 'slot',
          label: '组件配置模板'
        },
        viewTemplate: {
          type: 'slot',
          label: '组件模板',
          validateList: ['required']
        }
      },
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getCustomItemById();
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
    getCustomItemById() {
      this.$api.framework.form.getCustomItemById(this.id).then(res => {
        const element = res.Return;
        let { id, name, isActive, icon, label, type = 'custom', name: handler, config, viewTemplate, configTemplate, viewTemplateConfig, configTemplateConfig } = element;
        this.customItemData = { id, name, isActive, icon, label, type, handler, config, viewTemplate, configTemplate, viewTemplateConfig, configTemplateConfig };
      });
    },
    selectIcon: function(icon) {
      this.isIconDialogShow = false;
      this.$set(this.customItemData, 'icon', icon);
      this.$nextTick(() => {});
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid() && this.$refs['viewTemplate'].valid()) {
        this.$api.framework.form.saveCustomItem(this.customItemData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    formItem() {
      const formItem = {
        handler: this.testCustomItemData.name || 'customitem',
        label: this.testCustomItemData.label || '自定义组件',
        type: 'custom',
        config: this.testCustomItemData.config.config,
        reaction: this.testCustomItemData.config.reaction
      };
      return formItem;
    },
    customFormItem() {
      return this.$utils.deepClone(this.customItemData);
    }
  },
  watch: {
    customItemData: {
      handler(val) {
        this.testCustomItemData = this.$utils.deepClone(this.customItemData);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
  }
  &::after {
    content: '更换';
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}
</style>
