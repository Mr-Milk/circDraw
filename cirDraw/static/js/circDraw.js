// Functions
// setting up canvas
function initializeCanvas(canvasName){
    canvasName.width = 500
    canvasName.height = 500
    var canvasWidth = canvasName.width
    var canvasHeight = canvasName.height

    // Response to retina screen
    canvasName.width = canvasWidth * ratio;
    canvasName.height = canvasHeight * ratio;
    canvasName.style.width = canvasWidth + 'px';
    canvasName.style.height = canvasHeight + 'px';
    canvasWidth = canvasName.width
    canvasHeight = canvasName.height
}

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

// Single circCirc
function drawCircleCirc(ctx,x,y,r)
{
    ctx.beginPath();
    ctx.arc(x*ratio, y*ratio, r*ratio, 0, 2 * Math.PI, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
}

function drawCircExon(ctx,x,y,r,start,end,color)
{
    ctx.beginPath();
    x_cord = (x*(5*ratio-1)/4) + 50 - ratio
    ctx.arc(x_cord, y*ratio, r*ratio, start*Math.PI+0.5*Math.PI, end*Math.PI+0.5*Math.PI, false);
    ctx.lineWidth = 15;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawCircLine(ctx,x1,x2)
{
    ctx.beginPath()
    ctx.moveTo((x1*(5*ratio-1)/4) + 50 - ratio, lineY-15)
    ctx.lineTo((x2*(5*ratio-1)/4) + 50 - ratio, 270*ratio)
    ctx.closePath()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'grey'
    ctx.stroke()
}

//Download function
function download(canvas_id, document_id)
{
document.getElementById(document_id).onclick = function(){
    canvas_id.toBlob(function(blob){
        document.getElementById(document_id).setAttribute("href", URL.createObjectURL(blob));});
}};

// Executing code
// Getting caseid for following drawing
var thisURL = document.URL;
var caseid = thisURL.split("/").slice(-1)[0];
var ratio = window.devicePixelRatio

// device display ratio message
ratioMessage = "devicePixelRatio: " + ratio
console.log(ratioMessage)

// Canvas for displaying circRNA
var circCanvas = document.getElementById("drawCirc");
var circCtx = circCanvas.getContext("2d");
initializeCanvas(circCanvas);
var circHeight = circCanvas.height;
var circWidth = circCanvas.width;
var lineY = 3*circHeight/5;

// Canvas for displaying density distribution
var denCanvas = document.getElementById("density");
var denCtx = denCanvas.getContext("2d")
initializeCanvas(denCanvas)

var denPalette = {'color':['#E8D2CC', '#E6D0CB', '#E5CECA', '#E4CDC9', '#E2CBC8', '#E1CAC8', '#E0C8C7', '#DEC6C6', '#DDC5C5', '#DCC3C4', '#DBC2C4', '#D9C0C3', '#D8BEC2', '#D7BDC1', '#D5BBC0', '#D4BAC0', '#D3B8BF', '#D1B6BE', '#D0B5BD', '#CFB3BC', '#CEB2BC', '#CCB0BB', '#CBAEBA', '#CAADB9', '#C8ABB8', '#C7AAB8', '#C6A8B7', '#C4A6B6', '#C3A5B5', '#C2A3B4', '#C1A2B4', '#BFA0B3', '#BE9EB2', '#BD9DB1', '#BB9BB0', '#BA9AB0', '#B998AF', '#B796AE', '#B695AD', '#B593AC', '#B492AC', '#B290AB', '#B18EAA', '#B08DA9', '#AE8BA8', '#AD8AA8', '#AC88A7', '#AA86A6', '#A985A5', '#A883A4', '#A782A4', '#A580A3', '#A47EA2', '#A37DA1', '#A17BA0', '#A07AA0', '#9F789F', '#9D769E', '#9C759D', '#9B739C', '#9A729C', '#98709B', '#976E9A', '#966D99', '#946B98', '#936A98', '#926897', '#906696', '#8F6595', '#8E6394', '#8D6294', '#8B6093', '#8A5E92', '#895D91', '#875B90', '#865A90', '#85588F', '#83568E', '#82558D', '#81538C', '#80528C', '#7E508B', '#7D4E8A', '#7C4D89', '#7A4B88', '#794A88', '#784887', '#764686', '#754585', '#744384', '#734284', '#714083', '#703E82', '#6F3D81', '#6D3B80', '#6C3A80', '#6B387F', '#69367E', '#68357D', '#67337C', '#66327C']}

var realStart
var realEnd

$(document).ready(
    function(){
    $.getJSON("/tools/tools_file3/",{case_id: caseid, chr: "chr1", start: 0, end: 400})
    .done(function(scaleValue){
        realStart = scaleValue.realStart
        realEnd = scaleValue.realEnd
    })
    .fail(function() { alert('Fail at line131 getJSON lalala tools_file3, Please Retry.') });

    $("#start").val(realStart)
    $("#end").val(realEnd)

    $("#start,#end").on('change', function () {
        var scaleMin = parseInt($("#start").val());
        var scaleMax = parseInt($("#end").val());
        if (scaleMin > scaleMax) {
          $('#end').val(scaleMin);
        }
        $("#slider-range").slider({
          values: [scaleMin, scaleMax]
        });
        // Getting chromosome number, start and end for calling JSON
        var ajaxStart = parseInt($("#start").val());
        var ajaxEnd = parseInt($("#end").val());
        var ajaxChrNum = parseInt($('#chrSelector').val());

        circCtx.clearReact(0, 0, circWidth, circHeight)
        drawLine(circCtx,lineY,0.75, "grey")

        // file_1
        console.log(ajaxStart);
        console.log(ajaxEnd);
        console.log(ajaxChrNum);
        $.getJSON("/tools/tools_file1/",{case_id: caseid, chr: ajaxChrNum, start: ajaxStart, end: ajaxEnd})
        .done(function(circinfo){
            for (var i=0;i<circinfo.length;i++){
                drawRectangle(circCtx,circinfo[i].start,"orange")
                drawRectangle(circCtx,circinfo[i].end,"green")
                drawArc(circCtx,circinfo[i].start,circinfo[i].end,0.75,'red')
            }
        })

        .fail( function() {alert('Fail to load the file at line171 tools_file1, Please Retry.')});
        
        $.getJSON("/tools/tools_file2/",{case_id: caseid, chr: ajaxChrNum, start: ajaxStart, end: ajaxEnd})
        .done(function(geneinfo){
            for (var i=0;i<geneinfo.length;i++){
                drawGene(circCtx,geneinfo[i].start,geneinfo[i].end,geneinfo[i].name,'purple')
            }
        })

        .fail( function() {alert('Fail to load the file at line189 tools_file2, Please Retry.')});

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

    // Draw density table
    var chrnum
    $.getJSON("/tools/tools_file4/",{case_id: caseid})
    .done(function(chrinfo){
        chrnum = chrinfo.length
        for (var i=0;i<chrinfo.length;i++){
            drawDensityBackground(denCtx,(460-15*chrnum)+15*i,chrinfo[i].chrLen,chrinfo[i].chr)
        }
    });

    $.getJSON("/tools/tools_file5/",{case_id: caseid})
    .done(function(densityinfo){
        for (var i=0;i<densityinfo.length;i++){
            var chrindex = densityinfo[i].chr
            var yAxis = (460-15*chrnum)+15*chrindex
            drawDensityBlock(denCtx,yAxis,densityinfo[i].start,densityinfo[i].end,densityinfo[i].density)
        }});

    drawDensityLegend(denCtx);
    });


$(document).ready((function(){
    download(circCanvas, circDownload);
    download(denCanvas, denDownload);
}));

$(document).ready(function(){
    $('.View').click(function(){
        $(this).parent().prevAll('#tableChr').attr('class', 'ajaxtableChr');
        $(this).parent().prevAll('#tableStart').attr('class', 'ajaxtableStart');
        $(this).parent().prevAll('#tableEnd').attr('class', 'ajaxtableEnd');
        thisStart = Number($(this).parent().prevAll('.ajaxtableStart').html());
        thisEnd = Number($(this).parent().prevAll('.ajaxtableEnd').html());
        thisChr = $(this).parent().prevAll('.ajaxtableChr').html();

        $('.circwindow').slideDown()
        $('.shedlayer').show()

        var ccCanvas = $(this).siblings(".circCirc");
        var ccCtx = ccCanvas.getContext("2d")
        initializeCanvas(ccCanvas)

        download(ccCanvas, ccDownload)

        /* File 6 format
        var exonList = [{"name": "GNS2", "start":220, "end":230},
            {"name": "CDN1", "start":250, "end":260},
            {"name": "MILK", "start":290, "end":295}]
        */
        
        $.getJSON('file6', {case_id: caseid, chr: thisChr, start: thisStart, end: thisEnd})
        .done(function(exonList){

        drawLine(ccCtx,lineY,0.75, "grey")

        var exonlen = 0
        for (var i=0;i<exonList.length;i++){
            exonlen = exonlen + (exonList[i].end-exonList[i].start)
        };

        var mlist = []
        for (var i=0;i<exonList.length;i++){
            mlist.push(exonList[i].start)
            mlist.push(exonList[i].end)
        };

        x_RLine = Math.max.apply(null,mlist)
        x_LLine = Math.min.apply(null,mlist)
        x_circ = x_LLine+((x_RLine-x_LLine)/2)
        console.log(x_circ)

        palette = ['red','green','blue','purple']

        var initLen = 0
        for (var i=0;i<exonList.length;i++){
            name = exonList[i].name
            start = initLen
            end = initLen+(exonList[i].end - exonList[i].start)*2/exonlen
            initLen = end
            console.log(name, start, end)
            drawGene(ccCtx, exonList[i].start, exonList[i].end, exonList[i].name, palette[i])
            drawCircExon(ccCtx,x_circ,230,40,start,end,palette[i])
        };

        drawCircLine(ccCtx,x_RLine,x_circ)
        drawCircLine(ccCtx,x_LLine,x_circ)
            });
});
    $(".x").click(function(){
        $(".circwindow").slideUp()
        $(".shedlayer").hide()
    });
})
