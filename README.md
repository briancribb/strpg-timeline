# STRPG-timeline
This was going to be another AngularJS experiment, but then I realized that it wasn't complex enough for that. I just built it with jQuery and JSON, and then built it again with React. And then again with VueJS.<a href="http://briancribb.github.io/STRPG-timeline" title="project page">Anyway, here's the project page</a>.

Through OCR scanning and a bit of typing, I've put together a collection of all of the timelines from the old FASA Star Trek Role-Playing Game. I thought it would be fun to have them all organized in a simple web app. The layout is based upon <a title="" href="http://bootsnipp.com/snippets/featured/timeline-responsive">this Bootsnip</a> by Luis Rudge (luisrudge).

The idea was to pull in data from a Google spreadsheet, process it, sort it and then dump it into the browser as a interactive timeline where you can turn the various histories on and off. With all of the sources turned on, you get a full list of things happening all over the FASA Star Trek universe.

Since the data won't change, I'm no longer pulling from a Google sheet. I just saved the responses to some local files and included it in the project. The sources are still pulled separately, however, so we still have an example of multiple data sources being resolved before the app starts.
