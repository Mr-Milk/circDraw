/*jshint esversion: 5 */
// initialize SVG canvas
var svg = Snap("#svg"),
    SVG_WIDTH = parseInt($("#svg").attr('width')),
    SVG_HEIGHT = parseInt($("#svg").attr('height')),
    OFFSET_DIST = 50,
    CHR_LEN = SVG_WIDTH - 2 * OFFSET_DIST;
Object.freeze([svg, SVG_WIDTH, SVG_HEIGHT, OFFSET_DIST, CHR_LEN]);
// circRNA center coordinate
var CENTER_X = SVG_WIDTH / 2,
    CENTER_Y = 0.35 * SVG_HEIGHT;
Object.freeze([CENTER_X, CENTER_Y]);

// Define a color palette for the exon blocks
var colorList = ["#92C9FF", "#8FD16F", "#108757", "#0B3A42", "#FF404A", "#5CA0F2", "#FF881D", '#e30067', '#924900', '#ab9c00',
    '#ccd0d2', '#075800', '#5e0094', '#f28600', '#a327ea', '#ff8cc6', '#d60000', '#fff97a', '#ff0081', '#8aa0ae',
    '#87d1ff', '#7f00b8', '#2ab3e7', '#bd0056', '#0c9200', '#ffe85b', '#d27400', '#3f2e27', '#846a5b', '#004ac7',
    '#490063', '#ff5757', '#007aea', '#88cc66', '#ff4848', '#73aeff', '#ae5800', '#c1b900', '#c36cff', '#39b03b',
    '#244c66', '#9c0000', '#6d0000', '#877400', '#002065', '#000cae', '#ecd600', '#ff44a2', '#ffa254', '#ff0000',
    '#1a6f00', '#ffa12c'
];
var modColor = {
    m6A: '#E98B2A',
    m1A: '#64363C',
    m5C: '#E16B8C',
    pU: '#DDD23B',
    OMe: '#86C166',
    MRE: '#6D2E5B',
    ORF: '#516E41',
    RBP: '#006284'
};

var pU_map = ['N', 'Y'],
    OMe_map = ['m5Um','Am','Cm','Gm','Tm','Um'];

var colorIndex = 0;

// record
var circRNAs = {},
    geneList = {},
    exonList = {},
    arcRecord = [],
    CURRENT_STAT = {id: undefined, circ: undefined}, MIN, MAX, RAN;

// Get URL and split to caseid
var url = $(location).attr('href').split("/"),
    caseID = url[url.length - 1].split("#")[0];

// Get which region the user want to draw
var $name = $('#geneNameSelect'),
    $chr = $('#chrSelector'),
    $start = $("#js-input-from"),
    $end = $("#js-input-to"),
    $scale = $("#scale-selector"),
    $geneid = $("geneid");

$('#origin-data').click(function(){
    $('#origin-data').attr({
        'href': url.slice(0,-1).join('/') + '/downloadresult/?case_id=' + caseID,
    })
})

var targetNode = document.querySelector('geneid');
var config = { attributes: false, childList: true, subtree: true };

function refreshCircPlot() {
    if ($geneid.html() === "") {
    }
    else {
        $('.den-select-info').show();
        $scale.show();
        updateCircPlot(function(){
            //console.log(circRNAs)
            var serial = [];
            for (i=0;i<circRNAs.length;i++){
                serial.push(circRNAs[i].end-circRNAs[i].start)
            }
            var minInterval = Math.min.apply(null,serial),
            start = $start.text(),
            end = $end.text();
            //console.log(minInterval)
            $scale.data('ionRangeSlider').update({
                from: start,
                to: end,
                min: start,
                max: end,
                min_interval: minInterval
            });
            //console.log("running callback");
            redraw(circRNAs, geneList);}, $name.val());
    }};
// Create an observer instance linked to the callback function
var observer = new MutationObserver(refreshCircPlot);
// Start observing the target node for configured mutations
observer.observe(targetNode, config);

/*
$geneid.on('DOMSubtreeModified', 
});*/

$scale.ionRangeSlider({
    type: "double",
    min: 1,
    max: 5000,
    from: 2000,
    to: 3000,
    drag_interval: true,
    min_interval: 500, // the min length of all circRNA in arcJSON
    onFinish: function(data){
        circRNAsFilter = circRNAs.filter(function(v){if(v.start >= data.from && v.end <= data.to){return v;}});// get the circ list after selection
        //geneListFilter = geneList.filter(function(v){if(v.start >= data.from && v.end <= data.to){return v;}});
        svg.clear();
        // draw a straight line
        var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({ // 50, 0.9*SVG_HEIGHT, SVG_WIDTH-50, 0.9*SVG_HEIGHT
            stroke: "#000",
            strokeWidth: 1
        });
        redraw(circRNAsFilter, geneList);
    }
});

var table = new Tabulator("#table", {
    layout:"fitColumns",
    height:"350px",
    headerFilterPlaceholder:"Search",
    placeholder:"No Data Available",
    columns:[
        {title:"Type", field:"type", /* width: 100, */ headerFilter:true, formatter: function(cell){
            cellValue = cell.getValue();
            if (cellValue === 'pU') {
                return 'pseudo-U';
            }
            else if (cellValue === 'OMe') {
                return '2-O-Me';
            }
            else {
                return cellValue;
            }
        }},
        {title:"Start", field:"start", /* width: 140, */ headerFilter: true},
        {title:"End", field:"end", /* width: 140, */ headerFilter: true},
        {title:"Target", field:"info.target", /* width: 140, */ headerFilter: true, formatter: function(cell){
            if (cell.getValue() === undefined || cell.getValue() === "") {
                return '----';
            }
            else {
                return cell.getValue();
            }
        }},
        {title:"Links", field:"info.pubmed_id", /* width:150, */ formatter:function(cell){
            if (cell.getValue() === undefined || cell.getValue() === "") {
                return '----';
            }
            else {
                return "<i class='fas fa-link'></i>";
            }
        }, cellClick:function(e, cell){
            var links = cell.getValue().split(',');
            for (i=0,up=links.length; i<up ; i++){
                openNewTab('https://www.ncbi.nlm.nih.gov/pubmed/'+ links[i]);
            }
        }
    },
        /*{title:"SNP", field:"info.snp_id", formatter: function(cell){
            if (cell.getValue() === undefined || cell.getValue() === "") {
                return '----';
            }
            else {
                return cell.getValue();
            }
        }, width: 140, headerFilter: true},*/
        {title:"Disease", field:"info.disease", /* width: 180,  */headerFilter: true, formatter: function(cell){
            if (cell.getValue() === undefined || cell.getValue() === "") {
                return '----';
            }
            else {
                return cell.getValue();
            }
        }},
    ],
});

function updateCircPlot(callback) {
    //console.log('?caseid='+caseID+'&start='+$start.text()+'&end='+$end.text()+'&geneid='+$geneid.html()+'&chr='+$chr.text())
    $.when(
        $.getJSON("circrnas/",{
            "caseid": caseID,
            "start": $start.text(),
            "end": $end.text(),
            "chr": $chr.text(),
            "geneid": $geneid.html()
            })
    ).done(function (circ/* , genes */) {
        //console.log(circ/* ,genes */);
        circRNAs = circ;
        // geneList = genes[0];
        callback();
    });
}

function redraw(circRNAs, geneList) {
    //console.log("redraw:", circRNAs,"\n", geneList);
    exonList = {};
    colorIndex = 0;

    var mm = convert();
    MIN = mm.min;
    MAX = mm.max;
    RAN = MAX - MIN;

    if (circRNAs.length === 0) {
        $('#circ-num').text('No circRNA in selected region.');
    }
    else if (circRNAs.length === 1) {
        $('#circ-num').text('1 circRNA in selected region.');
    }
    else {
        $('#circ-num').text(circRNAs.length + ' circRNAs in selected region.');
    }

    if (circRNAs.length === 0 && geneList.length === 0) {
        svg.clear();
    } else {
        svg.clear();
        var bg = svg.paper.rect(0, 0, SVG_WIDTH, SVG_HEIGHT).attr({
            fill: "#fff",
            stroke: "none"
        });
        var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({ // 50, 0.9*SVG_HEIGHT, SVG_WIDTH-50, 0.9*SVG_HEIGHT
            stroke: "#000",
            strokeWidth: 1
        });

        //draw gene
        drawGene(geneList);
        arcRecord = []
        //draw circRNAs
        for (var v in circRNAs) {
            arcRecord.push(drawArc(circRNAs[v]));
        }
    }
    arcRecord[0].click();
}

//----------------------------------------- Functions For Drawing --------------------------------------
function infoBox(x, y, info) {
    var offset = $('#svg').position(),
        offsetX = offset.left,
        offsetY = offset.top;
    x = x - offsetX;
    y = y - offsetY;

    if (info === undefined || info === null) {
        return;
    } else {
        var texts = svg.paper.g(),
            keys = Object.keys(info),
            addY = 15;

        for (var i = 0, up = keys.length; i < up; i++) {
            key = keys[i];
            if (info[key] !== undefined && info[key] !== "") {
                text = key + ': ' + info[key];
                texts.add(svg.paper.text(x + 10, y + addY, text).attr({
                    fill: '#FFFFFF',
                    stroke: 'none',
                    'font-size': 10,
                    /* 'font-family': 'arial' */
                }));
                addY += 13;
            }
        }
        var textBBox = texts.getBBox(),
            textBottomX = textBBox.x + textBBox.w + 2.5,
            textBottomY = textBBox.y + textBBox.h + 2.5,
            Xoverflow = textBottomX > $('#svg').attr('width'),
            Yoverflow = textBottomY > $('#svg').attr('height');
        
        //console.log("overflow:", Xoverflow, Yoverflow)
        
        x = Xoverflow ? x - 2*10 - textBBox.w : x
        y = Yoverflow ? y - 2*textBBox.h : y - textBBox.h

        if (Xoverflow || Yoverflow) {
            texts.remove()
            texts = svg.paper.g()
            for (var i = 0, up = keys.length; i < up; i++) {
                key = keys[i];
                text = key + ': ' + info[key];
                texts.add(svg.paper.text(x + 10, y + addY, text).attr({
                    'font-size': 10,
                    fill: '#FFFFFF',
                    stroke: 'none',
                    // 'font-family': 'arial'
                }));
                addY += 13;
            }
        };
        textBBox = texts.getBBox();

        var box = svg.paper.rect(textBBox.x - 2.5, textBBox.y - 2.5, textBBox.w + 5, textBBox.h + 5).attr({
                fill: '#91989F',
                fillOpacity: 0.7,
                stroke: '#211E55',
                strokeWidth: 0.5,
                strokeOpacity: 0.5
            });
        box.insertBefore(texts);
        return svg.group(box, texts);
    }
}

function block(opt) {
    var display = false,
        infobox,
        conf = {
            junction: {
                y: 445, // 0.9*SVG_HEIGHT - 5*SVG_HEIGHT/500
                w: 2, // 2
                h: 10 // 10*SVG_HEIGHT/500
            },
            exon: {
                y: 447,
                w: opt.len,
                h: 7,
                textY: 465,
                fontSize: 10,
                fontWeight: 400
            },
            gene: {
                y: 446,
                w: opt.len,
                h: 9,
                textY: 475,
                fontSize: 12,
                fontWeight: 700
            },
            intron: {
                y: 449,
                w: opt.len,
                h: 3,
                textY: 465,
                fontSize: 10,
                fontWeight: 400
            }
        };
    var block = svg.paper.rect(opt.x, conf[opt.type].y, conf[opt.type].w, conf[opt.type].h),
        blockBBox = block.getBBox();
    if (opt.type === 'junction') {
        block.attr({
            fill: opt.color,
            stroke: 'none',
        });
    } else {
        block.attr({
            fill: opt.color,
            stroke: 'none',
            cursor: 'pointer'
        }).click(function () {
            if (display == true) {
                nameTag.remove();
                display = false;
            } else if (display == false) {
                nameTag = svg.paper.text(opt.x + conf[opt.type].w / 2, conf[opt.type].textY, opt.info.name).attr({
                        /* 'font-family': 'arial', */
                        'font-size': conf[opt.type].fontSize,
                        'font-weight': conf[opt.type].fontWeight,
                        'cursor': 'pointer',
                        fill: opt.color
                    })
                    .drag();
                display = true;
            }
        }).mouseover(function (ev, x, y) {
            block.animate({
                transform: 's(1.03,1.5)' + blockBBox.cx + ',' + blockBBox.cy
            }, 200);
            infobox = infoBox(x, y, opt.info);
        }).mouseout(function () {
            block.animate({
                transform: 's(1,1)' + blockBBox.cx + ',' + blockBBox.cy
            }, 200);
            infobox.remove();
        });
    }
    return block;
}

// coordinate convert from real genome coordinates to SVG canvas
function convert() {
    var min, max;
    for (var v1 in circRNAs) {

        min = circRNAs[v1].start < min || min === undefined ? circRNAs[v1].start : min;
        max = circRNAs[v1].end > max || max === undefined ? circRNAs[v1].end : max;
        for(var t = 0, up = circRNAs[v1].components.length; t<up ; t++ ) {
            exonStart = circRNAs[v1].components[t].start;
            exonEnd = circRNAs[v1].components[t].end;

            min = exonStart < min || min === undefined ? exonStart : min;
            max = exonEnd > max || max === undefined ? exonEnd : max;
        }
    }

    for (var v2 in geneList) {
        min = geneList[v2].start < min || min === undefined ? geneList[v2].start : min;
        max = geneList[v2].end > max || max === undefined ? geneList[v2].end : max;
    }

    return {
        min: min,
        max: max
    };
}

function drawLegend(conf) {
    // the conf should be {m6A: 'color', m5C: 'color', ...}
    /* 
    conf = {
        m6A: '#E98B2A',
        m1A: '#64363C',
        m5C: '#E16B8C',
        MRE: '#6D2E5B',
        ORF: '#516E41',
    }
    */
   if (Object.keys(conf).length === 0) {
       return;
   }
    var legend_xy = [20, 20],
        xCord = legend_xy[0],
        yCord = legend_xy[1],
        textConf = {m6A: 'm6A', m5C: 'm5C', m1A: 'm1A', pU:'pseudo-U', OMe: '2-O-Me', MRE: 'MRE', RBP: 'RBP', ORF:'ORF'},
        legend = svg.paper.g(),icon;

    for (var v in conf) {
        if (['m6A','m1A','m5C'].includes(v)) {
            tSize = 5;
            icon = tri([xCord + tSize/2, yCord, xCord, yCord + tSize, legend_xy[0] + tSize, yCord+tSize], conf[v]);
            yCord += 15;
        }
        else if (['MRE','RBP','ORF'].includes(v)) {
            icon = svg.paper.rect(xCord, yCord, 6, 3).attr({
                stroke: 'none',
                fill: conf[v]
            });
            yCord += 15;
        }
        else if (v === 'pU') {
            r = 2.5;
            icon = circle(xCord + r, yCord + r, r, conf[v]);
            yCord += 15;
        }
        else if (v === 'OMe') {
            icon = svg.paper.rect(xCord, yCord, 5, 5).attr({
                stroke: 'none',
                fill: conf[v]
            });
            yCord += 15;
        }
        text = svg.paper.text(xCord + 10, yCord - 10, textConf[v]).attr({
            fill: conf[v],
            'font-size': 10,
            /* 'font-family': 'arial' */
        });
        legend.add(icon, text);
    }

    legendBBox = legend.getBBox();

    legendBox = svg.paper.rect(legendBBox.x - 3, legendBBox.y - 5, legendBBox.w + 6, legendBBox.h + 9).attr({
        stroke: '#000',
        strokeOpacity: 0.2,
        strokeWidth: 1,
        fill: 'none'
    });

    legend.add(legendBox);

    return legend;
}

function drawCircRNA(exonComponents, circStart, circEnd) {
    //console.log(exonComponents);
    exonComponents.sort(function(a,b){
        return (a.start-b.start)
    });
    var len = 0,
        startAngle = 90,
        exons = JSON.parse(JSON.stringify(exonComponents)),
        exlen = exons.length,
        modR1 = 0.145,
        modR2 = 5,
        modSTAT1 = {},
        modSTAT2 = {},
        opt = {
            m6A: [2, 'tri'],
            m5C: [2, 'tri'],
            m1A: [2, 'tri'],
            pU: [2, 'square'],
            OMe: [2, 'circle']
        },
        circRNA = svg.paper.g();

    exons[0].realStart = exons[0].start;
    exons[0].realEnd = exons[0].end;
    exons[exlen - 1].realStart = exons[exlen - 1].start;
    exons[exlen - 1].realEnd = exons[exlen - 1].end;
    exons[0].start = exons[0].start < circStart ? circStart : exons[0].start;
    exons[exlen - 1].end = exons[exlen - 1].end > circEnd ? circEnd : exons[exlen - 1].end;
    min = exons[0].start;

    for (t = 0, up = exons.length; t < up; t++) {
        len += exons[t].end - exons[t].start;
    }

    for (i = 0, up = exons.length; i < up; i++) {
        var start = exons[i].start,
            end = exons[i].end,
            disease = exons[i].disease,
            exStartAngle = startAngle,
            exEndAngle = startAngle + ((end - start) / len) * 360,
            type = exons[i].type,
            mods = exons[i].mods,
            id = exons[i].id,
            strand = exons[i].strand,
            exonID, color;

        if (exons[i].realStart === undefined || exons[i].realEnd === undefined) {
            exonID = type + ':' + start + '-' + end;
        }
        else {
            exonID = type + ':' + exons[i].realStart + '-' + exons[i].realEnd;
        }
        //console.log(exonList, exonID);

        color = exonList[exonID];

        for (j = 0, up_j = mods.length; j < up_j; j++) {
            draw_modifications = mods[j].start >= start && mods[j].end <= end
            //console.log(mods[j].start >= start, mods[j].end <= end, draw_modifications)
            if (draw_modifications) {
                var modInfo = mods[j].info,
                    modStart = ((mods[j].start - start) / len) * 360 + exStartAngle,
                    modEnd = ((mods[j].end - start) / len) * 360 + exStartAngle,
                    modType;
                modInfo.type = mods[j].type;
                modInfo.position = mods[j].start + '-' + mods[j].end;

                if (pU_map.includes(mods[j].type)) {
                    modType = 'pU'
                }
                else if (OMe_map.includes(mods[j].type)) {
                    modType = 'OMe'
                }
                else {
                    modType = mods[j].type
                };
                //console.log('modinfo:',modInfo);
                if (['MRE', 'ORF', 'RBP'].includes(modType)) {
                    if (modSTAT1[modType] === undefined) {
                        modR1 -= 0.015;
                        modSTAT1[modType] = modR1;
                        r1 = modR1;
                    } else {
                        r1 = modSTAT1[modType];
                    }
                    circRNA.add(ring({
                        x: CENTER_X,
                        y: CENTER_Y,
                        r: r1 * SVG_HEIGHT,
                        width: 5,
                        startDegree: modStart,
                        endDegree: modEnd,
                        color: modColor[modType],
                        info: modInfo
                    }));
                } else {
                    if (modSTAT2[modType] === undefined) {
                        modR2 += 3;
                        modSTAT2[modType] = modR2;
                        r2 = modR2;
                    } else {
                        r2 = modSTAT2[modType];
                    }
                    circRNA.add(shapeOnCircle({
                        x: CENTER_X,
                        y: CENTER_Y,
                        r: 0.15 * SVG_HEIGHT,
                        degree: modStart,
                        shapeSize: opt[modType][0],
                        height: r2,
                        color: modColor[modType],
                        type: opt[modType][1],
                        info: modInfo
                    }));
                }
            }
        }

        if (type === 'exon') {
            circRNA.add(ring({
                x: CENTER_X,
                y: CENTER_Y,
                r: 0.15 * SVG_HEIGHT,
                width: 11,
                startDegree: exStartAngle,
                endDegree: exEndAngle,
                color: color,
                info: {
                    id: id,
                    type: type,
                    strand: strand,
                    position: start + '-' + end
                }
            }));
        } else if (type === 'intron') {
            circRNA.add(ring({
                x: CENTER_X,
                y: CENTER_Y,
                r: 0.15 * SVG_HEIGHT,
                width: 5,
                startDegree: exStartAngle,
                endDegree: exEndAngle,
                color: "#000",
                info: {
                    id: id,
                    type: type,
                    strand: strand,
                    position: start + '-' + end
                }
            }));
        }

        startAngle = exEndAngle;
    }

    var legendConf = {};
    for (var v in $.extend(modSTAT1, modSTAT2)) {
        legendConf[v] = modColor[v];
    }
    if (Object.keys(legendConf).length !== 0) {
        circRNA.add(drawLegend(legendConf));
    }
    var junction1 = ring({
        x: CENTER_X,
        y: CENTER_Y,
        r: 0.15 * SVG_HEIGHT,
        width: 11,
        startDegree: 90,
        endDegree: 92,
        color: '#00AA90',
        info: {
            juntion1: circStart
        }
    }),
    junction2 = ring({
        x: CENTER_X,
        y: CENTER_Y,
        r: 0.15 * SVG_HEIGHT,
        width: 11,
        startDegree: 90,
        endDegree: 88,
        color: '#D0104C',
        info: {
            juntion2: circEnd
        }
    });
    circRNA.add(junction1, junction2);

    return circRNA;
}

function drawExons(exons) {
    for (i = 0, up = exons.length; i < up; i++) {
        var start = exons[i].start,
            end = exons[i].end,
            type = exons[i].type,
            id = exons[i].id,
            strand = exons[i].strand,
            exonID = type + ':' + start + '-' + end,
            exStart = (start - MIN) / RAN * CHR_LEN + OFFSET_DIST,
            exEnd = (end - MIN) / RAN * CHR_LEN + OFFSET_DIST,
            color;
        
        //console.log('drawExons', exonList[exonID]);

        if (exonList[exonID] === undefined) {
            exonList[exonID] = colorList[colorIndex];
        }
        color = exonList[exonID];
        colorIndex = colorIndex < colorList.length ? colorIndex + 1 : 0;

        if (type === 'exon') {
            block({
                x: exStart,
                len: exEnd - exStart,
                color: color,
                type: type,
                info: {
                    id: id,
                    type: type,
                    strand: strand,
                    position: start + '-' + end
                }
            });
        } else if (type === 'intron') {
            block({
                x: exStart,
                len: exEnd - exStart,
                color: "#000",
                type: type,
                info: {
                    id: id,
                    type: type,
                    strand: strand,
                    position: start + '-' + end
                }
            });
        }
    }
}

function drawGene(geneList) {
    for (var g in geneList) {
        var gene = geneList[g],
            start = (gene.start - MIN) / RAN * CHR_LEN + OFFSET_DIST,
            end = (gene.end - MIN) / RAN * CHR_LEN + OFFSET_DIST;
        block({
            x: start,
            len: end - start,
            color: colorList[colorIndex],
            type: 'gene',
            info: {
                name: gene.name,
                position: gene.start + " - " + gene.end
            }
        });
        colorIndex = colorIndex < colorList.length ? colorIndex + 1 : 0;
    }
}

function drawArc(data) {
    var arcStart = (data.start - MIN) / RAN * CHR_LEN + OFFSET_DIST,
        arcEnd = (data.end - MIN) / RAN * CHR_LEN + OFFSET_DIST,
        // circName = data.name,
        exons = data.components,
        rx = (arcEnd - arcStart) / 2,
        ry = 2 * rx / 5,
        path = "M" + (arcStart + 1) + " 443A" + rx + " " + ry + " 0 0 1 " + (arcEnd + 1) + " 443",
        infobox, circ, id;

    //draw exons
    drawExons(exons);

    junction1 = block({
        x: arcStart,
        len: arcEnd - arcStart,
        color: '#00AA90',
        type: 'junction'
    });
    junction2 = block({
        x: arcEnd,
        len: arcEnd - arcStart,
        color: '#D0104C',
        type: 'junction'
    });

    var arc = svg.paper.g(),
        a1 = svg.paper.path(path).attr({
            stroke: "#000",
            strokeWidth: 1,
            fill: 'none',
            cursor: 'pointer'
        }),
        a2 = svg.paper.path(path).attr({
            stroke: "#000",
            strokeWidth: 10,
            fill: 'none',
            cursor: 'pointer',
            opacity: '0'
        });

    //draw arc
    arc.add(a1, a2);

    // setting interactive of arc
    arc.click(function () {
        id = "circ" + arcStart + arcEnd;
        if (id === CURRENT_STAT.id) {
            CURRENT_STAT.circ.remove();
            CURRENT_STAT.circname.remove();
            // fix this remove circ things, try store it in a object with key to access it, should do the trick
            CURRENT_STAT = {id: undefined, circ: undefined, circname: undefined};
            table.clearData();
        } else {
            if (CURRENT_STAT.circ !== undefined){
                CURRENT_STAT.circ.remove();
                CURRENT_STAT.circname.remove();
            }
            circ = drawCircRNA(exons, data.start, data.end);
            name = $chr.text() + ' : ' + data.start + ' - ' + data.end;
            circName = (function(){
                
                var text = svg.text(400, 20, name).attr({
                    'font-size': 12
                }), textBox = text.getBBox();
                text.remove();
                return svg.text(400 - textBox.w/2, 50, name).attr({
                    'font-size': 12
                });
            })();
            $('#circ-name').text(name)
            CURRENT_STAT = {id: id,
                            circ: circ,
                            circname: circName};
            // fill the table
            var tableData = [];

            exons.forEach(function(v){
                v.mods.forEach(function(m){
                    tableData.push(m);
                });
            });
            //console.log(tableData)
            
            table.replaceData(tableData);
            table.redraw();

            $("#download-csv").click(function(){
                table.download("csv", name + ".csv");
            });

        }
    }).mouseover(function (ev, x, y) {
        Snap.animate(1, 5, function (val) {
            a1.attr({
                stroke: "#33A6B8",
                strokeWidth: val,
            });
        }, 200);
        infobox = infoBox(x, y, {
            name: $chr.text() + ' : ' + data.start + ' - ' + data.end,
            position: data.start + "-" + data.end,
            source: data.source,
            disease: data.disease,
        });
    }).mouseout(function () {
        Snap.animate(5, 1, function (val) {
            a1.attr({
                stroke: "#33A6B8",
                strokeWidth: val,
            });
        }, 200, function () {
            a1.attr({
                stroke: "#000"
            });
        });
        infobox.remove();
    });

    return arc;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees) * Math.PI / 180.0;

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

function tri(cordinates, color) {
    return svg.paper.polygon(cordinates).attr({
        stroke: color,
        fill: color,
        "cursor": "pointer",
    });
}

function circle(cx, cy, r, color) {
    return svg.paper.circle(cx, cy, r).attr({
        fill: color,
        stroke: color,
        "cursor": "pointer"
    });
}

function square(x, y, sideLength, color, rotate) {
    rect = svg.paper.rect(x, y, 1.4 * sideLength, 1.4 * sideLength).attr({
        fill: color,
        stroke: color,
        "cursor": "pointer"
    });

    matrix = new Snap.Matrix();
    matrix.rotate(rotate, x, y);
    rect.transform(matrix);

    return rect;
}

function shapeOnCircle(opt) {
    var rotate = opt.degree-45;
    opt.degree = opt.degree * Math.PI / 180;


    var x0 = opt.x + (opt.r) * Math.cos(opt.degree),
        y0 = opt.y + (opt.r) * Math.sin(opt.degree),
        x1 = opt.x + (opt.r + opt.height) * Math.cos(opt.degree),
        y1 = opt.y + (opt.r + opt.height) * Math.sin(opt.degree),
        side = Math.sqrt(Math.pow((opt.r + opt.height + opt.shapeSize), 2) + Math.pow(opt.shapeSize, 2)),
        deviateDegree = Math.atan(opt.shapeSize / (opt.r + opt.height + opt.shapeSize)),
        x2 = opt.x + (side) * Math.cos(opt.degree + deviateDegree),
        y2 = opt.y + (side) * Math.sin(opt.degree + deviateDegree),
        x3 = opt.x + (side) * Math.cos(opt.degree - deviateDegree),
        y3 = opt.y + (side) * Math.sin(opt.degree - deviateDegree),
        triCord = [x1, y1, x2, y2, x3, y3],
        line = svg.paper.line(x0, y0, x1, y1).attr({
            stroke: opt.color,
            strokeWidth: 1
        });

    var shape = opt.type === 'circle' ? circle(x1, y1, opt.shapeSize, opt.color) : opt.type === 'tri' ? tri(triCord, opt.color) : opt.type === 'square' ? square(x1, y1, opt.shapeSize, opt.color, rotate) : null;

    var epitag = svg.group(line, shape);
    addAnimation(epitag, opt.info);

    return epitag;
}

function ring(opt) {
    var links, ring, infobox,
        path = describeArc(opt.x, opt.y, opt.r, opt.startDegree, opt.endDegree);

    if (opt.info !== undefined) {
        links = opt.info.pubmed_id;
    }

    delete opt.info['link'];
    delete info['pubmed_id'];

    if (opt.endDegree - opt.startDegree === 360) {
        ring = svg.paper.circle(CENTER_X, CENTER_Y, opt.r).attr({
            stroke: opt.color,
            strokeWidth: opt.width,
            fill: 'none',
            "cursor": "pointer"
        }).mouseover(function (ev, x, y) {
            Snap.animate(opt.width, opt.width + 1.5, function (val) {
                ring.attr({
                    strokeWidth: val,
                });
            }, 200);
            if (opt.info !== undefined) {
                infobox = infoBox(x, y, opt.info);
            }
        }).mouseout(function () {
            Snap.animate(opt.width + 1.5, opt.width, function (val) {
                ring.attr({
                    strokeWidth: val,
                });
            }, 200);
            if (opt.info !== undefined) {
                infobox.remove();
            }
        }).click(function () {
            if (links !== undefined & links !== null) {
                elink = links.split(',')
                console.log(elink)
                for (var i = 0, up = elink.length; i < up; i++) {
                    //openNewTab('https://www.ncbi.nlm.nih.gov/pubmed/'+ elink[i]);
                    openNewTab(elink[i]);
                }
            }
        });
    } else {
        ring = svg.paper.path(path).attr({
            stroke: opt.color,
            strokeWidth: opt.width,
            fill: 'none',
            "cursor": "pointer"
        }).mouseover(function (ev, x, y) {
            Snap.animate(opt.width, opt.width + 1.5, function (val) {
                ring.attr({
                    strokeWidth: val,
                });
            }, 200);
            if (opt.info !== undefined) {
                infobox = infoBox(x, y, opt.info);
            }
        }).mouseout(function () {
            Snap.animate(opt.width + 1.5, opt.width, function (val) {
                ring.attr({
                    strokeWidth: val,
                });
            }, 200);
            if (opt.info !== undefined) {
                infobox.remove();
            }
        }).click(function () {
            if (links !== undefined & links !== null & links.length != 0) {
                console.log("RING:", links)
                elink = links.split(',')
                for (var i = 0, up = elink.length; i < up; i++) {
                    openNewTab('https://www.ncbi.nlm.nih.gov/pubmed/' +elink[i]);
                }
            }
        });
    }
    return ring;
}

function addAnimation(obj, info) {
    var box = obj.getBBox(),
        infobox, links;

    if (info !== undefined && info.pubmed_id !== undefined) {
        links = info.pubmed_id.split(',');
    }

    delete info['link'];
    delete info['pubmed_id'];

    obj.mouseover(function (ev, x, y) {
        obj.animate({
            transform: 's1.5,' + box.cx + ',' + box.cy
        }, 200);
        if (info !== undefined) {
            infobox = infoBox(x, y, info);
        }
    }).mouseout(function (ev, x, y) {
        obj.animate({
            transform: 's1,' + box.cx + ',' + box.cy
        }, 200);
        if (info !== undefined) {
            infobox.remove();
        }
    }).click(function () {
        console.log(links)
        if (links !== undefined & links !== null & links.length != 0) {
            for (var i = 0, up = links.length; i < up; i++) {
                openNewTab('https://www.ncbi.nlm.nih.gov/pubmed/' +links[i]);
            }
        }
    });
}

function openNewTab(link) {
    window.open(link, "_blank");
}
