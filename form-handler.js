const FORM_RECIPIENT = "marty.blind.dj@gmail.com";

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

const buildEmailBody = (form, title) => {
  const fields = Array.from(form.elements).filter((field) => {
    return field.name && field.type !== "submit" && field.name !== "consent";
  });

  const lines = fields
    .map((field) => {
      const label = fieldLabels[field.name] || field.name;
      const value = getFieldValue(field);
      return value ? `${label} : ${value}` : "";
    })
    .filter(Boolean);

  return [
    "Bonjour,",
    "",
    `Nouvelle demande depuis le site Martin Chasseret : ${title}.`,
    "",
    ...lines,
    "",
    "Merci.",
  ].join("\n");
};

document.querySelectorAll("form.contact-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const title = form.dataset.formTitle || "Demande depuis le site";
    const recipient = form.dataset.recipient || FORM_RECIPIENT;
    const senderName = form.querySelector('[name="name"]')?.value.trim();
    const subjectName = senderName ? ` - ${senderName}` : "";
    const subject = encodeURIComponent(`${title}${subjectName}`);
    const body = encodeURIComponent(buildEmailBody(form, title));
    const status = form.querySelector("[data-form-status]");

    if (status) {
      status.textContent =
        "Votre logiciel mail va s'ouvrir avec un message prérempli. Vous pourrez le relire avant envoi.";
    }

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
});
