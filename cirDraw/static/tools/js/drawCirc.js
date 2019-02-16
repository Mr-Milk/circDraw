// Initiate snap.SVG instance
var svg = Snap("#svg");

// Define a color palette for the exon blocks
var colorList = ["#92C9FF", "#8FD16F", "#108757", "#0B3A42", "#FF404A", "#5CA0F2", "#FF881D"]

// Get URL and split to caseid
var url = $(location).attr('href').split("/")
var case_id = url[url.length -1]

// Get which region the user want to draw
var start, end
var exonList, arcList
var $gene = $("#gene-selector"),
    $inputFrom = $("#js-input-from"),
    $inputTo = $("#js-input-to"),
    geneList = [],
    gene_selector = $gene.data("ionRangeSlider");

$gene.ionRangeSlider({
    type: "double",
    grid: true,
    from: geneList[0],
    to: geneList[0],
    values: geneList,
    drag_interval: true,
    min_interval: null,
    max_interval: null,
    onFinish: updataCirc,
    onUpdata: getGeneList
}).hide();

function getGeneList(){
    var val1 = parseInt($inputFrom.text()),
        val2 = parseInt($inputTo.text()),
        chr = parseInt($('#chrSelector').val())
    $.getJSON("genelist for gene_selector", {"caseid": case_id, "start": val1, "end": val2, "chr": chr})
        .done(function(genes){
            geneList = genes
        })
}

function updataCirc(data){
    svg.clear()
    // draw a straight line
    var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({
        stroke: "#000",
        strokeWidth: 1
    });

    start_gene = data.from;
    end_gene = data.to;

    for (i in geneList) {
        if (i.name == start_gene) {
            start = i.start
        };
        if (i.name == end_gene) {
            end = i.end
        };
    };

    $inputFrom.text(start);
    $inputTo.text(end);

    // draw a straight line
    var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({
        stroke: "#000",
        strokeWidth: 1
    });

    // Call Ajax
    var chr = parseInt($('#chrSelector').val())

    $.getJSON("tools_file2/", {"caseid": case_id, "start": start, "end": end, "chr": chr}).done(function(exon){
        exonList = exon;
        console.log("exon number: ", exon.length)
        $.getJSON("tools_file1/", {"caseid": case_id, "start": start, "end": end, "chr": chr}).done(function(arc){
            arcList = arc;
            console.log("circ number: ", arc.length)
            var tableContent = backSplicing(exonList, arcList)

            $('#circTable').DataTable( {
                "data": tableContent,
                "columns": [
                    {
                        "className":      'details-control',
                        "orderable":      false,
                        "data":           null,
                        "defaultContent": ''
                    },
                    { "data": "circid" },
                    { "data": "chr" },
                    { "data": "start" },
                    { "data": "end" },
                    { "data": "source" },
                    { "data": "detail" }
                ],
                "order": [[1, 'asc']]
            } )

            $('#circTable tbody').on('click', 'td.details-control', function () {
                var tr = $(this).closest('tr');
                var row = table.row( tr );
         
                if ( row.child.isShown() ) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    row.child( subTable(row.data()) ).show();
                    tr.addClass('shown');
                }
            } );

        });
    });
}
// for table
function subTable ( modJSON ) {
    var startTable = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;"><tr>'
    var endTable = '</tr></table>'

    for (i=0;i<modJSON.mod.length;i++){
        startTable += '<td>' + modJSON.mod.type + ' | ' + modJSON.mod.start + ' - ' + modJSON.mod.end + ' | ' + '<button class="btn btn-sm btn-primary' + 'href="' + modJSON.mod.link + '"></button>' + '</td>'
    }

    var subTable = startTable + endTable

    return subTable
}

//----------------------------------------- Functions For Drawing --------------------------------------

// draw an junction block
function junction_block(x, color){
    var junction_block = svg.paper.rect(x, 445, 2, 10).attr({
        fill: color,
        stroke: 'none',
    });

    return junction_block
}

// draw an exon
function exon_block(x, len, color, name){

    var exon_name
    var display = false

    var exon_block = svg.paper.rect(x, 447, len, 6).attr({
        fill: color,
        stroke: 'none',
        cursor: 'pointer'
    }).click(function(){
        if (display == true) {
            exon_name.remove();
            display = false ;}
        else if (display == false) {
            exon_name = svg.paper.text(x, 465, name).attr({
                'font-family': 'arial',
                'font-size': 10,
                'cursor': 'pointer'})
                .drag(); 
            display = true;}
        }).mouseover(function(){
            exon_block.attr({
                fill: color,
                stroke: '#33A6B8',
                strokeWidth: 1,
                cursor: 'pointer'
            });
            exon_name = svg.paper.text(x, 465, name).attr({
                'font-family': 'arial',
                'font-size': 10});
        }).mouseout(function(){
            exon_block.attr({
                fill: color,
                stroke: 'none',
                cursor: 'pointer'
            });
            exon_name.remove();
        })
    
    return exon_block
}

// draw a gene
function gene_block(x, len, color, name){

    var gene_name
    var display = false

    var exon_block = svg.paper.rect(x, 449, len, 2).attr({
        fill: color,
        stroke: 'none',
        cursor: 'pointer'
    }).click(function(){
        if (display == true) {
            gene_name.remove();
            display = false ;}
        else if (display == false) {
            gene_name = svg.paper.text(x, 465, name).attr({
                'font-family': 'arial',
                'font-size': 10,
                'cursor': 'pointer'})
                .drag();
            display = true;}
        }).mouseover(function(){
            exon_block.attr({
                fill: color,
                stroke: '#33A6B8',
                strokeWidth: 1,
                cursor: 'pointer'
            });
            gene_name = svg.paper.text(x, 465, name).attr({
                'font-family': 'arial',
                'font-size': 10}); 
        }).mouseout(function(){
            exon_block.attr({
                fill: color,
                stroke: 'none',
                cursor: 'pointer'
            });
            gene_name.remove();
        })
    
    return exon_block
}

// calculate the range of an array
function getRange(arr) {
    var range = 0
    for (var i=0 ; i<arr.length ; i++) {
        range += parseInt(arr[i].end) - parseInt(arr[i].start) 
    }
    return range;
}

// calculate the min and max value of an array
function getMinMax(exonJSON){
    var arr = []
    for (i=0 ; i<exonJSON.length ; i++) {
        arr.push(exonJSON[i].start)
        arr.push(exonJSON[i].end)
    }

    max = Math.max.apply(null, arr)
    min = Math.min.apply(null, arr)

    mm = [min, max]

    return mm
}

// draw the epigenetic legned
function drawLegend(){
    trig = triangelOnCircle(20, 20, 0, 0, 5, '#E98B2A')
    square = rectOnCircle(20, 35, 0, 5, 0, '#E16B8C')
    arrow = arrowOnCircle(20, 66, 0, 0)
    circle = svg.paper.circle(20, 56, 3).attr({
        fill: '#64363C',
        stroke: '#64363C',
        "cursor": "pointer"
    })
    MRE = svg.paper.rect(18, 91, 7, 7).attr({
        fill: '#6D2E5B',
        stroke: '#000',
        strokeWidth: 0.5
    })
    ORF = svg.paper.rect(18, 106, 7, 7).attr({
        fill: '#516E41',
        stroke: '#000',
        strokeWidth: 0.5
    })

    triText = legendText(30, 28, "m6A", '#E98B2A')
    squareText = legendText(30, 43, "m1C", '#E16B8C')
    circleText = legendText(30, 58, "m6A", '#64363C')
    arrowText = legendText(30, 75, "SNP", '#000')
    MREText = legendText(30, 99, "MRE", '#6D2E5B')
    ORFText = legendText(30, 114, "ORF")

    legend = svg.group(trig, square, circle, arrow, MRE, ORF, triText, squareText, circleText, arrowText, MREText, ORFText)

    return legend
}

// text at its center cordinate (x,y)
function textCenter(centerX, centerY, text, fontSize, color) {
    cText = svg.paper.text(centerX, centerY, text).attr({
        "font-family": "arial",
        "font-size": fontSize,
    })
    textW = cText.getBBox().w
    textH = cText.getBBox().h
    cText.remove()
    cText = svg.paper.text(centerX-textW/2, centerY+textH/2, text).attr({
        "font-family": "arial",
        "font-size": fontSize,
        fill: color
    })

    return cText
}
// Draw circRNA when clicking the arc
function drawCircRNA(exonJSON){
    var modCirc = [], circle = [], realStart = getMinMax(exonJSON)[0], realEnd = getMinMax(exonJSON)[1]
    var startAngle = 180, endAngle = 180, centerX = 400, centerY = 140
    var range = getRange(exonJSON)

    // circRNA background
    arcBackGround = svg.paper.rect(0,0,800,250).attr({
        stroke: "none",
        fill: "#fff"
    });

    // circRNA ID
    circText = "chr" + chr + ": " + realStart + " - " + realEnd
    circName = textCenter(centerX, centerY-110, circText, 15, "#000")

    // draw epi mod of circRNA
    for (i=0;i<exonJSON.length;i++) {
        circle[i] = 'circExon' + i;
        modCirc[i] = 'modCirc' + i;
        modCirc[i] = []
        endAngle += 360*(exonJSON[i].end - exonJSON[i].start)/range
        console.log(centerX, centerY, startAngle, endAngle)
        for (t=0;t<exonJSON[i]['mod'].length;t++) {
            modCirc[i][t] += "mod" + t;
            modStartAngle = startAngle + 360*(exonJSON[i]['mod'][t].start - exonJSON[i].start)/range
            modEndAngle = startAngle + 360*(exonJSON[i]['mod'][t].end - exonJSON[i].start)/range
            if (exonJSON[i]['mod'][t].type == 'm6A') {
                modCirc[i][t] = triTagOnCircle(centerX, centerY, 85, 180+modStartAngle)
                .mouseover(function(){text = textCenter(centerX, centerY, "m6A", 15, '#E98B2A')})
                .mouseout(function(){text.remove()})
                .click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
                }
            if (exonJSON[i]['mod'][t].type == 'm1C') {
                modCirc[i][t] = squareTagOnCircle(centerX, centerY, 85, 180+modStartAngle)
                .mouseover(function(){text = textCenter(centerX, centerY, "m1C", 15, '#E16B8C')})
                .mouseout(function(){text.remove()})
                .click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
            }
            if (exonJSON[i]['mod'][t].type == 'm1A') {
                modCirc[i][t] = circleTagOnCircle(centerX, centerY, 85, 180+modStartAngle, '#64363C')
                .mouseover(function(){text = textCenter(centerX, centerY, "m1A", 15, '#64363C')})
                .mouseout(function(){text.remove()})
                .click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
                }
            if (exonJSON[i]['mod'][t].type == 'SNP') {
                modCirc[i][t] = arrowOnCircle(centerX, centerY, 85, 180+modStartAngle)
                .mouseover(function(){text = textCenter(centerX, centerY, "SNP", 15, '#000')})
                .mouseout(function(){text.remove()})
                .click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
                }
            if (exonJSON[i]['mod'][t].type == 'MRE') {
                modPath = describeArc(centerX, centerY, 70, modStartAngle, modEndAngle)
                modCirc[i][t] = svg.paper.path(modPath).attr({
                    stroke: '#6D2E5B',
                    strokeWidth: 5,
                    fill: 'none',
                    "cursor": "pointer"
                }).mouseover(function(){
                    text = textCenter(centerX, centerY, "MRE", 15, '#6D2E5B')
                }).mouseout(function(){
                    text.remove()
                }).click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
            }
            if (exonJSON[i]['mod'][t].type == 'ORF') {
                modPath = describeArc(centerX, centerY, 63, modStartAngle, modEndAngle)
                modCirc[i][t] = svg.paper.path(modPath).attr({
                    stroke: '#516E41',
                    strokeWidth: 5,
                    fill: 'none',
                    "cursor": "pointer"
                }).mouseover(function(){
                    text = text = textCenter(centerX, centerY, "ORF", 15, '#516E41')
                }).mouseout(function(){
                    text.remove()
                }).click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
            }
        //console.log(i, t, modCirc[i][t])
        }
        p = describeArc(centerX, centerY, 80, startAngle, endAngle)
        startAngle = endAngle
        circle[i] = svg.paper.path(p).attr({
            stroke: exonJSON[i].color,
            strokeWidth: 10,
            fill: 'none'
        })
    }

    var juncX = centerX-2, juncY = centerY+75
    junction_point1 = svg.paper.rect(juncX-2.3, juncY, 4, 10).attr({
        fill: "#00AA90",
        stroke: "#000",
        strokeWidth: 0.2,
    })
    junction_point2 = svg.paper.rect(juncX+2.3, juncY, 4, 10).attr({
        fill: "#D0104C",
        stroke: "#000",
        strokeWidth: 0.2
    })

    // draw legend
    legend = drawLegend()

    // group everything together
    var group = svg.group(arcBackGround, junction_point1, junction_point2,  circName, legend)

    for (i=0;i<modCirc.length;i++) {
        for (t=0;t<modCirc[i].length;t++){
        var cx = group
        group = svg.group(cx, modCirc[i][t])
    }}

    for (i=0;i<circle.length;i++) {
        var cc = group
        group = svg.group(cc, circle[i])
    }

    return group
}

// CORE FUNCTION! draw the arc and its circRNA
function arc(start, end, exonJSON){
    var rx = (end-start)/2,
        ry = rx/2,
        startBlock = junction_block(start, "#00AA90"),
        endBlock = junction_block(end, "#D0104C"),
        realStart = getMinMax(exonJSON)[0],
        realEnd = getMinMax(exonJSON)[1],
        display = false,
        circ

    var path = "M" + (start+1) + " 443A" +  rx + " " + ry + " 0 0 1 " + (end+1) + " 443"
    var c = svg.paper.path(path).attr({
        stroke: "#000",
        strokeWidth: 1,
        fill:'none',
        cursor: 'pointer'
    });

    c.click(function(){
        c.attr({
            stroke: "#33A6B8",
            strokeWidth: 6,
            fill:'none'
        });

        if (display == false) {
            var x = svg.select("g")
            if (x != null) {
                x.remove()
            }
            circ = drawCircRNA(exonJSON)
            display = true
        }

        else if (display == true) {
            circ.remove()
            display = false
        }
    }).mouseover(function(){
        c.attr({
            stroke: "#33A6B8",
            strokeWidth: 6,
            fill:'none'
        });
        startBlock.attr({
            stroke: "#33A6B8",
            strokeWidth: 1
        });
        endBlock.attr({
            stroke: "#33A6B8",
            strokeWidth: 1
        });
        startText = textCenter(start, 470, realStart, 10, '#000')

        endText = textCenter(end, 470, realEnd, 10, '#000')
    }).mouseout(function(){
        c.attr({
            stroke: "#000",
            strokeWidth: 1,
            fill:'none',
            cursor: 'pointer'
        });
        startBlock.attr({
            fill: "#00AA90",
            stroke: "none"
        });
        endBlock.attr({
            fill: "#D0104C",
            stroke: "none"
        })
        startText.remove();
        endText.remove()
    })
    return c
}

// draw an sector
// from an answer in stackflow
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}

function backSplicing(exonJSON, arcJSON){
    var exonList = []
    var mm = getMinMax(exonJSON)
    var range = mm[1] - mm[0]
    var colorIndex = 0
    for (i=0;i<exonJSON.length;i++){
        scaleStart = 50+700*(exonJSON[i].start-mm[0])/range
        scaleEnd = 50+700*(exonJSON[i].end-mm[0])/range
        scaleLen = scaleEnd - scaleStart
        if (exonJSON[i].type == "exon") {
            if (colorIndex<7) {
                exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
                exonList[i] = {"chr": parseInt($('#chrSelector').val()),
                                "start": exonJSON[i].start,
                                "end": exonJSON[i].end,
                                "circid": "chr" + parseInt($('#chrSelector').val()) + ": " + exonJSON[i].start + "-" + exonJSON[i].end,
                                "color": colorList[colorIndex],
                                "mod": exonJSON[i].mod,
                                "source": exonJSON[i].source,
                                "detail": exonJSON[i].detail}
                colorIndex += 1
            }
            else {
                colorIndex = 0
                exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
                exonList[i] = {"chr": parseInt($('#chrSelector').val()),
                                "start": exonJSON[i].start,
                                "end": exonJSON[i].end,
                                "circid": "chr" + parseInt($('#chrSelector').val()) + ": " + exonJSON[i].start + "-" + exonJSON[i].end,
                                "color": colorList[colorIndex],
                                "mod": exonJSON[i].mod,
                                "source": exonJSON[i].source,
                                "detail": exonJSON[i].detail}
                colorIndex += 1
            }
        }
        else if (exonJSON[i].type == "gene") {
            gene_block(scaleStart, scaleLen, geneColor[geneColorIndex], exonJSON[i].name)
        }

    }

    console.log("arc num: ", arcJSON.length)

    for (i=0;i<arcJSON.length;i++) {
        arcStart = arcJSON[i].start
        arcEnd = arcJSON[i].end
        console.log("exonlist len: ", exonList.length)
        for (t=0;t<exonList.length;t++) {
            if (exonList[t].start >= arcStart && exonList[t].end <= arcEnd) {
                drawArc.push(exonList[t])
            }
            else {
                x = 1
            }
        }
    }

    console.log(drawArc)

    for (i=0;i<arcJSON.length;i++) {
        scaleArcStart = 50+700*(arcStart-mm[0])/range
        scaleArcEnd = 50+700*(arcEnd-mm[0])/range
        console.log(1)
        arc(scaleArcStart, scaleArcEnd, drawArc)
    }

    return drawArc
}; 

// get the cordinate triangle around circle
function triCord(centerX, centerY, r, triDegree, triHeight, triType) {
    rad_triDegree = (triDegree-270)*Math.PI/180
    side = Math.sqrt((r + triHeight)**2 + triHeight**2)
    rad_deviateDegree = Math.atan(Math.sqrt(triType)*triHeight/side)

    x1 = centerX + (r)*Math.cos(rad_triDegree)
    y1 = centerY + (r)*Math.sin(rad_triDegree)
    x2 = centerX + (side)*Math.cos(rad_triDegree+rad_deviateDegree)
    y2 = centerY + (side)*Math.sin(rad_triDegree+rad_deviateDegree)
    x3 = centerX + (side)*Math.cos(rad_triDegree-rad_deviateDegree)
    y3 = centerY + (side)*Math.sin(rad_triDegree-rad_deviateDegree)
    x4 = centerX + (r + 2*triHeight)*Math.cos(rad_triDegree)
    y4 = centerY + (r + 2*triHeight)*Math.sin(rad_triDegree)

    return [x1, y1, x2, y2, x3, y3, x4, y4]
}
 
// get the cordinate of a stick
function stickCord(centerX, centerY, r, Degree, Height) {
    rad_Degree = (Degree-270)*Math.PI/180
    x1 = centerX + (r)*Math.cos(rad_Degree)
    y1 = centerY + (r)*Math.sin(rad_Degree)
    x2 = centerX + (r+Height)*Math.cos(rad_Degree)
    y2 = centerY + (r+Height)*Math.sin(rad_Degree)

    return [x1, y1, x2, y2]
}

function triangelOnCircle(centerX, centerY, r, triDegree, triHeight, color){
    cords = triCord(centerX, centerY, r, triDegree, triHeight, 1/3)
    triangele = svg.paper.polygon(cords[0], cords[1], cords[2], cords[3], cords[4], cords[5]).attr({
        stroke: color,
        fill: color,
        "cursor": "pointer",
    })

    return triangele
}

function rhoOnCircle(centerX, centerY, r, rhoDegree, rhoHalfHeight, color){
    cords = triCord(centerX, centerY, r, rhoDegree, rhoHalfHeight, 1)
    rho = svg.paper.polygon(cords[0], cords[1], cords[2], cords[3], cords[6], cords[7], cords[4], cords[5]).attr({
        stroke: color,
        fill: color,
        "cursor": "pointer",
    })

    return rho
}

function arrowOnCircle(centerX, centerY, r, Degree){
    tri = triangelOnCircle(centerX, centerY, r, Degree, 1, "#000")
    cords = stickCord(centerX, centerY, r, Degree, 10)
    arrowLine = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#000",
        strokeWidth: 0.5
    })
    arrow = svg.group(arrowLine, tri)

    return arrow
}

function circleTagOnCircle(centerX, centerY, r, Degree, color) {
    cords = stickCord(centerX, centerY, r, Degree, 5)
    line = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: color,
        strokeWidth: 1
    })
    circle = svg.paper.circle(cords[2], cords[3], 2).attr({
        fill: color,
        stroke: color,
        "cursor": "pointer"
    })
    circTag = svg.group(circle, line)

    return circTag

}

function triTagOnCircle(centerX, centerY, r, Degree) {
    cords = stickCord(centerX, centerY, r, Degree, 10)
    line = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#E98B2A",
        strokeWidth: 1
    })
    tri = triangelOnCircle(centerX, centerY, r+10, Degree, 4.5, "#E98B2A")
    triTag = svg.group(tri, line)

    return triTag

}

function squareTagOnCircle(centerX, centerY, r, Degree) {
    cords = stickCord(centerX, centerY, r, Degree, 5)
    line = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#E16B8C",
        strokeWidth: 1
    })
    square = rhoOnCircle(centerX, centerY, r+5, Degree, 2.5, "#E16B8C")
    squareTag = svg.group(square, line)

    return squareTag
}

function openNewTab(link) {
    window.open(link, "_blank")
}