#

An HTML5 Canvas-based image diffing library.

## View the example file

1. Clone the project
2. NPM install
3. $gulp serve
4. View the example at http://localhost:3000. LunaDiff will start a diff on pageload which will take a few seconds as the example compares full-size screen-captures of CNN.com. Once the diff is finished some stats are printed to the page, the diff is inserted between the images being compared, and the reponse object is printed to the console.

## How to use

### lunadiff.init()

> `lunadiff.init(imageOnePath,imageTwoPath,cb,options)`

Where...

* **`imageOnePath`** is the path to the base image
* **`imageTwoPath`** is the path to the compare-to image
* **`cb`** is your callback function which should accept a response object (see additional details below)
* **`options`** is an object containing configuration options (see additional details below)

### `cb`

This should be replaced with a reference to your own callback function to which LunaDiff will send a response object once the diff is complete. Below is a sample response:


```
{
    analysisTime:'9429.099999993923',
    diff1:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA.....',
    diff2:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA.....',
    diffQuan:null,
    diffThreshold:25,
    dimensionDifference:
        {
            height: -1037,
            width: 0
        }
    err:null,
    img1:
        {
            height: 6703, 
            width: 1399
        }
    img2:
        {
            height: 7740, 
            width: 1399
        }
    isSameDimensions:false
    proximitySetting:13
}
```

Where:

* **`analysisTime`** is the time in miliseconds it took to complete the diff
* **`diff1`** is the first image with diff areas painted on to it as base64
* **`diff2`** is the second image with diff areas painted on to it as base64
* **`diffQuan`** if `drawBoundingBoxFlag` is true then this property holds the quantity of "diff areas"
* **`diffThreshold`** shows the value that was used to generate the diff
* **`dimensionDifference`** contains an object that reveals in pixels the difference in height or width the two images are from each other. As LunaDiff will not diff an image of unequal width the `width` value will always be zero
* **`err`** if images are of unqual width this property will be populated with `images are of unequal width`
* **`img1`** contains an object that reports the natural height and width of image one
* **`img2`** contains an object that reports the natural height and width of image two
* **`isSameDimensions`** a boolean indicating whether or not the images being compared where of the same dimensions
* **`proximitySetting`** shows the value that was used to generate the diff 

### options
LunaDiff is configurable via a configuration object. The following is an example: 

```
{
    prox:13, // proximity (used by diff areas function)
    color:'#ff00ff', // diff color
    diffThreshold:25, // diff threshold - if pixels differ by greater than this amount then there is a diff
    drawBoundingBoxFlag:false, // draw bounding box flag - time/processor intensive
    ctx1Alpha:1, // alpha for the diff when written to image 1
    ctx2Alpha:1  // alpha for the diff when written to image 2
}
```

Where:

* **`prox`** (Number) is the proximty value used to determine if a diff pixel should be grouped with other diff pixels that are within the specified range
* **`color`** (#Hex Color Value) is the color of the diff pixel that is drawn onto the result images
* **`diffThreshold`** (Number) is the threshold by which we determnine if a pixel is sufficently different between two images. This is useful in dealing with antialiasing or compression artifacts.
* **`drawBoundingBoxFlag`** (Boolean) is a switch the enables or disables this feature. By default it is **false** because it can greatly increase the diff time. For small images this is performant, on larger images not so much and can easily add minutes to the diff.
* **`ctx1Alpha`** (Number, ranged 0 to 1) represents the alpha applied to the diff pixel being drawn on the Image 1 diff result. 
* **`ctx2Alpha`** (Number, ranged 0 to 1) represents the alpha applied to the diff pixel being drawn on the Image 2 result.
    
