(function (root, factory) {
    var imgLoadBrowser = function(url, cb){
        var img = new root.Image();
        img.onload = function(){
            cb(undefined, img)
        }
        img.src = url;
    };
    var renderersBrowser = function(url, cb){
        return [ 'average.js' ];
    };
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            './renderers/average', 'ascii-art-ansi/color', 'ascii-art-ansi'
        ], function(ave, color, ansi){
            return factory(imgLoadBrowser, renderersBrowser, function(){
                return root.document.createElement('canvas');
            }, root.Image, function(){
               return ave;
            }, color, ansi);
        });
    } else if (typeof module === 'object' && module.exports) {
        var Canvas = require('canvas');
        var Image = Canvas.Image;
        Canvas = Canvas.Canvas;
        var fs = require('fs');
        module.exports = factory(
            function(url, cb){
                fs.readFile(url, function(err, data){
                    if (err) return cb(err);
                    var image = new Image();
                    image.src = data;
                    cb(undefined, image);
                });
            }, function(){
                var res = fs.readdirSync(__dirname+'/renderers');
                return res;
            },
            Canvas,
            Image,
            function(){ return require('./renderers/average')},
            require('ascii-art-ansi/color'),
            require('ascii-art-ansi')
        );
    } else {
        // Browser globals (root is window)
        root.AsciiArtImage = factory(
            imgLoadBrowser,
            renderersBrowser,
            root.Canvas,
            root.Image,
            root.AsciiArt.AverageRenderer,
            root.AsciiArtAnsiColor,
            root.AsciiArtAnsi
        );
    }
}(this, function (readImage, getRenderers, Canvas, Image, getAverage, ansiColor, Ansi) {
    //ansiColor.is256=true;
    //ansiColor.isTrueColor=true;
    //ansiColor.debug=true;
    //ansiColor.useDistance('original');

    var AsciiArt = {};
    var parentArt;
    AsciiArt.Image = function(options){
        if(typeof options == 'string'){
            if(options.indexOf('://') !== -1){
                options = {
                    uri : options
                }
            }else{
                options = {
                    filepath : options
                }
            }
        }
        var ob = this;
        this.parentClass = AsciiArt.Image;
        if(!options.alphabet) options.alphabet = 'ultra-wide';
        options.alphabet = AsciiArt.Image.valueScales[options.alphabet];
        if(options.invertValue) options.alphabet = options.alphabet.reverse();
        if(AsciiArt.Image.debug){
            console.log('ALPHABET', "\n", options.alphabet);
        }
        this.options = options;
        if(!this.options.renderer) this.options.renderer = 'average';
        var jobs = [];
        this.ready = function(callback){
            jobs.push(callback);
        };
        if(this.uri){
            throw new Error('uris not yet implemented!')
            return;
        }
        if(this.options.filepath){
            //todo: handle in UMD wrapper.. pass in assetloader?
            //console.log('FP>', this.options.filepath)
            readImage(this.options.filepath, function(err, image){
                if (err) throw err;
                ob.image = image;
                ob.aspectRatio = ob.image.height/ob.image.width;
                if(
                    (!ob.options.width) &&
                    (!ob.options.height)
                ){
                    ob.options.width = 80;
                }
                if(ob.options.width){
                    if(!ob.options.height){
                        ob.options.height = ob.options.width * ob.aspectRatio;
                    }
                }else{
                    if(ob.options.height){
                        ob.options.width = ob.options.height / ob.aspectRatio;
                    }
                }
                ob.canvas = new Canvas(ob.image.width, ob.image.height);
                ob.context = ob.canvas.getContext('2d');
                ob.context.drawImage(
                    ob.image, 0, 0, ob.image.width, ob.image.height
                );
                ob.ready = function(cb){ if(cb) cb() };
                jobs.forEach(function(job){
                    if(job) job();
                });
                jobs = [];
            });
        }else throw new Error('no filepath provided!');
    };
    AsciiArt.Image.Canvas = Canvas;
    AsciiArt.Image.Image = Image;
    AsciiArt.Image.prototype.write = function(location, callback){
        if(typeof location === 'function' && !callback){
            callback = location;
            location = undefined;
        }
        var ob = this;
        this.ready(function(){
            if(location && location.indexOf('://') !== -1){
                throw new Error("uris not yet implemented!")
            }else{
                AsciiArt.Image.renderers[ob.options.renderer].render(
                    ob,
                    {
                        imageFromCanvas : function(canvas){
                            var newImage = new Image();
                            if(canvas.toBuffer) newImage.src = canvas.toBuffer();
                            else newImage.src = canvas.toDataURL();
                            return newImage;
                        },
                        canvas : function(width, height){
                            var canvas = new Canvas(width, height);
                            return canvas;
                        }
                    },
                    function(err, text){
                        if(err) return callback(err);
                        if(location) require('fs').writeFile(location, text, function(err){
                            return callback(err, text);
                        });
                        else callback(err, text);
                    }
                );
            }
        });
    }

    AsciiArt.Image.Color = ansiColor;
    /*
    AsciiArt.Image.getTerminalColor = function(r, g, b, options){
        return ansiColor.getTerminalColor(r, g, b, options);
        console.log('?', arguments)
        //return ansiColor.code([r,g,b]);
    }//*/

    AsciiArt.Image.renderers = {};
    AsciiArt.Image.renderers['average'] = getAverage();
    //todo: AsciiArt.Image.renderers.foregroundBackground
    //      sample down to two colors by subsample grid, sample posistions
    //      compare two-color layout to a full ASCII character map for a maximally
    //      perfect two color-per character layout
    AsciiArt.Image.terminalAspectRatioDistortion = 0.7;


    AsciiArt.Image.newReturnContext = function(options){
        return new Promise(function(resolve, reject){
            try{
                AsciiArt.Image.create(options, function(err, rendered){
                    if(err) return reject(err);
                    resolve(rendered);
                });
            }catch(ex){
                reject(ex);
            }
        });
    }

    AsciiArt.Image.valueScales = {
        solid : '█'.split(''),
        variant1 : ' .,:;i1tfLCG08@'.split(''),
        variant2 : '@%#*+=-:. '.split('').reverse(),
        variant3 : '#¥¥®®ØØ$$ø0oo°++=-,.    '.split('').reverse(),
        variant4 : '#WMBRXVYIti+=;:,. '.split('').reverse(),
        'ultra-wide' : ('MMMMMMM@@@@@@@WWWWWWWWWBBBBBBBB000000008888888ZZZZZZZZZaZaaaaaa2222222SSS'
            +'SSSSXXXXXXXXXXX7777777rrrrrrr;;;;;;;;iiiiiiiii:::::::,:,,,,,,.........    ').split('').reverse(),
        wide : '@@@@@@@######MMMBBHHHAAAA&&GGhh9933XXX222255SSSiiiissssrrrrrrr;;;;;;;;:::::::,,,,,,,........        '.split(''),
        hatching : '##XXxxx+++===---;;,,...    '.split('').reverse(),
        bits : '# '.split('').reverse(),
        binary : '01 '.split('').reverse(),
        greyscale : ' ▤▦▩█'.split(''),
        blocks : ' ▖▚▜█'.split('')
    };

    AsciiArt.Image.create = function(options, callback){
        if(!callback){
            return AsciiArt.Image.newReturnContext(options);
        }else{
            var image = new AsciiArt.Image(options);

            image.write(function(err, rendered){
                callback(err, rendered);
            });
        }
    }

    return AsciiArt.Image;
}));
