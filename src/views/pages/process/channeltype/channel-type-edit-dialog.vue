<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <TsForm
          ref="form"
          :itemList="formSetting"
        >
          <template slot="color">
            <Poptip
              class="channeltype-color"
              trigger="hover"
              placement="bottom-start"
              popper-class="channeltype-color"
              padding="0px"
              offset="25"
              transfer
              @on-popper-show="isColorListShow = true"
              @on-popper-hide="isColorListShow = false"
            >
              <div class="color-selected">
                <div class="color-block radius-sm" :style="{backgroundColor:selectedColor}"></div>
                <i class="tsfont-down" :class="{'arrow-rotate':isColorListShow}"></i>
              </div>
              <div slot="content">
                <ul class="color-block-list">
                  <li
                    v-for="color in colorList"
                    :key="color"
                    class="color-block color-block-item radius-sm"
                    :class="{'border-primary':color === selectedColor}"
                    :style="{backgroundColor:color}"
                    @click="selectedColor = color"
                  ></li>
                </ul>
              </div>
            </Poptip>
          </template>
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    uuid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isColorListShow: false,
      policyList: [],
      dialogSetting: {
        type: 'modal',
        title: this.uuid ? this.$t('dialog.title.edittarget', {target: this.$t('term.process.sertype')}) : this.$t('dialog.title.addtarget', {target: this.$t('term.process.sertype')}),
        isShow: true,
        width: 'medium'
      },
      colorList: [
        '#D18CBD',
        '#FFBA5A',
        '#78D8DE',
        '#A78375',
        '#B9D582',
        '#898DDD',
        '#F3E67B',
        '#527CA6',
        '#50BFF2',
        '#FF6666',
        '#15BF81',
        '#90A4AE'
      ],
      selectedColor: '#50BFF2',
      formSetting: [],
      defaultFormSetting: [
        {
          type: 'text',
          name: 'uuid',
          isHidden: true,
          label: this.$t('page.primarykey'),
          value: null
        },
        {
          type: 'text',
          name: 'name',
          maxlength: 30,
          label: this.$t('page.name'),
          value: '',
          validateList: [
            'required',
            { 
              name: 'searchUrl', 
              url: 'api/rest/process/channeltype/save',
              message: this.$t('message.targetisexists', {target: this.$t('term.process.sertype')}),
              params: () => ({uuid: this.uuid})
            }
          ]
        },
        {
          type: 'radio',
          name: 'isActive',
          value: 1,
          label: this.$t('page.status'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.enable') },
            { value: 0, text: this.$t('page.disable') }
          ]
        },
        {
          type: 'text',
          name: 'prefix',
          maxlength: 30,
          label: this.$t('term.process.worknumper'),
          validateList: ['required'],
          value: ''
        },
        {
          type: 'select',
          name: 'handler',
          label: this.$t('term.process.worknumrules'),
          validateList: ['required'],
          url: '/api/rest/processtask/serialnumber/policy/list',
          textName: 'name',
          valueName: 'handler',
          onChange: this.handleHandler,
          value: ''
        },
        {
          name: 'color',
          type: 'slot',
          value: '#50BFF2',
          label: this.$t('page.color'),
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.description'),
          value: ''
        }
      ]
    };
  },
  beforeCreate() {},
  async created() {
    this.formSetting = this.$utils.deepClone(this.defaultFormSetting);
    await this.searchPolicyList();
    this.searchData();
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
    searchData() {
      if (this.$utils.isEmpty(this.uuid)) {
        return false;
      }
      let params = { uuid: this.uuid, timestamp: new Date().getTime() };
      this.$api.process.channeltype
        .get(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.handleHandler(res.Return['handler']);
            this.selectedColor = res.Return['color'];
            this.formSetting.forEach(item => {
              if (item?.name) {
                item.value = res.Return[item.name];
              }
            });
          }
        });
    },
    handleHandler(data) {
      const formSetting = this.$utils.deepClone(this.formSetting);
      const formValue = {};
      const formAttributeList = [];

      this.defaultFormSetting.forEach(item => {
        if (item?.name) {
          const selectedValue = formSetting.find(formItem => formItem.name === item.name);
          if (selectedValue) {
            formValue[item.name] = selectedValue.value;
          }
        }
      });

      this.formSetting = this.$utils.deepClone(this.defaultFormSetting);

      const obj = this.policyList.find(d => d.handler === data);
      if (obj) {
        if (obj.formAttributeList && obj.formAttributeList.length) {
          obj.formAttributeList.forEach(f => {
            formAttributeList.push({
              ...f,
              value: f.defaultValue ?? null,
              width: '100%'
            });
          });
        }

        this.formSetting.forEach(item => {
          if (item?.name && formValue[item.name]) {
            item.value = formValue[item.name];
          }
        });
  
        this.formSetting.splice(5, 0, ...formAttributeList);
      }
    },
    searchPolicyList() {
      const data = {
        needPage: false
      };
      return this.$api.process.channeltype.policyList(data).then(res => {
        if (res.Status == 'OK') {
          this.policyList = res.Return;
        }
      });
    },
    okDialog() {
      let form = this.$refs.form;
      if (!form.valid()) {
        return false;
      }
      let params = {
        ...form.getFormValue(),
        color: this.selectedColor
      };
      this.$api.process.channeltype
        .save(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.searchData();
          }
        })
        .finally(() => {
          this.closeDialog(true);
        });
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.channeltype-color {
  /deep/ .ivu-poptip-arrow {
    display: none;
  }
  /deep/ .ivu-poptip-inner {
    transform: translateY(-8px);
  }
  .color-block {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  .color-selected {
    cursor: pointer;
    .color-block {
      display: inline-block;
      margin-right: 4px;
    }
    .tsfont-down {
      transition: transform 0.25s ease-out;
      &.arrow-rotate {
        transform: rotate(-180deg);
      }
    }
  }
  .color-block-list {
    box-sizing: border-box;
    width: 152px;
    height: 120px;
    padding: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: space-between;
    .color-block-item {
      margin: 4px;
    }
  }
}
</style>
