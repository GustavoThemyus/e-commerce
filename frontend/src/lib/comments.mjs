// Lê os comentários guardados no localStorage. O que vem de lá é só texto do navegador e pode
// estar ausente, corrompido ou em outro formato, então nunca é confiado: o pior caso é lista vazia.
//
// Existe por causa de um bug: `JSON.parse(localStorage.getItem(k)) || "[]"` devolve a STRING "[]"
// quando não há nada salvo, e o spread dessa string cria dois itens vazios ("[" e "]").
export function parseStoredComments(raw) {
  if (typeof raw !== "string") return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  return Array.isArray(parsed) ? parsed.filter(isComment) : [];
}

function isComment(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    item.id != null &&
    typeof item.author === "string" &&
    typeof item.text === "string"
  );
}
