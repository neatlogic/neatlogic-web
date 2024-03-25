<template>
  <div>
    <!-- <label class="label-text">{{ config.relatedComponentValue }}</label> -->
    {{ formDataForWatch }}
    <TsTable v-bind="tableConfig" class="mb-sm">
      <template v-slot:name="{row}">
        <TsFormSelect
          v-model="row.value"
          :dataList="dataList"
          transfer
          border="border"
        ></TsFormSelect>
      </template>
      <template v-slot:second>
        <TsFormSelect
          :dataList="dataList2"
          transfer
          border="border"
          @on-change="secondChange"
        ></TsFormSelect>
      </template>
    </TsTable>
    <TsTable v-bind="table1Config">
      <template v-slot:firstline="{row}">
        <TsFormSelect
          v-model="row.firstline"
          :dataList="dataList"
          transfer
          border="border"
        ></TsFormSelect>
      </template>
      <template v-slot:secondline>
        <TsFormSelect
          v-model="row.secondline"
          :dataList="dataList3"
          transfer
          border="border"
          @on-change="secondLlineChange"
        ></TsFormSelect>
      </template>
    </TsTable>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      tableConfig: {
        theadList: [
          {
            title: '第一列',
            key: 'name'
          },
          {
            title: '第二列',
            key: 'second'
          }
        ],
        tbodyList: [
          {
            name: ''
          }
        ]
      },
      table1Config: {
        theadList: [
          {
            title: '第一行',
            key: 'firstline'
          },
          {
            title: '第二行',
            key: 'secondline'
          }
        ],
        tbodyList: [
          {
            firstline: '',
            secondline: ''
          }
        ]
      },
      defaultDataList: [
        {
          text: '第一列',
          value: 'one'
        },
        {
          text: '第二列',
          value: 'two'
        },
        {
          text: '第三列',
          value: 'three'
        }
      ],
      dataList: [
        {
          text: '第一列',
          value: 'one'
        },
        {
          text: '第二列',
          value: 'two'
        },
        {
          text: '第三列',
          value: 'three'
        }
      ],
      dataList2: [
        {
          text: 'A',
          value: 'A'
        },
        {
          text: 'B',
          value: 'B'
        },
        {
          text: 'C',
          value: 'C'
        }
      ],
      dataList3: [
        {
          text: '第二行a',
          value: 'oneA'
        },
        {
          text: '第二行b',
          value: 'oneB'
        },
        {
          text: '第二行c',
          value: 'oneC'
        }
      ]
    
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
    handleDataList(relatedComponentValue) {
      if (!this.$utils.isEmpty(relatedComponentValue)) {
        let val = Object.values(relatedComponentValue);
        this.dataList = [];
        this.defaultDataList.forEach((item) => {
          if (val.includes(item.value)) {
            this.dataList.push({
              text: item.text,
              value: item.value
            });
          }
        });
        console.log('this.dataList', this.dataList, val);
      }
    },
    secondLlineChange(val) {
      console.log('val');
    },
    secondChange(val) {
      console.log(val);
    }
  },
  filter: {},
  computed: {
    formDataForWatch() {
      return JSON.parse(JSON.stringify(this.formData));
    }
  },
  watch: {
    formDataForWatch: {
      handler(val, oldval) {
        console.log('', val);
        this.handleDataList(val);
      },
      deep: true
    }
    
  }
};
</script>
<style lang="less" scoped>
.label-text{
  white-space: break-spaces;
}
</style>
