<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addTemplate()">{{ $t('page.template') }}</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          @change="changeCurrent(1)"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <div style="">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <TsTable
            v-if="!loadingShow"
            v-bind="tableConfig"
            :theadList="theadList"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize(1, ...arguments)"
          >
            <template v-slot:name="{ row }">
              <div class="text-htef" @click="editTemplate(row)">{{ row.name }}</div>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li
                    class="tsfont-trash-o"
                    @click="deleteItem(row)"
                  >{{ $t('page.delete') }}</li>
                  <li class="reference-count">
                    <Dropdown
                      v-if="row.referenceCount > 0"
                      ref="reference"
                      transfer
                      trigger="hover"
                      placement="bottom-start"
                    >
                      <div class="text-action">
                        {{ $t('page.referencelist') }}
                        <span class="reference-number">{{ getAmount(row.referenceCount) }}</span>
                      </div>
                      <DropdownMenu v-if="row.referenceList.length > 0" slot="list">
                        <DropdownItem
                          v-for="(reference, rindex) in row.referenceList"
                          :key="rindex"
                          class="text-action"
                          @click.native="openPage(reference.uuid)"
                        >
                          <div>{{ reference.name }}</div>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    <span v-else class="text-disabled">{{ $t('page.referencelist') }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: false,
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.description'),
          key: 'description'
        },
        {
          title: this.$t('page.fcu'),
          key: 'fcu',
          type: 'user',
          uuid: 'uuid'
        },
        {
          title: this.$t('page.fcd'),
          key: 'fcd',
          type: 'time'
        },
        {
          key: 'action'
        }
      ],
      tableConfig: {},
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeCurrent(current) {},
    changePageSize() {

    },
    addTemplate() {
      this.$router.push({
        path: './eoa-template-edit'
      });
    },
    editTemplate(row) {
      this.$router.push({
        path: './eoa-template-edit',
        query: {
          id: row.id
        }
      });
    },
    deleteItem(row) {},
    openPage(item) {
      window.open(HOME + '/process.html#/flow-edit?uuid=' + uuid, '_blank');
    }
  },
  filter: {},
  computed: {
    getAmount() {
      return function(amount) {
        let showamount = amount ? (Math.floor(amount) > 99 ? '99+' : Math.floor(amount)) : '';
        return showamount;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
