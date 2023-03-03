
<script>
import DynamicListsDialog from './dynamicList-dialog.vue';//弹窗拿取数据：矩阵
import DynamicListsNomarl from './dynamicList-nomarl.vue';//直接在页面显示数据：矩阵
import DynamicListsNomarlSimple from './dynamicList-nomarl-simple.vue';//nomral下面简单模式，主要用在表单编辑配置里面的显示
import DynamicListsDialogIntegration from './dynamicList-dialog-integration.vue';//弹窗拿取数据：集成
import DynamicListsNomarlIntegration from './dynamicList-nomarl-integration.vue';//直接在页面显示数据：集成
export default {
  name: 'FormdynamicList',
  components: { DynamicListsNomarl, DynamicListsDialog, DynamicListsNomarlSimple, DynamicListsDialogIntegration, DynamicListsNomarlIntegration},
  mixins: [],
  props: {
    setting: Object,
    value: [Array, String, Object],
    isReadonly: Boolean,
    formView: { //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: { //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {};
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
    getValue: function() {
      return this.$children[0] ? this.$children[0].getValue() : [];
    },
    validateValue: function() {
      return this.$children[0] ? this.$children[0].validateValue() : true;
    }
  },
  computed: {},
  watch: {},
  render(h, cx) {
    let modeConfig = {
      dialogmatrix: 'DynamicListsDialog',
      dialogintegration: 'DynamicListsDialogIntegration',
      normalmatrix: 'DynamicListsNomarl',
      normalintegration: 'DynamicListsNomarlIntegration'
    };
    let type = modeConfig[this.setting.config.mode + this.setting.config.dataSource];
    type = !this.formView && this.setting.config.mode == 'normal' ? 'DynamicListsNomarlSimple' : type;
    return h(type, {
      props: {
        ...this.$props
      },
      staticClass: 'dynamicList-edit'
    });
  }
};

</script>

