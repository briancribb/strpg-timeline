(function(){

	/*
	 Layout management is powered by jQuery because it has nothing to do with the data. This function 
	 corrects the app's padding and margins on the top/bottom to make room for the nav and our sticky footer.
	 */

	var $bodyElement		= $('body'),
		$navbar				= $('#navbar'),
		$pageFooter			= $('#page-footer'),
		$pageFooterContent	= $('#page-footer-content');

	var throttled = _.throttle(function(){
		manageResize();
	}, 250);

	function manageResize() {
		var footerHeight = $pageFooterContent.outerHeight(true);
		$pageFooter.height( footerHeight );

		// Correct footer height upon resize and correct top body padding for navbar height
		$bodyElement.css({
			'padding-bottom':footerHeight,
			'padding-top':$navbar.outerHeight(true)
		});
	}

	// Run it once to cover smaller window sizes on page load.
	manageResize();

	// Now start throttling.
	$(window).resize(throttled);
}());
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Timeline = function (_React$Component) {
	_inherits(Timeline, _React$Component);

	// In case we need initial states, which we will because we're waiting for data.
	function Timeline() {
		_classCallCheck(this, Timeline);

		// Gotta call this first when doing a constructor.
		var _this = _possibleConstructorReturn(this, (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).call(this));
		//console.log('constructor()');


		_this.state = {
			test: false
		};
		_this._getData();
		return _this;
	}

	/*
 Showing a download icon while the assets load, and then a round arrow spinner while the data loads. When the "loading" 
 class is removed, the initial loader container is hidden and the Timeline app container is shown. 
 */


	_createClass(Timeline, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			$('body').removeClass('loading');
		}

		/*
  After the app updates, we run some jQuery to put every other entry on the right side. This could have been done by 
  looping through the entries array and checking to see who's visible, but we're already paying for jQuery in our page 
  load so we should just go ahead and use it where appropriate.
  */

	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			if (this.state.initialized) {
				this._alternateFloats();
			}
		}

		/*
  The app has some basic code that runs when there's no data. Once this stuff comes in, the timeline events will render.
  */

	}, {
		key: '_getData',
		value: function _getData() {
			var that = this,
			    dfd_array = [],
			    dfd_sources = {
				UFP: { path: 'assets/js/data/UFP.json', id: 'oesera6', hasFull: false, show: true, showFull: true, name: 'United Federation of Planets' },
				KLE: { path: 'assets/js/data/KLE.json', id: 'o15noc3', hasFull: true, show: true, showFull: false, name: 'Klingon Empire' },
				RSA: { path: 'assets/js/data/RSA.json', id: 'or7u0kt', hasFull: true, show: true, showFull: false, name: 'Romulan Star Empire' },
				TRI: { path: 'assets/js/data/TRI.json', id: 'ol08r1n', hasFull: false, show: true, showFull: true, name: 'Triangle' },
				ORC: { path: 'assets/js/data/ORC.json', id: 'ohu3d91', hasFull: true, show: true, showFull: false, name: 'Orion Colonies' },
				RFW: { path: 'assets/js/data/RFW.json', id: 'oypmvfb', hasFull: false, show: true, showFull: true, name: 'Romulan/Federation War' },
				FYW: { path: 'assets/js/data/FYW.json', id: 'oi1ju2s', hasFull: false, show: true, showFull: true, name: 'Four Years War' },
				ST3: { path: 'assets/js/data/ST3.json', id: 'o5oxeec', hasFull: false, show: true, showFull: true, name: 'Star Trek 3 Update' },
				ST4: { path: 'assets/js/data/ST4.json', id: 'oxxpvso', hasFull: false, show: true, showFull: true, name: 'Star Trek 4 Update' },
				SFI: { path: 'assets/js/data/SFI.json', id: 'ohqn30t', hasFull: false, show: true, showFull: true, name: 'Starfleet Intelligence' },
				ITA: { path: 'assets/js/data/ITA.json', id: 'orojt89', hasFull: false, show: true, showFull: true, name: "UFP/Independent Traders' Association" }
			},
			    objData = {
				sources: {},
				entries: []
			};

			$.each(dfd_sources, function (key, value) {
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
				}).success(function (data) {

					/* The data structure is straight from Google, so we still need to drill down into it to get our array. */
					//APP.data[key] = data.feed.entry;

					/* Keep some stuff from the dfd_sources array. */
					objData.sources[key] = {
						name: value.name,
						hasFull: value.hasFull,
						show: value.show,
						showFull: value.showFull
					};

					/* Process data into the main timeline. */
					for (var i = 0; i < data.feed.entry.length; i++) {

						var dateParts = starToDate(data.feed.entry[i].gsx$stardate.$t);

						objData.entries.push({
							inverted: false,
							stardate: data.feed.entry[i].gsx$stardate.$t,
							sortkey: Number(dateParts.year + '.' + dateParts.month + '' + dateParts.date),
							end: data.feed.entry[i].gsx$stardateend.$t || null,
							century: dateParts.century,
							year: dateParts.year,
							month: dateParts.month,
							date: dateParts.date,
							source: data.feed.title.$t,
							full: data.feed.entry[i].gsx$full.$t === "TRUE",
							desc: data.feed.entry[i].gsx$event.$t
						});
					};

					/* All done with this JSON file, so we'll resolve its Deferred object. */
					value.dfd.resolve();
				});
			});

			/* http://stackoverflow.com/questions/5627284/pass-in-an-array-of-deferreds-to-when */
			/* 
   Sort the entries by their sortkey, which is basically a date. We're not picky about events with the same sortkey value. 
   Once that's done, we set the 'initialized' property to true for objData. We then pass this object into the app state. The 
   initialized property is used elsewhere to see if the app has data. If that property is true, then we have our sorted 
   entries, sources, etc.
   */
			$.when.apply(null, dfd_array).done(function () {
				//console.log("All of the ajax calls are complete. Length is " + APP.events.length);

				objData.entries = _.sortBy(objData.entries, 'sortkey');
				objData.initialized = true;

				objData.parentClasses = that._getParentClasses(objData.sources);

				that.setState(objData);

				that._alternateFloats();
				that._addListeners();

				//console.log('that.state');
				//console.log(that);
			});

			function starToDate(stardate) {
				/* format: CC/YYMM.DD */
				var starSplit, dateSplit, dateParts;

				/* Split the year from the date. */
				starSplit = stardate.replace(/,/g, '').split('/');
				dateParts = {
					year: 2000 + Number(starSplit[0]) * 100 + Number(starSplit[1].substring(0, 2))
				};

				if (starSplit[1].length > 2) {
					dateSplit = starSplit[1].split('.');
				}

				dateParts.century = starSplit[0];
				dateParts.month = dateSplit[0].substring(2, 4);
				dateParts.date = dateSplit[1] || "00";

				dateParts.month = dateParts.month === '00' ? '01' : dateParts.month;
				dateParts.date = dateParts.date === '00' ? '01' : dateParts.date;
				return dateParts;
			}
		} // End of _getData()

	}, {
		key: '_addListeners',
		value: function _addListeners() {
			var $pageHeader = $('#page-header'),
			    $pageFooter = $('#page-footer'),
			    $inputCentury = $('#century-search');

			/*
   Our nav buttons are used to scroll in the browser, and have nothing to do with the data. They're also outside of 
   the app. Using jQuery to move between the top and bottom of the page.  
   */
			$('body').on("click", function (event) {
				var $target = $(event.target);
				switch (event.target.id) {

					// Return to the top
					case 'navbar-brand':
						window.scroll(0, 0);
						break;

					// Return to the top
					case 'btn-return-top':
						scrollToPosition(0);
						break;

					// Scroll to the footer
					case 'btn-footer':
						scrollToPosition($pageFooter.position().top);
						break;

					// Search for a the first entry in a given century
					case 'btn-search':
						scrollToCentury();
						break;

					default:
						/* If there's no id or it doesn't match anything, then do nothing. */
						break;
				}
			});

			// Submit the century search when the user presses Enter while focused on the input.
			$inputCentury.on("keypress", function (event) {
				if (event.which == '13') {
					event.preventDefault();
					scrollToCentury();
				}
			});

			// Scroll to the first visible entry which has a century data attribute matching the value of the search input.
			function scrollToCentury() {
				var century = $inputCentury.val();
				if (century !== '') {
					if (Number(century) === NaN) {
						$inputCentury.val('');
					} else {
						var scrollTarget = null,
						    offset = $pageHeader.outerHeight(true);

						$('.tl-entry:visible').each(function (i) {
							var currentCentury = $(this).data('century');
							if (currentCentury >= century) {
								scrollTarget = offset + $(this).position().top;
								return false;
							}
						});
						if (scrollTarget !== null) {
							scrollToPosition(scrollTarget);
							$inputCentury.val('');
						}
					}
				}
			}

			// Scroll to a given vertical position. Used to find entries and to skip to the top or bottom.
			function scrollToPosition(position) {
				$('html,body').stop().animate({ scrollTop: position }, 1000);
			}
		}

		/*
  Returns an array of JSX React components to be used as timeline entries. Since this function is a top-level 
  method of the Timeline component, it has access to the component state.
  */

	}, {
		key: '_getEntries',
		value: function _getEntries() {
			var _this2 = this;

			var key = 0;
			return this.state.entries.map(function (entry) {
				entry.key = key;
				var source = _this2.state.sources[entry.source];
				var show = source.show && entry.full === source.showFull ? true : false;
				var markup = React.createElement(TLEntry, { obj: entry, name: source.name, show: show, key: key });
				key++;
				return markup;
			});
		}

		/*
  Visibility of the entries depends upon the state object, which is driven by the toggle buttons at the 
  top of the app. This function toggles two propeties: show and showFull. The 'show' property determines 
  whether entries will appear at all, and 'showFull' determines which kind of entries to show.
  	The major governments have two timelines to pick from, which cannot be viewed at the same time. The 
  'full' entries are factual data about a culture, while the regular entries reflect what the UFP knows 
  about them. Obviously, the full entries are more accurate.
  	To avoid writing extra logic, timelines with only one set of entries are have their 'showFull' property 
  set to true. The UFP knows all about itself, so every entry is considered to be a 'full' entry. And of 
  course, some of the smaller game suppliments from FASA way-back-when didn't have double timelines. That 
  was more of a literary device used for the Klingons, Romulans and Orions in the game.
  */

	}, {
		key: '_updateSource',
		value: function _updateSource(source, full) {
			//console.log('--- _updateSource(' + source + ', ' + full + ')');

			// Toggles the boolean value of a source object's "show" property.
			var that = this;
			var newSources = _.clone(that.state.sources);
			var strClasses = '';

			if (full !== undefined) {
				// Deciding whether to show full or regular. Single timelines are listed as always being "full".
				newSources[source].showFull = !newSources[source].showFull;
			} else {
				// Deciding whether to show at all
				newSources[source].show = !newSources[source].show;
			}
			strClasses = that._getParentClasses(newSources);

			that.setState({
				sources: newSources,
				parentClasses: strClasses
			});
			//console.log(that.state.parentClasses);
		}

		/*
  Started this with classes for show/hidden on the timeline entries, because I wanted to learn how to 
  pass functions as props down to a child component. Now that I've learned it, I'm switching back to a 
  CSS-powered approach. The CSS is already there from the previous jQuery version of this app. Entries 
  will show (or not) based upon a parent class. It's more performant for React to just update the class 
  string on the parent element rather than zooming through all of the entries to update them on an 
  individual basis.
  */

	}, {
		key: '_getParentClasses',
		value: function _getParentClasses(sources) {
			var arrClasses = [];
			var test = _.map(sources, function (item, key) {

				// Add the source name as a class if needed.
				if (item.show === true) {
					arrClasses.push(key);
				}

				// Only add the 'full' class when the sources with two versions.
				if (item.hasFull === true && item.showFull === true) {
					arrClasses.push(key + '-full');
				}
				return;
			});
			var strClasses = arrClasses.toString().replace(/,/g, " ");

			// Return the final string of classes.
			return strClasses;
		}

		/*
  Every other visible entry gets floated to the right. I could do this by altering the entries and setting 
  state, but jQuery can do this pretty well and I'm already paying for it in my page load speed. This function 
  runs during the componentDidUpdate() lifecycle method, so it always works with the most recently updated 
  set of entries.
  */

	}, {
		key: '_alternateFloats',
		value: function _alternateFloats() {
			$('.tl-entry:visible').each(function (i) {
				// Test for i+1 because i will start as zero.
				if ((i + 1) % 2 === 0) {
					$(this).addClass('tl-inverted');
				} else {
					$(this).removeClass('tl-inverted');
				}
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var markup = null;

			if (this.state.initialized) {
				var entries = this._getEntries();
				markup = React.createElement(
					'div',
					{ id: 'timeline' },
					React.createElement(TLToggles, { sources: this.state.sources, updateSource: this._updateSource.bind(this) }),
					React.createElement(
						'ul',
						{ id: 'tl-list', className: "tl-list " + this.state.parentClasses },
						entries
					)
				);
			} else {
				markup = React.createElement(
					'div',
					{ className: 'page-load text-center' },
					React.createElement(
						'div',
						{ id: 'page-load-spinner', className: 'page-load-spinner' },
						React.createElement('span', { className: 'glyphicon glyphicon-repeat trans-spin', 'aria-hidden': 'true' })
					),
					React.createElement(
						'p',
						null,
						'Loading Timeline Events...'
					)
				);
			}
			return markup;
		}
	}]);

	return Timeline;
}(React.Component);

/*
Individual button groups for an individual timeline source. If the source has a "full" timeline in addition 
to the regular one, then it will have an extra button for toggling between the entry types.
*/


var ButtonGroup = function (_React$Component2) {
	_inherits(ButtonGroup, _React$Component2);

	function ButtonGroup() {
		_classCallCheck(this, ButtonGroup);

		return _possibleConstructorReturn(this, (ButtonGroup.__proto__ || Object.getPrototypeOf(ButtonGroup)).apply(this, arguments));
	}

	_createClass(ButtonGroup, [{
		key: '_handleToggle',
		value: function _handleToggle() {
			this.props.updateSource(this.props.source);
		}
	}, {
		key: '_handleFull',
		value: function _handleFull() {
			this.props.updateSource(this.props.source, this.props.showFull);
		}
	}, {
		key: 'render',
		value: function render() {
			var activeShow = this.props.show ? ' active' : '';
			var activeFull = this.props.showFull ? ' active' : '';
			var btnFull = void 0;
			if (this.props.hasFull) {
				btnFull = React.createElement(
					'button',
					{ onClick: this._handleFull.bind(this), id: this.props.source + "-full", type: 'button', className: "btn btn-" + this.props.type + " btn-lg " + this.props.source + activeFull },
					'Full'
				);
			}
			return React.createElement(
				'div',
				{ className: 'btn-group', role: 'group', 'aria-label': this.props.source },
				React.createElement(
					'button',
					{ onClick: this._handleToggle.bind(this), id: this.props.source + "-toggle", type: 'button', className: "btn btn-" + this.props.type + " btn-lg " + this.props.source + activeShow },
					this.props.source
				),
				btnFull
			);
		}
	}]);

	return ButtonGroup;
}(React.Component);

/*
Groups of toggle buttons which turn timeline entries on and off according to the category of the button.
*/


var TLToggles = function (_React$Component3) {
	_inherits(TLToggles, _React$Component3);

	function TLToggles() {
		_classCallCheck(this, TLToggles);

		return _possibleConstructorReturn(this, (TLToggles.__proto__ || Object.getPrototypeOf(TLToggles)).apply(this, arguments));
	}

	_createClass(TLToggles, [{
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				{ id: 'tl-toggles', className: 'source-toggles' },
				React.createElement(
					'div',
					{ className: 'panel panel-primary' },
					React.createElement(
						'div',
						{ className: 'panel-body bg-info' },
						React.createElement(
							'p',
							null,
							'Major Governments'
						),
						React.createElement(
							'div',
							{ id: 'source-toolbar', className: 'btn-toolbar', role: 'toolbar', 'aria-label': 'Toolbar with button groups' },
							React.createElement(ButtonGroup, { source: 'UFP', type: 'primary', hasFull: this.props.sources.UFP.hasFull, show: this.props.sources.UFP.show, showFull: this.props.sources.UFP.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'KLE', type: 'primary', hasFull: this.props.sources.KLE.hasFull, show: this.props.sources.KLE.show, showFull: this.props.sources.KLE.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'RSA', type: 'primary', hasFull: this.props.sources.RSA.hasFull, show: this.props.sources.RSA.show, showFull: this.props.sources.RSA.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'ORC', type: 'primary', hasFull: this.props.sources.ORC.hasFull, show: this.props.sources.ORC.show, showFull: this.props.sources.ORC.showFull, updateSource: this.props.updateSource })
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'span',
								{ className: 'label label-primary' },
								"UFP: " + this.props.sources.UFP.name
							),
							React.createElement(
								'span',
								{ className: 'label label-primary' },
								"KLE: " + this.props.sources.KLE.name
							),
							React.createElement(
								'span',
								{ className: 'label label-primary' },
								"RSA: " + this.props.sources.RSA.name
							),
							React.createElement(
								'span',
								{ className: 'label label-primary' },
								"ORC: " + this.props.sources.ORC.name
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'panel panel-warning' },
					React.createElement(
						'div',
						{ className: 'panel-body bg-warning' },
						React.createElement(
							'p',
							null,
							'Misc'
						),
						React.createElement(
							'div',
							{ id: 'source-toolbar', className: 'btn-toolbar', role: 'toolbar', 'aria-label': 'Toolbar with button groups' },
							React.createElement(ButtonGroup, { source: 'TRI', type: 'warning', hasFull: this.props.sources.TRI.hasFull, show: this.props.sources.TRI.show, showFull: this.props.sources.TRI.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'SFI', type: 'warning', hasFull: this.props.sources.SFI.hasFull, show: this.props.sources.SFI.show, showFull: this.props.sources.SFI.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'ITA', type: 'warning', hasFull: this.props.sources.ITA.hasFull, show: this.props.sources.ITA.show, showFull: this.props.sources.ITA.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'ST3', type: 'warning', hasFull: this.props.sources.ST3.hasFull, show: this.props.sources.ST3.show, showFull: this.props.sources.ST3.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'ST4', type: 'warning', hasFull: this.props.sources.ST4.hasFull, show: this.props.sources.ST4.show, showFull: this.props.sources.ST4.showFull, updateSource: this.props.updateSource })
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'span',
								{ className: 'label label-warning' },
								"TRI: " + this.props.sources.TRI.name
							),
							React.createElement(
								'span',
								{ className: 'label label-warning' },
								"SFI: " + this.props.sources.SFI.name
							),
							React.createElement(
								'span',
								{ className: 'label label-warning' },
								"ITA: " + this.props.sources.ITA.name
							),
							React.createElement(
								'span',
								{ className: 'label label-warning' },
								"ST3: " + this.props.sources.ST3.name
							),
							React.createElement(
								'span',
								{ className: 'label label-warning' },
								"ST4: " + this.props.sources.ST4.name
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'panel panel-danger' },
					React.createElement(
						'div',
						{ className: 'panel-body bg-danger' },
						React.createElement(
							'p',
							null,
							'Wars'
						),
						React.createElement(
							'div',
							{ id: 'source-toolbar', className: 'btn-toolbar', role: 'toolbar', 'aria-label': 'Toolbar with button groups' },
							React.createElement(ButtonGroup, { source: 'RFW', type: 'danger', hasFull: this.props.sources.RFW.hasFull, show: this.props.sources.RFW.show, showFull: this.props.sources.RFW.showFull, updateSource: this.props.updateSource }),
							React.createElement(ButtonGroup, { source: 'FYW', type: 'danger', hasFull: this.props.sources.FYW.hasFull, show: this.props.sources.FYW.show, showFull: this.props.sources.FYW.showFull, updateSource: this.props.updateSource })
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'span',
								{ className: 'label label-danger' },
								"RFW: " + this.props.sources.RFW.name
							),
							React.createElement(
								'span',
								{ className: 'label label-danger' },
								"FYW: " + this.props.sources.FYW.name
							)
						)
					)
				)
			);
		}
	}]);

	return TLToggles;
}(React.Component);

/*
An individual timeline entry.
*/


var TLEntry = function (_React$Component4) {
	_inherits(TLEntry, _React$Component4);

	function TLEntry() {
		_classCallCheck(this, TLEntry);

		return _possibleConstructorReturn(this, (TLEntry.__proto__ || Object.getPrototypeOf(TLEntry)).apply(this, arguments));
	}

	_createClass(TLEntry, [{
		key: 'render',
		value: function render() {
			var entry = this.props.obj;

			return (
				//<li>{this.props.obj.century}</li>
				React.createElement(
					'li',
					{ id: "tl-entry-" + entry.key, className: "tl-entry " + entry.source + " tl-full-" + entry.full, 'data-century': entry.century },
					React.createElement('div', { className: 'tl-badge' }),
					React.createElement(
						'div',
						{ className: 'tl-panel' },
						React.createElement(
							'div',
							{ className: 'tl-heading' },
							React.createElement(
								'h4',
								{ className: 'tl-title' },
								entry.stardate
							),
							React.createElement(
								'p',
								null,
								React.createElement(
									'small',
									{ className: 'tl-subtext text-muted' },
									React.createElement('i', { className: 'glyphicon glyphicon-folder-open' }),
									this.props.name
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'tl-body' },
							entry.desc
						)
					)
				)
			);
		}
	}]);

	return TLEntry;
}(React.Component);

ReactDOM.render(React.createElement(Timeline, null), document.getElementById('timeline-app'));