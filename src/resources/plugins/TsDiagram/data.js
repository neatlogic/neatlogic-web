var pieDemo1 = {
  legend: {
    straw: true,
    show: false,
    strawText: true, // 是否显示label，默认显示，false不显示
    strawValue: true, // 是否显示label value，默认显示，false不显示
    strawRatio: true, // 是否显示百分比，默认不显示，true显示
    periphery: 1, // 圆周大小，默认为1，取值范围：0 ~ 1
    padAngle: 1 // 环padding设置,角度，默认为0，取值范围：0 ~ 360
  },
  series: [
    {
      type: 'pie',
      sum: {
        value: 36,
        fontSize: 36,
        color: 'red'
      },
      data: [
        { value: 9, name: '交易类交易交易类交易交易类交易类交易类交易', unit: 'T' },
        { value: 6, name: '交易类', unit: 'T' },
        { value: 5, name: '类交易类交易类类交易类交易类交易类交易类', unit: 'T' }
      ]
    }
  ]
};

export default {
  data1: pieDemo1
};
