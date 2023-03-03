<template> 
  <div></div>
</template>
<script>
// 作为中间页面,通过进入后立刻跳回,实现刷新页面的效果
export default {
  name: 'Refresh',
  created() {
    this.$router.replace(this.$route.query.path);
  }
};
</script>
