//api接口的出口
import report from './report/report';
import sendjob from './sendjob/sendjob';
import statement from './statement/statement';
import reportdata from './reportdata/reportdata';

export default {
  report,
  sendjob,
  statement,
  reportdata
};
