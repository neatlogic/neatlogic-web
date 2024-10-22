<script>
import item from './index.js';
const ITEMTYPELIST = {
  text: 'TsFormInput', //text类型
  textarea: 'TsFormInput', //textarea
  password: 'TsFormInput', //password
  number: 'TsFormInput', //number
  url: 'TsFormInput', //url
  email: 'TsFormInput', //email
  tel: 'TsFormInput', //tel
  select: 'TsFormSelect', //下拉选择框
  radio: 'TsFormRadio', //radio
  switch: 'TsFormSwitch', //
  checkbox: 'TsFormCheckbox',
  date: 'TsFormDatePicker', //年-月-日 时：分：秒
  datetime: 'TsFormDatePicker', //年-月-日 时：分：秒
  daterange: 'TsFormDatePicker', //年-月-日   范围
  datetimerange: 'TsFormDatePicker', //年-月-日 时：分：秒   范围
  year: 'TsFormDatePicker', //年
  month: 'TsFormDatePicker', //月
  time: 'TsFormDatePicker', //时间 时：分：秒
  timerange: 'TsFormDatePicker', //时间 时：分：秒  范围
  tree: 'TsFormTree', //ztree树形插件
  quartz: 'TsQuartz', //定时器插件
  textspan: '', //存文本显示
  userselect: 'UserSelect', //用户授权
  teamselect: 'UserSelect', //分组授权
  roleselect: 'UserSelect', //角色授权
  ckeditor: 'TsCkeditor', //富文本编辑框
  codemirror: 'TsCodemirror',
  timeselect: 'TimeSelect',
  cascader: 'TsFormCascader' //级联选择
};

export default {
  name: 'TsFormHandler',
  components: {
    ...item
  },
  model: {
    event: 'change'
  },
  props: {
    type: { type: String }, //控件类型
    name: { type: String }, //表单组件唯一名
    value: { type: [Number, String, Object, Array] }, //值
    config: { type: Object } //表单组件配置
  },
  data() {
    return {
      ref: this.$utils.setUuid(),
      valueLocal: null
    };
  },
  created() {
    if (this.value) {
      this.valueLocal = this.$utils.deepClone(this.value);
    }
  },
  methods: {
    valid() {}
  },
  computed: {},
  watch: {
    /*valueLocal: {
      handler() {
        this.$emit('on-change', this.valueLocal);
      },
      deep: true
    }*/
  },
  render(h, cx) {
    let $handler;
    if (ITEMTYPELIST[this.type]) {
      $handler = h(ITEMTYPELIST[this.type], {
        ref: this.ref,
        props: { value: this.valueLocal, ...this.config, type: this.type },
        on: {
          change: (val, opt) => {
            this.valueLocal = val;
            this.$emit('on-change', this.valueLocal, opt);
            //console.log(JSON.stringify(opt));
          }
        }
      });
    }
    return h('div', [$handler]);
  }
};
</script>
<style scoped></style>
