import formcheckbox from './checkbox';
import formdate from './date';
import forminput from './input';
import formradio from './radio';
import formselect from './select';
import formtextarea from './textarea';
import formtime from './time';
import formeditor from './editor.vue';
import formdivider from './divider.vue';
import formstaticlist from './staticList/staticList.vue'; // 表格输入组件
import formcascadelist from './cascadeList.vue'; // 级联下拉组件
import formdynamiclist from './dynamicList/dynamicList.vue'; // 表格选择组件
import formuserselect from './userSelect.vue';
import formlink from './link.vue';
import formtreeselect from './treeSelect.vue';
import formcmdbcientity from './cmdbcientity/index.vue'; // 配置项组件
import cmdb from '@/views/pages/cmdb/form/view/index.js';
import formaccounts from './accounts.vue'; // 账号选择组件
import resourceinput from './resourceinput/resourceinput.vue'; // 资产输入组件
import formresoureces from './resoureces/resoureces.vue'; // 执行目标组件
import formupload from './upload'; //上传附件
import protocol from './protocol.vue'; // 连接协议组件
let newObj = {
  formcheckbox,
  formdate,
  forminput,
  formradio,
  formselect,
  formtextarea,
  formtime,
  formeditor,
  formdivider,
  formstaticlist,
  formcascadelist,
  formdynamiclist,
  formuserselect,
  formlink,
  formtreeselect,
  formcmdbcientity,
  ...cmdb,
  formaccounts,
  resourceinput,
  formresoureces,
  formupload,
  protocol
};

import Loader from 'publics/CustomModuleLoader.js';
Loader.load(newObj, 'formview');
export default newObj;
