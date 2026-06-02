import os
import json

# Configuration des dossiers
BASE_DIR = os.path.dirname(__file__)
SITE_DIR = os.path.join(BASE_DIR, "site")
# On cible le dossier Review (le script s'adaptera si c'est 'Review' ou 'review')
REVIEW_DIR_NAME = "Review" if os.path.exists(os.path.join(SITE_DIR, "Review")) else "review"
REVIEW_DIR = os.path.join(SITE_DIR, REVIEW_DIR_NAME)

OUT_FILE = os.path.join(SITE_DIR, "reviews.generated.js")
IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def get_all_reviews():
    reviews_list = []
    
    if not os.path.exists(REVIEW_DIR):
        print(f"❌ Le dossier {REVIEW_DIR} n'existe pas.")
        return reviews_list

    # os.walk permet de chercher dans TOUS les sous-dossiers (ex: customers/28/)
    for root, dirs, files in os.walk(REVIEW_DIR):
        for file in files:
            ext = os.path.splitext(file.lower())[1]
            if ext in IMG_EXT:
                # On récupère le chemin complet du fichier
                full_path = os.path.join(root, file)
                # On extrait le chemin relatif par rapport au dossier 'site/'
                # Exemple : 'Review/customers/28/Screenshot from 2026-06-03 01-03-14.png'
                rel_path = os.path.relpath(full_path, SITE_DIR)
                
                # Sous Windows, on remplace les backslashes (\) par des slashs (/) pour le web
                rel_path = rel_path.replace("\\", "/")
                
                reviews_list.append(rel_path)

    # Tri basique pour garder un ordre cohérent
    return sorted(reviews_list)

if __name__ == "__main__":
    print("🔍 Analyse du dossier des reviews...")
    all_reviews = get_all_reviews()
    
    # Génération du fichier JS indépendant
    output_js = (
        "// Fichier des avis clients généré automatiquement - Ne pas modifier à la main\n"
        f"window.REVIEWS_DATA = {json.dumps(all_reviews, indent=2)};\n"
    )
    
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(output_js)

    print(f"✅ Génération réussie ! Fichier créé : {OUT_FILE}")
    print(f"⭐ Nombre de reviews trouvées et intégrées : {len(all_reviews)}")