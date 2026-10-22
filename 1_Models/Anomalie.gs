class Anomalie extends BaseModels {
  constructor(donnees = {}) {
    super();

    if (!donnees.transporteur || !donnees.client || !donnees.type_anomalie || !donnees.horodatage_debut) {
      throw new Error("Le type d'anomalie, le transporteur, le client et l'horodatage de début sont obligatoires.");
    }

    const dDebut = new Date(donnees.horodatage_debut);
    const dFin = donnees.horodatage_fin ? new Date(donnees.horodatage_fin) : null;

    // Validation de la validité des dates
    if (isNaN(dDebut.getTime())) {
      throw new Error("L'horodatage de début est invalide.");
    }
    if (dFin && isNaN(dFin.getTime())) {
      throw new Error("L'horodatage de fin est invalide.");
    }

    if (dFin && dDebut >= dFin) {
      throw new Error("La date de début doit être inférieure à la date de fin.");
    }

    this.id = donnees.id || genererId_("Anomalies");
    this.transporteur = donnees.transporteur;
    this.immatriculation = donnees.immatriculation || null;
    this.client = donnees.client;
    this.type_anomalie = donnees.type_anomalie;
    this.horodatage_debut = dDebut;
    this.horodatage_fin = dFin;
    this.idEnregistrement = donnees.idEnregistrement || null;
  }


  toArray(entetesFeuille) {
    // Mapping entre le nom de la colonne dans Google Sheet et la clé de l'objet
    const correspondanceChamps = {
      "id": this.id,
      "horodatage_debut": this.horodatage_debut,
      "horodatage_fin": this.horodatage_fin,
      "transporteur": this.transporteur,
      "immatriculation": this.immatriculation,
      "client": this.client,
      "type_anomalie": this.type_anomalie,
      "idEnregistrement": this.idEnregistrement
    };

    // On reconstruit le tableau dans l'ordre EXACT des colonnes de la feuille
    return entetesFeuille.map(nomColonne => correspondanceChamps[nomColonne] ?? "");
  }


}