$("#dendownload").click(function(){
    var filetype = $("#fileType_2").val()
    if (filetype == "SVG") {
        var saveSvgAsSvg = svg.paper.toString(),
            blob = new Blob([saveSvgAsSvg], { type: 'text/plain' })
        $("#download").attr({"href": window.URL.createObjectURL(blob),
                            "download": "circ.svg" })}
  
    else if (filetype == "PNG") {
        var saveSvgAsPng = svg2png(svg)
        $("#download").attr({"href": saveSvgAsPng,
                            "download": "circ.png" })}
    
    else if (filetype == "PDF") {
        var doc = new jsPDF('l', 'mm', [291, 210]),
            imgData = svg2png(svg)
        doc.addImage(imgData, 'PNG', 10, 10, 80, 50);
        doc.save("circ.pdf")
    }
  })

$("#drawdownload").click(function(){
var filetype = $("#fileType_1").val()
if (filetype == "SVG") {
    var saveSvgAsSvg = svg.paper.toString(),
        blob = new Blob([saveSvgAsSvg], { type: 'text/plain' })
    $("#download").attr({"href": window.URL.createObjectURL(blob),
                        "download": "circ.svg" })}

else if (filetype == "PNG") {
    var saveSvgAsPng = svg2png(svg)
    $("#download").attr({"href": saveSvgAsPng,
                        "download": "circ.png" })}

else if (filetype == "PDF") {
    var doc = new jsPDF('l', 'mm', [291, 210]),
        imgData = svg2png(svg)
    doc.addImage(imgData, 'PNG', 10, 10, 80, 50);
    doc.save("circ.pdf")
}
})
  
// svg ---> png
function svg2png(svgCanvas){
    var canvas = document.createElement('canvas')
    $("<canvas></canvas>").hide()
    var context = canvas.getContext('2d');
    canvas.width = 2000;
    canvas.height = 1250;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvg(canvas, svg.paper.toString(), {ignoreDimensions: true, scaleWidth: 2000, scaleHeight: 1250})
    var imgData = canvas.toDataURL('image/png');
    $("<canvas></canvas>").remove()
    return imgData
}