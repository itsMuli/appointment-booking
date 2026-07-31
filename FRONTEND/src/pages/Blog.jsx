import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const works = [
  {
    id: 1,
    title: "Classic Gel Manicure",
    category: "Manicure",
    image: "art1.jpg",
    note: "Clean finish with lasting shine.",
  },
  {
    id: 2,
    title: "Spa Pedicure Finish",
    category: "Pedicure",
    image: "art2.jpg",
    note: "Soft, polished toes with a soft lavender tone.",
  },
  {
    id: 3,
    title: "Extension Set",
    category: "Extensions",
    image: "art3.jpg",
    note: "Full set shaped and sealed for everyday wear.",
  },
  {
    id: 4,
    title: "Dark Glam Nails",
    category: "Nail Art",
    image: "art1.jpg",
    note: "Bold color with a glossy top coat.",
  },
  {
    id: 5,
    title: "Soft Pastel Pedi",
    category: "Pedicure",
    image: "art2.jpg",
    note: "Fresh pedicure with a delicate pastel look.",
  },
  {
    id: 6,
    title: "Salon Detail Work",
    category: "Nail Art",
    image: "art3.jpg",
    note: "Precision application by our studio artist.",
  },
];

const categories = ["All", "Manicure", "Pedicure", "Extensions", "Nail Art"];

const Blog = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const visible = useMemo(() => {
    if (filter === "All") return works;
    return works.filter((w) => w.category === filter);
  }, [filter]);

  return (
    <div id="blog-section" className="py-4 md:py-8 px-1 md:px-0 max-w-5xl mx-auto">
      <div className="mb-5 md:mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-primary font-semibold mb-2">
          Our work
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
          Blog & Gallery
        </h1>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
          A look at manicures, pedicures, extensions, and nail art already done
          at Infinity Nail Salon.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === cat
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {visible.map((work) => (
          <article
            key={work.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={work.image}
                alt={work.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 md:p-4">
              <p className="text-[10px] uppercase tracking-wide text-primary font-semibold mb-1">
                {work.category}
              </p>
              <h2 className="text-sm md:text-base font-semibold text-gray-800 leading-snug">
                {work.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
                {work.note}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 md:mt-10 text-center">
        <p className="text-sm text-gray-500 mb-3">Like what you see?</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-xl text-sm font-medium w-[90%] md:w-auto"
        >
          Book an appointment
        </button>
      </div>
    </div>
  );
};

export default Blog;
