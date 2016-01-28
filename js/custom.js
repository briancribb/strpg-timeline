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
		categories : {},
		events : [],
		data : {},
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


			APP.getData();
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
			var dfd_array = [],
				sources = {
					UFP: { path:'js/data/UFP.json', id: 'oesera6' },
					KLE: { path:'js/data/KLE.json', id: 'o15noc3' },
					RSA: { path:'js/data/RSA.json', id: 'or7u0kt' },
					TRI: { path:'js/data/TRI.json', id: 'ol08r1n' },
					ORC: { path:'js/data/ORC.json', id: 'ohu3d91' },
					RFW: { path:'js/data/RFW.json', id: 'oypmvfb' },
					FYW: { path:'js/data/FYW.json', id: 'oi1ju2s' },
					ST3: { path:'js/data/ST3.json', id: 'o5oxeec' },
					ST4: { path:'js/data/ST4.json', id: 'oxxpvso' },
					SFI: { path:'js/data/SFI.json', id: 'ohqn30t' },
					ITA: { path:'js/data/ITA.json', id: 'orojt89' }
				};

			$.each( sources, function( key, value ) {
				//console.log( key + ": " + value.path );
				value.dfd = $.Deferred();
				dfd_array.push(value.dfd);

				value.dfd.done(function() {
					console.log( key + ".dfd is resolved." );
				});


				$.ajax({
					url: 'https://spreadsheets.google.com/feeds/list/1ztvTpHjCrZhf3cHCZpyIa1-FHjMFh9MJsPNe6FN5HaQ/' + value.id + '/public/full?alt=json', /* value.path, */
					/*url: value.path, */
					dataType: "json"
				}).success(function(data) {
					//console.log(key + " ajax call is complete.");
					APP.categories[key] = true;
					APP.data[key] = data.feed.entry;

					/* Process data into the main timeline. */
					for (var i = 0; i < data.feed.entry.length; i++) {
						//var test = data.feed.entry[i].gsx$stardatestart;
						var dateParts = starToDate( data.feed.entry[i].gsx$stardate.$t );

						APP.events.push({
							stardate	:	data.feed.entry[i].gsx$stardate.$t,
							end			:	data.feed.entry[i].gsx$stardateend.$t || null,
							year		:	dateParts.year,
							month		:	dateParts.month,
							date		:	dateParts.date,
							source		:	data.feed.entry[i].gsx$source.$t,
							full		:	(data.feed.entry[i].gsx$full.$t === "TRUE"),
							desc		:	data.feed.entry[i].gsx$event.$t
						});

					};


					value.dfd.resolve();
				});

			});
			/* http://stackoverflow.com/questions/5627284/pass-in-an-array-of-deferreds-to-when */
			$.when.apply(null, dfd_array).done(function() {
				console.log("All of the ajax calls are complete.");
			});


			function starToDate(stardate) {
				/* format: CC/YYMM.DD */
				var starSplit, dateSplit, dateParts;

				starSplit = stardate.split('/');
				dateParts =  {
					year : 2000 + (Number(starSplit[0]) * 100) + Number(starSplit[1].substring(0,2))
				}

				if (starSplit[1].length > 2) {
					dateSplit = starSplit[1].split('.');
				}

				dateParts.month = Number(dateSplit[0].substring(2,4));
				dateParts.date = Number(dateSplit[1] || "00");

				return dateParts;
			}


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