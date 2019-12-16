function denInfoBox(x, y, info) {
    var offset = $('#svg2').position(),
        offsetX = offset.left,
        offsetY = offset.top;
    x = x - offsetX;
    y = y - offsetY;

    if (info === undefined || info === null) {
        return;
    } else {
        var texts = den.paper.g(),
            keys = Object.keys(info),
            addY = 15;

        for (var i = 0, up = keys.length; i < up; i++) {
            key = keys[i];
            text = key + ': ' + info[key];
            texts.add(den.paper.text(x + 10, y + addY, text).attr({
                fill: '#FFFFFF',
                stroke: 'none',
                'font-size': 10,
                // 'font-family': 'arial'
            }));
            addY += 13;
        }

        var textBBox = texts.getBBox(),
            textBottomX = textBBox.x + textBBox.w + 2.5,
            textBottomY = textBBox.y + textBBox.h + 2.5,
            Xoverflow = textBottomX > $('#svg2').attr('width'),
            Yoverflow = textBottomY > $('#svg2').attr('height');
        
        //console.log("overflow:", Xoverflow, Yoverflow)
        
        x = Xoverflow ? x - 2*10 - textBBox.w : x
        y = Yoverflow ? y - 2*textBBox.h : y - textBBox.h

        if (Xoverflow || Yoverflow) {
            texts.remove()
            texts = den.paper.g()
            for (var i = 0, up = keys.length; i < up; i++) {
                key = keys[i];
                text = key + ': ' + info[key];
                texts.add(den.paper.text(x + 10, y + addY, text).attr({
                    fill: '#FFFFFF',
                    stroke: 'none',
                    'font-size': 10,
                    // 'font-family': 'arial'
                }));
                addY += 13;
            }
        };
        textBBox = texts.getBBox();
        var box = den.paper.rect(textBBox.x - 2.5, textBBox.y - 2.5, textBBox.w + 5, textBBox.h + 5).attr({
                fill: '#91989F',
                fillOpacity: 0.7,
                stroke: '#211E55',
                strokeWidth: 0.5,
                strokeOpacity: 0.5
            });
        box.insertBefore(texts);
        return den.group(box, texts);
    }
}

// get index of an array
function getIndex() {
    var from = parseInt($("#js-input-from").text()),
        to = parseInt($("#js-input-to").text()),
        chr = $('#chrSelector').text();

    return densityFilter.findIndex(function (item, i) {
        return item.start === from && item.chr === chr && item.end === to;
    });
}

// draw a block
function chrBlock(y, len, name) {
    var chrBlock = den.paper.rect(50, y, len, 10).attr({
        fill: "#e4e4e2",
        stroke: "#000",
        strokeWidth: 0.5
    });

    var t1 = den.paper.text(20, y + 8, name).attr({
        //'font-family': 'arial',
        'font-size': 10
    });

    return den.group(chrBlock, t1);
}

// normalize density value
function densityBlock(x, y, len, color, info) {
    var infobox,
        denBlock = den.paper.rect(x, y + 0.5, len, 9).attr({
            fill: color,
            stroke: 'none',
            cursor: 'pointer'
        });

    var denBlockBBox = denBlock.getBBox();

    denBlock.mouseover(function (ev, x, y) {
        denBlock.animate({
            transform: 's(1,1.5)' + denBlockBBox.cx + ',' + denBlockBBox.cy
        }, 200).attr({
            fill: '#E83015',
        });
        infobox = denInfoBox(x, y, info);
    }).mouseout(function () {
        denBlock.animate({
            transform: 's(1,1)' + denBlockBBox.cx + ',' + denBlockBBox.cy
        }, 200).attr({
            fill: color,
        });
        infobox.remove();
    }).click(function () {
        denBlock.attr({
            stroke: '#E83015',
            strokeWidth: 1,
        });
        position = info.position.split("-");
        $('#geneNameSelect').val(info.gene);
        $("#js-input-from").text(position[0]);
        $("#js-input-to").text(position[1]);
        $('#chrSelector').text(info.chr);
        $('svg-tips').remove();
        $('geneid').html(info.id);
        
        //console.log(currentClickBlock)
        if (currentClickBlock !== undefined) {
            blockRecord[currentClickBlock].attr({
                stroke: 'none',
            })
        }
        currentClickBlock = info.chr + position[0];
    });

    return denBlock;
}

function drawChrSkeletons(chrSkeleton) {
    //console.log("drawing chr skeleton");
    // calculate the MIN and MAX of chrskeleton
    for (var i = 0, up = chrSkeleton.length; i < up; i++) {
        dMIN = chrSkeleton[i].chrLen >= dMIN ? dMIN : chrSkeleton[i].chrLen;
        dMAX = chrSkeleton[i].chrLen <= dMAX ? dMAX : chrSkeleton[i].chrLen;
    }
    dRAN = dMAX - dMIN;

    //console.log("MIN:", dMIN,
    //    "\nMAX:", dMAX,
    //    "\nRAN:", dRAN);

    // draw chrskeleton
    for (var t = 0; t < up; t++) {
        var len = chrSkeleton[t].chrLen * 135 / dMIN;
        chrBlock(chrSkeletonCordY[t], len, chrSkeleton[t].chr.slice(3));
        chrNameOrder[chrSkeleton[t].chr] = t;
    }
}

function drawDensityBlocks(densityInfo) {
    //console.log(chrNameOrder);
    var densityBlockRecord = {}
    for (var i = 0, up = densityInfo.length; i < up; i++) {
        var chr = densityInfo[i].chr,
            x = (densityInfo[i].start) * 135 / dMIN + 50,
            y = chrSkeletonCordY[chrNameOrder[chr]],
            len = (densityInfo[i].end) * 135 / dMIN + 50 - x + 2,
            index = Math.round((densityInfo[i].count - denBlockMIN)/(denBlockMAX-denBlockMIN))*99
            color = palette[index],
            name = densityInfo[i].name,
            info = {
                //color: [color,index],
                chr: chr,
                position: densityInfo[i].start + "-" + densityInfo[i].end,
                gene: name,
                id: densityInfo[i].geneID,
                type: densityInfo[i].type,
                count: densityInfo[i].count,
            };
        densityBlockRecord[chr+densityInfo[i].start] = densityBlock(x, y, len, color, info);
    }

    return densityBlockRecord
}

function gradientLegend(x, y) {
    for (var i = 0; i < 100; i++) {
        den.paper.rect(x + 2 * i, y, 2, 5).attr({
            fill: palette[i],
            stroke: 'none'
        });
    }
    den.paper.text(x - 10, y + 5, denBlockMIN).attr({
        fill: palette[0],
        stroke: 'none',
        'font-size': 8,
        //'font-family': 'arial'
    });
    den.paper.text(x + 203, y + 5, denBlockMAX).attr({
        fill: palette[99],
        stroke: 'none',
        'font-size': 8,
        //'font-family': 'arial'
    });
}

function denPlot(chrSkeleton, densityInfo, limit) {
    var SVG_WIDTH = parseInt($("#svg2").attr('width')),
        SVG_HEIGHT = parseInt($("#svg2").attr('height'));
    var background = den.paper.rect(0, 0, SVG_WIDTH, SVG_HEIGHT).attr({
        stroke: "none",
        fill: "#fff"
    });
    densityFilter = densityInfo.filter(function (el) {
        if (el.count >= limit) {
            return el;
        }
    });
    var densityDraw = $.extend([], densityFilter);
    densityFilter.sort(function(a,b){
        var comp1 = a.chr.slice(3),
            comp2 = b.chr.slice(3),
            chr_order = {
                X: 100,
                Y: 150,
                M: 200,
            };
        comp1 = ['X','Y','M'].includes(comp1) ? chr_order[comp1] : parseInt(comp1)
        comp2 = ['X','Y','M'].includes(comp2) ? chr_order[comp2] : parseInt(comp2)
        if (comp1 == comp2) {
            return a.start - b.start
        }
        return (comp1 - comp2)
    })
    gradientLegend(550, 20);
    //console.log(densityFilter);
    drawChrSkeletons(chrSkeleton);
    blockRecord = drawDensityBlocks(densityDraw);
}

// Get URL and split to caseID
var url = $(location).attr('href').split("/");
var caseID = url[url.length - 1].split("#")[0];

// handle range slider
var $den = $('#den-selector'),
    denSelector = $den.data("ionRangeSlider");

$den.ionRangeSlider({
    min: 0,
    max: 100,
    from: 0,
    step: 1,
    onFinish: function (data) {
        //console.log('Setting limit at: ', data.from);
        den.clear();
        denPlot(chrSkeleton, densityInfo, data.from);
        $("#previous").removeAttr("disabled");
        $("#next").removeAttr("disabled");
    }
});

// Initiate Density Plot
var den = Snap("#svg2");

var dMIN, dMAX, dRAN, chrSkeleton, densityInfo, densityFilter, blockRecord, currentClickBlock, chrNameOrder = {};

var palette = ['#ffc802',
'#ffc601',
'#ffc300',
'#fdc000',
'#fcbd00',
'#fbbb00',
'#fab800',
'#f9b500',
'#f7b200',
'#f6af00',
'#f5ac00',
'#f4aa00',
'#f3a700',
'#f2a400',
'#f0a100',
'#ef9f00',
'#ee9c00',
'#ed9900',
'#ec9700',
'#ea9400',
'#e99200',
'#e88f00',
'#e78c00',
'#e68a00',
'#e48700',
'#e38500',
'#e28200',
'#e18000',
'#e07e00',
'#de7b00',
'#dd7900',
'#dc7600',
'#db7400',
'#da7200',
'#d86f00',
'#d76d00',
'#d66b00',
'#d56800',
'#d46600',
'#d36400',
'#d16200',
'#d05f00',
'#cf5d00',
'#ce5b00',
'#cd5900',
'#cb5700',
'#ca5500',
'#c95300',
'#c85100',
'#c74e00',
'#c54c00',
'#c44a00',
'#c34800',
'#c24600',
'#c14500',
'#bf4300',
'#be4100',
'#bd3f00',
'#bc3d00',
'#bb3b00',
'#b93900',
'#b83700',
'#b73600',
'#b63400',
'#b53200',
'#b43000',
'#b22f00',
'#b12d00',
'#b02b00',
'#af2900',
'#ae2800',
'#ac2600',
'#ab2500',
'#aa2300',
'#a92100',
'#a82000',
'#a61e00',
'#a51d00',
'#a41b00',
'#a31a00',
'#a21800',
'#a01700',
'#9f1500',
'#9e1400',
'#9d1300',
'#9c1100',
'#9a1000',
'#990f00',
'#980d00',
'#970c00',
'#960b00',
'#950900',
'#930800',
'#920700',
'#910600',
'#900500',
'#8f0300',
'#8d0200',
'#8c0100',
'#8b0000'],
    chrSkeletonCordY = [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500];

var denBlockMIN, denBlockMAX;
// Draw Density Plot
$.getJSON('chrLen/', {
    'case_id': caseID
}).done(function (chrJSON) {
    chrSkeleton = chrJSON;
    $("#svg2").attr('height', 20 * chrSkeleton.length + 60);
    $.getJSON('density/', {
        'case_id': caseID
    }).done(function (densityJSON) {
        densityInfo = densityJSON.slice(1);
        densityInfo.forEach(function(e){
            denBlockMIN = e.count < denBlockMIN || denBlockMIN === undefined ? e.count : denBlockMIN;
            denBlockMAX = e.count > denBlockMAX || denBlockMAX === undefined ? e.count : denBlockMAX;
        });
        //console.log(chrSkeleton);
        //console.log(densityInfo);
        $den.data('ionRangeSlider').update({
            min: denBlockMIN,
            max: denBlockMAX,
            from: Math.round((denBlockMAX-denBlockMIN)*0.05)
        });
        denPlot(chrSkeleton, densityInfo, Math.round((denBlockMAX-denBlockMIN)*0.05));
        blockRecord[Object.keys(blockRecord)[0]].click()
        $("#load").hide();
        var options = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["name"]
        };
    
        var fuse = new Fuse(densityInfo, options);
        $("#geneNameSelect").on("input", function () {
            //console.log('Activate fuse search.')
            var searchText = $(this).val();
            //console.log(searchText);
            var result = fuse.search(searchText),
                html;
            for (var i = 0, up = result.length >= 6 ? 6 : result.length; i < up; i++) {
                html += '<option value="' + result[i].name + '">';
            }
            $(document.querySelector("#genename-list")).html(html);
    
            if ($(this).val() === result[0].name) {
                $("#js-input-from").text(result[0].start);
                $("#js-input-to").text(result[0].end);
                $('#chrSelector').text(result[0].chr);
                $('geneid').html(result[0].geneID);
            }
        });
    });
});

// Changing Density Block
$("#previous").click(function () {
    index = getIndex();
    if (index > 0) {
        blockRecord[densityFilter[index - 1].chr+densityFilter[index - 1].start].click();
        currentClickBlock = $chr.text() + $('#js-input-from').text();
        /* preDen = densityFilter[index - 1];
        $('#geneNameSelect').val(preDen.name);
        $("#js-input-from").text(preDen.start);
        $("#js-input-to").text(preDen.end);
        $('#chrSelector').text(preDen.chr);
        $('geneid').html(preDen.geneID);
        $("#next").removeAttr("disabled"); */
    } else {
        $("#previous").attr("disabled", "");
    }
});

$("#next").click(function () {
    index = getIndex();
    // console.log('Next index:', index);
    if (index < densityFilter.length - 1) {
        blockRecord[densityFilter[index + 1].chr+densityFilter[index + 1].start].click();
        currentClickBlock = $chr.text() + $('#js-input-from').text();
        /*
        $('#geneNameSelect').val(nextDen.name);
        $("#js-input-from").text(nextDen.start);
        $("#js-input-to").text(nextDen.end);
        $('#chrSelector').text(nextDen.chr);
        $('geneid').html(nextDen.geneID);
        $("#previous").removeAttr("disabled"); */
    } else {
        $("#next").attr("disabled", "");
    }
});