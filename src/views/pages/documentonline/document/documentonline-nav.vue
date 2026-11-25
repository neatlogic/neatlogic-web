<template>
  <nav class="help-breadcrumb" :aria-label="$t('term.documentonline.helpcenter')">
    <Breadcrumb separator="/">
      <BreadcrumbItem to="/documentonline">
        {{ $t('term.documentonline.helpcenter') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-for="(item,index) in upwardNameList" :key="index" :to="index < upwardNameList.length-1? goto(index):''">
        {{ item }}
      </BreadcrumbItem>
    </Breadcrumb>
  </nav>
</template>
<script>
export default {
  props: {
    upwardNameList: Array
  },
  methods: {
    goto(index) {
      const upwardNameList = this.upwardNameList.slice(0, index + 1).join('/');
      return '/documentonline-detail?upwardNameList=' + encodeURIComponent(upwardNameList) + '&isSiderHide=false&refresh=' + Date.now();
    }
  }
};
</script>
<style lang="less" scoped>
.help-breadcrumb {
  color: var(--help-muted);
  ::v-deep .ivu-breadcrumb {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  ::v-deep a {
    color: var(--help-muted);
    &:hover,
    &:focus-visible {
      color: var(--help-accent);
    }
  }
}
</style>
