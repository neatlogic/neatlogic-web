<template>
  <TsDialog
    type="modal"
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <div class="topSearch pb-nm">
        <span v-auth="'RESOURCECENTER_ACCOUNT_MODIFY'" class="text-action tsfont-plus" @click="add()">{{ $t('page.protocol') }}</span>
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
        <template v-slot:port="{ row }">
          <span v-if="row.disabled">{{ row.port }}</span>
          <span v-else>
            <TsFormInput
              ref="port"
              v-model="row.port"              
            ></TsFormInput>
          </span>
        </template>
        <template v-slot:action="{ row }">
          <div v-auth="'RESOURCECENTER_ACCOUNT_MODIFY'" class="tstable-action">
            <ul class="tstable-action-ul">
              <li
                @click="edit(row)"
              ><span v-if="row.disabled" class="tsfont-edit">{{ $t('page.edit') }}</span><span v-else>{{ $t('page.save') }}</span></li>
              <li
                @click="del(row)"
              ><span v-if="row.disabled" class="tsfont-trash-o">{{ $t('page.delete') }}</span><span v-else>{{ $t('page.cancel') }}</span></li>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
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
        { key: 'name', title: this.$t('page.name'), width: '250' },
        { key: 'port', title: this.$t('page.defaultport'), width: '250' },
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
      this.$api.cmdb.accountManage.searchlistresourcecenter(data)
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
        this.$Message.error('请先保存之后再编辑');
        this.$refs.inputs.focus();
      } else {
        this.tableData.tbodyList.unshift({name: '', int: '', disabled: false});
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
    validator: function(value) {
      if (value == '') {
        return true;
      }
      return /^[0-9]\d*$/.test(value);
    },
    addType(item) {
      if (!item.name) {
        this.valid();
        return;
      }

      if (item.port && !this.validator(item.port)) {
        this.$Message.error('请输入正确的端口号');
        this.$refs.port.focus();
        return;
      }
      this.$api.cmdb.accountManage.savelistresourcecenter(item).then(res => {
        if (res.Status == 'OK') {
          item.disabled = true;
          this.$Message.success(this.$t('message.savesuccess'));
          this.getlist();
        }
      })
        .catch(error => {
          if (error.response.status === 520) {
            item.id = '000';//del为临时赋值，避免删除新增同名协议报错
          }
          this.$Notice.info({//右滑弹窗，引自view ui
            title: '提示',
            desc: (JSON.parse(error.request.response)).Message
          });
        });
    },
    edit(item) {
      if (item.disabled) {
        item.disabled = false;
      } else {
        this.addType(item);
      }
    },
    del(item) {
      let that = this;
      let id = item.id;
      if (item.disabled) {
        this.$createDialog({
          title: this.$t('page.warning'),
          content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.protocol')}),
          btnType: 'error',
          'on-ok': vnode => {
            that.$api.cmdb.accountManage
              .deletelistresourcecenter({id: id})
              .then(res => {
                that.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                that.getlist();
              })
              .catch((e) => {
                that.close;
              });
          }
        });
      } else {
        item.disabled = true;
        that.getlist();
      }
    }
  },
  computed: {
    hasAccountModifyAuth() { //判断帐号管理权限
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
