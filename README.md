# WP App

An open source, customizable mobile app for WordPress management.

![Preview Image](https://cloud.githubusercontent.com/assets/516559/9420253/3f53a01c-4818-11e5-96a3-d3713c7df3f7.png)

## The Idea

Create a customizable mobile app for managing self-hosted WordPress sites.

Allow developers to create plugins that interface with the app to create custom pages, and add custom data from the site.  The app itself will have hooks to add pages, for example an ecommerce plugin could add a sales statistics page.

The existing app is great, but it doesn’t support CPTs, and it isn’t customizable.  Some plugin authors have created single purpose plugins for things like sales statistics. Combining site management and custom data into one app would be more convenient.

Developers will be able to add, edit, and remove pages and functionality to the app remotely through plugins.

The app itself will be on the app store, you can add multiple sites by adding a username, password, and url, similar to the existing WordPress app.

Developers can write simple plugins that add data to the WP-API to customize the app.

Since the WP-API plugin is not in core yet, the app requires installation of the WP-API (v2), and possibly another plugin (for authentication).  The idea is to get the app into beta for testing, then when the WP-API gets into core, it will be ready to go.

This project is intended to be by the community, for the community.

## Try it out

To see this project in action, download the wp-app folder, and open wp-app/index.html in Safari or Chrome. Click '+' to add a new site, the site must have the WP-API v2 installed and activated: [https://wordpress.org/plugins/rest-api/](https://wordpress.org/plugins/rest-api/)

For now, just enter a site URL, no user/pass needed.

### Interacting with the WP-API

The WP-API has lots of methods to add data to it. Here's a simple example of adding a custom endpoint to add a page to the app:

	add_action( 'rest_api_init', function () {

		// This route adds a top level section for your plugin. url: mysite.com/wp-json/wp-app/v1/app/
		register_rest_route( 'wp-app/v1', '/app', array(
	        'methods' => 'GET',
	        'callback' => 'my_app_routes',
	    ) );
		
		// This route lists your custom content. url: mysite.com/wp-json/wp-app/v1/apppages/
	    register_rest_route( 'wp-app/v1', '/apppages', array(
	        'methods' => 'GET',
	        'callback' => 'my_app_page_list',
	    ) );

	} );
	
	// The custom top level section that will appear in the app
	function my_app_routes() {
		$array = array(
			'title' => array( 'rendered' => 'My Plugin' ),
			'icon' => 'ion-ios-information-outline',
			'route' => '/wp-app/v1/apppages/'
		);
		return $array;
	}
	
	// The actual content inside our custom section
	function my_app_page_list() {
		$array = array( 
			array(
				'id' => 1,
				'title' => array( 'rendered' => 'My Plugin Page' ),
				'content' => array( 'rendered' => 'Here is my custom content.' ),
				'icon' => 'ion-ios-information-outline'
			),
			array(
				'id' => 2,
				'title' => array( 'rendered' => 'Another Page' ),
				'content' => array( 'rendered' => 'More custom content.' ),
				'icon' => 'ion-ios-information-outline'
			),
		);
		return $array;
	}

To see this in action, add http://scottbolinger.com/dev to the app (no user/pass needed). You'll see a section called My Plugin, and the page list inside that section.

## Technical Details

The app is a hybrid app built with the Ionic Framework, which uses AngularJS. It will be compiled into a native app for the app stores using Phonegap.

The app accesses the WP-API on a self-hosted WordPress website.

### Why Ionic + Phonegap?

The WordPress community is made up of web developers, so building the app with web technologies allows more people to participate.  The Ionic Framework creates fast, performant apps.

### What will the app cost?

The app itself will always be free, there will never be a mandatory cost to use the app.

There will be costs associated with push notifications, hosting, etc. that mean this app will need to make revenue at some point, or figure out some sort of sponsorship.  

The idea is to create paid plugins that add functionality to the app worth paying for, and charging for those plugins.  No core functionality will cost money, only add-ons.  For example, a plugin developer could charge for a plugin that adds their CPT to the app.

## Project Outline

At this point we need contributors who are familiar with AngularJS and the WP-API.

The app is semi-functional at this point, it needs a lot of work to get to the point where millions of people can use it flawlessly.

We can add features one at a time to break the project into manageable chunks. For example, I have no intention of adding a post editor anytime soon.  I never write posts on my phone, I don’t really think that’s useful.  If you want that, you can just use the other app.

The point of this app is to add stuff that’s actually useful on the go, like viewing and approving comments, or getting custom data from plugins.  Then making everything customizable.

### Alpha Release

The first goal is to get to an alpha release, with minimal features.

Minimal features: Multiple site support, CRUD comments, GET/DELETE posts/media/pages, edit site settings.

#### Outstanding items:

1. Secure, scalable data storage (right now it’s just using local storage, but there’s a 5mb limit)
2. Secure authentication (probably Oauth)
3. Outline methods for adding custom pages and data
4. Better caching and data loading
5. Submit to app stores and begin testing

#### Next Phases

- POST/PUT on most endpoints
- CPT support
- Figure out push notifications
- Custom Design
- Lots more…

## How to Contribute

We are looking for developers familiar with AngularJS and the WP-API. We also encourage anyone who is interested to join the conversation on Slack and put in your 2 cents.

Our Slack channel is: wp-app.slack.com. Ping [@scottbolinger](https://twitter.com/scottbolinger) on twitter with your email to request an invitation.

The first step is just to make some plans, then write them out and assign them.

### Setup this project locally

1. [Install Ionic CLI tools](http://ionicframework.com/docs/cli/install.html): `npm install -g ionic`
2. Create your Ionic project: `ionic start wp-app`
3. Change directory into the "wp-app" folder: `cd wp-app`
3. Remove the "www" folder
3. Clone this repo into a new "www" folder: `git clone http://github.com/wp-app/wp-app.git www`
4. Build your app: `ionic build ios`
5. Test in browser: `ionic serve --lab`
