//export default (function(){
//}());
//https://gist.github.com/andjosh/6764939
let eventBus = new Vue();
let Timeline = new Vue({
	el: '#timeline-app',
	data: {
		initialized: false,
		sourceclasses: '',
		sources: {
			UFP: { id:'UFP', file:'UFP.json', gid: 'oesera6', hasFull: false, show:true, showFull:true,  name: 'United Federation of Planets' },
			KLE: { id:'KLE', file:'KLE.json', gid: 'o15noc3', hasFull: true,  show:true, showFull:false, name: 'Klingon Empire' },
			RSA: { id:'RSA', file:'RSA.json', gid: 'or7u0kt', hasFull: true,  show:true, showFull:false, name: 'Romulan Star Empire' },
			TRI: { id:'TRI', file:'TRI.json', gid: 'ol08r1n', hasFull: false, show:true, showFull:true,  name: 'Triangle' },
			ORC: { id:'ORC', file:'ORC.json', gid: 'ohu3d91', hasFull: true,  show:true, showFull:false, name: 'Orion Colonies' },
			RFW: { id:'RFW', file:'RFW.json', gid: 'oypmvfb', hasFull: false, show:true, showFull:true,  name: 'Romulan/Federation War' },
			FYW: { id:'FYW', file:'FYW.json', gid: 'oi1ju2s', hasFull: false, show:true, showFull:true,  name: 'Four Years War' },
			ST3: { id:'ST3', file:'ST3.json', gid: 'o5oxeec', hasFull: false, show:true, showFull:true,  name: 'Star Trek 3 Update' },
			ST4: { id:'ST4', file:'ST4.json', gid: 'oxxpvso', hasFull: false, show:true, showFull:true,  name: 'Star Trek 4 Update' },
			SFI: { id:'SFI', file:'SFI.json', gid: 'ohqn30t', hasFull: false, show:true, showFull:true,  name: 'Starfleet Intelligence' },
			ITA: { id:'ITA', file:'ITA.json', gid: 'orojt89', hasFull: false, show:true, showFull:true,  name: "UFP/Independent Traders' Association" }
		},
		entries: []
	},
	methods: {
		scrollTo: function(to = 0) {
			// Props to this GitHub gist: https://gist.github.com/andjosh/6764939

			let start = window.scrollY;
			let change = to - start,
				currentTime = 0,
				increment = 20,
				duration = 1000;

			//t = current time
			//b = start value
			//c = change in value
			//d = duration
			Math.easeInOutQuad = function (t, b, c, d) {
				t /= d/2;
					if (t < 1) return c/2*t*t + b;
					t--;
					return -c/2 * (t*(t-2) - 1) + b;
			};

			var animateScroll = function(){
				currentTime += increment;
				var val = Math.easeInOutQuad(currentTime, start, change, duration);
				window.scroll({
					top: val,
					behavior: "instant"
				});
				if(currentTime < duration) {
					setTimeout(animateScroll, increment);
				}
			};
			animateScroll();
		},
		starToDate: function(stardate) {
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
		},
		updateSourceClasses: function() {
			let arrClasses = [];
			for(let source of Object.keys(this.sources)) {
				let objSource = this.sources[source];
				if (objSource.show) { arrClasses.push(source)	}
				if (objSource.showFull) { arrClasses.push(source+'-full')	}
			}
			this.sourceclasses = arrClasses.join(' ');
			if (this.initialized) this.alternateEntries();
		},
		alternateEntries: function() {
			let shouldInvert = false;
			for (let entry of this.entries) {
				let source = this.sources[entry.source];

				if (source.show && entry.full === source.showFull) {
					entry.inverted = shouldInvert;
					shouldInvert = !shouldInvert;
				}
			}
		},
		manageResize: function() {
			let navHeight = document.getElementById('navbar').offsetHeight;
			document.body.style.paddingTop = navHeight+"px";

			let footerHeight = document.getElementById('page-footer').offsetHeight;
			document.body.style.paddingBottom = footerHeight+"px";
		}
	},
	mounted: function() {
		document.body.className = "";
		window.addEventListener('resize', this.manageResize);
		let that = this;
		let initInverted = false;

		that.manageResize();
		// PreloadJS stuff will go here.
		handleFileLoad = (evt)=> {
			let that = this;

			evt.result.feed.entry.map((entry)=>{
				let dateParts = that.starToDate( entry.gsx$stardate.$t );
				let tempEntry = {
					inverted	:	false,
					stardate	:	entry.gsx$stardate.$t,
					sortkey		:	Number(dateParts.year + '.' + dateParts.month + '' + dateParts.date),
					end			:	entry.gsx$stardateend.$t || null,
					century		:	dateParts.century,
					year		:	dateParts.year,
					month		:	dateParts.month,
					date		:	dateParts.date,
					source		:	evt.result.feed.title.$t,
					full		:	(entry.gsx$full.$t === "TRUE"),
					desc		:	entry.gsx$event.$t
				};
				that.entries.push(tempEntry);
			});
		}

		handleComplete = (evt)=> {
			let that = this;
			that.entries.sort( (a,b)=>{return a.sortkey - b.sortkey} );
			that.updateSourceClasses();
			that.alternateEntries();
			that.initialized = true;

			eventBus.$on('toggle-source', function(sourceID, method) {
				let source = that.sources[sourceID];
				switch(method) {
					case "showFull":
						source.showFull = !source.showFull;
						break;
					default: // show
						source.show = !source.show;
				}
				that.updateSourceClasses();
			});
		}

		let queue = new createjs.LoadQueue();
		queue.on("fileload", handleFileLoad, this);
		queue.on("complete", handleComplete, this);
		queue.loadManifest(
			Object.keys(this.sources).map( (source)=>{
				return {
					id: source,
					src: '../assets/data/' + source + '.json'
				}
			})
		);
	}
});