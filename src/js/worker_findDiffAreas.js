var onmessage = function(e){

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



    // all done...
    postMessage({start_x:start.x-1,start_y:start.y-1,end_x:end.x+1,end_y:end.y+1});
    close();

};