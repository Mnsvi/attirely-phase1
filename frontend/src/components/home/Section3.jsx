import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Section3.css";

import Corset from "../../assets/images/DenimCorset.png";
import womenModel from "../../assets/images/womenModel.png";
import skirt from "../../assets/images/skirt.png";
import purse from "../../assets/images/purse.png";
import kneeBoot from "../../assets/images/kneeBoot.png";
import sunglass from "../../assets/images/sunglass.png";
import redCap from "../../assets/images/redCap.png";

const LOOKBOOK_ITEMS = [
  {
    id: "corset",
    name: "Structured Denim Corset",
    image: Corset,
    category: "Corset",
    searchQuery: "denim corset",
    description:
      "A structured denim corset with a vintage-inspired silhouette, featuring a fitted bust, defined waist, and pointed hem. The visible seam detailing and muted washed-denim finish give it a bold yet refined Y2K aesthetic. Pair it with high-waisted jeans, a flowy maxi skirt, or tailored trousers for a stylish contrast.",
    style: "Y2K • Vintage • Edgy • Feminine",
    fit: "Structured, body-contouring",
    pairing: "High-waisted bottoms, oversized shirts, leather accessories, minimal jewelry",
  },
  {
    id: "skirt",
    name: "Pleated Minimalist Skirt",
    image: skirt,
    category: "Skirt",
    searchQuery: "pleated skirt",
    description:
      "Precision-tailored pleated skirt designed with fluid drape and a clean architectural waistline. Engineered to transition effortlessly from daytime gallery visits to evening dinners.",
    style: "Contemporary • Minimalist • Tailored",
    fit: "High-waist, fluid A-line",
    pairing: "Tailored blazers, ribbed knitwear, structured leather boots",
  },
  {
    id: "purse",
    name: "Architectural Leather Bag",
    image: purse,
    category: "Bag",
    searchQuery: "leather handbag",
    description:
      "Crafted from full-grain calf leather with structured geometry and polished warm hardware. Features a versatile shoulder strap and ample compartmentalized space.",
    style: "Quiet Luxury • Architectural • Everyday Chic",
    fit: "Structured medium tote",
    pairing: "Trench coats, silk slip dresses, neutral monochrome tailoring",
  },
  {
    id: "kneeBoot",
    name: "Pointed Knee-High Boot",
    image: kneeBoot,
    category: "Boots",
    searchQuery: "knee high boots",
    description:
      "Sleek pointed-toe knee-high boots sculpted from supple Italian leather. Features a sculpted heel that offers both elevated posture and all-day walking comfort.",
    style: "Sleek • High Fashion • Statement",
    fit: "Shaft height 42cm, sculpted heel 75mm",
    pairing: "Short tailored coats, pleated skirts, denim corsets",
  },
  {
    id: "sunglass",
    name: "Geometric Acetate Eyewear",
    image: sunglass,
    category: "Accessories",
    searchQuery: "fashion sunglasses",
    description:
      "Bold angular frames sculpted in hand-polished acetate with 100% UV protective polarized lenses. An instant editorial accent for any ensemble.",
    style: "Editorial • Modernist • Statement",
    fit: "Universal bridge fit, wide geometric frame",
    pairing: "Monochrome outerwear, structured knitwear, leather handbags",
  },
  {
    id: "redCap",
    name: "Embroidered Heritage Cap",
    image: redCap,
    category: "Accessories",
    searchQuery: "red cap",
    description:
      "Low-profile washed cotton twill cap with subtle signature tone-on-tone embroidery and antique brass buckle closure.",
    style: "Streetwear Luxe • Casual • Heritage",
    fit: "Adjustable 6-panel silhouette",
    pairing: "Oversized blazers, relaxed tailoring, casual weekend attire",
  },
];

function Section3() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(LOOKBOOK_ITEMS[0]);

  return (
    <section className="gallery" aria-label="Curated Lookbook Gallery">
      <div className="gallery__header">
        <span className="gallery__kicker">CURATED STYLING NOTES</span>
        <h2 className="gallery__title">The Editorial Lookbook</h2>
        <p className="gallery__subtitle">
          Select any statement piece to inspect styling architecture, pairing advice, and direct catalog matches.
        </p>
      </div>

      <div className="gallery__body">
        {/* Gallery Grid */}
        <div className="gallery__grid">
          {LOOKBOOK_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`gallery__thumb-wrapper ${selectedItem.id === item.id ? "gallery__thumb-wrapper--active" : ""}`}
              onClick={() => setSelectedItem(item)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${item.name}`}
            >
              <img
                className="gallery__thumb"
                src={item.image}
                alt={item.name}
              />
              <span className="gallery__thumb-label">{item.name}</span>
            </div>
          ))}

          {/* Featured Central Model Card */}
          <div className="gallery__model-card">
            <img className="gallery__model-img" src={womenModel} alt="Editorial Lookbook Model" />
            <div className="gallery__model-overlay">
              <span>CAPSULE LOOK 01</span>
            </div>
          </div>
        </div>

        {/* Dynamic Highlight Panel */}
        <aside className="gallery__panel">
          <div className="gallery__panel-badge">
            <span>SELECTED PIECE</span>
            <span className="gallery__panel-category">{selectedItem.category}</span>
          </div>

          <div className="gallery__panel-image">
            <img src={selectedItem.image} alt={selectedItem.name} />
          </div>

          <div className="gallery__note">
            <h3 className="gallery__note-title">{selectedItem.name}</h3>

            <p className="gallery__note-desc">
              {selectedItem.description}
            </p>

            <div className="gallery__specs">
              <div className="spec-row">
                <span className="spec-label">Style:</span>
                <span className="spec-val">{selectedItem.style}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Fit:</span>
                <span className="spec-val">{selectedItem.fit}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Best Paired With:</span>
                <span className="spec-val">{selectedItem.pairing}</span>
              </div>
            </div>

            <button
              className="gallery__explore-btn"
              onClick={() => navigate(`/products?query=${encodeURIComponent(selectedItem.searchQuery)}`)}
            >
              <span>EXPLORE MATCHING CATALOG PIECES</span>
              <span>→</span>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Section3;
