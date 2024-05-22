<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topRight>
        <div><TsFormInput
          v-model="searchParam.keyword"
          search
          :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.keyword') })"
          border="border"
          clearable
          @on-enter="searchCollectionData(1)"
        ></TsFormInput></div>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="collectionData.tbodyList && collectionData.tbodyList.length > 0"
          v-bind="collectionData"
          @changeCurrent="searchCollectionData"
          @changePageSize="changePageSize"
        >
          <template v-slot:rule="{ row }">
            <span v-if="row.rule" class="text-info">{{ $t('page.ready') }}</span>
            <span v-else class="text-grey">{{ $t('page.undefined') }}</span>
          </template>
          <template
            v-for="(value, key) in collectionData.subTheadData"
            :slot="key"
            slot-scope="{ row }"
          ><div :key="key" style="vertical-align:top">
            <table v-if="row[key] && row[key].length > 0" class="table table-color">
              <thead v-if="collectionData.subTheadData[key].length > 1">
                <!--表头超过一个值代表是对象类型-->
                <tr>
                  <th v-for="(thead, index) in collectionData.subTheadData[key]" :key="index">{{ thead.title }}</th>
                </tr>
              </thead>
              <tbody v-if="collectionData.subTheadData[key].length > 1 || (collectionData.subTheadData[key].length == 1 && collectionData.subTheadData[key][0]['key'])">
                <tr v-for="(tbody, tindex) in row[key]" :key="tindex" class="t1">
                  <td v-for="(thead, index) in collectionData.subTheadData[key]" :key="index">
                    {{ tbody[thead.key] || '-' }}
                  </td>
                </tr>
              </tbody>
              <tbody v-else-if="collectionData.subTheadData[key].length == 1 && !collectionData.subTheadData[key][0]['key']">
                <tr v-for="(tbody, tindex) in row[key]" :key="tindex" class="t2">
                  <td>
                    {{ tbody }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!row[key] || row[key].length == 0" :key="key"></div>
          </div>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="!row.rule" class="tsfont-edit" @click="editRule({ sysObjectId: row['SYS_OBJECT_ID'] })">{{ $t('dialog.title.addtarget', { target: $t('page.rule') }) }}</li>
                <li v-else class="tsfont-edit" @click="editRule(row.rule)">{{ $t('dialog.title.edittarget', { target: $t('page.rule') }) }}</li>
                <li class="tsfont-trash-o" @click="deleteRule(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
        <NoData v-else></NoData>
      </template>
    </TsContain>
    <RuleEdit v-if="isEditShow" :rule="currentRule" @close="closeEditDialog"></RuleEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    RuleEdit: () => import('./discovery-rule-edit-dialog.vue')
  },
  props: {},
  data() {
    return {
      isEditShow: false,
      currentRule: null,
      searchParam: { collection: 'unknown' },
      collectionData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchCollectionData(1);
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
    editRule(row) {
      this.isEditShow = true;
      if (row) {
        this.currentRule = row;
      }
    },
    deleteRule(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        btnType: 'error',
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('term.cmdb.unknowndevice') }),
        'on-ok': vnode => {
          this.$api.cmdb.sync.deleteUnknowCollectionData(row._id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchCollectionData();
            }
          });
        }
      });
    },
    closeEditDialog(needRefresh) {
      this.isEditShow = false;
      this.currentRule = null;
      if (needRefresh) {
        this.searchCollectionData();
      }
    },
    searchCollectionData(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.cmdb.sync.searchCollectionData(this.searchParam).then(res => {
        this.collectionData = res.Return;
        this.collectionData.theadList.unshift({ key: 'rule', title: this.$t('term.cmdb.matchrule') });
        this.collectionData.theadList.push({ key: 'action' });
        const oidList = [];
        if (this.collectionData.tbodyList && this.collectionData.tbodyList.length > 0) {
          this.collectionData.tbodyList.forEach(element => {
            if (element['SYS_OBJECT_ID']) {
              oidList.push(element['SYS_OBJECT_ID']);
            }
          });
        }
        if (oidList.length > 0) {
          this.searchRule(oidList);
        }
      });
    },
    searchRule(oidList) {
      const param = {};
      param.oidList = oidList;
      this.$api.cmdb.discovery.searchDiscoveryRule(param).then(res => {
        if (res?.Return?.tbodyList && res.Return.tbodyList.length > 0) {
          const ruleList = res.Return.tbodyList;
          this.collectionData.tbodyList.forEach(element => {
            const oid = element['SYS_OBJECT_ID'];
            const rule = ruleList.find(d => d.sysObjectId === oid);
            if (rule) {
              this.$set(element, 'rule', rule);
            }
          });
        }
      });
    },
    changePageSize(pageSize) {
      if (pageSize) {
        this.searchParam.pageSize = pageSize;
      } else {
        this.searchParam.pageSize = 10;
      }
      this.searchCollectionData();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
