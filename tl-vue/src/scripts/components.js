/*export default (function(){
	return 'one';
}());*/



Vue.component('header-nav', {
	template:`
		<nav id="navbar" class="navbar navbar-info navbar-fixed-top">
			<div class="container">
				<div class="col-xs-12 col-sm-6 col-md-8">
					<a id="navbar-brand" class="navbar-brand" href="#">STRPG Timeline</a>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<div class="navbar-form navbar-right">
						<div class="input-group input-group-lg">
							<div class="input-group-btn">
								<button v-on:click="scrollToTop" title="Scroll to the top" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-circle-arrow-up" aria-hidden="true" aria-label="Return to Top"></span></button>
								<button v-on:click="scrollToBottom" type="button" title="Scroll to the footer" class="btn btn-warning"><span class="glyphicon glyphicon-circle-arrow-down" aria-hidden="true" aria-label="Scroll to the footer"></span></button>
							</div>
							<input type="number" id="century-search" class="form-control" placeholder="Century">
							<div v-on:click="scrollToCentury" class="input-group-btn">
								<button type="button" title="Search" class="btn btn-primary"><span class="glyphicon glyphicon-search" aria-hidden="true" aria-label="Search for Century"></span></button>
							</div>
						</div>
					</div>
				</div>
			</div><!-- /.container -->
		</nav>
	`,
	data: function() {
		return {
			something:true
		}
	},
	methods: {
		scrollToTop: function() {
			this.$emit('scroll-to', 0);
		},
		scrollToBottom: function() {
			this.$emit('scroll-to', document.getElementById('page-footer').offsetTop);
		},
		scrollToCentury: function() {
			let centuryValue = document.getElementById('century-search').value;
			let target = document.querySelector('[data-century="' + centuryValue + '"]');
			let spacing = window.innerHeight - document.getElementById('navbar').offsetHeight; 

			if (!target) return;

			this.$emit(
				'scroll-to', 
				target.offsetTop + spacing
			);
		}
	},
	mounted: function() {
		document.getElementById('century-search').addEventListener('keyup', (evt)=>{
			if (evt.which === 13) {
				this.scrollToCentury();
			}
		});
	}
});

Vue.component('button-group', {
	props: {
		source: {
			type: Object,
			required: true
		},
		category: {
			type: String,
			required: true
		}
	},
	template: `
		<div class="btn-group" role="group" :aria-label="source.id">
			<button 
				type="button" 
				class="btn btn-lg"
				:class="[source.id, 'btn-'+category, source.show ? 'active' : '']"
				v-on:click="toggleSource"
			>{{source.id}}</button>
			<button 
				type="button" 
				class="btn btn-lg"
				:class="[source.id, 'btn-'+category, source.showFull ? 'active' : '']"
				v-on:click="toggleFull"
				v-if="source.hasFull"
			>Full</button>
		</div>
	`,
	data: function() {
		return {

		}
	},
	methods: {
		toggleSource: function() {
			this.source.show = !this.source.show
		},
		toggleFull: function() {
			this.source.showFull = !this.source.showFull
		}
	}
});

Vue.component('toggles', {
	props: {
		sources: {
			type: Object,
			required: true
		}
	},
	template: `
		<div id="tl-toggles" class="source-toggles">
			<div class="panel panel-primary">
				<div class="panel-body bg-info">
					<p>Major Governments</p>
					<div id="source-toolbar" class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
						<button-group :source="sources.UFP" category="primary"></button-group>
						<button-group :source="sources.KLE" category="primary"></button-group>
						<button-group :source="sources.RSA" category="primary"></button-group>
						<button-group :source="sources.ORC" category="primary"></button-group>
					</div>
					<div>
						<span class="label label-primary">UFP: {{sources.UFP.name}}</span>
						<span class="label label-primary">KLE: {{sources.KLE.name}}</span>
						<span class="label label-primary">RSA: {{sources.RSA.name}}</span>
						<span class="label label-primary">ORC: {{sources.ORC.name}}</span>
					</div>
				</div>
			</div>
			<div class="panel panel-warning">
				<div class="panel-body bg-warning">
					<p>Misc</p>
					<div id="source-toolbar" class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
						<button-group :source="sources.TRI" category="warning"></button-group>
						<button-group :source="sources.SFI" category="warning"></button-group>
						<button-group :source="sources.ITA" category="warning"></button-group>
						<button-group :source="sources.ST3" category="warning"></button-group>
						<button-group :source="sources.ST4" category="warning"></button-group>
					</div>
					<div>
						<span class="label label-warning">TRI: {{sources.TRI.name}}</span>
						<span class="label label-warning">SFI: {{sources.SFI.name}}</span>
						<span class="label label-warning">ITA: {{sources.ITA.name}}</span>
						<span class="label label-warning">ST3: {{sources.ST3.name}}</span>
						<span class="label label-warning">ST4: {{sources.ST4.name}}</span>
					</div>
				</div>
			</div>
			<div class="panel panel-danger">
				<div class="panel-body bg-danger">
					<p>Wars</p>
					<div id="source-toolbar" class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
						<button-group :source="sources.RFW" category="danger"></button-group>
						<button-group :source="sources.FYW" category="danger"></button-group>
					</div>
					<div>
						<span class="label label-danger">RFW: {{sources.RFW.name}}</span>
						<span class="label label-danger">FYW: {{sources.FYW.name}}</span>
					</div>
				</div>
			</div>
		</div>
	`,
	data: function() {
		return {

		}
	},
	methods: {

	}
});


Vue.component('timeline', {
	props: {
		entries: {
			type: Array,
			required: true
		},
		sources: {
			type: Object,
			required: true
		},
	},
	template: `
		<div id="timeline">
			<ul id="tl-list" class="tl-list" :class="Object.keys(sources).join(' ')">
				<li 
					v-for="(entry, index) in entries" 
					:key="index" 
					class="tl-entry" 
					:class="[entry.source, entry.full ? 'tl-full-true' : 'tl-full-false']" 
					:data-century="entry.century"
					v-if="sources[entry.source].show && sources[entry.source].showFull === entry.full" 
				>
					<div class="tl-badge"></div>
					<div class="tl-panel">
						<div class="tl-heading">
							<h4 class="tl-title">{{entry.stardate}}</h4>
							<p><small class="tl-subtext text-muted"><i class="glyphicon glyphicon-folder-open"></i>{{sources[entry.source].name}}</small></p>
						</div>
						<div class="tl-body">{{entry.desc}}</div>
					</div>
				</li>
			</ul>
		</div>
	`,
	data: function() {
		return {
			
		}
	},
	methods: {

	}
});