// Get URL and split to caseid
var url = $(location).attr('href').split("/")
var caseid = url[url.length - 1].split("#")[0]


// handle range slider
var $den = $('#den-selector'),
    denSelector = $den.data("ionRangeSlider");

$den.ionRangeSlider({
    min: 0,
    max: 100,
    from: 0,
    step: 1,
    onFinish: function(data){
        denLimit = data.from
        console.log('Setting limit at: ', denLimit)
        den.clear()
        background = den.paper.rect(0, 0, 800, 500).attr({
            stroke: "none",
            fill: "#fff"
        });
        tipInfo = den.paper.text(700, 30, "Density: ").attr({
            'font-family': 'arial',
            'font-size': 15
        })
        chrMaxLen = normChr(chrSkeleton)
        denPlot(chrMaxLen, denINFO, denLimit)
    }
});

// Initiate Density Plot
var den = Snap("#svg2");

var background = den.paper.rect(0, 0, 800, 500).attr({
    stroke: "none",
    fill: "#fff"
});

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
'#268785']
var tipInfo = den.paper.text(700, 30, "Density: ").attr({
    'font-family': 'arial',
    'font-size': 15
})

// Draw Density Plot
var chrMaxLen, denINFO, densityBlock = [], denLimit = 0, chrSkeleton, species, filterBlock = []
$("#svg2").hide()
$.getJSON('/tools/tools_file4', {
    'case_id': caseid
}).done(function (chrJSON) {
    chrSkeleton = chrJSON

    chrMaxLen = normChr(chrJSON)

    $.getJSON('/tools/tools_file5', {
        'case_id': caseid
    }).done(function (densityJSON) {
        denINFO = densityJSON
        species = denINFO[0].species
        console.log('denINFO: ', denINFO)
        console.log('Species: ', denINFO[0].species)
        denPlot(chrMaxLen, densityJSON, denLimit)
        $("#load").hide()
        $("#svg2").show()
        //$("#next").click() // enable this will load the first gene to isoform plot automatically after page loading.
        var linkIcon = function(cell, formatterParams){ //plain text value
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
        });
    })

})

// Changing Density Block
$("#previous").click(
    function () {
        index = getIndex()
        if (index > 0) {
            p_den = filterBlock[index-1]
            p_start = p_den.start
            p_end = p_den.end
            p_chr = p_den.chr
            p_name = p_den.name
            $("#js-input-from").text(p_start);
            $("#js-input-to").text(p_end);
            $('#chrSelector').text(p_chr);
            $('#geneNameSelect').text(p_name);

            $("#next").removeAttr("disabled")
        } else {
            $("#previous").attr("disabled", "")
        }
    }
)

$("#next").click(
    function () {
        index = getIndex()
        console.log('Next index:', index)
        if (index < filterBlock.length - 1) {
            n_den = filterBlock[index+1]
            n_start = n_den.start
            n_end = n_den.end
            n_chr = n_den.chr
            n_name = n_den.name
            $("#js-input-from").text(n_start);
            $("#js-input-to").text(n_end);
            $('#chrSelector').text(n_chr);
            $('#geneNameSelect').text(n_name);

            $("#previous").removeAttr("disabled")
        } else {
            $("#next").attr("disabled", "")
        }
    }
)
/*
$("#dendownload").click(function () {
    var saveSvgAsSvg = svg2.paper.toString(),
        blob = new Blob([saveSvgAsSvg], {
            type: 'text/plain'
        })
    $("#dendownload").attr("href", window.URL.createObjectURL(blob))
})*/

// get index of an array
function getIndex() {
    var from = parseInt($("#js-input-from").text()),
        to = parseInt($("#js-input-to").text()),
        chr = parseInt($('#chrSelector').text());

    index = filterBlock.findIndex(function (item, i) {
        return item.start === from && item.chr === chr && item.end === to
    })

    return index
}

// draw a block
function chr_block(y, len, name) {
    var chr_block = den.paper.rect(50, y, len, 10).attr({
        fill: "#e4e4e2",
        stroke: "#000",
        strokeWidth: 0.5
    })

    var t1 = den.paper.text(20, y + 8, name).attr({
        'font-family': 'arial',
        'font-size': 10
    })

    return chr_block, t1

}

// normalize density value
function getMinMax(denJSON) {
    var arr = []
    for (i = 0; i < denJSON.length; i++) {
        arr.push(denJSON[i].value)
    }

    max = Math.max.apply(null, arr)
    min = Math.min.apply(null, arr)

    mm = [min, max, max - min]

    return mm
}

function normden(denJSON) {
    mm = getMinMax(denJSON)
    min = mm[0]
    max = mm[1]
    range = mm[2]
    for (x in denJSON) {
        x.scaleDen = 100 * (x.density_value - min) / range
    }

    return denJSON
}

function density_block(x, y, len, chr, start, end, density_value, name) {
    var fillColor = palette[Math.round(density_value - 1)]
    var denBlock = den.paper.rect(x, y + 0.3, len + 1, 9.5).attr({
        fill: fillColor,
        stroke: 'none',
        cursor: 'pointer'
    }).mouseover(function () {
        den_value = den.paper.text(755, 30, density_value).attr({
            'font-family': 'arial',
            'font-size': 15,
            fill: 'orange',
        })
        pText = "chr" + chr + ": " + start + " - " + end
        position = den.paper.text(325, 30, pText).attr({
            'font-family': 'arial',
            'font-size': 15,
        })
        denBlock.attr({
            fill: fillColor,
            stroke: '#E83015',
            strokeWidth: 1.5,
            cursor: 'pointer'
        })
    }).mouseout(function () {
        den_value.remove()
        position.remove()
        denBlock.attr({
            fill: fillColor,
            stroke: 'none',
            cursor: 'pointer'
        })
    }).click(function () {
        $("#js-input-from").text(start);
        $("#js-input-to").text(end);
        $('#chrSelector').text(chr);
        $('#geneNameSelect').text(name);
        $('svg-tips').remove()
        /*
        var gene_selector = $("#gene-selector").data("ionRangeSlider");
        $.getJSON("genList/", {
                "caseid": caseid,
                "start": start,
                "end": end,
                "chr": chr
            })
            .done(function (geneList) {
                console.log('Get genelist: ', geneList)
                var geneValues = []
                for (i=0;i<geneList.length;i++) {
                    geneValues.push(geneList[i].name)
                }
                console.log(geneValues)
                gene_selector.update({
                    values: geneValues,
                    from:0,
                    to: geneValues.length
                })
            });*/
    })

    return denBlock
}

function normChr(chrJSON) {
    var max = 0,
        normChr = []
    for (i = 0; i < chrJSON.length; i++) {
        if (chrJSON[i].chrLen > max) {
            max = chrJSON[i].chrLen
        };
    };

    for (i = 0; i < chrJSON.length; i++) {
        normChr.push({
            "chr": chrJSON[i].chr,
            "len": 640 * chrJSON[i].chrLen / max
        })
    }

    var len = normChr.length
    var svgHeight = 60 + len * 20
    $("#svg2").attr("height", svgHeight)
    for (i = 0; i < normChr.length; i++) {
        var chrSkeName = normChr[i].chr
        if (parseInt(chrSkeName) === 23){
            chrSkeName = ' X'
        }
        else if (parseInt(chrSkeName) === 24){
            chrSkeName = ' Y'
        }
        else if (parseInt(chrSkeName) === 25){
            chrSkeName = ' M'
        }
        chr = chr_block(20 + 20 * (i + 1), normChr[i].len, chrSkeName)
    }
    return max
};

function denPlot(chrMaxLen, densityJSON, denLimit) {
    filterBlock = []
    for (i = 0; i < densityJSON.length; i++) {
        if (densityJSON[i].value >= denLimit) {
        var xAxis = 50 + 640 * densityJSON[i].start / chrMaxLen,
            len = 640 * (densityJSON[i].end - densityJSON[i].start) / chrMaxLen
        filterBlock.push(densityJSON[i])
        density_block(xAxis, 20 + 20 * densityJSON[i].chr, len, densityJSON[i].chr, densityJSON[i].start, densityJSON[i].end, densityJSON[i].value, densityJSON[i].name)
    }
}
}
