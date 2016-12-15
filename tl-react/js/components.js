class Timeline extends React.Component {
	// In case we need initial states, which we will because we're waiting for data.
	constructor() {
		//console.log('constructor()');
		super(); // Gotta call this first when doing a constructor.
		this.state = {
			test: false
		}
		this._getData();
	}
	/*
	After the app updates, we run some jQuery to put every other entry on the right side. This could have been done by 
	looping through the entries array and checking to see who's visible, but we're already paying for jQuery in our page 
	load so we should just go ahead and use it where appropriate.
	*/
	componentDidUpdate() {
		if (this.state.initialized) {
			this._alternateFloats();
		}
	}

	/*
	The app has some basic code that runs when there's no data. Once this stuff comes in, the timeline events will render.
	*/
	_getData() {
		var that = this,
			dfd_array = [],
			dfd_sources = {
				UFP: { path:'js/data/UFP.json', id: 'oesera6', hasFull: false, show:true, showFull:true,  name: 'United Federation of Planets' },
				KLE: { path:'js/data/KLE.json', id: 'o15noc3', hasFull: true,  show:true, showFull:false, name: 'Klingon Empire' },
				RSA: { path:'js/data/RSA.json', id: 'or7u0kt', hasFull: true,  show:true, showFull:false, name: 'Romulan Star Empire' },
				TRI: { path:'js/data/TRI.json', id: 'ol08r1n', hasFull: false, show:true, showFull:true,  name: 'Triangle' },
				ORC: { path:'js/data/ORC.json', id: 'ohu3d91', hasFull: true,  show:true, showFull:false, name: 'Orion Colonies' },
				RFW: { path:'js/data/RFW.json', id: 'oypmvfb', hasFull: false, show:true, showFull:true,  name: 'Romulan/Federation War' },
				FYW: { path:'js/data/FYW.json', id: 'oi1ju2s', hasFull: false, show:true, showFull:true,  name: 'Four Years War' },
				ST3: { path:'js/data/ST3.json', id: 'o5oxeec', hasFull: false, show:true, showFull:true,  name: 'Star Trek 3 Update' },
				ST4: { path:'js/data/ST4.json', id: 'oxxpvso', hasFull: false, show:true, showFull:true,  name: 'Star Trek 4 Update' },
				SFI: { path:'js/data/SFI.json', id: 'ohqn30t', hasFull: false, show:true, showFull:true,  name: 'Starfleet Intelligence' },
				ITA: { path:'js/data/ITA.json', id: 'orojt89', hasFull: false, show:true, showFull:true,  name: "UFP/Independent Traders' Association" }
			},
			objData = {
				sources:{},
				entries:[]
			};

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
				//APP.data[key] = data.feed.entry;

				/* Keep some stuff from the dfd_sources array. */
				objData.sources[key] = {
					name: value.name,
					hasFull : value.hasFull,
					show : value.show,
					showFull : value.showFull
				}

				/* Process data into the main timeline. */
				for (var i = 0; i < data.feed.entry.length; i++) {

					var dateParts = starToDate( data.feed.entry[i].gsx$stardate.$t );

					objData.entries.push({
						inverted	:	false,
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
		/* 
		Sort the entries by their sortkey, which is basically a date. We're not picky about events with the same sortkey value. 
		Once that's done, we set the 'initialized' property to true for objData. We then pass this object into the app state. The 
		initialized property is used elsewhere to see if the app has data. If that property is true, then we have our sorted 
		entries, sources, etc.
		*/
		$.when.apply(null, dfd_array).done(function() {
			//console.log("All of the ajax calls are complete. Length is " + APP.events.length);

			objData.entries = _.sortBy(objData.entries, 'sortkey');
			objData.initialized = true;
			that.setState(objData);

			//that.setState({initialized:true});
			that._manageLayout();

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
	}// End of _getData()

	_addListeners() {
		let $pageHeader		= $('#page-header'),
			$pageFooter		= $('#page-footer'),
			$inputCentury	= $('#century-search');

		/*
		Our nav buttons are used to scroll in the browser, and have nothing to do with the data. They're also outside of 
		the app. Using jQuery to move between the top and bottom of the page.  
		*/
		$('body').on( "click", function(event) {
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
					scrollToPosition( $pageFooter.position().top );
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
		$inputCentury.on( "keypress", function(event) {
			if (event.which == '13') {
				event.preventDefault();
				scrollToCentury();
			}
		});

		// Scroll to the first visible entry which has a century data attribute matching the value of the search input.
		function scrollToCentury() {
			var century = $inputCentury.val();
			if ( century !== '' ) {
				if ( Number(century) === NaN ) {
					$inputCentury.val('');
				} else {
					var scrollTarget = null,
						offset	= $pageHeader.outerHeight(true);

					$('.tl-entry:visible').each(function (i) {
						var currentCentury = $(this).data('century');
						if ( currentCentury >= century ) {
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
			$('html,body').stop().animate( { scrollTop: position }, 1000 );
		}
	}

	_getEntries() {
		let key = 0;
		return this.state.entries.map((entry) => {
			entry.key = key;
			let source = this.state.sources[entry.source];
			let show = (source.show && entry.full === source.showFull) ? true : false;
			let markup = <TLEntry obj={entry} name={source.name} show={show} key={key} />;
			key ++;
			return(markup);
		});
	}

	/*
	Also powered by jQuery because it has nothing to do with the data. This function corrects the app's padding 
	and margins on the top/bottom to make room for the nav and our sticky footer.
	*/
	_manageLayout() {
		var $bodyElement		= $('body'),
			$navbar				= $('#navbar'),
			$pageFooter			= $('#page-footer'),
			$pageFooterContent	= $('#page-footer-content');

		var throttled = _.throttle(function(){
			var footerHeight = $pageFooterContent.outerHeight(true);
			$pageFooter.height( footerHeight );

			// Correct footer height upon resize and correct top body padding for navbar height
			$bodyElement.css({
				'padding-bottom':footerHeight,
				'padding-top':$navbar.outerHeight(true)
			});

		}, 250);
		$(window).resize(throttled);
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
	_updateSource(source, full) {
		//console.log('--- _updateSource(' + source + ', ' + full + ')');

		// Toggles the boolean value of a source object's "show" property.
		let that = this;
		let newObj = _.clone(this.state.sources);


		if (full !== undefined) {
			// Deciding whether to show full or regular.
			newObj[source].showFull = !newObj[source].showFull;
		} else {
			// Deciding whether to show at all
			newObj[source].show = !newObj[source].show;
		}
		this.setState({
			sources: newObj
		});
	}

	_alternateFloats() {
		// Clear out the right-floats and reset them on every other visible timeline event.
		$('.tl-entry:visible').each(function (i) {
			// Test for i+1 because i will start as zero.
			if ( (i+1) % 2 === 0) {
				$(this).addClass('tl-inverted');
			} else {
				$(this).removeClass('tl-inverted');
			}
		});
	}

	render() {
		let markup = null;

		if (this.state.initialized) {
			const entries = this._getEntries();
			markup = 
				<div id="timeline">
					<TLToggles sources={this.state.sources} updateSource={this._updateSource.bind(this)} />
					<ul id="tl-list" className="tl-list UFP KLE RSA TRI ORC RFW FYW ST3 ST4 SFI ITA">
						{entries}
					</ul>
				</div>
		} else {
			markup = 
				<div id="page-load-message" className="page-load-message text-center">
					<div id="page-load-spinner" className="page-load-spinner"><span className="glyphicon glyphicon-repeat trans-spin" aria-hidden="true"></span></div>
					<p>Loading Timeline Events...</p>
				</div>
		}
		return(
			markup
		); 
	}
}
class ButtonGroup extends React.Component {
	_handleToggle() {
		this.props.updateSource(this.props.source);
	}
	_handleFull() {
		this.props.updateSource(this.props.source, this.props.showFull);
	}
	render() {
		let activeShow = (this.props.show) ? ' active' : '';
		let activeFull = (this.props.showFull) ? ' active' : '';
		let btnFull;
		if (this.props.hasFull) {
			btnFull = <button onClick={this._handleFull.bind(this)} id={this.props.source + "-full"} type="button" className={"btn btn-" + this.props.type + " " + this.props.source + activeFull}>Full</button>
		}
		return(
				<div className="btn-group" role="group" aria-label={this.props.source}>
					<button onClick={this._handleToggle.bind(this)} id={this.props.source + "-toggle"} type="button" className={"btn btn-" + this.props.type + " " + this.props.source + activeShow}>{this.props.source}</button>
					{btnFull}
				</div>
			);
	}
}
class TLToggles extends React.Component {
	render() {
		return(
				<div id="tl-toggles" className="source-toggles">
					<div className="panel panel-primary">
						<div className="panel-body bg-info">
							<p>Major Governments</p>
							<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
								<ButtonGroup source="UFP" type="primary" hasFull={this.props.sources.UFP.hasFull} show={this.props.sources.UFP.show} showFull={this.props.sources.UFP.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="KLE" type="primary" hasFull={this.props.sources.KLE.hasFull} show={this.props.sources.KLE.show} showFull={this.props.sources.KLE.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="RSA" type="primary" hasFull={this.props.sources.RSA.hasFull} show={this.props.sources.RSA.show} showFull={this.props.sources.RSA.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="ORC" type="primary" hasFull={this.props.sources.ORC.hasFull} show={this.props.sources.ORC.show} showFull={this.props.sources.ORC.showFull} updateSource={this.props.updateSource}/>
							</div>
							<div>
								<span className="label label-primary">{"UFP: " + this.props.sources.UFP.name}</span>
								<span className="label label-primary">{"KLE: " + this.props.sources.KLE.name}</span>
								<span className="label label-primary">{"RSA: " + this.props.sources.RSA.name}</span>
								<span className="label label-primary">{"ORC: " + this.props.sources.ORC.name}</span>
							</div>
						</div>
					</div>
					<div className="panel panel-warning">
						<div className="panel-body bg-warning">
							<p>Misc</p>
							<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
								<ButtonGroup source="TRI" type="warning" hasFull={this.props.sources.TRI.hasFull} show={this.props.sources.TRI.show} showFull={this.props.sources.TRI.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="SFI" type="warning" hasFull={this.props.sources.SFI.hasFull} show={this.props.sources.SFI.show} showFull={this.props.sources.SFI.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="ITA" type="warning" hasFull={this.props.sources.ITA.hasFull} show={this.props.sources.ITA.show} showFull={this.props.sources.ITA.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="ST3" type="warning" hasFull={this.props.sources.ST3.hasFull} show={this.props.sources.ST3.show} showFull={this.props.sources.ST3.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="ST4" type="warning" hasFull={this.props.sources.ST4.hasFull} show={this.props.sources.ST4.show} showFull={this.props.sources.ST4.showFull} updateSource={this.props.updateSource}/>
							</div>
							<div>
								<span className="label label-warning">{"TRI: " + this.props.sources.TRI.name}</span>
								<span className="label label-warning">{"SFI: " + this.props.sources.SFI.name}</span>
								<span className="label label-warning">{"ITA: " + this.props.sources.ITA.name}</span>
								<span className="label label-warning">{"ST3: " + this.props.sources.ST3.name}</span>
								<span className="label label-warning">{"ST4: " + this.props.sources.ST4.name}</span>
							</div>
						</div>
					</div>
					<div className="panel panel-danger">
						<div className="panel-body bg-danger">
							<p>Wars</p>
							<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
								<ButtonGroup source="RFW" type="danger" hasFull={this.props.sources.RFW.hasFull} show={this.props.sources.RFW.show} showFull={this.props.sources.RFW.showFull} updateSource={this.props.updateSource}/>
								<ButtonGroup source="FYW" type="danger" hasFull={this.props.sources.FYW.hasFull} show={this.props.sources.FYW.show} showFull={this.props.sources.FYW.showFull} updateSource={this.props.updateSource}/>
							</div>
							<div>
								<span className="label label-danger">{"RFW: " + this.props.sources.RFW.name}</span>
								<span className="label label-danger">{"FYW: " + this.props.sources.FYW.name}</span>
							</div>
						</div>
					</div>
				</div>
			);
	}
}
class TLEntry extends React.Component {
	render() {
		let entry = this.props.obj
		//let showHide = (entry.show)  ? ' show' : ' hidden' ;
		let show = (this.props.show)  ? ' show' : ' hidden' ;
		let inverted = (entry.inverted)  ? ' tl-inverted' : '' ;

		return(
			//<li>{this.props.obj.century}</li>
			<li id={"tl-entry-" + entry.key} className={"tl-entry " + entry.source + " tl-full-" + entry.full + show + inverted} data-century={entry.century}>
				<div className="tl-badge"></div>
				<div className="tl-panel">
					<div className="tl-heading">
						<h4 className="tl-title">{entry.stardate}</h4>
						<p><small className="tl-subtext text-muted"><i className="glyphicon glyphicon-folder-open"></i>{this.props.name}</small></p>
					</div>
					<div className="tl-body">{entry.desc}</div>
				</div>
			</li>
		);
	}
}

ReactDOM.render(
	<Timeline />, document.getElementById('timeline-app')
);




























