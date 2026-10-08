import base64
import requests

with open("app/test/test_image.jpg", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode("utf-8")

response = requests.post(
    "http://localhost:8000/search",
    json={
        "image_base64": image_b64,
        "top_k": 10,
        "notes_top_k": 5,
    },
)

print(response.status_code)
result = response.json()
for p in result["products"]:
    print(f"{p['id']} | {p['product_display_name']} | {p['article_type']} | {p['base_colour']} | score={p['similarity_score']:.4f}")
    print(f"{p['style_note']}")
    print("-------------------------")