/**
 * Created by Wouter Eekhout on 06/01/2017.
 */
Module.register("MMM-Tado", {
    // Default module config.
    defaults: {
        username: '',
        password: '',
        updateInterval: 300000
    },

    tadoClient: {},
    tadoMe: {},
    tadoHomes: [],

    getScripts: function () {
        return [
            'moment.js',
            this.file('js/lib/jquery.min.js'),
            this.file('js/lib/lodash.min.js'),
            this.file('js/tado-client.js') // this file will be loaded straight from the module folder.
        ]
    },

    getStyles: function () {
        return [
            this.file('css/MMM-Tado.css'),
            this.file('css/font-awesome-4.7.0/css/font-awesome.min.css')
        ];
    },

    init: function () {

    },

    start: function () {
        if (this.config.username == '' || this.config.password == '') {
            return;
        }

        this.refreshAll();

        var self = this;

        setTimeout(function () {
            self.updateDom();
        }, 3000); //wait 3 seconds

        setInterval(function () {
            self.updateTadoStates();
            setTimeout(function () {
                self.updateDom();
            }, 3000); //wait 3 seconds
        }, this.config.updateInterval);
    },

    // Override dom generator.
    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = "tado-info";
        _.forEach(this.tadoHomes, function (home) {
            var homeWrapper = document.createElement("div");
            homeWrapper.className = "tado-home";

            var logoWrapper = document.createElement("i");
            logoWrapper.className = "tado-icon-tado_logo tado-logo";
            homeWrapper.appendChild(logoWrapper);

            // var homeTitleWrapper = document.createElement("h3");
            // homeTitleWrapper.className = "tado-home-name bright medium light";
            // homeTitleWrapper.innerHTML = home.name;
            // homeWrapper.appendChild(homeTitleWrapper);

            var tableWrapper = document.createElement("table");
            tableWrapper.className = "tado-table small";

            _.forEach(home.zones, function (zone) {
                var rowWrapper = document.createElement("tr");

                if (zone.type === "HOT_WATER") {
                    var firstTableDataWrapper = document.createElement("td");
                    firstTableDataWrapper.className = "tado-table-name";

                    var zoneNameWrapper = document.createElement("span");
                    zoneNameWrapper.innerText = zone.name;
                    firstTableDataWrapper.appendChild(zoneNameWrapper);
                    rowWrapper.appendChild(firstTableDataWrapper);

                    var secondTableDateWrapper = document.createElement("td");
                    secondTableDateWrapper.className = "tado-table-data";

                    var temperatureWrapper = document.createElement("span");
                    var temperatureIconWrapper = document.createElement("i");
                    temperatureIconWrapper.className = "fa fa-thermometer-full";
                    temperatureWrapper.appendChild(temperatureIconWrapper);
                    if (zone.state.setting.temperature == null) {
                        var temperatureTextWrapper = document.createTextNode(zone.state.setting.power);
                    } else {
                        if (this.config.units === "metric") {
                            var temperatureTextWrapper = document.createTextNode(zone.state.setting.temperature.celsius + "°");
                        } else {
                            var temperatureTextWrapper = document.createTextNode(zone.state.setting.temperature.fahrenheit + "°");
                        }
                    }
                    temperatureWrapper.appendChild(temperatureTextWrapper);
                    secondTableDateWrapper.appendChild(temperatureWrapper);

                    rowWrapper.appendChild(secondTableDateWrapper);
                }
                else if (zone.type === "HEATING") {
                    var firstTableDataWrapper = document.createElement("td");
                    firstTableDataWrapper.className = "tado-table-name";

                    var zoneNameWrapper = document.createElement("span");
                    zoneNameWrapper.innerText = zone.name;
                    firstTableDataWrapper.appendChild(zoneNameWrapper);
                    rowWrapper.appendChild(firstTableDataWrapper);

                    var secondTableDateWrapper = document.createElement("td");
                    secondTableDateWrapper.className = "tado-table-data";

                    //current temperature
                    var temperatureWrapper = document.createElement("span");
                    temperatureWrapper.className = "bright";
                    var temperatureIconWrapper = document.createElement("i");
                    temperatureIconWrapper.className = "fa fa-thermometer-full";
                    temperatureWrapper.appendChild(temperatureIconWrapper);
                    if (this.config.units === "metric") {
                        var temperatureTextWrapper = document.createTextNode(zone.state.sensorDataPoints.insideTemperature.celsius + "°");
                    } else {
                        var temperatureTextWrapper = document.createTextNode(zone.state.sensorDataPoints.insideTemperature.fahrenheit + "°");
                    }
                    temperatureWrapper.appendChild(temperatureTextWrapper);

                    // Heating indicator
                    if (zone.state.activityDataPoints.heatingPower.percentage > 0) {
                        //The zone is heating
                        var heatingWrapper = document.createElement("i");
                        heatingWrapper.className = "fa fa-fire bright";
                        temperatureWrapper.appendChild(heatingWrapper);
                    }
                    secondTableDateWrapper.appendChild(temperatureWrapper);

                    //target temperature
                    var temperatureTargetWrapper = document.createElement("span");
                    temperatureTargetWrapper.className = "xsmall";
                    //var temperatureTargetIconWrapper = document.createElement("i");
                    //temperatureTargetIconWrapper.className = "fa fa-thermometer-full";
                    //temperatureTargetWrapper.appendChild(temperatureTargetIconWrapper);
                    if (zone.state.setting.temperature == null) {
                        var temperatureTargetTextWrapper = document.createTextNode(zone.state.setting.power);
                    } else {
                        if (this.config.units == "metric") {
                            var temperatureTargetTextWrapper = document.createTextNode(zone.state.setting.temperature.celsius + "°");
                        } else {
                            var temperatureTargetTextWrapper = document.createTextNode(zone.state.setting.temperature.fahrenheit + "°");
                        }
                    }
                    temperatureTargetWrapper.appendChild(temperatureTargetTextWrapper);
                    secondTableDateWrapper.appendChild(temperatureTargetWrapper);

                    // humidity
                    // var breakLine = document.createElement("br");
                    // secondTableDateWrapper.appendChild(breakLine);
                    //
                    // var humidityWrapper = document.createElement("span");
                    // var humidityIconWrapper = document.createElement("i");
                    // humidityIconWrapper.className = "fa fa-tint";
                    // humidityWrapper.appendChild(humidityIconWrapper);
                    // var humidityTextWrapper = document.createTextNode(zone.state.sensorDataPoints.humidity.percentage + "%");
                    // humidityWrapper.appendChild(humidityTextWrapper);
                    // secondTableDateWrapper.appendChild(humidityWrapper);

                    rowWrapper.appendChild(secondTableDateWrapper);
                }
                else if (zone.type === "AIR_CONDITIONING") {
                    var firstTableDataWrapper = document.createElement("td");
                    firstTableDataWrapper.className = "tado-table-name";

                    var zoneNameWrapper = document.createElement("span");
                    zoneNameWrapper.innerText = zone.name;
                    firstTableDataWrapper.appendChild(zoneNameWrapper);
                    rowWrapper.appendChild(firstTableDataWrapper);

                    var secondTableDateWrapper = document.createElement("td");
                    secondTableDateWrapper.className = "tado-table-data";

                    //current temperature
                    var temperatureWrapper = document.createElement("span");
                    temperatureWrapper.className = "bright";
                    var temperatureIconWrapper = document.createElement("i");
                    temperatureIconWrapper.className = "fa fa-thermometer-full";
                    temperatureWrapper.appendChild(temperatureIconWrapper);
                    if (this.config.units === "metric") {
                        var temperatureTextWrapper = document.createTextNode(zone.state.sensorDataPoints.insideTemperature.celsius + "°");
                    } else {
                        var temperatureTextWrapper = document.createTextNode(zone.state.sensorDataPoints.insideTemperature.fahrenheit + "°");
                    }
                    temperatureWrapper.appendChild(temperatureTextWrapper);
                    if (zone.state.setting.mode === "HEAT") {
                        //The zone is heating
                        var heatingWrapper = document.createElement("i");
                        heatingWrapper.className = "fa fa-fire bright";
                        temperatureWrapper.appendChild(heatingWrapper);
                    }
                    else if (zone.state.setting.mode === "COOL") {
                        //The zone is heating
                        var heatingWrapper = document.createElement("i");
                        coolingWrapper.className = "fa fa-snowflake-o bright";
                        temperatureWrapper.appendChild(coolingWrapper);
                    }
                    secondTableDateWrapper.appendChild(temperatureWrapper);

                    //target temperature
                    var temperatureTargetWrapper = document.createElement("span");
                    temperatureTargetWrapper.className = "xsmall";
                    var temperatureTargetIconWrapper = document.createElement("i");
                    temperatureTargetIconWrapper.className = "fa fa-thermometer-full";
                    temperatureTargetWrapper.appendChild(temperatureTargetIconWrapper);
                    if (zone.state.setting.temperature == null) {
                        var temperatureTargetTextWrapper = document.createTextNode(zone.state.setting.power);
                    } else {
                        if (this.config.units == "metric") {
                            var temperatureTargetTextWrapper = document.createTextNode(zone.state.setting.temperature.celsius + "°");
                        } else {
                            var temperatureTargetTextWrapper = document.createTextNode(zone.state.setting.temperature.fahrenheit + "°");
                        }
                    }
                    temperatureTargetWrapper.appendChild(temperatureTargetTextWrapper);
                    secondTableDateWrapper.appendChild(temperatureTargetWrapper);

                    var breakLine = document.createElement("br");
                    secondTableDateWrapper.appendChild(breakLine);

                    var humidityWrapper = document.createElement("span");
                    var humidityIconWrapper = document.createElement("i");
                    humidityIconWrapper.className = "fa fa-tint";
                    humidityWrapper.appendChild(humidityIconWrapper);
                    var humidityTextWrapper = document.createTextNode(zone.state.sensorDataPoints.humidity.percentage + "%");
                    humidityWrapper.appendChild(humidityTextWrapper);
                    secondTableDateWrapper.appendChild(humidityWrapper);

                    rowWrapper.appendChild(secondTableDateWrapper);
                } else {
                    //don't add it
                    return;
                }

                tableWrapper.appendChild(rowWrapper);
            });

            homeWrapper.appendChild(tableWrapper);
            wrapper.appendChild(homeWrapper);
        });
        return wrapper;
    },

    getTadoInfo: function () {
        this.tadoClient.me(this.loadTadoMe, this);
    },

    loadTadoMe: function (me, cl) {
        this.tadoMe = me;

        _.forEach(this.tadoMe.homes, function (home) {
            var homeInfo = {};
            homeInfo.id = home.id;
            homeInfo.name = home.name;
            homeInfo.zones = [];

            cl.tadoHomes.push(homeInfo);
            cl.tadoClient.zones(home.id, cl.loadTadoZones, homeInfo, cl);
        });
    },

    loadTadoZones: function (zones, homeInfo, cl) {
        _.forEach(zones, function (zone) {
            var zoneInfo = {};
            zoneInfo.id = zone.id;
            zoneInfo.name = zone.name;
            zoneInfo.type = zone.type;
            zoneInfo.state = {};

            homeInfo.zones.push(zoneInfo);
            cl.tadoClient.state(homeInfo.id, zoneInfo.id, cl.loadTadoZoneState, zoneInfo, cl);
        });
    },

    loadTadoZoneState: function (state, zone, cl) {
        zone.state = state;
    },

    updateTadoStates: function () {
        var self = this;
        _.forEach(this.tadoHomes, function (home) {
            _.forEach(home.zones, function (zone) {
                self.tadoClient.state(home.id, zone.id, self.loadTadoZoneState, zone, self);
            });
        });
    },

    refreshAll: function () {
        this.tadoClient = {};
        this.tadoMe = {};
        this.tadoHomes = [];

        this.tadoClient = new TadoClient(this.config.username, this.config.password);
        this.getTadoInfo();
    }
});
