<template>
  <TsDialog
    v-bind="editTsDialog"
    @on-close="close"
    @on-ok="saveEditRow"
  >
    <template v-slot:header>
      <div v-if="id">{{ $t('page.edit') }}{{ $t('term.autoexec.operationlevel') }}</div>
      <div v-if="!id">{{ $t('page.build') }}{{ $t('term.autoexec.operationlevel') }}</div>
    </template>
    <template>
      <div class="editForm">
        <TsForm
          ref="form"
          :item-list="formConfig"
          type="type"
          label-postion="right"
        >
          <template slot="color">
            <Poptip
              class="priority-color"
              trigger="hover"
              placement="bottom-start"
              popper-class="priority-color"
              padding="0px"
              offset="25"
              transfer
              @on-popper-show="isColorListShow = true"
              @on-popper-hide="isColorListShow = false"
            >
              <div class="color-selected">
                <div class="color-block radius-sm" :style="{ backgroundColor: selectedColor}"></div>
                <i class="ts-angle-down" :class="{ 'arrow-rotate': isColorListShow }"></i>
              </div>
              <div slot="content">
                <ul class="color-block-list">
                  <li
                    v-for="item in colorList"
                    :key="item"
                    class="color-block color-block-item radius-sm"
                    :class="{ 'border-primary': item === selectedColor }"
                    :style="{ backgroundColor: item }"
                    @click="changeColor(item)"
                  ></li>
                </ul>
              </div>
            </Poptip>
          </template>
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {
  },
  props: {
    id: { type: Number },
    data: Object
  },
  data() {
    return {
      editTsDialog: {
        type: 'modal',
        isShow: true,
        width: 'small'
      },
      isShow: true,
      tableData: {},
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          value: null,
          defaultValue: '',
          isHidden: true,
          label: this.$t('page.primarykey')
        },
        name: {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '',
          maxlength: 30,
          width: '100%',
          label: this.$t('page.name'),
          validateList: [{ name: 'required', url: '/api/rest/autoexec/risk/save', key: 'name' }, 'name-special']
        },
        isActive: {
          type: 'radio',
          name: 'isActive',
          value: 1,
          defaultValue: 1,
          label: this.$t('page.status'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.enable') },
            { value: 0, text: this.$t('page.disable') }
          ]
        },
        color: {
          name: 'color',
          type: 'slot',
          label: this.$t('page.color'),
          validateList: ['required']
        },
        description: {
          type: 'textarea',
          name: 'desc',
          label: this.$t('page.description'),
          width: '100%',
          value: '',
          defaultValue: ''
        }
      },
      colorList: ['#D18CBD', '#FFBA5A', '#78D8DE', '#A78375', '#B9D582', '#898DDD', '#F3E67B', '#527CA6', '#50BFF2', '#FF6666', '#15BF81', '#90A4AE'],
      selectedColor: '#50BFF2',
      isColorListShow: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getDialogType();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    },
    saveEditRow() {
      let form = this.$refs.form;
      if (form.valid()) {
        let data = form.getFormValue();
        data.color = this.selectedColor;
        this.$api.autoexec.operate
          .saveOperate(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.close(true);
              this.$emit.getTableDataSearch(1);
              form.clearForm();
            }
          })
          .catch(error => {
          });
      }
    },
    getDialogType() {
      if (this.id) {
        for (let key in this.formConfig) {
          this.$set(this.formConfig[key], 'value', this.data[key]);
        }
        this.selectedColor = this.formConfig.color.value;
      }
    },
    changeColor(color) {
      this.selectedColor = color;
    }
  },
  computed: {},
  watch: {}
};
</script>
