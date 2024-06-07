<template>
  <div v-if="config && config.isChecked">
    <div class="fz-h1">{{ config.title }}</div>
    <TsSheet
      ref="formSheet"
      mode="read"
      :value="config.formConfig"
      :data="config.formAttributeDataMap"
      :readonly="true"
      class="pl-sm pr-sm"
    ></TsSheet>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue')
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
  mounted() {},
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
      let $contain = this.$refs.formSheet.$el;
      $contain = $contain.cloneNode(true);
      $contain.querySelectorAll('.ts-avatar').forEach(ava => {
        ava.remove();
      });
      $contain.querySelector('table.tssheet-main').removeAttribute('style'); // 删除style属性
      if ($contain.querySelector('table.tssheet-main>colgroup') && $contain.querySelectorAll('table.tssheet-main>colgroup>col')) {
        let $col = $contain.querySelectorAll('table.tssheet-main>colgroup>col');
        let $colWidth = $col.length;
        $col.forEach((item) => {
          if (item) {
            item.setAttribute('style', `width: ${100 / $colWidth}%`);
          }
        });
      }
      let $td = $contain.querySelectorAll('table.tssheet-main>tbody>tr>td');
      $td.forEach($el => {
        if ($el.getAttribute('style')) {
          // 添加td之间的间隙
          $el.style.padding = '6px;';
          $el.setAttribute('style', $el.getAttribute('style') + 'padding: 6px;');
        } else {
          $el.setAttribute('style', 'padding: 6px');
        }
        if (this.getValueByComponent($el)) {
          $el.innerHTML = this.getValueByComponent($el);
        } else {
          $el.innerHTML = $el.innerText;
        }
      });
      return $contain.querySelector('table.tssheet-main').parentNode.innerHTML;
    },
    getValueByComponent(elDom) {
      // 根据不同的类型获取值
      if (elDom.querySelector('.divider-width-text-left') && elDom.querySelector('.divider-inner-text')) {
        // 分割线
        if (elDom.style && elDom.style.textAlign) {
          elDom.style.textAlign = 'left';
          elDom.style.fontWeight = 'bold';
        }
        return elDom.querySelector('.divider-inner-text').innerText || '';
      } else if (elDom.querySelector('table.table-main.tstable-body') || elDom.querySelector('table.tstable-body')) {
        // 过滤表格组件，暂时不显示表格组件内容
        return '-';
      } else if (elDom.querySelector('.ivu-tabs') || elDom.querySelector('.ivu-collapse')) {
        // 过滤选项卡组件，折叠面板组件，暂时不显示内容
        return '-';
      } else if (elDom.querySelector('.upload.smallUpload')) {
        // 处理附件上传组件
        return this.handleUploadValue(elDom);
      } else if (elDom.querySelector('a') && elDom.querySelector('a').getAttribute('href')) {
        // 超链接
        return `<a href=${elDom.querySelector('a') ? elDom.querySelector('a').getAttribute('href') : ''} target="_blank" style="cursor:pointer;color: #1670F0;">${elDom.querySelector('a') ? elDom.querySelector('a').innerText : ''}</a>`;
      } else if (elDom.querySelector('.divider')) {
        // 分割线
        return '<div style="border-top: 1px solid #000; width: 100%;"></div>';
      } else if (elDom.querySelector('.view-detail')) {
        // 执行目标
        return this.getFormResoureces(elDom);
      } else if (elDom.querySelectorAll('.ivu-tag')) {
        // 配置项
        return this.getFormCmdbcientity(elDom);
      }
    },
    handleUploadValue(elDom) {
      // 处理附件上传
      let textValue = '';
      if (elDom.querySelector('.upload.smallUpload .upload_block') && elDom.querySelectorAll('.upload.smallUpload .upload_block .ivu-col')) {
        elDom.querySelectorAll('.upload.smallUpload .upload_block .ivu-col').forEach((item) => {
          if (item.querySelector('.file_name .ivu-tooltip>.ivu-tooltip-rel')) {
            textValue += `<div style="margin-bottom: 6px;">${item.querySelector('.file_name .ivu-tooltip>.ivu-tooltip-rel').innerText}</div>`;
          }
        });
      }
      return textValue || '-';
    },
    getFormCmdbcientity(elDom) {
      // 配置项组件，处理样式问题
      let textValue = '';
      elDom.querySelectorAll('.ivu-tag') && elDom.querySelectorAll('.ivu-tag').forEach((val) => {
        textValue += `<span style="display: inline-block; margin-right: 10px;">${val.querySelector('.ivu-tag-text').innerText}</span>`;
      });
      return textValue;
    },
    getFormResoureces(elDom) {
      // 执行目标组件
      let textValue = '';
      elDom.querySelector('.view-detail') && elDom.querySelectorAll('.view-detail span').forEach((val) => {
        textValue += `<div style="margin-right: 10px;">${val.innerText}</div>`;
      });
      return textValue;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
