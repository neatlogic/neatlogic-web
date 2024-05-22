<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close()">
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="customTemplateData" :item-list="formConfig">
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
                    <div>{{ $t('term.autoexec.configdesc') }}</div>
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
                <TsCodemirror v-model="customTemplateData.config" codeMode="json"></TsCodemirror>
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
                    <div>{{ $t('term.autoexec.templatedesc') }}</div>
                    <div>
                      <Tag>TsFormInput</Tag>
                      <Tag>TsFormCheckbox</Tag>
                      <Tag>TsFormRadio</Tag>
                      <Tag>TsFormSelect</Tag>
                      <Tag>TsFormSwitch</Tag>
                      <Tag>TsFormDatePicker</Tag>
                      <Tag>TsTable</Tag>
                      <Tag>NoData</Tag>
                    </div>
                  </div>
                </Poptip>
              </div>
              <TsCodemirror
                ref="template"
                v-model="customTemplateData.template"
                codeMode="htmlmixed"
                :validateList="validateList"
              ></TsCodemirror>
            </template>
          </TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
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
      configSample: '{\n\tmethods:{\n\t\tchangeName(newName){\n\t\t\tthis.name = newName;\/\/name' + this.$t('term.autoexec.isdataproperties') + '\n\t\t}\n\t}\n}',
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', {target: this.$t('page.template')}) : this.$t('dialog.title.addtarget', {target: this.$t('page.template')}),
        type: 'modal',
        width: 'medium',
        isShow: true
      },
      customTemplateData: {
        isActive: 0
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          validateList: ['required'],
          label: this.$t('page.name')
        },
        isActive: {
          type: 'switch',
          validateList: ['required'],
          label: this.$t('page.enable')
        },
        template: {
          type: 'slot',
          label: this.$t('page.template'),
          validateList: ['required']
        },
        config: {
          type: 'slot',
          label: this.$t('page.config')
        }
      },
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getCustomTemplateById();
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
    getCustomTemplateById() {
      this.$api.autoexec.customtemplate.getCustomTemplateById(this.id).then(res => {
        this.customTemplateData = res.Return;
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid() && this.$refs.template.valid()) {
        this.$api.autoexec.customtemplate.saveCustomTemplate(this.customTemplateData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
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
