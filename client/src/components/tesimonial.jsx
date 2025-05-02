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
      {[...Array(10)].map((_, index) => (
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

// Converts numeric rating (1–10) to descriptive text
const getRatingText = (rating) => {
  if (rating >= 1 && rating <= 2) return "Very Poor";
  if (rating >= 3 && rating <= 4) return "Poor";
  if (rating >= 5 && rating <= 6) return "Average";
  if (rating >= 7 && rating <= 8) return "Good";
  if (rating === 9) return "Very Good";
  if (rating === 10) return "Excellent";
  return "Not Rated";
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
  if (avg === null) return "Not Rated";
  if (avg <= 2) return "Very Poor";
  if (avg <= 4) return "Poor";
  if (avg <= 6) return "Average";
  if (avg <= 8) return "Good";
  if (avg === 9) return "Very Good";
  return "Excellent";
};

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonial")
          .select("*, users:userid (username)")
          .eq("homepage_display", true);

        if (error) throw error;
        setTestimonials(data);
        setLoading(false);
        console.log("Raw testimonials:", data);
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

  const filteredTestimonials = testimonials.filter((t) => {
    const avg = calculateAverageRating(t);
    return avg === null || avg >= 7;
  });
  console.log("Filtered:", filteredTestimonials);

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
              <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center text-lg font-bold">
                {testimonial.users.username.charAt(0) || "Anon."}
              </div>

              {/* Name and Rating */}
              <div className="ml-4 ">
                <p className="font-bold">{testimonial.users.username}</p>
                <p className="text-sm text-gray-500 italic">
                  {getRatingText(calculateAverageRating(testimonial))}
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-lg font-semiitalic mt-4">
              Overall: {getOverallSentiment(testimonial)}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialSlider;
