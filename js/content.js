/* FAWÉ — content.js
   Único lugar para trocar os dados de contato. Script comum (nunca fetch: file:// bloqueia).
   Enquanto estiverem vazios, os botões abrem o WhatsApp/e-mail SEM destinatário e a página mostra "[PENDENTE]". */
window.FAWE = {
  // PENDENTE: número de WhatsApp só com dígitos e DDI, ex.: "5511999999999"
  whatsapp: "",
  // PENDENTE: e-mail da agência, ex.: "contato@dominio.com.br"
  email: "",
  // Instagram oficial (confirmado no briefing)
  instagram: "https://www.instagram.com/faweone/",
  // PENDENTE: horário de atendimento (texto livre)
  horario: "",
  // PENDENTE: prazo de resposta do formulário, em dias úteis (ex.: "2"). Vazio mostra [PENDENTE].
  prazo: ""
};
