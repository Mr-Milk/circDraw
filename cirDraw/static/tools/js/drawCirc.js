/*jshint esversion: 5 */
// Initiate snap.SVG instance
var svg = Snap("#svg");

// Define a color palette for the exon blocks
var colorList = ["#92C9FF", "#8FD16F", "#108757", "#0B3A42", "#FF404A", "#5CA0F2", "#FF881D", '#e30067', '#924900', '#ab9c00',
    '#ccd0d2', '#075800', '#5e0094', '#f28600', '#a327ea', '#ff8cc6', '#d60000', '#fff97a', '#ff0081', '#8aa0ae',
    '#87d1ff', '#7f00b8', '#2ab3e7', '#bd0056', '#0c9200', '#ffe85b', '#d27400', '#3f2e27', '#846a5b', '#004ac7',
    '#490063', '#ff5757', '#007aea', '#88cc66', '#ff4848', '#73aeff', '#ae5800', '#c1b900', '#c36cff', '#39b03b',
    '#244c66', '#9c0000', '#6d0000', '#877400', '#002065', '#000cae', '#ecd600', '#ff44a2', '#ffa254', '#ff0000',
    '#1a6f00', '#ffa12c'
];

// Get URL and split to caseid
var url = $(location).attr('href').split("/"),
    caseID = url[url.length - 1].split("#")[0];

// Get which region the user want to draw
var start, end, exonList, arcList;
var $name = $('#geneNameSelect'),
    $chr = $('#chrSelector'),
    $start = $("#js-input-from"),
    $end = $("#js-input-to"),
    $scale = $("#scale-selector");

$name.on('DOMSubtreeModified', function(){
    name = $name.text();
    if(name !== ""){
    chr = $chr.text();
    start = $start.text();
    end = $end.text();
    console.log('Refreshing circRNA canvas: ', name, chr, start, end)
    $('.den-select-info').show();
    $scale.show();
    redraw(caseID, start, end, chr);
    }
});

$scale.ionRangeSlider({
    type: "double",
    min: 1,
    max: 5000,
    from: 2000,
    to: 3000,
    drag_interval: true,
    min_interval: 500, // the min length of all circRNA in arcJSON
    onFinish: function(data){
        scaleCirc = arcList.filter(function(v){if(v.start >= data.from && v.end <= data.to){return v}})// get the circ list after selection
        svg.clear();
        // draw a straight line
        var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({
            stroke: "#000",
            strokeWidth: 1
        });
        backSplicing(exonList, scaleCirc)
    }
})

var scaleSelect = $scale.data('ionRangeSlider');

/*
function getGeneList() {
    var val1 = parseInt($inputFrom.text()),
        val2 = parseInt($inputTo.text()),
        chr = parseInt($('#chrSelector').text())
    $.getJSON("genList/", {
            "caseid": caseID,
            "start": val1,
            "end": val2,
            "chr": chr
        })
        .done(function (genes) {
            geneList = genes
        })
}*/

function redraw(caseID, start, end, chr) {
    svg.clear();
    // draw a straight line
    var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({
        stroke: "#000",
        strokeWidth: 1
    });

    // Call Ajax
    $.getJSON("tools_file2/", {
        "caseid": caseID,
        "start": start,
        "end": end,
        "chr": chr
    }).done(function (exon) {
        exonList = exon;
        console.log("ajax exon: ", exonList);
        $.getJSON("tools_file1/", {
            "caseid": caseID,
            "start": start,
            "end": end,
            "chr": chr
        }).done(function (arc) {
            arcList = arc;
            console.log("ajax circ: ", arcList);
            var tableContent = backSplicing(exonList, arcList);
            console.log('Things in Table: ', tableContent);
            console.log('Excu line After ajax call:', arcList);
            intervalList = arcList.filter(function(v){return v.end - v.start})
            s_mm = getMinMax(arcList)
            scaleSelect.update({
                min: s_mm[0],
                max: s_mm[1],
                from: s_mm[0],
                to: s_mm[1],
                min_interval: Math.min.apply(null, intervalList)
            })

            /*
            var nestedData = [
                {id:1, name:"VAP135", start:"12222", end:"23333", source:"", mod:[
                   {type:"m6A", start:"122222", end:"12222222", SNP_id:"rs9086523", disease:"Parkinson Disease", link:"www.baidu.com"},
                   {type:"m1C", start:"122222", end:"12222222", SNP_id:"rs9086523", disease:"Parkinson Disease", link:"www.baidu.com"},
                ]},
                {id:2, name:"VAP135", start:"12546356", end:"23454635", source:"", mod:[
                    {type:"m1C", start:"122222", end:"12222222", SNP_id:"rs9086523", disease:"Parkinson Disease", link:"www.baidu.com"},
                ]},
            ]*/
            var linkIcon = function(cell, formatterParams){ //plain text value
              return "<i class='fas fa-link'></i>";
          };

          var modData = []
          for (e=0;e<exonList.length;e++){
              for(m=0;m<exonList[e].mod.length;m++){
                  modData.push({exon:exonList[e].name,
                    type:exonList[e].mod[m].type,
                    start:exonList[e].mod[m].start,
                    end:exonList[e].mod[m].end,
                    SNP_id:exonList[e].mod[m].SNP_id,
                    disease:exonList[e].mod[m].disease,
                    link:exonList[e].mod[m].link,
                })
                }
          }
      
        var table = new Tabulator("#table", {
            height:"500px",
            layout:"fitColumns",
            headerFilterPlaceholder:"Search",
            data:modData,
            columns:[
                {title:"Exon", field:"exon", width: 100, headerFilter:"input"},
                {title:"Type", field:"type", width: 100, editor:"select", editorParams:{values:{"m6A":"m6A", "m1A":"m1A", "m5C":"m5C"}}, headerFilter:true, headerFilterParams:{values:{"m6A":"m6A", "m1A":"m1A", "m5C":"m5C", "":""}}},
                {title:"Start", field:"start", width: 140, headerFilter: true},
                {title:"End", field:"end", width: 140, headerFilter: true},
                {title:"SNP ID", field:"SNP_id", formatter: "link", width: 140, headerFilter: true}, //https://www.ncbi.nlm.nih.gov/snp/rs2071569
                {title:"Disease", field:"disease", width: 180, headerFilter: true},
                {title:"Mod Link", field:"link", width:150, formatter:linkIcon, cellClick:function(cell){var links = cell.getValue().split(','); for(i=0;i<links.length;i++){window.open('http://' + link[i], '_blank')}}},
            ],
        });
        $("#download-csv").click(function(){
            table.download("csv", "data.csv");
        });

        });
    });
}
// for table
/*
function subTable(modJSON) {
    var startTable = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;"><tr>'
    var endTable = '</tr></table>'

    for (i = 0; i < modJSON.mod.length; i++) {
        startTable += '<td>' + modJSON.mod.type + ' | ' + modJSON.mod.start + ' - ' + modJSON.mod.end + ' | ' + '<button class="btn btn-sm btn-primary' + 'href="' + modJSON.mod.link + '"></button>' + '</td>'
    }

    var subTable = startTable + endTable

    return subTable
}*/

//----------------------------------------- Functions For Drawing --------------------------------------

// draw an junction block
function junction_block(x, color) {
    var junction_block = svg.paper.rect(x, 445, 2, 10).attr({
        fill: color,
        stroke: 'none',
    });

    return junction_block
}

// draw an exon
function exon_block(x, len, color, name) {

    var exon_name
    var display = false

    var exon_block = svg.paper.rect(x, 447, len, 6).attr({
        fill: color,
        stroke: 'none',
        cursor: 'pointer'
    }).click(function () {
        if (display == true) {
            exon_name.remove();
            display = false;
        } else if (display == false) {
            exon_name = svg.paper.text(x, 465, name).attr({
                    'font-family': 'arial',
                    'font-size': 10,
                    'cursor': 'pointer'
                })
                .drag();
            display = true;
        }
    }).mouseover(function () {
        Snap.animate(0, 1.5, function (val) {
            exon_block.attr({
                stroke: '#33A6B8',
                strokeWidth: val,
            });
        }, 200);
    }).mouseout(function () {
        Snap.animate(1.5, 0, function (val) {
            exon_block.attr({
                stroke: '#33A6B8',
                strokeWidth: val,
            });
        }, 200);
    })

    return exon_block
}

// draw a gene
function gene_block(x, len, color, name) {

    var gene_name
    var display = false

    var gene_block = svg.paper.rect(x, 449, len, 2).attr({
        fill: color,
        stroke: 'none',
        cursor: 'pointer'
    }).click(function () {
        if (display == true) {
            gene_name.remove();
            display = false;
        } else if (display == false) {
            gene_name = svg.paper.text(x, 465, name).attr({
                    'font-family': 'arial',
                    'font-size': 10,
                    'cursor': 'pointer'
                })
                .drag();
            display = true;
        }
    }).mouseover(function () {
        Snap.animate(0, 1.5, function (val) {
            gene_block.attr({
                stroke: '#33A6B8',
                strokeWidth: val,
            });
        }, 200);
    }).mouseout(function () {
        Snap.animate(1.5, 0, function (val) {
            gene_block.attr({
                stroke: '#33A6B8',
                strokeWidth: val,
            });
        }, 200);
    })

    return gene_block
}

// calculate the range of an array
function getRange(arr) {
    var range = 0
    for (var i = 0; i < arr.length; i++) {
        range += parseInt(arr[i].end) - parseInt(arr[i].start)
    }
    return range;
}

// calculate the min and max value of an array
function getMinMax(exonJSON) {
    var arr = []
    for (i = 0; i < exonJSON.length; i++) {
        arr.push(exonJSON[i].start)
        arr.push(exonJSON[i].end)
    }

    max = Math.max.apply(null, arr)
    min = Math.min.apply(null, arr)

    mm = [min, max]

    return mm
}

// draw the epigenetic legned
function legendText(x, y, text, color) {
    legText = svg.paper.text(x, y, text).attr({
        fill: color,
        'font-size': 13,
        'font-family': 'arial'
    })

    return legText
}

function drawLegend(epiList) {

    var y = 20,
        step_y = 15,
        epi = []

    function range(start, step, times) {
        var list = []
        for (i = 0; i < times; i++) {
            y = start + step * i
            list.push(y)
        }
        return list
    }

    function m6A(y) {
        trig = triangelOnCircle(20, y, 0, 0, 5, '#E98B2A')
        triText = legendText(30, y + 8, "m6A", '#E98B2A')
        return svg.group(trig, triText)
    }

    function m1A(y) {
        circle = svg.paper.circle(20, y, 3).attr({
            fill: '#64363C',
            stroke: '#64363C',
            "cursor": "pointer"
        })
        circleText = legendText(30, y + 2, "m1A", '#64363C')
        return svg.group(circle, circleText)
    }

    function m1C(y) {
        square = rectOnCircle(20, y, 0, 5, 0, '#E16B8C')
        squareText = legendText(30, y + 8, "m1C", '#E16B8C')
        return svg.group(square, squareText)
    }

    function MRE(y) {
        MRE = svg.paper.rect(17, y, 7, 7).attr({
            fill: '#6D2E5B',
            stroke: '#000',
            strokeWidth: 0.5
        })
        MREText = legendText(30, y + 8, "MRE", '#6D2E5B')
        return svg.group(MRE, MREText)
    }

    function ORF(y) {
        ORF = svg.paper.rect(17, y, 7, 7).attr({
            fill: '#516E41',
            stroke: '#000',
            strokeWidth: 0.5
        })
        ORFText = legendText(30, y + 8, "ORF")
        return svg.group(ORF, ORFText)
    }

    function SNP(y) {
        arrow = arrowOnCircle(20, y, 0, 0)
        arrowText = legendText(30, y + 8, "SNP", '#000')
        return svg.group(arrow, arrowText)
    }

    var yList = range(20, 15, epiList.length)
    console.log(yList)

    for (i = 0; i < epiList.length; i++) {
        if (epiList[i] == 'm6A') {
            epi.push(m6A(yList[i]))
        }
        if (epiList[i] == 'm1A') {
            epi.push(m1A(yList[i] + 5))
        }
        if (epiList[i] == 'm1C') {
            epi.push(m1C(yList[i]))
        }
        if (epiList[i] == 'ORF') {
            epi.push(ORF(yList[i]))
        }
        if (epiList[i] == 'MRE') {
            epi.push(MRE(yList[i]))
        }
        if (epiList[i] == 'SNP') {
            epi.push(SNP(yList[i]))
        }
    }

    console.log(epi[0])
    var legend = epi[0]

    for (i = 1; i < epi.length; i++) {
        legend = svg.group(legend, epi[i])
    }

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
    cText = svg.paper.text(centerX - textW / 2, centerY + textH / 2, text).attr({
        "font-family": "arial",
        "font-size": fontSize,
        fill: color
    })

    return cText
}

// Adding animation for epi-tag on circRNA
function epiAnimate(epi, name, color, centerX, centerY, link) {
    var c = epi.getBBox()
    epi.mouseover(function () {
            epi.animate({
                transform: 's1.5,' + c.cx + ',' + c.cy
            }, 200)
            text = textCenter(centerX, centerY, name, 15, color)
        })
        .mouseout(function () {
            epi.animate({
                transform: 's1,' + c.cx + ',' + c.cy
            }, 200)
            text.remove()
        })
        .click(function () {
            links = link.split(",")
            for (li=0;li<links.length;li++){
                openNewTab(links[li])
            }
        })
}

// Draw circRNA when clicking the arc
function drawCircRNA(exonJSON) {
    var modCirc = [],
        circle = [],
        realStart = getMinMax(exonJSON)[0],
        realEnd = getMinMax(exonJSON)[1]
    var startAngle = 180,
        endAngle = 180,
        centerX = 400,
        centerY = 140
    var range = getRange(exonJSON),
        modType = []

    // circRNA background
    arcBackGround = svg.paper.rect(0, 0, 800, 250).attr({
        stroke: "none",
        fill: "#fff"
    });

    // circRNA ID
    circText = "chr" + chr + ": " + realStart + " - " + realEnd
    circName = textCenter(centerX, centerY - 110, circText, 15, "#000")

    // draw epi mod of circRNA
    for (i = 0; i < exonJSON.length; i++) {
        circle[i] = 'circExon' + i;
        modCirc[i] = 'modCirc' + i;
        modCirc[i] = []
        endAngle += 360 * (exonJSON[i].end - exonJSON[i].start) / range
        console.log(centerX, centerY, startAngle, endAngle)
        exonStart = exonJSON[i].start
        exonEnd = exonJSON[i].end
        if (exonJSON[i]['mod'] !== undefined){
        for (t = 0; t < exonJSON[i]['mod'].length; t++) {
            if (exonJSON[i]['mod'][t].end <= exonEnd && exonJSON[i]['mod'][t].start >= exonStart){
            if ($.inArray(exonJSON[i]['mod'][t]['type'], modType) === -1) {
                modType.push(exonJSON[i]['mod'][t]['type'])
            }
            modCirc[i][t] += "mod" + t;
            modStartAngle = startAngle + 360 * (exonJSON[i]['mod'][t].start - exonStart) / range
            modEndAngle = startAngle + 360 * (exonJSON[i]['mod'][t].end - exonStart) / range
            if (exonJSON[i]['mod'][t].type == 'm6A') {
                var m6A = triTagOnCircle(centerX, centerY, 85, 180 + modStartAngle)
                epiAnimate(m6A, 'm6A', '#E98B2A', centerX, centerY, exonJSON[i]['mod'][t].link)
                modCirc[i][t] = m6A
            }
            if (exonJSON[i]['mod'][t].type == 'm1C') {
                var m1C = squareTagOnCircle(centerX, centerY, 85, 180 + modStartAngle)
                epiAnimate(m1C, 'm1C', '#E16B8C', centerX, centerY, exonJSON[i]['mod'][t].link)
                modCirc[i][t] = m1C
            }
            if (exonJSON[i]['mod'][t].type == 'm1A') {
                var m1A = circleTagOnCircle(centerX, centerY, 85, 180 + modStartAngle, '#64363C')
                epiAnimate(m1A, 'm1A', '#64363C', centerX, centerY, exonJSON[i]['mod'][t].link)
                modCirc[i][t] = m1A
            }
            if (exonJSON[i]['mod'][t].type == 'SNP') {
                var SNP = arrowOnCircle(centerX, centerY, 85, 180 + modStartAngle)
                epiAnimate(SNP, 'SNP', '#000', centerX, centerY, exonJSON[i]['mod'][t].link)
                modCirc[i][t] = SNP
            }
            if (exonJSON[i]['mod'][t].type == 'MRE') {
                modPath = describeArc(centerX, centerY, 70, modStartAngle, modEndAngle)
                var MRE = svg.paper.path(modPath).attr({
                    stroke: '#6D2E5B',
                    strokeWidth: 5,
                    fill: 'none',
                    "cursor": "pointer"
                }).mouseover(function () {
                    Snap.animate(5, 6.5, function (val) {
                        MRE.attr({
                            stroke: '#6D2E5B',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text = textCenter(centerX, centerY, "MRE", 15, '#6D2E5B')
                }).mouseout(function () {
                    Snap.animate(6.5, 5, function (val) {
                        MRE.attr({
                            stroke: '#6D2E5B',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text.remove()
                }).click(function () {
                    openNewTab(exonJSON[i]['mod'][t].link)
                })
                modCirc[i][t] = MRE
            }
            if (exonJSON[i]['mod'][t].type == 'ORF') {
                modPath = describeArc(centerX, centerY, 63, modStartAngle, modEndAngle)
                var ORF = svg.paper.path(modPath).attr({
                    stroke: '#516E41',
                    strokeWidth: 5,
                    fill: 'none',
                    "cursor": "pointer"
                }).mouseover(function () {
                    Snap.animate(5, 6.5, function (val) {
                        ORF.attr({
                            stroke: '#516E41',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text = text = textCenter(centerX, centerY, "ORF", 15, '#516E41')
                }).mouseout(function () {
                    Snap.animate(6.5, 5, function (val) {
                        ORF.attr({
                            stroke: '#516E41',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text.remove()
                }).click(function () {
                    openNewTab(exonJSON[i]['mod'][t].link)
                })
                modCirc[i][t] = ORF
            }
            //console.log(i, t, modCirc[i][t])
        }}}
        if (endAngle - startAngle == 360) {
            circle[i] = svg.paper.circle(centerX, centerY, 80).attr({
                stroke: exonJSON[i].color,
                strokeWidth: 10,
                fill: 'none'
            })
        } else {
            p = describeArc(centerX, centerY, 80, startAngle, endAngle)
            startAngle = endAngle
            circle[i] = svg.paper.path(p).attr({
                stroke: exonJSON[i].color,
                strokeWidth: 10,
                fill: 'none'
            })
        }
    }

    var juncX = centerX - 2,
        juncY = centerY + 75
    junction_point1 = svg.paper.rect(juncX - 2.3, juncY, 4, 10).attr({
        fill: "#00AA90",
        stroke: "#000",
        strokeWidth: 0.2,
    })
    junction_point2 = svg.paper.rect(juncX + 2.3, juncY, 4, 10).attr({
        fill: "#D0104C",
        stroke: "#000",
        strokeWidth: 0.2
    })

    // draw legend
    legend = drawLegend(modType)

    // group everything together
    var group
    if (legend == undefined) {
        group = svg.group(arcBackGround, circName)
    } else {
        group = svg.group(arcBackGround, circName, legend)
    }

    for (i = 0; i < modCirc.length; i++) {
        for (t = 0; t < modCirc[i].length; t++) {
            var cx = group
            group = svg.group(cx, modCirc[i][t])
        }
    }

    for (i = 0; i < circle.length; i++) {
        var cc = group
        group = svg.group(cc, circle[i])
    }

    return svg.group(group, junction_point1, junction_point2)
}

// CORE FUNCTION! draw the arc and its circRNA
function arc(start, end, exonJSON) {
    console.log("Call Functino arc")
    var rx = (end - start) / 2,
        ry = rx / 2,
        startBlock = junction_block(start, "#00AA90"),
        endBlock = junction_block(end, "#D0104C"),
        realStart = getMinMax(exonJSON)[0],
        realEnd = getMinMax(exonJSON)[1],
        circ

    var path = "M" + (start + 1) + " 443A" + rx + " " + ry + " 0 0 1 " + (end + 1) + " 443"
    var c = svg.paper.path(path).attr({
        stroke: "#000",
        strokeWidth: 1,
        fill: 'none',
        cursor: 'pointer'
    });
    console.log('Drawing Arc: ' + c)

    c.click(function () {
        var x = svg.select("g")
        if (x != null) {
            x.remove()
        }
        circ = drawCircRNA(exonJSON)
        id = "circ" + start + end
        if (id == window.currentStat) {
            circ.remove()
            window.currentStat = null
        } else {
            window.currentStat = id
        }
    }).mouseover(function () {
        Snap.animate(1, 6, function (val) {
            c.attr({
                stroke: "#33A6B8",
                strokeWidth: val,
            });
        }, 200);
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
    }).mouseout(function () {
        Snap.animate(6, 1, function (val) {
            c.attr({
                stroke: "#33A6B8",
                strokeWidth: val,
            });
        }, 200, function () {
            c.attr({
                stroke: "#000",
                strokeWidth: 1,
                fill: 'none',
            });
        })
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
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

function backSplicing(exonJSON, arcJSON) {
    var filterExons = [], exonList = [], drawArc = [], currentStat
    var circMM = getMinMax(arcJSON), cmin = circMM[0], cmax= circMM[1]
    // If the exon is contain even partially in the circRNA, it will still be filtered out
    filterExons = exonJSON.filter(function(v){if((cmin <= v.end && v.end <= cmax) || (cmin <= v.start && v.start <= cmax)){return v}})

    var range = circMM[1] - circMM[0]
    var colorIndex = 0
    console.log("filter exonlist: ", filterExons, "\nmm: ", circMM, "\nrange: ", range)
        // Condition 1: If exon fully inside circRNA, start and end remain the same
        // Condition 2: If exon partially inside circRNA, select this part
        for (i = 0; i < filterExons.length; i++) {
            scaleStart = 50 + 700 * (filterExons[i].start - circMM[0]) / range
            scaleEnd = 50 + 700 * (filterExons[i].end - circMM[0]) / range
            scaleLen = scaleEnd - scaleStart
            if (filterExons[i].type == "exon") {
                if (colorIndex < 50) {
                    exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
                    exonList[i] = {
                        "chr": parseInt($('#chrSelector').text()),
                        "start": filterExons[i].start,
                        "end": filterExons[i].end,
                        //"circid": "chr" + parseInt($('#chrSelector').text()) + ": " + exonJSON[i].start + "-" + exonJSON[i].end,
                        "color": colorList[colorIndex],
                        "mod": filterExons[i].mod
                        //"source": filterExons[i].source,
                        //"detail": filterExons[i].detail
                    }
                    //console.log("exonList " + i + " :", exonList[i])
                    colorIndex += 1
                } else {
                    colorIndex = 0
                    exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
                    exonList[i] = {
                        "chr": parseInt($('#chrSelector').text()),
                        "start": filterExons[i].start,
                        "end": filterExons[i].end,
                        //"circid": "chr" + parseInt($('#chrSelector').text()) + ": " + exonJSON[i].start + "-" + exonJSON[i].end,
                        "color": colorList[colorIndex],
                        "mod": filterExons[i].mod
                        //"source": filterExons[i].source,
                        //"detail": filterExons[i].detail
                    }
                    colorIndex += 1
                }
            } else if (filterExons[i].type == "gene") {
                if (colorIndex < 50) {
                    gene_block(scaleStart, scaleLen, colorList[colorIndex], filterExons[i].name)
                    colorIndex += 1
                } else {
                    colorIndex = 0
                    gene_block(scaleStart, scaleLen, colorList[colorIndex], filterExons[i].name)
                    colorIndex += 1
                }
            }
        }

    console.log("arc num: ", arcJSON.length)
    if (arcJSON.length === 0) {
        $('#circ-num').text('No circRNA in selected region.')
    }
    else if (arcJSON.length === 1) {
        $('#circ-num').text('1 circRNA in selected region.')
    }
    else {
        $('#circ-num').text(arcJSON.length + ' circRNAs in selected region.')
    }
    for (r = 0; r < arcJSON.length; r++) {
        arcStart = arcJSON[r].start
        arcEnd = arcJSON[r].end
        drawArc[r] = exonList.filter(function(v){if(v.start >= arcStart && v.end <= arcEnd){
            return v} 
            else if(v.start < arcStart && v.end < arcEnd && v.end > arcStart){
                v.start = arcStart;
                return v} 
            else if(v.end > arcEnd && v.start > arcStart && v.start < arcEnd){
                v.end = arcEnd;
                return v}
            else if(v.start < arcStart && v.end > arcEnd){
                v.start = arcStart
                v.end = arcEnd
                return v
            }})
        scaleArcStart = 50 + 700 * (arcStart - circMM[0]) / range
        scaleArcEnd = 50 + 700 * (arcEnd - circMM[0]) / range
        arc(scaleArcStart, scaleArcEnd, drawArc[r])
        /*
        console.log("exonlist len: ", exonList.length)
        for (t = 0; t < exonList.length; t++) {
            try{
            if (exonList[t].start >= arcStart && exonList[t].end <= arcEnd) {
                drawArc[r].push(exonList[t])
            } else {
            }}
            catch(err){
                console.log("Get exonList info failed.")
            }
        }*/
    }
    /*
    for (s = 0; s < arcJSON.length; s++) {
        scaleArcStart = 50 + 700 * (arcJSON[s].start - circMM[0]) / range
        scaleArcEnd = 50 + 700 * (arcJSON[s].end - circMM[0]) / range
        arc(scaleArcStart, scaleArcEnd, drawArc[s])
    }*/

    console.log(drawArc)

    return drawArc
};

// get the cordinate triangle around circle
function triCord(centerX, centerY, r, triDegree, triHeight, triType) {
    rad_triDegree = (triDegree - 270) * Math.PI / 180
    side = Math.sqrt((r + triHeight) ** 2 + triHeight ** 2)
    rad_deviateDegree = Math.atan(Math.sqrt(triType) * triHeight / side)

    x1 = centerX + (r) * Math.cos(rad_triDegree)
    y1 = centerY + (r) * Math.sin(rad_triDegree)
    x2 = centerX + (side) * Math.cos(rad_triDegree + rad_deviateDegree)
    y2 = centerY + (side) * Math.sin(rad_triDegree + rad_deviateDegree)
    x3 = centerX + (side) * Math.cos(rad_triDegree - rad_deviateDegree)
    y3 = centerY + (side) * Math.sin(rad_triDegree - rad_deviateDegree)
    x4 = centerX + (r + 2 * triHeight) * Math.cos(rad_triDegree)
    y4 = centerY + (r + 2 * triHeight) * Math.sin(rad_triDegree)

    return [x1, y1, x2, y2, x3, y3, x4, y4]
}

// get the cordinate of a stick
function stickCord(centerX, centerY, r, Degree, Height) {
    rad_Degree = (Degree - 270) * Math.PI / 180
    x1 = centerX + (r) * Math.cos(rad_Degree)
    y1 = centerY + (r) * Math.sin(rad_Degree)
    x2 = centerX + (r + Height) * Math.cos(rad_Degree)
    y2 = centerY + (r + Height) * Math.sin(rad_Degree)

    return [x1, y1, x2, y2]
}

function triangelOnCircle(centerX, centerY, r, triDegree, triHeight, color) {
    cords = triCord(centerX, centerY, r, triDegree, triHeight, 1 / 3)
    triangele = svg.paper.polygon(cords[0], cords[1], cords[2], cords[3], cords[4], cords[5]).attr({
        stroke: color,
        fill: color,
        "cursor": "pointer",
    })

    return triangele
}

function rhoOnCircle(centerX, centerY, r, rhoDegree, rhoHalfHeight, color) {
    cords = triCord(centerX, centerY, r, rhoDegree, rhoHalfHeight, 1)
    rho = svg.paper.polygon(cords[0], cords[1], cords[2], cords[3], cords[6], cords[7], cords[4], cords[5]).attr({
        stroke: color,
        fill: color,
        "cursor": "pointer",
    })

    return rho
}

function arrowOnCircle(centerX, centerY, r, Degree) {
    tri = triangelOnCircle(centerX, centerY, r + 1, Degree, 1, "#000")
    cords = stickCord(centerX, centerY, r, Degree, 10)
    arrowLine = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#000",
        strokeWidth: 0.5
    })
    arrow = svg.group(arrowLine, tri)

    return arrow
}

function rectOnCircle(centerX, centerY, r, a, degree, color) {
    rad_Degree = Snap.rad(degree - 270)
    r += 1
    x = r * Math.cos(rad_Degree) + centerX
    y = r * Math.sin(rad_Degree) + centerY
    rect = svg.paper.rect(x, y, a, a).attr({
        fill: color,
        stroke: color,
        "cursor": "pointer"
    })

    matrix = new Snap.Matrix()
    angle = 45 + degree
    matrix.rotate(angle, x, y)

    rect.transform(matrix)

    return rect
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
    tri = triangelOnCircle(centerX, centerY, r + 10, Degree, 4.5, "#E98B2A")
    triTag = svg.group(tri, line)

    return triTag

}

function squareTagOnCircle(centerX, centerY, r, Degree) {
    cords = stickCord(centerX, centerY, r, Degree, 5)
    line = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#E16B8C",
        strokeWidth: 1
    })
    square = rhoOnCircle(centerX, centerY, r + 5, Degree, 2.5, "#E16B8C")
    squareTag = svg.group(square, line)

    return squareTag
}

function openNewTab(link) {
    window.open(link, "_blank")
}
