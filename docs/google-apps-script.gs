const SHEET_NAME = "Respuestas";

function doPost(e) {
  try {
    const sheet = getSheet();
    const data = parseRequestBody(e);
    const result = validateResult(data);

    sheet.appendRow([
      result.grado,
      result.edad,
      result.puntaje,
      result.nivel,
      result.fecha
    ]);

    return jsonResponse({
      ok: true,
      message: "Resultado guardado correctamente."
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message
    });
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: "El servicio de Nivel-E esta activo."
  });
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["grado", "edad", "puntaje", "nivel", "fecha"]);
  }

  return sheet;
}

function parseRequestBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Solicitud vacia.");
  }

  return JSON.parse(e.postData.contents);
}

function validateResult(data) {
  const result = {
    grado: String(data.grade || data.grado || "").trim(),
    edad: Number(data.age || data.edad),
    puntaje: Number(data.score || data.puntaje),
    nivel: String(data.level || data.nivel || "").trim(),
    fecha: String(data.date || data.fecha || new Date().toISOString())
  };

  if (!result.grado) {
    throw new Error("El grado es obligatorio.");
  }

  if (!Number.isFinite(result.edad)) {
    throw new Error("La edad no es valida.");
  }

  if (!Number.isFinite(result.puntaje)) {
    throw new Error("El puntaje no es valido.");
  }

  if (!result.nivel) {
    throw new Error("El nivel es obligatorio.");
  }

  return result;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
