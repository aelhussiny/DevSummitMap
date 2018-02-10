define([
    "dojo/_base/declare",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Home",
    "esri/PopupTemplate",
    "esri/Graphic",
    "dojo/Evented",
    "dojo/domReady!"
], function (declare, Map, MapView, FeatureLayer, Home, PopupTemplate, Graphic, Evented) {

    return declare("MyMap", [Evented], {
        points: null,
        updateFeaturesHold: null,
        createView: function () {
            var map = new Map({
                basemap: "streets"
            });
            var view = new MapView({
                container: "mapDiv",
                map: map,
                zoom: (config.width > 768 ? 18 : 17),
                center: [-116.53833694859127, 33.82524656827837],
                constraints: {
                    rotationEnabled: false
                }
            });
            view.when(function () {
                var psccLayer = new FeatureLayer({
                    url: config.psccPolygonLayerURL,
                    outFields: ["*"]
                });
                map.add(psccLayer);
                this.homeWidget = new Home({
                    view: view
                });
                view.ui.add(this.homeWidget, "top-left");
            }.bind(this));
            this.view = view;
            window.view = view;
            var psccPoints = new FeatureLayer({
                url: config.psccPointLayerURL,
                outFields: ["*"]
            });
            psccPoints.queryFeatures({
                where: "1=1",
                outSpatialReference: {
                    wkid: 102100
                },
                returnGeometry: true,
                outFields: ["*"]
            }).then(function (results) {
                this.points = results.features;
            }.bind(this));
            view.popup.watch("selectedFeature", function (feature) {
                if (feature != null) {
                    this.emit("featureselected", feature);
                }
            }.bind(this));
            view.popup.watch("visible", function (visible) {
                if (!visible) {
                    this.emit("popupClosed", {})
                }
            }.bind(this));
        },

        updateView: function () {
            this.view.zoom = (config.width > 768 ? 18 : 17);
            this.view.goTo([
                [-116.53833694859127, 33.82524656827837]
            ]).then(function () {
                this.homeWidget.viewpoint = this.view.viewpoint;
            }.bind(this));
        },

        setSelectedFeature: function (sessionTitle, sessionDate) {
            var graphic = this.view.graphics.items.filter(function (session) {
                return (session.attributes.TITLE == sessionTitle && session.attributes.TIMEFROM == sessionDate);
            })[0];
            if (typeof graphic != "undefined") {
                this.view.popup.clear();
                setTimeout(function () {
                    this.view.popup.location = graphic.geometry;
                    this.view.popup.title = graphic.attributes.TITLE;
                    this.view.popup.content = graphic.attributes.POPUPCONTENT;
                    this.view.popup.open();
                }.bind(this));

            } else {
                console.error("SESSION NOT FOUND");
            }
        },

        updateFeatures: function (sessions) {
            if (this.points != null) {
                this.updateFeaturesHold = null;
                this.view.graphics.removeAll();
                sessions.forEach(function (session) {
                    var point = this.points.filter(function (point) {
                        return point.attributes.LONGNAME == session["location"];
                    })[0];
                    if (typeof point == "undefined") {
                        console.error("No Location Found for " + session["title"])
                    } else {
                        this.view.graphics.add(new Graphic({
                            geometry: point.geometry,
                            symbol: {
                                type: "simple-marker",
                                style: "circle",
                                color: "#93bcff",
                                size: "15px",
                                outline: {
                                    color: "#FFFFFF",
                                    width: 1
                                }
                            },
                            attributes: {
                                "TITLE": session["title"],
                                "TIMEFROM": session["timeFrom"].getTime(),
                                "POPUPCONTENT": session["mapDiv"]
                            },
                            popupTemplate: new PopupTemplate({
                                title: "{TITLE}",
                                content: "{POPUPCONTENT}"
                            })
                        }));

                    }
                }.bind(this));
            } else {
                if (this.updateFeaturesHold == null) {
                    this.updateFeaturesHold = setTimeout(function () {
                        this.updateFeatures(sessions);
                    }.bind(this), 500);
                } else {
                    clearTimeout(this.updateFeaturesHold);
                    this.updateFeaturesHold = setTimeout(function () {
                        this.updateFeatures(sessions);
                    }.bind(this), 500);
                }
            }
        }
    });

});