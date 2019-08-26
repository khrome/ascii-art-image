(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['ascii-art-ansi', 'ascii-art-ansi/color'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('ascii-art-ansi'), require('ascii-art-ansi/color'));
    } else {
        root.AsciiArt.AverageRenderer = factory();
    }
}(this, function (ansi, Color) {
    var AsciiArt;
    var getValue = function(r, g, b){
        return (r+g+b)/3;
    }
    var result = { //characters based on a value scale + averaging
        setInstance: function(instance){
            AsciiArt = instance;
        },
        render : function(image, utils, callback){
            try{
                var width = image.options.width;
                var height = image.options.height;
                var distortion = 0.5;
                height = Math.floor(image.options.height*distortion);
                var newImage = utils.imageFromCanvas(image.canvas);
                var canvas = utils.canvas(width, height);

                var context = canvas.getContext('2d');
                context.drawImage(
                    newImage, 0, 0,
                    width, height
                );
                var data = context.getImageData(
                    0, 0,
                    width, height
                ).data;
                var result = '';
                var currentColor;
                for(var y=0; y < height; y++){
                    for(var x=0; x < width; x++){
                        var offset = y * width * 4 + x * 4;
                        var color = Color.code([
                            data[offset],
                            data[offset+1],
                            data[offset+2]]
                        );
                        var fraction = getValue(
                            data[offset],
                            data[offset+1],
                            data[offset+2]
                        )/255;
                        var charPosition = Math.floor(image.options.alphabet.length*fraction);
                        result += color + (image.options.alphabet[charPosition] || ' ')
                        //result += (image.options.alphabet[charPosition] || ' ');
                    }
                    result += "\n";
                    currentColor = undefined;
                }
            }catch(ex){
                if(callback) callback(ex);
            }
            if(callback) callback(undefined, result);
        }
    };
    return result;
}));
