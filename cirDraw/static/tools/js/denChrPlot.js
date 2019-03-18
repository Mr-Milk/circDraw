// Get URL and split to caseid
var url = $(location).attr('href').split("/")
var caseid = url[url.length - 1].split("#")[0]

// Initiate Density Plot
var den = Snap("#svg2");

var background = den.paper.rect(0, 0, 800, 500).attr({
    stroke: "none",
    fill: "#fff"
});

var palette = ['#ff0000',
'#fe0500',
'#fc0a00',
'#fb0f00',
'#fa1400',
'#f91900',
'#f71e00',
'#f62300',
'#f52800',
'#f32c00',
'#f23100',
'#f13600',
'#f03a00',
'#ee3f00',
'#ed4300',
'#ec4700',
'#ea4c00',
'#e95000',
'#e85400',
'#e75900',
'#e55d00',
'#e46100',
'#e36500',
'#e16900',
'#e06d00',
'#df7100',
'#de7400',
'#dc7800',
'#db7c00',
'#da8000',
'#d98300',
'#d78700',
'#d68a00',
'#d58e00',
'#d39100',
'#d29500',
'#d19800',
'#d09b00',
'#ce9e00',
'#cda100',
'#cca500',
'#caa800',
'#c9ab00',
'#c8ae00',
'#c7b000',
'#c5b300',
'#c4b600',
'#c3b900',
'#c1bc00',
'#c0be00',
'#bdbf00',
'#b8be00',
'#b3bc00',
'#aebb00',
'#a9ba00',
'#a4b800',
'#9fb700',
'#9ab600',
'#96b500',
'#91b300',
'#8cb200',
'#88b100',
'#83af00',
'#7fae00',
'#7aad00',
'#76ac00',
'#72aa00',
'#6da900',
'#69a800',
'#65a600',
'#61a500',
'#5da400',
'#59a300',
'#55a100',
'#51a000',
'#4d9f00',
'#499e00',
'#459c00',
'#429b00',
'#3e9a00',
'#3a9800',
'#379700',
'#339600',
'#309500',
'#2d9300',
'#299200',
'#269100',
'#238f00',
'#208e00',
'#1c8d00',
'#198c00',
'#168a00',
'#138900',
'#108800',
'#0e8600',
'#0b8500',
'#088400',
'#058300',
'#038100',
'#008000']
var tipInfo = den.paper.text(700, 30, "Density: ").attr({
    'font-family': 'arial',
    'font-size': 15
})

// Draw Density Plot
var chrMaxLen, denINFO, densityBlock = []
$("#svg2").hide()
$.getJSON('/tools/tools_file4', {
    'case_id': caseid
}).done(function (chrJSON) {

    chrMaxLen = normChr(chrJSON)

    $.getJSON('/tools/tools_file5', {
        'case_id': caseid
    }).done(function (densityJSON) {
        denINFO = normden(densityJSON)
        denPlot(chrMaxLen, densityJSON)
        $("#load").hide()
        $("#svg2").show()
    })

})

// Changing Density Block
$("#previous").click(
    function () {
        index = getIndex()
        if (index > 0) {
            densityBlock[index - 1].click()
            $("#next").removeAttr("disabled")
        } else {
            $("#previous").attr("disabled", "")
        }
    }
)

$("#next").click(
    function () {
        index = getIndex()
        if (index < denINFO.length - 1) {
            densityBlock[index + 1].click()
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
    var from = $("#js-input-from").val(),
        to = $("#js-input-to").val(),
        chr = parseInt($('#chrSelector').text());

    index = denINFO.findIndex(function (item, i) {
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
        arr.push(denJSON[i].density)
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

function density_block(x, y, len, chr, start, end, density_value) {
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
            });
        $("#gene-selector").show()
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
        chr = chr_block(20 + 20 * (i + 1), normChr[i].len, normChr[i].chr)
    }
    return max
};

function denPlot(chrMaxLen, densityJSON) {
    for (i = 0; i < densityJSON.length; i++) {
        densityBlock[i] = "density_block" + i
        var xAxis = 50 + 640 * densityJSON[i].start / chrMaxLen,
            len = 640 * (densityJSON[i].end - densityJSON[i].start) / chrMaxLen

        densityBlock[i] = density_block(xAxis, 20 + 20 * densityJSON[i].chr, len, densityJSON[i].chr, densityJSON[i].start, densityJSON[i].end, densityJSON[i].density)
    }
}
