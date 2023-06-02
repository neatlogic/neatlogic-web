<template>
  <TsTable v-bind="tableData" @changeCurrent="updatePage" @changePageSize="updateSize">
    <template slot="systemVo" slot-scope="{ row }">
      <div v-if="row.systemVo">
        <Tooltip
          v-if="row.systemVo && row.systemVo.description"
          theme="light"
          max-width="300"
          transfer
        >
          <div>{{ row.systemVo.name }}</div>
          <div slot="content">
            <div>{{ row.systemVo.description }}</div>
          </div>
        </Tooltip>
        <div v-else>{{ row.systemVo.name || '-' }}</div>
      </div>
      <div v-else>-</div>
    </template>
    <template slot="subSystemVo" slot-scope="{ row }">
      <div v-if="row.subSystemVo">
        <Tooltip
          v-if="row.subSystemVo && row.subSystemVo.description"
          theme="light"
          max-width="300"
          transfer
        >
          <div>{{ row.subSystemVo.name }}</div>
          <div slot="content">
            <div>{{ row.subSystemVo.description }}</div>
          </div>
        </Tooltip>
        <div v-else>{{ row.subSystemVo.name || '-' }}</div>
      </div>
      <div v-else>-</div>
    </template>
    <template slot="fcd" slot-scope="{ row }">
      {{ row.fcd | formatDate }}
    </template>
    <template slot="sourceBranch" slot-scope="{ row }">
      {{ row.sourceBranch || 'master' }}
    </template>
    <template slot="targetBranch" slot-scope="{ row }">
      {{ row.targetBranch || 'develop' }}
    </template>
    <template slot="action" slot-scope="{ row }">
      <div v-if="row.canEdit || canDelete" class="tstable-action">
        <ul class="tstable-action-ul">
          <li v-if="row.canEdit" class="tsfont-plus-o" @click="addMr(row.uuid)">{{ $t('term.codehub.createmergerequest') }}</li>
          <li v-if="canDelete" class="tsfont-trash-o" @click="deleteVersion(row.uuid)">{{ $t('page.delete') }}</li>
        </ul>
      </div>
    </template>
  </TsTable>
</template>

<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  props: {
    versionData: {
      type: Object
    },
    statusList: {
      type: Object
    },
    canDelete: {
      type: Boolean
    }
  },
  data() {
    return {
      tableData: {
        theadList: [
          {
            title: this.$t('page.name'),
            key: 'name'
          },
          {
            title: this.$t('page.sourcebranch'),
            key: 'sourceBranch'
          },
          {
            title: this.$t('page.targetbranch'),
            key: 'targetBranch'
          },
          {
            title: this.$t('page.system'),
            key: 'systemVo'
          },
          {
            title: this.$t('page.subsystem'),
            key: 'subSystemVo'
          },
          {
            title: this.$t('term.process.dealwithuser'),
            key: 'fcu'
          },
          {
            title: this.$t('page.status'),
            key: 'status'
          },
          {
            title: this.$t('page.time'),
            key: 'fcd'
          },
          {
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
    if (this.versionData) {
      Object.assign(this.tableData, {
        pageCount: this.versionData.pageCount,
        rowNum: this.versionData.rowNum,
        pageSize: this.versionData.pageSize,
        currentPage: this.versionData.currentPage,
        tbodyList: this.versionData.tbodyList
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updatePage(page) {
      this.$emit('updatePage', page);
    },
    updateSize(size) {
      this.$emit('updateSize', size);
    },
    addMr(uuid) {
      this.$emit('addMr', uuid);
    },
    deleteVersion(uuid) {
      this.$emit('deleteVersion', uuid);
    },
    changeOpen(val, list) {
      let listdata = {};
      Object.assign(listdata, {
        uuid: list.uuid,
        isOpen: val
      });
      this.$api.codehub.version.updateOpen(listdata).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        } else {
          this.$set(list, 'isOpen', val ? 0 : 1);
        }
      }).catch(error => {
        this.$set(list, 'isOpen', val ? 0 : 1);
      });
    }
  },
  filter: {},
  computed: {
    showtips() {
      return function(config) {
        let isshow = false;
        if ((config.systemVo && config.systemVo.description) || (config.subSystemVo && config.subSystemVo.description)) {
          isshow = true;
        }
        return isshow;
      };
    },
    setTxt() {
      return function(config, type) {
        let text = '';
        let prev = config.systemVo || '';
        let next = config.subSystemVo || '';
        if (type == 'text') {
          text = (prev ? prev.name : '') + (next ? '/' + next.name : '');
        } else if (type == 'tips') {
          text = (prev && prev.description ? prev.description : '') + (next && next.description ? '/' + next.description : '');
        }
        return text;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
