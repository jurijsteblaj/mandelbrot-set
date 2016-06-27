var countIterations = function(cX, cY, maxIter) {
    var x = 0;
    var y = 0;
    var iter = 0;
    while (x*x + y*y < 2*2 && iter < maxIter) {
        var prevX = x;
        x = x*x - y*y + cX;
        y = 2*prevX*y + cY;
        iter++;
    }
    return iter;
};

var run = function(data) {
    for (var x = data.drawLimits.x1; x < data.drawLimits.x2; x += data.definitionReduction) {
        data.iters.push([]);
        var cX = data.staticX + x / data.width * (data.endX - data.startX) / data.zoom;
        
        for (var y = data.drawLimits.y1; y < data.drawLimits.y2; y += data.definitionReduction) {
            
            var cY = data.staticY + y / data.height * (data.endY - data.startY) / data.zoom;
            var iter = countIterations(cX, cY, data.maxIter);
            data.iters[(x-data.drawLimits.x1)/data.definitionReduction].push(iter);
        }
    }
};

onmessage = function(e) {
    run(e.data);
    postMessage(e.data);
};
