;(function(ns){
	'use strict';
    /* global document, Promise, Image, performance */
	// Adapted from www.rickluna.com/wp/2016/09/diffing-two-canvases/

	var _img1, _img2, _cvs1, _cvs2, _ctx1, _ctx2;

	var _proximity = 13;
	var _color = '#ff00ff';
    var _diffThreshold = 5;
    var _drawBoundingBoxes = false;
    var _ctx1Alpha = 0.1;
    var _ctx2Alpha = 0.5;
	
	function _loadImage(path){
		return new Promise(function(resolve,reject){
			var img = new Image();
			img.onload = function(){
				resolve(this);
			};
			img.onerror = function(e){
				reject(e);
			};
			img.src = path;
		});
	}
	
	function _findDiffAreas(diffs){
		// Hold the array of diff area arrays, themselves containing coordinate objects
		var diffAreas = [];
		var proxPadding = _proximity;
		var hit = false;
		
		// populate diffAreas with initial diffAreas array and diffs object
		diffAreas.push([diffs[0]]);
		// remove the diffs object that we just added to the above so that it doesnt get added again....
		diffs.splice(0,1);
		
		// loop through the diffs array to create "diff areas" that contain proximity-related pixels (diff objects)
		while (diffs.length !== 0){
			// loop through diffAreas which was previously seeded with the first diffs object within a "diff area" array
			for (var i=0;i<diffAreas.length;i++){
				// Loop through the array of diff areas
				for (var j=0;j<diffAreas[i].length;j++){
					// loop through the specific "diff area"'s array of diff objects
					// See if the diff object's x coordinate is within proximity of the compared-to object's x
					if ( Math.abs(diffs[0].x - diffAreas[i][j].x) <= proxPadding ){
						// is the diff object within y proximity?
						if ( Math.abs(diffs[0].y - diffAreas[i][j].y) <= proxPadding ){
							// the diff object is within both x and y proximity
							// add the diff object...
							diffAreas[i].push(diffs[0]);
							// clean up
							diffs.splice(0,1);
							// tell the parent loop that we had a hit
							hit = true;
							break;
						}
					} else 
					// same as above, but check for y proximity first
					if ( Math.abs(diffs[0].y - diffAreas[i][j].y) <= proxPadding ){
						if ( Math.abs(diffs[0].x - diffAreas[i][j].x) <= proxPadding ){
							diffAreas[i].push(diffs[0]);
							diffs.splice(0,1);
							hit = true;
							break;
						}
					}
				}
				if (diffs.length === 0){
					break;
				}
			}
			if (!hit){
				// we didnt have a hit so create a new array in diffAreas with the current diff object
				diffAreas.push([diffs[0]]);
				// clean up
				diffs.splice(0,1);
			}
			// reset
			hit = false;
		}
		return diffAreas;
	}
	
	function _drawOnPixels(diffs){
		// draw on top of the different pixels
		for (var i=0;i<diffs.length;i++){
			//_ctx1.globalCompositeOperation = 'color';
			_ctx1.globalAlpha = _ctx1Alpha;
			_ctx1.fillStyle = _color;//'#23cd12';
			_ctx1.fillRect(diffs[i].x-1,diffs[i].y-1,2,2);
			
			//_ctx2.globalCompositeOperation = 'color';
			_ctx2.globalAlpha = _ctx2Alpha;
			_ctx2.fillStyle = _color;//'#ff0000';
			_ctx2.fillRect(diffs[i].x-0.5,diffs[i].y-0.5,0.5,0.5);
		}
	}
	
	function _findDiffPixels(imageData1,imageData2){
		var w = imageData1.width;
		var h = imageData1.height;
		var diffs = [];
		var pA1_r,pA1_g,pA1_b,pA1_a,
			pA2_r,pA2_g,pA2_b,pA2_a;
		var y = 0;
		var x = 0;
		var len = imageData1.data.length;
		
		for (var i=0;i<len;i+=4){
			if ( !!((i/4) % w) ){
				x++;
			} else {
				x = 0;
				y++;
			}
			pA1_r = imageData1.data[i];
			pA1_g = imageData1.data[i+1];
			pA1_b = imageData1.data[i+2];
			pA1_a = imageData1.data[i+3];

			pA2_r = imageData2.data[i];
			pA2_g = imageData2.data[i+1];
			pA2_b = imageData2.data[i+2];
			pA2_a = imageData2.data[i+3];

			// compare reds
			if (Math.abs(pA1_r - pA2_r) > _diffThreshold){
				diffs.push({x:x,y:y});
			} else
			// compare greens
			if (Math.abs(pA1_g - pA2_g) > _diffThreshold){
				diffs.push({x:x,y:y});
			} else
			// compare blues
			if (Math.abs(pA1_b - pA2_b) > _diffThreshold){
				diffs.push({x:x,y:y});
			} else
			// compare alphas
			if (Math.abs(pA1_a - pA2_a) > _diffThreshold){
				diffs.push({x:x,y:y});
			}
		}
		return diffs;
	}
	
	function _drawDiffAreas(diffAreas){
		var start = {x:null,y:null};
		var end   = {x:null,y:null};
		var padding = 5;
		// loop through the diff areas
		for (var j=0;j<diffAreas.length;j++){	
			diffAreas[j].sort(function(a,b){
				if (a.x < b.x){
					return -1;
				} else if (a.x > b.x){
					return 1;
				} else {
					return 0;
				}
			});
			start.x = diffAreas[j][0].x || 0;
			end.x   = diffAreas[j][diffAreas[j].length-1].x;
			
			diffAreas[j].sort(function(a,b){
				if (a.y < b.y){
					return -1;
				} else if (a.y > b.y){
					return 1;
				} else {
					return 0;
				}
			});
			start.y = diffAreas[j][0].y || 0;
			end.y   = diffAreas[j][diffAreas[j].length-1].y;

			// DONE
			// start and end have the bounding coordinates
			
			// draw area onto the source canvas
			_ctx1.globalAlpha = 1;
			_ctx1.strokeStyle = '#ff0000';
			_ctx1.lineWidth = 1;
			_ctx1.beginPath();
			_ctx1.moveTo(start.x - padding,start.y - padding);
			_ctx1.lineTo(end.x + padding,start.y - padding);
			_ctx1.lineTo(end.x + padding,end.y + padding);
			_ctx1.lineTo(start.x - padding,end.y + padding);
			_ctx1.closePath();
			_ctx1.stroke();
					
			// draw area onto the changed canvas
			_ctx2.globalAlpha = 1;
			_ctx2.strokeStyle = '#ff0000';
			_ctx2.lineWidth = 1;
			_ctx2.beginPath();
			_ctx2.moveTo(start.x - padding,start.y - padding);
			_ctx2.lineTo(end.x + padding,start.y - padding);
			_ctx2.lineTo(end.x + padding,end.y + padding);
			_ctx2.lineTo(start.x - padding,end.y + padding);
			_ctx2.closePath();
			_ctx2.stroke();
		}
	}
	
	ns.init = function(img1path,img2path,cb,options){
        /*
        var options = 
            {
                prox:qwe,
                color:qwe,
                diffThreshold:qwe,
                drawBoundingBoxFlag:qwe,
                ctx1Alpha:0.5,
                ctx2Alpha:05
            };
		*/
        var start = performance.now();
		var end = null;
		_cvs1 = document.createElement('canvas');
		_cvs2 = document.createElement('canvas');
		_ctx1 = _cvs1.getContext('2d');
		_ctx2 = _cvs2.getContext('2d');
		_proximity = options.prox || _proximity;
		_color = options.color || _color;
        _diffThreshold = options.diffThreshold || _diffThreshold;
        _drawBoundingBoxes = options.drawBoundingBoxFlag || _drawBoundingBoxes;
        _ctx1Alpha = options.ctx1Alpha || _ctx1Alpha;
        _ctx2Alpha = options.ctx2Alpha || _ctx2Alpha;
		
		//document.getElementsByTagName('body')[0].appendChild(_cvs1);
		//document.getElementsByTagName('body')[0].appendChild(_cvs2);
		
		// load the images for measurement purposes
		_loadImage(img1path).then(function(response){
			_img1 = response; // save the loaded image in memory, we will need it later to load into our canvas
			return _loadImage(img2path);
		}) //
		.then(function(response){
			_img2 = response; // save the loaded image in memory, we will need it later to load into our canvas
		})
		.then(function(){
			end = performance.now();
			if (_img1.width !== _img2.width){
				cb({
					img1 :{
						height:_img1.height,
						width:_img1.width
					},
					img2 :{
						height:_img2.height,
						width:_img2.width
					},
					proximitySetting: _proximity,
					diffQuan: null,
					executionTime: (end - start),
					err: 'images are of unequal width'
				});
				return;
			}
			
			var diffs = null;
			var diffAreas = null;
			// set canvas dimensions
			_cvs1.setAttribute('height',_img1.height);
			_cvs1.setAttribute('width',_img1.width);
			_cvs2.setAttribute('height',_img2.height);
			_cvs2.setAttribute('width',_img2.width);
			
			_ctx1.drawImage(_img1,0,0,_img1.width,_img1.height); // insert images into canvases
			_ctx2.drawImage(_img2,0,0,_img2.width,_img2.height);
			
			diffs = _findDiffPixels( // diff the canvases
				_ctx1.getImageData(0,0,_cvs1.width,_cvs1.height),
				_ctx2.getImageData(0,0,_cvs2.width,_cvs2.height),
                _diffThreshold
			);
			
			_drawOnPixels(diffs); // paint on top of the different pixels
			
            if (_drawBoundingBoxes){
			     diffAreas = _findDiffAreas(diffs);
                _drawDiffAreas(diffAreas); // draw a bounding area around the different pixels
            }
			
			end = performance.now();
			
			cb({
				img1 :{
					height:_img1.height,
					width:_img1.width
				},
				img2 :{
					height:_img2.height,
					width:_img2.width
				},
				proximitySetting: _proximity,
                diffThreshold:_diffThreshold,
				diffQuan: diffAreas ? diffAreas.length : null,
				analysisTime: (end - start),
                isSameDimensions: (_img1.width === _img2.width && _img1.height === _img2.height ? true : false),
				dimensionDifference: {height:_img1.height - _img2.height,width: _img1.width - _img2.width},
				err:null,
                diff1: _cvs1.toDataURL(),
                diff2: _cvs2.toDataURL()
			});
            
            // reset
            _img1 = _img2 = _cvs1 = _cvs2 = _ctx1 =  _ctx2 = null;
			
		});

	};

})(this.lunadiff = this.lunadiff || {});