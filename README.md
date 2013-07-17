# Eventful Life
## An Node.js EventEmitter version of Conway's Game of Life

I wanted a more interesting example of how to use node.js events and EventEmitter. How about we make Conway's Life but instead of doing a round of updating every cells state simultantiously and then showing the the state, what if each cell listened to all it's adjacent cells for changes and then updated itself when it needed to? It seemed more interesting than make a Door object and then knocking on it to learn about events.

Check out the example html page to see Eventful Life in action.

To install use:

  npm install eventfullife

To run the eventfullife.html page, first install browserify and jquery-browserify:

  npm install -g browserify
  npm install jquery-browserify
