/*
===================================================================================================
This module declares top-level methods and instantiates the AE object. It must be loaded first.
===================================================================================================
*/


/*
The TL object will be the returned result of a self-invoked function. This allows us to expose methods 
for use by other modules while protecting some variables in a closure. If the APP.ui object is already 
defined then it's not altered. This prevents us from running the entire function each time one of its 
internal methods are called.
*/
;var TL = TL || (function(){
	/* This is where we set variables and things that will only live inside the closure. */


	var dfd_array = [],
		dfd_sources = {
			UFP: { path:'js/data/UFP.json', id: 'oesera6', name: 'United Federation of Planets' },
			KLE: { path:'js/data/KLE.json', id: 'o15noc3', name: 'Klingon Empire' },
			RSA: { path:'js/data/RSA.json', id: 'or7u0kt', name: 'Romulan Star Empire' },
			TRI: { path:'js/data/TRI.json', id: 'ol08r1n', name: 'Triangle' },
			ORC: { path:'js/data/ORC.json', id: 'ohu3d91', name: 'Orion Colonies' },
			RFW: { path:'js/data/RFW.json', id: 'oypmvfb', name: 'Romulan/Federation War' },
			FYW: { path:'js/data/FYW.json', id: 'oi1ju2s', name: 'Four Years War' },
			ST3: { path:'js/data/ST3.json', id: 'o5oxeec', name: 'Star Trek 3 Update' },
			ST4: { path:'js/data/ST4.json', id: 'oxxpvso', name: 'Star Trek 4 Update' },
			SFI: { path:'js/data/SFI.json', id: 'ohqn30t', name: 'Starfleet Intelligence' },
			ITA: { path:'js/data/ITA.json', id: 'orojt89', name: "UFP/Independent Traders' Association" }
		};




	var APP = {
		resizeTasks : [],
		events : [],
		data : {},
		init : function() {
			APP.props = {
				$bodyElement		: $('body'),
				$navbar				: $('#navbar'),
				$inputCentury		: $('#century-search'),
				$sourceToggles		: $('#source-toggles'),
				$sourceToolbar		: $('#source-toolbar'),
				$timeline			: $('#timeline'),
				$pageHeader			: $('#page-header'),
				$pageFooter			: $('#page-footer'),
				$pageFooterContent	: $('#page-footer-content')
			};

			/*
			Setup throttling for resize tasks. Run the manageResize function once upon init. This part relies upon having UnderscoreJS 
			loaded along with jQuery. It runs all resize tasks every quarter-second.
			http://underscorejs.org/
			*/
			var throttled = _.throttle(APP.manageResize, 250);
			$(window).resize(throttled);
			APP.manageResize();


			/* Initial resize tasks */
			var initTasks = {
				func: function(){

					// Correct footer height
					var footerHeight = APP.props.$pageFooterContent.outerHeight(true);
					APP.props.$pageFooter.height( footerHeight );
					APP.props.$bodyElement.css( 'padding-bottom', footerHeight );

					var siteSize = APP.getSiteViewType();

					// Correct top body padding for navbar height
					APP.props.$bodyElement.css( 'padding-top', APP.props.$navbar.outerHeight(true) );


					// Support for CSS break-points
					if ( siteSize === 'desk' || siteSize === 'deskWide' ) {
						// Add or remove classes if the window is big.
					} else {
						// Add or remove classesif the window is small.
					}
				},
				args:[] // No arguments, so it's an empty array.
			};
			initTasks.func(initTasks.args); // Initial call of initial resize task.
			APP.addResizeTask(initTasks);


			APP.getData();
			APP.addListeners();
		},
		addResizeTask : function(task) {
			/*
			Adds and object with a "func" property and an "args" property. This is VERY important, because we use the apply() method 
			in manageResize(). All tasks in the queue will be run during resize. We throttle resizing to keep things from getting too crazy.

			Basic syntax:
			myTask = {func:myfunction, args:[arg1,arg2]}

			Example of adding a task:
			var myTask = { func: function(){console.log("I'm resizing!")} }
			APP.addResizeTask(myTask);

			Or you could be fancy and do this:
			APP.addResizeTask( { func: function(){console.log("I'm resizing!")} } );
			*/

			//console.log('adding task');
			task.args = task.args || [];
			APP.resizeTasks.push(task);
		},
		getData : function() {
			/*
			 *  Using deferred objects with the social scripts so we can run 
			 *  functions when any or all of them are finished loading.
			*/

			$.each( dfd_sources, function( key, value ) {
				//console.log( key + ": " + value.path );
				value.dfd = $.Deferred();
				dfd_array.push(value.dfd);

				value.dfd.done(function() {
					//console.log( key + ".dfd is resolved." );
				});

				$.ajax({
					//url: 'https://spreadsheets.google.com/feeds/list/1ztvTpHjCrZhf3cHCZpyIa1-FHjMFh9MJsPNe6FN5HaQ/' + value.id + '/public/full?alt=json', /* value.path, */
					url: value.path,
					dataType: "json"
				}).success(function(data) {
					//console.log(key + " ajax call is complete.");
					APP.data[key] = data.feed.entry;

					/* Process data into the main timeline. */
					for (var i = 0; i < data.feed.entry.length; i++) {
						//var test = data.feed.entry[i].gsx$stardatestart;
						var dateParts = starToDate( data.feed.entry[i].gsx$stardate.$t );

						APP.events.push({
							stardate	:	data.feed.entry[i].gsx$stardate.$t,
							sortkey		:	Number(dateParts.year + '.' + dateParts.month + '' + dateParts.date),
							end			:	data.feed.entry[i].gsx$stardateend.$t || null,
							century		:	dateParts.century,
							year		:	dateParts.year,
							month		:	dateParts.month,
							date		:	dateParts.date,
							source		:	data.feed.title.$t,
							full		:	(data.feed.entry[i].gsx$full.$t === "TRUE"),
							desc		:	data.feed.entry[i].gsx$event.$t
						});
					};
					value.dfd.resolve();
				});

			});
			/* http://stackoverflow.com/questions/5627284/pass-in-an-array-of-deferreds-to-when */
			$.when.apply(null, dfd_array).done(function() {
				//console.log("All of the ajax calls are complete. Length is " + APP.events.length);

				APP.events = _.sortBy(APP.events, 'year');


				APP.buildTimeline( $('#timeline') );
			});

			function starToDate(stardate) {
				/* format: CC/YYMM.DD */
				var starSplit, dateSplit, dateParts;

				/* Split the year from the date. */
				starSplit = stardate.replace(/,/g, '').split('/');
				dateParts =  {
					year : 2000 + (Number(starSplit[0]) * 100) + Number(starSplit[1].substring(0,2))
				}

				if (starSplit[1].length > 2) {
					dateSplit = starSplit[1].split('.');
				}

				dateParts.century = starSplit[0];
				dateParts.month = (dateSplit[0].substring(2,4));
				dateParts.date = (dateSplit[1] || "00");

				dateParts.month = ( dateParts.month === '00' ) ? '01' : dateParts.month
				dateParts.date = ( dateParts.date === '00' ) ? '01' : dateParts.date
				return dateParts;
			}
		},
		buildTimeline : function($target) {
			var allKeys = _.allKeys(dfd_sources);

			_.each(dfd_sources, function(value, key, list){
				$target.addClass(key);
			});

			/*
			<li>
				<div class="timeline-badge"><i class="glyphicon glyphicon-check"></i></div>
				<div class="timeline-panel">
					<div class="timeline-heading">
						<h4 class="timeline-title">Mussum ipsum cacilds</h4>
						<p><small class="timeline-subtext text-muted"><i class="glyphicon glyphicon-time"></i> 11 hours ago via Twitter</small></p>
					</div>
					<div class="timeline-body">
						<p>Body stuff here.</p>
					</div>
				</div>
			</li>
			*/

			var documentFragment = $(document.createDocumentFragment());

			for (var i = 0; i < APP.events.length; ++i) {

				APP.events[i].id = i;

				var $li = $("<li/>", { 
										id: "timeline-event-" + i,
				 						class: "timeline-event " + APP.events[i].source + " timeline-full-" + APP.events[i].full,
				 						'data-century': APP.events[i].century
				 					}),
					$badge = $("<div/>", { class: "timeline-badge" }),
					$panel = $("<div/>", { class: "timeline-panel" }),
					$heading = $("<div/>", { class: "timeline-heading" }),
					$title = $("<h4/>", { class: "timeline-title", text: APP.events[i].stardate }),
					$body = $("<div/>", { class: "timeline-body" });

				/* Putting it all together. */
				//$badge.append( $("<i/>", { class: "glyphicon glyphicon-check" }) );
				$heading.append( $title ).append( '<p><small class="timeline-subtext text-muted"><i class="glyphicon glyphicon-folder-open"></i> ' + dfd_sources[APP.events[i].source].name + '</small></p>' );
				$body.append( APP.events[i].desc );
				$panel.append( $heading ).append( $body );
				$li.append( $badge ).append( $panel );

				documentFragment.append($li);
			}
			$target.append(documentFragment);
			APP.alternateFloats();
		},
		addListeners : function() {
			APP.props.$bodyElement.on( "click", function(event) {
				var $target = $(event.target);

				/* Add or subtract category classes depending upon which button was clicked. */
				switch (event.target.id) {

					/* Major Governments */
					case 'UFP-toggle':
						toggleCategory('UFP');
						break;
					case 'KLE-toggle':
						toggleCategory('KLE');
						break;
					case 'KLE-full':
						toggleCategory('KLE-full');
						break;


					case 'RSA-toggle':
						toggleCategory('RSA');
						break;
					case 'RSA-full':
						toggleCategory('RSA-full');
						break;


					case 'ORC-toggle':
						toggleCategory('ORC');
						break;
					case 'ORC-full':
						toggleCategory('ORC-full');
						break;


					/* Miscellaneous */
					case 'TRI-toggle':
						toggleCategory('TRI');
						break;
					case 'ST3-toggle':
						toggleCategory('ST3');
						break;
					case 'ST4-toggle':
						toggleCategory('ST4');
						break;
					case 'SFI-toggle':
						toggleCategory('SFI');
						break;
					case 'ITA-toggle':
						toggleCategory('ITA');
						break;


					/* Wars */
					case 'RFW-toggle':
						toggleCategory('RFW');
						break;
					case 'FYW-toggle':
						toggleCategory('FYW');
						break;

					/* Return to the top */
					case 'btn-return-top':
						//window.scroll(0, 0);
						APP.scrollToPosition(0);
						break;
					case 'navbar-brand':
						//window.scroll(0, 0);
						window.scrollTo(0, 0);
						break;

					/* Return to the top */
					case 'btn-footer':
						//window.scroll(0, 0);
						APP.scrollToPosition( APP.props.$pageFooter.position().top );
						break;

					/* Search for Century */
					case 'btn-search':
						scrollToCentury();
						break;

					default:
						//Statements executed when none of the values match the value of the expression
						break;
				}
				APP.alternateFloats();

				/* This function must be inside the on() block because it uses the event target's jQuery collection. */
				function toggleCategory(category) {
					if ( $target.hasClass('active') ) {
						$target.removeClass('active');
						APP.props.$timeline.removeClass( category );
					} else {
						$target.addClass('active');
						APP.props.$timeline.addClass(category);
					}
				}
			});

			APP.props.$inputCentury.on( "keypress", function(event) {
				if (event.which == '13') {
					event.preventDefault();
					console.log('Hit enter key.');
					scrollToCentury();
				}
			});

			function scrollToCentury() {

				var century = APP.props.$inputCentury.val();
				if ( century !== '' ) {
					if ( Number(century) === NaN ) {
						APP.props.$inputCentury.val('');
					} else {
						var scrollTarget = null,
							offset =	APP.props.$pageHeader.outerHeight(true);// + 
										//APP.props.$sourceToggles.outerHeight(true);

						$('.timeline-event:visible').each(function (i) {
							var currentCentury = $(this).data('century');
							if ( currentCentury >= century ) {
								scrollTarget = offset + $(this).position().top;
								return false;
							}
						});
						if (scrollTarget !== null) {
							APP.scrollToPosition(scrollTarget);
							APP.props.$inputCentury.val('');
						}
					}
				}
			}
		},
		scrollToPosition : function(position) {
			$('body').animate({
				scrollTop: position,
			}, 1000, function() {
				// Animation complete.
			});
		},
		alternateFloats : function() {
			/* Clear out the right-floats and reset them on every other visible timeline event. */
			$('.timeline-inverted').removeClass('timeline-inverted');
			$('.timeline-event:visible').each(function (i) {
				/* Test for i+1 because i will start as zero. */
				if ( (i+1) % 2 === 0) {
					$(this).addClass('timeline-inverted');
				}
			});
		},
		manageResize : function() {
			// Cycle through resize tasks.
			for (var i = 0; i < APP.resizeTasks.length; i++) {
				var task = APP.resizeTasks[i];
				task.func.apply(this, task.args);
			};
		},
		getSiteViewType : function() {
			var sizes = {
				/*
				Support for CSS break-points. If you change them in the variables Sass file, then 
				you need to change them here as well. This function should be used in harmony with css.
				*/

					xs		: 480,
					sm		: 768,
					md		: 992,
					lg		: 1200
				},
				currentSize = APP.props.$bodyElement.outerWidth(true),
				sizeType = 'xs';

			if ( currentSize >= sizes.sm ) {
				sizeType = "sm";
			}
			if ( currentSize >= sizes.md ) {
				sizeType = "md";
			}
			if ( currentSize >= sizes.lg ) {
				sizeType = "lg";
			}
			return sizeType;
		}
	};	
	return APP;
})();

/* All modules loaded, time to kick off the whole thing. */
$(document).ready(function() {
	TL.init();
});