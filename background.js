var globalTraffic = -1;
			
			var dormitories = {
				"HSS":{
					"dormitoryHome": "http://wh12.tu-dresden.de",
					"dormitoryTrafficSite": "https://wh12.tu-dresden.de/traffic-o-meter.html",
					"dormitoryTraffic": "http://wh12.tu-dresden.de/tom.addon2.php"
				},
				"WU":{
					"dormitoryHome": "http://www.wh2.tu-dresden.de",
					"dormitoryTrafficSite": "https://www.wh2.tu-dresden.de/de/usertraffic",
					"dormitoryTraffic": "http://www.wh2.tu-dresden.de/traffic/getMyTraffic.php"
				},
				"ZEU":{
					"dormitoryHome": "http://zeus.wh25.tu-dresden.de",
					"dormitoryTrafficSite": "http://zeus.wh25.tu-dresden.de/zeuser/agdsnISAPI.php?site=traffic",
					"dormitoryTraffic": "http://zeus.wh25.tu-dresden.de/traffic.php"
				},
				"BOR":{
					"dormitoryHome": "http://wh10.tu-dresden.de",
					"dormitoryTrafficSite": "http://www.wh10.tu-dresden.de/index.php/traffic.html",
					"dormitoryTraffic": "http://wh10.tu-dresden.de/phpskripte/getMyTraffic.php"
				},
				"GER":{
					"dormitoryHome": "http://www.wh17.tu-dresden.de/",
					"dormitoryTrafficSite": "http://www.wh17.tu-dresden.de/traffic/uebersicht",
					"dormitoryTraffic": "http://www.wh17.tu-dresden.de/traffic/prozent"
				}
			}
			
			function getDormitory() {
				var found = false;
				for (var dormitory in dormitories) {
					if (found) {
						break;
					}
					var req = new XMLHttpRequest();
					var url = dormitories[dormitory]["dormitoryTraffic"];
					req.open("GET", url, false);
					req.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
							var traffic = parseFloat(this.responseText);
							if (traffic >= 0 && traffic <= 100) {
								localStorage["dormitory"] = dormitory;
								found = true;
							}
						};
					};
					req.send();
				}
				
				if (found) {
					return localStorage["dormitory"];
				}
			}
			
			function clearState() {
				chrome.browserAction.setIcon({path:"icon/hide.png"});
				globalTraffic = -1;
				localStorage["dormitory"] = "";
			}
		
			function updateIcon() {
				if (this.readyState == 4 && this.status == 200) {
					var traffic = parseFloat(this.responseText);
					if (isNaN(traffic) || traffic == -1) {
						clearState();
						return;
					}
					globalTraffic = traffic;
					var name = Math.round( (32/100) * traffic)
					chrome.browserAction.setIcon({path:"icon/" + name + ".png"});
				}
			}
	
			function updateTraffic() {
				var dormitory = localStorage["dormitory"];
				if (!dormitory) {
					dormitory = getDormitory();
				}
				if (!dormitory) {
					clearState();
					return;
				}
				var req = new XMLHttpRequest();
				var url = dormitories[dormitory]["dormitoryTraffic"];
				req.open("GET", url, true);
				req.onreadystatechange = updateIcon;
				req.send();	
			}
			
			chrome.browserAction.setBadgeBackgroundColor({color: [1, 1, 1, 1]});
			updateTraffic();
			chrome.alarms.onAlarm.addListener(updateTraffic);
			chrome.alarms.create("updateTraffic", {periodInMinutes: 2});
