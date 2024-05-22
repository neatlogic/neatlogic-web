<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsTable
          v-if="attrData && attrData.tbodyList.length > 0"
          v-bind="attrData"
          keyName="uuid"
          :canDrag="true"
          @update:tbodyList="updateList"
        >
          <template v-slot:name="{ row }">
            <div><TsFormInput v-model="row.name" :validateList="['char']"></TsFormInput></div>
          </template>
          <template v-slot:alias="{ row }">
            <div><TsFormInput v-model="row.alias" :validateList="['required']"></TsFormInput></div>
          </template>
          <template slot="isHidden" slot-scope="{ row }">
            <div>
              <TsFormSwitch v-model="row.isHidden" :true-value="1" :false-value="0"></TsFormSwitch>
            </div>
          </template>
          <template slot="isPrimary" slot-scope="{ row }">
            <div>
              <TsFormSwitch v-model="row.isPrimary" :true-value="1" :false-value="0"></TsFormSwitch>
            </div>
          </template>
          <template slot="condition" slot-scope="{ row }">
            <div>
              <TsFormSelect
                v-if="row.attrId"
                v-model="row.condition.expression"
                :transfer="true"
                :dataList="getAttrExpressionList(row.attrId)"
              ></TsFormSelect>
            </div>
          </template>
          <template slot="conditionValue" slot-scope="{ row }">
            <div>
              <AttrSearcher
                v-if="row.attrId"
                ref="attrHandler"
                :attrData="getAttrById(row.attrId)"
                :valueList="row.condition.valueList"
                @setData="
                  (val, actualValue) => {
                    setAttrData(row.uuid, val, actualValue);
                  }
                "
              ></AttrSearcher>
            </div>
          </template>
        </TsTable>
      </template>
      <template v-slot:footer>
        <Button @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    AttrSearcher: () => import('../cientity/attr-searcher.vue')
  },

  props: { viewData: { type: Object } },
  data() {
    return {
      attrList: null,
      constAttrList: null,
      attrData: {
        theadList: [
          { key: 'ciLabel', title: '模型' },
          { key: 'attrLabel', title: '属性' },
          { key: 'name', title: '唯一标识', tooltip: '自定义模板只能获取配置了唯一标识的属性数据' },
          { key: 'alias', title: '显示名' },
          { key: 'condition', title: '筛选条件' },
          { key: 'conditionValue', title: '' },
          { key: 'isPrimary', title: '是否主键', tooltip: '可以选择多个属性作为主键' },
          { key: 'isHidden', title: '是否隐藏' }
        ],
        tbodyList: []
      },
      dialogConfig: {
        title: this.$t('page.displaysetting'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      const attrIdList = [];
      const ciMap = {};
      this.viewData.nodes.forEach(node => {
        if (node.type == 'Ci') {
          ciMap[node.uuid] = { sort: node.config['index'], label: node.config['ciLabel'] };
        }
      });
      this.viewData.nodes.forEach(node => {
        if (node.type === 'Attr' || node.type === 'ConstAttr') {
          const conf = node.config;
          if (conf.attrId) {
            attrIdList.push(conf.attrId);
          }
          this.attrData.tbodyList.push({
            uuid: node.uuid,
            constName: conf.constName,
            attrId: conf.attrId,
            attrLabel: conf.attrLabel,
            alias: conf.alias,
            name: conf.name,
            ciLabel: '#' + ciMap[conf.ciUuid].sort + '.' + ciMap[conf.ciUuid].label,
            sort: typeof conf.sort == 'undefined' ? ciMap[conf.ciUuid].sort : conf.sort,
            isHidden: conf.isHidden,
            isPrimary: conf.isPrimary,
            condition: conf.condition || {}
          });
        }
      });
      this.attrData.tbodyList.sort((a, b) => {
        return a.sort - b.sort;
      });
      //按照顺序重置sort值，必须要这样做，不然无法根据拖拽更新sort值
      this.attrData.tbodyList.forEach((a, index) => {
        a.sort = index;
      });
      if (attrIdList.length > 0) {
        await this.$api.cmdb.ci.getAttrByIdList(attrIdList).then(res => {
          this.attrList = res.Return;
        });
      }
    },
    close() {
      this.$emit('close');
    },
    save() {
      //更新sort值
      this.attrData.tbodyList.forEach((attr, index) => {
        attr.sort = index;
      });
      this.$emit('close', this.attrData.tbodyList);
    },
    updateList(val) {
      //由于可拖拽table使用了deepclode，所以需要重新变化值来更新原值，否则里面的编辑都不会生效
      this.$set(this.attrData, 'tbodyList', val);
    },
    getAttrExpressionList(attrId) {
      if (this.attrList && attrId) {
        for (let i = 0; i < this.attrList.length; i++) {
          const attr = this.attrList[i];
          if (attr.id == attrId) {
            return attr.expressionList;
          }
        }
      }
    },
    getAttrById(attrId) {
      if (this.attrList) {
        for (let i = 0; i < this.attrList.length; i++) {
          const attr = this.attrList[i];
          if (attr.id == attrId) {
            return attr;
          }
        }
      }
    },
    setAttrData(uuid, value, actualValue) {
      //下拉框需要获取真实值，所以先用actualValue，没有再取value
      this.attrData.tbodyList.forEach(attr => {
        if (attr.uuid === uuid) {
          if (!attr.condition) {
            attr.condition = { valueList: value };
          } else {
            attr.condition.valueList = value;
          }
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
