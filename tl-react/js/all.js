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


	var APP = {
		resizeTasks : [],
		events : [],
		data : {},
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


			//APP.getData();
			//APP.addListeners();
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