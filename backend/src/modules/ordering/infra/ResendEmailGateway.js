import { Resend } from "resend";

export async function sendPurchaseEmail(client, items, total) {
  // Instanciado aqui, e não no topo: sem chave, o construtor derrubaria o app no import
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "E-Commerce <gustavothemyus@gmail.com>",
    to: client,
    subject: "Purchase confirmation",
    html: `
      <h2>Purchase confirmed</h2>
      <p><strong>Total:</strong> $${Number(total).toFixed(2)}</p>
      <h3>Items</h3>
      <ul>
        ${items
          .map(
            (item) =>
              `<li>${item.title} — ${item.quantity} x $${Number(
                item.price,
              ).toFixed(2)}</li>`,
          )
          .join("")}
      </ul>
    `,
  });

  console.log("RESEND data:", data);
  console.log("RESEND error:", error);

  if (error) throw new Error(error.message || "Resend send failed");
  return data;
}
