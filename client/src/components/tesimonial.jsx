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

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonial")
          .select("*, users(username)")
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

  if (loading){
    return <div>Loading ...</div>;
  }

  return (
    <div className="w-full max-w-[900px] mx-auto font-grotesk">
      {/* <h2 className="text-3xl font-bold  mb-4">Testimonials :</h2> */}

      {/* Swiper Component */}
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index} className="p-6">
            {/* User Profile Info */}
            <div className="flex items-center border-b pb-3 ">
              {/* Profile Letter */}
              <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center text-lg font-bold">
                {testimonial.users.username.charAt(0)}
              </div>

              {/* Name and Rating */}
              <div className="ml-4 ">
                <p className="font-bold">{testimonial.users.username}</p>
                <StarRating rating={testimonial.rating} />
              </div>
            </div>

            <p className="text-gray-700 text-lg font-semiitalic mt-4">
              {testimonial.share_experience}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialSlider;
