/*
* List pager
* adds paging to list by toggle classes
* for visibility
*
* @author jrudenstam
*/

define(['helper'], function( h ){
	var defaults = {
		listClass: 'list-pager',
		nextClass: 'list-pager-next',
		prevClass: 'list-pager-prev',
		controlClass: 'list-pager-control-nav',
		perPage: 3,
		visibleClass: 'active',
		pausedClass: 'paused',
		autoplay: true,
		interval: 7000,
		onAfterInit: undefined,
		sender: undefined
	};

	return {
		pages: undefined,
		settings: undefined,
		list: undefined,
		controlNav: undefined,
		currentPage: 1,
		paused: true,

		init: function( settings ) {
			this.settings = h.create( defaults, settings );
			this.list = h.getByClass( this.settings.listClass, document, true );
			this.controlNav = h.getByClass( this.settings.controlClass, document, true );
			this.pages = Math.ceil( this.list.children.length/this.settings.perPage );
			this.bindUiEvents();

			if ( this.controlNav ) {
				this.addControls( this.controlNav );
			}

			if ( this.settings.autoplay ) {
				this.togglePlay();
			}

			if ( this.settings.onAfterInit ) {
				var ctx = this.settings.sender || this;
				this.settings.onAfterInit.apply(ctx);
			}

			this.updateUi(0);

			return this;
		},

		bindUiEvents: function() {
			var next = h.getByClass( this.settings.nextClass, document, true ),
			prev = h.getByClass( this.settings.prevClass, document, true );

			if ( next ) {
				h.addEvent( next, 'click', this.next, this );
			}

			if ( prev ) {
				h.addEvent( prev, 'click', this.prev, this );
			}

			h.addEvent( this.list, 'mouseover', this.pause, this );
			//h.addEvent( this.list, 'mouseout', this.play, this );
		},

		togglePlay: function( event, sender ) {
			var ctx = sender || this;

			if ( ctx.paused ) {
				ctx.play( undefined, ctx );
			} else {
				ctx.pause( undefined, ctx );
			}
		},

		play: function( event, sender ) {
			var ctx = sender || this;

			ctx._interval = window.setInterval( (function( list ){
				return function() {
					list.next( undefined, list );
				}
			})(ctx), ctx.settings.interval );

			h.removeClass( ctx.list, ctx.settings.pausedClass );
			ctx.paused = false;
		},

		pause: function( event, sender ) {
			var ctx = sender || this;

			window.clearInterval( ctx._interval );
			h.addClass( ctx.list, ctx.settings.pausedClass );
			ctx.paused = true;
		},

		next: function( event, sender ) {
			var ctx = sender || this;
			ctx.currentPage = ctx.currentPage < ctx.pages ? ++ctx.currentPage : 1;
			ctx.updateUi();
		},

		prev: function( event, sender ) {
			var ctx = sender || this;
			ctx.currentPage = --ctx.currentPage || ctx.pages;
			ctx.updateUi();
		},

		page: function( toPage ) {
			if ( toPage && toPage > 0 ) {
				this.currentPage = toPage <= this.pages ? toPage : this.currentPage;
				this.updateUi();
			}
			
			return this.currentPage;
		},

		addControls: function( wrapper ) {
			for ( var i = 1; this.pages >= i; i++ ) {
				var li = document.createElement('li'),
				a = document.createElement('a');
				a.innerText = i;
				h.addEvent( a, 'click', function( event, sender ){
					event.stop();
					sender.page( parseInt(this.innerText, 10) );
				}, this);
				li.appendChild(a);
				wrapper.appendChild(li);
			};
		},

		updateUi: function( startAt ) {
			var startAt = startAt !== undefined ? startAt : (this.currentPage-1)*this.settings.perPage;

			for (var i = this.list.children.length - 1; i >= 0; i--) {
				h.removeClass( this.list.children[i], this.settings.visibleClass );
			};

			for ( var i = startAt; i < startAt+this.settings.perPage; i++ ) {
				if ( this.list.children[i] ) {
					h.addClass( this.list.children[i], this.settings.visibleClass );
				}
			};

			if ( this.controlNav && this.controlNav.children ) {
				var lis = this.controlNav.children;

				for ( var i = 0; i < lis.length; i++ ) {
					h.removeClass( lis[i], this.settings.visibleClass );
				}

				h.addClass( lis[this.currentPage-1], this.settings.visibleClass );
			}
		}
	}
});