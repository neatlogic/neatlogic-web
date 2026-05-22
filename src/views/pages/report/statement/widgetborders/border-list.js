import {$t} from '@/resources/init.js';

export const BORDER_LIST = [
  {
    name: 'techpanel',
    label: '科技面板',
    config: {
      cornersize: 28,
      width: 1,
      color: '#00e5ff',
      backgroundColor: 'rgba(6,27,45,0.74)',
      shadowColor: 'rgba(0,229,255,0.22)'
    }
  },
  {
    name: 'highlight',
    label: $t('term.report.highlightborder'),
    config: {
      cornersize: 8,
      width: 2,
      color: '#02a6b5',
      cocolor: 'rgba(255,255,255,0.2)'
    }
  },
  {
    name: 'twocolor',
    label: $t('term.report.doublecoloroverlap'),
    config: {
      delay: 4,
      width: 10,
      offset: 10,
      coloralpha: '#93e1d8',
      colorbeta: '#aa4465'
    }
  },
  {
    name: 'rainbow',
    label: $t('term.report.rainbowfluorescence'),
    config: {
      delay: 20,
      width: 0
    }
  },
  {
    name: 'gradient',
    label: '梯形边框',
    config: {
      titlefontsize: 13,
      titlecolor: '#02a6b5',
      cornersize: 8,
      width: 2,
      color: '#02a6b5',
      cocolor: 'rgba(229,229,229,0.2)'
    }
  }
];
