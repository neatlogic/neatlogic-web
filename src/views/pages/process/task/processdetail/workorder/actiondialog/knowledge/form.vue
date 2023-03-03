<template>
  <div v-if="config && config.isChecked">
    <div class="fz-h1">{{ config.title }}</div>
    <FormPreview
      ref="FormPreview"
      :content="config.formConfig"
      :isReadonly="true"
      :knowledgeView="true"
    ></FormPreview>
  </div>
</template>
<script>
import FormPreview from '@/resources/components/FormMaker/formview/form-view.vue';
export default {
  name: '',
  components: {
    FormPreview
  },
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
    _this.$nextTick(() => {
      if (_this.$refs.FormPreview) {
        _this.$refs.FormPreview.updateFormval(_this.config.formAttributeDataMap);
      }
    }, 1000);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getData() {
      // 获取转知识的数据
      let list = [];
      let detailHtml = this.getInnerHtml();
      let titleConfig = { handler: 'h1', uuid: this.$utils.setUuid(), content: this.config.title };
      let contentConfig = { handler: 'formtable', uuid: this.$utils.setUuid(), content: detailHtml };
      list.push(titleConfig, contentConfig);
      return list;
    },
    getInnerHtml() {
      // 获取预览DOM节点
      let $contain = this.$refs.FormPreview.$el;
      $contain = $contain.cloneNode(true);
      $contain.querySelectorAll('.ts-avatar').forEach(ava => {
        ava.remove();
      });
      let $td = $contain.querySelectorAll('table.sheet-table>tbody>tr>td');
      let specialList = ['formstaticlist', 'formdynamiclist', 'formaccounts', 'cientityselect']; //包含表格的控件
      let custommergeprocess = ['custommergeprocess']; // 批量合并上报表格
      let skipList = ['formeditor']; //需要是源代码的控件
      let formList = ['forminput', 'formradio', 'formcheckbox', 'formtextarea', 'formdate', 'formtime', 'formuserselect', 'formcascadelist', 'formdivider', 'formlink', 'formcmdbcientity', 'formresoureces']; // input输入框，单选，复选，textarea，日期，时间获取不到值
      $td.forEach($el => {
        $el.style.removeProperty('border');
        let type = $el.getAttribute('type');
        let tip = $el.querySelector('.component-tips.ts-info') ? $el.querySelector('.component-tips.ts-info').innerText : '';
        if (specialList.indexOf(type) >= 0) {
          //包含表格
          $el.querySelectorAll('table>tbody>tr>td').forEach(item => {
            // 表格里面是否嵌套表格
            if (item.querySelectorAll('table>tbody>tr>td').length > 0 && (type == 'formstaticlist' || type == 'formdynamiclist')) {
              // 表格输入组件额外处理
              item.querySelectorAll('table>tbody>tr>td').forEach(val => {
                val.setAttribute('style', 'white-space: pre-wrap;');
                val.innerHTML = this.getDifferentType(val);
              });
            } else {
              item.setAttribute('style', 'white-space: pre-wrap;'); // 添加换行属性
              item.innerHTML = this.getDifferentType(item);
            }
          });
        } else if (custommergeprocess.indexOf(type) >= 0) {
          // 处理合并上报表格
          $el.querySelectorAll('table>tbody>tr>td').forEach(item => {
            if (item.querySelectorAll('table>tbody>tr>td')) {
              item.querySelectorAll('table>tbody>tr>td').forEach(val => {
                val.setAttribute('style', 'white-space: pre-wrap;');
                if (val.querySelectorAll('table>tbody>tr>td')) {
                  val.querySelectorAll('table>tbody>tr>td').forEach((innerVal) => {
                    // 第三层循环
                    if (innerVal.querySelectorAll('table>tbody>tr>td')) {
                      innerVal.querySelectorAll('table>tbody>tr>td').forEach((lastVal) => {
                        // 第四层循环
                        lastVal.setAttribute('style', 'white-space: pre-wrap;');
                        lastVal.innerHTML = this.getDifferentType(lastVal);
                      });
                    } else {
                      innerVal.setAttribute('style', 'white-space: pre-wrap;');
                      innerVal.innerHTML = this.getDifferentType(innerVal);
                    }
                  });
                } else {
                  val.innerHTML = this.getDifferentType(val);
                }
              });
            } else {
              item.innerHTML = this.getDifferentType(item);
            }
          });
        } else if (skipList.indexOf(type) < 0) {
          //排除富文本编辑框
          if (formList.indexOf(type) >= 0) {
            $el.innerHTML = this.getValueByType($el, type);
          } else {
            $el.innerHTML = $el.innerText + (tip ? '<span class="component-tips ts-info">' + tip + '</span>' : '');
          }
        }
      });
      return $contain.querySelector('table.sheet-table').parentNode.innerHTML;
    },
    getValueByType(elDom, type) {
      // 根据不同的类型获取值
      switch (type) {
        case 'forminput': // 输入框组件
        case 'formdate': // 日期组件
        case 'formtime': // 时间组件
          // input输入框
          return elDom.querySelector('input') ? elDom.querySelector('input').value : '';   
        case 'formradio': // 单选按钮
          return elDom.querySelector('.ivu-radio-wrapper-checked') ? elDom.querySelector('.ivu-radio-wrapper-checked').innerText : '';
        case 'formcheckbox': // 复选框
          return this.getCheckbox(elDom);
        case 'formtextarea': // 富文本
          return elDom.querySelector('textarea') ? elDom.querySelector('textarea').value : '';
        case 'formcascadelist': // 级联下拉
          return this.getFormCascadelist(elDom);
        case 'formuserselect': // 用户选择组件
          return elDom.querySelector('.userselect-input') ? elDom.querySelector('.userselect-input').value : '';
        case 'formdivider': // 分割线组件
          return '<div style="border-top: 1px solid #000; width: 100%;"></div>';
        case 'formlink': // 超链接
          return `<a href=${elDom.querySelector('a') ? elDom.querySelector('a').getAttribute('href') : ''} target="_blank" style="cursor:pointer;color: #1670F0;">${elDom.querySelector('a') ? elDom.querySelector('a').innerText : ''}</a>`;
        case 'formcmdbcientity': // 配置项组件
          return this.getFormCmdbcientity(elDom);
        case 'formresoureces': //执行目标
          return this.getFormResoureces(elDom);
        default:
          break;
      }
    },
    getFormCmdbcientity(elDom) {
      // 请选择配置项组件，处理样式问题,elDom 表示dom节点
      let textValue = '';
      elDom.querySelectorAll('.ivu-tag') && elDom.querySelectorAll('.ivu-tag').forEach((val) => {
        textValue += `<span style="display: inline-block; margin-right: 10px;">${val.querySelector('.ivu-tag-text').innerText}</span>`;
      });
      return textValue;
    },
    getFormCascadelist(elDom) {
      // 级联下拉，处理排版问题
      let arr = '';
      if (elDom.querySelectorAll('.tag-contian')) {
        // 解决获取不到值的问题
        elDom.querySelectorAll('.tag-contian').forEach((val) => {
          arr += `<span style="display:inline-block;margin-right:10px;">${val.querySelector('span') ? val.querySelector('span').innerText : ''}</span>`;
        });
      } else {
        elDom.querySelectorAll('.item-block').forEach((val) => {
          arr += `<p>${val.innerText}</p>`;
        });
      }
      return arr;
    },
    getCheckbox(elDom) {
      // 获取复选框选中的值，elDom 表示当前点击DOM节点
      let textValue = '';
      if (elDom.querySelectorAll('.ivu-checkbox-wrapper-checked').length > 0) {
        try {
          elDom.querySelectorAll('.ivu-checkbox-wrapper-checked').forEach((val) => {
            textValue += val.innerText + '<br/>';
          });
        } catch (error) {
          textValue = '';
        }
      } else if (elDom.querySelector('.ivu-checkbox-wrapper-checked')) {
        textValue = elDom.querySelector('.ivu-checkbox-wrapper-checked') && elDom.querySelector('.ivu-checkbox-wrapper-checked').innerText;
      } else {
        textValue = '';
      }
      return textValue;
    },
    getDifferentType(item) {
      // 表格内嵌form表单处理，根据不同的form表达获取不同的值
      if (item.querySelector('.ivu-radio-wrapper-checked>span:nth-child(2)')) {
        // 单选框
        return item.querySelector('.ivu-radio-wrapper-checked>span:nth-child(2)').innerText;
      } else if (item.querySelector('.ivu-checkbox-group')) {
        // 复选框
        let textValue = '';
        if (item.querySelectorAll('.ivu-checkbox-wrapper-checked').length > 0) {
          item.querySelectorAll('.ivu-checkbox-wrapper-checked').forEach((val) => {
            textValue += val.innerText + '<br/>';
          });
        } else {
          textValue = item.querySelector('.ivu-checkbox-wrapper-checked') && item.querySelector('.ivu-checkbox-wrapper-checked').innerText;
        }
        return textValue;
      } else if (item.querySelector('input')) {
        // input 输入框
        return item.querySelector('input').value;
      } else if (item.querySelector('textarea')) {
        // 文本域
        return item.querySelector('textarea').value;
      } else {
        return item.innerText;
      }
    },
    getFormResoureces(elDom) {
      // 执行目标，处理样式问题,elDom 表示dom节点
      let textValue = '';
      elDom.querySelectorAll('.tag-item-text') && elDom.querySelectorAll('.tag-item-text').forEach((val) => {
        textValue += `<span style="display: inline-block; margin-right: 10px;">${val.innerText}</span>`;
      });
      return textValue;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
