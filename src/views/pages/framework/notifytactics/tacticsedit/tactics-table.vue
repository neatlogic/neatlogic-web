<template>
  <div>
    <Loading :loadingShow="loadingTable" type="fix"></Loading>
    <TsTable v-if="tabledata && triggerList" v-bind="tabledata">
      <template slot="type" slot-scope="{ row }">
        <div v-if="row.name && row.name.length > 0">
          <div v-for="(item, index) in row.name" :key="index">
            {{ item }}
          </div>
        </div>
        <div v-else>-</div>
      </template>
      <template slot="templateName" slot-scope="{ row }">
        <div v-if="row.templateName && row.templateName.length > 0">
          <div v-for="(item, index) in row.templateName" :key="index">
            {{ item }}
          </div>
        </div>
        <div v-else>-</div>
      </template>
      <template slot="receiverList" slot-scope="{ row }">
        <div v-if="row.receiverList && row.receiverList.length > 0">
          <div v-for="(item, index) in row.receiverList" :key="index">
            <UserSelect :value="item" :readonly="true"></UserSelect>
          </div>
        </div>
        <div v-else>-</div>
      </template>
      <template slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-edit icon" @click="editData(row)">
              {{ $t('page.edit') }}
            </li>
            <li class="tsfont-trash-o icon" @click.stop="emptyData(row)">
              {{ $t('page.clearconfig') }}
            </li>
          </ul>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve)
  },
  props: {
    triggerList: Array
  },
  data() {
    return {
      uuid: null,
      loadingTable: true,
      tabledata: {
        theadList: [
          {
            title: this.$t('page.triggeraction'),
            key: 'triggerName'
          },
          {
            title: this.$t('term.framework.notifyhandler'),
            key: 'type'
          },
          {
            title: this.$t('page.template'),
            key: 'templateName'
          },
          {
            title: this.$t('page.notifyobj'),
            key: 'receiverList'
          },
          {
            width: 10,
            title: '',
            align: 'right',
            key: 'action'
          }
        ],
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.uuid = this.$route.query.uuid || null;
    this.getTableData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTableData() {
      let _this = this;
      let triggerList = _this.triggerList;
      if (triggerList.length > 0) {
        triggerList.forEach(i => {
          if (i.notifyList.length > 0) {
            let name = [];
            let templateName = [];
            let receiverList = [];
            i.notifyList.forEach(d => {
              name.push(d.name);
              templateName.push(d.templateName);
              receiverList.push(d.receiverList);
            });
            this.$set(i, 'name', name);
            this.$set(i, 'templateName', templateName);
            this.$set(i, 'receiverList', receiverList);
          } else {
            this.$set(i, 'name', []);
            this.$set(i, 'templateName', []);
            this.$set(i, 'receiverList', []);
          }
        });
      }
      _this.tabledata.tbodyList = triggerList;
      _this.loadingTable = false;
    },
    editData(row) {
      let obj = {};
      this.$set(obj, 'triggerConfig', row);
      this.$set(obj, 'step', 2);
      this.$emit('changeStep', obj);
    },
    emptyData(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.clearconfirm', {target: row.triggerName}),
        'on-ok': vnode => {
          let data = {
            policyUuid: this.uuid,
            trigger: row.trigger
          };
          this.$api.framework.tactics
            .cleanHandlerNotify(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.getTableData();
              }
            });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
