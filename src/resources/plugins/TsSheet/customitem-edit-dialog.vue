<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close()" @on-ok="save()">
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
                      <span class="text-href">{{ $t('page.help') }}</span>
                      <div slot="content">
                        <div>{{ $t('message.framework.formcostomhelp') }}：</div>
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
                <TabPane :label="$t('page.config')" name="viewTemplateConfig">
                  <div>
                    <Poptip
                      trigger="hover"
                      word-wrap
                      width="400"
                      placement="right"
                      :transfer="true"
                      @on-popper-show="isReady = true"
                    >
                      <span class="text-href">{{ $t('page.help') }}</span>
                      <div slot="content">
                        <div>{{ $t('message.framework.formcustomjshelp') }}：</div>
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
                <TabPane :label="$t('page.test')" name="viewTemplateTest">
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
                <TabPane :label="$t('page.template')" name="configTemplate">
                  <div>
                    <Poptip
                      word-wrap
                      width="400"
                      trigger="hover"
                      placement="right"
                      :transfer="true"
                    >
                      <span class="text-href">{{ $t('page.help') }}</span>
                      <div slot="content">
                        <div>{{ $t('message.framework.formcostomhelp') }}：</div>
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
                <TabPane :label="$t('page.config')" name="configTemplateConfig">
                  <div>
                    <Poptip
                      trigger="hover"
                      word-wrap
                      width="400"
                      placement="right"
                      :transfer="true"
                      @on-popper-show="isReady = true"
                    >
                      <span class="text-href">{{ $t('page.help') }}</span>
                      <div slot="content">
                        <div>{{ $t('message.framework.formcustomjshelp') }}：</div>
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
                    {{ $t('page.isrequired') }}
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
                    {{ $t('page.isreadonly') }}
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
                    {{ $t('page.isdisabled') }}
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
                    {{ $t('page.ismask') }}
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
                    {{ $t('page.ishidden') }}
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
                    {{ $t('page.width') }}
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
                    {{ $t('page.description') }}
                  </Checkbox>
                </div>
                <div class="text-grey">{{ $t('message.framework.selectcusconfig') }}</div>
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
                <div class="text-grey">{{ $t('message.framework.selectcusaction') }}</div>
              </div>
            </template>
          </TsForm>
        </div>
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
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('term.framework.customitem')}) : this.$t('dialog.title.addtarget', {'target': this.$t('term.framework.customitem')}),
        type: 'slider',
        width: 'large',
        isShow: true
      },
      configTemplateTab: 'configTemplate',
      viewTemplateTab: 'viewTemplate',
      reactionList: [
        { value: 'mask', text: this.$t('page.invisible') },
        { value: 'hide', text: this.$t('page.hide') },
        { value: 'display', text: this.$t('page.display') },
        { value: 'readonly', text: this.$t('page.readonly') },
        { value: 'disable', text: this.$t('page.disable') },
        { value: 'setvalue', text: this.$t('term.framework.assignment') },
        { value: 'filter', text: this.$t('page.filters') },
        { value: 'emit', text: this.$t('page.emit') }
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
          label: this.$t('page.uniquekey'),
          maxlength: 50
        },
        label: {
          type: 'text',
          validateList: ['required'],
          label: this.$t('term.autoexec.displayname'),
          maxlength: 50
        },
        icon: {
          type: 'slot',
          label: this.$t('page.icon')
        },
        isActive: {
          type: 'switch',
          trueValue: 1,
          falseValue: 0,
          validateList: ['required'],
          label: this.$t('page.enable')
        },
        hasValue: {
          type: 'slot',
          label: this.$t('term.framework.ishasvalue')
        },
        config: {
          type: 'slot',
          label: this.$t('page.config')
        },
        reaction: {
          type: 'slot',
          label: '交互'
        },
        configTemplate: {
          type: 'slot',
          label: this.$t('term.framework.compconfigtemp')
        },
        viewTemplate: {
          type: 'slot',
          label: this.$t('term.framework.comptemp'),
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
            this.$Message.success(this.$t('message.savesuccess'));
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
        label: this.testCustomItemData.label || this.$t('term.framework.customitem'),
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
