import Title from "../components/Title";

const Services = () => {
  return (
    <div className="my-10" id="services-section">
      <div className="text-center py-8 text-2xl">
        <Title text1={"OUR"} text2={"SERVICES"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-700">
          Whether it is simple Nail polish, acrylics or a complete nail care,
          we serve you with all your nail needs with the best products coupled
          with dedicated services on board.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-5 gap-y-6">
        <div className="overflow-hidden">
          <img className="rounded-lg h-48 w-full object-cover transition ease-in-out duration-300 transform hover:scale-110" src="art1.jpg" alt="" />
        </div>
        <div className="overflow-hidden">
          <img className="rounded-lg h-48 w-full object-cover transition ease-in-out duration-300 transform hover:scale-110" src="art2.jpg" alt="" />
        </div>
        <div className="overflow-hidden">
          <img className="rounded-lg h-48 w-full object-cover transition ease-in-out duration-300 transform hover:scale-110" src="art3.jpg" alt="" />
        </div>
        <div className="overflow-hidden">
          <img className="rounded-lg h-48 w-full object-cover transition ease-in-out duration-300 transform hover:scale-110" src="art3.jpg" alt="" />
        </div>
        <div className="overflow-hidden">
          <img className="rounded-lg h-48 w-full object-cover transition ease-in-out duration-300 transform hover:scale-110" src="art1.jpg" alt="" />
        </div>
        <div className="overflow-hidden">
          <img className="rounded-lg h-48 w-full object-cover transition ease-in-out duration-300 transform hover:scale-110" src="art2.jpg" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Services;
