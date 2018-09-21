$.getJSON('lenChart_URL', {'caseid': caseid})
.done(function(lenChartData){
    var x = lenChartData.x
    var y = lenChartData.y
    var lenChart = echarts.init(document.getElementById('lenChart'));
    var option1 = {
        grid:{
            x:125,
            y:45,
            x2:0,
            y2:60,
        },
        xAxis: {
            name: 'circRNAs Length (bp)',
            nameLocation: 'center',
            type: 'category',
            nameGap: 30,
            nameTextStyle: {
                fontSize: 15,
            },
            data: x
        },
        yAxis: {
            name: 'Number of circRNAs',
            nameLocation: 'center',
            nameGap: 40,
            nameTextStyle: {
                fontSize: 15,
            },
            type: 'value',
            axisTick: {
                alignWithLabel: true,
            },
        },
        series: [{
            data: y,
            label: {
                    normal: {
                        show: true,
                        position: 'top'
                    },
            },
            type: 'line',
            smooth: true
        }]
    };

    lenChart.setOption(option1);
});

$.getJSON('exonChart_URL', {'caseid': caseid})
.done(function(exonChartData){
    var x = exonChartData.x
    var y = exonChartData.y
    var exonChart = echarts.init(document.getElementById('exonChart'));
    var option2 = {
        grid:{
            x:125,
            y:45,
            x2:0,
            y2:60,
        },
        xAxis: {
            name: 'Number of exons',
            nameLocation: 'center',
            type: 'category',
            nameGap: 30,
            nameTextStyle: {
                fontSize: 15,
            },
            data: x
        },
        yAxis: {
            name: 'Number of circRNAs',
            nameLocation: 'center',
            nameGap: 40,
            nameTextStyle: {
                fontSize: 15,
            },
            type: 'value',
            axisTick: {
                alignWithLabel: true,
            },
        },
        series: [{
            data: y,
            label: {
                    normal: {
                        show: true,
                        position: 'top'
                    },
            },
            type: 'line',
            smooth: true
        }]
    };

    exonChart.setOption(option2);
});

$.getJSON('isoChart_URL', {'caseid': caseid})
.done(function(isoChartData){
    var x = isoChartData.x
    var y = isoChartData.y
    var isoChart = echarts.init(document.getElementById('isoChart'));
var option3 = {
    grid:{
        x:125,
        y:45,
        x2:0,
        y2:60,
    },
    xAxis: {
        name: 'Number of isoforms',
        nameLocation: 'center',
        type: 'category',
        nameGap: 30,
        nameTextStyle: {
            fontSize: 15,
        },
        data: x
    },
    yAxis: {
        name: 'Number of circRNAs',
        nameLocation: 'center',
        nameGap: 40,
        nameTextStyle: {
            fontSize: 15,
        },
        type: 'value',
        axisTick: {
            alignWithLabel: true,
        },
    },
    series: [{
        data: y,
        label: {
                normal: {
                    show: true,
                    position: 'top'
                },
        },
        type: 'line',
        smooth: true
    }]
};

isoChart.setOption(option3);
});