/*
 * core.js v1.0.0
 */

// Modify Date object to include an addHours and subHours functions
Date.prototype.addHours= function(h){
	this.setHours(this.getHours()+h);
	return this;
}
Date.prototype.subHours= function(h){
	this.setHours(this.getHours()-h);
	return this;
}
Date.prototype.addMinutes= function(m){
	this.setMinutes(this.getMinutes()+m);
	return this;
}
Date.prototype.subMinutes= function(m){
	this.setMinutes(this.getMinutes()-m);
	return this;
}
Date.prototype.addSeconds= function(s){
	this.setSeconds(this.getSeconds()+s);
	return this;
}
Date.prototype.subSeconds= function(s){
	this.setSeconds(this.getSeconds()-s);
	return this;
}

var strings = {
	loginFail : "Login details do not exist. /sadface"
};

var meta = {
	keys : {
		google : {
			//ios : "AIzaSyCNLRT_u09YBOx-SL76CAZny2Z3xtOQn64",
			ios : "AIzaSyC7FWam14hsOU1P_FDtqIDPaUTwiKXPtmg",
			web : "AIzaSyC7FWam14hsOU1P_FDtqIDPaUTwiKXPtmg",
			android : "AIzaSyC7FWam14hsOU1P_FDtqIDPaUTwiKXPtmg",
			current : ""
		},
		parse : {
			ApplicationID : "JaafwCCi3YO4JTKKBuQV0Q8HzylzCTgzyI6cfyRb",
			ClientKey : "EQmULMcPBJrJjKnNW0NDT1KgU7KPIX69brLhXNm4",
			JavascriptKey : "Hw0SjWNYc7wdP5TuAZE4ry6bHLbKqVqMWXJwwt6m",
			RESTAPIKey : "8vaBSrqmVD0Ie46WW8ttpU37F2YGN3g9KX8dy2k0"
		}
	},
	userAttendance : [],
	userAttendanceLastRetrieved : new Date().setFullYear(2000,0,1),
	userEventsNearby : [],
	userEventsNearbyLastRetrieved : new Date().setFullYear(2000,0,1),
	lastEvent : {},
	lastEventMessages : {},
	lastEventMessagesTimestamp : new Date().setFullYear(2000,0,1),
	lastEventMessageAt : new Date().setFullYear(2000,0,1),
	lastEventAttendance : {},
	lastEventAttendanceTimestamp : new Date().setFullYear(2000,0,1),
	lastEventUserAttending : false,
	oldLocations : [
		{
			a : "324 St. Johns Avenue",
			lon : -97.1316184,
			lat : 49.9212885
		},
		{
			a : "549 Castle Avenue",
			lon : -97.0967149,
			lat : 49.9066913
		},
		{
			a : "1234 Corydon Avenue",
			lon : -97.1731519,
			lat : 49.8640781
		},
		{
			a : "Apt 30, 555 St. Mary Avenue",
			lon : -97.1518443,
			lat : 49.8890405
		},
		{
			a : "10 Marble Avenue",
			lon : -97.2116321,
			lat : 49.9362962
		}
	],
	googleMap: {},
	googleLoc: {},
	googlePla: {},
	googleMapsScriptLoaded : false,
	googlePlacesScriptLoaded : false,
	userLocation : {},
	userLocality : null,
	lastLocationSearch : {},
	lastKeypressAt : new Date(),
	deviceReady : false,
	deviceOnline : false
};

var touch = {
	addE: function(){
		return $.Deferred(function(f){
			$('.touchable').on('mousedown touchstart',function(){
				$('.touched').removeClass('touched');
				$(this).addClass('touched');
			});
			$('.touchable').on('mouseup touchend touchcancel',function(){
				$('.touched').removeClass('touched');
			});
			f.resolve();
		});
	},
	remE: function(){
		return $.Deferred(function(f){
			$('.touchable').off('mousedown touchstart');
			$('.touchable').off('mouseup touchend touchcancel');
			f.resolve();
		});
	},
	initialize: function(){
		touch.remE().done( touch.addE );
	},
	reset: function(){
		touch.remE().done( touch.addE );
	}
};

var app = {
	initialize: function() {
		console.log('App init');
		//Parse INIT
		Parse.initialize(meta.keys.parse.ApplicationID, meta.keys.parse.JavascriptKey);
		
		//set Google API Key
		meta.keys.google.current = meta.keys.google.web;

		//init the maps stuff
		var meta.googleMap = new google.maps.Map($('#mapHolder'),{});
		/*var meta.googlePla = new google.maps.places.PlacesService(map);
		meta.googlePla.nearbySearch({location:loc,radius:1000,keyword:''}, function(d){console.log(d);});*/

		//bind events necessary on mobile
		app.bindEvents();
	},
	bindEvents: function() {
		//bind device events
		document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener('online', function(){
			meta.deviceOnline = true;
			if (meta.googleMapsScriptLoaded === false) {
				var googleMapsScript = document.createElement('script');
				googleMapsScript.type = 'text/javascript';
				googleMapsScript.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp?libraries=places?key='+meta.keys.google.current;
				document.body.appendChild(googleMapsScript);
				meta.googleMapsScriptLoaded = true;
				meta.googlePlacesScriptLoaded = true;
			}
		}, false);
		document.addEventListener('offline', function(){
			meta.deviceOnline = false;
		}, false);
	},
	onDeviceReady: function() {
		console.log('Device is ready');
		meta.deviceReady = true;
		if (device.platform.toLowerCase() == "ios"){
			meta.keys.google.current = meta.keys.google.ios;
		}
		views.initialize();
		touch.initialize();
	}
};

var views = {
	initialize: function(screen) {
		console.log('View inits');
		menu.initialize();

		//UI modifiers
			//set black application BG
			$('body').css('background-color','#000');

		// check if there is an active session
		if ( Parse.User.current() ) {
			// init all the in-app views

			// show the default view
			views.screens.start.initialize();

		} else {
			// show the signup or login page
			views.screens.login.initialize();
		}
	},
	screens : {
		login : {
			initialize : function(){
				console.log('Loading login screen...');
				$.when( views.screens.login.getData() ).done( views.screens.login.render() );
			},
			getData : function(){
				console.log('Loading login screen data...done.');
			},
			render : function(){
				console.log('Rendering login screen...');
				$.when( views.screens.login.remE() ).done( function(){
					$('app screen').addClass('hidden');
					views.screens.login.addE();
					$('screen#login').removeClass('hidden');
				});
			},
			addE : function(){
				$('screen#login #btn_goToSignup').hammer().on('tap',function(e){
					e.preventDefault();
					$('app screen').addClass('hidden');
					views.screens.signup.initialize();
				});
				$('screen#login #frm_login').on('submit', function(e){
					$('screen#login #btn_login').prop('disabled',true);
					//Parse Login code
					Parse.User.logIn($('screen#login #frm_login #txt_user').val(),$('screen#login #frm_login #txt_pass').val(), {
						success : function(user){
							//YAY, now do stuff
							console.log('Parse.User.logIn Success');
							console.log(user);
							views.initialize();
							setTimeout(function(){
								$('screen#login #btn_login').prop('disabled',false);
								$('screen#login #frm_login')[0].reset();
							},500);
						},
						error : function(user, error){
							//BOO, fail it
							console.error('Parse.User.logIn Error');
							switch(error.code){
								case 101:
									$('screen#login #feedback_login').html(strings.loginFail);
								default:
									console.error(user);
									console.error(error);
							}
							setTimeout(function(){
								$('screen#login #feedback_login').html(' ');
								$('screen#login #btn_login').prop('disabled',false);
							},3000);
						}
					});
					$('input, select, textarea, button').blur();
					e.preventDefault();
				});
			},
			remE : function(){
				$('screen#login #btn_goToSignup').hammer().off('tap');
				$('screen#login #frm_login').off('submit');
			}
		},
		signup : {
			initialize : function(){
				console.log('Loading signup screen...');
				$.when( views.screens.signup.getData() ).done( views.screens.signup.render() );
			},
			getData : function(){
				console.log('Loading signup screen data...done.');
			},
			render : function(){
				console.log('Rendering signup screen...');
				$.when( views.screens.signup.remE() ).done( function(){
					$('app screen').addClass('hidden');
					views.screens.signup.addE();
					$('screen#signup').removeClass('hidden');
				});
			},
			addE : function(){
				$('screen#signup #btn_cancel').hammer().on('tap',function(e){
					$('app screen').addClass('hidden');
					views.screens.login.initialize();
					e.preventDefault();
				});
				$('screen#signup #frm_signup #txt_pass2').on('keyup', function() {
					if ($(this).val() == $('screen#signup #frm_signup #txt_pass1').val()) {
						$(this).removeClass('bad');
						$(this).addClass('good');
					} else {
						$(this).removeClass('good');
						$(this).addClass('bad');
					}
					//if there are no "bad" fields, enable the submit
					if ($('screen#signup #frm_signup .bad').length == 0) {
						$('screen#signup #btn_submit').prop('disabled', false);
					} else {
						$('screen#signup #btn_submit').prop('disabled', true);
					}
				});
				$('screen#signup #frm_signup').on('submit', function(e){
					$('screen#signup #btn_signup').prop('disabled',true);
					var u = new Parse.User();
					u.set('firstname', $('screen#signup #frm_signup #txt_fName').val() );
					u.set('username', $('screen#signup #frm_signup #txt_uName').val() );
					u.set('email', $('screen#signup #frm_signup #txt_email').val() );
					u.set('password', $('screen#signup #frm_signup #txt_pass1').val() );
					u.signUp(null, {
						success : function(user){
							//YAY, now do stuff
							console.log('Parse.User.signUp Success');
							//console.log(user);
							views.initialize();
						},
						error : function(user, error){
							//Boo, shit failed
							console.log('Parse.User.signUp Error');
							console.error(error);
							setTimeout(function(){
								$('screen#signup #btn_signup').prop('disabled',false);
							},3000);
						}
					});
					$('input, select, textarea, button').blur();
					e.preventDefault();
				});
			},
			remE : function(){
				$('screen#signup #btn_cancel').hammer().off('tap');
				$('screen#signup #frm_signup #txt_pass2').off('keyup');
				$('screen#signup #frm_signup').off('submit');
			}
		},
		start : {
			initialize : function(){
				//set the user's location in Parse
				utility.deferredGetLocation(false, false).done(function(){
					//now that we have the locaiton, get data
					views.screens.start.getData(true).done(function(){
						//now that we have data, render the screen
				 		views.screens.start.render();
					});
				});
			},
			getData : function(forceDataUpdate){
				return $.Deferred(function(df){
					var errors = [];
					var successes = [];
					$('screen#start #btn_refreshData').addClass('disabled');
					$('screen#start #btn_refreshData').addClass('infiniteSpin');
					if (forceDataUpdate || meta.userAttendanceLastRetrieved <= new Date().subMinutes(5) || meta.userEventsNearbyLastRetrieved <= new Date().subMinutes(15)) { 
						//force the data update
						//get #nextEvents attendance data
							//Indicate loading
							$('screen#start content #nextEvents list').html('Loading data...');
							$('screen#start content #nearbyEvents list').html('Loading data...');
							// load event template
							var t = _.template( $('#tpl_eventListItem').html() );

							//retrieve data from Parse
							var Event = Parse.Object.extend("Event");
							var Attendance = Parse.Object.extend("Attendance");

							//define Attendance object query
							var attendanceQuery = new Parse.Query(Attendance);
							attendanceQuery.equalTo('user', Parse.User.current());
							attendanceQuery.equalTo('status', 1); // status 1=accept 2=maybe 3=decline 0=unknown
							attendanceQuery.include('event');
							attendanceQuery.find({
								success: function(results) {
									console.log('Successfully retrieved accepted Attendance records for current user');
									meta.userAttendance = _.sortBy(results, function(i){ return i.get('event').get('eventAt'); });
									//clear the list
									$('screen#start content #nextEvents list').html('');
									_.each(meta.userAttendance,function(o,i,a){
										// o = individual object
										// i = array index ##
										// a = full array
										// get the event associated with this attendance object
										var e = o.get('event');
										if (e.get('eventAt') >= new Date().subHours(2) && e.get('eventAt') <= new Date().addHours(24)){
											// build display object
											var dO = {}
											dO.id = e.id;
											dO.name = e.get('name');
											dO.eventFromNow = moment(e.get('eventAt')).fromNow();
											$('screen#start content #nextEvents list').append( t(dO) );
										}
									});
									if ($('screen#start content #nextEvents list').children().length == 0) {
										$('screen#start content #nextEvents list').html('No events coming up in the next two days.<br>Why not create one?');
									}
									//add event handlers for generated list items
									$.when( views.screens.start.remListE() ).done( views.screens.start.addListE() );
									//remove loading indicators
									$('screen#start #btn_refreshData').removeClass('disabled');
									$('screen#start #btn_refreshData').removeClass('infiniteSpin');
								},
								error: function(error){
									console.error(error);
								}
							});

							//define Nearby Event query
							var nearbyEventQuery = new Parse.Query(Event);
							nearbyEventQuery.equalTo('public', true);
							nearbyEventQuery.notEqualTo('createdBy', Parse.User.current());
							nearbyEventQuery.greaterThan('eventAt', new Date().subMinutes(45));
							nearbyEventQuery.withinKilometers('eventGeo', Parse.User.current().get('Geo'), 200);
							//nearbyEventQuery.withinKilometers(100.0);
							nearbyEventQuery.limit(10);
							nearbyEventQuery.find({
								success: function(ev){
									meta.userEventsNearby = _.sortBy(ev, function(i){ return i.get('eventAt'); });
									console.log('Successfully retrieved nearby Event records for current user');
									//clear the list
									$('screen#start content #nearbyEvents list').html('');
									_.each(meta.userEventsNearby, function(o,i,a){
										// o = individual object
										// i = array index ##
										// a = full array

										// build display object
										var dO = {}
										dO.id = o.id;
										dO.name = o.get('name');
										dO.eventFromNow = moment(o.get('eventAt')).fromNow();
										$('screen#start content #nearbyEvents list').append( t(dO) );
										
									});
									if ($('screen#start content #nearbyEvents list').children().length == 0) {
										$('screen#start content #nearbyEvents list').html('No events nearby.<br>Create one now!');
									}
									//add event handlers for generated list items
									$.when( views.screens.start.remListE() ).done( views.screens.start.addListE() );
									//remove loading indicators
									$('screen#start #btn_refreshData').removeClass('disabled');
									$('screen#start #btn_refreshData').removeClass('infiniteSpin');
								},
								error: function(error){
									console.error(error);
								}
							});
					}
					df.resolve();
				});
			},
			render : function(){
				$('app screen').addClass('hidden');
				views.screens.start.remE().done( function(){
					views.screens.start.addE();
					$('screen#start').removeClass('hidden');
				});
			},
			remE : function(){
				return $.Deferred(function(f){
					$('screen#start #btn_toggleMenu').hammer().off('tap');
					$('screen#start #btn_refreshData').hammer().off('tap');
					$('screen#start #btn_addEvent').hammer().off('tap');
					f.resolve();
				});
			},
			addE : function(){
				return $.Deferred(function(f){
					$('screen#start #btn_toggleMenu').hammer().on('tap',function(){
						$(this).addClass('spinFaceUp');
						setTimeout(menu.show,300);
					});
					$('screen#start #btn_refreshData').hammer().on('tap',function(){
						views.screens.start.getData(true);
					});
					$('screen#start #btn_addEvent').hammer().on('tap',function(){
						views.modals.addEvent.show();
					});
					f.resolve();
				});
			},
			remListE : function(){
				return $.Deferred(function(f){
					//remove events
					console.log('Removing list events for Start Screen');
					$('screen#start content list item').hammer().off('tap');
					f.resolve();
				});
			},
			addListE : function(){
				return $.Deferred(function(f){
					//add events
					console.log('Adding list events for Start Screen');
					$('screen#start content list item').hammer().on('tap',function(){
						$(this).addClass('active');
						views.modals.eventDetail.show($(this).data('id'));
					});
					f.resolve();
				});
			}
		}
	},
	modals : {
		addEvent : {
			initialize : function(){
				$.when( views.modals.addEvent.remE() ).done( views.modals.addEvent.addE() );
			},
			show : function(eventID){
				//UI iniitalize
				$('modal#addEvent top #btn_save').addClass('disabled');
				
				//Initialize Modal Events
				views.modals.addEvent.initialize();

				//Show the modal
				$('screen').not('.hidden').addClass('fadeAway');
				$('modal#addEvent').removeClass('viewportBottom');

				//show a tab
				$('modal#addEvent tabgroup#'+$('modal#addEvent tab.active').attr('for') ).removeClass('hidden');
			},
			hide : function(){
				views.modals.addEvent.remE();
				$('modal#addEvent #frm_newEvent')[0].reset();
				$('input, textarea, button, select').blur();
				$('modal#addEvent').addClass('viewportBottom');
				$('screen').not('.hidden').removeClass('fadeAway');
			},
			remE : function(){
				$('modal#addEvent #btn_cancel').hammer().off('tap');
				$('modal#addEvent #btn_save').hammer().off('tap');
				$('modal#addEvent tabs tab').hammer().off('tap');
				$('modal#addEvent #frm_newEvent').off('submit');
			},
			addE : function(){
				$('modal#addEvent #btn_cancel').hammer().on('tap', function(){
					views.modals.addEvent.hide();
				});
				$('modal#addEvent #btn_save').hammer().on('tap', function(){
					alert('Save tapped');
				});
				$('modal#addEvent tabs tab').hammer().on('tap', function(){
					$('modal#addEvent tabs tab').removeClass('active');
					$(this).addClass('active');
					$('modal#addEvent tabgroup').addClass('hidden');
					$('modal#addEvent tabgroup#'+$('modal#addEvent tab.active').attr('for') ).removeClass('hidden');
				});
				$('modal#addEvent #frm_newEvent').on('submit', function(e){
					if (meta.lastEventMessageAt >= new Date().subSeconds(1.5)) {
						console.log('Prevented message spam');
					} else {
						//update when the last message was to prevent spamming events with messages
						meta.lastEventMessageAt = new Date();
						//save the message to Parse
						var Message = Parse.Object.extend('Message');
						var msg = new Message();
						msg.set('text', $('modal#eventDetail #frm_eventMessage #txt_text').val());
						msg.set('user', Parse.User.current());
						msg.set('event', meta.lastEvent);
						msg.save(null, {
							success: function(message){
								meta.lastEventMessages.push(message);
								views.modals.eventDetail.getMessages(meta.lastEvent, false);
								$('modal#eventDetail #frm_eventMessage')[0].reset();
								$('modal#eventDetail #frm_eventMessage #btn_sendMessage').prop('disabled', true);
								setTimeout(function(){
									$('modal#eventDetail #frm_eventMessage #btn_sendMessage').prop('disabled', false);
								},1500);
							},
							error: function(error){
								navigator.notification.alert(
									"Could not send your message.  Not sure why, but we're looking at it.", 
									null, 
									"Oops!",
									"OK"
								);
								console.log(error);
							}
						});
					}
					e.preventDefault();
				});
			}
		},
		eventDetail : {
			initialize : function(){
				$.when( views.modals.eventDetail.remE() ).done( views.modals.eventDetail.addE() );
			},
			show : function(eventID){
				//UI iniitalize
				
				if (typeof eventID != "undefined") {
					$.when( views.modals.eventDetail.getData(eventID) ).done( views.modals.eventDetail.initialize() );

					$('screen').not('.hidden').addClass('fadeAway');
					//$('modal#eventDetail top #btn_save').addClass('disabled');
					$('modal#eventDetail').removeClass('viewportBottom');
				} else {
					console.error('You must specify an eventID when loading modal#eventDetail');
				}
			},
			getData : function(eventID){
				return $.Deferred(function(f){
					//get some kind of data here
					var Event = Parse.Object.extend('Event');
					var qEvent = new Parse.Query(Event);
					qEvent.get(eventID,{
						success: function(event){
							meta.lastEvent = event;
							//got the event
							var lat = event.get('eventGeo').latitude;
							var lng = event.get('eventGeo').longitude;
							$('modal#eventDetail event name').html(event.get('name'));
							$('modal#eventDetail event date fromnow').html(moment(event.get('eventAt')).fromNow());
							$('modal#eventDetail event date fulldate').html(utility.formatDate(event.get('eventAt')));
							$('modal#eventDetail top').css('background-image','url(http://maps.googleapis.com/maps/api/staticmap?center='+lat+','+lng+'&zoom=15&format=png&sensor=false&size=640x480&maptype=roadmap&style=element:labels.icon|visibility:off&style=feature:administrative.country|element:labels|visibility:off&style=feature:administrative.province|element:labels|visibility:off&style=feature:road|visibility:simplified&style=feature:road.local|element:labels|visibility:off&style=feature:road.arterial|element:labels.icon|visibility:off&style=feature:water|visibility:simplified&style=feature:landscape|visibility:simplified&style=feature:poi|visibility:simplified&style=element:labels|visibility:off&style=feature:transit|element:geometry|visibility:off&style=feature:road)');
							
							//retrieve messages for this event
								views.modals.eventDetail.getMessages(event, true);
							//retrieve Attendees for this event
								views.modals.eventDetail.getAttendance(event, true);
							
						},
						error: function(object, error){
							console.error(error);
							f.reject(error);
						}
					});
				});
			},
			getMessages : function(event, forceDataUpdate){
				return $.Deferred(function(f){
					//indicate messages are coming
					$('modal#eventDetail content').html('Loading messages...');
					if (typeof forceDataUpdate == "undefined") { forceDataUpdate = false };
					if (meta.lastEventMessagesTimestamp <= new Date().subMinutes(2) || forceDataUpdate) {
						//cached messages are too old, so get new ones & render
						var Message = Parse.Object.extend('Message');
						var messages = new Parse.Query(Message);
						messages.equalTo('event', event);
						messages.notEqualTo('flagged', true);
						messages.include('user');
						messages.ascending('createdAt');
						messages.find({
							success: function(results){
								meta.lastEventMessages = results;
								meta.lastEventMessagesTimestamp = new Date();
								//clear the messages list
								$('modal#eventDetail content').html('');
								if (results.length == 0) {
									$('modal#eventDetail content').html('No messages in this Event yet.');
								} else {
									views.modals.eventDetail.renderMessages(results).done(function(){
										$('modal#eventDetail content').scrollTop($('modal#eventDetail content message:last-child').offset().top);
									});
								}
								f.resolve();
							},
							error: function(error){
								console.error(error)
								f.reject(error);
							}
						});
					} else {
						//cached messages are still fresh, so render
						views.modals.eventDetail.renderMessages(meta.lastEventMessages).done(function(){
							$('modal#eventDetail content').scrollTop($('modal#eventDetail content message:last-child').offset().top);
						});
						f.resolve();
					}
				});
			},
			renderMessages : function(messageArray){
				return $.Deferred(function(f){
					$('modal#eventDetail content').html('');
					var t = _.template( $('#tpl_eventMessage').html() );
					_.each(messageArray,function(o,i,a){
						// o = individual object
						// i = array index ##
						// a = full array
						//DEBUG
						console.log(o);
						var msg = {};
						msg.id = o.id;
						msg.userName = o.get('user').get('firstname');
						msg.text = o.get('text');
						msg.date = moment(o.createdAt).fromNow();
						$('modal#eventDetail content').append( t(msg) );
					});
					f.resolve();
				});
			},
			getAttendance : function(event, forceDataUpdate){
				return $.Deferred(function(f){
					if (typeof forceDataUpdate == "undefined") { forceDataUpdate = false };
					if (meta.lastEventAttendanceTimestamp <= new Date().subMinutes(5) || forceDataUpdate) {
						var Attendance = Parse.Object.extend('Attendance');
						var attendees = new Parse.Query(Attendance);
						attendees.equalTo('event', event);
						attendees.equalTo('status', 1); //status 1=going
						attendees.include('user');
						attendees.find({
							success: function(data){
								meta.lastEventAttendance = data;
								meta.lastEventAttendanceTimestamp = new Date();
								$('modal#eventDetail top #btn_attendees label').html(''+data.length+'');
								//check if the current user is attending this event
								_.each(data,function(o,i,a){
									if ( o.get('user').id == Parse.User.current().id ) {
										meta.lastEventUserAttending = true;
									}
								});
								if (meta.lastEventUserAttending) {
									$('modal#eventDetail #frm_eventMessage').removeClass('hidden');
									$('modal#eventDetail #btn_attendEvent').addClass('hidden');
								} else {
									$('modal#eventDetail #frm_eventMessage').addClass('hidden');
									$('modal#eventDetail #btn_attendEvent').removeClass('hidden');
								}
								f.resolve();
							},
							error: function(error){
								navigator.notification.alert(
									"Could not retrieve list of Attendees. Go back and try to load this event again.", 
									function(){
										console.log('Closed attendee fail alert');
									},
									"Oops!",
									"OK"
								);
								console.log(error);
								f.reject(error);
							}
						});
					}
				});
			},
			hide : function(){
				views.modals.eventDetail.remE();
				$('modal#eventDetail').addClass('viewportBottom');
				$('screen').not('.hidden').removeClass('fadeAway');
				setTimeout(function(){
					//remove the Active class from the list item tapped
					$('screen list item').removeClass('active');
					$('modal#eventDetail #frm_eventMessage').addClass('hidden');
					$('modal#eventDetail #btn_attendEvent').addClass('hidden');
					$('modal#eventDetail top').css('background-image','none');
					$('modal#eventDetail event name, modal#eventDetail event date fromnow, modal#eventDetail event date fulldate').html('');
					$('modal#eventDetail content').html('');
				},500);
			},
			remE : function(){
				$('modal#eventDetail #btn_back').hammer().off('tap');
				$('modal#eventDetail #btn_location').hammer().off('tap');
				$('modal#eventDetail #btn_attendance').hammer().off('tap');
				$('modal#eventDetail #btn_attendEvent').hammer().off('tap');
				$('modal#eventDetail #frm_eventMessage').off('submit');
			},
			addE : function(){
				$('modal#eventDetail #btn_back').hammer().on('tap', function(){
					views.modals.eventDetail.hide();
				});
				$('modal#eventDetail #btn_location').hammer().on('tap', function(){
					alert('Location tapped - launch actionsheet here');
				});
				$('modal#eventDetail #btn_attendance').hammer().on('tap', function(){
					alert('Attendance count tapped - launch attendee list here');
				});
				$('modal#eventDetail #btn_attendEvent').hammer().on('tap', function(){
					navigator.notification.confirm(
						"You'll be there " + moment().fromNow(meta.lastEvent.get('eventAt')) + ".", 
						function(buttonIndex){
							if (buttonIndex == 1) {
								var Attendance = Parse.Object.extend('Attendance');
								var attending = new Attendance();
								attending.set('user', Parse.User.current());
								attending.set('event', meta.lastEvent);
								attending.set('status', 1);
								attending.save(null,{
									success: function(attendanceObj){
										views.screens.start.getData(true);
										views.modals.eventDetail.show(meta.lastEvent.id);
									},
									error: function(error){
										navigator.notification.alert(
											"Could not join this event.  Not sure why, but we're looking at it.", 
											null, 
											"Oops!",
											"OK"
										);
										console.error(error);
									}
								});
							}
						}, 
						meta.lastEvent.get('name'),
						['You bet!', 'No thanks']
					);
				});
				$('modal#eventDetail #frm_eventMessage').on('submit', function(e){
					if (meta.lastEventMessageAt >= new Date().subSeconds(1.5)) {
						console.log('Prevented message spam');
					} else {
						//update when the last message was to prevent spamming events with messages
						meta.lastEventMessageAt = new Date();
						//save the message to Parse
						var Message = Parse.Object.extend('Message');
						var msg = new Message();
						msg.set('text', $('modal#eventDetail #frm_eventMessage #txt_text').val());
						msg.set('user', Parse.User.current());
						msg.set('event', meta.lastEvent);
						msg.save(null, {
							success: function(message){
								meta.lastEventMessages.push(message);
								views.modals.eventDetail.getMessages(meta.lastEvent, false);
								$('modal#eventDetail #frm_eventMessage')[0].reset();
								$('modal#eventDetail #frm_eventMessage #btn_sendMessage').prop('disabled', true);
								setTimeout(function(){
									$('modal#eventDetail #frm_eventMessage #btn_sendMessage').prop('disabled', false);
								},1500);
							},
							error: function(error){
								navigator.notification.alert(
									"Could not send your message.  Not sure why, but we're looking at it.", 
									null, 
									"Oops!",
									"OK"
								);
								console.log(error);
							}
						});
					}
					e.preventDefault();
				});
			},
			remListE : function(){
				return $.Deferred(function(f){
					//remove some events here
					f.resolve();
				});
			},
			addListE : function(){
				return $.Deferred(function(f){
					//add some events here
					f.resolve();
				});
			}
		}
	}
};

var menu = {
	initialize : function(){
		$('menu').addClass('menu-left');
		$('app').removeClass('tiltBack');
		$.when( menu.remE() ).done( menu.addE() );
	},
	show : function(){
		console.log('Showing Menu');
		$('app').addClass('tiltBack');
		$('menu').removeClass('menu-left');
		$('.touched').removeClass('touched');
		$('app screen').not('.hidden').each(function(i,v){
			window['views']['screens'][$(v).attr('id')]['remE']();
		});
		setTimeout(function(){
			$('app').hammer().one('tap hold', function(){
				menu.hide();
			});
		},500);
	},
	hide : function(){
		console.log('Hiding Menu');
		$('menu').addClass('menu-left');
		$('app').removeClass('tiltBack');
		$('app screen').not('.hidden').each(function(i,v){
			window['views']['screens'][$(v).attr('id')]['addE']();
		});
		setTimeout(function(){
			$('.spinFaceUp').removeClass('spinFaceUp');
			$('.touched').removeClass('touched');
		},300);
	},
	remE : function(){
		$('menu #btn_menu_locations').hammer().off('tap');
		$('menu #btn_menu_favs').hammer().off('tap');
		$('menu #btn_menu_settings').hammer().off('tap');
		$('menu #btn_menu_logout').hammer().off('tap');
	},
	addE : function(){
		$('menu #btn_menu_locations').hammer().on('tap',function(){});
		$('menu #btn_menu_favs').hammer().on('tap',function(){});
		$('menu #btn_menu_settings').hammer().on('tap',function(){});
		$('menu #btn_menu_logout').hammer().on('tap',function(){
			Parse.User.logOut();
			views.initialize();
		});
	}
};

var utility = {
	formatDate : function(dateObject){
		return moment(dateObject).format("MMM Do, h:mm A");
	},
	dateDiff : function(date1, date2){
		if (!date2) {
			// if no date2, assume to check difference to now
			date2 = new Date();
		}
		return (date1 - date2)
	},
	deg2rad : function(deg){
		return deg * (Math.PI/180)
	},
	getDist : function(longitude, latitude){
		
		var target = {
			lon : longitude,
			lat : latitude
		};

		var R = 6371; // Radius of the earth in km
		var dLat = utility.deg2rad( parseFloat(Parse.User.current().get('Geo').latitude) - parseFloat(target.lat) );
		var dLon = utility.deg2rad( parseFloat(Parse.User.current().get('Geo').longitude) - parseFloat(target.lon) ); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(utility.deg2rad( parseFloat(target.lat) )) * Math.cos(utility.deg2rad( parseFloat(Parse.User.current().get('Geo').latitude) )) * Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		var dRounded2 = +d.toFixed(2); // Round to 2 decimal

		return dRounded2	
	},
	getTimeToDist : function(distInKm,speedInKmH){
		if(!speedInKmH){
			speedInKmH = 35;
		}
		var d = ( (distInKm/speedInKmH) * 60);
		var dRounded = +d.toFixed(0);
		return dRounded
	},
	openAppleMaps : function(longitude, latitude){
		window.location.href = "maps://maps.apple.com/?q="+latitude+","+longitude;
	},
	geolocate : function(addressString){
		var loc = {};
		$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(addressString)+'&key='+meta.keys.google.current)
		.done(function(data){
			meta.tempGeolocate = data;
			loc = data.results[0].geometry.location;
			meta.locations = data.results;
			return loc;
		})
		.fail(function(jqXHR,textStatus,error){
			console.error(error);
		});
	},
	reverseGeoCode : function(lat, lng, callback){
		var uri = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key='+meta.keys.google.current;
		return $.Deferred(function(rgcf){

			$.getJSON(uri)
				.done(function(data){
					console.log('Got address(es)');
					meta.lastLocationSearch = data;
					rgcf.resolve(data);
				})
				.fail(function(jqXHR,textStatus,error){
					console.error(error);
					rgcf.reject(error);
				})
				.always(callback);
			
		});
	},
	delayGeolocate : function(stringtoLocate){
		return $.Deferred(function(data){
			if (stringtoLocate) {
				// do the lookup
				$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(stringtoLocate)+'&key='+meta.keys.google.current)
				.done(function(d){
					data.resolve(d);
				})
				.fail(function(jqXHR,textStatus,error){
					data.reject(error);
				});
			} else {
				data.reject('No address specified.');
			}
		}).promise();
	},
	deferredGetLocation : function(useHTML5geoBoolean, forceDataUpdate){
		return $.Deferred(function(data){
			// 300000ms = 5min
			if ( utility.dateDiff(Parse.User.current().get('GeoAt')) <= 300000 || forceDataUpdate == true ) {
				// get a fresh location
				if (useHTML5geoBoolean == true) {
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position){
							if (typeof position != "undefined") {
								var point = new Parse.GeoPoint({
									'latitude' : position.coords.latitude,
									'longitude' : position.coords.longitude
								});
								Parse.User.current().set('Geo',point);
								Parse.User.current().set('GeoAt',new Date);
								Parse.User.current().save(null,{
									success : function(user){
										console.log("Parse: Updated User's Geolocation");
									},
									error : function(user, error){
										console.error("Parse: Failed to update User's Geolocation");
										console.error(error);
									}
								});
								data.resolve(point);
							} else {
								data.reject('Unable to retrieve position from webview.');
							}
						});
					} else {
						data.reject({
							error : 'Browser doesn\'t support HTML5 Geolocation.'
						});
						console.error('Browser doesn\'t support HTML5 Geolocation.');
					}
				} else {
					console.log('Fetching position via Cordova...');
					navigator.geolocation.getCurrentPosition(function(position){
						// sucess
						//DEBUG
						console.log(position);
						var point = new Parse.GeoPoint({
							'latitude' : position.coords.latitude,
							'longitude' : position.coords.longitude
						});
						Parse.User.current().set('Geo',point);
						Parse.User.current().set('GeoAt',new Date);
						Parse.User.current().save(null,{
							success : function(user){
								console.log("Parse: Updated User's Geolocation");
							},
							error : function(user, error){
								console.error("Parse: Failed to update User's Geolocation");
								console.error(error);
							}
						});
						meta.googleLoc = new google.maps.LatLng(Parse.User.current().get('Geo').latitude,Parse.User.current().get('Geo').longitude);
						data.resolve(point);
					},function(e){
						// error
						//DEBUG
						console.error('Phonegap GEO FAILED');
						console.error(e);
						data.reject({
							error : e.message
						});
					},
					{
						maximumAge: 3000,
						timeout: 30000,
						enableHighAccuracy: true
					});
				}
			} else {
				// get the cached data
				data.resolve( Parse.User.current().get('Geo') );
			}
		}).promise();
	},
	deferredGetAddress : function(geoPoint){
		var uri;
		if (!geoPoint) {
			uri = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+Parse.User.current().get('Geo').latitude+','+Parse.User.current().get('Geo').longitude+'&key='+meta.keys.google.current;
		} else {
			uri = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+geoPoint.latitude+','+geoPoint.longitude+'&key='+meta.keys.google.current;
		}
		return $.getJSON(uri)
			.done(function(data){
				console.log('Got address(es)');
				meta.lastLocationSearch = data;
				//console.log(data);
			})
			.fail(function(jqXHR,textStatus,error){
				console.error(error);
			});
	},
};

$(function(){
	app.initialize();
});
