import CreateFormButton from "./CreateFormButton";
import FormList from "./FormList";

export default function Forms() {
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms</h1>
            {/* <p className="text-gray-600">
              Create custom forms for your workflows and tasks.
            </p> */}
          </div>
          {/* <CreateFormButton /> */}
        </div>
      </div>
      <FormList />
    </main>
  );
}
