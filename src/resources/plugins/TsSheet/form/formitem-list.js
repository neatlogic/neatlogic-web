import { $t } from '@/resources/init.js';
import { default as formlabel } from './define/formlabel.js';
import { default as formtext } from './define/formtext.js';
import { default as formtextarea } from './define/formtextarea.js';
import { default as formckeditor } from './define/formckeditor.js';
import { default as formnumber } from './define/formnumber.js';
import { default as formpassword } from './define/formpassword.js';
import { default as formselect } from './define/formselect.js';
import { default as formcascader } from './define/formcascader.js';
import { default as formradio } from './define/formradio.js';
import { default as formcheckbox } from './define/formcheckbox.js';
import { default as formtableselector } from './define/formtableselector.js';
import { default as formtableinputer } from './define/formtableinputer.js';
import { default as formdate } from './define/formdate.js';
import { default as formtime } from './define/formtime.js';
import { default as formlink } from './define/formlink.js';
import { default as formrate } from './define/formrate.js';
import { default as formuserselect } from './define/formuserselect.js';
import { default as formtreeselect } from './define/formtreeselect.js';
import { default as formaccounts } from './define/formaccounts.js';
import { default as formupload } from './define/formupload.js';
import { default as formdivider } from './define/formdivider.js';
import { default as formcube } from './define/formcube.js';
import { default as formtab } from './define/formtab.js';
import { default as formcollapse } from './define/formcollapse.js';
import { default as CMDBITEMS } from '@/views/pages/cmdb/form/define';
import { default as AUTOEXECITEMS } from '@/views/pages/autoexec/form/define';
import { default as formsubassembly } from './define/formsubassembly.js'; //表单子组件

export const FORMITEM_CATEGORY = [
  { value: 'basic', text: $t('term.report.basicwidget') },
  { value: 'layout', text: $t('term.framework.layoutwidget') },
  { value: 'autoexec', text: $t('term.framework.automationwidget') },
  { value: 'cmdb', text: $t('term.framework.cmdbwidget') }
];
let importComponentConfig = {};
let defineList = [];
try {
  // 导入自定义组件
  const componentConfig = require.context('@/commercial-module', true, /formdefine.js$/);
  componentConfig.keys().forEach(path => {
    if (path) {
      const moduleName = path.split('/')[1]?.split('-')?.pop() || path.split('/')[1];
      if (moduleName == MODULEID) {
        importComponentConfig = componentConfig(path).default || {};
      }
    }
  });
  for (let key in importComponentConfig) {
    if (key && importComponentConfig.hasOwnProperty(key)) {
      defineList.push(importComponentConfig[key]);
    }
  }
} catch (error) {
  console.error('formitem-list.js抛出异常', error);
}
export const FORMITEMS = [formlabel, formtext, formtextarea, formckeditor, formnumber, formpassword, formselect, formcascader, formradio, formcheckbox, formcube, formtableselector, formtableinputer, formdate, formtime, formlink, formrate, formuserselect, formtreeselect, formaccounts, formupload, formdivider, formtab, formcollapse, formsubassembly, ...CMDBITEMS, ...AUTOEXECITEMS, ...defineList];
