// Declearation of Global Parameters
let getCanvas = document.getElementById("drawCirc");
let ctx = getCanvas.getContext("2d");
getCanvas.width = 500
getCanvas.height = 500
let w = getCanvas.width
let h = getCanvas.height

// Read data to JSON
let circinfo = JSON.parse(document.getElementById('circData').innerHTML)
let t = circinfo[1].start
console.log(typeof t)
// Setting Canvas to fit Retina Screen
ratio = window.devicePixelRatio
getCanvas.width = w * ratio;
getCanvas.height = h * ratio;
getCanvas.style.width = w + 'px';
getCanvas.style.height = h + 'px';
ratioMessage = "devicePixelRatio: " + ratio
console.log(ratioMessage)
w = getCanvas.width
h = getCanvas.height
let lineY = 3*h/5

// altering scale-slider
let max = "2"
let min = "30"
let scaleInput = document.createElement("input")
scaleInput.id = "scale-range"
scaleInput.type = "range"
scaleInput.max = max
scaleInput.min = min
scaleInput.step =  "1"
scaleInput.innerHTML=""

// Drawing Different components on canvas
// Draw a stright line for chromosome
function drawLine(ctx,lineWidth,color)
{
    ctx.beginPath();
    ctx.moveTo(50,lineY);
    ctx.lineTo(w-50,lineY);
    ctx.closePath();
    ctx.lineWidth = lineWidth*ratio;
    ctx.lineStyle = color.toString();
    ctx.stroke();
}
// the start and end of the Arc are relative to the Line!
function drawArc(start,end,lineWidth,color)
{
    let centerX = (start + end)/2
    let centerY = lineY-10*ratio
    let axisX = (end-start)/2
    let axisY = 0.5*axisX
    ctx.beginPath();
    ctx.ellipse(centerX,centerY,axisX,axisY,0,0,1 * Math.PI,true);
    ctx.lineWidth = lineWidth*ratio;
    ctx.strokeStyle = color;
    ctx.stroke();
}

// The rectangle represents the exon/intron on chromosome
function drawRectangle(start,color)
{
    let x = start-(1*ratio)
    ctx.fillStyle = color;
    ctx.fillRect(start,lineY-5*ratio,2*ratio,10*ratio)
}

function drawCirc()
{
    drawLine(ctx, 0.75, "grey")
    for (var i=0;i<3;i++)
    {
        drawArc(circinfo[i].start,circinfo[i].end,0.75,"red");
        drawRectangle(circinfo[i].start, "orange")
        drawRectangle(circinfo[i].end, "green")
    }

    getCanvas.addEventListener('mousemove', function(evt) {
        var rect = getCanvas.getBoundingClientRect();
        var mouseX = evt.clientX - rect.left;
        var mouseY = evt.clientY - rect.top;
        document.getElementById("start").value = mouseX;
        document.getElementById("end").value = mouseY;
      }, false);
}

function mouse_coords()
{
    ctx.canvas.addEventListener('mousemove', function(event){
    var mouseX = event.clientX - ctx.getCanvas.offsetLeft;
    var mouseY = event.clientY - ctx.getCanvas.offsetTop;
    var status = document.getElementById("mouse_cd");
    var canvasX = mouseX * getCanvas.width / getCanvas.clientWidth;
    var canvasY = mouseY * getCanvas.height / getCanvas.clientHeight;
    status.innerHTML = mouseX+" | "+mouseY+"<br>"+canvasX+" | "+canvasY;})
}

// Download from canvas
document.getElementById("download").onclick = function(){
    getCanvas.toBlob(function(blob){
        document.getElementById('download').setAttribute("href", URL.createObjectURL(blob));});
}

$(document).ready(drawCirc())

