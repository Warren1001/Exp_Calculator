
const debug = true;

const INT_31_MAX = 2147483648;
const EXP_CAP = 8388607;
const EXP_ROLLOVER_0 = 1048576 / 2;
const EXP_ROLLOVER_1 = 1048576;
const EXP_ROLLOVER_2 = 2097152;

const monLvls = [
	117, 156, 197, 234, 273, 
	311, 351, 390, 428, 468, 
	507, 545, 602, 660, 723, 
	800, 876, 966, 1062, 1169, 
	1286, 1413, 1553, 1709, 1830, 
	1958, 2096, 2241, 2397, 2564, 
	2748, 2937, 3146, 3362, 3599, 
	3852, 4118, 4409, 4716, 5048, 
	5400, 5778, 6182, 6614, 7077, 
	7577, 8103, 8675, 9279, 9927, 
	10620, 11259, 11934, 12653, 13413, 
	14216, 15066, 15971, 16929, 17946, 
	19020, 20163, 21374, 22656, 24015, 
	25374, 26733, 28092, 29451, 30810, 
	32169, 33528, 34887, 36246, 37605, 
	38964, 40323, 41682, 43041, 44400, 
	45759, 47118, 48477, 49836, 51195, 
	52554, 53913, 55272, 56631, 57990, 
	59349, 60708, 62067, 63426, 64785, 
	66144, 67503, 68862, 70221, 71580, 
	72939, 74298, 75657, 77016, 78375, 
	79734, 81093, 82452, 83811, 160000
];

export function calculateExperience(monExp, multiplier, playerAmount, partyAmount, totalPartyLevel, yourLevel, baseMonLevel, actualMonLevel, expGained, terror) {
	//console.log("monExp=", monExp, ",playerAmount=", playerAmount, ",partyAmount=", partyAmount, ",totalPartyLevel=", totalPartyLevel, ",yourLevel=", yourLevel, ",monLevel=", monLevel, ",expGained=", expGained);
	let baseExp = Math.floor(monExp * monLvls[baseMonLevel - 1] / 100);
	//console.log("baseExp=", baseExp);
	let baseExpMulti = baseExp * multiplier;
	//console.log("baseExpMulti=", baseExpMulti);
	let playerCountExp = Math.floor(baseExpMulti * ((playerAmount + 1) / 2));
	//console.log("playerCountExp=", playerCountExp);
	let partyBonusNumerator = playerCountExp * 89 * (partyAmount - 1);
	let forceOverflowNumerator = partyBonusNumerator % INT_31_MAX;
	if (trun(partyBonusNumerator / INT_31_MAX) % 2 != 0) forceOverflowNumerator -= INT_31_MAX;
	let forceOverflow = trun(forceOverflowNumerator / 256);
	let addPartyBonus = playerCountExp + forceOverflow;
	let partyCountExp = Math.max(1, addPartyBonus);
	//console.log("partyCountExp=", partyCountExp);
	let partyCountDividedExp = trun(partyCountExp * (yourLevel / totalPartyLevel)); // TODO
	let ceilingExp = Math.min(partyCountDividedExp, EXP_CAP);
	//console.log("ceilingExp=", ceilingExp);
	let levelDiff = actualMonLevel - yourLevel;
	let levelDiffPenaltyDenominator;
	let levelDiffPenaltyNumerator;
	if (yourLevel < 25) {
		levelDiffPenaltyDenominator = 256;
		if (levelDiff < -9) levelDiffPenaltyNumerator = 13;
		else if (levelDiff == -9) levelDiffPenaltyNumerator = 61;
		else if (levelDiff == -8) levelDiffPenaltyNumerator = 110;
		else if (levelDiff == -7) levelDiffPenaltyNumerator = 159;
		else if (levelDiff == -6) levelDiffPenaltyNumerator = 207;
		else if (levelDiff >= -5 && levelDiff <= 5) levelDiffPenaltyNumerator = 256;
		else if (levelDiff == 6) levelDiffPenaltyNumerator = 225;
		else if (levelDiff == 7) levelDiffPenaltyNumerator = 174;
		else if (levelDiff == 8) levelDiffPenaltyNumerator = 92;
		else if (levelDiff == 9) levelDiffPenaltyNumerator = 38;
		else if (levelDiff > 9) levelDiffPenaltyNumerator = 5;
	} else {
		if (actualMonLevel > yourLevel) {
			levelDiffPenaltyDenominator = actualMonLevel;
			levelDiffPenaltyNumerator = yourLevel;
		} else {
			levelDiffPenaltyDenominator = 256;
			if (levelDiff < -9) levelDiffPenaltyNumerator = 13;
			else if (levelDiff == -9) levelDiffPenaltyNumerator = 61;
			else if (levelDiff == -8) levelDiffPenaltyNumerator = 110;
			else if (levelDiff == -7) levelDiffPenaltyNumerator = 159;
			else if (levelDiff == -6) levelDiffPenaltyNumerator = 207;
			else levelDiffPenaltyNumerator = 256;
		}
	}
	let levelDiffExp;
	if (ceilingExp > EXP_ROLLOVER_1) {
		levelDiffExp = Math.max(1, Math.floor(ceilingExp / levelDiffPenaltyDenominator) * levelDiffPenaltyNumerator);
	} else {
		levelDiffExp = Math.max(1, Math.floor(ceilingExp * levelDiffPenaltyNumerator / levelDiffPenaltyDenominator));
	}
	//console.log("levelDiffExp=", levelDiffExp);
	let charDiffExp;
	if (yourLevel < 70) {
		charDiffExp = levelDiffExp;
	} else {
		let charDiffDenominator = 1024;
		let charDiffNumerator;
		if (yourLevel == 70) charDiffNumerator = 976;
		else if (yourLevel == 71) charDiffNumerator = 928;
		else if (yourLevel == 72) charDiffNumerator = 880;
		else if (yourLevel == 73) charDiffNumerator = 832;
		else if (yourLevel == 74) charDiffNumerator = 784;
		else if (yourLevel == 75) charDiffNumerator = 736;
		else if (yourLevel == 76) charDiffNumerator = 688;
		else if (yourLevel == 77) charDiffNumerator = 640;
		else if (yourLevel == 78) charDiffNumerator = 592;
		else if (yourLevel == 79) charDiffNumerator = 544;
		else if (yourLevel == 80) charDiffNumerator = 496;
		else if (yourLevel == 81) charDiffNumerator = 448;
		else if (yourLevel == 82) charDiffNumerator = 400;
		else if (yourLevel == 83) charDiffNumerator = 352;
		else if (yourLevel == 84) charDiffNumerator = 304;
		else if (yourLevel == 85) charDiffNumerator = 256;
		else if (yourLevel == 86) charDiffNumerator = 192;
		else if (yourLevel == 87) charDiffNumerator = 144;
		else if (yourLevel == 88) charDiffNumerator = 108;
		else if (yourLevel == 89) charDiffNumerator = 81;
		else if (yourLevel == 90) charDiffNumerator = 61;
		else if (yourLevel == 91) charDiffNumerator = 46;
		else if (yourLevel == 92) charDiffNumerator = 35;
		else if (yourLevel == 93) charDiffNumerator = 26;
		else if (yourLevel == 94) charDiffNumerator = 20;
		else if (yourLevel == 95) charDiffNumerator = 15;
		else if (yourLevel == 96) charDiffNumerator = 11;
		else if (yourLevel == 97) charDiffNumerator = 8;
		else if (yourLevel == 98) charDiffNumerator = 6;
		else if (yourLevel == 99) charDiffNumerator = 5;
		else charDiffNumerator = -1; // impossible
		if (levelDiffExp > EXP_ROLLOVER_2) {
			charDiffExp = Math.max(1, Math.floor(levelDiffExp / charDiffDenominator) * charDiffNumerator);
		} else {
			charDiffExp = Math.max(1, Math.floor(levelDiffExp * charDiffNumerator / charDiffDenominator));
		}
	}
	//console.log("charDiffExp=", charDiffExp);
	let finalExp;
	if (charDiffExp > EXP_ROLLOVER_1) {
		finalExp = charDiffExp + Math.floor(charDiffExp / 100) * expGained;
	} else {
		finalExp = charDiffExp + Math.floor(charDiffExp * expGained / 100);
	}
	let finalFinalExp;
	/*if (finalExp > EXP_ROLLOVER_0) {
		finalFinalExp = finalExp + Math.floor(finalExp / 100) * 25;
	} else {
		finalFinalExp = finalExp + Math.floor(finalExp * 25 / 100);
	}*/
	finalFinalExp = finalExp + Math.floor(finalExp * 25 / 100); // TODO close but wrong
	//finalFinalExp = finalExp + Math.floor(finalExp / 100) * 25;
	//console.log("finalExp=", finalExp);
	return terror ? finalFinalExp : finalExp;
}

function trun(number) {
	if (number == -0) number = 0;
	return number >= 0 ? Math.floor(number) : Math.ceil(number);
}

const container = {
	TABLE: document.getElementById("tableContainer"),

	PARTY_LEVEL_1: document.getElementById("partyLevel1Container"),
	PARTY_LEVEL_2: document.getElementById("partyLevel2Container"),
	PARTY_LEVEL_3: document.getElementById("partyLevel3Container"),
	PARTY_LEVEL_4: document.getElementById("partyLevel4Container"),
	PARTY_LEVEL_5: document.getElementById("partyLevel5Container"),
	PARTY_LEVEL_6: document.getElementById("partyLevel6Container"),
	PARTY_LEVEL_7: document.getElementById("partyLevel7Container")
}

const number = {
	YOUR_LEVEL: document.getElementById("yourLevel"),
	PLAYER_AMOUNT: document.getElementById("playerAmount"),
	PARTY_AMOUNT: document.getElementById("partyAmount"),
	EXP_GAINED: document.getElementById("expGained"),

	PARTY_LEVEL_1: document.getElementById("partyLevel1"),
	PARTY_LEVEL_2: document.getElementById("partyLevel2"),
	PARTY_LEVEL_3: document.getElementById("partyLevel3"),
	PARTY_LEVEL_4: document.getElementById("partyLevel4"),
	PARTY_LEVEL_5: document.getElementById("partyLevel5"),
	PARTY_LEVEL_6: document.getElementById("partyLevel6"),
	PARTY_LEVEL_7: document.getElementById("partyLevel7")
}

export function setupInputElement(element, eventListener) {
    if (element.type == "button") {
        element.addEventListener("click", eventListener, false);
    } else {
        element.addEventListener("change", eventListener, false);
        if (element.type == "number") {
            element.onkeydown = function (e) { // only allows the input of numbers, no negative signs
                if (!((e.keyCode > 95 && e.keyCode < 106) || (e.keyCode > 47 && e.keyCode < 58) || e.keyCode == 8)) {
                    return false;
                }
            }
        }
    }
	return element;
}

export function setupUpdateTableInputElements(eventListener) {
    setupInputElement(number.YOUR_LEVEL, eventListener);
    setupInputElement(number.PLAYER_AMOUNT, eventListener);
	setupInputElement(number.PARTY_AMOUNT, eventListener);
	setupInputElement(number.EXP_GAINED, eventListener);
	setupInputElement(number.PARTY_LEVEL_1, eventListener);
	setupInputElement(number.PARTY_LEVEL_2, eventListener);
	setupInputElement(number.PARTY_LEVEL_3, eventListener);
	setupInputElement(number.PARTY_LEVEL_4, eventListener);
	setupInputElement(number.PARTY_LEVEL_5, eventListener);
	setupInputElement(number.PARTY_LEVEL_6, eventListener);
	setupInputElement(number.PARTY_LEVEL_7, eventListener);
}

export class MonsterEntry {

	constructor(monId, monName, monExp, levelName, areaLevel) {
		this.monId = monId;
		this.monName = monName;
		this.monExp = monExp;
		this.levelName = levelName;
		this.areaLevel = areaLevel;
	}

	setTableCells(origNormExpCell, origChampExpCell, origUniExpCell,
			terrNormExpCell, terrChampExpCell, terrUniExpCell) {
		this.origNormExpCell = origNormExpCell;
		this.origChampExpCell = origChampExpCell;
		this.origUniExpCell = origUniExpCell;
		this.terrNormExpCell = terrNormExpCell;
		this.terrChampExpCell = terrChampExpCell;
		this.terrUniExpCell = terrUniExpCell;
	}

	update(yourLevel, playerAmount, partyAmount, totalPartyLevel, expGained) {
		this.origNormExpCell.innerHTML = calculateExperience(this.monExp, 1, playerAmount, partyAmount, totalPartyLevel, yourLevel, this.areaLevel, this.areaLevel, expGained, false);
		this.origChampExpCell.innerHTML = calculateExperience(this.monExp, 3, playerAmount, partyAmount, totalPartyLevel, yourLevel, this.areaLevel, this.areaLevel + 2, expGained, false);
		this.origUniExpCell.innerHTML = calculateExperience(this.monExp, 5, playerAmount, partyAmount, totalPartyLevel, yourLevel, this.areaLevel, this.areaLevel + 3, expGained, false);
		let terrorAreaLevel = Math.min(96, Math.max(this.areaLevel, yourLevel) + 2);
		this.terrNormExpCell.innerHTML = calculateExperience(this.monExp, 1, playerAmount, partyAmount, totalPartyLevel, yourLevel, terrorAreaLevel, terrorAreaLevel, expGained, true);
		this.terrChampExpCell.innerHTML = calculateExperience(this.monExp, 3, playerAmount, partyAmount, totalPartyLevel, yourLevel, terrorAreaLevel, Math.min(98, Math.max(this.areaLevel, yourLevel) + 4), expGained, true);
		this.terrUniExpCell.innerHTML = calculateExperience(this.monExp, 5, playerAmount, partyAmount, totalPartyLevel, yourLevel, terrorAreaLevel, Math.min(99, Math.max(this.areaLevel, yourLevel) + 5), expGained, true);
	}

}

const data = [
	new MonsterEntry("zombie1", "Zombie", 105, "Blood Moor", 67),
	new MonsterEntry("fallen1", "Fallen", 65, "Blood Moor", 67),
	new MonsterEntry("quillrat1", "Quill Rat", 70, "Blood Moor", 67),
	new MonsterEntry("brute1", "Gargantuan Beast", 120, "Cold Plains", 68),
	new MonsterEntry("corruptrogue1", "Dark Hunter", 95, "Cold Plains", 68),
	new MonsterEntry("fallenshaman1", "Fallen Shaman", 150, "Cold Plains", 68),
	new MonsterEntry("cr_lancer1", "Dark Spearwoman", 85, "Cold Plains", 68),
	new MonsterEntry("skeleton1", "Skeleton", 85, "Stony Field", 68),
	new MonsterEntry("zombie2", "Hungry Dead", 105, "Stony Field", 68),
	new MonsterEntry("crownest1", "Foul Crow Nest", 300, "Stony Field", 68),
	new MonsterEntry("goatman1", "Moon Clan", 90, "Stony Field", 68),
	new MonsterEntry("cr_archer1", "Dark Ranger", 100, "Stony Field", 68),
	new MonsterEntry("fallen2", "Carver", 65, "Dark Wood", 68),
	new MonsterEntry("corruptrogue2", "Vile Hunter", 95, "Dark Wood", 68),
	new MonsterEntry("quillrat2", "Spike Fiend", 70, "Dark Wood", 68),
	new MonsterEntry("cr_lancer2", "Vile Lancer", 85, "Dark Wood", 68),
	new MonsterEntry("sk_archer1", "Skeleton Archer", 95, "Dark Wood", 68),
	new MonsterEntry("crownest2", "Blood Hawk Nest", 300, "Black Marsh", 69),
	new MonsterEntry("skeleton2", "Returned", 85, "Black Marsh", 69),
	new MonsterEntry("brute2", "Brute", 120, "Black Marsh", 69),
	new MonsterEntry("goatman2", "Night Clan", 90, "Black Marsh", 69),
	new MonsterEntry("fallenshaman2", "Carver Shaman", 150, "Black Marsh", 69),
	new MonsterEntry("cr_archer2", "Vile Archer", 100, "Black Marsh", 69),
	new MonsterEntry("zombie1", "Zombie", 105, "Den of Evil", 79),
	new MonsterEntry("brute1", "Gargantuan Beast", 120, "Den of Evil", 79),
	new MonsterEntry("fallenshaman1", "Fallen Shaman", 150, "Den of Evil", 79),
	new MonsterEntry("skeleton1", "Skeleton", 85, "Cave Level 1", 77),
	new MonsterEntry("zombie2", "Hungry Dead", 105, "Cave Level 1", 77),
	new MonsterEntry("cr_archer1", "Dark Ranger", 100, "Cave Level 1", 77),
	new MonsterEntry("skeleton1", "Skeleton", 85, "Cave Level 2", 78),
	new MonsterEntry("zombie2", "Hungry Dead", 105, "Cave Level 2", 78),
	new MonsterEntry("cr_archer1", "Dark Ranger", 100, "Cave Level 2", 78),
	new MonsterEntry("skeleton1", "Skeleton", 85, "Burial Grounds", 80),
	new MonsterEntry("zombie2", "Hungry Dead", 105, "Burial Grounds", 80),
	new MonsterEntry("skeleton1", "Skeleton", 85, "Crypt", 83),
	new MonsterEntry("zombie2", "Hungry Dead", 105, "Crypt", 83),
	new MonsterEntry("skeleton1", "Skeleton", 85, "Mausoleum", 85),
	new MonsterEntry("zombie2", "Hungry Dead", 105, "Mausoleum", 85),
	new MonsterEntry("fallen3", "Devilkin", 65, "Tower Cellar Level 1", 75),
	new MonsterEntry("wraith1", "Ghost", 105, "Tower Cellar Level 1", 75),
	new MonsterEntry("goatman3", "Blood Clan", 90, "Tower Cellar Level 1", 75),
	new MonsterEntry("cr_archer3", "Dark Archer", 100, "Tower Cellar Level 1", 75),
	new MonsterEntry("fallen3", "Devilkin", 65, "Tower Cellar Level 2", 76),
	new MonsterEntry("wraith1", "Ghost", 105, "Tower Cellar Level 2", 76),
	new MonsterEntry("goatman3", "Blood Clan", 90, "Tower Cellar Level 2", 76),
	new MonsterEntry("cr_archer3", "Dark Archer", 100, "Tower Cellar Level 2", 76),
	new MonsterEntry("fallen3", "Devilkin", 65, "Tower Cellar Level 3", 77),
	new MonsterEntry("wraith1", "Ghost", 105, "Tower Cellar Level 3", 77),
	new MonsterEntry("goatman3", "Blood Clan", 90, "Tower Cellar Level 3", 77),
	new MonsterEntry("cr_archer3", "Dark Archer", 100, "Tower Cellar Level 3", 77),
	new MonsterEntry("fallen3", "Devilkin", 65, "Tower Cellar Level 4", 78),
	new MonsterEntry("wraith1", "Ghost", 105, "Tower Cellar Level 4", 78),
	new MonsterEntry("goatman3", "Blood Clan", 90, "Tower Cellar Level 4", 78),
	new MonsterEntry("cr_archer3", "Dark Archer", 100, "Tower Cellar Level 4", 78),
	new MonsterEntry("fallen3", "Devilkin", 65, "Tower Cellar Level 5", 79),
	new MonsterEntry("wraith1", "Ghost", 105, "Tower Cellar Level 5", 79),
	new MonsterEntry("goatman3", "Blood Clan", 90, "Tower Cellar Level 5", 79),
	new MonsterEntry("cr_archer3", "Dark Archer", 100, "Tower Cellar Level 5", 79),
	new MonsterEntry("fallen4", "Dark One", 65, "Jail Level 1", 71),
	new MonsterEntry("wraith2", "Wraith", 105, "Jail Level 1", 71),
	new MonsterEntry("goatman5", "Death Clan", 90, "Jail Level 1", 71),
	new MonsterEntry("sk_archer3", "Bone Archer", 95, "Jail Level 1", 71),
	new MonsterEntry("skmage_fire2", "Bone Mage", 110, "Jail Level 1", 71),
	new MonsterEntry("fallen4", "Dark One", 65, "Jail Level 2", 71),
	new MonsterEntry("wraith2", "Wraith", 105, "Jail Level 2", 71),
	new MonsterEntry("goatman5", "Death Clan", 90, "Jail Level 2", 71),
	new MonsterEntry("sk_archer3", "Bone Archer", 95, "Jail Level 2", 71),
	new MonsterEntry("skmage_fire2", "Bone Mage", 110, "Jail Level 2", 71),
	new MonsterEntry("fallen4", "Dark One", 65, "Jail Level 3", 71),
	new MonsterEntry("wraith2", "Wraith", 105, "Jail Level 3", 71),
	new MonsterEntry("goatman5", "Death Clan", 90, "Jail Level 3", 71),
	new MonsterEntry("sk_archer3", "Bone Archer", 95, "Jail Level 3", 71),
	new MonsterEntry("skmage_ltng2", "Bone Mage", 110, "Jail Level 3", 71),
	new MonsterEntry("bighead2", "Tainted", 125, "Cathedral", 72),
	new MonsterEntry("wraith2", "Wraith", 105, "Cathedral", 72),
	new MonsterEntry("fallenshaman4", "Dark Shaman", 150, "Cathedral", 72),
	new MonsterEntry("bighead2", "Tainted", 125, "Catacombs Level 1", 72),
	new MonsterEntry("fallenshaman4", "Dark Shaman", 150, "Catacombs Level 1", 72),
	new MonsterEntry("fetish1", "Rat Man", 75, "Catacombs Level 1", 72),
	new MonsterEntry("bighead2", "Tainted", 125, "Catacombs Level 2", 73),
	new MonsterEntry("fallenshaman4", "Dark Shaman", 150, "Catacombs Level 2", 73),
	new MonsterEntry("arach1", "Arach", 110, "Catacombs Level 2", 73),
	new MonsterEntry("zombie3", "Ghoul", 105, "Catacombs Level 3", 73),
	new MonsterEntry("bighead1", "Afflicted", 125, "Catacombs Level 3", 73),
	new MonsterEntry("vampire5", "Banished", 150, "Catacombs Level 3", 73),
	new MonsterEntry("zombie3", "Ghoul", 105, "Catacombs Level 4", 73),
	new MonsterEntry("bighead1", "Afflicted", 125, "Catacombs Level 4", 73),
	new MonsterEntry("skeleton2", "Returned", 85, "Tristram", 76),
	new MonsterEntry("goatman2", "Night Clan", 90, "Tristram", 76),
	new MonsterEntry("fallenshaman2", "Carver Shaman", 150, "Tristram", 76),
	new MonsterEntry("sk_archer1", "Skeleton Archer", 95, "Tristram", 76),
	new MonsterEntry("hellbovine", "Hell Bovine", 80, "Moo Moo Farm", 81),
	new MonsterEntry("sandleaper1", "Sand Leaper", 95, "Rocky Waste", 75),
	new MonsterEntry("pantherwoman1", "Huntress", 80, "Rocky Waste", 75),
	new MonsterEntry("scarab1", "Dung Soldier", 125, "Rocky Waste", 75),
	new MonsterEntry("vulture1", "Carrion Bird", 80, "Rocky Waste", 75),
	new MonsterEntry("slinger1", "Slinger", 80, "Rocky Waste", 75),
	new MonsterEntry("sandleaper2", "Cave Leaper", 95, "Dry Hills", 76),
	new MonsterEntry("pantherwoman2", "Saber Cat", 80, "Dry Hills", 76),
	new MonsterEntry("vulture2", "Undead Scavenger", 80, "Dry Hills", 76),
	new MonsterEntry("slinger5", "Spear Cat", 100, "Dry Hills", 76),
	new MonsterEntry("crownest3", "Black Vulture Nest", 300, "Far Oasis", 76),
	new MonsterEntry("sandmaggot1", "Sand Maggot", 125, "Far Oasis", 76),
	new MonsterEntry("swarm1", "Itchies", 60, "Far Oasis", 76),
	new MonsterEntry("scarab2", "Sand Warrior", 125, "Far Oasis", 76),
	new MonsterEntry("vulture2", "Undead Scavenger", 80, "Far Oasis", 76),
	new MonsterEntry("zombie5", "Plague Bearer", 105, "Lost City", 77),
	new MonsterEntry("sandraider2", "Marauder", 130, "Lost City", 77),
	new MonsterEntry("sandleaper3", "Tomb Creeper", 95, "Lost City", 77),
	new MonsterEntry("pantherwoman3", "Night Tiger", 80, "Lost City", 77),
	new MonsterEntry("slinger6", "Night Slinger", 100, "Lost City", 77),
	new MonsterEntry("clawviper2", "Claw Viper", 100, "Valley of Snakes", 77),
	new MonsterEntry("clawviper3", "Salamander", 100, "Valley of Snakes", 77),
	new MonsterEntry("mummy3", "Embalmed", 100, "Valley of Snakes", 77),
	new MonsterEntry("unraveler2", "Guardian", 300, "Valley of Snakes", 77),
	new MonsterEntry("skeleton4", "Burning Dead", 85, "Sewers Level 1", 74),
	new MonsterEntry("sandraider1", "Sand Raider", 130, "Sewers Level 1", 74),
	new MonsterEntry("mummy1", "Dried Corpse", 100, "Sewers Level 1", 74),
	new MonsterEntry("sk_archer4", "Burning Dead Archer", 95, "Sewers Level 1", 74),
	new MonsterEntry("skeleton4", "Burning Dead", 85, "Sewers Level 2", 74),
	new MonsterEntry("sandraider1", "Sand Raider", 130, "Sewers Level 2", 74),
	new MonsterEntry("mummy1", "Dried Corpse", 100, "Sewers Level 2", 74),
	new MonsterEntry("sk_archer4", "Burning Dead Archer", 95, "Sewers Level 2", 74),
	new MonsterEntry("skeleton4", "Burning Dead", 85, "Sewers Level 3", 75),
	new MonsterEntry("pantherwoman1", "Huntress", 80, "Sewers Level 3", 75),
	new MonsterEntry("mummy1", "Dried Corpse", 100, "Sewers Level 3", 75),
	new MonsterEntry("skmage_fire3", "Burning Dead Mage", 110, "Sewers Level 3", 75),
	new MonsterEntry("sandraider3", "Invader", 130, "Harem Level 2", 78),
	new MonsterEntry("baboon1", "Dune Beast", 110, "Harem Level 2", 78),
	new MonsterEntry("sk_archer5", "Horror Archer", 95, "Harem Level 2", 78),
	new MonsterEntry("blunderbore1", "Blunderbore", 130, "Harem Level 2", 78),
	new MonsterEntry("skmage_cold4", "Horror Mage", 110, "Harem Level 2", 78),
	new MonsterEntry("sandraider3", "Invader", 130, "Palace Cellar Level 1", 78),
	new MonsterEntry("baboon1", "Dune Beast", 110, "Palace Cellar Level 1", 78),
	new MonsterEntry("sk_archer5", "Horror Archer", 95, "Palace Cellar Level 1", 78),
	new MonsterEntry("blunderbore1", "Blunderbore", 130, "Palace Cellar Level 1", 78),
	new MonsterEntry("skmage_fire4", "Horror Mage", 110, "Palace Cellar Level 1", 78),
	new MonsterEntry("sandraider3", "Invader", 130, "Palace Cellar Level 2", 78),
	new MonsterEntry("baboon1", "Dune Beast", 110, "Palace Cellar Level 2", 78),
	new MonsterEntry("sk_archer5", "Horror Archer", 95, "Palace Cellar Level 2", 78),
	new MonsterEntry("blunderbore1", "Blunderbore", 130, "Palace Cellar Level 2", 78),
	new MonsterEntry("skmage_pois4", "Horror Mage", 110, "Palace Cellar Level 2", 78),
	new MonsterEntry("sandraider3", "Invader", 130, "Palace Cellar Level 3", 78),
	new MonsterEntry("baboon1", "Dune Beast", 110, "Palace Cellar Level 3", 78),
	new MonsterEntry("sk_archer5", "Horror Archer", 95, "Palace Cellar Level 3", 78),
	new MonsterEntry("blunderbore1", "Blunderbore", 130, "Palace Cellar Level 3", 78),
	new MonsterEntry("skmage_ltng4", "Horror Mage", 110, "Palace Cellar Level 3", 78),
	new MonsterEntry("skeleton5", "Horror", 85, "Stony Tomb Level 1", 85),
	new MonsterEntry("scarab1", "Dung Soldier", 125, "Stony Tomb Level 1", 85),
	new MonsterEntry("skmage_ltng3", "Burning Dead Mage", 110, "Stony Tomb Level 1", 85),
	new MonsterEntry("mummy2", "Decayed", 100, "Halls of the Dead Level 1", 79),
	new MonsterEntry("unraveler1", "Hollow One", 300, "Halls of the Dead Level 1", 79),
	new MonsterEntry("batdemon1", "Desert Wing", 80, "Halls of the Dead Level 1", 79),
	new MonsterEntry("slinger2", "Spear Cat", 80, "Halls of the Dead Level 1", 79),
	new MonsterEntry("mummy2", "Decayed", 100, "Halls of the Dead Level 2", 81),
	new MonsterEntry("unraveler1", "Hollow One", 300, "Halls of the Dead Level 2", 81),
	new MonsterEntry("batdemon1", "Desert Wing", 80, "Halls of the Dead Level 2", 81),
	new MonsterEntry("slinger2", "Spear Cat", 80, "Halls of the Dead Level 2", 81),
	new MonsterEntry("clawviper2", "Claw Viper", 100, "Claw Viper Temple Level 1", 82),
	new MonsterEntry("clawviper3", "Salamander", 100, "Claw Viper Temple Level 1", 82),
	new MonsterEntry("mummy3", "Embalmed", 100, "Claw Viper Temple Level 1", 82),
	new MonsterEntry("unraveler2", "Guardian", 300, "Claw Viper Temple Level 1", 82),
	new MonsterEntry("skeleton5", "Horror", 85, "Stony Tomb Level 2", 85),
	new MonsterEntry("scarab1", "Dung Soldier", 125, "Stony Tomb Level 2", 85),
	new MonsterEntry("skmage_pois3", "Burning Dead Mage", 110, "Stony Tomb Level 2", 85),
	new MonsterEntry("mummy2", "Decayed", 100, "Halls of the Dead Level 3", 82),
	new MonsterEntry("unraveler1", "Hollow One", 300, "Halls of the Dead Level 3", 82),
	new MonsterEntry("batdemon1", "Desert Wing", 80, "Halls of the Dead Level 3", 82),
	new MonsterEntry("slinger2", "Spear Cat", 80, "Halls of the Dead Level 3", 82),
	new MonsterEntry("clawviper2", "Claw Viper", 100, "Claw Viper Temple Level 2", 83),
	new MonsterEntry("clawviper3", "Salamander", 100, "Claw Viper Temple Level 2", 83),
	new MonsterEntry("mummy3", "Embalmed", 100, "Claw Viper Temple Level 2", 83),
	new MonsterEntry("unraveler2", "Guardian", 300, "Claw Viper Temple Level 2", 83),
	new MonsterEntry("sandmaggot1", "Sand Maggot", 125, "Maggot Lair Level 1", 84),
	new MonsterEntry("sandmaggot2", "Rock Worm", 125, "Maggot Lair Level 1", 84),
	new MonsterEntry("swarm2", "Black Locusts", 60, "Maggot Lair Level 1", 84),
	new MonsterEntry("scarab2", "Sand Warrior", 125, "Maggot Lair Level 1", 84),
	new MonsterEntry("scarab3", "Scarab", 125, "Maggot Lair Level 1", 84),
	new MonsterEntry("sandmaggot1", "Sand Maggot", 125, "Maggot Lair Level 2", 84),
	new MonsterEntry("sandmaggot2", "Rock Worm", 125, "Maggot Lair Level 2", 84),
	new MonsterEntry("swarm2", "Black Locusts", 60, "Maggot Lair Level 2", 84),
	new MonsterEntry("scarab2", "Sand Warrior", 125, "Maggot Lair Level 2", 84),
	new MonsterEntry("scarab3", "Scarab", 125, "Maggot Lair Level 2", 84),
	new MonsterEntry("sandmaggot1", "Sand Maggot", 125, "Maggot Lair Level 3", 85),
	new MonsterEntry("sandmaggot2", "Rock Worm", 125, "Maggot Lair Level 3", 85),
	new MonsterEntry("swarm2", "Black Locusts", 60, "Maggot Lair Level 3", 85),
	new MonsterEntry("scarab2", "Sand Warrior", 125, "Maggot Lair Level 3", 85),
	new MonsterEntry("scarab3", "Scarab", 125, "Maggot Lair Level 3", 85),
	new MonsterEntry("wraith4", "Apparition", 105, "Tal Rasha's Tomb", 80),
	new MonsterEntry("scarab4", "Steel Weevil", 125, "Tal Rasha's Tomb", 80),
	new MonsterEntry("mummy4", "Preserved Dead", 100, "Tal Rasha's Tomb", 80),
	new MonsterEntry("unraveler3", "Unraveler", 300, "Tal Rasha's Tomb", 80),
	new MonsterEntry("vampire1", "Ghoul Lord", 150, "Tal Rasha's Tomb", 80),
	new MonsterEntry("blunderbore2", "Gorbelly", 130, "Tal Rasha's Tomb", 80),
	new MonsterEntry("wraith3", "Specter", 105, "Arcane Sanctuary", 79),
	new MonsterEntry("goatman4", "Hell Clan", 90, "Arcane Sanctuary", 79),
	new MonsterEntry("vampire1", "Ghoul Lord", 150, "Arcane Sanctuary", 79),
	new MonsterEntry("baboon3", "Jungle Hunter", 110, "Spider Forest", 79),
	new MonsterEntry("mosquito1", "Sucker", 75, "Spider Forest", 79),
	new MonsterEntry("thornhulk1", "Thorned Hulk", 130, "Spider Forest", 79),
	new MonsterEntry("fetish2", "Fetish", 75, "Spider Forest", 79),
	new MonsterEntry("fetishblow2", "Fetish", 90, "Spider Forest", 79),
	new MonsterEntry("foulcrow4", "Cloud Stalker", 40, "Spider Forest", 79),
	new MonsterEntry("fetish3", "Flayer", 75, "Flayer Jungle", 80),
	new MonsterEntry("fetishshaman3", "Flayer Shaman", 260, "Flayer Jungle", 80),
	new MonsterEntry("fetish4", "Soul Killer", 75, "Flayer Jungle", 80),
	new MonsterEntry("fetishshaman4", "Soul Killer Shaman", 260, "Flayer Jungle", 80),
	new MonsterEntry("vulture4", "Winged Nightmare", 80, "Flayer Jungle", 80),
	new MonsterEntry("frogdemon3", "Slime Prince", 90, "Flayer Jungle", 80),
	new MonsterEntry("fetishblow3", "Flayer", 90, "Flayer Jungle", 80),
	new MonsterEntry("baboon4", "Doom Ape", 110, "Lower Kurast", 80),
	new MonsterEntry("sandleaper4", "Tree Lurker", 95, "Lower Kurast", 80),
	new MonsterEntry("vulture3", "Hell Buzzard", 80, "Lower Kurast", 80),
	new MonsterEntry("zealot1", "Zakarumite", 80, "Lower Kurast", 80),
	new MonsterEntry("thornhulk3", "Thrasher", 130, "Kurast Bazaar", 81),
	new MonsterEntry("swarm4", "Hell Swarm", 60, "Kurast Bazaar", 81),
	new MonsterEntry("zealot2", "Faithful", 80, "Kurast Bazaar", 81),
	new MonsterEntry("cantor1", "Sexton", 130, "Kurast Bazaar", 81),
	new MonsterEntry("cantor3", "Heirophant", 130, "Travincal", 82),
	new MonsterEntry("vampire2", "Night Lord", 150, "Travincal", 82),
	new MonsterEntry("arach3", "Poison Spinner", 110, "Spider Cavern", 79),
	new MonsterEntry("arach4", "Flame Spider", 110, "Spider Cavern", 79),
	new MonsterEntry("batdemon2", "Fiend", 80, "Spider Cavern", 79),
	new MonsterEntry("sandmaggot4", "Giant Lamprey", 125, "Spider Cavern", 79),
	new MonsterEntry("mummy4", "Preserved Dead", 100, "Sewers Level 1", 85),
	new MonsterEntry("mosquito2", "Feeder", 75, "Sewers Level 1", 85),
	new MonsterEntry("batdemon3", "Gloombat", 80, "Sewers Level 1", 85),
	new MonsterEntry("unraveler4", "Horadrim Ancient", 300, "Sewers Level 1", 85),
	new MonsterEntry("bonefetish4", "Undead Soul Killer", 125, "Sewers Level 1", 85),
	new MonsterEntry("mummy4", "Preserved Dead", 100, "Sewers Level 2", 85),
	new MonsterEntry("unraveler4", "Horadrim Ancient", 300, "Sewers Level 2", 85),
	new MonsterEntry("mosquito4", "Blood Wing", 75, "Sewers Level 2", 85),
	new MonsterEntry("frogdemon3", "Slime Prince", 90, "Sewers Level 2", 85),
	new MonsterEntry("bonefetish4", "Undead Soul Killer", 125, "Sewers Level 2", 85),
	new MonsterEntry("brute5", "Wailing Beast", 120, "Ruined Temple", 85),
	new MonsterEntry("corruptrogue5", "Flesh Hunter", 95, "Ruined Temple", 85),
	new MonsterEntry("arach5", "Spider Magus", 110, "Ruined Temple", 85),
	new MonsterEntry("vampire2", "Night Lord", 150, "Ruined Temple", 85),
	new MonsterEntry("brute5", "Wailing Beast", 120, "Disused Fane", 85),
	new MonsterEntry("corruptrogue5", "Flesh Hunter", 95, "Disused Fane", 85),
	new MonsterEntry("arach5", "Spider Magus", 110, "Disused Fane", 85),
	new MonsterEntry("vampire2", "Night Lord", 150, "Disused Fane", 85),
	new MonsterEntry("mummy5", "Cadaver", 100, "Durance of Hate Level 1", 83),
	new MonsterEntry("vampire3", "Dark Lord", 150, "Durance of Hate Level 1", 83),
	new MonsterEntry("blunderbore3", "Mauler", 130, "Durance of Hate Level 1", 83),
	new MonsterEntry("bonefetish5", "Undead Stygian Doll", 125, "Durance of Hate Level 1", 83),
	new MonsterEntry("mummy5", "Cadaver", 100, "Durance of Hate Level 2", 83),
	new MonsterEntry("vampire3", "Dark Lord", 150, "Durance of Hate Level 2", 83),
	new MonsterEntry("blunderbore3", "Mauler", 130, "Durance of Hate Level 2", 83),
	new MonsterEntry("bonefetish5", "Undead Stygian Doll", 125, "Durance of Hate Level 2", 83),
	new MonsterEntry("vampire4", "Blood Lord", 150, "Durance of Hate Level 3", 83),
	new MonsterEntry("sandleaper5", "Razor Pit Demon", 95, "Outer Steppes", 82),
	new MonsterEntry("vilemother1", "Flesh Spawner", 130, "Outer Steppes", 82),
	new MonsterEntry("fingermage1", "Groper", 135, "Outer Steppes", 82),
	new MonsterEntry("regurgitator1", "Corpulent", 140, "Outer Steppes", 82),
	new MonsterEntry("doomknight1", "Doom Knight", 100, "Outer Steppes", 82),
	new MonsterEntry("megademon3", "Venom Lord", 130, "Outer Steppes", 82),
	new MonsterEntry("willowisp3", "Burning Soul", 120, "Plains of Despair", 83),
	new MonsterEntry("vilemother1", "Flesh Spawner", 130, "Plains of Despair", 83),
	new MonsterEntry("fingermage1", "Groper", 135, "Plains of Despair", 83),
	new MonsterEntry("regurgitator1", "Corpulent", 140, "Plains of Despair", 83),
	new MonsterEntry("doomknight1", "Doom Knight", 100, "Plains of Despair", 83),
	new MonsterEntry("megademon3", "Venom Lord", 130, "Plains of Despair", 83),
	new MonsterEntry("sandmaggot5", "World Killer", 125, "River of Flame", 85),
	new MonsterEntry("blunderbore4", "Urdar", 130, "River of Flame", 85),
	new MonsterEntry("vilemother3", "Grotesque", 130, "River of Flame", 85),
	new MonsterEntry("fingermage2", "Strangler", 135, "River of Flame", 85),
	new MonsterEntry("regurgitator3", "Maw Fiend", 140, "River of Flame", 85),
	new MonsterEntry("doomknight2", "Abyss Knight", 140, "River of Flame", 85),
	new MonsterEntry("megademon2", "Pit Lord", 130, "River of Flame", 85),
	new MonsterEntry("minion1", "Minionexp", 80, "Bloody Foothills", 80),
	new MonsterEntry("deathmauler1", "Death Mauler1", 105, "Bloody Foothills", 80),
	new MonsterEntry("overseer1", "Over Seer", 125, "Bloody Foothills", 80),
	new MonsterEntry("imp1", "Imp1", 120, "Bloody Foothills", 80),
	new MonsterEntry("sk_archer6", "Burning Dead Archer", 95, "Bloody Foothills", 80),
	new MonsterEntry("quillrat6", "Quill Rat", 70, "Bloody Foothills", 80),
	new MonsterEntry("foulcrow5", "Foul Crow", 75, "Bloody Foothills", 80),
	new MonsterEntry("vulture5", "Carrion Bird", 80, "Bloody Foothills", 80),
	new MonsterEntry("thornhulk5", "Thorned Hulk", 130, "Bloody Foothills", 80),
	new MonsterEntry("slinger7", "Slinger", 80, "Bloody Foothills", 80),
	new MonsterEntry("imp3", "Imp3", 120, "Frigid Highlands", 81),
	new MonsterEntry("siegebeast1", "Siege Beast", 260, "Frigid Highlands", 81),
	new MonsterEntry("minion2", "Slayerexp", 80, "Frigid Highlands", 81),
	new MonsterEntry("deathmauler2", "Death Mauler2", 105, "Frigid Highlands", 81),
	new MonsterEntry("sk_archer6", "Burning Dead Archer", 95, "Frigid Highlands", 81),
	new MonsterEntry("cr_archer6", "Vile Archer", 100, "Frigid Highlands", 81),
	new MonsterEntry("cr_lancer6", "Vile Lancer", 85, "Frigid Highlands", 81),
	new MonsterEntry("slinger8", "Slinger", 80, "Frigid Highlands", 81),
	new MonsterEntry("blunderbore5", "Blunderbore", 130, "Frigid Highlands", 81),
	new MonsterEntry("overseer2", "Lasher", 125, "Frigid Highlands", 81),
	new MonsterEntry("deathmauler3", "Death Mauler3", 105, "Arreat Plateau", 81),
	new MonsterEntry("minion4", "Fire Boar", 80, "Arreat Plateau", 81),
	new MonsterEntry("siegebeast3", "Blood Bringer", 260, "Arreat Plateau", 81),
	new MonsterEntry("overseer5", "Hell Whip", 125, "Arreat Plateau", 81),
	new MonsterEntry("imp3", "Imp3", 120, "Arreat Plateau", 81),
	new MonsterEntry("slinger9", "Slinger", 80, "Arreat Plateau", 81),
	new MonsterEntry("skmage_ltng5", "Returned Mage", 110, "Arreat Plateau", 81),
	new MonsterEntry("skmage_fire5", "Returned Mage", 110, "Arreat Plateau", 81),
	new MonsterEntry("goatman7", "Night Clan", 100, "Arreat Plateau", 81),
	new MonsterEntry("fallenshaman6", "Carver Shaman", 150, "Arreat Plateau", 81),
	new MonsterEntry("snowyeti1", "Snow Yeti1", 110, "Crystalline Passage", 82),
	new MonsterEntry("frozenhorror1", "Frozen Horror1", 120, "Crystalline Passage", 82),
	new MonsterEntry("succubus1", "Succubusexp", 90, "Crystalline Passage", 82),
	new MonsterEntry("bloodlord3", "Blood Lord3", 210, "Crystalline Passage", 82),
	new MonsterEntry("sandraider7", "Infidel", 120, "Crystalline Passage", 82),
	new MonsterEntry("sandleaper6", "Cave Leaper", 95, "Crystalline Passage", 82),
	new MonsterEntry("skmage_cold5", "Bone Mage", 110, "Crystalline Passage", 82),
	new MonsterEntry("cr_archer7", "Dark Archer", 100, "Crystalline Passage", 82),
	new MonsterEntry("wraith6", "Ghost", 105, "Crystalline Passage", 82),
	new MonsterEntry("clawviper6", "Claw Viper", 100, "Crystalline Passage", 82),
	new MonsterEntry("snowyeti1", "Snow Yeti1", 110, "Frozen River", 83),
	new MonsterEntry("frozenhorror1", "Frozen Horror1", 120, "Frozen River", 83),
	new MonsterEntry("succubus6", "Succubusexp", 90, "Frozen River", 83),
	new MonsterEntry("reanimatedhorde1", "Rot Walker", 105, "Frozen River", 83),
	new MonsterEntry("succubuswitch6", "Dominus", 145, "Frozen River", 83),
	new MonsterEntry("willowisp5", "Gloam", 120, "Frozen River", 83),
	new MonsterEntry("skmage_cold5", "Bone Mage", 110, "Frozen River", 83),
	new MonsterEntry("cr_lancer7", "Dark Lancer", 85, "Frozen River", 83),
	new MonsterEntry("wraith6", "Ghost", 105, "Frozen River", 83),
	new MonsterEntry("clawviper6", "Claw Viper", 100, "Frozen River", 83),
	new MonsterEntry("snowyeti1", "Snow Yeti1", 110, "Glacial Trail", 83),
	new MonsterEntry("frozenhorror1", "Frozen Horror1", 120, "Glacial Trail", 83),
	new MonsterEntry("reanimatedhorde1", "Rot Walker", 105, "Glacial Trail", 83),
	new MonsterEntry("skeleton6", "Bone Warrior", 85, "Glacial Trail", 83),
	new MonsterEntry("wraith7", "Wraith", 105, "Glacial Trail", 83),
	new MonsterEntry("batdemon6", "Gloombat", 80, "Glacial Trail", 83),
	new MonsterEntry("skmage_cold5", "Bone Mage", 110, "Glacial Trail", 83),
	new MonsterEntry("bloodlord6", "Blood Lord1", 210, "Glacial Trail", 83),
	new MonsterEntry("clawviper7", "Pit Viper", 100, "Glacial Trail", 83),
	new MonsterEntry("frozenhorror2", "Frozen Horror2", 120, "The Ancients' Way", 82),
	new MonsterEntry("snowyeti2", "Snow Yeti2", 110, "The Ancients' Way", 82),
	new MonsterEntry("bloodlord7", "Blood Lord4", 210, "The Ancients' Way", 82),
	new MonsterEntry("fallenshaman6", "Carver Shaman", 150, "The Ancients' Way", 82),
	new MonsterEntry("quillrat7", "Spike Fiend", 70, "The Ancients' Way", 82),
	new MonsterEntry("cr_lancer7", "Dark Lancer", 85, "The Ancients' Way", 82),
	new MonsterEntry("skmage_cold5", "Bone Mage", 110, "The Ancients' Way", 82),
	new MonsterEntry("reanimatedhorde2", "Reanimated Horde", 105, "The Ancients' Way", 82),
	new MonsterEntry("bighead6", "Afflicted", 125, "The Ancients' Way", 82),
	new MonsterEntry("snowyeti2", "Snow Yeti2", 110, "Icy Cellar", 85),
	new MonsterEntry("succubus4", "Hell Temptress", 90, "Icy Cellar", 85),
	new MonsterEntry("bloodlord7", "Blood Lord4", 210, "Icy Cellar", 85),
	new MonsterEntry("frozenhorror2", "Frozen Horror2", 120, "Icy Cellar", 85),
	new MonsterEntry("clawviper7", "Pit Viper", 100, "Icy Cellar", 85),
	new MonsterEntry("bonefetish5", "Undead Stygian Doll", 125, "Icy Cellar", 85),
	new MonsterEntry("willowisp5", "Gloam", 120, "Icy Cellar", 85),
	new MonsterEntry("batdemon6", "Gloombat", 80, "Icy Cellar", 85),
	new MonsterEntry("wraith6", "Ghost", 105, "Icy Cellar", 85),
	new MonsterEntry("succubuswitch6", "Dominus", 145, "Icy Cellar", 85),
	new MonsterEntry("reanimatedhorde3", "Prowling Dead", 105, "Halls of Anguish", 83),
	new MonsterEntry("bloodlord2", "Blood Lord2", 210, "Halls of Anguish", 83),
	new MonsterEntry("deathmauler5", "Death Mauler5", 105, "Halls of Anguish", 83),
	new MonsterEntry("skeleton7", "Returned", 85, "Halls of Anguish", 83),
	new MonsterEntry("sandleaper7", "Tomb Creeper", 95, "Halls of Anguish", 83),
	new MonsterEntry("fallenshaman7", "Devilkin Shaman", 150, "Halls of Anguish", 83),
	new MonsterEntry("scarab6", "Scarab", 110, "Halls of Anguish", 83),
	new MonsterEntry("fetish6", "Flayer", 75, "Halls of Anguish", 83),
	new MonsterEntry("skmage_pois5", "Horror Mage", 110, "Halls of Anguish", 83),
	new MonsterEntry("baboon7", "Temple Guard", 110, "Halls of Anguish", 83),
	new MonsterEntry("bloodlord2", "Blood Lord2", 210, "Halls of Pain", 84),
	new MonsterEntry("sandraider7", "Infidel", 120, "Halls of Pain", 84),
	new MonsterEntry("baboon8", "Temple Guard", 110, "Halls of Pain", 84),
	new MonsterEntry("goatman9", "Blood Clan", 100, "Halls of Pain", 84),
	new MonsterEntry("quillrat8", "Razor Spine", 70, "Halls of Pain", 84),
	new MonsterEntry("unraveler6", "Guardian", 300, "Halls of Pain", 84),
	new MonsterEntry("fetishblow6", "Flayer", 90, "Halls of Pain", 84),
	new MonsterEntry("cantor5", "Heirophant", 130, "Halls of Pain", 84),
	new MonsterEntry("vilemother4", "Grotesque", 130, "Halls of Pain", 84),
	new MonsterEntry("sandmaggot6", "World Killer", 125, "Halls of Pain", 84),
	new MonsterEntry("minion9", "Slayerexp", 75, "Halls of Vaught", 84),
	new MonsterEntry("succubus4", "Hell Temptress", 90, "Halls of Vaught", 84),
	new MonsterEntry("putriddefiler2", "Putrid Defiler2", 110, "Halls of Vaught", 84),
	new MonsterEntry("reanimatedhorde3", "Prowling Dead", 105, "Halls of Vaught", 84),
	new MonsterEntry("wraith6", "Ghost", 105, "Halls of Vaught", 84),
	new MonsterEntry("arach6", "Arach", 110, "Halls of Vaught", 84),
	new MonsterEntry("sk_archer9", "Returned Archer", 95, "Halls of Vaught", 84),
	new MonsterEntry("fetishshaman6", "Flayer Shaman", 260, "Halls of Vaught", 84),
	new MonsterEntry("baboon6", "Night Marauder", 135, "Halls of Vaught", 84),
	new MonsterEntry("clawviper9", "Tomb Viper", 100, "Halls of Vaught", 84),
	new MonsterEntry("reanimatedhorde6", "Unholy Corpse", 105, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("succubuswitch8", "Vile Witch", 145, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("putriddefiler3", "Putrid Defiler3", 110, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("sandraider9", "Invader", 120, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("bloodlord5", "Blood Lord5", 210, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("cr_lancer8", "Black Lancer", 85, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("vilemother5", "Flesh Spawner", 130, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("cantor6", "Heirophant", 130, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("vampire7", "Ghoul Lord", 150, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("fetishshaman8", "Soul Killer Shaman", 260, "The Worldstone Keep Level 1", 85),
	new MonsterEntry("suicideminion6", "Frenzied Ice Spawn", 70, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("minion11", "Greater Hell Spawn", 75, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("fetish8", "Soul Killer", 75, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("batdemon7", "Fiend", 80, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("clawviper10", "Serpent Magus", 100, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("mummy6", "Cadaver", 100, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("skmage_pois6", "Horror Mage", 110, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("unraveler8", "Horadrim Ancient", 300, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("scarab7", "Steel Weevil", 110, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("willowisp6", "Black Soul", 120, "The Worldstone Keep Level 2", 85),
	new MonsterEntry("bloodlord5", "Blood Lord5", 210, "Throne of Destruction", 85),
	new MonsterEntry("succubuswitch5", "Hell Witch", 145, "Throne of Destruction", 85),
	new MonsterEntry("bonefetish7", "Undead Soul Killer", 125, "Throne of Destruction", 85),
	new MonsterEntry("sandraider10", "Assailant", 120, "Throne of Destruction", 85),
	new MonsterEntry("willowisp7", "Burning Soul", 120, "Throne of Destruction", 85),
	new MonsterEntry("vampire8", "Dark Lord", 150, "Throne of Destruction", 85),
	new MonsterEntry("megademon5", "Pit Lord", 130, "Throne of Destruction", 85),
	new MonsterEntry("unraveler9", "Horadrim Ancient", 300, "Throne of Destruction", 85),
	new MonsterEntry("dkmag2", "Oblivion Knight", 210, "Throne of Destruction", 85),
	new MonsterEntry("clawviper10", "Serpent Magus", 100, "Throne of Destruction", 85)
];

export { container, number, debug, data, monLvls };
