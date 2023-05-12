<template>
  <div class="padding">
    <TsCard
      v-if="changeData.cardList"
      v-bind="changeData"
      :boxShadow="false"
      :fixBtn="true"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="4"
      :padding="false"
      @updatePage="searchChange"
      @action="action"
    >
      <template slot-scope="{ row }">
        <div class="change-main" @click="toEditChange(row)">
          <div class="form-switch" @click.stop>
            <div class="title">
              <div class="overflow">
                {{ row.name }}
              </div>
              <div class="text-grey overflow">
                {{ row.actionUser }} 于
                {{ row.actionTime | formatDate }}
                {{ row.actionName }}
              </div>
            </div>
          </div>
        </div></template>
    </TsCard>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve)
  },
  props: {},
  data() {
    return {
      changeData: {
        'rowNum': 80, 'pageSize': 24, 'currentPage': 1,
        cardList: [{'isActive': 1, 'name': '123', 'referenceCount': 7, 'uuid': 'f51102ca25d643c0a40c44d732f96dc6'}, {'isActive': 1, 'name': 'test1014', 'referenceCount': 1, 'uuid': '2c06df7971ae4877a866076a376de35b'}, {'isActive': 1, 'name': 'ldl_bug', 'referenceCount': 1, 'uuid': 'e9f36145493b45d29c05aeeee6f7e706'}, {'isActive': 1, 'name': '自动化流程测试', 'referenceCount': 1, 'uuid': '43e19510244046ff86a7c7f561d1a969'}, {'isActive': 1, 'name': '综合变更', 'referenceCount': 1, 'uuid': '75acbeb2195647e4953e314092f37d23'}, {'isActive': 1, 'name': '0930_批量合并上报_流程', 'referenceCount': 1, 'uuid': 'c0f6f90deb1d4513821475b7f2523692'}, {'isActive': 1, 'name': '自动化流程测试_copy', 'referenceCount': 1, 'uuid': 'f50b3a3d3e7541b4a14ff6c2b9b1804f'}, {'isActive': 1, 'name': '子任务测试2_0928', 'referenceCount': 1, 'uuid': 'e0969c3f08a44543920734b47443c8da'}, {'isActive': 1, 'name': '测试子任务_0916', 'referenceCount': 1, 'uuid': '68b69d416e2242d9a4d670e9e523cbea'}, {'isActive': 1, 'name': '页签', 'referenceCount': 1, 'uuid': '363b27616cb94cd0a501adde286d6f99'}, {'isActive': 1, 'name': 'test0926', 'referenceCount': 1, 'uuid': 'e2248c0cb769400f9e9b30810b5b79b7'}, {'isActive': 1, 'name': 'test_0831_表格选择组件扩展属性', 'referenceCount': 2, 'uuid': '49a8172e7bb2487eba8d4d9d5d34fcc0'}, {'isActive': 1, 'name': 'test0811', 'referenceCount': 1, 'uuid': '92ecd121d4034dd3b3280b56f24fda52'}, {'isActive': 1, 'name': '转报赋值测试0923_2', 'referenceCount': 1, 'uuid': '5dd5ad6204b84234860f8a73dd411f4c'}, {'isActive': 1, 'name': '转报赋值测试0923', 'referenceCount': 1, 'uuid': '33c504ad231340c396b1fcb98749862c'}, {'isActive': 1, 'name': '0923_表格测试_流程设置', 'referenceCount': 1, 'uuid': '3317e13073c94903939511d622bfcb5d'}, {'isActive': 1, 'name': '0923form表单测试', 'referenceCount': 1, 'uuid': 'c20f8308d66144b785fb97ec878384b5'}, {'isActive': 1, 'name': '0923_全部表单测试流程', 'referenceCount': 1, 'uuid': '0986cfb5315e41f1b97a98c5c9413ac6'}, {'isActive': 1, 'name': '业务请求', 'referenceCount': 2, 'uuid': '376bb316fe974206a7201ff11caba82a'}, {'isActive': 1, 'name': 'test0817_合并上报', 'referenceCount': 1, 'uuid': '46b8aa0174014b42ae8525ef09be7e81'}, {'isActive': 1, 'name': '事件处理', 'referenceCount': 1, 'uuid': 'bc567ef45fc747468243485666450cc6'}, {'isActive': 1, 'name': 'linbq_0916_重审', 'referenceCount': 2, 'uuid': '53bd485802084ddc8e61f91b1737c921'}, {'isActive': 1, 'name': 'tttt', 'referenceCount': 0, 'uuid': 'e382ac5f3e2f46a78bb2a2eec76a69fb'}, {'isActive': 1, 'name': 'test_0901_帐号组件', 'referenceCount': 1, 'uuid': '14cb2a756cd3484889e91aacc54dacdc'}]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchChange();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchChange() {
      this.changeData.cardList.map(v => {
        v.btnList = [
          {name: '关联服务', value: 'referenceCount', icon: '', type: 'referenceCount', key: 'referenceCount'},
          {name: '删除', value: 'del', type: 'del', icon: 'tsfont-trash-o', disable: true, text: '流程被引用不可删除', key: 'referenceCount'},
          {name: '多个', value: 'dropdown', icon: '', type: 'dropdown', menuArr: [{name: '复制', value: 'copy', type: 'text'}, 
            {name: '导出', value: 'export', type: 'download'}]}
        ];
      });
    },
    action(row, value) {
      if (value == 'export') {
        this.btnExport(row.uuid, row.name);
      }
    },
    btnExport: function(uuid) {
      //导出流程
      let url = '/api/binary/process/export?uuid=' + uuid;
      let data = {};
      this.$utils.download(this, url, data, 'get');
    }

  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
