$("#dendownload").click(function () {
    console.log("Download den")
    var filetype = $("#fileType_2").val();
    console.log(filetype)
    var den = Snap("#svg2");
    if (filetype == "SVG") {
        console.log('dendownload SVG');
        var saveSvgAsSvg = den.paper.toString(),
            blob = new Blob([saveSvgAsSvg], {
                type: 'text/plain'
            });
        console.log(saveSvgAsSvg, blob);
        $("#dendownload").attr({
            "href": window.URL.createObjectURL(blob),
            "download": "circ.svg"
        });
    } else if (filetype == "PNG") {
        //console.log('dendownload PNG');
        var saveSvgAsPng = svg2png(den);
        $("#dendownload").attr({
            "href": saveSvgAsPng,
            "download": "circ.png"
        });
    } else if (filetype == "PDF") {
        //console.log('dendownload PDF');
        var doc = new jsPDF('l', 'mm', [291, 210]),
            imgData = svg2png(den);
        doc.addImage(imgData, 'PNG', 10, 10, 80, 50);
        doc.save("circ.pdf");
    }

    //$("#dendownload").attr({
    //    "href": "",
    //    "download": ""
    //});

    //$('#svg2').append(c);
});

$("#drawdownload").click(function () {
    var filetype = $("#fileType_1").val();
    var svg = Snap("#svg");
    if (filetype == "SVG") {
        var saveSvgAsSvg = svg.paper.toString(),
            blob = new Blob([saveSvgAsSvg], {
                type: 'text/plain'
            });
        $("#drawdownload").attr({
            "href": window.URL.createObjectURL(blob),
            "download": "circ.svg"
        });
    } else if (filetype == "PNG") {
        var saveSvgAsPng = svg2png(svg);
        $("#drawdownload").attr({
            "href": saveSvgAsPng,
            "download": "circ.png"
        });
    } else if (filetype == "PDF") {
        var doc = new jsPDF('l', 'mm', [291, 210]),
            imgData = svg2png(svg);
        doc.addImage(imgData, 'PNG', 10, 10, 80, 50);
        doc.save("circ.pdf");
    }
});

// svg ---> png
function svg2png(svgCanvas) {
    var canvas = document.createElement('canvas');
    $("<canvas></canvas>").hide();
    var context = canvas.getContext('2d');
    canvas.width = 2000;
    canvas.height = 1250;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvg(canvas, svgCanvas.paper.toString(), {
        ignoreDimensions: true,
        scaleWidth: 2000,
        scaleHeight: 1250
    });
    var imgData = canvas.toDataURL('image/png');
    $("<canvas></canvas>").remove();
    return imgData;
}

function pdfReport() {
    var img1 = $("#lenChart").getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
    });
    var img2 = $("#exonChart").getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
    });
    var img3 = $("#isoChart").getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
    });

    var report = new jsPDF('p', 'mm', [291, 210]);
    report.setFontSize(16);
    report.text(20, 20, "CircRNA Report");
}