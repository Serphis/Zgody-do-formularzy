import { json, type V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Agreements" },
    { name: "description", content: "User agreements" },
  ];
};

{/* <p>
<Link to="create">Create</Link>
</p> */}

export default function Index() {
  return (
    <main>
      <div className=".w-0">
        <div>
          <p>
            <Link to="home">Home</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
