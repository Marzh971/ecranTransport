// Entité Enregistrement - Représente le flux d'un camion sur le site logistique
class Enregistrement extends BaseModels {

  constructor(donnees = {}) {
    // Appel constructeur class mère
    super();
    if (!donnees.transporteur || !donnees.client) {
      throw new Error("Le transporteur et le client sont obligatoires pour créer un Enregistrement.");
    }

    // méthode native pour créer uuid 
    this.id = donnees.id || genererId_("Enregistrements");
    this.date = donnees.date ? new Date(donnees.date) : new Date();
    this.transporteur =  Enregistrement.toTxt(donnees.transporteur);
    this.immatriculation = Enregistrement.toTxt(donnees.immatriculation);
    if (this.immatriculation) {
      this.immatriculation = this.immatriculation.toUpperCase();
    }
    this.client = Enregistrement.toTxt(donnees.client);
    this.quai = Enregistrement.toTxt(donnees.quai);
    this.statut = Enregistrement.toTxt(donnees.statut);

    // Champs Heures
    this.heure_arrivee = donnees.heure_arrivee || null;
    this.heure_pret_ch = donnees.heure_pret_ch || null;
    this.heure_depart = donnees.heure_depart || null;

    this.commentaire = Enregistrement.toTxt(donnees.commentaire);
    this.feuille_temperature_url = donnees.feuille_temperature_url || null;

    // Booléens sécurisés pour les valeurs Google Sheets
    this.pesee_completee = (donnees.pesee_completee === true || String(donnees.pesee_completee).toUpperCase() === 'TRUE');
    this.feuille_temperature_generee = (donnees.feuille_temperature_generee === true || String(donnees.feuille_temperature_generee).toUpperCase()  === 'TRUE');
    this.lavage_paye = (donnees.lavage_paye === true || String(donnees.lavage_paye).toUpperCase() === 'TRUE');
    this.arrimage_paye = (donnees.arrimage_paye === true || String(donnees.arrimage_paye).toUpperCase()=== 'TRUE');
    this.feuille_temperature_verifiee = (donnees.feuille_temperature_verifiee === true || String(donnees.feuille_temperature_verifiee).toUpperCase() === 'TRUE');
  }

  static toTxt(val) {
    if (val === null || val === undefined || val === '') return null;
    let str = String(val).trim();
    // Si le texte commence par =, +, - ou @, on ajoute une apostrophe '
    // pour forcer Google Sheets à le traiter uniquement comme du texte brut
    if (/^[=+\-@]/.test(str)) {
      str = "'" + str;
    }
    return str;
  }

  toArray(entetesFeuille) {
    // Mapping entre le nom de la colonne dans Google Sheet et la clé de l'objet
    const correspondanceChamps = {
      "id": this.id,
      "date": this.date,
      "transporteur": this.transporteur,
      "immatriculation": this.immatriculation,
      "client": this.client,
      "quai": this.quai,
      "statut": this.statut,
      "heure_arrivee": this.heure_arrivee,
      "heure_pret_ch": this.heure_pret_ch,
      "heure_depart": this.heure_depart,
      "commentaire": this.commentaire,
      "pesee_completee": this.pesee_completee,
      "feuille_temperature_generee": this.feuille_temperature_generee,
      "feuille_temperature_verifiee": this.feuille_temperature_verifiee,
      "feuille_temperature_url": this.feuille_temperature_url,
      "lavage_paye": this.lavage_paye,
      "arrimage_paye": this.arrimage_paye,
    };

    // On reconstruit le tableau dans l'ordre EXACT des colonnes de la feuille
    return entetesFeuille.map(nomColonne => correspondanceChamps[nomColonne] ?? "");
  }




}