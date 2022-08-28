
import * as constants from './constants.js'

window.addEventListener("load", load, false);

function load() {

	constants.setupUpdateTableInputElements(updateTable);
	createTable();

	function createTable() {

		let tableDiv = document.createElement("div");
		tableDiv.className = "tableHeader";
		let table = document.createElement("table");

		let headerRow = createTableRow(table);
		createTableHeader(headerRow, "Monster ID");
		createTableHeader(headerRow, "Monster Name");
		createTableHeader(headerRow, "Area (Level)");
		createTableHeader(headerRow, "Base XP", "Experience given by this monster type before any modification occurs.");
		createTableHeader(headerRow, "N XP", "Experience given by a normal monster of this type.");
		createTableHeader(headerRow, "C XP", "Experience given by a Champion monster of this type.");
		createTableHeader(headerRow, "U XP", "Experience given by a Unique monster of this type.");
		createTableHeader(headerRow, "(T)N XP", "Experience given by a normal monster of this type in a Terror Zone.");
		createTableHeader(headerRow, "(T)C XP", "Experience given by a Champion monster of this type in a Terror Zone.");
		createTableHeader(headerRow, "(T)U XP",  "Experience given by a Unique monster of this type in a Terror Zone.");
		/*createTableHeader(headerRow, "N Diff");
		createTableHeader(headerRow, "N toKill");
		createTableHeader(headerRow, "C Diff");
		createTableHeader(headerRow, "C toKill");
		createTableHeader(headerRow, "U Diff");
		createTableHeader(headerRow, "U toKill");*/

		for (const d of constants.data) {
			let row = createTableRow(table);
			createTableCell(row, d.monId);
			createTableCell(row, d.monName);
			createTableCell(row, d.levelName + " (" + d.areaLevel + ")");
			createTableCell(row, d.baseExp);
			let origNormExpCell = createEmptyTableCell(row);
			let origChampExpCell = createEmptyTableCell(row);
			let origUniExpCell = createEmptyTableCell(row);
			let terrNormExpCell = createEmptyTableCell(row);
			let terrChampExpCell = createEmptyTableCell(row);
			let terrUniExpCell = createEmptyTableCell(row);
			d.setTableCells(origNormExpCell, origChampExpCell, origUniExpCell, terrNormExpCell, terrChampExpCell, terrUniExpCell);
			//d.update(playerLevel, playerCount, partySize, playerLevel, expGained);
			/*let baseDiffMulti = createTableCell(row, (Math.round(parseInt(baseExpTerrorCell.innerHTML) / parseInt(baseExpCell.innerHTML) * 10) / 10) + "x");
			let killsToLevel = createTableCell(row, Math.ceil(291058498 / parseInt(baseExpTerrorCell.innerHTML)));
			let champDiffMulti = createTableCell(row, (Math.round(parseInt(champExpTerrorCell.innerHTML) / parseInt(champExpCell.innerHTML) * 10) / 10) + "x");
			let champKillsToLevel = createTableCell(row, Math.ceil(291058498 / parseInt(champExpTerrorCell.innerHTML)));
			let uniqueDiffMulti = createTableCell(row, (Math.round(parseInt(uniqueExpTerrorCell.innerHTML) / parseInt(uniqueExpCell.innerHTML) * 10) / 10) + "x");
			let uniqueKillsToLevel = createTableCell(row, Math.ceil(291058498 / parseInt(uniqueExpTerrorCell.innerHTML)));*/
			//break;
		}

		updateTable();

		tableDiv.appendChild(table);
		constants.container.TABLE.appendChild(tableDiv);

	}

	function updateTable() {

		let playerLevel = parseInt(constants.number.YOUR_LEVEL.value);
		let partySize = parseInt(constants.number.PARTY_AMOUNT.value);
		updatePartyLevels(partySize, playerLevel);

		let partyLevel1 = isElementHidden(constants.container.PARTY_LEVEL_1) ? 0 : parseInt(constants.number.PARTY_LEVEL_1.value);
		let partyLevel2 = isElementHidden(constants.container.PARTY_LEVEL_2) ? 0 : parseInt(constants.number.PARTY_LEVEL_2.value);
		let partyLevel3 = isElementHidden(constants.container.PARTY_LEVEL_3) ? 0 : parseInt(constants.number.PARTY_LEVEL_3.value);
		let partyLevel4 = isElementHidden(constants.container.PARTY_LEVEL_4) ? 0 : parseInt(constants.number.PARTY_LEVEL_4.value);
		let partyLevel5 = isElementHidden(constants.container.PARTY_LEVEL_5) ? 0 : parseInt(constants.number.PARTY_LEVEL_5.value);
		let partyLevel6 = isElementHidden(constants.container.PARTY_LEVEL_6) ? 0 : parseInt(constants.number.PARTY_LEVEL_6.value);
		let partyLevel7 = isElementHidden(constants.container.PARTY_LEVEL_7) ? 0 : parseInt(constants.number.PARTY_LEVEL_7.value);

		let playerCount = parseInt(constants.number.PLAYER_AMOUNT.value);
		let totalPartyLevel = playerLevel + partyLevel1 + partyLevel2 + partyLevel3 + partyLevel4 + partyLevel5 + partyLevel6 + partyLevel7;
		let expGained = parseInt(constants.number.EXP_GAINED.value);

		for (const d of constants.data) {
			d.update(playerLevel, playerCount, partySize, totalPartyLevel, expGained);
			//break;
		}

	}

	function updatePartyLevels(partySize, yourLevel) {

		for (let i = 1; i <= 7; i++) {
			let element = document.getElementById("partyLevel" + i + "Container")
			if (i < partySize) {
				if (isElementHidden(element)) {
					unhideElement(element);
					document.getElementById("partyLevel" + i).value = yourLevel;
				}
			} else {
				hideElement(element);
			}
			
		}

	}
	

}

function trun(number) {
	if (number == -0) number = 0;
	return number >= 0 ? Math.floor(number) : Math.ceil(number);
}

/**
 * https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript/33928558#33928558
 */
 function copyToClipboard(text) {
	if (window.clipboardData && window.clipboardData.setData) {
		// Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
		return window.clipboardData.setData("Text", text);

	}
	else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
		var textarea = document.createElement("textarea");
		textarea.textContent = text;
		textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
		document.body.appendChild(textarea);
		textarea.select();
		try {
			return document.execCommand("copy");  // Security exception may be thrown by some browsers.
		}
		catch (ex) {
			console.warn("Copy to clipboard failed.", ex);
			return prompt("Copy to clipboard: Ctrl+C, Enter", text);
		}
		finally {
			document.body.removeChild(textarea);
		}
	}
}

function hideElement(element) {
	element.style.display = "none";
}

function unhideElement(element) {
	element.style.display = "initial";
}

function isElementHidden(element) {
	return !(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function removeAllChildNodes(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}

function clear(select) {
	let options = select.options;
	let i, L = options.length - 1;
	for (i = L; i >= 0; i--) {
		select.remove(i);
	}
}

function createOption(value) {
	let option = document.createElement("option");
	if (value == "divider") option.disabled = true;
	else option.setAttribute("value", value);
	option.text = value == "divider" ? "───────────" : value;
	return option;
}

function createTableRow(table) {
	let row = document.createElement("tr");
	table.appendChild(row);
	return row;
}

function createTableCell(tableRow, value) {
	let cell = document.createElement("td");
	cell.innerHTML = value;
	tableRow.appendChild(cell);
	return cell;
}

function createEmptyTableCell(tableRow) {
	let cell = document.createElement("td");
	tableRow.appendChild(cell);
	return cell;
}

function createTableHeader(tableRow, value, tooltip) {
	let header = document.createElement("th");
	header.innerHTML = value;
	if (tooltip !== undefined) header.title = tooltip;
	tableRow.appendChild(header);
	return header;
}

function addTableRow(table, IAS, frame) {

	let tableRow = document.createElement("tr");

	let tdIAS = document.createElement("td");
	tdIAS.innerHTML = IAS;

	let tdFrame = document.createElement("td");
	tdFrame.innerHTML = frame;

	tableRow.appendChild(tdIAS);
	tableRow.appendChild(tdFrame);

	table.appendChild(tableRow);
}

function addTableHeader(table, variableLabel) {

	let tableRow = document.createElement("tr");

	let thVariableLabel = document.createElement("th");
	thVariableLabel.innerHTML = variableLabel;

	let tdFPA = document.createElement("th");
	tdFPA.innerHTML = "FPA";
	tdFPA.title = "Frames Per Animation (not Attack/Hit)";
	tdFPA.className = "hoverable";

	tableRow.appendChild(thVariableLabel);
	tableRow.appendChild(tdFPA);

	table.appendChild(tableRow);
}
