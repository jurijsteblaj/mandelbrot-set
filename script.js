var startY = -1.5;
var endY = 1.5;
var xOffset = 0;
var drawWorker = new Worker("drawWorker.js");


var imageCenter = function() {
    return [(startX + endX)/2, (startY + endY)/2];
};

var widthToHeight = function() {
    var canvas = document.querySelector('#canvas');
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    
    return widthToHeight = width / height;
};

window.onload = function() {
    document.querySelector('#draw-button').onclick = function() {
        drawMandelbrot();
    };
    var arrows = document.querySelectorAll('svg polygon');
    for (var i = 0; i < arrows.length; i++) {
        arrows[i].onclick = pan;
    }
    document.querySelector('#zoom-in').onclick = zoomIn;
    document.querySelector('#zoom-out').onclick = zoomOut;
    
    drawMandelbrot();
};

var createPalette = function(maxIter) {
    var palette = [];
    for (var i = 0; i < maxIter; i++) {
        palette.push((0x010101 * i * Math.floor(0xFF/maxIter)).toString(16));
        
        for (var j = palette[i].length; j < 6; j++)
            palette[i] = "0" + palette[i];
        palette[i] = "#" + palette[i];
    }
    
    return palette;
};

var drawMandelbrot = function(drawLimits, dontSetSize) {
    var canvas = document.querySelector('#canvas');
    var maxIter = parseInt(document.querySelector('#max-iter').value);
    var definitionReduction = parseInt(document.querySelector('#definition-reduction').value);
    var zoom = parseFloat(document.querySelector('#zoom').value);
    
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (typeof dontSetSize === "undefined" || !dontSetSize) {
        canvas.width = width;
        canvas.height = height;
    }
    
    if (typeof drawLimits === "undefined")
        drawLimits = new Object();
    if (typeof drawLimits.x1 === "undefined")
        drawLimits.x1 = 0;
    if (typeof drawLimits.x2 === "undefined")
        drawLimits.x2 = width;
    if (typeof drawLimits.y1 === "undefined")
        drawLimits.y1 = 0;
    if (typeof drawLimits.y2 === "undefined")
        drawLimits.y2 = height;

    var ctx = canvas.getContext('2d');
    
    var palette = createPalette(maxIter);
    
    var startX = - (endY - startY) * width/height/2 + xOffset;
    var endX = (endY - startY) * width/height/2 + xOffset;
    
    var staticX = (endX - startX)/2 * (1 - 1/zoom) + startX;
    var staticY = (endY - startY)/2 * (1 - 1/zoom) - endY;
    
    var data = {};
    data.width = width;
    data.height = height;
    data.iters = [];
    data.startX = startX;
    data.endX = endX;
    data.startY = startY;
    data.endY = endY;
    data.zoom = zoom;
    data.drawLimits = drawLimits;
    data.staticX = staticX;
    data.staticY = staticY;
    data.definitionReduction = definitionReduction;
    data.palette = palette;
    data.maxIter = maxIter;
    
    drawWorker.postMessage(data);
};

drawWorker.onmessage = function(e) {
    var ctx = canvas.getContext('2d');
    
    var data = e.data;
    
    for (var x = data.drawLimits.x1; x < data.drawLimits.x2; x += data.definitionReduction) {
        
        for (var y = data.drawLimits.y1; y < data.drawLimits.y2; y += data.definitionReduction) {
            var iter = e.data.iters[(x-data.drawLimits.x1)/data.definitionReduction][(y-data.drawLimits.y1)/data.definitionReduction];
            ctx.fillStyle = data.palette[iter - 1];
            ctx.fillRect(x, y, data.definitionReduction, data.definitionReduction);
        }
    }
};

var pan = function() {
    var panRate = parseFloat(document.querySelector("#pan-rate").value);
    var direction = this.id;
    var zoom = parseFloat(document.querySelector('#zoom').value);
    var panAmount = panRate * (endY - startY) / zoom;
    var canvas = document.querySelector('#canvas');
    var panPixelCount = Math.floor(panRate * canvas.height);
    
    var drawLimits = new Object();
    var ctx = canvas.getContext('2d');
    
    if (direction === "up-arrow") {
        startY += panAmount;
        endY += panAmount;
        
        if (panRate < 1) {
            var pasteData = ctx.getImageData(0,0,canvas.width,canvas.height-panPixelCount);
            ctx.putImageData(pasteData, 0, panPixelCount);
            drawLimits.y2 = panPixelCount;
        }
    }
    else if (direction === "right-arrow") {
        xOffset += panAmount;
        
        if (panRate < 1) {
            var pasteData = ctx.getImageData(panPixelCount,0,canvas.width-panPixelCount,canvas.height);
            ctx.putImageData(pasteData, 0, 0);
            drawLimits.x1 = canvas.width - panPixelCount;
        }
    }
    else if (direction === "down-arrow") {
        startY -= panAmount;
        endY -= panAmount;
        
        if (panRate < 1) {
            var pasteData = ctx.getImageData(0,panPixelCount,canvas.width,canvas.height-panPixelCount);
            ctx.putImageData(pasteData, 0, 0);
            drawLimits.y1 = canvas.height - panPixelCount;
        }
    }
    else if (direction === "left-arrow") {
        xOffset -= panAmount;
        
        if (panRate < 1) {
            var pasteData = ctx.getImageData(0,0,canvas.width-panPixelCount,canvas.height);
            ctx.putImageData(pasteData, panPixelCount, 0);
            drawLimits.x2 = panPixelCount;
        }
    }
    
    drawMandelbrot(drawLimits, true);
};

var zoomIn = function() {
    var zoom = document.querySelector('#zoom');
    zoom.value = parseFloat(zoom.value) * 2;
    drawMandelbrot();
};

var zoomOut = function() {
    var zoom = document.querySelector('#zoom');
    zoom.value = parseFloat(zoom.value) / 2;
    drawMandelbrot();
};
