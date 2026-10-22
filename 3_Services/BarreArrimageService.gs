class BarreArrimageService {

  static creerMail(donnees) {
    try {
      const gabarit = HtmlService.createTemplateFromFile("5_Views/mailGabarit");
      const date = Utilities.formatDate(new Date(donnees.dateJour), Session.getScriptTimeZone(), "dd/MM/yyyy");
      donnees.dateJour = date;
      gabarit.donnees = donnees;
      const message = gabarit.evaluate().getContent();

      // fonction pour récupérer mail.
      const mailTab = BarreArrimageRepository.getEmail(donnees.transporteur);

      // Sécurité : Vérifie que c'est un tableau avant d'appeler .join(",")
      const mailString = Array.isArray(mailTab) ? mailTab.join(",") : (mailTab || "");

      return {
        html: message,
        destinataire: mailString,
        objet: "Vente barres d'arrimage"
      }
    } catch (err) {
      Logger.log(err.message);
      throw err;
    }
  }

  static envoyerMail(payload) {
    try {
      // Sécurité : Vérification qu'au moins un destinataire est renseigné
      if (!payload.destinataire || payload.destinataire.trim() === "") {
        throw new Error("Aucune adresse e-mail destinataire fournie pour ce transporteur.");
      }
      const donnees = payload.enregistrement;
      const date = Utilities.formatDate(new Date(donnees.date), Session.getScriptTimeZone(), "dd/MM/yyyy");
      donnees.date = date;
      //fonction pour ajouter donnée dans le sheet
      BarreArrimageRepository.ajouterVente(donnees);

      // Préparation du mail
      const mail = {
        to: payload.destinataire,
        cc: payload.cc || "",
        subject: payload.objet,
        htmlBody: payload.html,
        noReply: true
      };

      // Traitement de la pièce jointe (si présente)
      if (payload.pieceJointe && payload.pieceJointe.bytes) {
        const bytes = Utilities.base64Decode(payload.pieceJointe.bytes);
        const blob = Utilities.newBlob(bytes, payload.pieceJointe.mimeType, payload.pieceJointe.nom);
        mail.attachments = [blob];
      }

      MailApp.sendEmail(mail);

      LogService.ecrireLog(
        "ARRIMAGE_MAIL", 
        `Vente de ${payload.enregistrement["nb vente"]} barre(s) vendue(s) - E-mail envoyé à : ${payload.destinataire} (CC: ${payload.cc}) - Transporteur : ${payload.enregistrement.transporteur}`
      );

      return { success: true };
    } catch (err) {
      Logger.log("Erreur BarreArrimageService.envoyerMailDirect : " + err.message);
      throw err;
    }
  }
}
