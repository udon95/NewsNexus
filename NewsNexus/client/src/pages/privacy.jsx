import React, { useState, useEffect } from "react";
import "../index.css";
import Navbar from "../components/navBar.jsx";

function PrivacyPolicy() {
  // const [privacy, setPrivacy] = useState("");

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col items-start w-full px-4 sm:px-8 py-10 mx-auto max-w-5xl">
        {/* Title */}
        <h1 className="font-grotesk text-4xl sm:text-5xl font-bold text-black text-left">
          NewsNexus Privacy Policy:
        </h1>

        {/* Privacy Policy Content */}
        <div className="mt-6 text-lg sm:text-xl font-medium text-black leading-relaxed w-full">
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
              vel tortor varius, gravida elit nec, consequat felis.
              <ol className="list-lower-alpha pl-6 space-y-2">
                <li>
                  Nullam facilisis magna vel sapien suscipit, eu blandit turpis
                  faucibus.
                </li>
                <li>
                  Sed interdum nunc at risus pretium, non tristique odio
                  feugiat.
                </li>
              </ol>
            </li>

            <li>
              Duis euismod sapien nec metus fermentum, vel vehicula purus
              dictum. Cras dignissim justo at orci dapibus, ut aliquet risus
              posuere.
              <ol className="list-lower-alpha pl-6 space-y-2">
                <li>Fusce sed justo ut orci accumsan convallis.</li>
                <li>
                  Donec venenatis augue id massa suscipit, eget tempus turpis
                  fermentum.
                </li>
                <li>Aliquam sit amet felis ac quam vulputate gravida.</li>
              </ol>
            </li>

            <li>
              Aenean vulputate risus vel arcu fermentum, eget rhoncus odio
              scelerisque. Vestibulum dapibus urna sed nisl scelerisque, eu
              tincidunt ex lacinia.
              <ol className="list-lower-alpha pl-6 space-y-2">
                <li>Integer eu mi et nunc gravida efficitur.</li>
                <li>
                  Praesent dictum justo non orci venenatis, sed fringilla justo
                  tempor.
                </li>
              </ol>
            </li>

            <li>
              Curabitur ornare justo nec sapien ultricies, ac auctor felis
              consequat. Sed dignissim felis ut ex rhoncus venenatis.
              <ol className="list-lower-alpha pl-6 space-y-2">
                <li>
                  Morbi tincidunt orci ut lacus sodales, vel scelerisque felis
                  cursus.
                </li>
                <li>
                  Suspendisse tincidunt velit at sapien imperdiet vehicula.
                </li>
              </ol>
            </li>

            <li>
              Mauris auctor dui eget diam euismod, in ultricies neque fermentum.
              Nulla ac quam et massa dapibus faucibus.
              <ol className="list-lower-alpha pl-6 space-y-2">
                <li>Phasellus ut mauris nec dui molestie fringilla.</li>
                <li>
                  Vivamus suscipit velit eu lectus feugiat, nec consectetur elit
                  fermentum.
                </li>
                <li>
                  Sed malesuada lacus non nunc fermentum, nec consectetur tortor
                  dictum.
                </li>
              </ol>
            </li>

            <li>
              Pellentesque facilisis erat eu purus suscipit, id aliquet nunc
              tincidunt. Nulla congue lorem nec libero gravida cursus.
              <ol className="list-lower-alpha pl-6 space-y-2">
                <li>
                  Proin interdum justo ut arcu tempus, non pellentesque dolor
                  viverra.
                </li>
                <li>
                  Ut vehicula sem et turpis ullamcorper, ut convallis justo
                  hendrerit.
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicy;
