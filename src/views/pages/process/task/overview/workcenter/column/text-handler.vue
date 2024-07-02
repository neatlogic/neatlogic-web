<template>
  <div>
    <div v-if="!$utils.isEmpty(rowData[headerKey])">
      {{ rowData[headerKey] }}
    </div>
  </div>
</template>
<script>
import mixin from './mixin';
export default {
  mixins: [mixin]
};
</script>
