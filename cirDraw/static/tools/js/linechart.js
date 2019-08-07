var url = $(location).attr('href').split("/");
var case_id = url[url.length -1].split('#')[0];
$.getJSON('lenChart_URL', {'caseid': case_id})
.done(function(lenChartData){
    //console.log(lenChartData);
    var x = lenChartData.x;
    var y = lenChartData.y;
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
            smooth: true,
            itemStyle: {color: "#fed136"},
        }],
        toolbox: {
            　　show: true,  
            　　feature: {
            　　　　saveAsImage: {
            　　　　show:true,
            　　　　title: "png",
            　　　　excludeComponents :['toolbox'],
            　　　　pixelRatio: 2
            　　　　}
            　　}
            },
            tooltip: {
                axisPointer: {
                        type: 'line'
                    }
            }
    };

    lenChart.setOption(option1);
    $(window).on('resize', function(){
        if(lenChart != null && lenChart != undefined){
            lenChart.resize();
        }
    });
});

$.getJSON('toplist/', {'case_id': case_id})
.done(function(topData){
    //console.log(topData);
    var x = topData.x.slice(0,20)
    var y = topData.y.slice(0,20)
    var topChart = echarts.init(document.getElementById('topChart'));
    var option2 = {
        grid:{
            x:125,
            y:45,
            x2:0,
            y2:60,
        },
        xAxis: {
            name: 'Gene',
            nameLocation: 'center',
            type: 'category',
            nameGap: 35,
            nameTextStyle: {
                fontSize: 15,
            },
            data: x,
            axisTick: {
                alignWithLabel: true
            },
            axisLabel: {
                interval: 0,
                fontSize: 10,
                rotate: 30,
            }
        },
        yAxis: {
            name: 'Number of circRNAs',
            nameLocation: 'center',
            nameGap: 25,
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
            type: 'bar',
            smooth: true,
            itemStyle: {color: "#fed136"},
        }],
        toolbox: {
            　　show: true,  
            　　feature: {
            　　　　saveAsImage: {
            　　　　show:true,
            　　　　title: "png",
            　　　　excludeComponents :['toolbox'],
            　　　　pixelRatio: 2
            　　　　}
            　　}
            }
    };

    topChart.setOption(option2);
    $(window).on('resize', function(){
        if(topChart != null && topChart != undefined){
            topChart.resize();
        }
    });
});