import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

// Code-splitting is automated for routes
import Connect from '../routes/connect';
import Main from '../routes/main';

export default class App extends Component {
  /** Gets fired when the route changes.
   *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
   *	@param {string} event.url	The newly routed URL
   */
  handleRoute = e => {
    this.currentUrl = e.url;
  };

  insertScript() {
    const script = document.createElement('script');
    script.src = `https://connect.withmono.com/connect.js`;
    // script.addEventListener('load', this.onScriptLoaded);
    document.body.appendChild(script);
  }

  componentDidMount() {
    this.insertScript();
  }

  render() {
    return (
      <div id='app'>
        <Header />
        <Router onChange={this.handleRoute}>
          <Main path='/' />
          <Connect path='/connect' />
        </Router>
      </div>
    );
  }
}
