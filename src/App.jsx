/* global Word */
function App() {
  const sayHello = async () => {
    await Word.run(async (context) => {
      const body = context.document.body;
      body.insertParagraph("Hello World from Vite + React + Tailwind CSS!", Word.InsertLocation.start);
      await context.sync();
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-extrabold text-indigo-600 mb-6 underline decoration-indigo-300">
        My World Add-in
      </h1>
      <button 
        onClick={sayHello}
        className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
      >
        Click Me!
      </button>
    </div>
  );
}

export default App
