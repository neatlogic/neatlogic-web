<template>
  <div class="text-overflow">
    <div v-if="item.conditionGroupList">
      <Tooltip
        max-width="800"
        transfer
        theme="light"
      >
        <span v-for="(groupitem, groupindex) in groups" :key="groupindex">
          <span>(</span>
          <span
            v-for="(conitem, conindex) in groupitem.conditionList"
            :key="conindex"
            :class="conitem.error || (conitem.result === false && !item.result) ? 'text-danger' : ''"
            style="display: inline-block"
          >
            <span v-if="conitem.type != 'custom'">{{ conitem.name }}</span>
            <span v-if="conitem.type != 'custom'" style="padding: 0 8px">{{ conitem.expression }}</span>
            <span v-if="conitem.type != 'custom'">{{ conitem.valueList == null ? '' : conitem.valueList }}</span>
            <span v-if="conitem.type == 'custom'"><TsCodemirror
              :value="conitem.expression"
              codeMode="javascript"
              :isReadOnly="true"
              height="100px"
            ></TsCodemirror>
            </span>
            <span v-if="conitem.error" class="text-error">{{ conitem.error }}</span>
            <span v-if="groupitem.conditionRelList && groupitem.conditionRelList[conindex]" class="text-primary" style="margin: 0 6px">{{ groupitem.conditionRelList[conindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
          </span>
          <span style="margin-left: 0px">)</span>
          <span v-if="item.conditionGroupRelList && item.conditionGroupRelList[groupindex]" class="text-primary" style="margin: 0 6px">{{ item.conditionGroupRelList[groupindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
        </span>
        <div slot="content">
          <span v-for="(groupitem, groupindex) in groups" :key="groupindex">
            <span>(</span>
            <span v-for="(conitem, conindex) in groupitem.conditionList" :key="conindex" :class="conitem.error || (conitem.result === false && !item.result) ? 'text-danger' : ''">
              <span v-if="conitem.type != 'custom'">{{ conitem.name }}</span>
              <span v-if="conitem.type != 'custom'" style="padding: 0 8px">{{ conitem.expression }}</span>
              <span v-if="conitem.type != 'custom'">{{ conitem.valueList == null ? '' : conitem.valueList }}</span>
              <span v-if="conitem.type == 'custom'">{{ conitem.expression }}</span>
              <span v-if="groupitem.conditionRelList && groupitem.conditionRelList[conindex]" class="text-primary" style="margin: 0 6px">{{ groupitem.conditionRelList[conindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
            </span>
            <span style="margin-left: 0px">)</span>
            <span v-if="item.conditionGroupRelList && item.conditionGroupRelList[groupindex]" class="text-primary" style="margin: 0 6px">{{ item.conditionGroupRelList[groupindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
          </span>
        </div>
      </Tooltip>
    </div>
  </div>
</template>
<script>
export default {
  components: {TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')},
  props: {item: {type: Object, required: true}},
  methods: {
    inEvaluationOrder(items = [], links = []) {
      if (!links?.length || !items?.length) return items || [];
      const indexed = new Map(items.map(item => [item.uuid, item]));
      const ids = links.map(link => link.from).concat(links[links.length - 1].to);
      // 关系不完整的旧配置仍展示所有行，便于定位记录中的错误。
      return ids.length === items.length && new Set(ids).size === items.length && ids.every(id => indexed.has(id))
        ? ids.map(id => indexed.get(id)) : items;
    }
  },
  computed: {
    // 按底座求值所用的 UUID 链展示，而不是假设存储数组恰好同序。
    groups() {
      return this.inEvaluationOrder(this.item.conditionGroupList, this.item.conditionGroupRelList).map(group => ({
        ...group, conditionList: this.inEvaluationOrder(group.conditionList, group.conditionRelList)
      }));
    }
  }
};
</script>
