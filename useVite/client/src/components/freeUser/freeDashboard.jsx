import React from "react";
import FreeManageMyArticles from "./freeManageArticle.jsx";
import FreeSidebar from "./freeSideBar.jsx";

function FreeDashboard() {
  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <aside className="w-1/4 min-h-full bg-blue-200 max-md:w-full">
            <FreeSidebar />
          </aside>

          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full px-6 md:px-10 pt-8 pb-12 w-full text-2xl font-medium text-black max-md:px-4 max-md:pb-24">
              <FreeManageMyArticles />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default FreeDashboard;
