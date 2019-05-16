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
                'font-size': 10,
                'font-family': 'arial'
            }));
            addY += 13;
        }

        var textBBox = texts.getBBox(),
            box = den.paper.rect(textBBox.x - 2.5, textBBox.y - 2.5, textBBox.w + 5, textBBox.h + 5).attr({
                fill: '#fed136',
                fillOpacity: 0.5,
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
        'font-family': 'arial',
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
        }, 200);
        infobox = denInfoBox(x, y, info);
    }).mouseout(function () {
        denBlock.animate({
            transform: 's(1,1)' + denBlockBBox.cx + ',' + denBlockBBox.cy
        }, 200);
        infobox.remove();
    }).click(function () {
        position = info.position.split("-");
        $("#js-input-from").text(position[0]);
        $("#js-input-to").text(position[1]);
        $('#chrSelector').text(info.chr);
        $('#geneNameSelect').val(info.gene);
        $('svg-tips').remove();
    });

    return denBlock;
}

function drawChrSkeletons(chrSkeleton) {
    console.log("drawing chr skeleton");
    // calculate the MIN and MAX of chrskeleton
    for (var i = 0, up = chrSkeleton.length; i < up; i++) {
        dMIN = chrSkeleton[i].chrLen >= dMIN ? dMIN : chrSkeleton[i].chrLen;
        dMAX = chrSkeleton[i].chrLen <= dMAX ? dMAX : chrSkeleton[i].chrLen;
    }
    dRAN = dMAX - dMIN;

    console.log("MIN:", dMIN,
        "\nMAX:", dMAX,
        "\nRAN:", dRAN);

    // draw chrskeleton
    for (var t = 0; t < up; t++) {
        var len = (chrSkeleton[t].chrLen - dMIN) / dRAN * 640 + 60;
        chrBlock(chrSkeletonCordY[t], len, chrSkeleton[t].chr.slice(3));
        chrNameOrder[chrSkeleton[t].chr] = t;
    }
}

function drawDensityBlocks(densityInfo) {
    console.log(chrNameOrder);
    for (var i = 0, up = densityInfo.length; i < up; i++) {
        var chr = densityInfo[i].chr,
            x = (densityInfo[i].start) / dMAX * 700 + 50,
            y = chrSkeletonCordY[chrNameOrder[chr]],
            len = (densityInfo[i].end) / dMAX * 700 + 50 - x + 2,
            color = palette[densityInfo[i].density - 1],
            name = densityInfo[i].name,
            info = {
                chr: chr,
                position: densityInfo[i].start + "-" + densityInfo[i].end,
                gene: name,
                density: densityInfo[i].density
            };
        console.log("chr:", chrNameOrder[chr], y, x);
        densityBlock(x, y, len, color, info);
    }
}

function gradientLegend(x, y) {
    for (var i = 0; i < 100; i++) {
        den.paper.rect(x + 2 * i, y, 2, 5).attr({
            fill: palette[i],
            stroke: 'none'
        });
    }
    den.paper.text(x - 10, y + 5, '1').attr({
        fill: palette[0],
        stroke: 'none',
        'font-size': 8,
        'font-family': 'arial'
    });
    den.paper.text(x + 203, y + 5, '100').attr({
        fill: palette[99],
        stroke: 'none',
        'font-size': 8,
        'font-family': 'arial'
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
            if (el.density > limit) {
                return el;
            }
        });
    gradientLegend(550, 20);
    console.log(densityFilter);
    drawChrSkeletons(chrSkeleton);
    drawDensityBlocks(densityFilter);
}

function print(text) {
    console.log(text);
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
        console.log('Setting limit at: ', data.from);
        den.clear();
        denPlot(chrSkeleton, densityInfo, data.from);
    }
});

// Initiate Density Plot
var den = Snap("#svg2");

var dMIN, dMAX, dRAN, chrSkeleton, densityInfo, densityFilter, chrNameOrder = {};

var palette = ['#f75c2f',
        '#f7612e',
        '#f6662d',
        '#f66b2d',
        '#f5702c',
        '#f5752b',
        '#f47a2a',
        '#f47f2a',
        '#f38429',
        '#f38928',
        '#f28e27',
        '#f29327',
        '#f19826',
        '#f19d25',
        '#f0a225',
        '#f0a724',
        '#efac23',
        '#efb122',
        '#eeb622',
        '#eebb21',
        '#edc020',
        '#edc620',
        '#eccb1f',
        '#ecd01e',
        '#ebd51e',
        '#eada1d',
        '#eadf1c',
        '#e9e41c',
        '#e8e91b',
        '#e2e81a',
        '#dbe81a',
        '#d5e719',
        '#cfe618',
        '#c8e519',
        '#c1e319',
        '#bae21a',
        '#b3e01a',
        '#addf1a',
        '#a6dd1b',
        '#a0db1b',
        '#99da1b',
        '#93d81b',
        '#8dd71c',
        '#87d51c',
        '#81d41c',
        '#7cd21d',
        '#76d11d',
        '#70cf1d',
        '#6bce1e',
        '#66cc1e',
        '#60cb1e',
        '#5bc91e',
        '#56c81f',
        '#51c61f',
        '#4cc51f',
        '#48c31f',
        '#43c220',
        '#3ec020',
        '#3abf20',
        '#35be20',
        '#31bc21',
        '#2dbb21',
        '#29b921',
        '#25b821',
        '#21b622',
        '#22b527',
        '#22b32b',
        '#22b22f',
        '#22b133',
        '#22af37',
        '#23ae3b',
        '#23ac3e',
        '#23ab42',
        '#23aa46',
        '#23a849',
        '#23a74c',
        '#24a550',
        '#24a453',
        '#24a356',
        '#24a159',
        '#24a05c',
        '#249f5f',
        '#249d62',
        '#259c64',
        '#259b67',
        '#25996a',
        '#25986c',
        '#25976e',
        '#259571',
        '#259473',
        '#259375',
        '#259177',
        '#269079',
        '#268f7b',
        '#268d7d',
        '#268c7f',
        '#268b80',
        '#268a82',
        '#268884',
        '#268785'
    ],
    chrSkeletonCordY = [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500];

// Draw Density Plot
$("#svg2").hide();
$.getJSON('tools/file2/', {
    'case_id': caseID
}).done(function (chrJSON) {
    chrSkeleton = chrJSON;
    $("#svg2").height(20 * chrSkeleton.length + 40);
    $.getJSON('https://my-json-server.typicode.com/Mr-Milk/circDraw-api/densityplot'/* , {
        'case_id': caseID
    } */).done(function (densityJSON) {
        densityInfo = densityJSON;
        console.log(chrSkeleton);
        console.log(densityInfo);
        denPlot(chrSkeleton, densityInfo, 0);
        $("#load").hide();
        $("#svg2").show();
        var options = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["name"]
          };
        var fuse = new Fuse(densityInfo, options); // "list" is the item array
        $("#geneNameSelect").on("propertychange change click keyup input paste", function(){
            var searchText = $(this).val(),
                result = fuse.search(searchText),
                html;
            for (var i=0, up=result.length; i<up ;i++){
                html += '<option value="' + result[i].name + '">';
            }
            $(document.querySelector("#genename-list")).html(html);

            if (result.length === 1 && $(this).val() === result[0].name){
                $("#js-input-from").text(result[0].start);
                $("#js-input-to").text(result[0].end);
                $('#chrSelector').text(result[0].chr);
            }
            });
        });

        //$("#next").click() // enable this will load the first gene to isoform plot automatically after page loading.
        /* var linkIcon = function(cell, formatterParams){ //plain text value
            return "<i class='fas fa-link'></i>";};
        var table = new Tabulator("#table", {
            height:"500px",
            layout:"fitColumns",
            headerFilterPlaceholder:"Search",
            placeholder: "No Data Available",
            columns:[
                {title:"Exon", field:"exon", width: 100, headerFilter:"input"},
                {title:"Type", field:"type", width: 100, editor:"select", editorParams:{values:{"m6A":"m6A", "m1A":"m1A", "m5C":"m5C"}}, headerFilter:true, headerFilterParams:{values:{"m6A":"m6A", "m1A":"m1A", "m5C":"m5C", "":""}}},
                {title:"Start", field:"start", width: 140, headerFilter: true},
                {title:"End", field:"end", width: 140, headerFilter: true},
                {title:"SNP ID", field:"SNP_id", width: 140, headerFilter: true},
                {title:"Disease", field:"disease", width: 180, headerFilter: true},
                {title:"Link", field:"link", width:150, formatter:linkIcon, cellClick:function(){window.open('http://' + link, '_blank')}},
            ],
        }); */
});

// Changing Density Block
$("#previous").click(function () {
    index = getIndex();
    if (index > 0) {
        preDen = densityFilter[index - 1];
        $("#js-input-from").text(preDen.start);
        $("#js-input-to").text(preDen.end);
        $('#chrSelector').text(preDen.chr);
        $('#geneNameSelect').val(preDen.name);
        $("#next").removeAttr("disabled");
    } else {
        $("#previous").attr("disabled", "");
    }
});

$("#next").click(function () {
    index = getIndex();
    console.log('Next index:', index);
    if (index < densityFilter.length - 1) {
        nextDen = densityFilter[index + 1];
        $("#js-input-from").text(nextDen.start);
        $("#js-input-to").text(nextDen.end);
        $('#chrSelector').text(nextDen.chr);
        $('#geneNameSelect').val(nextDen.name);
        $("#previous").removeAttr("disabled");
    } else {
        $("#next").attr("disabled", "");
    }
});