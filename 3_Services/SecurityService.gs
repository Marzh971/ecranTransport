class SecurityService {

  static verifUtilisateur() {
    // const email = Session.getActiveUser().getEmail();
    // const utilisateur = UtilisateurRepository.getUtilisateurParEmail(email)

    // if (utilisateur) {
    //   return utilisateur.role;
    // } else {
    //   return null
    // }
    return "Admin"
  }


static estPasLecteur() {
  const role = this.verifUtilisateur();
  return role && role !== "Lecteur"; // Renvoie true seulement si l'utilisateur existe ET n'est pas Lecteur
}

}
