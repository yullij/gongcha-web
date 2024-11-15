;(function($, window, undefined){
	'use strict';


	if('undefined' === typeof window.Newriver){
		var Newriver = window.Newriver = {};
	}


	$(document).ready(function(){
		Util.DeleteSelf();
		Util.Newriver();
		Util.LoadMotion();

		UI.CustomCheck();
		UI.CustomRadio();
		UI.CustomSelect();
		UI.GnbAction();
	});


	var Util = Newriver.Util = {
		Newriver : function(){
			if($.browser.chrome){
				console.log('%cNewriver', 'font-family:NanumGothic; font-size:15px; font-weight:700; color:#ffffff; padding:1px 5px 2px; background:#000000;');
			}
		},

		AjaxPopup : function(type, url){
			var object = {};

			object.html = $('html');
			object.body = $('body');

			switch(type){
				case 'open' :
					try {
						$.ajax({
							url: url,
							timeout: 10000,
							dataType: 'html',
							success: function(data){
								window.rememberH = $(window).outerHeight();
								window.rememberT = $(window).scrollTop();

								object.outer = object.body.append('<div class="layer_outer" />').children('.layer_outer');
								object.inner = object.outer.append('<div class="layer_inner" />').children('.layer_inner');
								object.popup = object.inner.append('<div class="layer_popup" />').children('.layer_popup');
								object.popup.append($(data));

								object.popup.css({'max-height':window.rememberH*0.9});
								object.html.addClass('fixed').css({'top':-window.rememberT});
								object.outer.animate({'opacity':1}, 200);

								object.inner.bind('click', function(e){
									if(e.target == e.currentTarget){
										object.outer = object.body.children('.layer_outer');
										object.html.removeClass('fixed').css({'top':0});
										$(window).scrollTop(window.rememberT);
										object.outer.remove();
									}
								});

								window.onresize = function(){
									window.rememberH = $(window).outerHeight();
									object.popup.css({'max-height':window.rememberH*0.9});
								};
							},
							error: function(xhr){
								alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
							}
						});
					} catch(e) {
						alert(e.description);
					}
					break;
				case 'close' :
					object.outer = object.body.children('.layer_outer');
					object.html.removeClass('fixed').css({'top':0});
					$(window).scrollTop(window.rememberT);
					object.outer.remove();
					break;
				default :
					break;
			}
		},

		DeleteSelf : function(){
			$('a').each(function(){
				if($(this).attr('href') == '#self'){
					if(this.addEventListener){
						this.addEventListener('click', function(e){e.preventDefault();});
					}else{
						this.attachEvent('onclick', function(e){e.returnValue = false;});
					}
				}
			});
		},

		MapApi: function(lat, lng, name, target){
			/* <script src="http://maps.google.com/maps/api/js?key=키값넣는곳&sensor=false"></script> */
			var myOptions = {
				  center : new google.maps.LatLng(lat, lng),
				  mapTypeControl : false,
				  zoom : 17,
				  mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			var map = new google.maps.Map(document.getElementById(target), myOptions);
			var myLatlng = new google.maps.LatLng(lat, lng);
			var marker = new google.maps.Marker({
				position : myLatlng,
				map : map,
				title : name
			});
		},

		GetParents : function(el, parentSelector){
			var max = $(parentSelector).length;
			var pNode;

			for(var i = 0; i < max; i++){
				pNode = $(parentSelector)[i];
				var e = el;
				if(pNode === undefined){pNode = document;};
				if(e === pNode){return true};
				while(e !== pNode){
					if(e === document){
						break;
					}else{
						if(!$(e).length){return;};
						e = e.parentNode;
					}
				}
				if(e === pNode){return true};
			}
			return false;
		},

		MatchMedia : function(function1, function2, resize){
			var media = window.matchMedia('(max-width: 768px)');
			var ready = false;

			function matchesAction(paramse){
				if(!paramse.matches){
					if(!ready && resize){return;}
					function1();
				}else{
					if(!ready && resize){return;}
					function2();
				}
			}

			if(matchMedia){
				matchesAction(media);
				media.addListener(function(parameter){
					matchesAction(parameter);
				});
				ready = true;
			}

			/* 실행문 */
			/*Util.MatchMedia(
				function(){
					console.log('pc');
				},	
				function(){
					console.log('mobile');
				}
			);

			Util.MatchMedia(
				function(){
					window.location.reload(true);
				},	
				function(){
					window.location.reload(true);
				}
			, true);*/
		},

		LoadMotion : function(){
			var $motion = $('.n-motion');
			var windowT;
			if($motion.length){
				$motion.each(function(){
					var $this = $(this);
					var thisF = false;
					var thisT = $(this).offset().top;
					var thisH = $(this).height() / 2;
					var thisP = thisT + thisH;

					$(window).bind('load scroll', function(){
						if(!thisF){
							windowT = $(window).scrollTop() + $(window).height();
							if(windowT > thisP){
								$this.addClass('n-active');
								thisF = true;
							}
						}
					});
				});
			}
		}
	}


	var UI = Newriver.UI = {
		GnbAction : function(){
			/*var $header = $('#header');
			var $depth1 = $('#gnb > li > a');
			var $depth2 = $('#gnb > li > ul > li');

			$depth1.bind('click', function(){
				$header.addClass('open');
				$(this).parent().addClass('on').siblings().removeClass('on');
			});

			$depth2.on('click', function(){
				$header.removeClass('open');
				$depth1.parent().removeClass('on');
			});*/

			var $header = $('#header');
			var $depth1 = $('#gnb > li');

			$depth1.on('mouseover focusin', function(){
				$header.addClass('open');
				$(this).addClass('on').siblings().removeClass('on');
			});

			$header.on('mouseleave focusout', function(){
				$header.removeClass('open');
				$depth1.removeClass('on');
			});
		},

		TabAction : function(tab, con){
			var $tab = $(tab).children(),
				$con = $(con).children();

			$tab.bind('click', function(){
				$(this).addClass('on').siblings().removeClass('on');
				$con.eq($(this).index()).addClass('on').siblings().removeClass('on');
			});
		},

		CustomSelect : function(){
			var select = $('label.slt > select');
			if(!select.length){return;}

			select.each(function(){
				this.selected = $(this).prev('.selected');
				this.selected.text($(this).children('option:selected').text());

				$(this).on('change', function(){
					this.selected.text($(this).children('option:selected').text());
				});
			});
		},

		CustomCheck: function(){
			var chkbox = $('.chk > input');
			if(!chkbox.length){return;}

			chkbox.each(function(){
				this.flag = $(this).prop('checked') ? true : false;
				if(this.flag){
					$(this).parent().addClass('on');
					$(this).find('> input').prop('checked', true);
				}else{
					$(this).parent().removeClass('on');
					$(this).find('> input').prop('checked', false);
				}
			});

			chkbox.bind({
				click : function(){
					if(!this.flag){
						$(this).find('> input').prop('checked', true);
						$(this).parent().addClass('on');
						this.flag = true;
					}else{
						$(this).find('> input').prop('checked', false);
						$(this).parent().removeClass('on');
						this.flag = false;
					}
				},
				keypress : function(){
					if(this.flag){
						$(this).find('> input').prop('checked', true);
						$(this).parent().addClass('on');
						this.flag = true;
					}else{
						$(this).find('> input').prop('checked', false);
						$(this).parent().removeClass('on');
						this.flag = false;
					}
				}
			});
		},

		CustomRadio: function(){
			var radio = $('.rdo > input');
			if(!radio.length){return;}

			radio.each(function(){
				this.flag = $(this).prop('checked') ? true : false;
				if(this.flag){$(this).parent().addClass('on');}
			});

			radio.bind('click keypress', function(){
				var name = $(this).attr('name');
				var $parent = $(this).parent();
				var $siblings = $('input[name='+name+']').parent();
				
				this.flag = $(this).prop('checked') ? true : false;
				$siblings.removeClass('on');
				$parent.addClass('on');
			});
		}
	}


	var Slider = Newriver.Slider = {
		FranchiseMainVisual : function(){
			var slider = $('#franchise_main_visual .bx-slider').bxSlider({
				auto : true,
				pause : 6000,
				speed : 800,
				pager : false,
				easing : 'easeInOutExpo'
			});
		},

		FranchiseVictoryStory : function(){
			var slider = $('#victory_story .bx-slider').bxSlider({
				controls : false,
				speed : 800,
				pagerCustom : '#victory_story .bx-custom-pager',
				easing : 'easeInOutExpo'
			});
		},

		MainVisual : function(){
			var customPager = $('#banner .bx-custom-pager');
			var slideObj = $('#banner .bx-slider li');
			var customPagerOldClass = '';
			var customPagerNewClass = '';
			var videoBoolean = $('#banner').find('iframe').length;
			var firstSlide = $('#banner .bx-slider li').eq(0).find('iframe');
			//var autoValue = firstSlide.length == 1 ? false : true;
			var player;
			var playerId;
			var iframeSrc;

			if(videoBoolean){
				var tag = document.createElement('script');
				tag.src = 'https://www.youtube.com/iframe_api';
				var firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}

			var slider = $('#banner .bx-slider').bxSlider({
				auto : true,
				controls : true,
				pause : 10000,
				speed : 800,
				pagerCustom : '#banner .bx-custom-pager',
				easing : 'easeInOutExpo',
				onSliderLoad : function(){
					if(firstSlide.length){
						playerId = firstSlide.attr('id');
						onYouTubeIframeAPIReady(playerId);
					}
				},
				onSlideBefore : function($slideElement, oldIndex, newIndex){
					console.log($slideElement.find('iframe').closest('li').index() + 1, $slideElement.find('iframe').closest('ul').find('> li').length - 1)
					/*if($slideElement.find('iframe').length){
						slider.stopAuto();
						iframeSrc = $slideElement.find('iframe').attr('src');
						$slideElement.find('iframe').attr('src', iframeSrc);
						$('.bx-slider > li iframe').each(function(){
							if($(this).closest('li').index() == 0)
								$(this).attr('id', 'prev');
							else if ($(this).closest('li').index() == $(this).closest('li').length)
								$(this).attr('id', 'next');
						});
						playerId = $slideElement.find('iframe').attr('id');
						
						onYouTubeIframeAPIReady(playerId);
					}*/
				}
			});

			function onYouTubeIframeAPIReady(id){
				player = new YT.Player(id, {
					events : {
						'onReady': onPlayerReady,
						'onStateChange': onPlayerStateChange
					}
				});
			}

			function onPlayerReady(event){
				event.target.playVideo();
			}

			function onPlayerStateChange(event){
				if(event.data == YT.PlayerState.ENDED){
					slider.goToNextSlide();
					slider.startAuto();
				}else if(event.data == YT.PlayerState.PLAYING){
					slider.stopAuto();
				}else if(event.data == YT.PlayerState.PAUSED){
					slider.startAuto();
				}
			}
		},

		BrandMainBanner : function(){
			var slider = $('#brand_main_banner .bx-slider').bxSlider({
				auto : true,
				pager : false,
				pause : 6000,
				speed : 800,
				easing : 'easeInOutExpo'
			});
		},

		StoreLayer : function(){
			var slider = $('#store_photo .bx-slider').bxSlider({
				slideWidth : 1050,
				adaptiveHeight : true,
				speed : 800,
				pagerCustom : '#store_photo .bx-custom-pager',
				easing : 'easeInOutExpo'
			});
		},

		Interior : function(target){
			var $slider = $(target).find('.interior_slider .bx-slider');
			var $thumb = $(target).find('.interior_thumb .bx-slider');

			var slider = $slider.bxSlider({
				speed : 800,
				pagerCustom : target+' .interior_thumb .bx-slider',
				onSlideBefore : function($slideElement, oldIndex, newIndex){
					slider.thumbIndex = parseInt(newIndex / 5);
					thumb.goToSlide(slider.thumbIndex);
				}
			});

			var thumb = $thumb.bxSlider({
				infiniteLoop : false,
				speed : 800,
				minSlides : 5,
				maxSlides : 5,
				moveSlides : 5,
				slideWidth : 206,
				slideMargin : 10
			});
		}
	}
})(jQuery, window);