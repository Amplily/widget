'use strict';

window.setupAmplilyWidget = function (options) {
    var repo = 'amplily-admin';
    var type;
    var dParam;
    var jQuery;
    var debug = false;
    var baseurl = 'https://go.parmonic.com/amplily-widget/';
    var baseurlAdminAppUrl = 'https://go.parmonic.com/';
    var analyticsEventsCaptureEndPoint = baseurlAdminAppUrl + 'api/event';
    var w = 1;
    var videoType = 1; // youtube
    var accountId = null;
    var dataVStatus = null;
    var momentVideoPlayers = [];
    if (window.location.host.indexOf('localhost') > -1) {
        baseurlAdminAppUrl = window.location.protocol + '//' + window.location.host + '/';
        baseurl = baseurlAdminAppUrl + 'amplily-widget/';
        analyticsEventsCaptureEndPoint = window.location.protocol + '//' + window.location.host.replace('8080', '3000') + '/api/event';
    }
    var nSpeakers = 2;
    var nMoments = 6;
    var css = [];
    var gatedMomentSeqId = null; // this is the sequence id of the gated moment.
    css.push(baseurl + "css/iso_bootstrap3.3.7.css");
    css.push(baseurl + "css/fs-modal.min.css");
    css.push(baseurl + "css/ctl_styles.css");
    css.push(baseurl + "css/ctl-compact-tm.css");
    css.push(baseurl + "css/ctl-styles-horizontal.css");
    css.push(baseurl + "css/flexslider.css");
    css.push(baseurl + "css/slick.css");
    css.push(baseurl + "css/style.css");
    css.push(baseurl + "css/social-share-kit.css");

    css.push("https://cdn.jsdelivr.net/npm/plyr@3/dist/plyr.css");
    css.push("https://fonts.googleapis.com/css?family=Poppins:300,400,600,700");

    for (var i = 0; i < css.length; i++) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", css[i]);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }

    // making a call to get contents of the widget html
    var xhr = new XMLHttpRequest();
    var timelineType = 'vertical.html';
    getScriptParams();
    if (dParam && dParam == 'true') {
        debug = true;
    }

    if (!w) w = 1;
    if (type && type == 'horizontal') {
        timelineType = 'horizontal.html';
    } else if (type && type == 'compact') {
        timelineType = 'compact.html';
    }

    if (!videoType) videoType = 1;

    if (!dataVStatus || dataVStatus === 'publish') {
        if (options && options.initGating) {
            xhr.open('GET', baseurl + 'views/' + w + '-gated.html', true);
        } else {
            xhr.open('GET', baseurl + 'views/' + w + '.html', true);
        }
    } else if (dataVStatus && dataVStatus === 'preview') {
        xhr.open('GET', baseurl + 'views/preview/webinar-' + w + '.html', true);
    }

    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) return; // or whatever error handling you want
        document.getElementById('am-storyline').innerHTML = this.responseText;
        initJquery();
    };
    xhr.send();

    function getScriptParams() {
        var script = document.getElementById('am-storyline-script');
        w = script.getAttribute('data-w-id');
        type = script.getAttribute('data-type');
        dParam = script.getAttribute('data-debug');
        repo = script.getAttribute('data-repo');
        dataVStatus = script.getAttribute('data-v-status');
    }

    function addScript(attribute, text, callback) {
        var s = document.createElement('script');
        for (var attr in attribute) {
            s.setAttribute(attr, attribute[attr] ? attribute[attr] : null)
        }
        if (text) {
            s.innerHTML = text;
        }

        if (callback) {
            s.onload = callback;
        }
        document.body.appendChild(s);
    }

    function sendEvent(accountId, webinarId, momentId, speakerId, start, end, socialChannel, eventType) {
        var eventJson = {};
        eventJson.accountId = accountId;
        eventJson.webinarId = webinarId
        eventJson.momentId = momentId;
        eventJson.eventType = eventType;
        jQuery.ajax(analyticsEventsCaptureEndPoint, {
            data: JSON.stringify(eventJson),
            contentType: 'application/json',
            type: 'POST',
        });
    }

    function initPlayerScripts() {
        initShakaPlayerCompiledScript(function () {
            initPolyFillScript(function () {
                initShakaPlayerScript(function () {
                    initRxJsScripts(function () {

                        initRxJsJqueryScripts(function () {

                            initRxLiteJsScripts(function () {

                                // Trigger the init event
                                if(options && options.initGating) {
                                    options.initGating(document.querySelector('#am-storyline .modal-body'));
                                }

                                initEventHandlers();

                            });
                        });
                    });
                });

            });

        });
    }

    function initShakaPlayerCompiledScript(callback) {
        addScript({
            src: 'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/2.4.4/shaka-player.compiled.js',
            integrity: "sha256-XHmjVm65Y2mpPr3Uz9tSGwBYyxFIjeIWJm3eDGfDI2M=",
            crossorigin: "anonymous",
            type: 'text/javascript',
            async: null
        }, null, callback);
    }

    function initPolyFillScript(callback) {
        addScript({
            src: 'https://cdn.polyfill.io/v2/polyfill.min.js?features=es6,Array.prototype.includes,CustomEvent,Object.entries,Object.values,URL',
            type: 'text/javascript',
            async: null
        }, null, callback);
    }

    function initShakaPlayerScript(callback) {
        addScript({
            src: 'https://cdn.jsdelivr.net/npm/plyr@3',
            type: 'text/javascript',
            async: null
        }, null, callback);
    }


    function initSlick() {
        
        let slides = 0;
        let cMoments = jQuery('.moment').length;
        if (cMoments) slides = cMoments > 2 ? 2 : cMoments;

        if (slides > 0) {

            addScript({
                src: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js',
                type: 'text/javascript',
                async: null
            }, null, function () {

                let responsive = [{
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: Math.min(2, slides),
                        slidesToScroll: 1
                    }
                }, {
                    breakpoint: 770,
                    settings: {
                        slidesToShow: Math.min(2, slides),
                        slidesToScroll: 1
                    }
                }, {
                    breakpoint: 540,
                    settings: {
                        slidesToShow: Math.min(1, slides),
                        slidesToScroll: 1
                    }
                }];

                $('.slider-nav').slick({
                    slidesToShow: slides,
                    slidesToScroll: 1,
                    asNavFor: '.slider-for',
                    dots: false,
                    infinite: false,
                    nextArrow: document.getElementById('slick-next'),
                    prevArrow: document.getElementById('slick-previous'),
                    responsive: responsive
                });

                $('.slider-for').slick({
                    slidesToShow: slides,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: false,
                    dots: false,
                    infinite: false,
                    responsive: responsive
                });


            });
        }

    }


    // refactor this method to be dynamic
    function initTypeSpecificLibs() {

        let slick = document.getElementById("slider-timeline-wrapper");

        if (slick)
            initSlick();

        initPlayerScripts();
    }

    function addJqueryCdn() {
        addScript({
            src: "https://go.parmonic.com/javascripts/jquery.3.0.0.min.js",
            type: 'text/javascript',
            async: null
        }, null, addBootStrapJs);
    }
    function addBootStrapJs() {
        addScript({
            src: 'https://go.parmonic.com/javascripts/bootstrap.3.3.7.min.js',
            type: 'text/javascript',
            async: null
        }, null, addBootStrapMobileModal);
    }
    function addBootStrapMobileModal() {
        addScript({
            src: 'https://go.parmonic.com/javascripts/fs-modal.min.js',
            type: 'text/javascript',
            async: null
        }, null, addModalJs);
    }
    function addModalJs() {
        initTypeSpecificLibs()
    }
    function loadJquery(jqueryParam, callback) {

        /******** Load jQuery if not present *********/
        if (jqueryParam === undefined || jqueryParam.fn.jquery !== '3.0.0') {
            var script_tag = document.createElement('script');
            var title = document.getElementsByTagName('title')[0];
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src",
                "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js");
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        loadedJquery();
                    }
                };
            } else { // Other browsers
                script_tag.onload = loadedJquery;
            }
            // Try to find the head, otherwise default to the documentElement
            (document.getElementsByTagName("head")[0] || document.documentElement).insertBefore(script_tag, title);
        } else {
            // The jQuery version on the jqueryParam one we want to use
            jQuery = jqueryParam;
        }

        callback()
    }

    function initJquery() {
        loadJquery(window.jQuery, addJqueryCdn)
    }

    function loadedJquery() {
        jQuery = window.jQuery.noConflict(true);
        jQuery.fn.modal = Plugin;
        jQuery.fn.modal.Constructor = Modal;

        jQuery(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
            var $this = jQuery(this)
            var href = $this.attr('href')
            var $target = jQuery($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
            var option = $target.data('bs.modal') ? 'toggle' : jQuery.extend({
                remote: !/#/.test(href) && href
            }, $target.data(), $this.data())

            if ($this.is('a')) e.preventDefault()

            $target.one('show.bs.modal', function (showEvent) {
                if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
                $target.one('hidden.bs.modal', function () {
                    $this.is(':visible') && $this.trigger('focus');
                })
            })
            Plugin.call($target, option, this);
        })
    }

    function getMomentUrlFromMomentSeq(momentSeq) {
        var url = null;
        var momentE = jQuery('#moment-' + momentSeq);
        if (momentE && momentE.length > 0) {
            url = momentE[0].getAttribute('data-video-url');
        }
        return url;
    }

    function getMomentIdFromMomentSeqId(seqId) {
        var momentId = null;
        var momentIdE = jQuery('#moment-' + seqId);
        if (momentIdE && momentIdE.length > 0) {
            momentId = momentIdE[0].getAttribute('data-moment-id');
        }
        return momentId;
    }

    function infoTabToggle() {
        var infoTab = jQuery('#tab1')
        var toggleButton = jQuery('.info-toggle-button')
        let fadingDiv = null;
        if (infoTab.height() > 300) {
            fadingDiv = document.createElement('div')
            fadingDiv.className = 'info-tab-fading'
            infoTab.css('max-height', '300px')
            toggleButton.before(fadingDiv)

            infoTab.mouseenter(function () {
                toggleButton.removeClass('info-expand-btn-hiding').addClass('info-expand-btn-showing')
            })
        }

        infoTab.mouseleave(function () {
            toggleButton.addClass('info-expand-btn-hiding')
        })

        toggleButton.click(function () {
            var expandContent = 'Expand <span id="arrow-icon" class="glyphicon glyphicon-arrow-down"></span>'
            var collapseContent = 'Collapse<span id="arrow-icon" class="glyphicon glyphicon-arrow-up"></span>'
            if (infoTab.css('max-height') === '300px') {
                infoTab.css('max-height', 'none')
                fadingDiv.remove()
                toggleButton.html(collapseContent)
            } else {
                infoTab.css('max-height', '300px')
                toggleButton.before(fadingDiv)
                toggleButton.html(expandContent)
            }
        })
    }

    function initShakaPlayer(videoElement, url) {

        const player = new Plyr(videoElement, { hideControls: false });
        shaka.polyfill.installAll();

        if (shaka.Player.isBrowserSupported()) {
            const shakaInstance = new shaka.Player(videoElement);
            shakaInstance.load(url);
        } else {
            const hlsUrl = url.replace('format=mpd-time-csf', 'format=m3u8-aapl');
            console.warn('Browser is not supported!');
            var source = document.createElement('source');
            source.setAttribute('src', hlsUrl);
            source.setAttribute('type', 'application/x-mpegURL');
            videoElement.appendChild(source);
        }

        player.toggleControls(false);

        momentVideoPlayers.push(player);
    }

    function initEventHandlers() {
        infoTabToggle();

        var mLinks = document.getElementsByClassName("more-link");
        for (var i = 0; i < mLinks.length; i++) {
            mLinks[i].addEventListener('click', function (event) {
                event.preventDefault();
                var hrefProp = event.currentTarget.getAttribute('href');
                event.currentTarget.classList.add('hide-me');
                var details = document.getElementById(hrefProp.slice(1));
                details.classList.remove('hide-me');
                if (debug) {
                    console.log('more links debug');
                    console.log(event);
                }
            }, false);
        }

        var cSpeakers = jQuery('.speakers').length;
        if (cSpeakers) nSpeakers = cSpeakers;

        var cMoments = jQuery('.moment').length;
        if (cMoments) nMoments = cMoments;

        var gatedMoment = jQuery('.moment.gated');
        if (gatedMoment[0]) {
            var seqId = gatedMoment[0].getAttribute('data-moment-seq-id');
            if (seqId) gatedMomentSeqId = seqId;
        }

        console.log('Gated Moment Sequence Id' + gatedMomentSeqId);
        var webinarDescE = jQuery('#webinar-desc');
        // by default we will set it to medium 
        var fullWebinarSize = "medium";

        if (webinarDescE && webinarDescE.length > 0) {
            var aId = webinarDescE[0].getAttribute('data-account-id');
            fullWebinarSize = webinarDescE[0].getAttribute('data-full-webinar-size');
            if (fullWebinarSize == "custom") {
                fullWebinarCustomWidth = webinarDescE[0].getAttribute('data-full-webinar-custom-width');
                fullWebinarCustomHeight = webinarDescE[0].getAttribute('data-full-webinar-custom-height');
            }

            if (aId) accountId = aId;

            let fullWebinarVideoUrl = webinarDescE[0].getAttribute('data-video-url');
            let video = document.getElementById("vidFullWebinar");

            if (video)
                initShakaPlayer(video, fullWebinarVideoUrl);
        }

        for (let i = 1; i <= nSpeakers; i++) {
            //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //jQuery("#speaker-img-" + i).attr("src", baseurl + 'images/' + w + '/speaker-' + i + '.jpg');
            var speakerId = jQuery("#speaker-img-" + i).attr('data-speaker-id');
            jQuery("#speaker-img-" + i).attr("src", baseurl + "images/" + w + "/speaker-" + speakerId + ".jpg");
        }

        for (let i = 1; i <= nMoments; i++) {
            let dashUrl = getMomentUrlFromMomentSeq(i);
            let video = document.getElementById("moment-" + i + "-video");
            if (video)
                initShakaPlayer(video, dashUrl);
        }

        momentVideoPlayers.forEach(function (player) {
            player.on('playing', function (event) {
                player.toggleControls(true);
                momentVideoPlayers.forEach(function (p) {
                    if (p.id !== event.detail.plyr.id)
                        p.pause();
                });
            });
            player.on('canplay', function (event) {
                this.closest(".plyr").className += " plyr--stopped";
            });
        });

        var fullwebinarGates = jQuery("#full-webinar.gated");
        if (fullwebinarGates && fullwebinarGates.length > 0) {
            isFullWebinarGated = true;
        }

        initAnaliticEvents(accountId);

        // Display the modal on clicking a gated video element
        $('.gated-video').on('click', function() {
            if(options && options.initGating) {
                $('#video-modal').modal();
            }
        })

    }

    function initRxLiteJsScripts(callback) {

        addScript({
            src: baseurlAdminAppUrl + "javascripts/rx.lite.min.js",
            type: 'text/javascript',
            async: null
        }, null, callback);
    }

    function initRxJsScripts(callback) {

        addScript({
            src: baseurlAdminAppUrl + "javascripts/rx.min.js",
            type: 'text/javascript',
            async: null
        }, null, callback);

    }

    function initRxJsJqueryScripts(callback) {

        addScript({
            src: baseurlAdminAppUrl + "javascripts/rx.jquery.min.js",
            type: 'text/javascript',
            async: null
        }, null, callback);

    }

    function initAnaliticEvents(accountId) {

        let webinarViewedObservable = sendAnaliticData(accountId, w, null, null, null, null, null, "webinar_viewed");

        webinarViewedObservable.subscribe(function(){ console.log("webinar_viewed"); }, function(err){ console.error(err); });

        for (let i = 1; i <= nMoments; i++) {

            let momentId = getMomentIdFromMomentSeqId(i);

            let momentVideoPlayer = document.getElementById("moment-" + i + "-video");

            if (momentVideoPlayer) {

                let playingMomentObservable = Rx.Observable.fromEvent(momentVideoPlayer, 'playing');

                let suggestions = playingMomentObservable.flatMap(function(){ return sendAnaliticData(accountId, w, momentId, null, null, null, null, "moment_played"); });

                suggestions.subscribe(function () { console.log("moment_played"); }, function(err){ console.error(err); });
            }

        }

        let webinarVideoPlayer = document.getElementById("vidFullWebinar");

        if (webinarVideoPlayer) {

            let playingWebinarObservable = Rx.Observable.fromEvent(webinarVideoPlayer, 'playing');

            let suggestions = playingWebinarObservable.flatMap(function(){ return sendAnaliticData(accountId, w, null, null, null, null, null, "webinar_played"); });

            suggestions.subscribe(function () { console.log("webinar_played"); }, function(err){ console.error(err); });
        }

        let gatedVideos = document.getElementsByClassName("gated-video");

        for (let j = 0; j < gatedVideos.length; j++) {

            let momentId = gatedVideos[j].getAttribute("data-moment-id");

            let gatedVideoObservable = Rx.Observable.fromEvent(gatedVideos[j], 'click');

            let suggestions = gatedVideoObservable.flatMap(function(){ return sendAnaliticData(accountId, w, momentId, null, null, null, null, "gate_clicked"); });

            suggestions.subscribe(function () { console.log("gate_clicked"); }, function(err){ console.error(err); });
        }

        let gatedForm = $("form[id*=mktoForm_]");

        if (gatedForm.length > 0) {

            let form = gatedForm[0];

            let gatedFormObservable = Rx.Observable.fromEvent(form, 'submit');

            let suggestions = gatedFormObservable.flatMap(function(){ return sendAnaliticData(accountId, w, null, null, null, null, null, "gate_submitted"); });

            suggestions.subscribe(function () { console.log("gate_submitted"); }, function(err){ console.error(err); });

        }

    }

    function sendAnaliticData(accountId, webinarId, momentId, speakerId, start, end, socialChannel, eventType) {

        var eventJson = {};
        eventJson.accountId = Number.isInteger(parseInt(accountId)) ? parseInt(accountId) : 0;
        eventJson.webinarId = Number.isInteger(parseInt(webinarId)) ? parseInt(webinarId) : 0;
        eventJson.momentId = Number.isInteger(parseInt(momentId)) ? parseInt(momentId) : 0;
        eventJson.eventType = eventType;

        return $.ajaxAsObservable({
            url: analyticsEventsCaptureEndPoint,
            data: JSON.stringify(eventJson),
            type: 'POST',
            contentType: 'application/json'
        });
    }


    var Modal = function (element, options) {
        this.options = options
        this.$body = jQuery(document.body)
        this.$element = jQuery(element)
        this.$dialog = this.$element.find('.modal-dialog')
        this.$backdrop = null
        this.isShown = null
        this.originalBodyPad = null
        this.scrollbarWidth = 0
        this.ignoreBackdropClick = false

        if (this.options.remote) {
            this.$element
                .find('.modal-content')
                .load(this.options.remote, jQuery.proxy(function () {
                    this.$element.trigger('loaded.bs.modal')
                }, this))
        }
    }

    Modal.VERSION = '3.3.7'

    Modal.TRANSITION_DURATION = 300
    Modal.BACKDROP_TRANSITION_DURATION = 150

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }

    Modal.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }

    Modal.prototype.show = function (_relatedTarget) {
        var that = this
        var e = jQuery.Event('show.bs.modal', {
            relatedTarget: _relatedTarget
        })

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('modal-open')

        this.escape()
        this.resize()

        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', jQuery.proxy(this.hide, this))

        this.$dialog.on('mousedown.dismiss.bs.modal', function () {
            that.$element.one('mouseup.dismiss.bs.modal', function (e) {
                if (jQuery(e.target).is(that.$element)) that.ignoreBackdropClick = true
            })
        })

        this.backdrop(function () {
            var transition = jQuery.support.transition && that.$element.hasClass('fade')

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0)

            that.adjustDialog()

            if (transition) {
                that.$element[0].offsetWidth // force reflow
            }

            that.$element.addClass('in')

            that.enforceFocus()

            var e = jQuery.Event('shown.bs.modal', {
                relatedTarget: _relatedTarget
            })

            transition ?
                that.$dialog // wait for modal to slide in
                    .one('bsTransitionEnd', function () {
                        that.$element.trigger('focus').trigger(e)
                    })
                    .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                that.$element.trigger('focus').trigger(e)
        })
    }

    Modal.prototype.hide = function (e) {
        if (e) e.preventDefault()

        e = jQuery.Event('hide.bs.modal')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()
        this.resize()

        jQuery(document).off('focusin.bs.modal')

        this.$element
            .removeClass('in')
            .off('click.dismiss.bs.modal')
            .off('mouseup.dismiss.bs.modal')

        this.$dialog.off('mousedown.dismiss.bs.modal')

        jQuery.support.transition && this.$element.hasClass('fade') ?
            this.$element
                .one('bsTransitionEnd', jQuery.proxy(this.hideModal, this))
                .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
            this.hideModal()
    }

    Modal.prototype.enforceFocus = function () {
        jQuery(document)
            .off('focusin.bs.modal') // guard against infinite focus loop
            .on('focusin.bs.modal', jQuery.proxy(function (e) {
                if (document !== e.target &&
                    this.$element[0] !== e.target &&
                    !this.$element.has(e.target).length) {
                    this.$element.trigger('focus')
                }
            }, this))
    }

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.modal', jQuery.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal')
        }
    }

    Modal.prototype.resize = function () {
        if (this.isShown) {
            jQuery(window).on('resize.bs.modal', jQuery.proxy(this.handleUpdate, this))
        } else {
            jQuery(window).off('resize.bs.modal')
        }
    }

    Modal.prototype.hideModal = function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
            that.$body.removeClass('modal-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.modal')
        })
    }

    Modal.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }

    Modal.prototype.backdrop = function (callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
            var doAnimate = jQuery.support.transition && animate

            this.$backdrop = jQuery(document.createElement('div')).appendTo(this.$body);

            //.addClass('modal-backdrop ' + animate)

            this.$element.on('click.dismiss.bs.modal', jQuery.proxy(function (e) {
                if (this.ignoreBackdropClick) {
                    this.ignoreBackdropClick = false
                    return
                }
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static' ?
                    this.$element[0].focus() :
                    this.hide()
            }, this))

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')

            if (!callback) return

            doAnimate ?
                this.$backdrop
                    .one('bsTransitionEnd', callback)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callback()

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')

            var callbackRemove = function () {
                that.removeBackdrop()
                callback && callback()
            }
            jQuery.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                    .one('bsTransitionEnd', callbackRemove)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callbackRemove()

        } else if (callback) {
            callback()
        }
    }


    Modal.prototype.handleUpdate = function () {
        this.adjustDialog()
    }

    Modal.prototype.adjustDialog = function () {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        })
    }

    Modal.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: '',
            paddingRight: ''
        })
    }

    Modal.prototype.checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect()
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
        this.scrollbarWidth = this.measureScrollbar()
    }

    Modal.prototype.setScrollbar = function () {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        this.originalBodyPad = document.body.style.paddingRight || ''
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }

    Modal.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', this.originalBodyPad)
    }

    Modal.prototype.measureScrollbar = function () { // thx walsh
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }

    // MODAL PLUGIN DEFINITION
    // =======================

    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = jQuery(this)
            var data = $this.data('bs.modal')
            var options = jQuery.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }

};
