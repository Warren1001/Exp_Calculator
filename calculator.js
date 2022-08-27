
import * as constants from './constants.js'

window.addEventListener("load", load, false);

function load() {

	
	displayTable();

	function displayTable() {

		let tableDiv = document.createElement("div");
		tableDiv.className = "tableHeader";
		let table = document.createElement("table");

		let headerRow = createTableRow(table);
		createTableHeader(headerRow, "Mon ID");
		createTableHeader(headerRow, "Mon Name");
		createTableHeader(headerRow, "Area (Level)");
		createTableHeader(headerRow, "N XP");
		createTableHeader(headerRow, "C XP");
		createTableHeader(headerRow, "U XP");
		createTableHeader(headerRow, "(T)N XP");
		createTableHeader(headerRow, "(T)C XP");
		createTableHeader(headerRow, "(T)U XP");
		createTableHeader(headerRow, "N Diff");
		createTableHeader(headerRow, "N toKill");
		createTableHeader(headerRow, "C Diff");
		createTableHeader(headerRow, "C toKill");
		createTableHeader(headerRow, "U Diff");
		createTableHeader(headerRow, "U toKill");

		for (const d of constants.data) {
			let row = createTableRow(table);
			let monIdCell = createTableCell(row, d.monId);
			let monNameCell = createTableCell(row, d.monName);
			let areaCell = createTableCell(row, d.levelName + " (" + d.areaLevel + ")");
			let baseExp = Math.floor(d.monExp * d.monLvlValue / 100);
			let partySize = 1;
			let baseExpCell = createTableCell(row, constants.calculateExperience(baseExp, 8, partySize, 98, d.areaLevel, 10));
			let champExpCell = createTableCell(row, constants.calculateExperience(baseExp * 3, 8, partySize, 98, d.areaLevel + 2, 10));
			let uniqueExpCell = createTableCell(row, constants.calculateExperience(baseExp * 5, 8, partySize, 98, d.areaLevel + 3, 10));
			let terrorMonLevel = Math.min(96, Math.max(d.areaLevel, 98) + 2);
			let baseExpTerrorCell = createTableCell(row, constants.calculateExperience(baseExp, 8, partySize, 98, terrorMonLevel, 10));
			let champExpTerrorCell = createTableCell(row, constants.calculateExperience(baseExp * 3, 8, partySize, 98, terrorMonLevel + 2, 10));
			let uniqueExpTerrorCell = createTableCell(row, constants.calculateExperience(baseExp * 5, 8, partySize, 98, terrorMonLevel + 3, 10));
			let baseDiffMulti = createTableCell(row, (Math.round(parseInt(baseExpTerrorCell.innerHTML) / parseInt(baseExpCell.innerHTML) * 10) / 10) + "x");
			let killsToLevel = createTableCell(row, Math.ceil(291058498 / parseInt(baseExpTerrorCell.innerHTML)));
			let champDiffMulti = createTableCell(row, (Math.round(parseInt(champExpTerrorCell.innerHTML) / parseInt(champExpCell.innerHTML) * 10) / 10) + "x");
			let champKillsToLevel = createTableCell(row, Math.ceil(291058498 / parseInt(champExpTerrorCell.innerHTML)));
			let uniqueDiffMulti = createTableCell(row, (Math.round(parseInt(uniqueExpTerrorCell.innerHTML) / parseInt(uniqueExpCell.innerHTML) * 10) / 10) + "x");
			let uniqueKillsToLevel = createTableCell(row, Math.ceil(291058498 / parseInt(uniqueExpTerrorCell.innerHTML)));
		}

		tableDiv.appendChild(table);
		constants.container.TABLE.appendChild(tableDiv);

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

function createTableHeader(tableRow, value) {
	let header = document.createElement("th");
	header.innerHTML = value;
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
