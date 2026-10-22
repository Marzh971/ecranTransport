class Quai extends BaseModels {

  constructor(donnees = {}) {

    // Appel constructeur class mère
    super();
    this.idDock = donnees.idDock
    this.stateDock = donnees.stateDock
  }


  toArray(entetesFeuille) {
    // Mapping entre le nom de la colonne dans Google Sheet et la clé de l'objet
    const correspondanceChamps = {
      "idDock": this.idDock,
      "stateDock": this.stateDock,
    };

    // On reconstruit le tableau dans l'ordre EXACT des colonnes de la feuille
    return entetesFeuille.map(nomColonne => correspondanceChamps[nomColonne] ?? "");
  }
}