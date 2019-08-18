/*var should = require("should");
var art = require('../ascii-art');
//art.fontPath
var difference = require('color-difference');
var fs = require('fs');*/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'browser-request', 'dirname-shim', '../image', 'color-difference'
        ], function(request, shim, a, difference){
            //console.log(cold);
            a.Figlet.fontPath = 'Fonts/'
            return factory(a, difference, {
                readFile : function(filename, cb){
                    request({
                        url: filename
                    }, function(err, req, data){
                        if(err) return cb(err);
                        else cb(undefined, data);
                    })
                }
            }, should);
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('../image'),
            require('color-difference'),
            require('fs'),
            require('chai').should()
        );
    } else {
        throw new Error('global testing not supported!');
    }
}(this, function(Image, difference, fs, should){
    var isNode = typeof module === 'object' && module.exports;

    function testImage(options, callback, complete){
        var image = new Image(options);
        var file = options.filepath.split('/').pop().split('.');
        file.pop();
        file = '/images/'+file.join('.')+'.nfo';
        fs.readFile(__dirname+file, function(err, result){
            image.write(function(err, ascii){
                callback(err, ascii, result&&result.toString(), complete);
            });
        });
    }

    function imageIsValid(err, ascii, expected, done){
        if(err) console.log(err.stack);
        should.exist(ascii);
        should.exist(expected);
        var asciiLines = ascii.split("\n")
        var expectedLines = expected.split("\n");
        asciiLines.length.should.equal(expectedLines.length);
        //TODO: recapture final values once color fn stabilizes
        /*
        asciiLines.forEach(function(line, index){
            asciiLines[index].length.should(expectedLines[index].length);
        }); //*/
        //if(isNode) ascii.should.equal(expected);
        done();
    }

    function longestLineLength(str){
        return str.split("\n").map(function(str){
            return str.length || 0
        }).reduce(function(a, b){
            return Math.max(a, b)
        })
    }

    var parentDir = __dirname.split('/');
    parentDir.pop();
    //if(! (typeof module === 'object' && module.exports)) parentDir.pop();
    parentDir = parentDir.join('/');

    //*
    describe('AsciiArt', function(){
        describe('can render', function(){

            describe('an Image with', function(){

                describe('the "average" renderer and ', function(){

                    it('is a JPEG with default settings', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/mucha-job.jpg',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn in variant1', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/cernettes.jpg',
                            alphabet:'variant1',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn in variant2', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/gob.jpg',
                            alphabet:'variant2',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn in variant3', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/beyonce-upgrade.jpg',
                            alphabet:'variant3',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn in variant4', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/metropolis.jpg',
                            alphabet:'variant4',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn in blocks', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/grendel.jpg',
                            alphabet:'blocks',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn in greyscale', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/zero-cool.jpg',
                            alphabet:'greyscale',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a GIF drawn in binary', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/gir.gif',
                            alphabet:'binary',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a PNG drawn with defaults', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/seven-proxies.png',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn with defaults', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/peewee.jpeg',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn with defaults', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/animal_muppet.jpg',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn with defaults', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/serious-business.jpg',
                            width: 80
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn in greyscale', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/zero-cool.jpg',
                            width: 80,
                            alphabet:'greyscale'
                        }, imageIsValid, done);
                    });

                    it('is a JPEG drawn with a custom difference algorithm', function(done){
                        this.timeout(5000);
                        testImage({
                            filepath: parentDir+'/Images/rene-cigler.jpg',
                            width: 80,
                            distance: function(r1, g1, b1, r2, g2, b2){
                                return difference.compare(
                                    '#'+r1.toString(16)+g1.toString(16)+b1.toString(16),
                                    '#'+r2.toString(16)+g2.toString(16)+b2.toString(16)
                                );
                            }
                        }, imageIsValid, done);
                    });
                });
            });
        });
    });


    return {};
}));
//*/
