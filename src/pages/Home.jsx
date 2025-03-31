import "../assets/styles/style.css";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import Slide from "../sections/Slide";
import SlideTitle from "../sections/SlideTitle";
import RoundedTitle from "../sections/RoundedTitle";
import { motion_bottom_to_top, motion_left_to_right, motion_right_to_left, banner, button_hover } from "../variables/animation";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RoundedHome from "../sections/RoundedHome";
import VideoPlayerHome from "../sections/VideoPlayerHome";
import TestimonialSlider from "../sections/TestimonialSlider";
import Loader from "../components/utils/Loader";

const Home = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const items = [
    {
      icon: "🛒", // Replace with actual icon/image
      title: "Buying on Etsy",
      links: ["Shopping & Gifting", "Searching for Items", "Buying Safely"],
    },
    {
      icon: "💳",
      title: "Cart & Payment",
      links: ["Taxes & Customs Fees", "Checkout", "Payment Options"],
    },
    {
      icon: "📦",
      title: "Your Orders",
      links: ["After You Purchase", "Order Status", "Returns & Refunds"],
    },
    {
      icon: "👤",
      title: "Your Etsy Account",
      links: ["Sign In & Password", "Contacting Etsy", "Account Safety & Privacy"],
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="px-2">

      <section className="lg:my-6 my-2 slider">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <motion.div {...motion_left_to_right} className="col-span-3 border-transparent rounded-3xl duration-300 ease-in-out hover:shadow-[0px_5px_10px_rgba(0,0,0,0.5)] md:col-span-2 transition-shadow">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]} // ✅ Pass modules here
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 4000, disableOnInteraction: false }} // ✅ Enable autoplay
                pagination={{ clickable: true }}
              >
                {products.filter(product => product.section === "SliderImages").map((img, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={img.img}
                      alt={`Slide ${index}`}
                      className="rounded-3xl w-full md:max-h-[400px] min-h-[400px] object-cover slider-images"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>

            <motion.div {...motion_right_to_left} className="col-span-1 border-transparent rounded-3xl duration-300 ease-in-out hidden hover:shadow-[0px_0px_10px_rgba(0,0,0,0.5)] md:block transition-shadow">
              <div className="flex flex-col h-full justify-center items-center">
                <div
                  className="flex bg-center bg-cover h-full justify-center rounded-3xl text-center w-full items-center relative"
                  style={{
                    backgroundImage: `url(${products.filter(product => product.section === "Slider2Images")[0]?.img})`,
                  }}
                >
                  {/* Blurred Background Layer */}
                  <div className="bg-black/40 rounded-3xl absolute backdrop-blur-xs inset-0"></div>

                  {/* Clear Content */}
                  <div className="flex flex-col justify-center p-1 absolute items-center lg:p-2 md:p-4 md:space-y-3 sm:p-3 space-y-1">
                    <h2 className="text-sm text-yellow-500 lg:text-2xl md:text-xl pacifico-regular sm:text-md">
                      Where Tradition Meets Art
                    </h2>
                    <p className="text-white text-xs lg:text-sm md:text-sm">
                      From the hands of artisans to your world.
                    </p>
                    <motion.button {...button_hover} onClick={() => navigate("/Showmore")} className="bg-yellow-500 rounded-lg shadow-md text-black text-xs duration-300 font-semibold hover:bg-gray-200 hover:bg-yellow-600 hover:shadow-lg md:px-6 md:py-2 md:text-sm mt-4 px-2 py-1 transition-all">
                      Shop Now
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <RoundedHome products={products.filter(product => product.section === "Gifts")} heading="Discover gifts for every occasion 🎁" />

      <Slide heading="Today's Big Deals" products={products.filter(product => product.section === "today_big_deals")} />

      <SlideTitle heading="New Arrivals" products={products.filter(product => product.section === "New Arrivals")} />

      <section className="lg:my-7 max-w-[1360px] md:my-5 mx-auto my-3">

        <div className="grid grid-cols-2">
          <div className="col-span-1 flex flex-col justify-center items-center space-y-3">
            <p className="text-black text-center text-sm text-yellow-500 w-3/4 font-bold lg:text-2xl md:mt-0 md:text-xl md:w-1/2 mt-2 pacifico-regular">&quot;Behind the Scenes: The Making of Our Handcrafted Pieces&quot;</p>
            <p className="text-black text-center text-sm w-3/4 font-bold lg:text-2xl md:mt-0 md:text-xl md:w-3/4 mt-2">Every Handcrafted Piece Tells a Story – Discover the Love, Skill, and Passion That Goes Into Making It!</p>
          </div>

          <div className="col-span-1 flex justify-center justify-end p-2 items-center md:p-5">
            <VideoPlayerHome
              videoId="AVR45-hdm-g"

            />
          </div>
        </div>

      </section>

      <RoundedTitle heading="Most Loved" products={products.filter(product => product.section === "Most Loved")} />

      <motion.section {...banner} className="explore lg:my-7 md:my-5 my-3">
        <div className="max-w-[1360px] mx-auto">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
            <div className="col-span-1 flex flex-col justify-center justify-start p-2 md:col-span-2 md:items-center md:p-5">
              <div className="">
                <h2 className="text-xl font-semibold lading-none md:text-2xl">
                  Explore original items from local shops
                </h2>
                <motion.button {...button_hover} onClick={() => navigate("/Showmore")} className="bg-yellow-500 p-1 rounded-full text-white text-xs duration-300 ease-in-out font-semibold hover:bg-yellow-600 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.4)] lg:p-2 lg:px-3 md:text-sm mt-3 px-2 transition-shadow">
                  Get inspired
                </motion.button>
              </div>
            </div>
            <div className="col-span-1 grid grid-cols-2 md:col-span-3 sm:grid-cols-4">
              {products.filter(product => product.section === "explore").map((product) => (
                <div
                  className="col-span-1 flex flex-nowrap p-1 md:col-span-1"
                  key={product._id}
                  onClick={() => product._id && navigate(`/products/${product._id}`)}

                >
                  <div className="p-1 rounded-xl duration-300 ease-in-out hover:shadow-[0px_0px_8px_rgba(0,0,0,0.7)] md:p-2 transition-shadow">
                    <div className=" ">
                      <img
                        className="rounded-t-xl rounded-xl gift md:size-44 object-cover"
                        src={product.img}
                        alt="gift"
                      />
                    </div>
                    <div className="text-center content">
                      <h6 className="text-xs font-semibold line-clamp-2">
                        {product.title}
                      </h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <Slide heading="Indian Art Forms" products={products.filter(product => product.section === "Indian Art Forms")} />

      <SlideTitle heading="Popular gifts right now" products={products.filter(product => product.section === "Popular")} />

      <RoundedTitle heading="Shop extraordinary items at special prices" products={products.filter(product => product.section === "Special Price")} />

      <div className="lg:pb-5 lg:pt-12 md:pb-3 md:pt-5 pb-1 pt-2">
        <hr className="border border-gray-300 w-full max-w-7xl mx-auto" />
      </div>

      <motion.section {...motion_bottom_to_top} className="lg:my-7 md:my-5 my-3 readmore">

        <div className="bg-gray-200 bg-opacity-60 p-3 rounded-xl max-w-screen-lg mx-auto px-5">
          <h1 className="text-lg font-medium leading-none md:text-2xl mt-4 my-1 sm:text-xl">
            The Luxurious Way to Decorate Your Home
          </h1>
          <p className="text-justify text-sm leading-tight md:leading-relaxed">
            Interior home decor is one of the most important yet hassling parts of getting a new home. Even if you are living in your house for a long time, it is essential to transform your home interiors every now and then. It gives a fresh perspective to you while you are relaxing or working at home and also gives your home a new appearance. Changing things up is always better, especially when you have guests over. Once you have decided to decorate your home, you will find a large number of ideas and tips online to beautify your home. But this is when you must carefully choose the vibe or look you want to create. Ultimately, it is you who will be staying there all day, and you should love your home, interiors and all!
          </p>
          <p className="leading-tight md:leading-relaxed">
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}

                transition={{ duration: 1, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <h2 className="text-lg font-medium leading-none md:text-2xl mt-4 my-1 sm:text-xl">
                  Make your home stand out with decorative Lights
                </h2>
                <p className="text-justify text-sm">
                  Perfect lighting can make a huge difference in bringing out the warmth of your home. Some rooms need bright light for every nook and corner while others need a soft balminess of light making you feel relaxed. From spreading the light to creating a mood for a certain moment, you can do it all with decorative lamp lights. Instead of putting up bulbs and tube lights in every corner of the house, use your creative imagination to choose the right light for every room of the house. Here are some ways that can bring out the beauty of your home with handcrafted wall and table lamps online.
                </p>

                <h2 className="text-lg font-medium leading-none md:text-2xl mt-4 my-1 sm:text-xl">
                  Lighting solution for every corner of the house
                </h2>
                <p className="text-justify text-sm">
                  Every room has a different need for lighting and if chosen carefully it can make it the best room in the house. For your bedroom, go for decorative candles that are handmade with essential oils. It will feel the room with a gentle warm glow along with sensuous scents. You can also go for aroma diffusers online at ExclusiveLane for lighting up corners creating a relaxing cosy mood.
                </p>
                <p className="text-justify text-sm">
                  At the entrance and for your puja room, wall hanging lamps are simply perfect as you can place little tealights on them for a beautiful appearance. It can make your home ready for every festival. For your living room or balcony, a chandelier or hanging lamp can be a perfect centrepiece for the entire room. ExclusiveLane has a magnificent collection of handmade lamps, hangings, tea-lights holders, candle stands, and various other decorative lamp lighting pieces.
                </p>
                <h2 className="text-lg font-medium leading-none md:text-2xl mt-4 my-1 sm:text-xl">
                  Shop online for exclusive kitchen and dining accessories for your modern home
                </h2>
                <p className="text-justify text-sm">
                  Home decoration can be fun and exciting while mixing and matching colours, art and patterns to make a space that defines you. For kitchen accessories and dining accessories, selectively picking up pieces makes a lot of difference in the entire kitchen setting.
                </p>
                <h2 className="text-base font-medium leading-none md:text-xl mt-4 my-1 sm:text-lg">
                  1. Kitchenware online{" "}
                </h2>
                <p className="text-justify text-sm">
                  This exotic and classic kitchenware collection is unique and
                  bound to leave you spellbound. Beautiful, durable and
                  functional - that is what makes the range of kitchen storage
                  containers from ExclusiveLane so popular. With a vast choice
                  of designs and styles in spice boxes, Jars & Containers, and
                  bottles, you are bound to find something to suit your taste.
                </p>
                <h2 className="text-base font-medium leading-none md:text-xl mt-4 my-1 sm:text-lg">
                  2. Tableware online
                </h2>
                <p className="text-justify text-sm">
                  If you love to add a traditional yet trendy touch to your
                  dining table, then our Tableware collection is designed just
                  for you. At ExclusiveLane, we offer a range of tableware and
                  dining accessories sourced from various regions of India. So,
                  discover attractive designs in cutlery holders, napkin
                  holders, coasters and salt & pepper shakers to add some
                  aesthetics to your table.
                </p>
                <h2 className="text-base font-medium leading-none md:text-xl mt-4 my-1 sm:text-lg">
                  3. Serveware online
                </h2>
                <p className="text-justify text-sm">
                  Speak volumes about your taste in serveware with the latest
                  handmade ceramic and wooden items from ExclusiveLane. Explore
                  a wide range of serveware to enhance your dining experiences,
                  such as plates & platters, dinner sets, trays, bowls, kadhai &
                  handi or chapati boxes. Grab your favourites now!
                </p>
                <h2 className="text-base font-medium leading-none md:text-xl mt-4 my-1 sm:text-lg">
                  4. Furniture online{" "}
                </h2>
                <p className="text-justify text-sm">
                  If you hare tired of the same old furniture in your living
                  room and home, discover the ExclusiveLane furniture collection
                  - intricately designed to add elegance and functionality to
                  your interior decor. Explore our wide range of wooden
                  furniture in storage, console sets, bookshelf, tables, and
                  more categories available for you.
                </p>
                <h2 className="text-base font-medium leading-none md:text-xl mt-4 my-1 sm:text-lg">
                  5. Garden décor online
                </h2>
                <p className="text-justify text-sm">
                  you a unique collection of garden decor accessories, a must
                  explore collection to add warm and happy vibes to your garden.
                  So, make your garden look more appealing and magnificent with
                  beautifully handcrafted pots and planters, hangings and garden
                  decor with us.
                </p>

              </motion.div>
            )}
          </p>

          <button
            onClick={
              expanded ? () => setExpanded(false) : () => setExpanded(true)
            }
            className="border-none text-blue-800 text-sm font-medium mt-3 outline-none"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        </div>
      </motion.section>

      <TestimonialSlider />

      <motion.div {...motion_bottom_to_top} className="text-center lg:my-5 md:my-3 my-2 pb-10">

        <h2 className="text-2xl font-semibold mb-6">Shop on Hands&Craft</h2>
        <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col text-left items-start">
              <span className="text-4xl mb-3">{item.icon}</span>
              <h3 className="text-lg font-bold">{item.title}</h3>
              <ul className="text-gray-600 mt-2">
                {item.links.map((link, i) => (
                  <li key={i} className="text-sm mb-1">{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </motion.div>

    </main>
  );
};

export default Home;