;(function(ns){
	'use strict';
	// Adapted from http://rickluna.com/wp/2016/09/diffing-two-canvases/

	var _img1, _img2, _cvs1, _cvs2, _ctx1, _ctx2, _newWidth, _newHeight;

	function _drawOpaqueOverCompareImg(context,alpha){
		context.globalAlpha = alpha;
		context.fillStyle = '#ffffff';
		context.fillRect(0,0,_newWidth,_newHeight);
	}
	
	function _loadImage(path){
		return new Promise(function(resolve,reject){
			var img = new Image();
			img.onload = function(){
				resolve(this);
			}
			img.onerror = function(e){
				reject(e);
			};
			img.src = path;
		});
	}
	
	function _setCanvasScale(){
		return new Promise(function(resolve,reject){
			// set starting height of canvas
			_cvs1.height = _cvs2.height = _img1.height;
			// discover height and width of the image assets. They must both be the same height and width.
			var img = new Image();
			
			// when the image is loaded determine the scale at which they should be rendered into our canvases
			img.onload = function(){
				// find the new scale
				// ratio = width / height;
				// width = height * ratio;
				// height = width / ratio;
				var wrapper = document.getElementById('offscreen');
				wrapper.appendChild(img);
				var ratio = img.width / img.height;
				_newWidth = _cvs1.width;
				_newHeight = _newWidth / ratio;
				if (_newHeight > _cvs1.height) {
					_newHeight = _cvs1.height;
					_newWidth = _newHeight * ratio;
				}
				// clean up
				wrapper.removeChild(img);
				// adjust height of the canvases to match the new height value
				_cvs1.height = _cvs2.height = _newHeight;
				
				resolve({success:true});
			}
			img.onerror = function(e){
				reject(e);
			}
			// load an image so that we can determine the scale needed to dsiplay them side-by-side
			img.src = _img1.src;
		});
	}
	
	
	function _findDiffAreas(diffs){
		// Hold the array of diff area arrays, themselves containing coordinate objects
		var diffAreas = [];
		var proxPadding = 10;
		var hit = false;
		
		// populate diffAreas with intial diffAreas array and diffs object
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
		//console.log('diffAreas: ',diffAreas);
		return diffAreas;
	}
	
	function _drawOnPixels(diffs){
		// draw on top of the different pixels
		for (var i=0;i<diffs.length;i++){
			//_ctx1.globalCompositeOperation = 'color';
			_ctx1.globalAlpha = 0.1;
			_ctx1.fillStyle = '#23cd12';
			_ctx1.fillRect(diffs[i].x-1,diffs[i].y-1,2,2);
			
			//_ctx2.globalCompositeOperation = 'color';
			_ctx2.globalAlpha = 0.5;
			_ctx2.fillStyle = '#ff0000';
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
			if (pA1_r !== pA2_r){
				diffs.push({x:x,y:y});
			} else
			// compare greens
			if (pA1_g !== pA2_g){
				diffs.push({x:x,y:y});
			} else
			// compare blues
			if (pA1_b !== pA2_b){
				diffs.push({x:x,y:y});
			} else
			// compare alphas
			if (pA1_a !== pA2_a){
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
			end.x   = diffAreas[j][diffAreas[j].length-1].x || w;
			
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
			end.y   = diffAreas[j][diffAreas[j].length-1].y || h;

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
	
	ns.init = function(img1path,img2path){
		var width = window.innerWidth / 2 - 50;
		_cvs1 = document.getElementById('canvas1');
		_cvs2 = document.getElementById('canvas2');
		_ctx1 = _cvs1.getContext('2d');
		_ctx2 = _cvs2.getContext('2d');
		_cvs1.width = width; // set canvas widths
		_cvs2.width = width;
		
		// load the images for measurement purposes
		_loadImage(img1path).then(function(response){
			_img1 = response; // save the loaded image in memory, we will need it later to load into our canvas
			return _loadImage(img2path);
		}) //
		.then(function(response){
			_img2 = response; // save the loaded image in memory, we will need it later to load into our canvas
			return _setCanvasScale(); // determine the scaling so that we can proportionately display the canvases
		})
		.then(function(){
			var diffs = null;
			_ctx1.drawImage(_img1,0,0,_newWidth,_newHeight); // insert images into canvases
			_ctx2.drawImage(_img2,0,0,_newWidth,_newHeight);
			diffs = _findDiffPixels( // diff the canvases
				_ctx1.getImageData(0,0,_cvs1.width,_cvs1.height),
				_ctx2.getImageData(0,0,_cvs2.width,_cvs2.height)
			);
			
			_drawOnPixels(diffs); // paint on top of the different pixels
			//_drawOpaqueOverCompareImg(_ctx2,0.5);
			_drawDiffAreas(_findDiffAreas(diffs)); // draw a bounding area around the different pixels
		});

	};

})(this.imgdiff = this.imgdiff || {});