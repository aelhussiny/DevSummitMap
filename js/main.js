var config;
require([
    "./js/Map.js",
    "dojo/text!./config.json",
    "dojo/text!./sessions.json",
    "dojo/on",
    "jquery",
    "selectpicker"
], function (Map, configText, sessionsText, on, $, selectpicker) {
    require(["bootstrap"], function (bootstrap) {
        var mymap = new Map();
        config = JSON.parse(configText);
        var sessions = JSON.parse(sessionsText);
        for (var i = 0; i < sessions.length; i++) {
            var session = sessions[i];
            var from = AMPMtoTF(session["timeFrom"]);
            var to = AMPMtoTF(session["timeTo"]);
            var startDateTime = new Date("2018-03-0" + session["date"] + " " + from);
            var endDateTime = new Date("2018-03-0" + session["date"] + " " + to);
            session["timeFrom"] = startDateTime;
            session["timeTo"] = endDateTime;
        }
        config.width = $(window).width();
        $("#nowtab").click(function (e) {
            setAppState("now");
        });
        $("#filterstab").click(function (e) {
            setAppState("filters");
        });
        setAppState("now");
        $("#showHideFilters").click(function (e) {
            if ($(this).hasClass("filters-open")) {
                $("#showHideFilters").removeClass("filters-open");
                $("#filtersContent").removeClass("filters-open");
                $("#showHideFilters").addClass("filters-closed");
                $("#filtersContent").addClass("filters-closed");
            } else {
                $("#showHideFilters").removeClass("filters-closed");
                $("#filtersContent").removeClass("filters-closed");
                $("#showHideFilters").addClass("filters-open");
                $("#filtersContent").addClass("filters-open");
            }
        });
        $("#tagsField").on("changed.bs.select", function (event, clickedIndex, newValue, oldValue) {
            var targets = [];
            $.each($("#tagsField option:selected"), function () {
                targets.push($(this).val());
            });
            if (targets.length > 0) {
                $("#tagscheckbox").prop('checked', true);
            } else {
                $("#tagscheckbox").prop('checked', false);
            }
            updateFromFilters();
        });
        $("#speakersField").on("changed.bs.select", function (event, clickedIndex, newValue, oldValue) {
            var targets = [];
            $.each($("#speakersField option:selected"), function () {
                targets.push($(this).val());
            });
            if (targets.length > 0) {
                $("#speakerscheckbox").prop('checked', true);
            } else {
                $("#speakerscheckbox").prop('checked', false);
            }
            updateFromFilters();
        });
        $("#startingDateField").change(function (e) {
            updateFromFilters();
        });
        $("#startingTimeField").change(function (e) {
            updateFromFilters();
        });
        $("#endingDateField").change(function (e) {
            updateFromFilters();
        });
        $("#endingTimeField").change(function (e) {
            updateFromFilters();
        });
        $("#tagscheckbox").change(function (e) {
            updateFromFilters();
        });
        $("#speakerscheckbox").change(function (e) {
            updateFromFilters();
        })
        mymap.createView();
        $(window).resize(function () {
            config.width = $(window).width();
            mymap.updateView();
            setContentSize();
        });
        setContentSize();


        function setAppState(state) {
            this.appState = state;
            switch (state) {
                case "now":
                    goNow();
                    break;
                case "filters":
                    goFilters();
                    break;
            }
        }

        function goNow() {
            $("#nowtab").addClass("active");
            $("#filterstab").removeClass("active");
            $("#betweenLabelRow").addClass("hidden");
            $("#betweenFieldsRow").addClass("hidden");
            var d = new Date();
            filteredSessions = sessions.filter(function (session) {
                return (session["timeFrom"].getTime() <= d.getTime() && session["timeTo"].getTime() >= d.getTime());
            });
            var tags = null;
            var speakers = null;
            if ($('#tagscheckbox').prop('checked') == true) {
                tags = [];
                $.each($("#tagsField option:selected"), function () {
                    tags.push($(this).val());
                });
            }
            if ($('#speakerscheckbox').prop('checked') == true) {
                speakers = [];
                $.each($("#speakersField option:selected"), function () {
                    speakers.push($(this).val());
                });
            }
            if (tags != null) {
                filteredSessions = filteredSessions.filter(function (session) {
                    var include = false;
                    session["keywords"].forEach(function (tag) {
                        include = include || (tags.indexOf(tag) > -1);
                    });
                    return include;
                })
            }
            if (speakers != null) {
                filteredSessions = filteredSessions.filter(function (session) {
                    var include = false;
                    session["speakers"].forEach(function (speaker) {
                        include = include || (speakers.indexOf(speaker) > -1);
                    });
                    return include;
                })
            }
            updateContent();
        }

        function goFilters() {
            $("#filterstab").addClass("active");
            $("#nowtab").removeClass("active");
            $("#betweenLabelRow").removeClass("hidden");
            $("#betweenFieldsRow").removeClass("hidden");
            updateFromFilters();
        }

        function updateFromFilters() {
            var tags = null;
            var speakers = null;
            var startDateTime = new Date($("#startingDateField").val() + " " + $("#startingTimeField").val());
            var endDateTime = new Date($("#endingDateField").val() + " " + $("#endingTimeField").val());
            if ($('#tagscheckbox').prop('checked') == true) {
                tags = [];
                $.each($("#tagsField option:selected"), function () {
                    tags.push($(this).val());
                });
            }
            if ($('#speakerscheckbox').prop('checked') == true) {
                speakers = [];
                $.each($("#speakersField option:selected"), function () {
                    speakers.push($(this).val());
                });
            }

            filteredSessions = sessions.filter(function (session) {
                return (session["timeFrom"].getTime() >= startDateTime.getTime() && session["timeTo"].getTime() <= endDateTime.getTime());
            });
            if (tags != null) {
                filteredSessions = filteredSessions.filter(function (session) {
                    var include = false;
                    session["keywords"].forEach(function (tag) {
                        include = include || (tags.indexOf(tag) > -1);
                    });
                    return include;
                })
            }
            if (speakers != null) {
                filteredSessions = filteredSessions.filter(function (session) {
                    var include = false;
                    session["speakers"].forEach(function (speaker) {
                        include = include || (speakers.indexOf(speaker) > -1);
                    });
                    return include;
                })
            }
            updateContent();
        }

        function toTwoChars(str) {
            str = "" + str;
            while (str.length < 2) {
                str = "0" + str;
            }
            return str;
        }

        function setContentSize() {
            var fullView = config.width > 768 ? true : false;
            if (fullView) {
                $("#contentDiv").height($(window).height() - $("#headerDiv").height());
            } else {
                $("#contentDiv").height((0.5 * $(window).height()) - $("#headerDiv").height());
            }
        }

        function updateContent() {
            /*
            <div class="col-xs-12 my-card">
                                <b class="title">Hello</b><br/>
                                <span class="details">
                                    <p class="period"><span class="fa fa-calendar-alt fa-sm"></span>03/03/2018 12:00 pm - 03/03/2018 01:00 pm</span><br/>
                                    <p class="location"><span class="fa fa-map-marker fa-sm"></span>Primrose A</span><br/>
                                    <p class="speakers"><span class="fa fa-user fa-sm"></span>Ahmed ElHussiny</span><br/>
                                    <p class="keywords"><span class="fa fa-hashtag fa-sm"></span>Esri Technical Session, Web</span><br/>
                                    <p class="description"><span class="fa fa-comment fa-sm"></span>Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description </p>
                                </span>
                            </div>
            */
            filteredSessions = filteredSessions.sort(function (a, b) {
                return a["timeFrom"].getTime() - b["timeFrom"].getTime();
            });
            $("#cardContainer").html("");
            filteredSessions.forEach(function (session) {
                var cardDiv = $('<div></div>');
                cardDiv.prop('data-card-title', session["title"]);
                cardDiv.prop('data-card-timeFrom', session["timeFrom"].getTime());
                var mapDiv = $("<div></div>")
                cardDiv.addClass("col-md-12 my-card");
                var title = $('<b></b>');
                title.addClass("title");
                title.html(session["title"]);
                var period = $("<p></p>");
                period.addClass("period");
                period.html('<span class="fa fa-calendar-alt fa-sm"></span>' + formatDateTime(session["timeFrom"]) + " - " + formatDateTime(session["timeTo"]));
                var location = $("<p></p>");
                location.addClass("location");
                location.html('<span class="fa fa-map-marker fa-sm"></span>' + session["location"]);
                cardDiv.append(title);
                cardDiv.append(period);
                cardDiv.append(location);
                mapDiv.append(period.clone());
                mapDiv.append(location.clone());
                if (session["speakers"].length > 0 && session["speakers"][0].length > 0) {
                    var speakers = $("<p></p>");
                    speakers.addClass("speakers");
                    speakers.html('<span class="fa fa-user fa-sm"></span>' + session["speakers"].join(", "));
                    cardDiv.append(speakers);
                    mapDiv.append(speakers.clone());
                }
                if (session["keywords"].length > 0 && session["keywords"][0].length > 0) {
                    var keywords = $("<p></p>");
                    keywords.addClass("keywords");
                    keywords.html('<span class="fa fa-hashtag fa-sm"></span>' + session["keywords"].join(", "));
                    cardDiv.append(keywords);
                    mapDiv.append(keywords.clone());
                }
                if (typeof session["description"] != "undefined" && session["description"].length > 0) {
                    var description = $("<p></p>");
                    description.addClass("description");
                    description.html('<span class="fa fa-comment fa-sm"></span>' + session["description"]);
                    cardDiv.append(description);
                    mapDiv.append(description.clone());
                }
                $("#cardContainer").append(cardDiv);
                session["mapDiv"] = mapDiv.html();
            });
            mymap.updateFeatures(filteredSessions);
            setClicks();
            mymap.on("featureselected", function(feature){
                if(feature!=null) {
                    setSelectedCard(feature.attributes.TITLE, feature.attributes.TIMEFROM);
                }
            });
            mymap.on("popupClosed", function() {
                $(".my-card").removeClass("selected");
            });
        }

        function setSelectedCard(title, timeFrom) {
            $(".my-card").removeClass("selected");
            $.each($(".my-card"), function() {
                if($(this).prop('data-card-title') == title && $(this).prop('data-card-timeFrom') == timeFrom) {
                    $(this).addClass("selected");
                }
            });
        }

        function setClicks() {
            $(".my-card").click(function(){
                $(".my-card").removeClass("selected");
                $(this).addClass("selected");
                mymap.setSelectedFeature($(this).prop('data-card-title'), $(this).prop('data-card-timeFrom'));
            });
        }

        function formatDateTime(date) {
            return dateString = toTwoChars(date.getMonth() + 1) + "/" + toTwoChars(date.getDate()) + "/" + date.getFullYear() + " " + TFToAMPM(date.getHours() + ":" + date.getMinutes());
        }

        function TFToAMPM(TFstr) {
            var ampmstr = "";
            var hr = toTwoChars(TFstr.substring(0, TFstr.indexOf(":")));
            var min = toTwoChars(TFstr.substring(TFstr.indexOf(":") + 1));
            if (hr > 12) {
                ampmstr += toTwoChars(parseInt(hr) - 12) + ":";
            } else {
                ampmstr += toTwoChars(hr) + ":";
            }
            ampmstr += min;
            if (hr >= 12) {
                ampmstr += " pm";
            } else {
                ampmstr += " am"
            }
            return ampmstr;
        }

        function AMPMtoTF(AMPMstr) {
            var hr = toTwoChars(AMPMstr.substring(0, AMPMstr.indexOf(":")));
            var min = toTwoChars(AMPMstr.substring(AMPMstr.indexOf(":") + 1, AMPMstr.indexOf(" ")));
            var tag = AMPMstr.slice(-2);
            if (tag == "pm" && hr != 12) {
                hr = parseInt(hr) + 12;
            }
            return hr + ":" + min;
        }
    });
});