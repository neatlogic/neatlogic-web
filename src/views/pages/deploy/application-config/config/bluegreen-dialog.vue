<template>
  <TsDialog
    type="modal"
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <div class="topSearch pb-nm">
        <span v-auth="'RESOURCECENTER_ACCOUNT_MODIFY'" class="text-action tsfont-plus" @click="add()">{{ $t('term.deploy.blueSet') }}</span>
        <TsFormInput
          v-model="keywords"
          class="search bg-op radius-sm"
          search
          @on-search="getlist()"
        ></TsFormInput>
      </div>

      <TsTable
        ref="TsTable"
        :theadList="theadList"
        :hideAction="hasAccountModifyAuth"
        v-bind="tableData"
      >
        <template v-slot:name="{ row }">
          <span v-if="row.disabled">{{ row.name }}</span>
          <span v-else>
            <TsFormInput
              ref="inputs"
              v-model="row.name"
              :validateList="required"
            ></TsFormInput>
          </span>
        </template>
        <template v-slot:isActive="{ row }">
          <TsFormSwitch
            v-model="row.isActive"
            :disabled="row.disabled"
            :falseValue="0"
            :trueValue="1"
          ></TsFormSwitch> 
        </template>
        <template v-slot:action="{ row }">
          <div v-auth="'RESOURCECENTER_ACCOUNT_MODIFY'" class="tstable-action">
            <ul class="tstable-action-ul">
              <li
                @click="edit(row)"
              ><span v-if="row.disabled" class="tsfont-edit">{{ $t('page.edit') }}</span><span v-else>{{ $t('page.save') }}</span></li>
            </ul>
          </div>
        </template>
      </TsTable>
    </template>
  </TsDialog>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput
  },
  filters: {},
  props: {
    title: String,
    isShow: Boolean
  },
  data() {
    let _this = this;
    return {
      showlist: true,
      keywords: '',
      dialogConfig: {
        type: 'modal',
        isShow: true,
        width: 'medium',
        btnList: [],
        title: _this.title
      },
      required: ['required'],
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      theadList: [
        {
          title: this.$t('page.ordernumber'),
          key: 'sort'
        },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.report.isactive'),
          key: 'isActive'
        },
        { key: 'action', title: ''}
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getlist();
  },
  beforeMount() {},
  mounted() { },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getlist() {
      let data = {
        keyword: this.keywords
      };
      this.$api.deploy.bluegreen.searchBlueGreen(data)
        .then(res => {
          if (res.Status == 'OK') {
            let resData = res.Return.tbodyList;
            this.tableData.tbodyList = [];
            resData.forEach(v => {
              this.tableData.tbodyList.push(Object.assign(v, {disabled: true}));
            });
          }
        });
    },
    add() {
      let dataArr = [];
      this.tableData.tbodyList.forEach((v, i) => {
        if (!v.disabled) {
          dataArr.push(v);
        }
      });
      // 如果有在编辑的时候，不允许添加
      if (dataArr.length > 0) {
        this.$Message.error(this.$t('term.deploy.savebeforeedit'));
        this.$refs.inputs.focus();
      } else {
        this.tableData.tbodyList.unshift({sort: this.tableData.tbodyList.length + 1, name: '', int: '', isActive: 1, disabled: false});
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    valid() { //自定义校验
      let list = this.$refs.inputs;
      if (list.valid()) {
        return true;
      }
    },
    saveBlueGreen(item) {
      if (!item.name) {
        this.valid();
        return;
      }
      this.$api.deploy.bluegreen.saveBlueGreen(item).then(res => {
        if (res.Status == 'OK') {
          item.disabled = true;
          this.$Message.success(this.$t('message.savesuccess'));
          this.getlist();
        }
      })
        .catch(error => {
          this.$Notice.info({//右滑弹窗，引自view ui
            title: this.$t('page.tip'),
            desc: (JSON.parse(error.request.response)).Message
          });
        });
    },
    edit(item) {
      if (item.disabled) {
        item.disabled = false;
      } else {
        this.saveBlueGreen(item);
      }
    }
  },
  computed: {
    hasAccountModifyAuth() { //判断账号管理权限
      return this.$store.getters.userAuthList.includes('RESOURCECENTER_ACCOUNT_MODIFY');
    }
  },
  watch: {}
};
</script>
<style scoped lang="less">
.topSearch{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search{
  width: 50%;
}
</style>
