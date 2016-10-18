/*
===================================================================================================
This module declares top-level methods and instantiates the TL object. It must be loaded first.
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


	/*
	The id value is to identify the worksheets within the Google Sheet that this data came from. Since the data is unlikely to 
	change, I just put the current response into some json files and called them locally.
	*/ 
	var dfd_array = [],
		dfd_sources = {
			UFP: { path:'js/data/UFP.json', id: 'oesera6', hasFull: false, name: 'United Federation of Planets' },
			KLE: { path:'js/data/KLE.json', id: 'o15noc3', hasFull: true,  name: 'Klingon Empire' },
			RSA: { path:'js/data/RSA.json', id: 'or7u0kt', hasFull: true,  name: 'Romulan Star Empire' },
			TRI: { path:'js/data/TRI.json', id: 'ol08r1n', hasFull: false, name: 'Triangle' },
			ORC: { path:'js/data/ORC.json', id: 'ohu3d91', hasFull: true,  name: 'Orion Colonies' },
			RFW: { path:'js/data/RFW.json', id: 'oypmvfb', hasFull: false, name: 'Romulan/Federation War' },
			FYW: { path:'js/data/FYW.json', id: 'oi1ju2s', hasFull: false, name: 'Four Years War' },
			ST3: { path:'js/data/ST3.json', id: 'o5oxeec', hasFull: false, name: 'Star Trek 3 Update' },
			ST4: { path:'js/data/ST4.json', id: 'oxxpvso', hasFull: false, name: 'Star Trek 4 Update' },
			SFI: { path:'js/data/SFI.json', id: 'ohqn30t', hasFull: false, name: 'Starfleet Intelligence' },
			ITA: { path:'js/data/ITA.json', id: 'orojt89', hasFull: false, name: "UFP/Independent Traders' Association" }
		};




	var APP = {
		resizeTasks : [],
		events : [],
		init : function() {
			APP.props = {
				$bodyElement		: $('body'),
				$navbar				: $('#navbar'),
				$inputCentury		: $('#century-search'),
				$sourceToggles		: $('#tl-source'),
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


			/*
			Initial resize tasks. For this small project, all tasks are in here, but for larger projects we could have additional tasks 
			added by other modules.
			 */
			var initTasks = {
				func: function(){

					/* Correct footer height upon resize */
					var footerHeight = APP.props.$pageFooterContent.outerHeight(true);
					APP.props.$pageFooter.height( footerHeight );
					APP.props.$bodyElement.css( 'padding-bottom', footerHeight );

					var siteSize = APP.getSiteViewType();

					/* Correct top body padding for navbar height */
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

			task.args = task.args || [];
			APP.resizeTasks.push(task);
		},
		getData : function() {
			/* Using deferred objects to make sure we get everything before proceeding. */
			var data = {};
			$.each( dfd_sources, function( key, value ) {
				/*
				key:	'UFP'
				value:	{ path:'my/path.json', id: 'myID', name: 'My Name' }
				*/
				value.dfd = $.Deferred();
				dfd_array.push(value.dfd);

				/*
				If I wanted to do something when each individual thingy resolves, then I would do that here. This done() 
				function will fire whenever this deferred object is resolved.
				
				value.dfd.done(function() {
					// Do stuff.
				});

				*/

				$.ajax({
					url: value.path,
					dataType: "json"
				}).success(function(data) {

					/* The data structure is straight from Google, so we still need to drill down into it to get our array. */
					data[key] = data.feed.entry;

					/* Process data into the main timeline. */
					for (var i = 0; i < data.feed.entry.length; i++) {

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

					/* All done with this JSON file, so we'll resolve its Deferred object. */
					value.dfd.resolve();
				});
			});
			/* http://stackoverflow.com/questions/5627284/pass-in-an-array-of-deferreds-to-when */
			$.when.apply(null, dfd_array).done(function() {
				//console.log("All of the ajax calls are complete. Length is " + APP.events.length);
				APP.events = _.sortBy(APP.events, 'year');
				APP.buildTimeline( $('#tl-list') );
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
			The markup for an event looks like this: 
			<li>
				<div class="tl-badge"><i class="glyphicon glyphicon-check"></i></div>
				<div class="tl-panel">
					<div class="tl-heading">
						<h4 class="tl-title">Mussum ipsum cacilds</h4>
						<p><small class="tl-subtext text-muted"><i class="glyphicon glyphicon-time"></i> 11 hours ago via Twitter</small></p>
					</div>
					<div class="tl-body">
						<p>Body stuff here.</p>
					</div>
				</div>
			</li>
			*/

			var documentFragment = $(document.createDocumentFragment());

			for (var i = 0; i < APP.events.length; ++i) {

				APP.events[i].id = i;

				var $li = $("<li/>", { 
										id: "tl-event-" + i,
				 						class: "tl-event " + APP.events[i].source + " tl-full-" + APP.events[i].full,
				 						'data-century': APP.events[i].century
				 					}),
					$badge = $("<div/>", { class: "tl-badge" }),
					$panel = $("<div/>", { class: "tl-panel" }),
					$heading = $("<div/>", { class: "tl-heading" }),
					$title = $("<h4/>", { class: "tl-title", text: APP.events[i].stardate }),
					$body = $("<div/>", { class: "tl-body" });

				/* Putting it all together. */
				//$badge.append( $("<i/>", { class: "glyphicon glyphicon-check" }) );
				$heading.append( $title ).append( '<p><small class="tl-subtext text-muted"><i class="glyphicon glyphicon-folder-open"></i>' + dfd_sources[APP.events[i].source].name + '</small></p>' );
				$body.append( APP.events[i].desc );
				$panel.append( $heading ).append( $body );
				$li.append( $badge ).append( $panel );

				documentFragment.append($li);
			}
			$target.append(documentFragment);

			/*
			Remove the "loading" class to reveal the timeline and hide the spinner.

			Webkit browsers don't animate until the page is loaded, resulting in no spin for me because the local 
			content comes in pretty quick. Firefox spins immediately. This but isn't important enough for me to chase 
			down right now, but I wanted to make a note of it.
			*/
			APP.props.$bodyElement.removeClass('loading');
			APP.alternateFloats();
		},
		addListeners : function() {
			/* One body listener controls the entire app. */
			APP.props.$bodyElement.on( "click", function(event) {
				var $target = $(event.target);

				/* Add or subtract category classes depending upon which button was clicked or scroll to a position. */
				switch (event.target.id) {

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
						/* If there's no id or it doesn't match anything, then do nothing. */
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

						$('.tl-event:visible').each(function (i) {
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
			$('html,body').animate( { scrollTop: position }, 1000 );
		},
		alternateFloats : function() {
			/* Clear out the right-floats and reset them on every other visible timeline event. */
			$('.tl-inverted').removeClass('tl-inverted');
			$('.tl-event:visible').each(function (i) {
				/* Test for i+1 because i will start as zero. */
				if ( (i+1) % 2 === 0) {
					$(this).addClass('tl-inverted');
				}
			});
		},
		manageResize : function() {
			/* Cycle through resize tasks. */
			for (var i = 0; i < APP.resizeTasks.length; i++) {
				var task = APP.resizeTasks[i];
				task.func.apply(this, task.args);
			};
		},
		getSiteViewType : function() {
			var sizes = {
				/*
				Support for CSS break-points, set to match Bootstrap default values. If you change the breakpoints in your 
				CSS then you need to change them here as well. This function should be used in harmony with CSS, making 
				whatever adjustments are needed as the window size changes.
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