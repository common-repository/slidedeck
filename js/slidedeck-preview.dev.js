/*!
 * SlideDeck Preview Updater
 *
 * @author Hummingbird Web Solutions Pvt. Ltd.
 * @package SlideDeck
 * @since 2.0.0
 */

/*!
Copyright 2012 HBWSL  (email : support@hbwsl.com)

This file is part of SlideDeck.

SlideDeck is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

SlideDeck is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with SlideDeck.  If not, see <http://www.gnu.org/licenses/>.
*/
var SlideDeckPreview;
var SlideDeckPrefix = "sd2-";
(function($){
    window.SlideDeckPreview = {
        elems: {},
        updates: {},
        ajaxOptions: [
            "options[size]",
            "options[date-format]",
            "options[randomize]",
            "options[total_slides]",
            "options[verticalTitleLength]",
            "options[start]",
            "options[slideTransition]",
            "options[width]",
            "options[height]",
            "options[show-front-cover]",
            "options[show-back-cover]",
            "options[excerptLengthWithImages]",
            "options[excerptLengthWithoutImages]",
            "options[titleLengthWithImages]",
            "options[titleLengthWithoutImages]",
            "options[linkAuthorName]",
            "options[linkTitle]",
            "options[linkTarget]",
            "options[navigation]"
        ],
        importedFonts: [],
        outerWidth: 0,
        outerHeight: 0,
        timerDelay: 250,
        validations: {},
        invalidKeyCodes: [9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,91,92,93,112,113,114,115,116,117,118,119,120,121,122,123,144,145],

        ajaxUpdate: function(){
            var self = this;

	if(this.elems.form.find('input[name="options[size]"]:checked').val() == "custom"){
	this.elems.form.find('.sd-height').val(this.elems.form.find('#customHeight').val());
	}

            var data = this.elems.form.serialize();
                data = data.replace(/action\=([a-zA-Z0-9\-_]+)/gi, "action=slidedeck_preview_iframe_update");

            this.elems.slideDimensions.addClass('getting-dimensions');
            this.elems.iframeBody.find('#mask').addClass('visible');

            $.ajax({
                url: ajaxurl + "?action=slidedeck_preview_iframe_update",
                type: "GET",
                dataType: "json",
                data: data,
                cache: false,
                success: function(data){
                    var adjustDimensions = false;
                    var previewInner = $('#slidedeck-section-preview .inner');

                    if(self.outerWidth != data.outer_width || self.outerHeight != data.outer_height){
                        self.outerWidth = data.outer_width;
                        self.outerHeight = data.outer_height;
                        adjustDimensions = true;
                    }
                    if( $("#slidedeck-section-lenses input[type='radio']:checked").val() != 'parfocal'  ) {
                        $('#slidedeck-slide-dimensions').show();
                    } else {
                        $('#slidedeck-slide-dimensions').hide();
                    }
                    if(adjustDimensions){
                        self.elems.slideDimensions.addClass('slidedeck-resizing');

                        // Removing the height on the inner div so that it will animate to the full height
                        if(previewInner.height() > 0) {
                            previewInner.height('');
                        }
                        self.elems.iframe.animate({
                            width: parseInt(data.outer_width, 10),
                            height: parseInt(data.outer_height, 10)
                        }, 500, function(){
                            self.elems.iframe[0].src = data.url;
                            self.elems.slideDimensions
                                .css('margin-left', (0 - parseInt(data.outer_width, 10)/2))
                                .removeClass('slidedeck-resizing');
                        });
                    } else {
                        self.elems.iframe[0].src = data.url;
                    }
                }
            });
        },

        eventOnLoad: function(){
            this.elems.iframeContents = this.elems.iframe.contents();
            this.elems.iframeBody = this.elems.iframeContents.find('body');
            this.elems.slidedeck = this.elems.iframeBody.find('.slidedeck');
            this.elems.layerpro = this.elems.iframeBody.find('.slidedeck-layerpro');
            this.elems.transitionpro = this.elems.iframeBody.find('.slidedeck-transitionpro');
            this.elems.tiled = this.elems.iframeBody.find('.slidedeck-tiled');
            this.elems.slidedeckFrame = this.elems.slidedeck.closest('.slidedeck-frame');
            this.elems.slidedeckLayerproFrame = this.elems.layerpro.closest('.slidedeck-layerpro');
            this.elems.slidedeckTransitionProFrame = this.elems.transitionpro.closest('.slidedeck-transitionpro');
            this.elems.slidedeckTiledFrame = this.elems.tiled.closest('.slidedeck-tiled');
            this.elems.noContent = this.elems.iframeBody.find('.no-content-found');
            this.slidedeck = this.elems.slidedeck.slidedeck();

			// show warning of scheduler
			var slides = 0;
			// for fashion lense change to li
			if( this.elems.slidedeckFrame.hasClass('lens-fashion') || this.elems.slidedeckFrame.hasClass('lens-prime') || this.elems.slidedeckFrame.hasClass('lens-parfocal') ){
				slides = this.elems.slidedeck.find('li').length;

			} else if( this.elems.slidedeckTransitionProFrame.hasClass('slidedeck-transitionpro') ) {
                                slides = this.elems.transitionpro.find('li').length;
                        } else if( this.elems.slidedeckTiledFrame.hasClass('slidedeck-tiled') ) {
                                slides = this.elems.tiled.find('li').length;
                        } else if( this.elems.slidedeckLayerproFrame.hasClass('slidedeck-layerpro') ) {
                                slides = this.elems.layerpro.find('li').length;
                        }else {
				slides = this.elems.slidedeck.find('dd.slide').length;
			}
			if( slides < 1 ){
				parent.document.getElementById('slidedeck-scheduler-warning').style.display = 'block';
			} else {
				parent.document.getElementById('slidedeck-scheduler-warning').style.display = 'none';
			}

            if(this.elems.noContent.length){
                this.elems.iframeBody.find('#mask').removeClass('visible');
                this.elems.noContent.find('.no-content-source-configuration').bind('click', function(event){
                    event.preventDefault();
                    $('.slidedeck-content-source').removeClass('hidden');
                });
            }

            this.elems.slidedeckFrame.find('.slidedeck-overlays .slidedeck-overlays-wrapper a').bind('click', function(event){
                event.preventDefault();
                return false;
            }).attr('title', "Overlay links disabled for preview");

            this.updateSlideDimensions();
        },

        getSlideDimensions: function(){

			// for fashion lense change to li
			if( this.elems.slidedeck.find('li').length > 0 ) {
                            var slide = this.elems.slidedeck.parent('.slidedeck-frame').eq(0);
                        } else {
                            var slide = this.elems.slidedeck.find('dd.slide').eq(0);
                        }

            if(this.isVertical()){
                slide = slide.find('.slidesVertical dd').eq(0);
            }

            var dimensions = {
                width: slide.width(),
                height: slide.height()
            };
            return dimensions;
        },

        isVertical: function(){
            if(typeof(this.slidedeck) !== 'undefined'){
                // If the HTML element is passed in, detect differently.
                if(typeof(this.slidedeck.deck) == 'undefined'){
                    if(this.elems.slidedeck.find('.slidesVertical').length > 0){
                        return true;
                    }
                    return false;
                } else {
                    // Are there vertical slides anywhere on this deck?
                    if(this.slidedeck.verticalSlides){
                        // Does the vertical slides object exist for the slide we're going to?
                        if(this.slidedeck.verticalSlides[this.slidedeck.current-1]){
                            // Does the slide we're going to actually have vertical slides?
                            if(this.slidedeck.verticalSlides[this.slidedeck.current-1].navChildren){
                                // Vertical
                                return true;
                            } else {
                                // Horizontal
                                return false;
                            }
                        }
                    }
                }
            }
            return false;
        },

        realtime: function(elem, value){
            var $elem = $.data(elem, '$elem');
            // Cache jQuery extended element
            if(!$elem){
                $elem = $(elem);
                $.data(elem, '$elem', $elem);
            }

            var name = $elem.attr('name');

            if(typeof(this.updates[name]) == 'function'){
                this.updates[name]($elem, value);
            }

            this.updateSlideDimensions();
        },

        update: function(elem, value){
            var realtime = true;

            if(elem.type == "text"){
                var previousValue = jQuery.data(elem, 'previousValue');
                if(previousValue == value){
                    return false;
                } else {
                    jQuery.data(elem, 'previousValue', value);
                }
            }

            for(var i = 0; i < this.ajaxOptions.length; i++){
                if(this.ajaxOptions[i] == elem.name){
                    realtime = false;
                }
            }

            // Override for realtime updates to take priority over AJAX reloads
            for(var k in this.updates){
                if(k == elem.name){
                    realtime = true;
                }
            }

            if(this.validate(elem, value)){
                var self = this;
                if(realtime){
                    this.realtime(elem, value);
                } else {
                    self.ajaxUpdate();
                }
            }
        },

        updateSlideDimensions: function(){
            var dimensions = this.getSlideDimensions();
            this.elems.slideDimensions.find('.width').text(dimensions.width + "x");

            this.elems.slideDimensions.find('.height').text(dimensions.height);

            this.elems.slideDimensions.removeClass('getting-dimensions');
        },

        validate: function(elem, value){
            var _return = true;

            if(typeof(this.validations[elem.name]) == "function"){
                _return = this.validations[elem.name](elem, value);
            }

            return _return;
        },


        initialize: function(){
            var self = this;

            // Update form
            this.elems.form = $('#slidedeck-update-form');
            // Fail silently if there is no preview on this page
            if(this.elems.form.length < 1){
                return false;
            }

            this.elems.form
                // Update Dropdowns
                .delegate('select', 'change', function(event){
                    var options = this.getElementsByTagName('option'),
                        value = "";
                    for(var o in options)
                        if(options[o].selected)
                            value = options[o].value;
                    self.update(this, value);
                })
                .delegate('input[type="text"]', 'blur change', function(event){
                    self.update(this, this.value);
                })
                .delegate('input[type="text"]', 'keyup', function(event){
                    for(var k in self.invalidKeyCodes){
                        if(self.invalidKeyCodes[k] == event.keyCode){
                            return false;
                        }
                    }

                    var elem = this;
                    if (this.timer)
                        clearTimeout(elem.timer);

                    // Set delay timer so a check isn't done on every single key stroke
                    this.timer = setTimeout(function(){
                        self.update(elem, elem.value);
                    }, self.timerDelay );

                    return true;
                })
                // Prevent enter key from submitting text fields
                .delegate('input[type="text"]', 'keydown', function(event){
                    if(13 == event.keyCode){
                        event.preventDefault();
                        self.update(this, this.value);
                        return false;
                    }
                })
                // Update Radios and Checkboxes
                .delegate('input[type="radio"], input[type="checkbox"]', 'click', function(event){
                    var value = this.value;

                    // Override value to be boolean for checkboxes
                    if(this.type == "checkbox"){
                        value = this.checked;
                    }

                    self.update(this, value);
                });

            this.elems.form.delegate('.slidedeck-ajax-update', 'click', function(event){
                event.preventDefault();

                // Hide the flyout.
                $('.slidedeck-content-source').addClass('hidden');
                self.ajaxUpdate();
            });

            this.elems.form.find('input[type="text"]').each(function(){
                $.data(this, 'previousValue', $(this).val());
            });

            // Setup iframe elements
            this.elems.iframe = $('#slidedeck-preview');

            this.elems.iframe.bind('load', function(){
                self.eventOnLoad();
            });


            this.elems.slideDimensions = $('#slidedeck-slide-dimensions');
            if( $("#slidedeck-section-lenses input[type='radio']:checked").val() != 'parfocal' ) {
                $('#slidedeck-slide-dimensions').show();
                this.outerWidth = this.elems.iframe.width();
                this.outerHeight = this.elems.iframe.height();
                this.size = this.elems.form.find('input[name="options[size]"]:checked').val();

                this.elems.slideDimensions.css('margin-left', (0 - this.outerWidth/2)).removeClass('slidedeck-resizing');
            } else {
                $('#slidedeck-slide-dimensions').hide();
            }
        }
    };

    SlideDeckPreview.updates['options[show-link-slide]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'show-link-slide');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'show-link-slide');
        }
    };

    SlideDeckPreview.updates['options[titleFont]'] = SlideDeckPreview.updates['options[bodyFont]'] = function($elem, value){
        var font = SlideDeckFonts[value];

        if(font['import']){
            var needsImport = true;

            for(var i = 0; i < SlideDeckPreview.importedFonts.length; i++){
                if(SlideDeckPreview.importedFonts[i] == font['import']){
                    needsImport = false;
                }
            }

            if(needsImport){
                SlideDeckPreview.elems.iframeBody.append('<style type="text/css">@import url(' + font['import'] + ');</style>');
            }
        }

        if($elem[0].name == "options[titleFont]"){
            var $fontElements = SlideDeckPreview.elems.slidedeck.find('.slide-title, .sd2-slide-title').add(SlideDeckPreview.elems.slidedeckFrame.find('.sd2-custom-title-font'));
            $fontElements.css('font-family', font.stack);
            if(font.weight) $fontElements.css('font-weight', font.weight);
        } else if($elem[0].name == "options[bodyFont]"){
            SlideDeckPreview.elems.slidedeck.css('font-family', font.stack);
        }
    };

    // Accent Color (background and color)
    SlideDeckPreview.updates['options[accentColor]'] = function($elem, value){
        var footerStyles = SlideDeckPreview.elems.iframeContents.find("#slidedeck-footer-styles");
        var cssText = footerStyles.text().replace(/\.accent-color(-background)?\{(background-)?color:([\#0-9a-fA-F]+);?\}/gi, ".accent-color$1{$2color:" + value + "}");
        footerStyles.text(cssText);

        // Change accent shape data
        var icons = SlideDeckPreview.elems.slidedeckFrame.find('.icon-shape');
        if( icons.length ){
            for (var i=0; i < icons.length; i++) {
                SlideDeckPreview.elems.iframe[0].contentWindow.jQuery.data( icons[i], 'slidedeck-accent-shape' ).attr('fill', value);
            }
        }

        // Fall back for IE < 9
        if(slidedeck_ie < 9){
            SlideDeckPreview.elems.slidedeckFrame.find('.accent-color').css('color', value);
            SlideDeckPreview.elems.slidedeckFrame.find('.accent-color-background').css('background-color', value);
        }
    };

    SlideDeckPreview.updates['options[lensVariations]'] = function($elem, value){
        var $options = $elem.find('option');
        $options.each(function(ind){
            if(value == this.value){
                SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + this.value);
            } else {
                SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + this.value);
            }
        });
    };

    SlideDeckPreview.updates['options[overlays]'] = function($elem, value){
        var $options = $elem.find('option');
        $options.each(function(ind){
            if(value == this.value){
                SlideDeckPreview.elems.slidedeckFrame.addClass("show-overlay-" + this.value);
            } else {
                SlideDeckPreview.elems.slidedeckFrame.removeClass("show-overlay-" + this.value);
            }
        });
    };

    SlideDeckPreview.updates['options[overlays_open]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + "overlays-open");
            SlideDeckPreview.elems.iframe[0].contentWindow.jQuery.data(SlideDeckPreview.elems.slidedeck[0], 'SlideDeckOverlay').open();
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + "overlays-open");
            SlideDeckPreview.elems.iframe[0].contentWindow.jQuery.data(SlideDeckPreview.elems.slidedeck[0], 'SlideDeckOverlay').close();
        }
    };

    SlideDeckPreview.updates['options[hyphenate]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'hyphenate');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'hyphenate');
        }
    };

    SlideDeckPreview.updates['options[continueScrolling]'] = function($elem, value){
        SlideDeckPreview.slidedeck.setOption('continueScrolling', value);
    };

    SlideDeckPreview.updates['options[cycle]'] = function($elem, value){
        value = value == 1 ? true : false;
        SlideDeckPreview.slidedeck.setOption('cycle', value);
        SlideDeckFadingNav.prototype.checkHorizontal(SlideDeckPreview.slidedeck);
        SlideDeckFadingNav.prototype.checkVertical(SlideDeckPreview.slidedeck);
    };

    SlideDeckPreview.updates['options[keys]'] = function($elem, value){
        value = value == 1 ? true : false;
        SlideDeckPreview.slidedeck.setOption('keys', value);
    };

    SlideDeckPreview.updates['options[scroll]'] = function($elem, value){
        value = value == 1 ? true : false;
        SlideDeckPreview.slidedeck.setOption('scroll', value);
        if(SlideDeckPreview.slidedeck.deck.find('.slidesVertical').length){
            SlideDeckPreview.slidedeck.vertical().options.scroll = value;
        }
    };

    SlideDeckPreview.updates['options[touch]'] = function($elem, value){
        value = value == 1 ? true : false;
        SlideDeckPreview.slidedeck.setOption('touch', value);
    };

    SlideDeckPreview.updates['options[touchThreshold]'] = function($elem, value){
        SlideDeckPreview.slidedeck.options.touchThreshold.x = value;
        SlideDeckPreview.slidedeck.options.touchThreshold.y = value;
    };

    SlideDeckPreview.updates['options[autoPlay]'] = function($elem, value){
        value = value == 1 ? true : false;
        SlideDeckPreview.slidedeck.pauseAutoPlay = !value;
        SlideDeckPreview.slidedeck.setOption('autoPlay', value);
    };

    SlideDeckPreview.updates['options[autoPlayInterval]'] = function($elem, value){
        SlideDeckPreview.slidedeck.options.autoPlayInterval = parseInt(value, 10) * 1000;
    };

    SlideDeckPreview.updates['options[speed]'] = function($elem, value){
        SlideDeckPreview.slidedeck.setOption('speed', value);

        if(SlideDeckPreview.slidedeck.deck.find('.slidesVertical').length){
            SlideDeckPreview.slidedeck.vertical().options.speed = value;
        }
    };

    SlideDeckPreview.updates['options[transition]'] = function($elem, value){
        SlideDeckPreview.slidedeck.setOption('transition', value);
    };

    SlideDeckPreview.updates['options[display-nav-arrows]'] = function($elem, value){
        $elem.find('option').each(function(){
            if(this.value != value){
                SlideDeckPreview.elems.slidedeckFrame.removeClass('display-nav-' + this.value);
            } else {
                SlideDeckPreview.elems.slidedeckFrame.addClass('display-nav-' + this.value);
            }
        });
    };

    SlideDeckPreview.validations['options[size]'] = function(elem, value){

	if(value == "fullwidth"){
		$('span#slidedeck-fullwidth-dimensions').show();
	}
	else
	{
		$('span#slidedeck-fullwidth-dimensions').hide();
	}

        if(SlideDeckPreview.size == value){
            return false;
        } else {
            SlideDeckPreview.size = value;
            return true;
        }
    };

    SlideDeckPreview.updates['options[show-excerpt]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'show-excerpt');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'show-excerpt');
        }
    };

    SlideDeckPreview.updates['options[hyphenate]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'hyphenate');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'hyphenate');
        }
    };

    SlideDeckPreview.updates['options[show-title]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'show-title');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'show-title');
        }
    };

    SlideDeckPreview.updates['options[show-readmore]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'show-readmore');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'show-readmore');
        }
    };

    SlideDeckPreview.updates['options[show-author]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'show-author');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'show-author');
        }
    };

    SlideDeckPreview.updates['options[show-author-avatar]'] = function($elem, value){
        value = value == 1 ? true : false;
        if(value){
            SlideDeckPreview.elems.slidedeckFrame.addClass(SlideDeckPrefix + 'show-author-avatar');
        } else {
            SlideDeckPreview.elems.slidedeckFrame.removeClass(SlideDeckPrefix + 'show-author-avatar');
        }
    };

    SlideDeckPreview.updates['options[image_scaling]'] = function($elem, value){
        $elem.find('option').each(function(){
            if(this.value == value){
                SlideDeckPreview.elems.slidedeck.find('dd').addClass(SlideDeckPrefix + 'image-scaling-' + this.value);
            } else {
                SlideDeckPreview.elems.slidedeck.find('dd').removeClass(SlideDeckPrefix + 'image-scaling-' + this.value);
            }
        });
    };

    $(document).ready(function(){
        SlideDeckPreview.initialize();
    });
})(jQuery);
