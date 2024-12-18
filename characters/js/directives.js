(function () {
	var directives = {};
	var filters = {};

	var app = angular.module("optc");

	/**************
	 * Directives *
	 **************/

	directives.characterTable = function (
		$rootScope,
		$timeout,
		$compile,
		$storage
	) {
		return {
			restrict: "E",
			replace: true,
			template:
				'<table id="mainTable" class="table table-striped-column panel panel-default"></table>',
			link: function (scope, element, attrs) {
				window.charTable = element.dataTable({
					stateSave: true, // includes page length
					stateDuration: 0,
					deferRender: true,
					data: scope.table.data,
					columns: scope.table.columns,
					rowCallback: function (row, data, index) {
						if (!row || row.hasAttribute("loaded")) return;
						var $row = $(row);
						if (!$row) return;
						// lazy thumbnails
						$row.find("[data-original]").each(function (n, x) {
							x.setAttribute("src", x.getAttribute("data-original"));
							x.removeAttribute("data-original");
						});
						// character log checkbox
						var id = data[data.length - 1] + 1;
						var checkbox = $(
							'<label><input type="checkbox" ng-change="checkLog(' +
								id +
								')" ng-model="characterLog[' +
								id +
								']"></input></label>'
						);
						$(row.cells[10 + scope.table.additional]).append(checkbox);
						// cosmetic fixes
						var typeBox = row.cells[2];
						var classBox = row.cells[3];
						var type = typeBox.textContent;
						var classes = classBox.textContent;
						if (type.indexOf(",") > -1) {
							type = type.replace(",", "/");
							var types = type.split("/");
							var typeHtml =
								'<span class="cell-' +
								types[0] +
								'">' +
								types[0] +
								'</span>/<span class="cell-' +
								types[1] +
								'">' +
								types[1] +
								"</span>";
							$(typeBox).html(typeHtml);
						}
						if ((classes.match(new RegExp(",", "g")) || []).length > 1) {
							while ((classes.match(new RegExp(",", "g")) || []).length >= 1)
								classes = classes.replace(",", "/");
							var classess = classes.split("/");
							//console.log(classess);
							var classesHtml =
								'<span class="cell-' +
								classess[classess.length - 2] +
								'">' +
								classess[classess.length - 2] +
								'</span>, <span class="cell-' +
								classess[classess.length - 1] +
								'">' +
								classess[classess.length - 1] +
								"</span>";
							$(classBox).html(classesHtml);
						}
						$(typeBox).addClass("cell-" + type);
						var n = row.cells.length - 2 - scope.table.additional;
						$(row.cells[n]).addClass("stars stars-" + row.cells[n].textContent);
						row.cells[n].textContent = "";
						// compile
						$compile($(row).contents())($rootScope);
						if (window.units[id - 1].preview) $(row).addClass("preview");
						else if (window.units[id - 1].incomplete)
							$(row).addClass("incomplete");
						row.setAttribute("loaded", "true");
					},
					headerCallback: function (header) {
						if (header.hasAttribute("loaded")) return;
						header.cells[header.cells.length - 1].setAttribute(
							"title",
							"Character Log"
						);
						header.setAttribute("loaded", true);
					},
				});
				scope.table.refresh = function () {
					$rootScope.$emit("table.refresh");
					$timeout(function () {
						element.fnDraw();
					});
				};
				// report link
				var link = $(
					'<span class="help-link"><i class="fab fa-discord"></i> Want to report or request something? <a>Join our Discord server</a>.</span>'
				);
				link.find("a").attr("href", "https://discord.gg/xhKT87vKX7");
				link.insertAfter($(".dataTables_length"));
				// pick column link
				var pick = $(
					'<a id="pick-link" popover-placement="bottom" popover-trigger="click" popover-title="Additional Columns" ' +
						"uib-popover-template=\"'views/pick.html'\" popover-append-to-body=\"'true'\">Additional columns</a>"
				);
				$compile(pick)(scope);
				pick.insertAfter($(".dataTables_length"));
				// night toggle
				var nightToggle = $(
					'<label class="night-toggle"><input type="checkbox">Light mode</input></label>'
				);
				nightToggle.find("input").change(function (e) {
					$rootScope.nightMode = e.target.checked;
					if (!$rootScope.$$phase) $rootScope.$apply();
				});
				if ($rootScope.nightMode)
					nightToggle.find("input").attr("checked", "checked");
				nightToggle.insertBefore($(".dataTables_length"));
				// fuzzy toggle
				var fuzzyToggle = $(
					'<label class="fuzzy-toggle"><input type="checkbox">Enable fuzzy search</input></label>'
				);
				fuzzyToggle.attr(
					"title",
					"When enabled, searches will also display units whose name is not an exact match to the search keywords.\nUseful if you don't know the correct spelling of a certain unit."
				);
				fuzzyToggle.find("input").prop("checked", scope.table.fuzzy);
				fuzzyToggle.find("input").change(function () {
					var checked = $(this).is(":checked");
					if (checked == scope.table.fuzzy) return;
					scope.table.fuzzy = checked;
					$storage.set("fuzzy", scope.table.fuzzy);
					scope.table.refresh();
				});
				fuzzyToggle.insertBefore($(".dataTables_length"));
			},
		};
	};

	directives.decorateSlot = function () {
		return {
			restrict: "A",
			scope: { uid: "=", big: "@" },
			link: function (scope, element, attrs) {
				if (scope.big)
					element[0].style.backgroundImage =
						"url(" + Utils.getBigThumbnailUrl(scope.uid, "..") + ")";
				else
					element[0].style.backgroundImage =
						"url(" + Utils.getThumbnailUrl(scope.uid, "..") + ")";
				//element[0].style.backgroundImage = 'url(' + Utils.getGlobalThumbnailUrl(scope.uid) + '), url(' + Utils.getThumbnailUrl(scope.uid, '..') + ')';
			},
		};
	};

	directives.autoFocus = function ($timeout) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				$timeout(function () {
					element[0].focus();
				});
			},
		};
	};

	// Uses Bootstrap's Collapse Component
	directives.animateCollapse = function ($timeout, $document) {
		return {
			restrict: "E",
			transclude: true,
			template: `<span>
        <ng-transclude></ng-transclude>
        <i class="{{ faClasses ? faClasses : 'fa fa-chevron-down pull-right' }}"></i>
    </span>`,
			scope: {}, // empty isolate scope for `scope.faClasses`
			link: function (scope, element, attrs) {
				if (attrs.faClasses) {
					// option to override font awesome classes
					scope.faClasses = attrs.faClasses;
				}
				element.click(() => {
					var collapsibleElement = element.next();
					if (collapsibleElement.hasClass("collapse")) {
						element.next().collapse("toggle");
					}
				});

				if (!$document.isAnimateCollapseHandlerAdded) {
					// delegate event to top level node, so we only add two event listeners
					$document.on("hide.bs.collapse", (e) => {
						var collapserElement = e.target.previousElementSibling;
						if (collapserElement.tagName == "ANIMATE-COLLAPSE") {
							collapserElement.children[0].lastElementChild.classList.remove(
								"fa-flip-vertical"
							);
						}
					});
					$document.on("show.bs.collapse", (e) => {
						var collapserElement = e.target.previousElementSibling;
						if (collapserElement.tagName == "ANIMATE-COLLAPSE") {
							collapserElement.children[0].lastElementChild.classList.add(
								"fa-flip-vertical"
							);
						}
					});
					$document.isAnimateCollapseHandlerAdded = true;
				}
			},
		};
	};

	directives.addCustomFilters = function ($timeout, $compile) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "views/custom-filters.html",
			scope: { target: "@", filterData: "=", filters: "=" },
			link: function (scope, element, attrs) {
				// turns off all other options in a radio group
				scope.toggleRadioGroup = function (
					matcher,
					submatcherIndex,
					radioGroup = null
				) {
					var submatchers =
						scope.filters.custom[matcher.target][matcher.group].matchers[
							matcher.name
						].submatchers;
					if (radioGroup) {
						for (const [j, submatcher] of submatchers.entries()) {
							if (
								submatcherIndex != j &&
								matcher.submatchers[j].type == "option" &&
								matcher.submatchers[j].radioGroup == radioGroup
							)
								submatcher.param = false;
						}
					}
					submatchers[submatcherIndex].param =
						!submatchers[submatcherIndex].param;
				};
				// called when a matcher is toggled, should debounce during the collapse animation
				// of submatchers div
				scope.toggleMatcher = function ($event, matcher) {
					// debounce click during collapse animation, so the filter won't show
					// the submatchers when it is turned off with a double click
					var targetElement = $event.target.nextElementSibling;
					if (targetElement) {
						if (targetElement.classList.contains("collapsing")) {
							return;
						}
						$(targetElement).collapse("toggle");
					}

					var matcherObj =
						scope.filters.custom[matcher.target][matcher.group].matchers[
							matcher.name
						];
					matcherObj.enabled = !matcherObj.enabled;
				};
				scope.getCssClasses = function (submatcher) {
					var classes = ["min-width-12"]; //default, may be overridden
					if (submatcher.cssClasses) classes = submatcher.cssClasses;
					return classes;
				};
			},
		};
	};

	directives.goBack = function ($state) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				element.click(function (e) {
					if (!e.target || e.target.className.indexOf("inner-container") == -1)
						return;
					element.find(".modal-content").addClass("rollOut");
					$(".backdrop").addClass("closing");
					setTimeout(function () {
						$state.go("^");
					}, 300);
				});
			},
		};
	};

	directives.evolution = function ($state, $stateParams) {
		return {
			restrict: "E",
			replace: true,
			scope: { unit: "=", base: "=", evolvers: "=", evolution: "=", size: "@" },
			templateUrl: "views/evolution.html",
			link: function (scope, element, attrs) {
				scope.goToState = function (id) {
					if (!Number.isInteger(id)) return;
					if (id == parseInt($stateParams.id, 10)) return;
					var previous = $stateParams.previous.concat([$stateParams.id]);
					$state.go("main.search.view", { id: id, previous: previous });
				};
			},
		};
	};

	directives.unit = function ($state, $stateParams) {
		return {
			restrict: "E",
			scope: { uid: "=" },
			template:
				'<a class="slot medium" decorate-slot uid="uid" ng-click="goToState(uid)"></a>',
			link: function (scope, element, attrs) {
				scope.goToState = function (id) {
					if (id == parseInt($stateParams.id, 10)) return;
					var previous = $stateParams.previous.concat([$stateParams.id]);
					$state.go("main.search.view", { id: id, previous: previous });
				};
			},
		};
	};

	directives.compare = function () {
		var fuse = new Fuse(window.units, { keys: ["name"], id: "number" });
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				var target = element.typeahead(
					{ minLength: 3, highlight: true },
					{
						source: function (query, callback) {
							callback(fuse.search(query));
						},
						templates: {
							suggestion: function (id) {
								if (Number.isInteger(id)) {
									var name = units[id].name,
										url = Utils.getThumbnailUrl(id + 1, "..");
									//var name = units[id].name, url = Utils.getThumbnailUrl(id+1, '..'), url2 = Utils.getGlobalThumbnailUrl(id+1);
									if (name.length > 63) name = name.slice(0, 60) + "...";
									var thumb =
										'<div class="slot small" style="background-image: url(' +
										url +
										')"></div>';
									//var thumb = '<div class="slot small" style="background-image: url(' + url2 + '), url(' + url + ')"></div>';

									return (
										'<div><div class="suggestion-container">' +
										thumb +
										"<span>" +
										name +
										"</span></div></div>"
									);
								} else {
									var name = "material",
										url = Utils.getThumbnailUrl(id, "..");
									var thumb =
										'<div class="slot small" style="background-image: url(' +
										url +
										')"></div>';
									return (
										'<div><div class="suggestion-container">' +
										thumb +
										"<span>" +
										name +
										"</span></div></div>"
									);
								}
							},
						},
						display: function (id) {
							return units[id].name;
						},
					}
				);

				target.bind("typeahead:select", function (e, suggestion) {
					$(e.currentTarget).prop("disabled", true);
					scope.compare = window.units[suggestion];
					scope.compareDetails = window.details[suggestion + 1];
					scope.compareCooldown = window.cooldowns[suggestion];
					scope.isCompareCaptainHybrid =
						scope.compareDetails &&
						scope.compareDetails.captain &&
						scope.compareDetails.captain.global;
					scope.isCompareSailorHybrid =
						scope.compareDetails &&
						scope.compareDetails.sailor &&
						scope.compareDetails.sailor.global;
					scope.isCompareSpecialHybrid =
						scope.compareDetails &&
						scope.compareDetails.special &&
						scope.compareDetails.special.global;
					scope.isCompareSpecialStaged =
						scope.compareDetails &&
						scope.compareDetails.special &&
						scope.compareDetails.special.constructor == Array;
					if (!scope.$$phase) scope.$apply();
				});

				element[0].style.backgroundColor = null;
			},
		};
	};

	directives.comparison = function () {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				var positive = attrs.comparison == "positive";
				var watch = scope.$watch(
					function () {
						return element.html();
					},
					function () {
						var isNegative = parseFloat(element.text(), 10) < 0;
						element.removeClass("positive negative withPlus");
						if ((positive && !isNegative) || (!positive && isNegative))
							element.addClass("positive");
						else element.addClass("negative");
						if (!isNegative) element.addClass("withPlus");
					}
				);
				scope.$on("$destroy", watch);
			},
		};
	};

	directives.addSuperSpecialQuery = function ($state, $stateParams) {
		return {
			restrict: "E",
			scope: { criteria: "=", excludedFamilies: "=" },
			template:
				'<a role="button" ng-if="query" ui-sref="main.search({query:query})"><b>Search for these characters</b></a>',
			link: function (scope, element, attrs) {
				scope.query = Utils.generateSuperSpecialQuery(
					scope.criteria,
					scope.excludedFamilies
				);
			},
		};
	};

	directives.addSupportQuery = function ($state, $stateParams) {
		return {
			restrict: "E",
			scope: { criteria: "=", excludedFamilies: "=" },
			template:
				'<a role="button" ng-if="query" ui-sref="main.search({query:query})"><b>Search for supported characters</b></a>',
			link: function (scope, element, attrs) {
				scope.query = Utils.generateSupportedCharactersQuery(
					scope.criteria,
					scope.excludedFamilies
				);
			},
		};
	};

	directives.addSupportersQuery = function () {
		return {
			restrict: "E",
			scope: { uid: "=" },
			template:
				'<a role="button" ng-if="query" ui-sref="main.search({query:query})"><b>Search for attachable supports</b></a>',
			link: function (scope, element, attrs) {
				scope.query = Utils.generateAttachableSupportsQuery(scope.uid);
			},
		};
	};

	directives.addSuperTandemQuery = function () {
		return {
			restrict: "E",
			scope: { criteria: "=", excludedFamilies: "=" },
			template:
				'<a role="button" ng-if="query" ui-sref="main.search({query:query})"><b>Search for these characters</b></a>',
			link: function (scope, element, attrs) {
				scope.query = Utils.generateSuperTandemQuery(
					scope.criteria,
					scope.excludedFamilies
				);
			},
		};
	};

	directives.scrollToSection = function ($state, $stateParams) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				element.click(function (e) {
					document
						.getElementById(attrs.scrollToSection)
						.scrollIntoView({ behavior: "smooth" });
				});
			},
		};
	};

	directives.addNames = function ($stateParams, $rootScope) {
		var name = window.aliases;
		return {
			restrict: "E",
			replace: true,
			template:
				'<table class="table table-striped-column abilities"><tbody></tbody></table>',
			link: function (scope, element, attrs) {
				var id = $stateParams.id,
					data = details[id];
				var htmlToAppend = "";
				var currentAliases = name[id];
				if (currentAliases[0] != "") {
					htmlToAppend +=
						"<tr><td>Japanese</td><td><div>" +
						currentAliases[0] +
						"</div></td></tr>";
				}
				if (currentAliases[1] != "") {
					htmlToAppend +=
						"<tr><td>French</td><td><div>" +
						currentAliases[1] +
						"</div></td></tr>";
				}
				if (currentAliases[2]) {
					var otherAliases = currentAliases.slice(2).join(", ");
					htmlToAppend +=
						"<tr><td>Others</td><td><div>" + otherAliases + "</div></td></tr>";
				}
				element.append(htmlToAppend);
			},
		};
	};

	directives.addTags = function ($stateParams, $rootScope) {
		return {
			restrict: "E",
			replace: true,
			template: '<div class="tag-container"></div>',
			link: function (scope, element, attrs) {
				var id = $stateParams.id,
					data = details[id];
				// flags
				var flags = window.flags[id] || {};
				var htmlToAppend = "";
				htmlToAppend +=
					'<span class="tag flag">' +
					(flags.global ? "Global unit" : "Japan unit") +
					"</span>";
				htmlToAppend +=
					'<span class="tag flag">' +
					(CharUtils.isFarmable(id) ? "Farmable" : "Non-farmable") +
					"</span>";
				if (flags.rr)
					htmlToAppend += '<span class="tag flag">Rare Recruit only</span>';
				if (flags.lrr)
					htmlToAppend +=
						'<span class="tag flag">Limited Rare Recruit only</span>';
				if (flags.tmlrr)
					htmlToAppend +=
						'<span class="tag flag">Treasure Map Sugo-fest Limited Rare Recruit only</span>';
				if (flags.kclrr)
					htmlToAppend +=
						'<span class="tag flag">Kizuna Clash Sugo-fest Limited Rare Recruit only</span>';
				if (flags.pflrr)
					htmlToAppend +=
						'<span class="tag flag">Pirate Rumble Sugo-fest Limited Rare Recruit only</span>';
				if (flags.superlrr)
					htmlToAppend +=
						'<span class="tag flag">Super Sugo-fest Limited Rare Recruit only</span>';
				if (flags.slrr)
					htmlToAppend +=
						'<span class="tag flag">Support Sugo-fest Limited Rare Recruit only</span>';
				if (flags.superlrr)
					htmlToAppend +=
						'<span class="tag flag">Super Sugo-fest Limited Rare Recruit only</span>';
				if (flags.annilrr)
					htmlToAppend +=
						'<span class="tag flag">Anniversary Sugo-fest Limited Rare Recruit only</span>';
				if (flags.promo)
					htmlToAppend += '<span class="tag flag">Promo-code only</span>';
				if (flags.shop)
					htmlToAppend += '<span class="tag flag">Rayleigh Shop Unit</span>';
				if (flags.tmshop)
					htmlToAppend += '<span class="tag flag">Trade Port Unit</span>';
				if (flags.special)
					htmlToAppend +=
						'<span class="tag flag">One time only characters</span>';
				if (flags.inkable)
					htmlToAppend += '<span class="tag flag">Inkable</span>';
				if (CharUtils.checkFarmable(id, { "Story Island": true }))
					htmlToAppend += '<span class="tag flag">Story mode only</span>';
				if (CharUtils.checkFarmable(id, { Fortnight: true }))
					htmlToAppend += '<span class="tag flag">Fortnight only</span>';
				if (CharUtils.checkFarmable(id, { Raid: true }))
					htmlToAppend += '<span class="tag flag">Raid only</span>';
				if (CharUtils.checkFarmable(id, { Arena: true }))
					htmlToAppend += '<span class="tag flag">Arena only</span>';
				if (CharUtils.checkFarmable(id, { Treasure: true }))
					htmlToAppend += '<span class="tag flag">Treasure Map only</span>';
				if (
					CharUtils.checkFarmable(id, { "Story Island": true, Fortnight: true })
				)
					htmlToAppend +=
						'<span class="tag flag">Story mode & fortnight only</span>';
				if (CharUtils.checkFarmable(id, { "Story Island": true, Raid: true }))
					htmlToAppend +=
						'<span class="tag flag">Story mode & raid only</span>';
				if (CharUtils.checkFarmable(id, { Raid: true, Fortnight: true }))
					htmlToAppend += '<span class="tag flag">Raid & fortnight only</span>';
				// matchers
				if (data) {
					for (const target in window.matchers) {
						for (const group in window.matchers[target]) {
							for (var name in window.matchers[target][group]) {
								var matcher = window.matchers[target][group][name];
								if (!data[matcher.target]) break;
								let targetString =
									data[matcher.target].constructor == String
										? data[matcher.target]
										: JSON.stringify(data[matcher.target]);

								// captain effects
								if (
									matcher.target == "captain" &&
									matcher.regex.test(targetString)
								) {
									name = matcher.name;
									if (/Class$/.test(name)) name = "Captain: " + name;
									else if (!/captains$/.test(name))
										name = "Captain: " + name.replace(/ers$/, "ing");
									else name = name.replace(/s$/, "");
									name = name.replace(/iing/, "ying");
									htmlToAppend +=
										'<span class="tag captain">' + name + "</span>";
								}
								// sailor effects
								if (
									matcher.target.indexOf("sailor") === 0 &&
									!(data[matcher.target] === undefined)
								) {
									if (data[matcher.target].base) {
										for (var sailor in data[matcher.target]) {
											if (matcher.regex.test(data[matcher.target][sailor])) {
												name = matcher.name;
												if (!/sailor$/.test(name))
													name = "Sailor: " + name.replace(/ers$/, "ing");
												else name = name.replace(/s$/, "");
												name = name.replace(/iing/, "ying");
												if (name != "Has Sailor Ability sailor") {
													htmlToAppend +=
														'<span class="tag sailor">' + name + "</span>";
												}
											}
										}
									} else {
										if (matcher.regex.test(data[matcher.target])) {
											name = matcher.name;
											if (!/sailor$/.test(name))
												name = "Sailor: " + name.replace(/ers$/, "ing");
											else name = name.replace(/s$/, "");
											name = name.replace(/iing/, "ying");
											htmlToAppend +=
												'<span class="tag sailor">' + name + "</span>";
										}
									}
								}
								// specials
								if (
									matcher.target.indexOf("special") === 0 &&
									matcher.regex.test(targetString)
								) {
									name = matcher.name;
									if (!/specials$/.test(name))
										name = "Special: " + name.replace(/ers$/, "ing");
									else name = name.replace(/s$/, "");
									name = name.replace(/iing/, "ying");
									htmlToAppend +=
										'<span class="tag special">' + name + "</span>";
								}
								// limit
								if (
									matcher.target.indexOf("limit") === 0 &&
									matcher.regex.test(targetString)
								) {
									name = matcher.name;
									if (!/limit$/.test(name))
										name = "Limit Break: " + name.replace(/ers$/, "ing");
									else name = name.replace(/s$/, "");
									name = name.replace(/iing/, "ying");
									if (name != "Has Limit Break limit") {
										htmlToAppend +=
											'<span class="tag limit">' + name + "</span>";
									}
								}
								// potentials
								if (
									matcher.target.indexOf("potential") === 0 &&
									matcher.regex.test(targetString)
								) {
									name = matcher.name;
									if (!/potential$/.test(name))
										name = "Potential Ability: " + name.replace(/ers$/, "ing");
									else name = name.replace(/s$/, "");
									name = name.replace(/iing/, "ying");
									htmlToAppend +=
										'<span class="tag potential">' + name + "</span>";
								}
								// super specials
								if (
									matcher.target === "superSpecial" &&
									matcher.regex.test(targetString)
								) {
									name = matcher.name;
									if (!/specials$/.test(name))
										name = "Super Special: " + name.replace(/ers$/, "ing");
									else
										name = name
											.replace(/s$/, "")
											.replace(/special/i, "Super Special");
									name = name.replace(/iing/, "ying");
									htmlToAppend +=
										'<span class="tag superSpecial">' + name + "</span>";
								}
								// support
								if (
									matcher.target === "support" &&
									matcher.regex.test(targetString)
								) {
									name = matcher.name;
									if (!/support$/.test(name))
										name = "Support: " + name.replace(/ers$/, "ing");
									else name = name.replace(/s$/, "");
									name = name.replace(/iing/, "ying");
									htmlToAppend +=
										'<span class="tag support">' + name + "</span>";
								}
							}
						}
					}
				}
				element.append(htmlToAppend);
			},
		};
	};

	directives.addLinks = function ($stateParams) {
		return {
			restrict: "E",
			replace: true,
			template: '<div class="link-container"></div>',
			link: function (scope, element, attrs) {
				var id = parseInt($stateParams.id, 10),
					data = details[id];
				if (!units[id - 1]) return;
				var incomplete = units[id - 1].incomplete;
				var ul = $("<ul></ul>");
				if (!incomplete && window.flags[id] && window.flags[id].global) {
					var link =
						"http://onepiece-treasurecruise.com/en/" +
						(id == "5"
							? "roronoa-zoro"
							: id == 1254
							? "maelstrom-spider-squard-whitebeard-pirates-family"
							: id == "1923"
							? "c-5009"
							: id == "1924"
							? "c-5010"
							: id == "2200"
							? "c-5011"
							: id == "2201"
							? "c-5012"
							: "c-" + id); //CHANGE THIS FOR DOFFY V2 IDS
					ul.append(
						$(
							'<li><a href="' +
								link +
								'" target="_blank">Official Guide (English)</a></li>'
						)
					);
				}
				if (!incomplete) {
					if (id == 1478) {
						ul.append(
							$(
								'<li><a href="http://onepiece-treasurecruise.com/カリブー-カリブー海賊団船長/" target="_blank">' +
									"Official Guide (Japanese)</a></li>"
							)
						);
					} else if (id == 1892) {
						ul.append(
							$(
								'<li><a href="http://onepiece-treasurecruise.com/ジュラキュール・ミホーク-シッケアール王国　跡/" target="_blank">' +
									"Official Guide (Japanese)</a></li>"
							)
						);
					} else if (
						[
							2049, 2050, 2072, 2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086,
							2087, 2088, 2089, 2090, 2091, 2097, 2104, 2105, 2106, 2107, 2108,
							2109, 2110, 2111, 2114, 2116, 2119, 2120, 2121, 2146, 2162, 2163,
							2168, 2169, 2170, 2171, 2172, 2173, 2175, 2180, 2181, 2182, 2183,
							2184, 2185, 2186, 2187, 2188, 2189, 2190, 2191, 2192, 2193, 2212,
							2213, 2214, 2215, 2216, 2216, 2218, 2219, 2240, 2241, 2242, 2243,
							2244, 2248, 2249, 2255,
						].indexOf(id) != -1
					) {
						ul.append(
							$(
								'<li><a href="http://onepiece-treasurecruise.com/c%E2%80%90' +
									id +
									'/" target="_blank">' +
									"Official Guide (Japanese)</a></li>"
							)
						);
					} else if ([2176, 2177, 2178, 2179].indexOf(id) != -1) {
						ul.append(
							$(
								'<li><a href="http://onepiece-treasurecruise.com/%EF%BD%83%E2%80%90' +
									id +
									'/" target="_blank">' +
									"Official Guide (Japanese)</a></li>"
							)
						);
					} else {
						ul.append(
							$(
								'<li><a href="http://onepiece-treasurecruise.com/c-' +
									id +
									'" target="_blank">' +
									"Official Guide (Japanese)</a></li>"
							)
						);
					}
				}
				if (gw[id - 1] != null) {
					ul.append(
						$(
							'<li><a href="http://xn--pck6bvfc.gamewith.jp/article/show/' +
								gw[id - 1] +
								'" target="_blank">' +
								'GameWith Page (Japanese)</a> | <a href="http://translate.google.com/translate?sl=ja&tl=en&u=http://xn--pck6bvfc.gamewith.jp/article/show/' +
								gw[id - 1] +
								'" target="_blank">' +
								"Google Translate</a></li>"
						)
					);
				}
				if (ul.children().length > 0) element.append(ul);
			},
		};
	};

	directives.costSlider = function ($timeout) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				element.ionRangeSlider({
					grid: true,
					type: "double",
					min: scope.filters.cost[0],
					max: scope.filters.cost[1],
					from: scope.filters.cost[0],
					to: scope.filters.cost[1],
					postfix: " cost",
					onFinish: function (data) {
						scope.filters.cost[0] = data.from;
						scope.filters.cost[1] = data.to;
						if (!scope.$$phase) scope.$apply();
					},
				});
			},
		};
	};

	filters.targetToString = function () {
		return function (input) {
			if (!input) return "N/A";
			if (input.criteria == "near") {
				return `Nearby Enemies.`;
			} else {
				return `Enemies with the ${input.comparator} ${input.criteria}.`;
			}
		};
	};

	filters.patternToString = function () {
		return function (input) {
			if (!input) return "N/A";
			if (input.action == "attack") {
				let htmlWrapper = "";
				switch (input.type) {
					case "Normal":
						return `${input.type} Attack`;
					case "Power":
						return `<b><i>${input.type} Attack</i></b>`;
					case "Full":
						return `<b>${input.type} Attack</b>`;
				}
			} else if (input.action == "heal") {
				input.area = input.area[0].toUpperCase() + input.area.slice(1);
				return `<i>Level ${input.level} ${
					input.area == "Self" ? input.area : input.area + " Range"
				} Heal</i>`;
			} else {
				return "UNKNOWN";
			}
		};
	};

	filters.resilienceToString = function () {
		return function (input) {
			if (!input) return "N/A";
			switch (input.type) {
				case "dmgboost":
					return `${conditionToString(input.condition)}${
						input.amount
					}x boost to ${input.attribute} enemies.`;
					break;
				case "healing":
					return `${conditionToString(input.condition)}Heals ${
						input.amount
					} HP every ${input.interval} seconds.`;
					break;
				case "damage":
					return `${conditionToString(input.condition)}${
						input.percentage
					}% reduction to ${input.attribute} damage.`;
					break;
				case "debuff":
					return `${conditionToString(input.condition)}${
						input.chance
					}% to resist ${input.attribute}.`;
					break;
			}
		};
	};

	filters.specialToString = function () {
		return function (input) {
			if (!input) return "N/A";
			return filters.abilityToString()(input);
		};
	};

	filters.gpconditionToString = function () {
		return function (input) {
			switch (input.type) {
				case "time":
					return `${input.comparator == "after" ? "After" : "At Exactly"} ${
						input.count
					} seconds`;
				case "damage":
					return `After dealing damage ${input.count} times`;
				case "action":
					return `After ${input.action}ing ${input.count} times`;
				case "debuff":
					return `After landing ${input.attribute} ${input.count} times`;
				case "attack":
					return `After landing ${input.count} ${input.attack} attacks`;
				case "defeat":
					return `After ${input.count} ${input.team} are defeated`;
				case "special":
					return `After ${input.team} uses ${input.count} Rumble Specials`;
				case "dbfreceived":
					return `After ${input.count} debuffs recieved`;
				case "dmgdealt":
					return `After ${new Intl.NumberFormat().format(
						input.count
					)} damage dealt`;
				case "dmgreceived":
					return `After ${new Intl.NumberFormat().format(
						input.count
					)} damage recieved`;
				case "hitreceived":
					return `After ${input.count} hits recieved`;
				default:
					return `UNKNOWN CONDITION ${JSON.stringify(input)}`;
			}
		};
	};

	filters.abilityToString = function () {
		return function (input) {
			if (!input) return "N/A";
			//let retVal = `<ul style="margin-bottom:3px;">`;
			let retVal = ``;
			for (var effect of input) {
				//let e = `<li>${conditionToString(effect.condition)}`;
				let e = `<br>${conditionToString(effect.condition)}`;
				switch (effect.effect) {
					case "buff":
						e += `Applies Lv.${effect.level} ${arrayToString(
							effect.attributes
						)} up buff`;
						break;
					case "debuff":
						e += `Inflicts Lv.${effect.level} ${arrayToString(
							effect.attributes
						)} down debuff`;
						break;
					case "damage":
						switch (effect.type) {
							case "time":
								e += `Deals Lv.${effect.level} Damage Over Time`;
								break;
							case "atk":
								e += `Deals ${new Intl.NumberFormat().format(effect.amount)}x ${
									effect.leader ? "Leader's " : ""
								}ATK in damage`;
								break;
							case "atkbase":
								e += `Deals ${new Intl.NumberFormat().format(effect.amount)}x ${
									effect.leader ? "Leader's " : ""
								}base ATK in damage`;
								break;
							case "fixed":
								e += `Deals ${new Intl.NumberFormat().format(
									effect.amount
								)} fixed damage`;
								break;
							case "random":
								e += `Randomly deals between ${new Intl.NumberFormat().format(
									effect.amountrange[0]
								)}-${new Intl.NumberFormat().format(
									effect.amountrange[1]
								)} fixed damage`;
								break;
							case "cut":
								e += `${new Intl.NumberFormat().format(
									effect.amount
								)}% health cut`;
								break;
							default:
								e += "TODO:  " + JSON.stringify(effect);
						}
						e += effect.defbypass ? ` that will ignore DEF` : ``;
						break;
					case "recharge":
						switch (effect.type) {
							case "RCV":
								e += `Restores ${new Intl.NumberFormat().format(
									effect.amount
								)}x RCV of HP`;
								break;
							case "percentage":
								e += `Restores ${new Intl.NumberFormat().format(
									effect.amount
								)}% of HP`;
								break;
							case "fixed":
								e += `Restores ${new Intl.NumberFormat().format(
									effect.amount
								)} fixed HP`;
								break;
							case "Special CT":
								e += `Reduces ${new Intl.NumberFormat().format(
									effect.amount
								)}% of ${effect.type}`;
								break;
							default:
								e += "TODO:  " + JSON.stringify(effect);
						}
						if (effect.interval)
							e += ` every ${effect.interval} ${
								effect.interval == 1 ? "second" : "seconds"
							}`;
						break;
					case "hinderance":
						e += effect.amount
							? `Removes ${new Intl.NumberFormat().format(
									effect.amount
							  )}% of ${arrayToString(effect.attributes)}`
							: `${effect.chance}% chance to inflict ${
									effect.level ? "Lv." + effect.level + " " : ""
							  }${arrayToString(effect.attributes)}`;
						break;
					case "boon":
						e += `${effect.chance ? effect.chance + "% chance to " : ""}`;
						let attrStr = arrayToString(effect.attributes);
						switch (attrStr) {
							case "Provoke":
								e += "Provoke enemies";
								break;
							case "Haste":
								e += `${effect.chance ? "g" : "G"}rant Haste`;
								break;
							case "Counter":
								e += `${effect.chance ? "g" : "G"}rant ${
									effect.amount
								}x Counter`;
								break;
							case "Revive":
								e += `${effect.chance ? "r" : "R"}evive to ${
									effect.amount
								}% HP after death`;
								break;
							default:
								e += `${"Reduce " + attrStr}`;
								break;
						}
						break;
					case "penalty":
						let tmpStr = arrayToString(effect.attributes);
						if (tmpStr == "HP" && effect.amount)
							e += `${new Intl.NumberFormat().format(
								effect.amount
							)}% health cut`;
						else if (effect.level)
							e += `Inflicts Lv.${new Intl.NumberFormat().format(
								effect.level
							)} ${arrayToString(effect.attributes)} down penalty`;
						else
							e += `${effect.chance || 100}% chance to ${arrayToString(
								effect.attributes
							)}`;
						break;
					case "cleanse":
						e += `${effect.chance}% chance to cleanse ${arrayToString(
							effect.attributes
						)} debuffs`;
						break;
					default:
						e = "UNKNOWN EFFECT " + JSON.stringify(effect);
						break;
				}
				retVal +=
					e +
					`${targetToString(effect.targeting)}${rangeToString(effect.range)}${
						effect.duration ? " for " + effect.duration + " seconds" : ""
					}` +
					(effect.repeat
						? ` ${new Intl.NumberFormat().format(effect.repeat)} times`
						: ``) +
					`.</li>`;
			}
			return retVal + "</ul>";
		};
	};

	function arrayToString(array) {
		let tmpStr = new Intl.ListFormat("en").format(array);
		return tmpStr;
	}

	function arrayToStringOr(array) {
		let tmpStr = new Intl.ListFormat("en", { type: "disjunction" }).format(
			array
		);
		return tmpStr;
	}

	function conditionToString(condition, suffix) {
		if (!condition) return "";

		switch (condition.type) {
			case "stat":
				return `When ${condition.stat} is ${condition.comparator} ${condition.count}%, `;
			case "time":
				switch (condition.comparator) {
					case "first":
						return `For the first ${condition.count} seconds, `;
					case "after":
						return `After the first ${condition.count} seconds, `;
					case "remaining":
						return `When there are ${condition.count} seconds or less remaining, `;
					default:
						return `UNKNOWN TIME CONDITION ${JSON.stringify(condition)}`;
				}
			case "crew":
			case "enemies":
				return `When there are ${condition.count} or ${condition.comparator} ${
					condition.type
				} ${
					condition.targets
						? arrayToString(condition.targets) + " characters"
						: ""
				}${
					condition.relative
						? condition.type == "crew"
							? " than the enemy team"
							: " than your crew"
						: ""
				}${condition.composition ? "" : " remaining"}, `;
			case "trigger":
				return `The first ${condition.count} times ${
					condition.stat.includes("defeated")
						? condition.team
							? condition.team +
							  (condition.targets ? arrayToString(condition.targets) : "") +
							  " characters are "
							: ""
						: "this character "
				}${
					condition.stat == "takes damage" ||
					condition.stat.includes("recieves") ||
					condition.stat.includes("defeated")
						? condition.stat
						: "lands a " + condition.stat
				}, `;
			case "debuff":
				return `If this character has ${condition.stat}, `;
			case "defeat":
				return `When ${condition.count} characters ${
					condition.team == "enemies"
						? "on the enemy team "
						: condition.team == "crew"
						? "on your crew "
						: ""
				}are defeated, `;
			case "character":
				return `When ${arrayToStringOr(condition.families)} ${
					condition.families.length > 1 ? "are" : "is"
				} ${
					condition.team == "enemies"
						? "on the enemy team"
						: condition.team == "crew"
						? "on your crew"
						: ""
				}, `;
			default:
				return `UNKNOWN CONDITION ${JSON.stringify(condition)}`;
		}
	}

	function rangeToString(range) {
		if (!range) return "";
		return ` in a ${range.size}, ${range.direction} range`;
	}

	function targetToString(target) {
		if (!target) return "";
		let targetStr = arrayToString(target.targets);
		let excludeStr = arrayToString(target.excludes);
		if (targetStr == "crew") targetStr = "crew member(s)";
		if (targetStr == "enemies") {
			if (!target.count) targetStr = "all enemies";
			else if (target.count == 1) targetStr = "enemy";
		}
		let retVal = ` to ${target.count ? target.count + " " : ""}${targetStr}${
			target.families ? " " + arrayToStringOr(target.families) : ""
		}${
			target.targets.includes("self") ||
			target.targets.includes("crew") ||
			target.targets.includes("enemies")
				? ""
				: target.count == 1
				? " character"
				: " characters"
		}`;
		retVal =
			retVal +
			`${target.excludes ? ", excluding " : ""}${
				target.excludes ? excludeStr : ""
			}${
				target.excludes
					? target.excludes.includes("self") ||
					  target.excludes.includes("crew") ||
					  target.excludes.includes("enemies")
						? ""
						: target.count == 1
						? " character"
						: " characters"
					: ""
			}`;
		retVal =
			retVal +
			`${
				target.stat
					? " with " +
					  (target.percentage
							? (target.priority == "exactly" ? target.priority + " " : "a ") +
							  target.percentage +
							  "%"
							: "the " + target.priority) +
					  " " +
					  target.stat
					: ""
			}`;
		return retVal;
	}

	/******************
	 * Initialization *
	 ******************/

	for (var directive in directives)
		app.directive(directive, directives[directive]);

	for (var filter in filters) app.filter(filter, filters[filter]);
})();
