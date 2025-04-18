<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog()"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div>
          <TsTable
            :theadList="theadList"
            :tbodyList="tbodyList"
            :fixedHeader="false"
          >
            <template v-slot:name="{row}">
              <TsFormInput
                v-model="row.name"
                border="border"
                :errorMessage="row.errorMessage"
                @on-change="(val)=>{changeName(row, val)}"
              ></TsFormInput>
            </template>
            <template v-slot:isActive="{row}">
              <TsFormSwitch
                v-model="row.isActive"
                :falseValue="0"
                :trueValue="1"
              ></TsFormSwitch> 
            </template>
            <template v-slot:delete="{row, index}">
              <div v-if="!row.id" class="action-group">
                <span class="tsfont-trash-o text-action" @click="delRow(row, index)"></span>
              </div>
            </template>
          </TsTable>
          <div class="tsfont-plus text-href pt-nm" @click.stop="addRow()">蓝绿</div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    
  },
  data() {
    return {
      dialogSetting: {
        title: this.$t('page.setting'),
        isShow: true,
        type: 'modal'
      },
      theadList: [
        {
          title: this.$t('page.ordernumber'),
          key: 'index'
        },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.report.isactive'),
          key: 'isActive'
        },
        {
          title: '',
          key: 'delete' 
        }
      ],
      tbodyList: []
    };
  },
  beforeCreate() {},
  created() {

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
    addRow() {
      this.tbodyList.push({
        index: this.tbodyList.length + 1,
        name: '',
        isActive: 1
      });
    },
    delRow(row, index) {
      this.tbodyList.splice(index, 1);
    },
    validName() {
      const nameList = [];
      let isValid = true;
      for (let i = 0; i < this.tbodyList.length; i++) {
        if (this.$utils.isEmpty(this.tbodyList[i].name)) {
          this.$set(this.tbodyList[i], 'errorMessage', this.$t('form.validate.pleaseenterthecontent'));
          isValid = false;
        } else if (nameList.find(n => n === this.tbodyList[i].name)) {
          this.$set(this.tbodyList[i], 'errorMessage', this.$t('form.validate.repeat', {target: this.tbodyList[i].name}));
          isValid = false; // 存在重复
        } else {
          this.$set(this.tbodyList[i], 'errorMessage', '');
        }
        nameList.push(this.tbodyList[i].name);
      }
      return isValid;
    },
    changeName(row, val) {
      const findItem = this.tbodyList.find(item => item.index !== row.index && item.name === val);
      if (findItem) {
        this.$set(row, 'errorMessage', this.$t('form.validate.repeat', {target: val}));
      } else {
        this.$set(row, 'errorMessage', '');
      }
    },
    okDialog() {
      if (!this.validName()) {
        return false; 
      }
      let data = {};
      let list = this.tbodyList.map((item) => {
        return {
          index: item.index,
          name: item.name,
          isActive: item.isActive,
          id: item.id || null
        };
      });
      console.log(list);
      this.$api.deploy.applicationConfig.saveBlueset(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$t('message.savesuccess');
          this.closeDialog();
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less">
</style>
