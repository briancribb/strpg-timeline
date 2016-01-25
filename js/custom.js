/*
===================================================================================================
This module declares top-level methods and instantiates the AE object. It must be loaded first.
===================================================================================================
*/


/*
The AE object will be the returned result of a self-invoked function. This allows us to expose methods 
for use by other modules while protecting some variables in a closure. If the APP.ui object is already 
defined then it's not altered. This prevents us from running the entire function each time one of its 
internal methods are called.
*/
;var TL = TL || (function(){
	/* This is where we set variables and things that will only live inside the closure. */

	var APP = {
		resizeTasks : [],
		init : function() {
			APP.props = {
				$bodyElement		: $('body'),
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