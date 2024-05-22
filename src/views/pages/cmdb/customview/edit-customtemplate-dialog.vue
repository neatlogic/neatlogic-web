<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm ref="form" v-model="customViewData" :item-list="formConfig">
        <template v-slot:config>
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
                <div>{{ $t('message.cmdb.customviewconfighelp') }}</div>
                <TsCodemirror
                  v-if="isReady"
                  :isReadOnly="true"
                  :value="configSample"
                  codeMode="json"
                ></TsCodemirror>
              </div>
            </Poptip>
          </div>
          <div>
            <TsCodemirror v-model="customViewData.config" codeMode="json"></TsCodemirror>
          </div>
        </template>
        <template v-slot:template>
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
                <div>{{ $t('message.cmdb.customviewcontenthelp') }}</div>
                <Divider orientation="start" style="margin:0px">{{ $t('term.cmdb.componentlist') }}</Divider>
                <div>
                  <Tag>TsFormInput</Tag>
                  <Tag>TsFormCheckbox</Tag>
                  <Tag>TsFormRadio</Tag>
                  <Tag>TsFormSelect</Tag>
                  <Tag>TsFormSwitch</Tag>
                  <Tag>TsFormDatePicker</Tag>
                  <Tag>TsTable</Tag>
                </div>
                <Divider orientation="start" style="margin:0px">{{ $t('term.cmdb.innerattributelist') }}</Divider>
                <div>
                  <ul>
                    <li>
                      <b>dataList</b>
                      <span class="ml-xs">{{ $t('message.cmdb.customviewcontenthelp1') }}</span>
                    </li>
                    <li>
                      <b>currentPage</b>
                      <span class="ml-xs">{{ $t('message.cmdb.customviewcontenthelp2') }}</span>
                    </li>
                    <li>
                      <b>pageSize</b>
                      <span class="ml-xs">{{ $t('message.cmdb.customviewcontenthelp3') }}</span>
                    </li>
                    <li>
                      <b>hasMoreData</b>
                      <span class="ml-xs">{{ $t('message.cmdb.customviewcontenthelp4') }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Poptip>
          </div>
          <TsCodemirror
            ref="template"
            v-model="customViewData.template"
            codeMode="htmlmixed"
            :validateList="['required']"
          ></TsCodemirror>
        </template>
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button v-if="!isNew" type="error" @click="deleteTemplate()">{{ $t('page.delete') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      isReady: false,
      configSample: '{\n\tmethods:{\n\t\tchangeName(newName){\n\t\t\tthis.name = newName;\/\/name是数据中的属性\n\t\t}\n\t},\n\tcomputed:{\n\t\tfinalDataList(){\n\t\t\treturn this.dataList.splice(0);\n\t\t}\n\t}\n}',
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      isNew: true,
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required']
        },
        isActive: {
          type: 'switch',
          label: this.$t('page.enable'),
          trueValue: 1,
          falseValue: 0
        },
        template: {
          type: 'slot',
          validateList: ['required'],
          label: this.$t('page.template')
        },
        config: {
          type: 'slot',
          label: this.$t('page.config')
        }
      },
      customViewData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
      if (this.id) {
        this.$api.cmdb.customview.getCustomViewTemplateById(this.id).then(res => {
          if (res.Return) {
            this.customViewData = res.Return;
            this.isNew = false;
          } else {
            this.customViewData = { customViewId: this.id, isActive: 1 };
            this.isNew = true;
          }
        });
      } else {
        this.customViewData = { customViewId: this.id, isActive: 1 };
        this.isNew = true;
      }
    },
    close() {
      this.$emit('close');
    },
    deleteTemplate() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.template')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.customview.deleteCustomViewTemplate(this.id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.close();
            }
          });
        }
      });
    },
    save() {
      let isValid = true;
      if (this.$refs['form'] && !this.$refs['form'].valid()) {
        isValid = false;
      }
      if (this.$refs['template'] && !this.$refs['template'].valid()) {
        isValid = false;
      }
      if (isValid) {
        this.$api.cmdb.customview.saveCustomViewTemplate(this.customViewData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close();
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
