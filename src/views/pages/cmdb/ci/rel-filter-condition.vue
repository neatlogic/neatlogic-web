<template>
  <div>
    <div v-if="errorMessage" class="text-error mb-md">{{ errorMessage }}</div>
    <TsRow class="mb-md">
      <Col span="6" class="text-grey">{{ $t('term.cmdb.group') }}</Col>
      <Col span="18">
        <TsFormSelect
          :value="value.groupId"
          :dataList="groupList"
          valueName="id"
          textName="name"
          transfer
          @change="setField('groupId', $event)"
        ></TsFormSelect>
      </Col>
    </TsRow>
    <TsRow class="mb-md">
      <Col span="6" class="text-grey">ID</Col>
      <Col span="18"><TsFormInput :value="value.filterCiEntityId" @change="setField('filterCiEntityId', $event)"></TsFormInput></Col>
    </TsRow>
    <TsRow v-if="downwardCiList.length || value.filterCiId" class="mb-md">
      <Col span="6" class="text-grey">{{ $t('term.cmdb.ci') }}</Col>
      <Col span="18">
        <TsFormSelect
          :value="value.filterCiId"
          :dataList="downwardCiList"
          valueName="id"
          textName="label"
          transfer
          @change="setField('filterCiId', $event)"
        ></TsFormSelect>
      </Col>
    </TsRow>
    <TsRow v-for="attr in globalAttrList" :key="'global_' + attr.id" class="mb-md">
      <Col span="6" class="text-grey tsfont-internet">{{ attr.label }}</Col>
      <Col span="6">
        <TsFormSelect
          :value="getCondition('globalAttrFilterList', attr).expression"
          :dataList="globalExpressionList"
          transfer
          @change="setCondition('globalAttrFilterList', attr, 'expression', $event)"
        ></TsFormSelect>
      </Col>
      <Col v-if="needsValue(getCondition('globalAttrFilterList', attr).expression)" span="12">
        <TsFormSelect
          :value="getCondition('globalAttrFilterList', attr).valueList"
          dynamicUrl="/api/rest/cmdb/globalattritem/search"
          :params="{ attrId: attr.id }"
          valueName="id"
          textName="value"
          transfer
          multiple
          @change="setCondition('globalAttrFilterList', attr, 'valueList', $event)"
        ></TsFormSelect>
      </Col>
    </TsRow>
    <TsRow v-for="attr in attrList" :key="'attr_' + attr.id" class="mb-md">
      <Col span="6" class="text-grey">{{ attr.label }}</Col>
      <Col span="6">
        <TsFormSelect
          :value="getCondition('attrFilterList', attr).expression"
          :dataList="attr.expressionList"
          transfer
          @change="setCondition('attrFilterList', attr, 'expression', $event)"
        ></TsFormSelect>
      </Col>
      <Col v-if="needsValue(getCondition('attrFilterList', attr).expression)" span="12">
        <AttrSearcher
          :attrData="attr"
          :valueList="getCondition('attrFilterList', attr).valueList"
          @setData="setCondition('attrFilterList', attr, 'valueList', $event)"
        ></AttrSearcher>
      </Col>
    </TsRow>
    <TsRow v-for="rel in relList" :key="rel.direction + rel.id" class="mb-md">
      <Col span="6" class="text-grey">{{ rel.direction === 'from' ? rel.toLabel : rel.fromLabel }}</Col>
      <Col span="6">
        <TsFormSelect
          :value="getCondition('relFilterList', rel).expression"
          :dataList="rel.expressionList"
          transfer
          @change="setCondition('relFilterList', rel, 'expression', $event)"
        ></TsFormSelect>
      </Col>
      <Col v-if="needsValue(getCondition('relFilterList', rel).expression)" span="12">
        <TsFormSelect
          :value="getCondition('relFilterList', rel).valueList"
          dynamicUrl="/api/rest/cmdb/cientity/search"
          :params="{ ciId: rel.direction === 'from' ? rel.toCiId : rel.fromCiId, showAttrRelList: ['const_id', 'const_name'], keywordAsName: true }"
          rootName="tbodyList"
          valueName="id"
          textName="name"
          transfer
          multiple
          @change="setCondition('relFilterList', rel, 'valueList', $event)"
        ></TsFormSelect>
      </Col>
    </TsRow>
  </div>
</template>
<script>
export default {
  name: 'RelFilterCondition',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    AttrSearcher: () => import('../cientity/attr-searcher.vue')
  },
  props: {
    value: { type: Object, required: true },
    attrList: { type: Array, default: () => [] },
    globalAttrList: { type: Array, default: () => [] },
    relList: { type: Array, default: () => [] },
    downwardCiList: { type: Array, default: () => [] },
    groupList: { type: Array, default: () => [] }
  },
  data() {
    return {
      errorMessage: '',
      globalExpressionList: [
        { value: 'like', text: this.$t('term.expression.like') },
        { value: 'notlike', text: this.$t('term.expression.notlike') },
        { value: 'is-null', text: this.$t('term.expression.empty') },
        { value: 'is-not-null', text: this.$t('term.expression.notempty') }
      ]
    };
  },
  mounted() {
    // 已失效的条件保留在草稿中并提示，避免保存时悄悄扩大过滤范围。
    this.checkMetadata();
  },
  methods: {
    // 单值筛选只更新草稿，空值在最终序列化时移除。
    setField(field, fieldValue) {
      this.$emit('input', { ...this.value, [field]: fieldValue });
      this.errorMessage = '';
    },
    // 关系必须同时匹配方向，以支持自关联的两端条件。
    getCondition(listName, metadata) {
      return (this.value[listName] || []).find(item => {
        if (listName === 'relFilterList') {
          return String(item.relId) === String(metadata.id) && item.direction === metadata.direction;
        }
        return String(item.attrId) === String(metadata.id);
      }) || {};
    },
    // 清除操作符即移除该条件；值输入不自动指定操作符。
    setCondition(listName, metadata, field, fieldValue) {
      const list = this.$utils.deepClone(this.value[listName] || []);
      const existing = this.getCondition(listName, metadata);
      const index = (this.value[listName] || []).indexOf(existing);
      if (field === 'expression' && !fieldValue) {
        if (index >= 0) {
          list.splice(index, 1);
        }
      } else {
        let item = index >= 0 ? list[index] : null;
        const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
        if (!item && field === 'valueList' && !values.some(val => this.hasValue(val))) {
          return;
        }
        if (!item) {
          item = listName === 'relFilterList' ? { relId: metadata.id, direction: metadata.direction } : { attrId: metadata.id };
          list.push(item);
        }
        item[field] = field === 'valueList' ? this.$utils.deepClone(values) : fieldValue;
        if (!this.needsValue(item.expression)) {
          item.valueList = [];
        }
      }
      this.$emit('input', { ...this.value, [listName]: list });
      this.errorMessage = '';
    },
    // 空值操作符无需填写值，其他操作符使用高级搜索原有输入组件。
    needsValue(expression) {
      return expression !== 'is-null' && expression !== 'is-not-null';
    },
    // 数值零是合法值；日期范围的嵌套数组也必须填写完整。
    hasValue(val) {
      return val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || (val.length > 0 && val.every(item => this.hasValue(item))));
    },
    // 校验元数据引用与操作符，失效条件只能由用户显式清空或修正。
    checkMetadata() {
      const lists = [
        ['attrFilterList', this.attrList],
        ['globalAttrFilterList', this.globalAttrList],
        ['relFilterList', this.relList]
      ];
      const invalid = [];
      lists.forEach(([name, metadataList]) => {
        (this.value[name] || []).forEach(item => {
          const metadata = metadataList.find(meta => name === 'relFilterList'
            ? String(meta.id) === String(item.relId) && meta.direction === item.direction
            : String(meta.id) === String(item.attrId));
          const expressions = name === 'globalAttrFilterList' ? this.globalExpressionList : metadata && metadata.expressionList;
          if (!metadata || (item.expression && !(expressions || []).some(expression => expression.value === item.expression))) {
            invalid.push(item.attrId || (item.direction + ':' + item.relId));
          }
        });
      });
      [['groupId', this.groupList], ['filterCiId', this.downwardCiList]].forEach(([field, options]) => {
        if (this.hasValue(this.value[field]) && !options.some(option => String(option.id) === String(this.value[field]))) {
          invalid.push(this.value[field]);
        }
      });
      if (invalid.length) {
        this.errorMessage = this.$t('term.cmdb.relfilterinvalid') + ': ' + invalid.join(', ');
        return false;
      }
      return true;
    },
    // 对已填写的条件严格检查，不将缺少操作符或值的半成品静默忽略。
    valid() {
      this.errorMessage = '';
      if (!this.checkMetadata()) {
        return false;
      }
      const lists = ['attrFilterList', 'globalAttrFilterList', 'relFilterList'];
      const invalid = lists.some(name => (this.value[name] || []).some(item => !item.expression ||
        (this.needsValue(item.expression) && (!Array.isArray(item.valueList) || !item.valueList.length || item.valueList.some(val => !this.hasValue(val))))));
      // 范围输入沿用单边区间语义，但仅有分隔符时不构成有效条件。
      const invalidRange = (this.value.attrFilterList || []).some(item => {
        const attr = this.attrList.find(meta => String(meta.id) === String(item.attrId));
        return attr && ['number', 'date', 'datetime', 'time', 'datetimerange'].includes(attr.type) && this.needsValue(item.expression) &&
          (item.valueList || []).some(val => val === '~');
      });
      const invalidId = this.hasValue(this.value.filterCiEntityId) && !/^[1-9]\d*$/.test(String(this.value.filterCiEntityId));
      if (invalid || invalidRange || invalidId) {
        this.errorMessage = this.$t('message.framework.plecompletecondition');
        return false;
      }
      return true;
    },
    // 仅输出高级搜索的持久化条件字段，空草稿明确输出 null 以清空旧配置。
    getFilter() {
      const filter = {};
      ['groupId', 'filterCiEntityId', 'filterCiId'].forEach(field => {
        if (this.hasValue(this.value[field])) {
          filter[field] = this.value[field];
        }
      });
      ['attrFilterList', 'globalAttrFilterList', 'relFilterList'].forEach(name => {
        if (this.value[name] && this.value[name].length) {
          filter[name] = this.value[name].map(item => {
            const result = { expression: item.expression, valueList: this.needsValue(item.expression) ? this.$utils.deepClone(item.valueList) : [] };
            if (name === 'relFilterList') {
              result.relId = item.relId;
              result.direction = item.direction;
            } else {
              result.attrId = item.attrId;
            }
            return result;
          });
        }
      });
      return Object.keys(filter).length ? filter : null;
    }
  }
};
</script>
