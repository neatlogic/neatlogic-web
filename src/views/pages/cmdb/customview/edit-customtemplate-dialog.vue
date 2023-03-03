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
              <span class="text-href">帮助</span>
              <div slot="content">
                <div>模板需要符合vue模板语法规范，必须指定一个根标签，一般是div。</div>
                <Divider orientation="start" style="margin:0px">内部组件列表</Divider>
                <div>
                  <Tag>TsFormInput</Tag>
                  <Tag>TsFormCheckbox</Tag>
                  <Tag>TsFormRadio</Tag>
                  <Tag>TsFormSelect</Tag>
                  <Tag>TsFormSwitch</Tag>
                  <Tag>TsFormDatePicker</Tag>
                  <Tag>TsTable</Tag>
                </div>
                <Divider orientation="start" style="margin:0px">内部属性列表</Divider>
                <div>
                  <ul>
                    <li>
                      <b>dataList</b>
                      <span class="ml-xs">数据集，所有数据都从dataList中获取，dataList是一个json对象数组</span>
                    </li>
                    <li>
                      <b>currentPage</b>
                      <span class="ml-xs">当前页，系统默认返回第一页数据，可以通过$emit('changeCurrentPage',数字)来修改</span>
                    </li>
                    <li>
                      <b>pageSize</b>
                      <span class="ml-xs">每页大小，默认20，可以通过$emit('changePageSize',数字)来修改</span>
                    </li>
                    <li>
                      <b>hasMoreData</b>
                      <span class="ml-xs">是否有下一页数据，系统会自动计算，不能修改</span>
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
      <Button @click="close()">取消</Button>
      <Button v-if="!isNew" type="error" @click="deleteTemplate()">删除</Button>
      <Button type="primary" @click="save()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
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
          label: '名称',
          maxlength: 50,
          validateList: ['required']
        },
        isActive: {
          type: 'switch',
          label: '激活',
          trueValue: 1,
          falseValue: 0
        },
        template: {
          type: 'slot',
          validateList: ['required'],
          label: '模板'
        },
        config: {
          type: 'slot',
          label: '配置'
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
        content: '确认删除当前自定义模板？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.customview.deleteCustomViewTemplate(this.id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.content.deletesuccess'));
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
