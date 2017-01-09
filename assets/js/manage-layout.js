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