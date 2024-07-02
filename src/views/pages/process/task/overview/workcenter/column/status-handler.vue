<template>
  <div>
    <div v-if="!$utils.isEmpty(rowData[headerKey])" :style="{ color: rowData[headerKey].color }">
      {{ rowData[headerKey].text }}
    </div>
  </div>
</template>
<script>
import mixin from './mixin';
export default {
  mixins: [mixin]
};
</script>
