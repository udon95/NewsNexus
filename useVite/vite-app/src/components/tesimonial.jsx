import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

// Sample testimonials data
const testimonials = [
  {
    name: "John Doe",
    review: "This platform has completely changed the way I consume news!",
    rating: 5,
  },
  {
    name: "Jane Smith",
    review: "I love how user-friendly and informative the platform is.",
    rating: 4,
  },
  {
    name: "Alice Johnson",
    review:
      "A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!A great place to stay updated with reliable sources!",
    rating: 5,
  },
];

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
  return (
    <div className="w-full max-w-[900px] mx-auto">
      <h2 className="text-3xl font-bold font-grotesk mb-4">Testimonials :</h2>

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
            {/* Testimonial Text */}

            {/* User Profile Info */}
            <div className="flex items-center border-b pb-3">
              {/* Profile Letter */}
              <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center text-lg font-bold">
                {testimonial.name.charAt(0)}
              </div>

              {/* Name and Rating */}
              <div className="ml-4 ">
                <p className="font-bold">{testimonial.name}</p>
                <StarRating rating={testimonial.rating} />
              </div>
            </div>

            <p className="text-gray-700 text-lg italic mt-4">
              "{testimonial.review}"
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialSlider;
