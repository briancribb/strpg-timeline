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
		init : function() {
			APP.props = {
				$bodyElement		: $('body'),
				$navbar				: $('#navbar'),
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
			/* Correct footer height upon resize */
			var footerHeight = APP.props.$pageFooterContent.outerHeight(true);
			APP.props.$pageFooter.height( footerHeight );
			APP.props.$bodyElement.css( 'padding-bottom', footerHeight );

			/* Correct top body padding for navbar height */
			APP.props.$bodyElement.css( 'padding-top', APP.props.$navbar.outerHeight(true) );
		}
	};	
	return APP;
})();