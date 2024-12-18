(function () {
	var FODDER_REGEX = new RegExp(
		"(" +
			[
				"Group",
				"Ensign Navy HQ",
				"Armed \\w+ Unit",
				"[BM]illions Baroque",
				"Eneru's Elect",
				"Skypiea (Guard|Enforcer)",
				"(Adept|Nomad|Hunter), Shandian",
				"(Seaman|Major|Corporal) Navy",
				"Hoodlum.+Bounty Hunter",
				"Punk Black Cat Pirates",
				"Arlong crewmember",
				"Gunner|Cannoneer|Assassin Master",
				"^(Female|Giant).*(Red|Blue|Green|Yellow|Black) Pirates",
				"(Soldier|General) Zombie.*Shadow",
				"Wild Zombie",
				"Street Punk",
				"Kuja Warriors",
				"(Naginata|Rifle|Saber|Bazooka|Knuckle) (Corporal|Major)",
				"(Strong|Speedy|Crafty|Hate-Filled|Egotistical) Soldier Zombie",
				"(Powerful|Sneaky|Blazing) General Zombie",
				"(Quick-Draw|Scheming|Technical|Quick-Strike|Strong-Arm|Bold) Gunman",
				"(Suppressor|Emergency|Perimeter) Jailer",
				"(Contemplative|All-Action) Guard",
				"Fishman (Guard|Outlaw)",
				"Punk Hazard Gas Mask Patrol Soldier",
				"Punk Hazard Patrol Troop Corps",
				"Donquixote Pirates Member",
				"(Tactical|Elite) Musketeers",
				"(Fighter Group|Reconnaissance Group|Electro Group), Guardians",
				"Germa Kingdom Clone Soldier",
				"Soul Homie",
				"Chess Mercenaries",
				"Wano Country Official",
			].join(")|(") +
			")",
		"i"
	);

	var utils = {};

	var fullNames = null,
		reverseEvoMap = null,
		reverseFamilyMap = null;

	/* * * * * Unit control * * * * */

	var parseUnit = function (element, n) {
		var piratefest = window.festival[n];

		// If multi-dimensional array (i.e. VS units), split into two
		if (piratefest && Array.isArray(piratefest[0])) {
			var piratefest2 = piratefest[1];
			piratefest = piratefest[0];
		}
		if (element.length === 0) return [];
		if (element[15] && element[15].constructor != Array)
			element[15] = [element[15], element[15], element[15]];
		var limitHealth = element[12],
			limitAttack = element[13],
			limitRecovery = element[14],
			limitCooldown = 0,
			limitSlots = element[6];
		var limitexHealth = element[12],
			limitexAttack = element[13],
			limitexRecovery = element[14],
			limitexCooldown = 0,
			limitexSlots = element[6];
		var keylevel = 0;
		var LBhp = [],
			LBatk = [],
			LBrcv = [],
			LBsailor = [0],
			LBcaptain = [0];
		var LLBsailor1 = [0],
			LLBsailor2 = [0],
			LLBcaptain = [0],
			LLBspecial = [0];
		var LLBsailor1s = 0,
			LLBsailor2s = 0,
			LLBcaptains = 0,
			LLBspecials = 0;
		var LBhptotal = 0,
			LBatktotal = 0,
			LBrcvtotal = 0,
			LBsailors = 0,
			LBcaptains = 0;
		if (window.details)
			if (window.details[n + 1])
				if (window.details[n + 1].limit) {
					keylevel = Object.keys(window.details[n + 1].limit).length;
					for (var x in window.details[n + 1].limit)
						if (
							window.details[n + 1].limit[x].description.includes(
								"LOCKED WITH KEY"
							)
						)
							keylevel = x;
					//console.log(keylevel, n+1);
					for (var x in window.details[n + 1].limit) {
						//matchHP = window.details[n + 1].limit[x].description.search(/^Boosts base HP by (\d+)/);
						//matchATK = window.details[n + 1].limit[x].description.search(/^Boosts base ATK by (\d+)/);
						//matchRCV = window.details[n + 1].limit[x].description.search(/^Boosts base RCV by (\d+)/);
						//matchCD = window.details[n + 1].limit[x].description.search(/^Reduce base Special Cooldown by (\d+)/);
						//matchHP = window.details[n + 1].limit[x].description.search(/^Acquire (\d+) additional Socket slot/);

						if (parseInt(x) < keylevel) {
							if (
								window.details[n + 1].limit[x].description.includes(
									"Boosts base HP by "
								)
							)
								limitHealth += parseInt(
									window.details[n + 1].limit[x].description.substring(18),
									10
								);
							if (
								window.details[n + 1].limit[x].description.includes(
									"Boosts base ATK by "
								)
							)
								limitAttack += parseInt(
									window.details[n + 1].limit[x].description.substring(19),
									10
								);
							if (
								window.details[n + 1].limit[x].description.includes(
									"Boosts base RCV by "
								)
							)
								limitRecovery += parseInt(
									window.details[n + 1].limit[x].description.substring(19),
									10
								);
							if (
								window.details[n + 1].limit[x].description.includes(
									"Reduce base Special Cooldown by "
								)
							)
								limitCooldown += parseInt(
									window.details[n + 1].limit[x].description.substring(32, 33),
									10
								);
							if (
								window.details[n + 1].limit[x].description.includes(
									"additional Socket slot"
								)
							)
								limitSlots += parseInt(
									window.details[n + 1].limit[x].description.substring(8, 9),
									10
								);
						}
						if (
							window.details[n + 1].limit[x].description.includes(
								"Boosts base HP by "
							)
						) {
							limitexHealth += parseInt(
								window.details[n + 1].limit[x].description.substring(18),
								10
							);
							LBhptotal += parseInt(
								window.details[n + 1].limit[x].description.substring(18),
								10
							);
						}
						if (
							window.details[n + 1].limit[x].description.includes(
								"Boosts base ATK by "
							)
						) {
							limitexAttack += parseInt(
								window.details[n + 1].limit[x].description.substring(19),
								10
							);
							LBatktotal += parseInt(
								window.details[n + 1].limit[x].description.substring(19),
								10
							);
						}
						if (
							window.details[n + 1].limit[x].description.includes(
								"Boosts base RCV by "
							)
						) {
							limitexRecovery += parseInt(
								window.details[n + 1].limit[x].description.substring(19),
								10
							);
							LBrcvtotal += parseInt(
								window.details[n + 1].limit[x].description.substring(19),
								10
							);
						}
						if (
							window.details[n + 1].limit[x].description.includes(
								"Reduce base Special Cooldown by "
							)
						) {
							limitexCooldown += parseInt(
								window.details[n + 1].limit[x].description.substring(32, 33),
								10
							);
						}
						if (
							window.details[n + 1].limit[x].description.includes(
								"additional Socket slot"
							)
						) {
							limitexSlots += parseInt(
								window.details[n + 1].limit[x].description.substring(8, 9),
								10
							);
						}
						if (
							window.details[n + 1].limit[x].description.includes(
								"Acquire Sailor Ability"
							)
						) {
							LBsailors++;
							if (!window.details[n + 1].sailor)
								window.details[n + 1].sailor = {};
							if (window.details[n + 1].sailor.constructor == String)
								window.details[n + 1].sailor = {
									base: window.details[n + 1].sailor,
								};
							window.details[n + 1].sailor["level" + LBsailors.toString()] =
								window.details[n + 1].sailor["level" + LBsailors.toString()]
									? window.details[n + 1].sailor["level" + LBsailors.toString()]
									: window.details[n + 1].limit[x].description.substring(26);
						}
						if (
							window.details[n + 1].limit[x].description.includes(
								"Acquire new Captain Ability"
							)
						) {
							LBcaptains++;
							if (window.details[n + 1].captain.constructor == String)
								window.details[n + 1].captain = {
									base: window.details[n + 1].captain,
								};
							window.details[n + 1].captain["level" + LBcaptains.toString()] =
								window.details[n + 1].captain["level" + LBcaptains.toString()]
									? window.details[n + 1].captain[
											"level" + LBcaptains.toString()
									  ]
									: window.details[n + 1].limit[x].description.substring(29);
						}
						LBhp.push(LBhptotal);
						LBatk.push(LBatktotal);
						LBrcv.push(LBrcvtotal);
						LBsailor.push(LBsailors);
						LBcaptain.push(LBcaptains);
					}
				}
		if (window.details)
			if (window.details[n + 1])
				if (window.details[n + 1].lLimit) {
					for (var x in window.details[n + 1].lLimit) {
						if (window.details[n + 1].lLimit[x]) {
							if (window.details[n + 1].lLimit[x].captain) {
								if (window.details[n + 1].lLimit[x].captain.base) {
									if (window.details[n + 1].captain.constructor == String)
										window.details[n + 1].captain = {
											base: window.details[n + 1].captain,
										};
									window.details[n + 1].captain.llbbase =
										window.details[n + 1].lLimit[x].captain.base;
								}
								if (window.details[n + 1].lLimit[x].captain.level1) {
									if (window.details[n + 1].captain.constructor == String)
										window.details[n + 1].captain = {
											base: window.details[n + 1].captain,
										};
									window.details[n + 1].captain.llblevel1 =
										window.details[n + 1].lLimit[x].captain.level1;
								}
								LLBcaptains++;
							}
							if (window.details[n + 1].lLimit[x].sailor) {
								if (window.details[n + 1].lLimit[x].sailor.level1) {
									if (!window.details[n + 1].sailor)
										window.details[n + 1].sailor = {};
									if (window.details[n + 1].sailor.constructor == String)
										window.details[n + 1].sailor = {
											base: window.details[n + 1].sailor,
										};
									window.details[n + 1].sailor.llblevel1 =
										window.details[n + 1].lLimit[x].sailor.level1;
									LLBsailor1s++;
								}
								if (window.details[n + 1].lLimit[x].sailor.level2) {
									if (!window.details[n + 1].sailor)
										window.details[n + 1].sailor = {};
									if (window.details[n + 1].sailor.constructor == String)
										window.details[n + 1].sailor = {
											base: window.details[n + 1].sailor,
										};
									window.details[n + 1].sailor.llblevel2 =
										window.details[n + 1].lLimit[x].sailor.level2;
									LLBsailor2s++;
								}
							}
							if (window.details[n + 1].lLimit[x].special) {
								if (window.details[n + 1].special.constructor == String)
									window.details[n + 1].special = {
										base: window.details[n + 1].special,
									};
								window.details[n + 1].special.llbbase = window.details[n + 1]
									.lLimit[x].special.base
									? window.details[n + 1].lLimit[x].special.base
									: window.details[n + 1].special.llbbase;
								window.details[n + 1].special.llbcombined = window.details[
									n + 1
								].lLimit[x].special.combined
									? window.details[n + 1].lLimit[x].special.combined
									: window.details[n + 1].special.llbcombined;
								LLBspecials++;
							}
						}
						LLBsailor1.push(LLBsailor1s);
						LLBsailor2.push(LLBsailor2s);
						LLBcaptain.push(LLBcaptains);
						LLBspecial.push(LLBspecials);
					}
				}
		var result = {
			name: element[0],
			type: element[1],
			class: element[2],
			stars: element[3],
			cost: element[4],
			combo: element[5],
			slots: element[6],
			maxLevel: element[7],
			maxEXP: element[8],
			minHP: element[9],
			minATK: element[10],
			minRCV: element[11],
			maxHP: element[12],
			maxATK: element[13],
			maxRCV: element[14],
			llbmaxHP: Math.max(element[12], Math.round(element[12] * 1.5)),
			llbmaxATK: Math.max(element[13], Math.round(element[13] * 1.5)),
			llbmaxRCV: Math.max(element[14], Math.round(element[14] * 1.5)),
			limitHP: limitHealth,
			limitATK: limitAttack,
			limitRCV: limitRecovery,
			limitSlot: limitSlots,
			limitCD: limitCooldown,
			limitexHP: limitexHealth,
			limitexATK: limitexAttack,
			limitexRCV: limitexRecovery,
			limitexSlot: limitexSlots,
			limitexCD: limitexCooldown,
			growth: {
				hp: element[15] ? element[15][0] : 0,
				atk: element[15] ? element[15][1] : 0,
				rcv: element[15] ? element[15][2] : 0,
			},
			number: n,
			limitStats: {
				hp: LBhp,
				atk: LBatk,
				rcv: LBrcv,
				sailors: LBsailor,
				captains: LBcaptain,
			},
			llimitStats: {
				sailors1: LLBsailor1,
				sailors2: LLBsailor2,
				captains: LLBcaptain,
				specials: LLBspecial,
			},
			pirateFest: {
				class: piratefest ? piratefest[0] : "",
				DEF: piratefest ? piratefest[1] : null,
				SPD: piratefest ? piratefest[2] : null,
				minCP: piratefest ? piratefest[3] : null,
				maxCP: piratefest ? piratefest[4] : null,
			},
			pirateFest2: !piratefest2
				? null
				: {
						class: piratefest2 ? piratefest2[0] : "",
						DEF: piratefest2 ? piratefest2[1] : null,
						SPD: piratefest2 ? piratefest2[2] : null,
						minCP: piratefest2 ? piratefest2[3] : null,
						maxCP: piratefest2 ? piratefest2[4] : null,
				  },
			aliases: window.aliases[n + 1] ? window.aliases[n + 1].join(" ") : "",
			families:
				(window.families &&
					window.families[n + 1] &&
					window.families[n + 1].map(utils.normalizeText)) ||
				null,
			support:
				(window.details &&
					window.details[n + 1] &&
					window.details[n + 1].support) ||
				null,
		};
		if (element.indexOf(null) != -1) result.incomplete = true;
		if (result.combo === null) result.preview = true;
		return result;
	};

	utils.parseUnits = function (skipIncomplete) {
		if (skipIncomplete) {
			window.units = window.units.map(function (x, n) {
				if (x.indexOf(null) == -1) return x;
				var viable = x[9] && x[10] && x[11] && x[12] && x[13] && x[14];
				return viable ? x : [];
			});
		}
		window.units = window.units.map(parseUnit);
	};

	utils.getFullUnitName = function (id) {
		if (fullNames === null) {
			fullNames = units.map(function (x, n) {
				if (!x.name) return null;
				let fullName = x.name;
				if (window.aliases && window.aliases[n + 1])
					fullName += ", " + window.aliases[n + 1].join(", ");
				if (window.families && window.families[n + 1])
					fullName += ", " + window.families[n + 1].join(", ");
				return fullName;
			});
		}
		return fullNames[id - 1] && utils.normalizeText(fullNames[id - 1]);
	};

	/**
	 * Transforms a list of characters or types and classes from supported
	 * characters or super special criteria into a query using family, type,
	 * class, and cost operators.
	 * @example
	 * // returns 'type:STR class:Free_Spirit'
	 * Utils.generateCriteriaQuery('[STR] Free Spirit')
	 * @example
	 * // returns 'family:^(Daz_Bones|Nico_Robin|Bentham)$ notFamily:^(Crocodile|Mr._0)$'
	 * Utils.generateCriteriaQuery('Daz Bones (Mr. 1), Nico Robin and Bentham (Mr. 2 Bon Clay)', window.families[1616])
	 * @example
	 * // returns 'cost<=29 notFamily:^(Sengoku)$'
	 * Utils.generateCriteriaQuery('Characters with cost 29 or less', window.families[459])
	 * @param {string} criteria - string that could be a list of families supported,
	 * types and/or classes supported, or character cost supported. Should NOT
	 * include "All characters", "characters" at the end, or "must consist of", etc.
	 * @param {string[]} [supportingFamilies] - array of family names of the
	 * supporting unit. If provided, a `notFamily:` query will be included in
	 * the result
	 * @param {boolean} [returnParamsObject=false] - if true, this will return an object
	 * similar to what `Utils.generateSearchParameters` returns, so that it will
	 * not be necessary to parse the query.
	 * @returns {string|object} search query that filters for the units supported.
	 * This can be of the forms `family:^(Monkey_D._Luffy|Nami)$`, `type:STR|QCK`,
	 * `class:Free_Spirit|Powerhouse`, `cost<=29`, or combinations of them. This
	 * can also be an object of search parameters if `returnParamsObject` is true.
	 */
	utils.generateCriteriaQuery = function (
		criteria,
		supportingFamilies = [],
		returnParamsObject = false
	) {
		let families = [];
		let types = [];
		let classes = [];
		let matchers = [];
		let params = { matchers: {} };
		let whitespaceRegex = /\s+/g;
		let aliasesRegex = /\s+\(.*?\)/g; // Denjiro (Kyoshiro)
		let specialCharactersRegex = /[*+?^${}()|[\]\\]/g; //except dot, no need to escape
		let costRegex = /characters with cost (\d+) or (less|higher)/i;
		let classRegex =
			/^(?:Fighter|Slasher|Striker|Shooter|Free Spirit|Powerhouse|Cerebral|Driven)$/i;

		// "[STR] Free Spirit", we can't just split all by spaces
		// first group is type, second group is optional class
		let typeRegex = /\[(.*?)\](?:\s+([\w ]+))?/i;

		// may be "and" or ", and" or ", " even with extra whitespace
		// if using .split(), you should use non-capturing groups (?:)
		let separatorRegex = /(?:\s*,\s*|\s+)(?:and|or)\s+|\s*,\s*/g;

		let costMatch = criteria.match(costRegex);
		if (costMatch) {
			let op = costMatch[2] == "less" ? "<=" : ">=";
			let value = costMatch[1];
			matchers.push("cost" + op + value);
			if (returnParamsObject) {
				params.ranges = {
					cost: [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
				};

				if (op === "=") {
					params.ranges["cost"][0] = value;
					params.ranges["cost"][1] = value;
				} else if (op === "<") {
					params.ranges["cost"][1] = value - 1;
				} else if (op === "<=") {
					params.ranges["cost"][1] = value;
				} else if (op === ">") {
					params.ranges["cost"][0] = value + 1;
				} else if (op === ">=") {
					params.ranges["cost"][0] = value;
				}
			}
		} else {
			criteria = criteria.replace(aliasesRegex, "");
			let terms = criteria.split(separatorRegex);
			for (let term of terms) {
				let typeMatch = term.match(typeRegex);
				if (typeMatch) {
					types.push(typeMatch[1]);
					if (typeMatch[2]) classes.push(typeMatch[2]);
				} else if (classRegex.test(term)) {
					classes.push(term);
				} else {
					// escape special characters before pushing (except dot)
					families.push(term.replace(specialCharactersRegex, "\\$&"));
				}
			}
		}

		// Create matchers
		if (families.length > 0) {
			// family should be exact match
			params.matchers.family =
				"^(" + families.join("|").replace(whitespaceRegex, "_") + ")$";
			matchers.push("family:" + params.matchers.family);
		}
		if (types.length > 0) {
			params.matchers.type = types.join("|").replace(whitespaceRegex, "_");
			matchers.push("type:" + params.matchers.type);
		}
		if (classes.length > 0) {
			params.matchers.class = classes.join("|").replace(whitespaceRegex, "_");
			matchers.push("class:" + params.matchers.class);
		}
		if (supportingFamilies && supportingFamilies.length > 0) {
			params.matchers.notfamily =
				utils.generateFamilyExclusionQuery(supportingFamilies);
			matchers.push(params.matchers.notfamily);
		}

		if (returnParamsObject) {
			if (params.matchers.notfamily)
				params.matchers.notfamily = params.matchers.notfamily.replace(
					/^notFamily:/,
					""
				);
			for (let key in params.matchers)
				params.matchers[key] = new RegExp(
					params.matchers[key].replace(/_/g, " "),
					"i"
				);
			return params;
		} else {
			return matchers.join(" ");
		}
	};

	/**
	 * Wrapper function for `Utils.generateCriteriaQuery` that will convert the
	 * given `criteria` to a compatible format. If "All characters" is passed
	 * as a criteria, no query (null) will be returned as you should not need
	 * any query for that. This will also strip the trailing " characters", for
	 * supports like "[PSY] characters".
	 * @param {string} criteria - the support criteria given by
	 * window.details[i].support[0].Characters
	 * @param {string[]} [supportingFamilies] - the families of the supporting
	 * unit, which should not be included in the search results, so a
	 * `notFamily:` query will be generated for it.
	 * @param {boolean} [returnParamsObject=false] - if true, this will return an object
	 * similar to what `Utils.generateSearchParameters` returns, so that it will
	 * not be necessary to parse the query.
	 * @returns {string|null|object} a usable query that can be used to search for all
	 * supported characters, or the search parameters   if `returnParamsObject` is true.
	 */
	utils.generateSupportedCharactersQuery = function (
		criteria,
		supportingFamilies = [],
		returnParamsObject = false
	) {
		if (/^All characters?/i.test(criteria)) return null;
		return utils.generateCriteriaQuery(
			criteria.replace(/ characters?$/i, ""),
			supportingFamilies,
			returnParamsObject
		);
	};

	/**
	 * Wrapper function for `Utils.generateCriteriaQuery` for `superSpecialCriteria`
	 * that will convert the given `criteria` to a compatible format. If
	 * "All characters" is passed as a criteria, no query (null) will be returned
	 * as you should not need any query for that. This will also strip the
	 * trailing " characters", for descriptions like "[PSY] characters". This will
	 * also take only superSpecialCriteria that match "must consist of <family names>,
	 * excluding support members", or "must consist of <number> <class or type>
	 * characters, excluding support members".
	 * @param {string} criteria - the support criteria given by
	 * window.details[i].support[0].Characters
	 * @param {string[]} [supportingFamilies] - the families of the unit with
	 * a super special, which should not be included in the search results, so a
	 * `notFamily:` query will be generated for it.
	 * @param {boolean} [returnParamsObject=false] - if true, this will return an object
	 * similar to what `Utils.generateSearchParameters` returns, so that it will
	 * not be necessary to parse the query.
	 * @returns {string|null|object} a usable query that can be used to search for
	 * characters fulfilling the `superSpecialCriteria`, or the search parameters
	 * if `returnParamsObject` is true.
	 */
	utils.generateSuperSpecialQuery = function (
		criteria,
		supportingFamilies = [],
		returnParamsObject = false
	) {
		// for cases like "must consist of 6 Powerhouse or Driven characters, excluding Support members.",
		// this will create `class:Powerhouse|Driven`

		// for cases like "must consist of Monkey D. Luffy, Dracule Mihawk, Ben Beckman, Yasopp or Lucky Roux, excluding Support members.",
		// this will create `family:^(Monkey_D._Luffy|Dracule_Mihawk|Ben_Beckman|Yasopp|Lucky_Roux)$`

		// 3609: `must consist of 6 Striker characters or King, Queen, Jack, Sasaki, X Drake, Black Maria, Who's-Who, Page One, Ulti, or Charlotte Linlin (Big Mom), excluding Support members.`
		// for now, just ignore the `6 Striker characters` condition IF it there are family names succeeding it,
		// since you can have non-Striker Jack teams
		// idea: return an array of queries, so that there will be multiple "Search for these characters" links,
		// depending on the conditions (so that one will handle the `6 Striker characters`,
		// the other will handle the family names.)
		let charactersRegex =
			/must consist of (?:any \d(?: or \d)?|all) of the following, excluding Supports(?: and counting only 1 per unit)?\: (?:(?:\d )?(.*?)characters(?: or )?)?(.*)?/i;
		let match = criteria.match(charactersRegex);
		if (!match) return null;
		// prioritize family names. if there are no family names (match[2] is null|undefined), use the classes/types condition.
		var criteriaTrimmed = (match[2] || match[1]).trim();
		return utils.generateCriteriaQuery(criteriaTrimmed, supportingFamilies);
	};

	utils.generateSuperTandemQuery = function (
		criteria,
		supportingFamilies = [],
		returnParamsObject = false
	) {
		// for cases like "must consist of 6 Powerhouse or Driven characters, excluding Support members.",
		// this will create `class:Powerhouse|Driven`

		// for cases like "Any X of the following: King, Queen, Jack, Sasaki, X Drake, Black Maria, Who's-Who, Page One, Ulti or Striker characters. One of King, Queen, Jack, Sasaki, X Drake, Black Maria, Who's-Who, Page One or Ulti is required.",
		// this will create `family:^(King|Queen|Jack|Sasaki|X_Drake|Black_Maria|Who's-Who|Page_One|Ulti|Striker_characters)$`

		// 3609: `Any X of the following: King, Queen, Jack, Sasaki, X Drake, Black Maria, Who's-Who, Page One, Ulti or Striker characters.`
		// The trailing "Striker characters" is not handled properly as of now
		// idea: return an array of queries, so that there will be multiple "Search for these characters" links,
		// depending on the conditions (so that one will handle the `Striker characters`,
		// the other will handle the family names.)
		let charactersRegex =
			/of the following, excluding Supports and counting only 1 per unit\: (?!.+:)(?:\d (.*?)characters(?: or )?)?(.*)?\./i;
		let match = criteria.match(charactersRegex);
		if (!match) return null;
		// prioritize family names. if there are no family names (match[2] is null|undefined), use the classes/types condition.
		var criteriaTrimmed = (match[2] || match[1]).trim();

		return utils.generateCriteriaQuery(criteriaTrimmed, supportingFamilies);
	};

	utils.generateAttachableSupportsQuery = function (
		unitIdToSupport,
		supportingFamilies = []
	) {
		return "supports:" + unitIdToSupport;
	};

	/**
	 * Will generate a `notFamily:` query so that the supporting unit's families
	 * will not be included in the filtered search results.
	 * @example
	 * // returns 'notFamily:^(Monkey_D._Luffy|Roronoa_Zoro|Nami|Usopp|Vinsmoke_Sanji)$'
	 * Utils.generateFamilyExclusionQuery(window.families[2875]); // can also use array literals
	 * @param {string[]} families - Array of family names of the supporting unit.
	 * @returns {string|null} A `notFamily:` query to be used in the search.
	 */
	utils.generateFamilyExclusionQuery = function (families) {
		if (!families) return null;
		let specialCharactersRegex = /[*+?^${}()[\]\\]/g; // except dot and pipe "|"
		let query =
			"notFamily:^(" +
			families
				.join("|")
				.replace(/\s+/g, "_")
				.replace(specialCharactersRegex, "\\$&") +
			")$";
		return query;
	};

	/**
	 * Replaces letters with diacritics into the more common letters. Used for parsing
	 * and matching search terms, so that users won't have to type exact diacritics.
	 * @example
	 * // returns 'Brulee'
	 * Utils.normalizeText('Brûlée');
	 * @param {string} str String to normalize
	 * @returns {string} String without diacritics
	 */
	utils.normalizeText = function (str) {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	};

	/**
	 * @param {string} family Family name used in window.families.
	 * @returns {Array|null} Array of unit ids that has the given family, or null if the family is not found.
	 */
	utils.getUnitsInFamily = function (family) {
		return utils.getReverseFamilyMap()[family] || null;
	};

	/* * * * * Thumbnail control * * * * */

	utils.getGlobalThumbnailUrl = function (n, relPathToRoot = "") {
		if (
			n === null ||
			n === undefined ||
			(window.units && window.units[n - 1].incomplete)
		)
			return "https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png";
		var id = ("0000" + n).slice(-4).replace(/(057[54])/, "0$1");
		return (
			relPathToRoot +
			"/api/images/thumbnail/glo/" +
			Math.trunc(n / 1000) +
			"/" +
			Math.trunc((n % 1000) / 100) +
			"00/" +
			id +
			".png"
		);
		// return (
		// 	"https://onepiece-treasurecruise.com/wp-content/uploads/sites/2/f" +
		// 	id +
		// 	".png"
		// );
	};

	/**
	 *
	 * @param {number} n 1-based ID number of the unit, or skull ID.
	 * @param {string} relPathToRoot Relative path to the root folder (folder
	 *      containing 'characters', 'common', 'damage', etc), which allows the urls to work even
	 *      in setups where the root folder is not necessarily the root in terms of the url.
	 *      Will only be used for resources that are stored in the repo.
	 * @returns The URL of the thumbnail
	 */
	utils.getThumbnailUrl = function (n, relPathToRoot = "") {
		switch (n) {
			case "skullSTR":
			case 9010:
				return relPathToRoot + "/api/images/common/skull-STR.png";
				break;
			case "skullQCK":
			case 9011:
				return relPathToRoot + "/api/images/common/skull-QCK.png";
				break;
			case "skullPSY":
			case 9012:
				return relPathToRoot + "/api/images/common/skull-PSY.png";
				break;
			case "skullDEX":
			case 9013:
				return relPathToRoot + "/api/images/common/skull-DEX.png";
				break;
			case "skullINT":
			case 9014:
				return relPathToRoot + "/api/images/common/skull-INT.png";
				break;
			default:
				break;
		}
		if (typeof n === "string" && n.includes("skull")) {
			return (
				relPathToRoot +
				"/api/images/thumbnail/jap/" +
				n[0] +
				"/" +
				n[1] +
				"00/" +
				n +
				".png"
			);
		}
		if (n === null || n === undefined)
			return relPathToRoot + "/api/images/common/noimage.png";
		if (window.units && window.units[n - 1].incomplete) {
			switch (window.units[n - 1].type) {
				case "STR":
				case "DEX":
				case "QCK":
				case "PSY":
				case "INT":
					return (
						relPathToRoot +
						"/api/images/common/char-" +
						window.units[n - 1].type +
						".png"
					);
					break;
				default:
					return relPathToRoot + "/api/images/common/noimage.png";
					break;
			}
		}
		var id = ("0000" + n).slice(-4);
		var ghostPoint = 5000;
		var globalExUnitPoint = 4986;
		switch (id) {
			case (globalExUnitPoint + 0).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5013.png";
				break;
			case (globalExUnitPoint + 1).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5014.png";
				break;
			case (globalExUnitPoint + 2).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5029.png";
				break;
			case (globalExUnitPoint + 3).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5030.png";
				break;
			case (globalExUnitPoint + 4).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5031.png";
				break;
			case (globalExUnitPoint + 5).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5032.png";
				break;
			case (globalExUnitPoint + 6).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5046.png";
				break;
			case (globalExUnitPoint + 7).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5047.png";
				break;
			case (globalExUnitPoint + 8).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5054.png";
				break;
			case (globalExUnitPoint + 9).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5055.png";
				break;
			case (globalExUnitPoint + 10).toString():
				return relPathToRoot + "/api/images/thumbnail/glo/5/000/5056.png";
				break;
			case (ghostPoint + 0).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1983-1.png";
				break;
			case (ghostPoint + 1).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1983-2.png";
				break;
			case (ghostPoint + 2).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1983-INT.png";
				break;
			case (ghostPoint + 3).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1983-PSY.png";
				break;
			case (ghostPoint + 4).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1984-1.png";
				break;
			case (ghostPoint + 5).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1984-2.png";
				break;
			case (ghostPoint + 6).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1984-QCK.png";
				break;
			case (ghostPoint + 7).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1984-STR.png";
				break;
			case (ghostPoint + 8).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1985-1.png";
				break;
			case (ghostPoint + 9).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1985-2.png";
				break;
			case (ghostPoint + 10).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1985-QCK.png";
				break;
			case (ghostPoint + 11).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/1/900/1985-STR.png";
				break;
			case (ghostPoint + 12).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/000/2000-1.png";
				break;
			case (ghostPoint + 13).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/000/2000-2.png";
				break;
			case (ghostPoint + 14).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/000/2000-PSY.png";
				break;
			case (ghostPoint + 15).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/000/2000-DEX.png";
				break;
			case (ghostPoint + 16).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2180-1.png";
				break;
			case (ghostPoint + 17).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2180-2.png";
				break;
			case (ghostPoint + 18).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2180-PSY.png";
				break;
			case (ghostPoint + 19).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2180-INT.png";
				break;
			case (ghostPoint + 20).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2181-1.png";
				break;
			case (ghostPoint + 21).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2181-2.png";
				break;
			case (ghostPoint + 22).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2181-PSY.png";
				break;
			case (ghostPoint + 23).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/100/2181-INT.png";
				break;
			case (ghostPoint + 24).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/300/2399-1.png";
				break;
			case (ghostPoint + 25).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/300/2399-2.png";
				break;
			case (ghostPoint + 26).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/300/2399-DEX.png";
				break;
			case (ghostPoint + 27).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/300/2399-STR.png";
				break;
			case (ghostPoint + 28).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2417-1.png";
				break;
			case (ghostPoint + 29).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2417-2.png";
				break;
			case (ghostPoint + 30).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2417-DEX.png";
				break;
			case (ghostPoint + 31).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2417-QCK.png";
				break;
			case (ghostPoint + 32).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2418-1.png";
				break;
			case (ghostPoint + 33).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2418-2.png";
				break;
			case (ghostPoint + 34).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2418-DEX.png";
				break;
			case (ghostPoint + 35).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2418-QCK.png";
				break;
			case (ghostPoint + 36).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2445-1.png";
				break;
			case (ghostPoint + 37).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2445-2.png";
				break;
			case (ghostPoint + 38).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2445-PSY.png";
				break;
			case (ghostPoint + 39).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2445-1.png";
				break;
			case (ghostPoint + 40).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2445-2.png";
				break;
			case (ghostPoint + 41).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2445-PSY.png";
				break;
			case (ghostPoint + 42).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2468-1.png";
				break;
			case (ghostPoint + 43).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2468-2.png";
				break;
			case (ghostPoint + 44).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2468-PSY.png";
				break;
			case (ghostPoint + 45).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2468-QCK.png";
				break;
			case (ghostPoint + 46).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2469-1.png";
				break;
			case (ghostPoint + 47).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2469-2.png";
				break;
			case (ghostPoint + 48).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2469-PSY.png";
				break;
			case (ghostPoint + 49).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/400/2469-QCK.png";
				break;
			case (ghostPoint + 50).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2516-1.png";
				break;
			case (ghostPoint + 51).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2516-2.png";
				break;
			case (ghostPoint + 52).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2516-INT.png";
				break;
			case (ghostPoint + 53).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2516-QCK.png";
				break;
			case (ghostPoint + 54).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2517-1.png";
				break;
			case (ghostPoint + 55).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2517-2.png";
				break;
			case (ghostPoint + 56).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2517-INT.png";
				break;
			case (ghostPoint + 57).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2517-QCK.png";
				break;
			case (ghostPoint + 58).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2531-1.png";
				break;
			case (ghostPoint + 59).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2531-2.png";
				break;
			case (ghostPoint + 60).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2531-DEX.png";
				break;
			case (ghostPoint + 61).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2531-QCK.png";
				break;
			case (ghostPoint + 62).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2532-1.png";
				break;
			case (ghostPoint + 63).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2532-2.png";
				break;
			case (ghostPoint + 64).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2532-INT.png";
				break;
			case (ghostPoint + 65).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2532-QCK.png";
				break;
			case (ghostPoint + 66).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2533-1.png";
				break;
			case (ghostPoint + 67).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2533-2.png";
				break;
			case (ghostPoint + 68).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2533-DEX.png";
				break;
			case (ghostPoint + 69).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2533-QCK.png";
				break;
			case (ghostPoint + 70).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2534-1.png";
				break;
			case (ghostPoint + 71).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2534-2.png";
				break;
			case (ghostPoint + 72).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2534-DEX.png";
				break;
			case (ghostPoint + 73).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2534-QCK.png";
				break;
			case (ghostPoint + 74).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2535-1.png";
				break;
			case (ghostPoint + 75).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2535-2.png";
				break;
			case (ghostPoint + 76).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2535-INT.png";
				break;
			case (ghostPoint + 77).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2535-1.png";
				break;
			case (ghostPoint + 78).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2535-2.png";
				break;
			case (ghostPoint + 79).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2535-INT.png";
				break;
			case (ghostPoint + 80).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2537-1.png";
				break;
			case (ghostPoint + 81).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2537-2.png";
				break;
			case (ghostPoint + 82).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2537-STR.png";
				break;
			case (ghostPoint + 83).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2537-DEX.png";
				break;
			case (ghostPoint + 84).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2538-1.png";
				break;
			case (ghostPoint + 85).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2538-2.png";
				break;
			case (ghostPoint + 86).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2538-STR.png";
				break;
			case (ghostPoint + 87).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2538-DEX.png";
				break;
			case (ghostPoint + 88).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2539-1.png";
				break;
			case (ghostPoint + 89).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2539-2.png";
				break;
			case (ghostPoint + 90).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2539-PSY.png";
				break;
			case (ghostPoint + 91).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2539-STR.png";
				break;
			case (ghostPoint + 92).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2540-1.png";
				break;
			case (ghostPoint + 93).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2540-2.png";
				break;
			case (ghostPoint + 94).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2540-PSY.png";
				break;
			case (ghostPoint + 95).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2540-STR.png";
				break;
			case (ghostPoint + 96).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2541-1.png";
				break;
			case (ghostPoint + 97).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2541-2.png";
				break;
			case (ghostPoint + 98).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2541-QCK.png";
				break;
			case (ghostPoint + 99).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2541-PSY.png";
				break;
			case (ghostPoint + 100).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2542-1.png";
				break;
			case (ghostPoint + 101).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2542-2.png";
				break;
			case (ghostPoint + 102).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2542-QCK.png";
				break;
			case (ghostPoint + 103).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2542-PSY.png";
				break;
			case (ghostPoint + 104).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2543-1.png";
				break;
			case (ghostPoint + 105).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2543-2.png";
				break;
			case (ghostPoint + 106).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2543-DEX.png";
				break;
			case (ghostPoint + 107).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2543-INT.png";
				break;
			case (ghostPoint + 108).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2544-1.png";
				break;
			case (ghostPoint + 109).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2544-2.png";
				break;
			case (ghostPoint + 110).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2544-DEX.png";
				break;
			case (ghostPoint + 111).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2544-INT.png";
				break;
			case (ghostPoint + 112).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2549-1.png";
				break;
			case (ghostPoint + 113).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2549-2.png";
				break;
			case (ghostPoint + 114).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2549-STR.png";
				break;
			case (ghostPoint + 115).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2549-DEX.png";
				break;
			case (ghostPoint + 116).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2550-1.png";
				break;
			case (ghostPoint + 117).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2550-2.png";
				break;
			case (ghostPoint + 118).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2550-STR.png";
				break;
			case (ghostPoint + 119).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2550-DEX.png";
				break;
			case (ghostPoint + 120).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2551-1.png";
				break;
			case (ghostPoint + 121).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2551-2.png";
				break;
			case (ghostPoint + 122).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2551-INT.png";
				break;
			case (ghostPoint + 123).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2551-DEX.png";
				break;
			case (ghostPoint + 124).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2552-1.png";
				break;
			case (ghostPoint + 125).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2552-2.png";
				break;
			case (ghostPoint + 126).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2552-INT.png";
				break;
			case (ghostPoint + 127).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2552-DEX.png";
				break;
			case (ghostPoint + 128).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2556-1.png";
				break;
			case (ghostPoint + 129).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2556-2.png";
				break;
			case (ghostPoint + 130).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2556-INT.png";
				break;
			case (ghostPoint + 131).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2556-DEX.png";
				break;
			case (ghostPoint + 132).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2557-1.png";
				break;
			case (ghostPoint + 133).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2557-2.png";
				break;
			case (ghostPoint + 134).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2557-INT.png";
				break;
			case (ghostPoint + 135).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2557-DEX.png";
				break;
			case (ghostPoint + 136).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2560-1.png";
				break;
			case (ghostPoint + 137).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2560-2.png";
				break;
			case (ghostPoint + 138).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2560-STR.png";
				break;
			case (ghostPoint + 139).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2560-INT.png";
				break;
			case (ghostPoint + 140).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2561-1.png";
				break;
			case (ghostPoint + 141).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2561-2.png";
				break;
			case (ghostPoint + 142).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2561-STR.png";
				break;
			case (ghostPoint + 143).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2561-INT.png";
				break;
			case (ghostPoint + 144).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2576-1.png";
				break;
			case (ghostPoint + 145).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2576-2.png";
				break;
			case (ghostPoint + 146).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2576-STR.png";
				break;
			case (ghostPoint + 147).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2576-PSY.png";
				break;
			case (ghostPoint + 148).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2577-1.png";
				break;
			case (ghostPoint + 149).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2577-2.png";
				break;
			case (ghostPoint + 150).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2577-STR.png";
				break;
			case (ghostPoint + 151).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/500/2577-PSY.png";
				break;
			case (ghostPoint + 152).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2600-1.png";
				break;
			case (ghostPoint + 153).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2600-2.png";
				break;
			case (ghostPoint + 154).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2600-DEX.png";
				break;
			case (ghostPoint + 155).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2600-STR.png";
				break;
			case (ghostPoint + 156).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2601-1.png";
				break;
			case (ghostPoint + 157).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2601-2.png";
				break;
			case (ghostPoint + 158).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2601-DEX.png";
				break;
			case (ghostPoint + 159).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2601-STR.png";
				break;
			case (ghostPoint + 160).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2602-1.png";
				break;
			case (ghostPoint + 161).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2602-2.png";
				break;
			case (ghostPoint + 162).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2602-INT.png";
				break;
			case (ghostPoint + 163).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2602-PSY.png";
				break;
			case (ghostPoint + 164).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2603-1.png";
				break;
			case (ghostPoint + 165).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2603-2.png";
				break;
			case (ghostPoint + 166).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2603-INT.png";
				break;
			case (ghostPoint + 167).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2603-PSY.png";
				break;
			case (ghostPoint + 168).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2618-1.png";
				break;
			case (ghostPoint + 169).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2618-2.png";
				break;
			case (ghostPoint + 170).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2618-STR.png";
				break;
			case (ghostPoint + 171).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/600/2618-INT.png";
				break;
			case (ghostPoint + 172).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/700/2795-1.png";
				break;
			case (ghostPoint + 173).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/700/2795-2.png";
				break;
			case (ghostPoint + 174).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/700/2795-PSY.png";
				break;
			case (ghostPoint + 175).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/700/2795-INT.png";
				break;
			case (ghostPoint + 176).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2801-1.png";
				break;
			case (ghostPoint + 177).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2801-2.png";
				break;
			case (ghostPoint + 178).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2801-STR.png";
				break;
			case (ghostPoint + 179).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2801-DEX.png";
				break;
			case (ghostPoint + 180).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2802-1.png";
				break;
			case (ghostPoint + 181).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2802-2.png";
				break;
			case (ghostPoint + 182).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2802-STR.png";
				break;
			case (ghostPoint + 183).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2802-DEX.png";
				break;
			case (ghostPoint + 184).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2818-1.png";
				break;
			case (ghostPoint + 185).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2818-2.png";
				break;
			case (ghostPoint + 186).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2818-QCK.png";
				break;
			case (ghostPoint + 187).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2818-INT.png";
				break;
			case (ghostPoint + 188).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2819-1.png";
				break;
			case (ghostPoint + 189).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2819-2.png";
				break;
			case (ghostPoint + 190).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2819-QCK.png";
				break;
			case (ghostPoint + 191).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2819-INT.png";
				break;
			case (ghostPoint + 192).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2831-1.png";
				break;
			case (ghostPoint + 193).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2831-2.png";
				break;
			case (ghostPoint + 194).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2831-STR.png";
				break;
			case (ghostPoint + 195).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2834-1.png";
				break;
			case (ghostPoint + 196).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2834-2.png";
				break;
			case (ghostPoint + 197).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2834-DEX.png";
				break;
			case (ghostPoint + 198).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2834-INT.png";
				break;
			case (ghostPoint + 199).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2835-1.png";
				break;
			case (ghostPoint + 200).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2835-2.png";
				break;
			case (ghostPoint + 201).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2835-DEX.png";
				break;
			case (ghostPoint + 202).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2835-INT.png";
				break;
			case (ghostPoint + 203).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2850-1.png";
				break;
			case (ghostPoint + 204).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2850-2.png";
				break;
			case (ghostPoint + 205).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2850-DEX.png";
				break;
			case (ghostPoint + 206).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2850-INT.png";
				break;
			case (ghostPoint + 207).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2859-1.png";
				break;
			case (ghostPoint + 208).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2859-2.png";
				break;
			case (ghostPoint + 209).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2859-STR.png";
				break;
			case (ghostPoint + 210).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2860-1.png";
				break;
			case (ghostPoint + 211).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2860-2.png";
				break;
			case (ghostPoint + 212).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2860-STR.png";
				break;
			case (ghostPoint + 213).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2861-1.png";
				break;
			case (ghostPoint + 214).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2861-2.png";
				break;
			case (ghostPoint + 215).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2861-PSY.png";
				break;
			case (ghostPoint + 216).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2861-QCK.png";
				break;
			case (ghostPoint + 217).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2862-1.png";
				break;
			case (ghostPoint + 218).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2862-2.png";
				break;
			case (ghostPoint + 219).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2862-PSY.png";
				break;
			case (ghostPoint + 220).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2862-QCK.png";
				break;
			case (ghostPoint + 221).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2863-1.png";
				break;
			case (ghostPoint + 222).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2863-2.png";
				break;
			case (ghostPoint + 223).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2863-STR.png";
				break;
			case (ghostPoint + 224).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2863-QCK.png";
				break;
			case (ghostPoint + 225).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2864-1.png";
				break;
			case (ghostPoint + 226).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2864-2.png";
				break;
			case (ghostPoint + 227).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2864-STR.png";
				break;
			case (ghostPoint + 228).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2864-QCK.png";
				break;
			case (ghostPoint + 229).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2865-1.png";
				break;
			case (ghostPoint + 230).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2865-2.png";
				break;
			case (ghostPoint + 231).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2865-QCK.png";
				break;
			case (ghostPoint + 232).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2865-DEX.png";
				break;
			case (ghostPoint + 233).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2866-1.png";
				break;
			case (ghostPoint + 234).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2866-2.png";
				break;
			case (ghostPoint + 235).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2866-QCK.png";
				break;
			case (ghostPoint + 236).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2866-DEX.png";
				break;
			case (ghostPoint + 237).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2867-1.png";
				break;
			case (ghostPoint + 238).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2867-2.png";
				break;
			case (ghostPoint + 239).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2867-INT.png";
				break;
			case (ghostPoint + 240).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2894-1.png";
				break;
			case (ghostPoint + 241).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2894-2.png";
				break;
			case (ghostPoint + 242).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2894-STR.png";
				break;
			case (ghostPoint + 243).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2894-PSY.png";
				break;
			case (ghostPoint + 244).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2895-1.png";
				break;
			case (ghostPoint + 245).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2895-2.png";
				break;
			case (ghostPoint + 246).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2895-STR.png";
				break;
			case (ghostPoint + 247).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/800/2895-PSY.png";
				break;
			case (ghostPoint + 248).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2919-1.png";
				break;
			case (ghostPoint + 249).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2919-2.png";
				break;
			case (ghostPoint + 250).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2919-DEX.png";
				break;
			case (ghostPoint + 251).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2919-QCK.png";
				break;
			case (ghostPoint + 252).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2999-1.png";
				break;
			case (ghostPoint + 253).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2999-2.png";
				break;
			case (ghostPoint + 254).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2999-PSY.png";
				break;
			case (ghostPoint + 255).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/2/900/2999-INT.png";
				break;
			case (ghostPoint + 256).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3060-1.png";
				break;
			case (ghostPoint + 257).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3060-2.png";
				break;
			case (ghostPoint + 258).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3060-DEX.png";
				break;
			case (ghostPoint + 259).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3060-PSY.png";
				break;
			case (ghostPoint + 260).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3064-1.png";
				break;
			case (ghostPoint + 261).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3064-2.png";
				break;
			case (ghostPoint + 262).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3064-STR.png";
				break;
			case (ghostPoint + 263).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3064-PSY.png";
				break;
			case (ghostPoint + 264).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3065-1.png";
				break;
			case (ghostPoint + 265).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3065-2.png";
				break;
			case (ghostPoint + 266).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3065-STR.png";
				break;
			case (ghostPoint + 267).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3065-PSY.png";
				break;
			case (ghostPoint + 268).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3098-1.png";
				break;
			case (ghostPoint + 269).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3098-2.png";
				break;
			case (ghostPoint + 270).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3098-STR.png";
				break;
			case (ghostPoint + 271).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/000/3098-PSY.png";
				break;
			case (ghostPoint + 272).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3134-1.png";
				break;
			case (ghostPoint + 273).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3134-2.png";
				break;
			case (ghostPoint + 274).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3135-1.png";
				break;
			case (ghostPoint + 275).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3135-2.png";
				break;
			case (ghostPoint + 276).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3163-1.png";
				break;
			case (ghostPoint + 277).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3163-2.png";
				break;
			case (ghostPoint + 278).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3163-QCK.png";
				break;
			case (ghostPoint + 279).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3163-DEX.png";
				break;
			case (ghostPoint + 280).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3164-1.png";
				break;
			case (ghostPoint + 281).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3164-2.png";
				break;
			case (ghostPoint + 282).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3164-QCK.png";
				break;
			case (ghostPoint + 283).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3164-DEX.png";
				break;
			case (ghostPoint + 284).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3165-1.png";
				break;
			case (ghostPoint + 285).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3165-2.png";
				break;
			case (ghostPoint + 286).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3165-QCK.png";
				break;
			case (ghostPoint + 287).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3165-PSY.png";
				break;
			case (ghostPoint + 288).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3166-1.png";
				break;
			case (ghostPoint + 289).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3166-2.png";
				break;
			case (ghostPoint + 290).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3166-QCK.png";
				break;
			case (ghostPoint + 291).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/100/3166-PSY.png";
				break;
			case (ghostPoint + 292).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3203-1.png";
				break;
			case (ghostPoint + 293).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3203-2.png";
				break;
			case (ghostPoint + 294).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3203-QCK.png";
				break;
			case (ghostPoint + 295).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3203-DEX.png";
				break;
			case (ghostPoint + 296).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3204-1.png";
				break;
			case (ghostPoint + 297).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3204-2.png";
				break;
			case (ghostPoint + 298).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3204-QCK.png";
				break;
			case (ghostPoint + 299).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3204-DEX.png";
				break;
			case (ghostPoint + 300).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3252-1.png";
				break;
			case (ghostPoint + 301).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3252-2.png";
				break;
			case (ghostPoint + 302).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3253-1.png";
				break;
			case (ghostPoint + 303).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3253-2.png";
				break;
			case (ghostPoint + 304).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3279-1.png";
				break;
			case (ghostPoint + 305).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3279-2.png";
				break;
			case (ghostPoint + 306).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3279-INT.png";
				break;
			case (ghostPoint + 307).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3280-1.png";
				break;
			case (ghostPoint + 308).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3280-2.png";
				break;
			case (ghostPoint + 309).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3280-INT.png";
				break;
			case (ghostPoint + 310).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3299-1.png";
				break;
			case (ghostPoint + 311).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3299-2.png";
				break;
			case (ghostPoint + 312).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3299-DEX.png";
				break;
			case (ghostPoint + 313).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/200/3299-PSY.png";
				break;
			case (ghostPoint + 314).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3300-1.png";
				break;
			case (ghostPoint + 315).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3300-2.png";
				break;
			case (ghostPoint + 316).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3300-DEX.png";
				break;
			case (ghostPoint + 317).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3300-PSY.png";
				break;
			case (ghostPoint + 318).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3330-1.png";
				break;
			case (ghostPoint + 319).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3330-2.png";
				break;
			case (ghostPoint + 320).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3330-QCK.png";
				break;
			case (ghostPoint + 321).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3330-INT.png";
				break;
			case (ghostPoint + 322).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3331-1.png";
				break;
			case (ghostPoint + 323).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3331-2.png";
				break;
			case (ghostPoint + 324).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3331-QCK.png";
				break;
			case (ghostPoint + 325).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3346-1.png";
				break;
			case (ghostPoint + 326).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3346-2.png";
				break;
			case (ghostPoint + 327).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3346-STR.png";
				break;
			case (ghostPoint + 328).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3346-DEX.png";
				break;
			case (ghostPoint + 329).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3348-1.png";
				break;
			case (ghostPoint + 330).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3348-2.png";
				break;
			case (ghostPoint + 331).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3348-QCK.png";
				break;
			case (ghostPoint + 332).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3348-DEX.png";
				break;
			case (ghostPoint + 333).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3349-1.png";
				break;
			case (ghostPoint + 334).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3349-2.png";
				break;
			case (ghostPoint + 335).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3349-QCK.png";
				break;
			case (ghostPoint + 336).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3349-DEX.png";
				break;
			case (ghostPoint + 337).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3354-1.png";
				break;
			case (ghostPoint + 338).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3354-2.png";
				break;
			case (ghostPoint + 339).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3355-1.png";
				break;
			case (ghostPoint + 340).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/300/3355-2.png";
				break;
			case (ghostPoint + 341).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3432-1.png";
				break;
			case (ghostPoint + 342).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3432-2.png";
				break;
			case (ghostPoint + 343).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3432-QCK.png";
				break;
			case (ghostPoint + 344).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3432-DEX.png";
				break;
			case (ghostPoint + 345).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3433-1.png";
				break;
			case (ghostPoint + 346).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3433-2.png";
				break;
			case (ghostPoint + 347).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3433-QCK.png";
				break;
			case (ghostPoint + 348).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3433-DEX.png";
				break;
			case (ghostPoint + 349).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3492-1.png";
				break;
			case (ghostPoint + 350).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3492-2.png";
				break;
			case (ghostPoint + 351).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3492-STR.png";
				break;
			case (ghostPoint + 352).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3492-PSY.png";
				break;
			case (ghostPoint + 353).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3493-1.png";
				break;
			case (ghostPoint + 354).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3493-2.png";
				break;
			case (ghostPoint + 355).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3493-STR.png";
				break;
			case (ghostPoint + 356).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3493-PSY.png";
				break;
			case (ghostPoint + 357).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3494-1.png";
				break;
			case (ghostPoint + 358).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3494-2.png";
				break;
			case (ghostPoint + 359).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3494-DEX.png";
				break;
			case (ghostPoint + 360).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3494-INT.png";
				break;
			case (ghostPoint + 361).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3495-1.png";
				break;
			case (ghostPoint + 362).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3495-2.png";
				break;
			case (ghostPoint + 363).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3495-DEX.png";
				break;
			case (ghostPoint + 364).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/400/3495-INT.png";
				break;
			case (ghostPoint + 365).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3507-1.png";
				break;
			case (ghostPoint + 366).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3507-2.png";
				break;
			case (ghostPoint + 367).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3507-STR.png";
				break;
			case (ghostPoint + 368).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3507-QCK.png";
				break;
			case (ghostPoint + 369).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3508-1.png";
				break;
			case (ghostPoint + 370).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3508-2.png";
				break;
			case (ghostPoint + 371).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3508-STR.png";
				break;
			case (ghostPoint + 372).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3508-QCK.png";
				break;
			case (ghostPoint + 373).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3512-1.png";
				break;
			case (ghostPoint + 374).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3512-2.png";
				break;
			case (ghostPoint + 375).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3512-INT.png";
				break;
			case (ghostPoint + 376).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3512-PSY.png";
				break;
			case (ghostPoint + 377).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3513-1.png";
				break;
			case (ghostPoint + 378).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3513-2.png";
				break;
			case (ghostPoint + 379).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3513-INT.png";
				break;
			case (ghostPoint + 380).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3513-PSY.png";
				break;
			case (ghostPoint + 381).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3514-1.png";
				break;
			case (ghostPoint + 382).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3514-2.png";
				break;
			case (ghostPoint + 383).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3514-STR.png";
				break;
			case (ghostPoint + 384).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3514-DEX.png";
				break;
			case (ghostPoint + 385).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3515-1.png";
				break;
			case (ghostPoint + 386).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3515-2.png";
				break;
			case (ghostPoint + 387).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3515-STR.png";
				break;
			case (ghostPoint + 388).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3515-DEX.png";
				break;
			case (ghostPoint + 389).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3542-1.png";
				break;
			case (ghostPoint + 390).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3542-2.png";
				break;
			case (ghostPoint + 391).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3542-QCK.png";
				break;
			case (ghostPoint + 392).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3542-DEX.png";
				break;
			case (ghostPoint + 393).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3543-1.png";
				break;
			case (ghostPoint + 394).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3543-2.png";
				break;
			case (ghostPoint + 395).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3543-QCK.png";
				break;
			case (ghostPoint + 396).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3543-DEX.png";
				break;
			case (ghostPoint + 397).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3554-1.png";
				break;
			case (ghostPoint + 398).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3554-2.png";
				break;
			case (ghostPoint + 399).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3554-PSY.png";
				break;
			case (ghostPoint + 400).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3554-QCK.png";
				break;
			case (ghostPoint + 401).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3555-1.png";
				break;
			case (ghostPoint + 402).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3555-2.png";
				break;
			case (ghostPoint + 403).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3555-PSY.png";
				break;
			case (ghostPoint + 404).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3555-QCK.png";
				break;
			case (ghostPoint + 405).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3573-1.png";
				break;
			case (ghostPoint + 406).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3573-2.png";
				break;
			case (ghostPoint + 407).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3573-PSY.png";
				break;
			case (ghostPoint + 408).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3573-DEX.png";
				break;
			case (ghostPoint + 409).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3574-1.png";
				break;
			case (ghostPoint + 410).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3574-2.png";
				break;
			case (ghostPoint + 411).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3574-PSY.png";
				break;
			case (ghostPoint + 412).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/500/3574-DEX.png";
				break;
			case (ghostPoint + 413).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3610-1.png";
				break;
			case (ghostPoint + 414).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3610-2.png";
				break;
			case (ghostPoint + 415).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3610-STR.png";
				break;
			case (ghostPoint + 416).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3610-DEX.png";
				break;
			case (ghostPoint + 417).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3611-1.png";
				break;
			case (ghostPoint + 418).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3611-2.png";
				break;
			case (ghostPoint + 419).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3611-STR.png";
				break;
			case (ghostPoint + 420).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/600/3611-DEX.png";
				break;
			case (ghostPoint + 421).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3707-1.png";
				break;
			case (ghostPoint + 422).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3707-2.png";
				break;
			case (ghostPoint + 423).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3707-PSY.png";
				break;
			case (ghostPoint + 424).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3707-QCK.png";
				break;
			case (ghostPoint + 425).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3708-1.png";
				break;
			case (ghostPoint + 426).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3708-2.png";
				break;
			case (ghostPoint + 427).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3708-PSY.png";
				break;
			case (ghostPoint + 428).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3708-QCK.png";
				break;
			case (ghostPoint + 429).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3787-1.png";
				break;
			case (ghostPoint + 430).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3787-2.png";
				break;
			case (ghostPoint + 431).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3788-1.png";
				break;
			case (ghostPoint + 432).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/700/3788-2.png";
				break;
			case (ghostPoint + 433).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3810-1.png";
				break;
			case (ghostPoint + 434).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3810-2.png";
				break;
			case (ghostPoint + 435).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3810-PSY.png";
				break;
			case (ghostPoint + 436).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3810-DEX.png";
				break;
			case (ghostPoint + 437).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3811-1.png";
				break;
			case (ghostPoint + 438).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3811-2.png";
				break;
			case (ghostPoint + 439).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3811-PSY.png";
				break;
			case (ghostPoint + 440).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3811-DEX.png";
				break;
			case (ghostPoint + 441).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3828-1.png";
				break;
			case (ghostPoint + 442).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3828-2.png";
				break;
			case (ghostPoint + 443).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3828-STR.png";
				break;
			case (ghostPoint + 444).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3828-PSY.png";
				break;
			case (ghostPoint + 445).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3845-1.png";
				break;
			case (ghostPoint + 446).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3845-2.png";
				break;
			case (ghostPoint + 447).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3845-PSY.png";
				break;
			case (ghostPoint + 448).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3845-QCK.png";
				break;
			case (ghostPoint + 449).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3868-1.png";
				break;
			case (ghostPoint + 450).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3868-2.png";
				break;
			case (ghostPoint + 451).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3868-DEX.png";
				break;
			case (ghostPoint + 452).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3868-QCK.png";
				break;
			case (ghostPoint + 453).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3877-1.png";
				break;
			case (ghostPoint + 454).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3877-2.png";
				break;
			case (ghostPoint + 455).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3877-STR.png";
				break;
			case (ghostPoint + 456).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3877-DEX.png";
				break;
			case (ghostPoint + 457).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3878-1.png";
				break;
			case (ghostPoint + 458).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3878-2.png";
				break;
			case (ghostPoint + 459).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3878-STR.png";
				break;
			case (ghostPoint + 460).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3878-DEX.png";
				break;
			case (ghostPoint + 461).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3879-1.png";
				break;
			case (ghostPoint + 462).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3879-2.png";
				break;
			case (ghostPoint + 463).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3879-QCK.png";
				break;
			case (ghostPoint + 464).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3879-STR.png";
				break;
			case (ghostPoint + 465).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3880-1.png";
				break;
			case (ghostPoint + 466).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3880-2.png";
				break;
			case (ghostPoint + 467).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3880-QCK.png";
				break;
			case (ghostPoint + 468).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/800/3880-STR.png";
				break;
			case (ghostPoint + 469).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3902-1.png";
				break;
			case (ghostPoint + 470).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3902-2.png";
				break;
			case (ghostPoint + 471).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3902-INT.png";
				break;
			case (ghostPoint + 472).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3907-1.png";
				break;
			case (ghostPoint + 473).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3907-2.png";
				break;
			case (ghostPoint + 474).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3908-1.png";
				break;
			case (ghostPoint + 475).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3908-2.png";
				break;
			case (ghostPoint + 476).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3909-1.png";
				break;
			case (ghostPoint + 477).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3909-2.png";
				break;
			case (ghostPoint + 478).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3909-PSY.png";
				break;
			case (ghostPoint + 479).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3909-DEX.png";
				break;
			case (ghostPoint + 480).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3910-1.png";
				break;
			case (ghostPoint + 481).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3910-2.png";
				break;
			case (ghostPoint + 482).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3910-PSY.png";
				break;
			case (ghostPoint + 483).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3910-DEX.png";
				break;
			case (ghostPoint + 484).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3916-1.png";
				break;
			case (ghostPoint + 485).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3916-2.png";
				break;
			case (ghostPoint + 486).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3916-DEX.png";
				break;
			case (ghostPoint + 487).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3916-QCK.png";
				break;
			case (ghostPoint + 488).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3917-1.png";
				break;
			case (ghostPoint + 489).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3917-2.png";
				break;
			case (ghostPoint + 490).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3917-DEX.png";
				break;
			case (ghostPoint + 491).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3917-QCK.png";
				break;
			case (ghostPoint + 492).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3920-1.png";
				break;
			case (ghostPoint + 493).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3920-2.png";
				break;
			case (ghostPoint + 494).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3920-QCK.png";
				break;
			case (ghostPoint + 495).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3920-STR.png";
				break;
			case (ghostPoint + 496).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3921-1.png";
				break;
			case (ghostPoint + 497).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3921-2.png";
				break;
			case (ghostPoint + 498).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3921-INT.png";
				break;
			case (ghostPoint + 499).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3921-DEX.png";
				break;
			case (ghostPoint + 500).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3922-1.png";
				break;
			case (ghostPoint + 501).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3922-2.png";
				break;
			case (ghostPoint + 502).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3922-INT.png";
				break;
			case (ghostPoint + 503).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3922-DEX.png";
				break;
			case (ghostPoint + 504).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3923-1.png";
				break;
			case (ghostPoint + 505).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3923-2.png";
				break;
			case (ghostPoint + 506).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3923-DEX.png";
				break;
			case (ghostPoint + 507).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3923-INT.png";
				break;
			case (ghostPoint + 508).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3924-1.png";
				break;
			case (ghostPoint + 509).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3924-2.png";
				break;
			case (ghostPoint + 510).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3924-DEX.png";
				break;
			case (ghostPoint + 511).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3924-INT.png";
				break;
			case (ghostPoint + 512).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3932-1.png";
				break;
			case (ghostPoint + 513).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3932-2.png";
				break;
			case (ghostPoint + 514).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3932-INT.png";
				break;
			case (ghostPoint + 515).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3932-DEX.png";
				break;
			case (ghostPoint + 516).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3933-1.png";
				break;
			case (ghostPoint + 517).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3933-2.png";
				break;
			case (ghostPoint + 518).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3933-INT.png";
				break;
			case (ghostPoint + 519).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3933-DEX.png";
				break;
			case (ghostPoint + 520).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3940-1.png";
				break;
			case (ghostPoint + 521).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3940-2.png";
				break;
			case (ghostPoint + 522).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3940-DEX.png";
				break;
			case (ghostPoint + 523).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3940-INT.png";
				break;
			case (ghostPoint + 524).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3969-1.png";
				break;
			case (ghostPoint + 525).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3969-2.png";
				break;
			case (ghostPoint + 526).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3969-PSY.png";
				break;
			case (ghostPoint + 527).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3970-1.png";
				break;
			case (ghostPoint + 528).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3970-2.png";
				break;
			case (ghostPoint + 529).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3970-PSY.png";
				break;
			case (ghostPoint + 530).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3970-INT.png";
				break;
			case (ghostPoint + 531).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3971-1.png";
				break;
			case (ghostPoint + 532).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3971-2.png";
				break;
			case (ghostPoint + 533).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3971-PSY.png";
				break;
			case (ghostPoint + 534).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3971-INT.png";
				break;
			case (ghostPoint + 535).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3989-1.png";
				break;
			case (ghostPoint + 536).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3989-2.png";
				break;
			case (ghostPoint + 537).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3989-PSY.png";
				break;
			case (ghostPoint + 538).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3989-INT.png";
				break;
			case (ghostPoint + 539).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3994-1.png";
				break;
			case (ghostPoint + 540).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3994-2.png";
				break;
			case (ghostPoint + 541).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3994-INT.png";
				break;
			case (ghostPoint + 542).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3994-PSY.png";
				break;
			case (ghostPoint + 543).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3995-1.png";
				break;
			case (ghostPoint + 544).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3995-2.png";
				break;
			case (ghostPoint + 545).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3995-INT.png";
				break;
			case (ghostPoint + 546).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/3/900/3995-PSY.png";
				break;
			case (ghostPoint + 547).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4002-1.png";
				break;
			case (ghostPoint + 548).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4002-2.png";
				break;
			case (ghostPoint + 549).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4002-STR.png";
				break;
			case (ghostPoint + 550).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4002-QCK.png";
				break;
			case (ghostPoint + 551).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4003-1.png";
				break;
			case (ghostPoint + 552).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4003-2.png";
				break;
			case (ghostPoint + 553).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4003-STR.png";
				break;
			case (ghostPoint + 554).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4003-QCK.png";
				break;
			case (ghostPoint + 555).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4059-1.png";
				break;
			case (ghostPoint + 556).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4059-2.png";
				break;
			case (ghostPoint + 557).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4059-QCK.png";
				break;
			case (ghostPoint + 558).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4059-DEX.png";
				break;
			case (ghostPoint + 559).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4060-1.png";
				break;
			case (ghostPoint + 560).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4060-2.png";
				break;
			case (ghostPoint + 561).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4060-QCK.png";
				break;
			case (ghostPoint + 562).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4060-DEX.png";
				break;
			case (ghostPoint + 563).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4061-1.png";
				break;
			case (ghostPoint + 564).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4061-2.png";
				break;
			case (ghostPoint + 565).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4061-DEX.png";
				break;
			case (ghostPoint + 566).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4061-QCK.png";
				break;
			case (ghostPoint + 567).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4062-1.png";
				break;
			case (ghostPoint + 568).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4062-2.png";
				break;
			case (ghostPoint + 569).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4062-DEX.png";
				break;
			case (ghostPoint + 570).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/000/4062-QCK.png";
				break;
			case (ghostPoint + 571).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/100/4118-1.png";
				break;
			case (ghostPoint + 572).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/100/4118-2.png";
				break;
			case (ghostPoint + 573).toString():
				return relPathToRoot + "/api/images/thumbnail/jap/4/100/4118-STR.png";
				break;
			default:
				break;
		}

		return (
			relPathToRoot +
			"/api/images/thumbnail/jap/" +
			Math.trunc(n / 1000) +
			"/" +
			Math.trunc((n % 1000) / 100) +
			"00/" +
			id +
			".png"
		);
	};

	/**
	 * Function to get the url for the big thumbnail (the one shown upon checking the details of a unit)
	 * @param {number} n 1-based ID number of the unit, or skull ID.
	 * @param {string} relPathToRoot Relative path to the root folder (folder
	 *      containing 'characters', 'common', 'damage', etc), which allows the urls to work even
	 *      in setups where the root folder is not necessarily the root in terms of the url.
	 *      Will only be used for resources that are stored in the repo.
	 * @returns The URL of the big thumbnail
	 */
	utils.getBigThumbnailUrl = function (n, relPathToRoot = "") {
		switch (n) {
			case "skullLuffy":
			case 9001:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_luffy_c.png";
				break;
			case "skullZoro":
			case 9002:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_zoro_c.png";
				break;
			case "skullNami":
			case 9003:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_nami_c.png";
				break;
			case "skullUsopp":
			case 9004:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_usopp_c.png";
				break;
			case "skullSanji":
			case 9005:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_sanji_c.png";
				break;
			case "skullChopper":
			case 9006:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_chopper_c.png";
				break;
			case "skullRobin":
			case 9007:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_robin_c.png";
				break;
			case "skullFranky":
			case 9008:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_franky_c.png";
				break;
			case "skullBrook":
			case 9009:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/skull_brook_c.png";
				break;
			case "skullSTR":
			case 9010:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/red_skull_c.png";
				break;
			case "skullQCK":
			case 9011:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/blue_skull_c.png";
				break;
			case "skullPSY":
			case 9012:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/yellow_skull2_c.png";
				break;
			case "skullDEX":
			case 9013:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/green_skull2_c.png";
				break;
			case "skullINT":
			case 9014:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/black_skull_c.png";
				break;
			case "skullJudge":
			case 9015:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c1.png";
				break;
			case "skullReiju":
			case 9016:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c2.png";
				break;
			case "skullIchiji":
			case 9017:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c3.png";
				break;
			case "skullNiji":
			case 9018:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c4.png";
				break;
			case "skullYonji":
			case 9019:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c5.png";
				break;
			case "skullDoffy":
			case 9020:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_c.png";
				break;
			case "skullEnel":
			case 9021:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/enel_skull_c.png";
				break;
			case "skullHiguma":
			case 9022:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/higuma_skull_c.png";
				break;
			case "skullSanji2":
			case 9023:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/sanji_skull_f.png";
				break;
			case "skullFrankie":
			case 9024:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/frankie_skull_c.png";
				break;
			case "skullCavendish":
			case 9025:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Cavendish_skull_c.png";
				break;
			case "skullDoflamingo":
			case 9026:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_c2.png";
				break;
			case "skullIchiji2":
			case 9027:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c6.png";
				break;
			case "skullNiji2":
			case 9028:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c7.png";
				break;
			case "skullYonji2":
			case 9029:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c8.png";
				break;
			case "skullReiju2":
			case 9030:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c9.png";
				break;
			case "skullHancock":
			case 9031:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/Hancock_skull_c.png";
				break;
			case "skullNami2":
			case 9032:
				return "https://onepiece-treasurecruise.com/wp-content/uploads/nami_skull_c.png";
				break;
		}
		if (window.units[n - 1].incomplete)
			return "https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png";
		var id = ("0000" + n).slice(-4).replace(/(057[54])/, "0$1"); // missing aokiji image
		switch (id) {
			//case '2262': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c5012.png'; break;
			//case '2263': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c5013.png'; break;
			//case '2500': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c2500.png'; break;
			//case '2685': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c10686.png'; break;
			//case '2686': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c10687.png'; break;
			//case '2772': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_10993.png'; break;
			//case '3327': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11333-.png'; break;
			//case '3333': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1719.png'; break;
			//case '3334': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1720.png'; break;
			//case '3370': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11102-1.png'; break;
			//case '3374': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11138.png'; break;
			//case '3384': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11138.png'; break;
			//case '4986': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1719.png'; break;
			//case '4987': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1720.png'; break;
			default:
				break;
		}

		return (
			relPathToRoot +
			"/api/images/full/transparent/" +
			Math.trunc(n / 1000) +
			"/" +
			Math.trunc((n % 1000) / 100) +
			"00/" +
			id +
			".png"
		);
		//return 'https://onepiece-treasurecruise.com/wp-content/uploads/c' + id + '.png';
	};

	utils.getThumbnailTitle = function (arg) {
		if (arg === null || arg === undefined) return null;
		if (arg.constructor == Object) {
			return [
				arg.name,
				"HP: " + arg.hp,
				"ATK: " + arg.atk,
				"RCV: " + arg.rcv,
				"CMB: " + arg.cmb,
			].join("\n");
		}
		var unit = arg.constructor == Object ? arg : units[arg];
		return [
			unit.name,
			"HP: " + unit.maxHP,
			"ATK: " + unit.maxATK,
			"RCV: " + unit.maxRCV,
			"CMB: " + unit.combo,
			"Cost: " + unit.cost,
		].join("\n");
	};

	utils.isClickOnOrb = function (e, target) {
		var x = e.offsetX,
			y = e.offsetY;
		var distance = Math.sqrt(Math.pow(x - 20, 2) + Math.pow(y - 21, 2));
		return distance < 13;
	};

	/* * * * * Misc functions * * * * */

	/* given an array of arrays, generates the cartesian product of
	 * all the arrays contained within the root array
	 * eg f([[1],[2,3],[4,5,6]]) -> [[1,2,4],[1,2,5],[1,2,6],[1,3,4],[1,3,5],[1,3,6]] */
	utils.arrayProduct = function (data) {
		var result = data.reduce(
			function (prev, next) {
				if (next.length === 0) return prev;
				return next
					.map(function (n) {
						return prev.map(function (p) {
							return p.concat([n]);
						});
					})
					.reduce(function (prev, next) {
						return prev.concat(next);
					}, []);
			},
			[[]]
		);
		return result.filter(function (r) {
			return r.length > 0;
		});
	};

	utils.getOppositeType = function (type) {
		if (!type) return null;
		type = type.toUpperCase();
		if (type == "STR") return "QCK";
		if (type == "QCK") return "DEX";
		if (type == "DEX") return "STR";
		if (type == "PSY") return "INT";
		return "PSY";
	};

	/* * * * * Searching/filtering * * * * */

	utils.getRegex = function (query) {
		try {
			return new RegExp(query, "i");
		} catch (e) {
			return new RegExp(
				query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
				"i"
			);
		}
	};

	utils.generateSearchParameters = function (query) {
		if (!query || query.trim().length < 2) return null;
		if (/^\d+$/.test(query)) {
			var n = parseInt(query, 10);
			if (n > 0 && n <= units.length) query = "id=" + query;
		}
		query = utils.normalizeText(query.toLowerCase().trim());
		var result = { matchers: {}, ranges: {}, query: [], queryTerms: [] };
		var ranges = {},
			params = [
				"hp",
				"atk",
				"stars",
				"cost",
				"growth",
				"rcv",
				"id",
				"slots",
				"combo",
				"exp",
				"minCD",
				"maxCD",
			];
		var regex = new RegExp(
			"^((type|class|family|notfamily|supports|units):(.+)|(" +
				params.join("|") +
				")(>|<|>=|<=|=)([-?\\d.]+))$",
			"i"
		);
		const typeRegex = /^(?:str|dex|qck|psy|int)$/;
		var tokens = query.replace(/&|\//g, " ").split(/\s+/);
		tokens.forEach(function (x) {
			x = x.replace(/_+/g, " ");
			var temp = x.match(regex);
			if (!temp) {
				// if it couldn't be parsed, treat it as string
				if (typeRegex.test(x)) {
					// if string is a unit type, treat it as `type:X`
					result.matchers["type"] = new RegExp(x, "i");
				} else {
					result.query.push(x);
					result.queryTerms.push(utils.getRegex(x));
				}
			} else if (temp[4] !== undefined) {
				// numeric operator
				var parameter = temp[4],
					op = temp[5],
					value = parseFloat(temp[6], 10);
				if (!result.ranges.hasOwnProperty(parameter)) {
					if (op === ">" || op === ">=") {
						result.ranges[parameter] = [0, Number.POSITIVE_INFINITY];
					} else if (op === "<" || op === "<=") {
						result.ranges[parameter] = [Number.NEGATIVE_INFINITY, 0];
					} else {
						result.ranges[parameter] = [
							Number.NEGATIVE_INFINITY,
							Number.POSITIVE_INFINITY,
						];
					}
				}
				if (op === "=") {
					result.ranges[parameter][0] = value;
					result.ranges[parameter][1] = value;
				} else if (op === "<") {
					result.ranges[parameter][1] = value - 1;
				} else if (op === "<=") {
					result.ranges[parameter][1] = value;
				} else if (op === ">") {
					result.ranges[parameter][0] = value + 1;
				} else if (op === ">=") {
					result.ranges[parameter][0] = value;
				}
			} else {
				// matcher (string operators)
				if (
					["supports", "units"].includes(temp[2]) &&
					/^[\d|]+$/.test(temp[3])
				) {
					// allow only IDs and `|` for a separator
					// split by `|` and make sure no empty elements are pushed
					let ids = temp[3]
						.split(/\|+/)
						.filter((x) => x.length > 0)
						.map(Number);
					if (ids.length == 0) return;
					if (!result.matchers[temp[2]]) result.matchers[temp[2]] = [];

					result.matchers[temp[2]].push(...ids);
				} else {
					result.matchers[temp[2]] = new RegExp(temp[3], "i");
				}
				//console.log(result.matchers); //Here for stuff to try to do custom
			}
		});
		if (result.query.length > 0) result.query = result.query.join(" ");
		else result.query = null;
		return result;
	};

	/**
	 * Checks a unit against a set of parameters generated by `Utils.generateSearchParameters`.
	 * Fuzzy search is not supported on this function. To implement fuzzy search, filter
	 * with fuzzy search first, then remove `queryTerms` from `searchParameters` before
	 * passing it into this function.
	 * @param {object|number} unit - Unit object to check. Get it from `window.units` after
	 * `Utils.parseUnits` is called. If a number is given, it should be the 1-based ID of the unit.
	 * @param {object} searchParameters - Object returned by `Utils.generateSearchParameters`
	 * @returns {boolean} True if given unit matches all parameters
	 */
	utils.checkUnitMatchSearchParameters = function (unit, searchParameters) {
		if (typeof unit === "number" && isFinite(unit))
			unit = window.units[unit - 1];

		// filter by matchers (string operators)
		for (let matcher in searchParameters.matchers) {
			let regex = searchParameters.matchers[matcher];
			if (matcher === "family") {
				if (
					!(unit.families && unit.families.some((family) => regex.test(family)))
				) {
					return false;
				}
			} else if (matcher === "notfamily") {
				if (
					unit.families &&
					unit.families.some((family) => regex.test(family))
				) {
					return false;
				}
			} else if (matcher === "supports") {
				let ids = regex; // `regex` is an array of IDs here
				if (!ids.some((id) => utils.canSupportUnit(id, unit))) return false;
			} else if (matcher === "units") {
				let ids = regex; // `regex` is an array of IDs here
				if (!ids.some((id) => id == unit.number + 1)) return false;
			} else if (!regex.test(unit[matcher])) {
				return false;
			}
		}

		// filter by ranges (numeric operators)
		for (let range in searchParameters.ranges) {
			let stat;
			range = range.toLowerCase();

			if (range == "id") {
				stat = unit.number + 1;
			} else if (range == "mincd" || range == "maxcd") {
				stat = window.cooldowns[unit.number];
				if (stat) stat = stat[range == "mincd" ? 0 : 1];
			} else {
				stat = unit[range] || unit[range] || unit["max" + range.toUpperCase()];
			}

			if (
				stat === null ||
				stat === undefined ||
				stat < searchParameters.ranges[range][0] ||
				stat > searchParameters.ranges[range][1]
			) {
				return false;
			}
		}

		// filter by queryTerms
		if (searchParameters.queryTerms && searchParameters.queryTerms.length > 0) {
			let name = Utils.getFullUnitName(unit.number + 1);
			// make sure all terms match
			if (!searchParameters.queryTerms.every((term) => term.test(name))) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Returns true if the supporting unit can support the given unit by
	 * recreating the query generated by "Search for supported characters" for
	 * `supportingUnit`. Requires `Utils.parseUnits` to be executed first.
	 * @param {number|object} unitToSupport - 1-based ID of the unit to support
	 * or the object from window.units[id - 1]
	 * @param {number|object} supportingUnit - 1-based ID of the supporting unit
	 * or the object from window.units[id - 1]
	 * @returns {boolean} true if the supporting unit can support the given unit.
	 */
	utils.canSupportUnit = function (unitToSupport, supportingUnit) {
		if (typeof unitToSupport === "number")
			unitToSupport = window.units[unitToSupport - 1];
		if (typeof supportingUnit === "number")
			supportingUnit = window.units[supportingUnit - 1];

		if (!unitToSupport || !supportingUnit) return false;

		if (!supportingUnit.support || !supportingUnit.support[0])
			// no support
			return false;

		// They should not have the same family. The supporting unit may have no
		// families if data is incomplete, in which case it won't be excluded
		// from the supporting units even though it may have the same family name
		//
		// The unitToSupport may also have no families (incomplete or fodder),
		// in which case supports that match a type, class, cost, or all chars
		// will work, but supports that match a family won't work.
		if (
			supportingUnit.families &&
			unitToSupport.families &&
			unitToSupport.families.some((fam) =>
				supportingUnit.families.includes(fam)
			)
		)
			return false;

		if (/^All characters?/i.test(supportingUnit.support[0].Characters))
			return true;

		// recreate the query generated for support units
		// make it returns search params instead of the query, so we save up on
		// parsing the query (no `utils.generateSearchParameters` call)
		let params = utils.generateSupportedCharactersQuery(
			supportingUnit.support[0].Characters,
			undefined,
			true
		);
		if (!params) return false;
		return utils.checkUnitMatchSearchParameters(unitToSupport, params);
	};

	utils.isFodder = function (unit) {
		return (
			(unit.stars < 2 && !utils.isEvolverBooster(unit)) ||
			FODDER_REGEX.test(unit.name)
		);
	};

	utils.isEvolverBooster = function (unit) {
		return /Evolver|Booster/i.test(unit.class);
	};

	utils.searchBaseForms = function (id) {
		if (!reverseEvoMap) generateReverseEvoMap();
		if (!reverseEvoMap[id]) return null;
		return reverseEvoMap[id];
	};

	var updateEvoMap = function (from, to, via) {
		if (!reverseEvoMap[to]) reverseEvoMap[to] = {};
		if (!reverseEvoMap[to][from]) reverseEvoMap[to][from] = [];
		reverseEvoMap[to][from].push(via);
	};

	/**
	 * @returns {Object} Reverse map (lazy-instantiated) of window.families where
	 * the keys are the family names and the values are arrays of the unit ids
	 * that have the given family name.
	 */
	utils.getReverseFamilyMap = function () {
		if (reverseFamilyMap) return reverseFamilyMap;

		reverseFamilyMap = {};
		for (let id in window.families) {
			id = Number(id);
			let families = window.families[id];
			if (!families) continue;
			for (const family of families) {
				if (!(family in reverseFamilyMap)) {
					reverseFamilyMap[family] = [];
				}
				reverseFamilyMap[family].push(id);
			}
		}
		return reverseFamilyMap;
	};

	var generateReverseEvoMap = function () {
		reverseEvoMap = {};
		for (var evo in evolutions) {
			var from = parseInt(evo, 10);
			if (evolutions[evo].evolution.constructor != Array)
				updateEvoMap(from, evolutions[evo].evolution, evolutions[evo].evolvers);
			else
				for (var i = 0; i < evolutions[evo].evolution.length; ++i)
					updateEvoMap(
						from,
						evolutions[evo].evolution[i],
						evolutions[evo].evolvers[i]
					);
		}
	};

	/* * * * * Body * * * * */

	window.Utils = utils;
})();
