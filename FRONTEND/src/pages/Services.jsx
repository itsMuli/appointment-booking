import Title from "../components/Title";

const serviceCards = [
  { name: "Manicure", image: "art1.jpg" },
  { name: "Pedicure", image: "art2.jpg" },
  { name: "Nail Extensions", image: "art3.jpg" },
  { name: "Nail Art", image: "art1.jpg" },
];

const Services = () => {
  return (
    <div className="my-8 md:my-10" id="services-section">
      <div className="text-left md:text-center py-4 md:py-8 text-2xl px-1 md:px-0">
        <div className="md:hidden">
          <h2 className="text-lg font-semibold tracking-wide text-gray-700 uppercase">
            Our Services
          </h2>
        </div>
        <div className="hidden md:block">
          <Title text1={"OUR"} text2={"SERVICES"} />
          <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-700">
            Whether it is simple Nail polish, acrylics or a complete nail care,
            we serve you with all your nail needs with the best products coupled
            with dedicated services on board.
          </p>
        </div>
      </div>

      {/* Mobile: horizontal scroll cards */}
      <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {serviceCards.map((card) => (
          <div
            key={card.name}
            className="flex-shrink-0 w-36 snap-start"
          >
            <div className="overflow-hidden rounded-2xl">
              <img
                className="h-36 w-full object-cover"
                src={card.image}
                alt={card.name}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-800 text-center">
              {card.name}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-5 gap-y-6">
        {serviceCards.concat(serviceCards.slice(0, 2)).map((card, i) => (
          <div key={`${card.name}-${i}`} className="overflow-hidden">
            <img
              className="rounded-lg h-48 w-full object-cover transition ease-in-out duration-300 transform hover:scale-110"
              src={card.image}
              alt={card.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
