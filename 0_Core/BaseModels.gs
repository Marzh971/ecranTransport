class BaseModels {
  constructor() {
  }
  // Méthode de sérialisation JSON pour l'envoi vers le Front-End HTML Service. Permet de renvoyer une copie en objet Js.
  toJSON() {

    const tz = Session.getScriptTimeZone();
    const copie = { ...this };
    Object.keys(copie).forEach(cle => {
      const valeur = copie[cle];

      if (valeur instanceof Date) {
        // Heure sur sheet sont à la date 1899
        if (valeur.getFullYear() < 1900) {
          copie[cle] = Utilities.formatDate(valeur, tz, "HH:mm");

        } else if (valeur.getHours() === 0 && valeur.getMinutes() === 0 && valeur.getSeconds() === 0) {
          // Date simple sans heure (00:00:00) -> YYYY-MM-DD
          copie[cle] = Utilities.formatDate(valeur, tz, "yyyy-MM-dd");

        } else {
          // Horodatage complet (Date + Heure) pour les <input type="datetime-local">
          copie[cle] = Utilities.formatDate(valeur, tz, "yyyy-MM-dd'T'HH:mm");
        }
      }

      if (valeur === 'TRUE' || valeur === 'FALSE') {
        copie[cle] = (valeur === 'TRUE');
      }


    });
    return copie;
  }


}