import { CheckCircle, XCircle } from "lucide-react";

const features = [
  {
    title: "AI-Backed Accuracy",
    description:
      "Articles are reviewed by AI fact-checking to ensure all claims are verified before publishing.",
  },
  {
    title: "Interest-Based Communities",
    description:
      "Join or create focused 'Rooms' for niche discussions that matter to you.",
  },
  {
    title: "Text-to-Speech & Translation",
    description:
      "Articles are accessible via audio and can be translated instantly for global readability.",
  },
  {
    title: "Open Journalism for All",
    description:
      "Anyone can write and publish — not just professional journalists — empowering authentic citizen voices.",
  },
  {
    title: "Smart Inline Dictionary",
    description:
      "Highlight any word to instantly see its definition without leaving the page.",
  },
  {
    title: "Access All Features",
    description:
      "Access expert insights, advanced tools, and full feature capabilities. Consider subscribing for the full experience.",
    cta: "View Subscription →",
  },  
];

const comparisonRows = [
    ["AI-Verified Content", "Yes", "No", "No"],
    ["Interest-Based Communities", "Yes", "Partial", "Partial"],
    ["Text-to-Speech & Translation", "Yes", "Yes", "No"],
    ["Open Journalism (Anyone Can Publish)", "Yes", "Yes", "Yes"],
    ["Inline Dictionary on Highlight", "Yes", "No", "No"],
  ];

const statusBadge = (value) => {
  if (value === "Yes") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-4 h-4" />
        Yes
      </span>
    );
  } else if (value === "No") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600">
        <XCircle className="w-4 h-4" />
        No
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
        {value}
      </span>
    );
  }
};

export default function NewsNexusFeatures() {
  return (
    <div className="w-full px-4 mt-16 font-grotesk">
      {/* Feature Grid */}
      <div className="max-w-[1000px] mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          What Makes NewsNexus Unique?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
                key={index}
                // className={`rounded-xl p-5 shadow-md ${
                // feature.cta
                //     ? "bg-black text-white"
                //     : "bg-white border border-gray-200 text-gray-800"
                // }`}
                className={`rounded-xl p-5 shadow-md ${
                    feature.title === "Open Journalism for All"
                      ? "bg-purple-100 text-black"
                      : feature.title === "Interest-Based Communities"
                      ? "bg-purple-100 text-black"
                      : feature.cta
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                  
            >

              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className={`text-sm mb-2 ${feature.cta ? "text-white" : "text-gray-600"}`}>
                    {feature.description}
              </p>                
              {feature.cta && (
                    <button
                        onClick={() => window.location.href = "/subscription"}
                        className="text-white text-sm font-semibold underline hover:text-gray-100"
                    >
                        {feature.cta}
                    </button>

                )}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-[1000px] mx-auto">
      <div className="w-full max-w-[1100px] bg-white shadow-xl rounded-xl overflow-hidden">
          <table className="w-full table-auto text-sm sm:text-base text-left">
          <thead className="bg-[#6B9CDC] text-white rounded-t-xl">
          <tr>
                <th className="px-4 py-4 text-base font-semibold">Feature</th>
                <th className="px-4 py-4 text-base font-semibold">NewsNexus</th>
                <th className="px-4 py-4 text-base font-semibold">Medium</th>
                <th className="px-4 py-4 text-base font-semibold">Quora</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([label, a, b, c], i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-4 font-medium text-gray-800">
                    {label}
                  </td>
                  <td className="px-4 py-4">{statusBadge(a)}</td>
                  <td className="px-4 py-4">{statusBadge(b)}</td>
                  <td className="px-4 py-4">{statusBadge(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
