import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import supabase from "../api/supabaseClient";

// Function to generate star rating
const StarRating = ({ rating }) => {
  return (
    <div className="flex">
      {[...Array(4)].map((_, index) => (
        <span
          key={index}
          className={index < rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const calculateAverageRating = (testimonial) => {
  const ratings = [
    testimonial.design,
    testimonial.factcheck,
    testimonial.accessible,
    testimonial.safety,
    testimonial.price,
    testimonial.news,
  ].filter((val) => val !== null);

  if (ratings.length === 0) return null;
  const avg = ratings.reduce((sum, val) => sum + val, 0) / ratings.length;
  return avg;
};

// Calculates average of non-null ratings and maps to sentiment
const getOverallSentiment = (testimonial) => {
  const avg = calculateAverageRating(testimonial);
  if (avg === null) return "I haven’t provided a rating for this experience.";

  if (avg <= 2)
    return "I had a very poor experience and faced major issues using the platform.";
  if (avg <= 4)
    return "My experience wasn’t great — there are several areas that need improvement.";
  if (avg <= 6)
    return "It was okay overall, but there are definitely things that could be improved.";
  if (avg <= 8)
    return "I had a good experience overall, though there’s still some room for improvement.";
  if (avg === 9)
    return "I’m very satisfied with the platform and had a great experience.";
  return "I had an excellent experience and would highly recommend the platform.";
};

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonial")
          .select(`*, users (username, usertype(usertype))`)
          .eq("homepage_display", true);

        if (error) throw error;
        setTestimonials(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching testimonials");
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return <div>Loading ...</div>;
  }

  const filteredTestimonials = testimonials;

  if (filteredTestimonials.length === 0)
    return (
      <div className="text-center text-gray-500">
        No testimonials available.
      </div>
    );

  return (
    <div className="w-full max-w-[900px] mx-auto font-grotesk">
      {/* <h2 className="text-3xl font-bold  mb-4">Testimonials :</h2> */}

      {/* Swiper Component */}
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden "
      >
        {filteredTestimonials.map((testimonial, index) => (
          <SwiperSlide key={index} className="p-6">
            {/* User Profile Info */}
            <div className="flex items-center border-b pb-3 ">
              {/* Profile Letter */}
              <div className="w-10 h-10 rounded-full bg-gray-500 font-grotesk text-white flex items-center justify-center text-lg font-bold">
                {testimonial.users.username.charAt(0) || "Anon."}
              </div>

              {/* Name and Rating */}
              <div className="ml-4 ">
                <p className="font-bold">{testimonial.users.username}</p>
                <p className="font-bold">{testimonial.users.usertype}</p>

                {calculateAverageRating(testimonial) !== null && (
                  <>
                    <StarRating
                      rating={Math.round(calculateAverageRating(testimonial))}
                    />
                    <p className="text-sm text-gray-500 italic">
                      {calculateAverageRating(testimonial).toFixed(1)} / 10.0
                    </p>
                  </>
                )}
              </div>
            </div>

            <p className="text-lg text-black mt-4 font-grotesk ">
              {getOverallSentiment(testimonial)}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialSlider;
