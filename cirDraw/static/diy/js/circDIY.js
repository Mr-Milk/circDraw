/*jshint esversion: 5 */
$.fn.extend({
    errorAfter: function (error) {
        if ($('#error').length === 0) {
            $(this).after("<span id='error' class='ml-3'></span>");
            $('#error').html(error).addClass('text-danger').show().fadeOut(2000, function () {
                $('#error').remove();
            });
        }
    },
    alphaNumOnly: function (opt) {
        var arr = [8, 16, 17, 20, 35, 36, 37, 38, 39, 40, 45, 46, 91],
            alphaCode = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
            numCode = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 67, 86],
            allow, rexp;

        if (opt.num === true && opt.alpha === true) {
            allow = arr.concat(alphaCode, numCode);
            rexp = /\W/g;
        } else if (opt.num === true && opt.alpha === false) {
            allow = arr.concat(numCode);
            rexp = /\D/g;
        } else if (opt.num === false && opt.alpha === true) {
            allow = arr.concat(alphaCode);
            rexp = /[^A-Za-z]/g;
        }

        $(this).on("keydown", function (e) {
            if ($.inArray(event.which, allow) === -1) {
                event.preventDefault();
            }
        }).bind('keyup', function (e) {
            this.value = this.value.replace(rexp, '');
        });
    },
    addInputHTML: function (tag, HTMLtext, del) {
        $(this).click(function () {
            $(tag).append(HTMLtext).ready(function () {
                $('.alpha-num-only').alphaNumOnly({
                    num: true,
                    alpha: true
                });
                $('.num-only').alphaNumOnly({
                    num: true,
                    alpha: false
                });
                $(del).click(function () {
                    $(this).parent().parent().remove();
                });
            });
        });
    },
    getInput: function () {
        var input = [];
        $(this).children().children().get().forEach(function (e) {
            if (e.value != "" && e.value != undefined && e.value != "Type") {
                if (isNaN(parseInt(e.value))) {
                    input.push(e.value);
                } else {
                    input.push(parseInt(e.value));
                }
            } else {
                return;
            }
        });
        return input;
    },
    addCircList: function (id) {
        $(this).parent().parent().after("<div><p class='d-inline-block'>circRNA: " + "<b>" + id + "</b>" +
            "</p>\n" + "<p class='d-inline-block ml-1' style='cursor: pointer;' id='delete" + id + "'><u>Delete</u></p>" +
            "<p class='d-inline-block ml-1' style='cursor: pointer;' id='edit" + id + "'><u>Edit</u></p></div>");
    },
    addGeneList: function (id) {
        $(this).parent().parent().after("<div><p class='d-inline-block'>Gene: " + "<b>" + id + "</b>" +
            "</p>\n" + "<p class='d-inline-block ml-1' style='cursor: pointer;' id='delete" + id + "'><u>Delete</u></p>" +
            "<p class='d-inline-block ml-1' style='cursor: pointer;' id='edit" + id + "'><u>Edit</u></p></div>");
    }
});

function background() { // canvas background
    return svg.paper.rect(0, 0, SVG_WIDTH, SVG_HEIGHT).attr({
        fill: "#fff",
        stroke: "none",
        //strokeWidth: 1
    });
}

function validateInput(exons, mods, circStart, circEnd) {
    checkSize = function (type, step) {
        var size = true;
        for (var i = 0, up = type.length / step; i < up; i++) {
            var data = type.slice(step * i, step * (i + 1) - 1).slice(-2),
                start = parseInt(data[0]),
                end = parseInt(data[1]);
            if (start > end) {
                size = false;
            }
        }
        return size;
    };

    overlap = function (type, step) {
        var condition = false;
        for (var i = 0, up = type.length / step; i < up; i++) {
            var data = type.slice(step * i, step * (i + 1)).slice(-2);
            for (var t = 0; t < up; t++) {
                var compData = type.slice(step * t, step * (t + 1)).slice(-2);
                condition = data[1] <= compData[0] || compData[1] <= data[0] || (data[0] == compData[0] && data[1] == compData[1]) ? false : true;
            }
        }
        return condition;
    };

    var ifSE = checkSize(exons, 4) && checkSize(mods, 3) && (circStart < circEnd || !(circStart == "" && circEnd == ""));
    ifOverlap = overlap(exons, 4);
    ifFilled = (exons.length % 4 === 0 && circStart !== "" && circEnd !== "") ? true : false;

    if (!ifFilled) {
        $('#addcirc').errorAfter('Unfilled Blank');
        return false;
    } else {
        if (ifOverlap) {
            $('#addcirc').errorAfter('Input overlap!');
            return false;
        } else if (!ifSE) {
            $('#addcirc').errorAfter('Try start < end!');
            return false;
        } else {
            return true;
        }
    }
}

function processData(circName, circStart, circEnd, exons, mods) {
    var low = circStart,
        up = circEnd,
        newExon = [],
        eStep = 4,
        mStep = 3;
    for (var i = 0, len = exons.length / eStep; i < len; i++) {
        var data = exons.slice(eStep * i, eStep * (i + 1)),
            exon = {};

        if ((data[2] < low && data[3] < low) || (data[2] > up && data[3] > up)) {} else {
            exon.type = data[0];
            exon.name = data[1];
            exon.start = data[2];
            exon.end = data[3];
            exon.mods = [];
            exon.color = colorList[colorIndex];

            colorIndex = colorIndex < colorList.length ? colorIndex + 1 : 0;

            for (var t = 0, tlen = mods.length / mStep; t < tlen; t++) {
                var mdata = mods.slice(mStep * t, mStep * (t + 1));
                if (mdata[1] >= data[2] && mdata[2] <= data[3]) {
                    exon.mods.push({
                        type: mdata[0],
                        start: mdata[1],
                        end: mdata[2]
                    });
                }
            }
            newExon.push(exon);
        }
    }
    newExon.sort(function (a, b) {
        return a.start - b.start;
    });
    return {
        'name': circName,
        'start': circStart,
        'end': circEnd,
        'exons': newExon
    };
}

function redraw() { // redraw() will be called everytime when the stored data changed
    var mm = convert();
    MIN = mm.min;
    MAX = mm.max;
    RAN = MAX - MIN;
    console.log('Global vars:',
        '\nMIN:', MIN,
        '\nMAX:', MAX,
        '\nRAN:', RAN);
    console.log('circRNAs:', circRNAs, '\ngeneList:', geneList, '\nstatus:', circRNAs.length, geneList.length);
    if (Object.keys(circRNAs).length === 0 && Object.keys(geneList).length === 0) {
        svg.clear();
    } else {
        svg.clear();
        var bg = background();
        var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({
            stroke: "#000",
            strokeWidth: 1
        });

        //draw gene
        drawGene(geneList);

        //draw circRNAs
        for (var v in circRNAs) {
            drawArc(circRNAs[v]);
        }
    }
}

//----------------------------------------- Functions For Drawing --------------------------------------

// this infoBox size will change with the text
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
            text = key + ': ' + info[key];
            texts.add(svg.paper.text(x + 10, y + addY, text).attr({
                'font-size': 10,
                'font-family': 'arial'
            }));
            addY += 13;
        }

        var textBBox = texts.getBBox(),
            box = svg.paper.rect(textBBox.x - 2.5, textBBox.y - 2.5, textBBox.w + 5, textBBox.h + 5).attr({
                fill: '#fed136',
                fillOpacity: 0.5,
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
                y: 445,
                w: 2,
                h: 10
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
                        'font-family': 'arial',
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
            'font-family': 'arial'
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

    legend.add(legendBox).drag();

    return legend;
}

function drawCircRNA(exons, circStart, circEnd) {
    var len = 0,
        startAngle = 90,
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

    exons[0].start = exons[0].start < circStart ? circStart : exons[0].start;
    exons[exlen - 1].end = exons[exlen - 1].end > circEnd ? circEnd : exons[exlen - 1].end;
    min = exons[0].start;

    for (t = 0, up = exons.length; t < up; t++) {
        len += exons[t].end - exons[t].start;
    }

    for (i = 0, up = exons.length; i < up; i++) {
        var start = exons[i].start,
            end = exons[i].end,
            exStartAngle = startAngle,
            exEndAngle = startAngle + ((end - start) / len) * 360,
            type = exons[i].type,
            mods = exons[i].mods,
            color = exons[i].color;

        for (j = 0, up_j = mods.length; j < up_j; j++) {
            var modType = mods[j].type,
                modStart = ((mods[j].start - start) / len) * 360 + exStartAngle,
                modEnd = ((mods[j].end - start) / len) * 360 + exStartAngle;
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
                    info: {
                        type: modType,
                        position: mods[j].start + '-' + mods[j].end
                    }
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
                    info: {
                        type: modType,
                        position: mods[j].start
                    }
                }));
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
                    type: type,
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
                    type: type,
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
            name = exons[i].name,
            exStart = (start - MIN) / RAN * CHR_LEN + OFFSET_DIST,
            exEnd = (end - MIN) / RAN * CHR_LEN + OFFSET_DIST,
            color = exons[i].color;
        if (type === 'exon') {
            block({
                x: exStart,
                len: exEnd - exStart,
                color: color,
                type: type,
                info: {
                    type: type,
                    name: name,
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
                    type: type,
                    name: name,
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
            color: gene.color,
            type: 'gene',
            info: {
                name: gene.name,
                position: gene.start + " - " + gene.end
            }
        });
    }
}

function drawArc(data) {
    var arcStart = (data.start - MIN) / RAN * CHR_LEN + OFFSET_DIST,
        arcEnd = (data.end - MIN) / RAN * CHR_LEN + OFFSET_DIST,
        circName = data.name,
        exons = data.exons,
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
        if (id == CURRENT_STAT) {
            circ.remove();
            CURRENT_STAT = undefined;
        } else {
            circ = drawCircRNA(exons, data.start, data.end);
            CURRENT_STAT = id;
        }
    }).mouseover(function (ev, x, y) {
        Snap.animate(1, 5, function (val) {
            a1.attr({
                stroke: "#33A6B8",
                strokeWidth: val,
            });
        }, 200);
        infobox = infoBox(x, y, {
            name: circName,
            position: data.start + "-" + data.end
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
        links = opt.info.link;
        delete opt.info.link;
    }

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
                for (var i = 0, up = links.length; i < up; i++) {
                    openNewTab(links[i]);
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
            if (links !== undefined & links !== null) {
                for (var i = 0, up = links.length; i < up; i++) {
                    openNewTab(links[i]);
                }
            }
        });
    }
    return ring;
}

function addAnimation(obj, info) {
    var box = obj.getBBox(),
        infobox, links;

    if (info !== undefined && info.link !== undefined) {
        links = info.link;
        delete obj.info.link;
    }

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
        if (links !== undefined & links !== null) {
            for (var i = 0, up = links.length; i < up; i++) {
                openNewTab(links[i]);
            }
        }
    });
}

function openNewTab(link) {
    window.open(link, "_blank");
}

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

console.log('Global vars list:',
    '\nSVG_WIDTH:', SVG_WIDTH, typeof (SVG_WIDTH),
    '\nSVG_HEIGHT:', SVG_HEIGHT, typeof (SVG_HEIGHT),
    '\nCHR_LEN:', CHR_LEN,
    '\nCENTER_X:', CENTER_X,
    '\nCENTER_Y:', CENTER_Y);

// set background
var bg = background();

// set color
var colorList = ["#92C9FF", "#8FD16F", "#108757", "#0B3A42", "#FF404A", "#5CA0F2", "#FF881D", '#e30067', '#924900', '#ab9c00',
    '#ccd0d2', '#075800', '#5e0094', '#f28600', '#a327ea', '#ff8cc6', '#d60000', '#fff97a', '#ff0081', '#8aa0ae',
    '#87d1ff', '#7f00b8', '#2ab3e7', '#bd0056', '#0c9200', '#ffe85b', '#d27400', '#3f2e27', '#846a5b', '#004ac7',
    '#490063', '#ff5757', '#007aea', '#88cc66', '#ff4848', '#73aeff', '#ae5800', '#c1b900', '#c36cff', '#39b03b',
    '#244c66', '#9c0000', '#6d0000', '#877400', '#002065', '#000cae', '#ecd600', '#ff44a2', '#ffa254', '#ff0000',
    '#1a6f00', '#ffa12c'
];
var colorIndex = 0;
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

// some HTML text
var exonInputHTML = '<div class="input-group mb-3"><select class="custom-select" id="exon-intron">' +
    '<option selected="" value="exon">Exon</option>' +
    '<option value="intron">Intron</option></select>' +
    '<input type="text" class="form-control alpha-num-only" placeholder="name" id="exonName">' +
    '<input type="text" class="form-control num-only" placeholder="start" id="exonStart">' +
    '<input type="text" class="form-control num-only" placeholder="end" id="exonEnd">' +
    '<div class="input-group-append"><button class="btn btn-outline-secondary exonDelete" type="button">-</button></div></div>',
    modInputHTML = '<div class="input-group mb-3"><select class="custom-select" id="inputGroupSelect01">' +
    '<option selected="">Type</option><option value="m6A">m6A</option><option value="m5C">m5C</option>' +
    '<option value="m1A">m1A</option><option value="pU">pseudo-U</option><option value="OMe">2-O-Me</option>' +
    '<option value="MRE">MRE</option><option value="RBP">RBP</option><option value="ORF">ORF</option>' +
    '</select><input type="text" class="form-control num-only" placeholder="start" id="modstart">' +
    '<input type="text" class="form-control num-only" placeholder="end" id="modend"><div class="input-group-append">' +
    '<button class="btn btn-outline-secondary modDelete" type="button">-</button></div></div>',
    blankCircHTML = $('#circInput').siblings().addBack('#circInput').slice(0, 4),
    blankGeneHTML = $('#circInput').siblings().addBack('#circInput').slice(5, 7);

// storage of input circRNA and Gene
var circRNAs = {},
    geneList = {},
    CURRENT_STAT, MIN, MAX, RAN;

// setting up Add Button function
var InputBox = [
    ['#exonAdd', '#exon', exonInputHTML, '.exonDelete'],
    ['#modAdd', '#mod', modInputHTML, '.modDelete']
];

for (var i = 0, up = InputBox.length; i < up; i++) {
    var c = InputBox[i];
    $(c[0]).addInputHTML(c[1], c[2], c[3]);
}

// set input restrict
$('.alpha-num-only').alphaNumOnly({
    num: true,
    alpha: true
});
$('.num-only').alphaNumOnly({
    num: true,
    alpha: false
});

$('#addcirc').click(function () {

    var circName = $('#circName').val(),
        circStart = parseInt($('#circStart').val()),
        circEnd = parseInt($('#circEnd').val()),
        replicateCirc = 0;

    for (var v in circRNAs) {
        replicateCirc += (circRNAs[v].start === circStart && circRNAs[v].end === circEnd) ? 1 : 0;
    }

    if (replicateCirc !== 0) {
        $('#addcirc').errorAfter('Replicated input!');
        return;
    }

    var exons = $('#exon').getInput(), // Error handler 1: check if all blanks are filled
        mods = $('#mod').getInput(); // Error handler 1: check if all blanks are filled

    if (exons != undefined) {
        var checkInput = validateInput(exons, mods, circStart, circEnd);
        if (checkInput) {
            if ($('#addcirc').text() == 'Done') {
                $('#addcirc').text('Add circRNA');
            }
            var newCirc = processData(circName, circStart, circEnd, exons, mods),
                id = circName + ':' + circStart + '-' + circEnd;
            circRNAs[id] = newCirc;
            $('#addcirc').addCircList(id);

            $(document.getElementById("delete" + id)).click(function () {
                $(this).parent().remove();
                delete circRNAs[id];
                redraw();
            });

            $(document.getElementById("edit" + id)).click(function () {
                $(this).parent().remove();
                var editCirc = circRNAs[id],
                    editMods = [];
                delete circRNAs[id];
                $('#addcirc').text('Done');

                // fill in the blank and wait for user editing
                $('#circName').val(editCirc.name);
                $('#circStart').val(editCirc.start);
                $('#circEnd').val(editCirc.end);

                for (i = 0; i < editCirc.exons.length; i++) {
                    $('#exon div').siblings('div select')[i].value = editCirc.exons[i].type;
                    setExon = $('#exon div').siblings('div input').slice(i * 3, i * 3 + 3);
                    setExon[0].value = editCirc.exons[i].name;
                    setExon[1].value = editCirc.exons[i].start;
                    setExon[2].value = editCirc.exons[i].end;
                    editMods = editMods.concat(editCirc.exons[i].mods);
                    $('#exonAdd').click();
                }

                for (t = 0; t < editMods.length; t++) {
                    $('#mod div').siblings('div select')[t].value = editMods[t].type;
                    setMod = $('#mod div').siblings('div input').slice(t * 2, t * 2 + 2);
                    setMod[0].value = editMods[t].start;
                    setMod[1].value = editMods[t].end;
                    $('#modAdd').click();
                }

                $('#exon div').siblings('div').slice(-1).remove();
                $('#mod div').siblings('div').slice(-1).remove();
            });

            // set everything back to blank
            $('#exon div').siblings('div').slice(1).remove();
            $('#exon div').children('input').each(function (i, e) {
                e.value = "";
            });
            $('#exon div').children('select').val("exon");

            $('#mod div').siblings('div').slice(1).remove();
            $('#mod div').children('input').each(function (i, e) {
                e.value = "";
            });
            $('#mod div').children('select').val("Type");

            $('#circInput').children('input').each(function (i, e) {
                e.value = "";
            });
            redraw();
        } else {
            return;
        }
    } else {
        return;
    }
});

$('#addgene').click(function () {
    var geneName = $('#geneName').val(),
        geneStart = $('#geneStart').val(),
        geneEnd = $('#geneEnd').val(),
        ifFilled = (geneName != "" && geneStart != "" && geneEnd != ""),
        ifSE = parseInt(geneStart) < parseInt(geneEnd);

    if (ifFilled && ifSE) {
        if ($('#addgene').text() == 'Done') {
            $('#addgene').text('Add Gene');
        }
        var id = geneName + ':' + geneStart + '-' + geneEnd;
        geneList[id] = {
            'name': geneName,
            'start': parseInt(geneStart),
            'end': parseInt(geneEnd),
            'color': colorList[colorIndex]
        };
        colorIndex = colorIndex < colorList.length ? colorIndex + 1 : 0;
        $('#geneName').val("");
        $('#geneStart').val("");
        $('#geneEnd').val("");
        $('#addgene').addGeneList(id);

        $(document.getElementById('edit' + id)).click(function () {
            $(this).parent().remove();
            delete geneList[id];
            if ($('#addgene').text() != 'Done') {
                $('#addgene').text('Done');
                $('#geneName').val(geneName);
                $('#geneStart').val(geneStart);
                $('#geneEnd').val(geneEnd);
            }
        });

        $(document.getElementById('delete' + id)).click(function () {
            $(this).parent().remove();
            delete geneList[id];
            redraw();
        });
        redraw();
    } else {
        if (!ifFilled) {
            $('#addgene').errorAfter('Unfilled blank');
        } else if (!ifSE) {
            $('#addgene').errorAfter('Try start < end');
        }
    }
});