// Getting caseid for following drawing
var thisURL = document.URL
var caseid = thisURL.split("=")[1]

// Canvas for displaying circRNA
var circCanvas = document.getElementById("drawCirc");
var circCtx = circCanvas.getContext("2d");
circCanvas.width = 500
circCanvas.height = 500
var circWidth = circCanvas.width
var circHeight = circCanvas.height

// Setting Canvas to fit Retina Screen
ratio = window.devicePixelRatio
circCanvas.width = circWidth * ratio;
circCanvas.height = circHeight * ratio;
circCanvas.style.width = circWidth + 'px';
circCanvas.style.height = circHeight + 'px';
circWidth = circCanvas.width
circHeight = circCanvas.height

var lineY = 3*circHeight/5

ratioMessage = "devicePixelRatio: " + ratio
console.log(ratioMessage)

// Canvas for displaying density distribution
var denCanvas = document.getElementById("density");
var denCtx = denCanvas.getContext("2d")
denCanvas.width = 500
denCanvas.height = 500
var denWidth = denCanvas.width
var denHeight = denCanvas.height

// Setting Canvas to fit Retina Screen
denCanvas.width = denWidth * ratio;
denCanvas.height = denHeight * ratio;
denCanvas.style.width = denWidth + 'px';
denCanvas.style.height = denHeight + 'px';
denWidth = denCanvas.width
denHeight = denCanvas.height

// Drawing Different components on canvas
// Draw a stright line for chromosome
function drawLine(ctx,Yposition,lineWidth,color)
{
    ctx.beginPath();
    ctx.moveTo(50,Yposition);
    ctx.lineTo(circWidth-50,Yposition);
    ctx.closePath();
    ctx.lineWidth = lineWidth*ratio;
    ctx.lineStyle = color;
    ctx.stroke();
};

// the start and end of the Arc are relative to the Line!
function drawArc(ctx,start,end,lineWidth,color)
{
    var centerX = ((start+end)*(5*ratio-1)/8)+50
    var centerY = lineY-10*ratio
    var axisX = (end-start)*(5*ratio-1)/8
    var axisY = 0.5*axisX
    ctx.beginPath();
    ctx.ellipse(centerX,centerY,axisX,axisY,0,0,1 * Math.PI,true);
    ctx.lineWidth = lineWidth*ratio;
    ctx.strokeStyle = color;
    ctx.stroke();
};

// The rectangle represents the start/end site on chromosome
function drawRectangle(ctx,start,color)
{
    var x = (start*(5*ratio-1)/4) + 50 - ratio
    ctx.fillStyle = color;
    ctx.fillRect(x,lineY-8*ratio,2*ratio,16*ratio)
};

// The rectangle represents the genes on chromosome
function drawGene(ctx,start,end,name,color)
{
    var x = start*(5*ratio-1)/4 + 50
    var len = (end-start)*(5*ratio-1)/4
    ctx.fillStyle = color;
    ctx.fillRect(x,lineY-5*ratio,len,10*ratio)
    ctx.font = "18px Arial";
    ctx.fillText(name,x,lineY+20*ratio);
};

// Density distribution on one chromosome
var denPalette = {'color':['#E8D2CC', '#E6D0CB', '#E5CECA', '#E4CDC9', '#E2CBC8', '#E1CAC8', '#E0C8C7', '#DEC6C6', '#DDC5C5', '#DCC3C4', '#DBC2C4', '#D9C0C3', '#D8BEC2', '#D7BDC1', '#D5BBC0', '#D4BAC0', '#D3B8BF', '#D1B6BE', '#D0B5BD', '#CFB3BC', '#CEB2BC', '#CCB0BB', '#CBAEBA', '#CAADB9', '#C8ABB8', '#C7AAB8', '#C6A8B7', '#C4A6B6', '#C3A5B5', '#C2A3B4', '#C1A2B4', '#BFA0B3', '#BE9EB2', '#BD9DB1', '#BB9BB0', '#BA9AB0', '#B998AF', '#B796AE', '#B695AD', '#B593AC', '#B492AC', '#B290AB', '#B18EAA', '#B08DA9', '#AE8BA8', '#AD8AA8', '#AC88A7', '#AA86A6', '#A985A5', '#A883A4', '#A782A4', '#A580A3', '#A47EA2', '#A37DA1', '#A17BA0', '#A07AA0', '#9F789F', '#9D769E', '#9C759D', '#9B739C', '#9A729C', '#98709B', '#976E9A', '#966D99', '#946B98', '#936A98', '#926897', '#906696', '#8F6595', '#8E6394', '#8D6294', '#8B6093', '#8A5E92', '#895D91', '#875B90', '#865A90', '#85588F', '#83568E', '#82558D', '#81538C', '#80528C', '#7E508B', '#7D4E8A', '#7C4D89', '#7A4B88', '#794A88', '#784887', '#764686', '#754585', '#744384', '#734284', '#714083', '#703E82', '#6F3D81', '#6D3B80', '#6C3A80', '#6B387F', '#69367E', '#68357D', '#67337C', '#66327C']}

function drawDensityBackground(ctx,Yposition,chrLen,chrName)
{
    ctx.strokeRect(60,Yposition*ratio,chrLen*(5*ratio-1.2)/4,5*ratio)
    ctx.fillStyle = '#E8D2CC'
    ctx.fillRect(60,Yposition*ratio,chrLen*(5*ratio-1.2)/4,5*ratio)
    ctx.fillStyle = 'black'
    ctx.font = '16px Arial'
    ctx.fillText(chrName,5,(Yposition+5)*ratio)
};

function drawDensityBlock(ctx,Yposition,start,end,density)
{
    var x = start*(5*ratio-1.2)/4 + 60
    var len = (end-start)*(5*ratio-1.2)/4
    var color = denPelatte.color[density]
    grd = ctx.createLinearGradient(x,0,x+len,0);
    grd.addColorStop(0,"#E8D2CC");
    grd.addColorStop(0.5,color);
    grd.addColorStop(1,"#E8D2CC");
    ctx.fillStyle = grd;
    ctx.fillRect(x,Yposition*ratio,len,5*ratio);
};

function drawDensityLegend(ctx)
{
    grd = ctx.createLinearGradient(430*ratio,0,470*ratio,0);
    grd.addColorStop(0,"#E8D2CC");
    grd.addColorStop(1,'#66327C');
    ctx.fillStyle = grd;
    ctx.fillRect(430*ratio, 480*ratio,40*ratio,8*ratio);
    ctx.font = "18px Arial";
    ctx.fillText('0',420*ratio, 490*ratio-5)
    ctx.fillText('1',475*ratio, 490*ratio-5)
};

// jQuery Control of Web
// Scale-range
var realStart
var realEnd
$(document).ready((function() {
    $.getJSON('file3_URL',{'caseid': caseid})
    .done(function(scaleValue){
        realStart = scaleValue.realStart
        realEnd = scaleValue.realEnd
    });

    $("#start,#end").on('change', function () {
        var scaleMin = parseInt($("#start").val());
        var scaleMax = parseInt($("#end").val());
        if (scaleMin > scaleMax) {
          $('#end').val(scaleMin);
        }
        $("#slider-range").slider({
          values: [scaleMin, scaleMax]
        });
      });

  $( "#slider-range" ).slider({
    range: true,
    min: realStart,
    max: realEnd,
    values: [ realStart, realEnd ],
    slide: function( event, ui ) {
      $( "#start" ).val( ui.values[ 0 ]);
      $( "#end" ).val( ui.values[ 1 ] );
    },
  });
  
  $( "#start" ).val( $( "#slider-range" ).slider( "values", 0 ) );
  $( "#end" ).val( $( "#slider-range" ).slider( "values", 1 ) );
}));

// Getting chromosome number, start and end for calling JSON
var ajaxStart = parseInt($("#start").val());
var ajaxEnd = parseInt($("#end").val());
var ajaxChrNum = parseInt($('#chrSelector').val());

// Draw circRNAs and genes on the canvas
$('draw').click(function(){
    var ajaxStart = parseInt($("#start").val());
    var ajaxEnd = parseInt($("#end").val());
    var ajaxChrNum = parseInt($('#chrSelector').val());

    drawLine(circCtx,lineY,0.75, "grey")

    $.getJSON('file1_URL',{'caseid': caseid,'chr':ajaxChrNum, 'start':ajaxStart, 'end':ajaxEnd})
    .done(function(circinfo){
        for (var i=0;i<circinfo.length;i++){
            drawRectangle(circCtx,circinfo[i].start,"orange")
            drawRectangle(circCtx,circinfo[i].end,"green")
            drawArc(circCtx,circinfo[i].start,circinfo[i].end,0.75,'red')
        }
    })
    .fail(alert('Fail to load the file, Please Retry.'));

    $.getJSON('file2_URL',{'caseid': caseid,'chr':ajaxChrNum, 'start':ajaxStart, 'end':ajaxEnd})
    .done(function(geneinfo){
        for (var i=0;i<geneinfo.length;i++){
            drawGene(circCtx,geneinfo[i].start,geneinfo[i].end,geneinfo[i].name,'purple')
        }
    });
});

// Draw density distribution
$('submit').click(function(){
    var chrnum
    $.getJSON('file4_URL',{'caseid': caseid})
    .done(function(chrinfo){
        chrnum = chrinfo.length
        for (var i=0;i<chrinfo.length;i++){
            drawDensityBackground(denCtx,(460-15*chrnum)+15*i,chrinfo[i].chrLen,chrinfo[i].chr)
        }
    });

    $.getJSON('file5_URL',{'caseid': caseid,})
    .done(function(densityinfo){
        for (var i=0;i<densityinfo.length;i++){
            var chrindex = densityinfo[i].chr
            var yAxis = (460-15*chrnum)+15*chrindex
            drawDensityBlock(denCtx,yAxis,densityinfo[i].start,densityinfo[i].end,densityinfo[i].density)
        }
    });

    drawDensityLegend(denCtx)
});

// Draw from density table
$('view').click(function(){
    $(this).parent().prevAll('#tableChr').attr('class', 'ajaxtableChr');
    $(this).parent().prevAll('#tableStart').attr('class', 'ajaxtableStart');
    $(this).parent().prevAll('#tableEnd').attr('class', 'ajaxtableEnd');
    thisStart = Number($(this).parent().prevAll('.ajaxtableStart').html());
    thisEnd = Number($(this).parent().prevAll('.ajaxtableEnd').html());
    thisChr = $(this).parent().prevAll('.ajaxtableChr').html();

    $.getJSON('file3_URL',{'caseid': caseid,'chr':thisChr, 'start':thisStart, 'end':thisEnd})
    .done(function(scaleValue){
        realStart = scaleValue.realStart
        realEnd = scaleValue.realEnd});

    $("#start").val(realStart)
    $("#end").val(realEnd)

    circCtx.clear()
    drawLine(circCtx,lineY,0.75, "grey")

    $.getJSON('file1_URL',{'caseid': caseid,'chr':thisChr, 'start':thisStart, 'end':thisEnd})
    .done(function(circinfo){
        for (var i=0;i<circinfo.length;i++){
            drawRectangle(circCtx,circinfo[i].start,"orange")
            drawRectangle(circCtx,circinfo[i].end,"green")
            drawArc(circCtx,circinfo[i].start,circinfo[i].end,0.75,'red')
        }
    })
    .fail(alert('Fail to load the file, Please Retry.'));

    $.getJSON('file2_URL',{'caseid': caseid,'chr':thisChr, 'start':thisStart, 'end':thisEnd})
    .done(function(geneinfo){
        for (var i=0;i<geneinfo.length;i++){
            drawGene(circCtx,geneinfo[i].start,geneinfo[i].end,geneinfo[i].name,'purple')
        }
    });
});

//Download from canvas
document.getElementById("circDownload").onclick = function(){
    circCanvas.toBlob(function(blob){
        document.getElementById('circDownload').setAttribute("href", URL.createObjectURL(blob));});
}

document.getElementById("denDownload").onclick = function(){
    circCanvas.toBlob(function(blob){
        document.getElementById('denDownload').setAttribute("href", URL.createObjectURL(blob));});
}