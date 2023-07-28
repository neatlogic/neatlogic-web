
import formcheckbox from './checkbox';
import formdate from './date';
import forminput from './input';
import formradio from './radio';
import formselect from './select';
import formtextarea from './textarea';
import formtime from './time';
import formeditor from './editor';
import formdivider from './divider.vue';
import formstaticlist from './staticList/staticList.vue';
import formcascadelist from './cascadeList.vue';
import formdynamiclist from './dynamicList.vue';
import formuserselect from './userSelect.vue';
import formlink from './link.vue';
import formtreeselect from './treeSelect.vue';
import formcmdbcientity from './cmdbcientity.vue';
import formpriority from './extendComponents/priority.vue';
import formaccounts from './accounts.vue'; // 账号选择组件
import resourceinput from './resourceinput.vue'; // 资产输入组件
import formresoureces from './resoureces.vue'; // 执行目标组件
import formupload from './upload'; //上传附件
import protocol from './protocol.vue'; // 连接协议组件

//cmdb组件
import cmdb from '@/views/pages/cmdb/form/edit';

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
  formpriority,
  formcmdbcientity,
  ...cmdb,
  formaccounts,
  resourceinput,
  formresoureces,
  formupload,
  protocol
};

import Loader from 'publics/CustomModuleLoader.js';
Loader.load(newObj, 'formedit');
export default newObj;
