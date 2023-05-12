<template>
  <div>
    <TsForm :item-list="formConfig">
      <template v-slot:attrList>
        <div>   
          <div>
            <draggable
              :animation="150"
              handle=".handler"
              :list="myConfig.attrList"
            >
              <Tag
                v-for="item in myConfig.attrList"
                :key="item.id"
                style="cursor:pointer"
                :color="item.isSelected?'primary':'default'"
                @click.native="toggleField(item)"
              >
                <i class="handler tsfont-drag"></i>{{ item.ciLabel }}·{{ item.label }}</Tag>
            </draggable>
          </div>
          <Alert style="margin-top:10px">帮助：选择需要显示的字段，拖动改变排序。</Alert>
        </div>
      </template>
      <template v-slot:isMultiple>
        <i-switch v-model="myConfig.isMultiple" :true-value="1" :false-value="0"></i-switch>
        <span v-html="myConfig.isMultiple == 1 ? '是' : '否'"></span>
      </template>
    </TsForm>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    config: {type: Object},
    ciSimpleAttrList: {type: Array},
    attrData: {type: Object}
  },
  data() {
    const _this = this;
    return {
      dataList: [],
      myConfig: {},
      formConfig: {
        mode: {
          type: 'radio',
          label: '关联方式',
          value: 'r',
          dataList: [
            {
              value: 'r',
              text: '选择'
            },
            {
              value: 'w',
              text: '新增'
            },
            {
              value: 'rw',
              text: '选择或新增'
            }
          ],
          onChange: val => {
            this.$set(this.myConfig, 'mode', val);
          }
        }, 
        isMultiple: {
          type: 'slot',
          label: '多选'
        },
        attrList: {
          type: 'slot',
          label: '显示字段',
          isHidden: true
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.myConfig = this.config || {};
    if (this.myConfig) {
      for (const k in this.myConfig) {
        if (this.formConfig[k]) {
          this.formConfig[k].value = this.myConfig[k];
        }
      }
    }
    if (!this.myConfig.attrList) {
      this.$set(this.myConfig, 'attrList', new Array());
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toggleField: function(item) {
      if (item.isSelected) {
        this.$set(item, 'isSelected', false);
      } else {
        this.$set(item, 'isSelected', true);
      }
      //this.$forceUpdate();//不跑出不来选中效果
    }
  },
  filter: {},
  computed: {},
  watch: {
    myConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    'attrData.targetCiId': {
      handler: function(val) {
        if (val) {
          this.$api.cmdb.ci.getCiById(val).then(res => {
            if (res.Return.isVirtual) {
              //虚拟模型只能读
              this.$set(this.formConfig.mode, 'disabled', true);
              this.$set(this.formConfig.mode, 'value', 'r');
              this.$set(this.formConfig.mode, 'desc', '虚拟模型不支持新增');
              this.$set(this.myConfig, 'mode', 'r');
            } else {
              this.$set(this.formConfig.mode, 'disabled', false);
              this.$set(this.formConfig.mode, 'desc', '');
            }
          });
        }
      },
      deep: true,
      immediate: true
    },
    ciSimpleAttrList: {
      handler: function(val) {
        if (val && val.length > 0) {
          const attrList = [];
          val.map(item => {
            attrList.push({id: item.id, ciName: item.ciName, ciLabel: item.ciLabel, name: item.name, label: item.label});
          });
          this.formConfig.attrList.isHidden = false;
          //添加新属性的数据
          attrList.forEach(item => {
            if (!this.myConfig.attrList.some(oldItem => { return oldItem.id === item.id; })) {
              this.$set(item, 'isSelected', false);
              this.myConfig.attrList.push(item);
            }
          });
          //删除不存在的数据
          const list = this.myConfig.attrList.filter(item => {
            return attrList.some(newItem => { return newItem.id === item.id; });
          });
          this.$set(this.myConfig, 'attrList', list);
        } else {
          this.formConfig.attrList.isHidden = true;
          this.$set(this.myConfig, 'attrList', new Array());
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.handler{
  padding:0 5px 0 0;
  cursor:move;
}
</style>
