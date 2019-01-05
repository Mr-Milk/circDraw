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

    // Call Ajax
    var chr = parseInt($('#chrSelector').val())

    $.getJSON("tools_file2/", {"caseid": case_id, "start": start, "end": end, "chr": chr}).done(function(exon){
        exonList = exon;
        console.log("exon number: ", exon.length)
        $.getJSON("tools_file1/", {"caseid": case_id, "start": start, "end": end, "chr": chr}).done(function(arc){
            arcList = arc;
            console.log("circ number: ", arc.length)
            backSplicing(exonList, arcList)
        });
    });
}

// Initiate snap.SVG instance
var svg = Snap("#svg");

// draw an exon block
function junction_block(x, color){
    var junction_block = svg.paper.rect(x, 445, 2, 10).attr({
        fill: color,
        stroke: 'none',
    });

    return junction_block
}

// draw a exon
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
                'font-size': 10}); 
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
                'font-size': 10}); 
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

function getRange(arr) {
    var range = 0
    for (var i=0 ; i<arr.length ; i++) {
        range += parseInt(arr[i].end) - parseInt(arr[i].start) 
    }
    return range;
}

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

function drawLegend(){
    var legendY = 20, legend = [], legendText = []
    var modlist = {'mod':['m6A', 'm1C', 'm1A', 'MRE', 'ORF'], 'color':['#E98B2A', '#E16B8C', '#64363C', '#6D2E5B', '#516E41']}
    for (i=0; i<modlist.mod.length; i++) {
        legend[i] = 'legend_' + modlist[i]
        legendText[i] = 'legendText_' + modlist[i]
        legend[i] = svg.paper.rect(20, legendY, 10, 10).attr({
            fill: modlist.color[i],
            stroke: '#000',
            strokeWidth: 0.5
        })
        legendText[i] = svg.paper.text(35, legendY+8, modlist.mod[i]).attr({
            fill: modlist.color[i],
            'font-size': 13,
            'font-family': 'arial'
        })
        legendY += 15
    }
    legendGroup = svg.group(legend[0], legend[1], legend[2], legend[3], legend[4],
                            legendText[0], legendText[1], legendText[2], legendText[3], legendText[4])

    return legendGroup
    }


function arc(start, end, exonJSON){
    var rx = (end-start)/2
    var ry = rx/2
    var path = "M" + (start+1) + " 443A" +  rx + " " + ry + " 0 0 1 " + (end+1) + " 443"
    var c = svg.paper.path(path).attr({
        stroke: "#000",
        strokeWidth: 1,
        fill:'none',
        cursor: 'pointer'
    });

    var startBlock = junction_block(start, "#00AA90")
    var endBLock = junction_block(end, "#D0104C")
    var circle = [], modCirc = []
    var display = false, legend
    var junction_point1, junction_point2
    var range = getRange(exonJSON)
    var realStart = getMinMax(exonJSON)[0]
    var realEnd = getMinMax(exonJSON)[1]
    var startAngle = 180, endAngle = 180, centerX = start+rx+1, centerY = 283-ry

    c.click(function(){
        c.attr({
            stroke: "#33A6B8",
            strokeWidth: 3,
            fill:'none'
        });
        
        if (display == false) {
            for (i=0;i<exonJSON.length;i++) {
                circle[i] = 'circExon' + i;
                modCirc[i] = 'modCirc' + i;
                modCirc[i] = []
                endAngle += 360*(exonJSON[i].end - exonJSON[i].start)/range
                for (t=0;t<exonJSON[i]['mod'].length;t++) {
                    modCirc[i][t] += "mod" + t;
                    modStartAngle = startAngle + 360*(exonJSON[i]['mod'][t].start - exonJSON[i].start)/range
                    modEndAngle = startAngle + 360*(exonJSON[i]['mod'][t].end - exonJSON[i].start)/range
                    if (exonJSON[i]['mod'][t].type == 'm6A') {
                        modPath = describeArc(centerX, centerY, 87, modStartAngle-1, modEndAngle+1)
                        modCirc[i][t] = svg.paper.path(modPath).attr({
                            stroke: '#E98B2A',
                            strokeWidth: 3,
                            fill: 'none'
                        }).mouseover(function(){
                            text = svg.paper.text(centerX-20, centerY+10, 'm6A').attr({
                                fill: '#E98B2A',
                                'font-size': 15,
                                'font-family': 'arial',
                            })
                        }).mouseout(function(){
                            text.remove()
                        })
                    }
                    if (exonJSON[i]['mod'][t].type == 'm1C') {
                        modPath = describeArc(centerX, centerY, 87, modStartAngle-1, modEndAngle+1)
                        modCirc[i][t] = svg.paper.path(modPath).attr({
                            stroke: '#E16B8C',
                            strokeWidth: 3,
                            fill: 'none'
                        }).mouseover(function(){
                            text = svg.paper.text(centerX-20, centerY+10, 'm1C').attr({
                                fill: '#E16B8C',
                                'font-size': 15,
                                'font-family': 'arial',
                            })
                        }).mouseout(function(){
                            text.remove()
                        })
                    }
                    if (exonJSON[i]['mod'][t].type == 'm1A') {
                        modPath = describeArc(centerX, centerY, 87, modStartAngle-1, modEndAngle+1)
                        modCirc[i][t] = svg.paper.path(modPath).attr({
                            stroke: '#64363C',
                            strokeWidth: 3,
                            fill: 'none'
                        }).mouseover(function(){
                            text = svg.paper.text(centerX-20, centerY+10, 'm1A').attr({
                                fill: '#64363C',
                                'font-size': 15,
                                'font-family': 'arial',
                            })
                        }).mouseout(function(){
                            text.remove()
                        })
                    }
                    if (exonJSON[i]['mod'][t].type == 'MRE') {
                        modPath = describeArc(centerX, centerY, 70, modStartAngle, modEndAngle)
                        modCirc[i][t] = svg.paper.path(modPath).attr({
                            stroke: '#6D2E5B',
                            strokeWidth: 5,
                            fill: 'none'
                        }).mouseover(function(){
                            text = svg.paper.text(centerX-20, centerY+10, 'MRE').attr({
                                fill: '#6D2E5B',
                                'font-size': 15,
                                'font-family': 'arial',
                            })
                        }).mouseout(function(){
                            text.remove()
                        })
                    }
                    if (exonJSON[i]['mod'][t].type == 'ORF') {
                        modPath = describeArc(centerX, centerY, 63, modStartAngle, modEndAngle)
                        modCirc[i][t] = svg.paper.path(modPath).attr({
                            stroke: '#516E41',
                            strokeWidth: 5,
                            fill: 'none'
                        }).mouseover(function(){
                            text = svg.paper.text(centerX-20, centerY+10, 'ORF').attr({
                                fill: '#516E41',
                                'font-size': 15,
                                'font-family': 'arial',
                            })
                        }).mouseout(function(){
                            text.remove()
                        })
                    }
                }
                p = describeArc(centerX, centerY, 80, startAngle, endAngle)
                console.log(p)
                startAngle = endAngle
                circle[i] = svg.paper.path(p).attr({
                    stroke: exonJSON[i].color,
                    strokeWidth: 10,
                    fill: 'none'
                })
            }

            legend = drawLegend()

            var juncX = start + rx, juncY = 358-ry
            junction_point1 = svg.paper.rect(juncX-2, juncY, 4, 10).attr({
                fill: "#00AA90",
                stroke: "#000",
                strokeWidth: 0.2,
            })
            junction_point2 = svg.paper.rect(juncX+2, juncY, 4, 10).attr({
                fill: "#D0104C",
                stroke: "#000",
                strokeWidth: 0.2
            })

            display = true
        }

        else if (display == true) {
            for (i=0; i<circle.length; i++) {
                circle[i].remove()
            };
        
            junction_point1.remove()
            junction_point2.remove()
            
            for (i=0; i<modCirc.length ; i++) {
                for (t=0; t<modCirc[i].length; t++){
                    modCirc[i][t].remove()
                }
            }

            legend.remove()

            display = false
        }
    }).mouseover(function(){
        c.attr({
            stroke: "#33A6B8",
            strokeWidth: 3,
            fill:'none'
        });
        startText = svg.paper.text(start-10, 475, realStart).attr({
            fill: '#000',
            'font-size': 10
        })
        endText = svg.paper.text(end-10, 475, realEnd).attr({
            fill: '#000',
            'font-size': 10
        })
    }).mouseout(function(){
        c.attr({
            stroke: "#000",
            strokeWidth: 1,
            fill:'none',
            cursor: 'pointer'
        });
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

// draw a group of back-splicing

function backSplicing(exonJSON, arcJSON){
    var exonList = [], drawArc = []
    var mm = getMinMax(exonJSON)
    var range = mm[1] - mm[0]
    var colorIndex = 0
    for (i=0;i<exonJSON.length;i++){
        scaleStart = 50+700*(exonJSON[i].start-mm[0])/range
        scaleEnd = 50+700*(exonJSON[i].end-mm[0])/range
        scaleLen = scaleEnd - scaleStart
        if (colorIndex<7) {
            exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
            exonList[i] = {"start": exonJSON[i].start, "end": exonJSON[i].end, "color": colorList[colorIndex], "mod": exonJSON[i].mod}
            colorIndex += 1    
        }
        else {
            colorIndex = 0
            exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
            exonList[i] = {"start": exonJSON[i].start, "end": exonJSON[i].end, "color": colorList[colorIndex], "mod": exonJSON[i].mod}
            colorIndex += 1
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
        }
    }

    console.log(drawArc)

    for (i=0;i<arcJSON.length;i++) {
        scaleArcStart = 50+700*(arcStart-mm[0])/range
        scaleArcEnd = 50+700*(arcEnd-mm[0])/range
        console.log(1)
        arc(scaleArcStart, scaleArcEnd, drawArc)
    }
}; 