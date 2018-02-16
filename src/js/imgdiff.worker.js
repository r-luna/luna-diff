;(function(ns){
	'use strict';
	
	ns.findDiffAreas = function(){
		
        var myWorker = new Worker('js/worker_findDiffAreas.js');
        // imageData, width, height, radius
            myWorker.postMessage([imageData,canvas.width,canvas.height,amount]);
            myWorker.onerror = function(msg,filename,linenum){
                console.warn(msg,filename,linenum);
                canvasPainter.mask.removeMask();
            };
            myWorker.onmessage = function(e){
                if (e.data.complete){
                    
                } else {
                    
                }
            };
		
	}
	
})(this.imgdiff.worker = this.imgdiff.worker || {});