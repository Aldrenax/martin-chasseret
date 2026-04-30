const FORM_RECIPIENT = "marty.blind.dj@gmail.com";

// Pour activer l'envoi serveur (Web3Forms — gratuit, illimité) :
// 1. Demander une clé sur https://web3forms.com/ (1 email)
// 2. Coller la clé ici. Tant que la chaîne est vide, on retombe sur mailto:.
const WEB3FORMS_ACCESS_KEY = "";

const fieldLabels = {
  audience: "Public attendu",
  budget: "Budget indicatif",
  date: "Date souhaitée",
  duration: "Horaires / durée",
  email: "Email",
  "event-type": "Type d'événement",
  format: "Format souhaité",
  location: "Ville / lieu",
  message: "Message",
  name: "Nom complet",
  organization: "Organisation",
  "request-type": "Type de demande",
};

const getFieldValue = (field) => {
  if (field.tagName === "SELECT") {
    return field.selectedOptions[0]?.textContent.trim() || "";
  }
  if (field.type === "checkbox") {
    return field.checked ? "Oui" : "Non";
  }
  return field.value.trim();
};

const collectFields = (form) =>
  Array.from(form.elements).filter(
    (field) => field.name && field.type !== "submit" && field.name !== "consent",
  );

const buildEmailBody = (form, title) => {
  const lines = collectFields(form)
    .map((field) => {
      const label = fieldLabels[field.name] || field.name;
      const value = getFieldValue(field);
      return value ? `${label} : ${value}` : "";
    })
    .filter(Boolean);

  return [
    "Bonjour,",
    "",
    `Nouvelle demande depuis le site Marty Blind DJ : ${title}.`,
    "",
    ...lines,
    "",
    "Merci.",
  ].join("\n");
};

const submitViaWeb3Forms = async (form, title, status) => {
  const data = new FormData();
  data.append("access_key", WEB3FORMS_ACCESS_KEY);
  data.append("subject", `[Marty Blind DJ] ${title}`);
  data.append("from_name", "Site Marty Blind DJ");
  for (const field of collectFields(form)) {
    const label = fieldLabels[field.name] || field.name;
    const value = getFieldValue(field);
    if (value) data.append(label, value);
  }

  if (status) status.textContent = "Envoi en cours…";

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    if (json.success) {
      if (status)
        status.textContent =
          "Merci, votre demande a bien été envoyée. Marty vous répond sous 48 h.";
      form.reset();
    } else {
      throw new Error(json.message || "Erreur d'envoi");
    }
  } catch (err) {
    if (status)
      status.textContent =
        "Envoi impossible pour le moment. Ouverture de votre logiciel mail à la place.";
    submitViaMailto(form, title);
  }
};

const submitViaMailto = (form, title) => {
  const recipient = form.dataset.recipient || FORM_RECIPIENT;
  const senderName = form.querySelector('[name="name"]')?.value.trim();
  const subjectName = senderName ? ` - ${senderName}` : "";
  const subject = encodeURIComponent(`${title}${subjectName}`);
  const body = encodeURIComponent(buildEmailBody(form, title));
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
};

document.querySelectorAll("form.contact-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const title = form.dataset.formTitle || "Demande depuis le site";
    const status = form.querySelector("[data-form-status]");

    if (WEB3FORMS_ACCESS_KEY) {
      submitViaWeb3Forms(form, title, status);
    } else {
      if (status) {
        status.textContent =
          "Votre logiciel mail va s'ouvrir avec un message prérempli. Vous pourrez le relire avant envoi.";
      }
      submitViaMailto(form, title);
    }
  });
});
