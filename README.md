# STRPG-timeline
This was going to be another AngularJS experiment, but then I realized that it wasn't complex enough for that.

Through OCR scanning and a bit of typing, I've put together a collection of all of the timelines from the old FASA Star Trek Role-Playing Game. I thought it would be fun to have them all organized in a simple web app. The layout is mostly pulled from <a title="" href="http://bootsnipp.com/snippets/featured/timeline-responsive">this Bootsnip</a> by Luis Rudge (luisrudge).

The experiment was to pull in data from a Google spreadsheet, process it, sort it and then dump it into the browser window using a document fragment and jQuery. Target classes are added and removed to show/hide events from the various timelines.

I'm still using jQuery for the document fragments, but I'm no longer pulling from a Google sheet. Since the data won't change, I just saved the responses to some local files and included it in the project. The sources are still pulled separately, however, so we still have an example of multiple data sources being resolved before the app starts.
