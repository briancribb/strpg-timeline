console.log('blah');

class Timeline extends React.Component {
	render() {
		return(
				<div id="timeline">
					<TLToggles/>
					<TLEvents/>
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