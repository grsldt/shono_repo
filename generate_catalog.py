import os, json

# ✅ adapte si besoin :
SITE_DIR = os.path.join(os.path.dirname(__file__), "site")
OUT_FILE = os.path.join(SITE_DIR, "catalog.generated.js")

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def is_img(filename: str) -> bool:
    return os.path.splitext(filename.lower())[1] in IMG_EXT

def list_dirs(path: str):
    if not os.path.isdir(path):
        return []
    return sorted([d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))])

def list_images(path: str):
    if not os.path.isdir(path):
        return []
    files = [f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)) and is_img(f)]
    # tri "naturel" simple (évite 10 avant 2)
    return sorted(files, key=lambda x: (len(x), x.lower()))

def build_catalog():
    catalog = {}

    categories = list_dirs(SITE_DIR)

    for cat in categories:
        if cat.startswith("."):
            continue

        cat_path = os.path.join(SITE_DIR, cat)
        level1 = list_dirs(cat_path)

        catalog[cat] = {}

        if not level1:
            # category vide
            continue

        # 🔎 Détection : est-ce que cat/<level1> contient des images directement ?
        # Si oui => format B : cat/product/images (pas de brand)
        # Si non => format A : cat/brand/product/images
        first_child_path = os.path.join(cat_path, level1[0])
        first_child_has_images = len(list_images(first_child_path)) > 0

        if first_child_has_images:
            # ✅ Format B : site/pants/p1/*.jpg
            brand = "default"
            catalog[cat][brand] = []

            for product_folder in level1:
                prod_path = os.path.join(cat_path, product_folder)
                imgs = list_images(prod_path)
                if not imgs:
                    continue

                rel_imgs = [f"{cat}/{product_folder}/{img}" for img in imgs]
                catalog[cat][brand].append(rel_imgs)

        else:
            # ✅ Format A : site/jacket/moncler/1/*.png
            for brand in level1:
                brand_path = os.path.join(cat_path, brand)
                products = list_dirs(brand_path)
                if not products:
                    continue

                prod_list = []
                for product_folder in products:
                    prod_path = os.path.join(brand_path, product_folder)
                    imgs = list_images(prod_path)
                    if not imgs:
                        continue

                    rel_imgs = [f"{cat}/{brand}/{product_folder}/{img}" for img in imgs]
                    prod_list.append(rel_imgs)

                if prod_list:
                    catalog[cat][brand] = prod_list

    return catalog

if __name__ == "__main__":
    catalog = build_catalog()
    js = "window.CATALOG = " + json.dumps(catalog, indent=2) + ";\n"
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(js)

    print("✅ Generated:", OUT_FILE)
    print("✅ Categories:", list(catalog.keys()))
    for k,v in catalog.items():
        total = sum(len(v[brand]) for brand in v) if isinstance(v, dict) else 0
        print(f" - {k}: {total} products")
