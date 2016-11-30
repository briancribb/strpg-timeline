class Timeline extends React.Component {
	// In case we need initial states, which we will because we're waiting for data.
	constructor() {
		console.log('constructor()');
		super(); // Gotta call this first when doing a constructor.
		this.state = {
			test: false
		}
		this._getData();
	}
	componentWillMount() {
		console.log('componentWillMount()');
	}
	componentDidMount() {
		console.log('componentDidMount()');
		console.log(this.state);
	}

	_getData() {
		var that = this,
			dfd_array = [],
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
					hasFull : value.hasFull
				}


				/* Process data into the main timeline. */
				for (var i = 0; i < data.feed.entry.length; i++) {

					var dateParts = starToDate( data.feed.entry[i].gsx$stardate.$t );

					objData.entries.push({
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
			objData.entries = _.sortBy(objData.entries, 'year');
			that.setState(objData);
			TL.init();
			console.log('that.state');
			console.log(that);
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


	render() {
		let markup = null, sources = this.state.sources;
		console.log('--- sources');
		console.log(sources);
		if (sources) {
			markup = 
				<div id="timeline">
					<TLToggles/>
					<TLEvents/>
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
	render() {
		let btnFull;
		if (this.props.full === 'true') {
			btnFull = <button id={this.props.source + "-full"} type="button" className={"btn btn-" + this.props.type + " " + this.props.source}>Full</button>
		}
		return(
				<div className="btn-group" role="group" aria-label={this.props.source}>
					<button id={this.props.source + "-toggle"} type="button" className={"btn btn-" + this.props.type + " active " + this.props.source}>{this.props.source}</button>
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
								<ButtonGroup source="UFP" type="primary" full="false" />
								<ButtonGroup source="KLE" type="primary" full="true" />
								<ButtonGroup source="RSA" type="primary" full="true" />
								<ButtonGroup source="ORC" type="primary" full="true" />
							</div>
							<div>
								<span className="label label-primary">UFP: United Federation of Planets</span>
								<span className="label label-primary">KLE: Klingon Empire</span>
								<span className="label label-primary">RSA: Romulan Star Empire</span>
								<span className="label label-primary">ORC: Orion Colonies</span>
							</div>
						</div>
					</div>
					<div className="panel panel-warning">
						<div className="panel-body bg-warning">
							<p>Misc</p>
							<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
								<ButtonGroup source="TRI" type="warning" full="false"/>
								<ButtonGroup source="SFI" type="warning" full="false"/>
								<ButtonGroup source="ITA" type="warning" full="false"/>
								<ButtonGroup source="ST3" type="warning" full="false"/>
								<ButtonGroup source="ST4" type="warning" full="false"/>
							</div>
							<div>
								<span className="label label-warning">TRI: Triangle</span>
								<span className="label label-warning">SFI: Starfleet Intelligence</span>
								<span className="label label-warning">ITA: Independent Traders&#39; Association</span>
								<span className="label label-warning">ST3: Star Trek III Update</span>
								<span className="label label-warning">ST4: Star Trek IV Update</span>
							</div>
						</div>
					</div>
					<div className="panel panel-danger">
						<div className="panel-body bg-danger">
							<p>Wars</p>
							<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
								<ButtonGroup source="RFW" type="danger" full="false"/>
								<ButtonGroup source="FYW" type="danger" full="false"/>
							</div>
							<div>
								<span className="label label-danger">RFW: Romulan/Federation War</span>
								<span className="label label-danger">FYW: Four Years War</span>
							</div>
						</div>
					</div>
				</div>
			);
	}
}
class TLEvents extends React.Component {
	render() {
		return(
				<ul id="tl-list" className="tl-list">
					<li>Stuff</li>
					<li>Stuff</li>
					<li>Stuff</li>
					<li>Stuff</li>
				</ul>
			);
	}
}
ReactDOM.render(
	<Timeline />, document.getElementById('timeline-app')
);


/*
<div className="panel panel-primary">
	<div className="panel-body bg-info">
		<p>Major Governments</p>
		<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
			<div className="btn-group" role="group" aria-label="UFP">
				<button id="UFP-toggle" type="button" className="btn btn-primary active UFP">UFP</button>
			</div>

			<div className="btn-group" role="group" aria-label="KLE">
				<button id="KLE-toggle" type="button" className="btn btn-primary active KLE">KLE</button>
				<button id="KLE-full" type="button" className="btn btn-primary KLE">Full</button>
			</div>

			<div className="btn-group" role="group" aria-label="KLE">
				<button id="RSA-toggle" type="button" className="btn btn-primary active RSA">RSA</button>
				<button id="RSA-full" type="button" className="btn btn-primary RSA">Full</button>
			</div>

			<div className="btn-group" role="group" aria-label="ORC">
				<button id="ORC-toggle" type="button" className="btn btn-primary active ORC">ORC</button>
				<button id="ORC-full" type="button" className="btn btn-primary ORC">Full</button>
			</div>
		</div>
		<div>
			<span className="label label-primary">UFP: United Federation of Planets</span>
			<span className="label label-primary">KLE: Klingon Empire</span>
			<span className="label label-primary">RSA: Romulan Star Empire</span>
			<span className="label label-primary">ORC: Orion Colonies</span>
		</div>
	</div>
</div>
<div className="panel panel-warning">
	<div className="panel-body bg-warning">
		<p>Misc</p>
		<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
			<div className="btn-group" role="group" aria-label="First group">
				<button id="TRI-toggle" type="button" className="btn btn-warning active TRI">TRI</button>
				<button id="SFI-toggle" type="button" className="btn btn-warning active SFI">SFI</button>
				<button id="ITA-toggle" type="button" className="btn btn-warning active ITA">ITA</button>
				<button id="ST3-toggle" type="button" className="btn btn-warning active ST3">ST3</button>
				<button id="ST4-toggle" type="button" className="btn btn-warning active ST4">ST4</button>
			</div>
		</div>
		<div>
			<span className="label label-warning">TRI: Triangle</span>
			<span className="label label-warning">SFI: Starfleet Intelligence</span>
			<span className="label label-warning">ITA: Independent Traders&#39; Association</span>
			<span className="label label-warning">ST3: Star Trek III Update</span>
			<span className="label label-warning">ST4: Star Trek IV Update</span>
		</div>
	</div>
</div>
<div className="panel panel-danger">
	<div className="panel-body bg-danger">
		<p>Wars</p>
		<div id="source-toolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
			<div className="btn-group" role="group" aria-label="First group">
				<button id="RFW-toggle" type="button" className="btn btn-danger active RFW">RFW</button>
				<button id="FYW-toggle" type="button" className="btn btn-danger active FYW">FYW</button>
			</div>
		</div>
		<div>
			<span className="label label-danger">RFW: Romulan/Federation War</span>
			<span className="label label-danger">FYW: Four Years War</span>
		</div>
	</div>
</div>
*/